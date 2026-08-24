import * as THREE from 'three';
import type { PredatorState } from '../types/game';
import { Player } from './Player';
import { SavannaWorld } from '../world/SavannaWorld';
import { SoundSystem } from '../audio/SoundSystem';

export class Predator {
  public mesh: THREE.Group;
  public state: PredatorState = 'WANDER';
  private world: SavannaWorld;
  private player: Player;

  // Visual parts
  private bodyMesh!: THREE.Mesh;
  private headMesh!: THREE.Group;
  private legFL!: THREE.Mesh;
  private legFR!: THREE.Mesh;
  private legBL!: THREE.Mesh;
  private legBR!: THREE.Mesh;
  private tailMesh!: THREE.Mesh;
  private fovConeMesh!: THREE.Mesh;
  private fovMaterial!: THREE.MeshBasicMaterial;

  // AI & Sensors
  public fovRange: number = 18.0;
  public fovAngleRad: number = (65 * Math.PI) / 180;
  public hearingRange: number = 10.0;
  
  private wanderTimer: number = 0;
  private wanderTarget: THREE.Vector3 = new THREE.Vector3();
  private investigateTarget: THREE.Vector3 = new THREE.Vector3();
  private chaseLostTimer: number = 0;
  private animTimer: number = 0;
  private targetRotation: number = 0;

  // Speed
  private wanderSpeed: number = 3.2;
  private chaseSpeed: number = 7.8;
  private alertAudioCooldown: number = 0;

  constructor(world: SavannaWorld, player: Player, startPos: THREE.Vector3) {
    this.world = world;
    this.player = player;
    this.mesh = new THREE.Group();

    this.buildModel();
    this.createFOVCone();

    this.mesh.position.copy(startPos);
    this.mesh.position.y = this.world.getTerrainHeight(startPos.x, startPos.z) + 0.6;
    this.world.scene.add(this.mesh);

    this.pickNewWanderTarget();
  }

  private buildModel() {
    const leopardMat = new THREE.MeshStandardMaterial({
      color: 0xd9822b, // Amber/Tawny leopard coat
      flatShading: true,
      roughness: 0.75,
    });

    const spotMat = new THREE.MeshStandardMaterial({
      color: 0x3d2010, // Dark rosette spots & claws
      flatShading: true,
      roughness: 0.85,
    });

    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffee22 });

    // Muscular predatory body
    const bodyGeo = new THREE.BoxGeometry(1.0, 0.9, 2.0);
    this.bodyMesh = new THREE.Mesh(bodyGeo, leopardMat);
    this.bodyMesh.position.y = 0.8;
    this.bodyMesh.castShadow = true;
    this.mesh.add(this.bodyMesh);

    // Decorative spots on back
    for (let i = 0; i < 4; i++) {
      const spot = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.25), spotMat);
      spot.position.set((i % 2 === 0 ? 0.3 : -0.3), 1.26, (i - 1.5) * 0.4);
      this.mesh.add(spot);
    }

    // Predatory Head
    this.headMesh = new THREE.Group();
    this.headMesh.position.set(0, 1.25, 1.1);

    const headGeo = new THREE.BoxGeometry(0.75, 0.65, 0.75);
    const head = new THREE.Mesh(headGeo, leopardMat);
    head.castShadow = true;
    this.headMesh.add(head);

    // Snout
    const muzzle = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.35, 0.45), spotMat);
    muzzle.position.set(0, -0.12, 0.45);
    this.headMesh.add(muzzle);

    // Ears
    const earGeo = new THREE.ConeGeometry(0.16, 0.28, 4);
    const earL = new THREE.Mesh(earGeo, spotMat);
    earL.position.set(0.28, 0.42, -0.05);
    earL.rotation.z = -0.3;
    this.headMesh.add(earL);

    const earR = new THREE.Mesh(earGeo, spotMat);
    earR.position.set(-0.28, 0.42, -0.05);
    earR.rotation.z = 0.3;
    this.headMesh.add(earR);

    // Glowing predator eyes
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), eyeMat);
    eyeL.position.set(0.24, 0.1, 0.36);
    this.headMesh.add(eyeL);

    const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), eyeMat);
    eyeR.position.set(-0.24, 0.1, 0.36);
    this.headMesh.add(eyeR);

    this.mesh.add(this.headMesh);

    // Stalking Legs
    const legGeo = new THREE.BoxGeometry(0.26, 0.75, 0.26);
    this.legFL = new THREE.Mesh(legGeo, leopardMat);
    this.legFL.position.set(0.38, 0.38, 0.7);
    this.legFL.castShadow = true;
    this.mesh.add(this.legFL);

    this.legFR = new THREE.Mesh(legGeo, leopardMat);
    this.legFR.position.set(-0.38, 0.38, 0.7);
    this.legFR.castShadow = true;
    this.mesh.add(this.legFR);

    this.legBL = new THREE.Mesh(legGeo, leopardMat);
    this.legBL.position.set(0.38, 0.38, -0.7);
    this.legBL.castShadow = true;
    this.mesh.add(this.legBL);

    this.legBR = new THREE.Mesh(legGeo, leopardMat);
    this.legBR.position.set(-0.38, 0.38, -0.7);
    this.legBR.castShadow = true;
    this.mesh.add(this.legBR);

    // Tail
    const tailGeo = new THREE.CylinderGeometry(0.08, 0.12, 1.4, 5);
    this.tailMesh = new THREE.Mesh(tailGeo, spotMat);
    this.tailMesh.position.set(0, 0.95, -1.2);
    this.tailMesh.rotation.x = -Math.PI / 3;
    this.mesh.add(this.tailMesh);
  }

  private createFOVCone() {
    // 3D Visual Vision Cone Fan projected in front of predator
    const segments = 18;
    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    const colors: number[] = [];

    const halfAngle = this.fovAngleRad / 2;
    const r = this.fovRange;

    // Fan triangles on ground plane with slight elevation
    for (let i = 0; i < segments; i++) {
      const a1 = -halfAngle + (i / segments) * this.fovAngleRad;
      const a2 = -halfAngle + ((i + 1) / segments) * this.fovAngleRad;

      // Origin
      positions.push(0, 0.1, 0.8);
      // P1
      positions.push(Math.sin(a1) * r, 0.1, Math.cos(a1) * r);
      // P2
      positions.push(Math.sin(a2) * r, 0.1, Math.cos(a2) * r);

      for (let k = 0; k < 3; k++) {
        colors.push(1, 0.8, 0.2);
      }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    this.fovMaterial = new THREE.MeshBasicMaterial({
      color: 0xffcc33,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
    });

    this.fovConeMesh = new THREE.Mesh(geometry, this.fovMaterial);
    this.mesh.add(this.fovConeMesh);
  }

  private pickNewWanderTarget() {
    const angle = Math.random() * Math.PI * 2;
    const dist = 12 + Math.random() * 25;
    this.wanderTarget.set(
      this.mesh.position.x + Math.sin(angle) * dist,
      0,
      this.mesh.position.z + Math.cos(angle) * dist
    );
    // Clamp inside world boundary
    this.wanderTarget.x = Math.max(-55, Math.min(55, this.wanderTarget.x));
    this.wanderTarget.z = Math.max(-55, Math.min(55, this.wanderTarget.z));
    this.wanderTimer = 5 + Math.random() * 6;
  }

  private canSeePlayer(): boolean {
    if (this.player.isDead) return false;

    const toPlayer = new THREE.Vector3().subVectors(this.player.mesh.position, this.mesh.position);
    const dist = toPlayer.length();

    // Effective FOV range modified by stealth & traits
    const stealthReduction = this.player.stats.isHiding * 0.82; // 82% less visibility in bush
    const geneticCamoReduction = (this.player.traits.stealthFactor - 1.0) * 0.35;
    const effectiveRange = this.fovRange * Math.max(0.15, 1.0 - stealthReduction - geneticCamoReduction);

    if (dist > effectiveRange) return false;

    // Angle check
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(this.mesh.quaternion).normalize();
    toPlayer.y = 0;
    toPlayer.normalize();

    const dot = forward.dot(toPlayer);
    const angle = Math.acos(Math.max(-1, Math.min(1, dot)));

    return angle <= this.fovAngleRad / 2;
  }

  private canHearPlayer(): boolean {
    if (this.player.isDead) return false;
    if (this.player.stats.noiseRadius <= 0) return false;

    const dist = this.mesh.position.distanceTo(this.player.mesh.position);
    return dist <= this.hearingRange + this.player.stats.noiseRadius;
  }

  public update(delta: number) {
    if (this.alertAudioCooldown > 0) {
      this.alertAudioCooldown -= delta;
    }

    const seePlayer = this.canSeePlayer();
    const hearPlayer = this.canHearPlayer();

    // Finite State Machine transitions
    if (this.state === 'WANDER') {
      this.fovMaterial.color.setHex(0xffdd44);
      this.fovMaterial.opacity = 0.18;

      if (seePlayer) {
        this.state = 'CHASE';
        this.onAlert(true);
      } else if (hearPlayer) {
        this.state = 'INVESTIGATE';
        this.investigateTarget.copy(this.player.mesh.position);
        this.onAlert(false);
      } else {
        // Wander around
        this.wanderTimer -= delta;
        const distToWander = Math.hypot(
          this.wanderTarget.x - this.mesh.position.x,
          this.wanderTarget.z - this.mesh.position.z
        );

        if (this.wanderTimer <= 0 || distToWander < 2.0) {
          this.pickNewWanderTarget();
        }

        this.moveToward(this.wanderTarget, this.wanderSpeed, delta);
      }
    } else if (this.state === 'INVESTIGATE') {
      this.fovMaterial.color.setHex(0xff8822); // Orange alert
      this.fovMaterial.opacity = 0.32;

      if (seePlayer) {
        this.state = 'CHASE';
        this.onAlert(true);
      } else {
        if (hearPlayer) {
          // Update sound location
          this.investigateTarget.copy(this.player.mesh.position);
        }

        const distToTarget = Math.hypot(
          this.investigateTarget.x - this.mesh.position.x,
          this.investigateTarget.z - this.mesh.position.z
        );

        if (distToTarget < 2.0) {
          // Lost trail, resume wandering
          this.state = 'WANDER';
          this.pickNewWanderTarget();
        } else {
          this.moveToward(this.investigateTarget, this.wanderSpeed * 1.3, delta);
        }
      }
    } else if (this.state === 'CHASE') {
      this.fovMaterial.color.setHex(0xff2222); // Crimson red danger!
      this.fovMaterial.opacity = 0.55;

      SoundSystem.playHeartbeat(true);

      if (seePlayer) {
        this.chaseLostTimer = 0;
        this.investigateTarget.copy(this.player.mesh.position);
        this.moveToward(this.player.mesh.position, this.chaseSpeed, delta);

        // Check Attack Distance
        const dist = this.mesh.position.distanceTo(this.player.mesh.position);
        if (dist < 1.4) {
          this.state = 'ATTACK';
          this.player.kill('Predado por Leopardo da Savana');
          SoundSystem.playPredatorRoar();
        }
      } else {
        // Player broke line of sight (e.g. slipped into bushes!)
        this.chaseLostTimer += delta;
        this.moveToward(this.investigateTarget, this.chaseSpeed * 0.9, delta);

        if (this.chaseLostTimer > 3.0) {
          this.state = 'INVESTIGATE';
          SoundSystem.playHeartbeat(false);
        }
      }
    } else if (this.state === 'ATTACK') {
      this.fovMaterial.color.setHex(0xaa0000);
      SoundSystem.playHeartbeat(false);
    }
  }

  private onAlert(isVisual: boolean) {
    if (this.alertAudioCooldown <= 0) {
      if (isVisual) {
        SoundSystem.playPredatorAlert();
      }
      this.alertAudioCooldown = 4.0;
    }
  }

  private moveToward(target: THREE.Vector3, speed: number, delta: number) {
    const dirX = target.x - this.mesh.position.x;
    const dirZ = target.z - this.mesh.position.z;
    const dist = Math.hypot(dirX, dirZ);

    if (dist > 0.1) {
      const normX = dirX / dist;
      const normZ = dirZ / dist;

      this.mesh.position.x += normX * speed * delta;
      this.mesh.position.z += normZ * speed * delta;

      this.targetRotation = Math.atan2(normX, normZ);

      // Smooth rotate
      let diff = this.targetRotation - this.mesh.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      this.mesh.rotation.y += diff * Math.min(1, delta * 8);

      // Running animation
      this.animTimer += delta * (speed > 4 ? 16 : 8);
      const legAngle = Math.sin(this.animTimer) * 0.7;
      this.legFL.rotation.x = legAngle;
      this.legBR.rotation.x = legAngle;
      this.legFR.rotation.x = -legAngle;
      this.legBL.rotation.x = -legAngle;
      this.tailMesh.rotation.y = Math.sin(this.animTimer * 0.7) * 0.35;
    }

    // Terrain alignment
    const groundY = this.world.getTerrainHeight(this.mesh.position.x, this.mesh.position.z);
    this.mesh.position.y = groundY + 0.6;
  }
}
