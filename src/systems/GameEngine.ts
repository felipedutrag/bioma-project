import * as THREE from 'three';
import { Player } from '../entities/Player';
import { Predator } from '../entities/Predator';
import { FoodSystem } from '../entities/FoodSystem';
import { Mate } from '../entities/Mate';
import { SavannaWorld } from '../world/SavannaWorld';
import { GeneStorage } from '../storage/GeneStorage';
import { SoundSystem } from '../audio/SoundSystem';
import type { GameState, PlayerStats, PredatorState } from '../types/game';

export interface RadarEntity {
  type: 'PREDATOR' | 'FOOD' | 'WATER' | 'MATE';
  x: number;
  z: number;
  distance: number;
  state?: PredatorState;
}

export class GameEngine {
  private container: HTMLElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private clock: THREE.Clock = new THREE.Clock();

  public world!: SavannaWorld;
  public player!: Player;
  public predators: Predator[] = [];
  public foodSystem!: FoodSystem;
  public mate!: Mate;

  private animationFrameId: number | null = null;
  public gameState: GameState = 'PLAYING';

  // Callbacks to React UI
  public onStatsUpdate?: (stats: PlayerStats, radar: RadarEntity[]) => void;
  public onGameOver?: (reason: string, lifespan: number) => void;
  public onMatingReady?: () => void;

  private cameraOffset: THREE.Vector3 = new THREE.Vector3(0, 14, 16);
  private cameraTarget: THREE.Vector3 = new THREE.Vector3();

  constructor(container: HTMLElement) {
    this.container = container;
    this.initThree();
    this.startNewGame();
    this.setupResize();
    this.animate();
  }

  private initThree() {
    this.scene = new THREE.Scene();

    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 300);
    this.camera.position.set(0, 20, 25);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    this.container.appendChild(this.renderer.domElement);
  }

  public startNewGame() {
    // Clear old objects if any
    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }
    this.predators = [];

    const saveState = GeneStorage.loadState();

    // 1. Create Savanna World
    this.world = new SavannaWorld(this.scene);

    // 2. Spawn Player with inherited genetic traits
    this.player = new Player(this.world, saveState.currentGenes, saveState.currentGeneration);

    // 3. Spawn Predators patrolling distinct territories
    const predatorSpawns = [
      new THREE.Vector3(18, 0, 18),
      new THREE.Vector3(-25, 0, 25),
      new THREE.Vector3(30, 0, -25),
    ];

    predatorSpawns.forEach((spawnPos) => {
      const pred = new Predator(this.world, this.player, spawnPos);
      this.predators.push(pred);
    });

    // 4. Spawn Food System
    this.foodSystem = new FoodSystem(this.scene, this.world);

    // 5. Spawn Reproductive Mate under the Great Oasis Acacia Tree
    this.mate = new Mate(this.world, new THREE.Vector3(22, 0, -18));

    this.gameState = 'PLAYING';
    this.clock.start();
  }

  private setupResize() {
    window.addEventListener('resize', () => {
      if (!this.container || !this.renderer || !this.camera) return;
      const width = this.container.clientWidth || window.innerWidth;
      const height = this.container.clientHeight || window.innerHeight;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    });
  }

  private animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.1);

    if (this.gameState === 'PLAYING') {
      this.world.update(delta);
      this.player.update(delta);

      // Update Predators
      this.predators.forEach((pred) => pred.update(delta));

      // Update Food Items
      this.foodSystem.update(delta, this.player);

      // Update Mate & check reproduction
      this.mate.update(delta, this.player, () => {
        if (this.gameState === 'PLAYING') {
          this.gameState = 'MATING_SELECT';
          SoundSystem.playMatingFanfare();
          SoundSystem.playHeartbeat(false);
          if (this.onMatingReady) {
            this.onMatingReady();
          }
        }
      });

      // Check Player Death
      if (this.player.isDead) {
        this.gameState = 'DEAD';
        if (this.onGameOver) {
          this.onGameOver(this.player.deathReason, this.player.lifespanSeconds);
        }
      }

      // Update Camera Tracking
      const playerPos = this.player.mesh.position;
      const targetCamPos = new THREE.Vector3(
        playerPos.x + this.cameraOffset.x,
        playerPos.y + this.cameraOffset.y,
        playerPos.z + this.cameraOffset.z
      );

      this.camera.position.lerp(targetCamPos, 0.08);
      this.cameraTarget.lerp(new THREE.Vector3(playerPos.x, playerPos.y + 0.8, playerPos.z), 0.1);
      this.camera.lookAt(this.cameraTarget);

      // Compute Mini-Radar Entities (within scent/vision range)
      const maxRadarRange = this.player.traits.scentRange;
      const radarList: RadarEntity[] = [];

      // Predators on radar
      this.predators.forEach((p) => {
        const d = playerPos.distanceTo(p.mesh.position);
        if (d <= maxRadarRange) {
          radarList.push({
            type: 'PREDATOR',
            x: p.mesh.position.x - playerPos.x,
            z: p.mesh.position.z - playerPos.z,
            distance: d,
            state: p.state,
          });
        }
      });

      // Active food on radar
      this.foodSystem.items.forEach((f) => {
        if (f.active) {
          const d = Math.hypot(playerPos.x - f.position[0], playerPos.z - f.position[2]);
          if (d <= maxRadarRange) {
            radarList.push({
              type: 'FOOD',
              x: f.position[0] - playerPos.x,
              z: f.position[2] - playerPos.z,
              distance: d,
            });
          }
        }
      });

      // Water holes on radar
      this.world.waterZones.forEach((w) => {
        const d = Math.hypot(playerPos.x - w.position.x, playerPos.z - w.position.z);
        if (d <= maxRadarRange + 10) {
          radarList.push({
            type: 'WATER',
            x: w.position.x - playerPos.x,
            z: w.position.z - playerPos.z,
            distance: d,
          });
        }
      });

      // Mate on radar if ready
      if (this.player.stats.canReproduce) {
        const d = playerPos.distanceTo(this.mate.mesh.position);
        radarList.push({
          type: 'MATE',
          x: this.mate.mesh.position.x - playerPos.x,
          z: this.mate.mesh.position.z - playerPos.z,
          distance: d,
        });
      }

      // Send telemetry to UI
      if (this.onStatsUpdate) {
        this.onStatsUpdate({ ...this.player.stats }, radarList);
      }
    }

    this.renderer.render(this.scene, this.camera);
  };

  public destroy() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.renderer && this.renderer.domElement) {
      this.container.removeChild(this.renderer.domElement);
      this.renderer.dispose();
    }
  }
}
