import * as THREE from 'three';
import type { PlayerStats, TraitModifiers } from '../types/game';
import { SoundSystem } from '../audio/SoundSystem';
import { SavannaWorld } from '../world/SavannaWorld';

export class Player {
  public mesh: THREE.Group;
  public stats: PlayerStats;
  public traits: TraitModifiers;
  private world: SavannaWorld;

  // Visual parts for animation
  private bodyMesh!: THREE.Mesh;
  private headMesh!: THREE.Group;
  private legFL!: THREE.Mesh;
  private legFR!: THREE.Mesh;
  private legBL!: THREE.Mesh;
  private legBR!: THREE.Mesh;
  private tailMesh!: THREE.Mesh;
  private soundRingMesh!: THREE.Mesh;
  private stealthAuraMesh!: THREE.Mesh;

  // Movement & physics
  private velocity: THREE.Vector3 = new THREE.Vector3();
  private targetRotation: number = 0;
  private walkAnimTimer: number = 0;
  private footstepTimer: number = 0;
  private keys: { [key: string]: boolean } = {};

  // Lifetime
  public lifespanSeconds: number = 0;
  public isDead: boolean = false;
  public deathReason: string = '';

  constructor(world: SavannaWorld, traits: TraitModifiers, generation: number) {
    this.world = world;
    this.traits = traits;
    this.mesh = new THREE.Group();

    this.stats = {
      hunger: 90,
      stamina: 100,
      thirst: 90,
      age: 10, // starts as young cub
      isHiding: 0,
      noiseLevel: 0,
      noiseRadius: 0,
      isRunning: false,
      isDrinking: false,
      isEating: false,
      canReproduce: false,
      generation: generation,
    };

    this.buildModel();
    this.setupControls();

    // Initial position on safe hill near bushes
    const startX = -12;
    const startZ = -8;
    const startY = this.world.getTerrainHeight(startX, startZ);
    this.mesh.position.set(startX, startY + 0.45, startZ);
    this.world.scene.add(this.mesh);
  }

  private buildModel() {
    const furMat = new THREE.MeshStandardMaterial({
      color: 0xd49b55, // Golden meerkat / sand cat fur
      flatShading: true,
      roughness: 0.8,
      transparent: true,
      opacity: 1.0,
    });

    const darkFurMat = new THREE.MeshStandardMaterial({
      color: 0x4a3220, // Dark muzzle & ear tips
      flatShading: true,
      roughness: 0.85,
    });

    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });

    // Main Torso
    const bodyGeo = new THREE.BoxGeometry(0.7, 0.6, 1.2);
    this.bodyMesh = new THREE.Mesh(bodyGeo, furMat);
    this.bodyMesh.position.y = 0.55;
    this.bodyMesh.castShadow = true;
    this.mesh.add(this.bodyMesh);

    // Head & Snout Group
    this.headMesh = new THREE.Group();
    this.headMesh.position.set(0, 0.85, 0.65);

    const headGeo = new THREE.BoxGeometry(0.5, 0.45, 0.5);
    const head = new THREE.Mesh(headGeo, furMat);
    head.castShadow = true;
    this.headMesh.add(head);

    // Snout
    const snoutGeo = new THREE.BoxGeometry(0.28, 0.22, 0.35);
    const snout = new THREE.Mesh(snoutGeo, darkFurMat);
    snout.position.set(0, -0.08, 0.35);
    this.headMesh.add(snout);

    // Ears
    const earGeo = new THREE.ConeGeometry(0.12, 0.25, 4);
    const earL = new THREE.Mesh(earGeo, darkFurMat);
    earL.position.set(0.2, 0.3, 0);
    earL.rotation.z = -0.3;
    this.headMesh.add(earL);

    const earR = new THREE.Mesh(earGeo, darkFurMat);
    earR.position.set(-0.2, 0.3, 0);
    earR.rotation.z = 0.3;
    this.headMesh.add(earR);

    // Eyes
    const eyeGeo = new THREE.BoxGeometry(0.08, 0.08, 0.08);
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(0.18, 0.06, 0.23);
    this.headMesh.add(eyeL);

    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(-0.18, 0.06, 0.23);
    this.headMesh.add(eyeR);

    this.mesh.add(this.headMesh);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.18, 0.5, 0.18);
    this.legFL = new THREE.Mesh(legGeo, furMat);
    this.legFL.position.set(0.26, 0.25, 0.4);
    this.legFL.castShadow = true;
    this.mesh.add(this.legFL);

    this.legFR = new THREE.Mesh(legGeo, furMat);
    this.legFR.position.set(-0.26, 0.25, 0.4);
    this.legFR.castShadow = true;
    this.mesh.add(this.legFR);

    this.legBL = new THREE.Mesh(legGeo, furMat);
    this.legBL.position.set(0.26, 0.25, -0.4);
    this.legBL.castShadow = true;
    this.mesh.add(this.legBL);

    this.legBR = new THREE.Mesh(legGeo, furMat);
    this.legBR.position.set(-0.26, 0.25, -0.4);
    this.legBR.castShadow = true;
    this.mesh.add(this.legBR);

    // Animated Tail
    const tailGeo = new THREE.CylinderGeometry(0.06, 0.1, 0.8, 4);
    this.tailMesh = new THREE.Mesh(tailGeo, darkFurMat);
    this.tailMesh.position.set(0, 0.65, -0.7);
    this.tailMesh.rotation.x = -Math.PI / 4;
    this.mesh.add(this.tailMesh);

    // Noise Emission Ring (Ground Projector)
    const ringGeo = new THREE.RingGeometry(0.8, 1.0, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x55bbff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.0,
    });
    this.soundRingMesh = new THREE.Mesh(ringGeo, ringMat);
    this.soundRingMesh.position.y = -0.4;
    this.mesh.add(this.soundRingMesh);

    // Stealth Aura (Leaves shimmer)
    const auraGeo = new THREE.SphereGeometry(0.9, 8, 8);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0x88dd55,
      wireframe: true,
      transparent: true,
      opacity: 0,
    });
    this.stealthAuraMesh = new THREE.Mesh(auraGeo, auraMat);
    this.stealthAuraMesh.position.y = 0.5;
    this.mesh.add(this.stealthAuraMesh);
  }

  private setupControls() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      this.keys[e.code] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
      this.keys[e.code] = false;
    });
  }

  public eat(amount: number = 35) {
    this.stats.hunger = Math.min(100, this.stats.hunger + amount);
    this.stats.age = Math.min(100, this.stats.age + 12);
    this.stats.isEating = true;
    SoundSystem.playEat();
    setTimeout(() => (this.stats.isEating = false), 600);
  }

  public drink(amount: number = 40) {
    this.stats.thirst = Math.min(100, this.stats.thirst + amount);
    this.stats.stamina = Math.min(100, this.stats.stamina + 20);
    this.stats.isDrinking = true;
    SoundSystem.playDrink();
    setTimeout(() => (this.stats.isDrinking = false), 600);
  }

  public kill(reason: string) {
    if (this.isDead) return;
    this.isDead = true;
    this.deathReason = reason;
    SoundSystem.playDeath();
    SoundSystem.playHeartbeat(false);
  }

  public update(delta: number) {
    if (this.isDead) return;

    this.lifespanSeconds += delta;

    // Survival Decay
    const hungerDecay = 1.6 * this.traits.metabolismRate * delta;
    const thirstDecay = 2.0 * this.traits.metabolismRate * delta;

    this.stats.hunger -= hungerDecay;
    this.stats.thirst -= thirstDecay;
    this.stats.age = Math.min(100, this.stats.age + delta * 0.8);

    if (this.stats.age >= 90 && this.stats.hunger >= 50) {
      this.stats.canReproduce = true;
    }

    if (this.stats.hunger <= 0) {
      this.kill('Fome Severa (Inanição na Savana)');
      return;
    }
    if (this.stats.thirst <= 0) {
      this.kill('Desidratação sob o Sol Escaldante');
      return;
    }

    // Auto Drink when in water hole
    const inWater = this.world.checkInWater(this.mesh.position);
    if (inWater && this.stats.thirst < 95) {
      this.drink(delta * 25);
    }

    // Stealth check in bushes
    const bushStealth = this.world.checkInBush(this.mesh.position);
    this.stats.isHiding = bushStealth;

    // Visual feedback for stealth
    const furMat = this.bodyMesh.material as THREE.MeshStandardMaterial;
    if (bushStealth > 0.3) {
      furMat.opacity = 0.55;
      (this.stealthAuraMesh.material as THREE.MeshBasicMaterial).opacity = 0.35 * bushStealth;
    } else {
      furMat.opacity = 1.0;
      (this.stealthAuraMesh.material as THREE.MeshBasicMaterial).opacity = 0.0;
    }

    // Input Movement
    let moveX = 0;
    let moveZ = 0;

    if (this.keys['w'] || this.keys['arrowup']) moveZ -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) moveZ += 1;
    if (this.keys['a'] || this.keys['arrowleft']) moveX -= 1;
    if (this.keys['d'] || this.keys['arrowright']) moveX += 1;

    const isMoving = moveX !== 0 || moveZ !== 0;
    const wantsSprint = (this.keys['shift'] || this.keys['shiftleft'] || this.keys['shiftright']) && isMoving;
    
    // Sprint logic & Stamina
    if (wantsSprint && this.stats.stamina > 5) {
      this.stats.isRunning = true;
      this.stats.stamina = Math.max(0, this.stats.stamina - 22 * delta);
    } else {
      this.stats.isRunning = false;
      if (!wantsSprint) {
        this.stats.stamina = Math.min(100, this.stats.stamina + 14 * this.traits.staminaRecovery * delta);
      }
    }

    // Noise calculation
    if (this.stats.isRunning) {
      this.stats.noiseLevel = 1.0;
      this.stats.noiseRadius = 16.0;
    } else if (isMoving) {
      this.stats.noiseLevel = 0.35;
      this.stats.noiseRadius = 6.0;
    } else {
      this.stats.noiseLevel = 0.0;
      this.stats.noiseRadius = 0.0;
    }

    // Sound Ring ground visual feedback
    const ringMat = this.soundRingMesh.material as THREE.MeshBasicMaterial;
    if (this.stats.noiseRadius > 0) {
      const targetScale = this.stats.noiseRadius;
      this.soundRingMesh.scale.set(targetScale, targetScale, 1);
      ringMat.opacity = this.stats.isRunning ? 0.45 : 0.18;
      ringMat.color.setHex(this.stats.isRunning ? 0xff6644 : 0x44aaff);
    } else {
      ringMat.opacity = 0;
    }

    // Movement Physics
    const baseSpeed = this.stats.isRunning ? 9.5 : 5.0;
    const speed = baseSpeed * this.traits.speedMultiplier;

    if (isMoving) {
      const inputDir = new THREE.Vector3(moveX, 0, moveZ).normalize();
      this.velocity.x = inputDir.x * speed;
      this.velocity.z = inputDir.z * speed;
      this.targetRotation = Math.atan2(inputDir.x, inputDir.z);

      // Walk / Run animation
      this.walkAnimTimer += delta * (this.stats.isRunning ? 18 : 10);
      const legAngle = Math.sin(this.walkAnimTimer) * 0.6;
      this.legFL.rotation.x = legAngle;
      this.legBR.rotation.x = legAngle;
      this.legFR.rotation.x = -legAngle;
      this.legBL.rotation.x = -legAngle;
      this.tailMesh.rotation.y = Math.sin(this.walkAnimTimer) * 0.4;
      this.headMesh.position.y = 0.85 + Math.abs(Math.sin(this.walkAnimTimer)) * 0.08;

      // Footstep sound trigger
      this.footstepTimer += delta;
      const stepInterval = this.stats.isRunning ? 0.22 : 0.38;
      if (this.footstepTimer >= stepInterval) {
        this.footstepTimer = 0;
        SoundSystem.playFootstep(this.stats.isRunning);
      }
    } else {
      this.velocity.x *= 0.7;
      this.velocity.z *= 0.7;
      this.legFL.rotation.x = 0;
      this.legFR.rotation.x = 0;
      this.legBL.rotation.x = 0;
      this.legBR.rotation.x = 0;
      this.tailMesh.rotation.y = Math.sin(this.lifespanSeconds * 2.5) * 0.2;
    }

    // Smooth rotation lerp
    let diff = this.targetRotation - this.mesh.rotation.y;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    this.mesh.rotation.y += diff * Math.min(1, delta * 14);

    // Apply translation
    this.mesh.position.x += this.velocity.x * delta;
    this.mesh.position.z += this.velocity.z * delta;

    // Clamp map boundary
    const boundary = 68;
    this.mesh.position.x = Math.max(-boundary, Math.min(boundary, this.mesh.position.x));
    this.mesh.position.z = Math.max(-boundary, Math.min(boundary, this.mesh.position.z));

    // Follow terrain height
    const groundY = this.world.getTerrainHeight(this.mesh.position.x, this.mesh.position.z);
    this.mesh.position.y = groundY + 0.45;
  }
}
