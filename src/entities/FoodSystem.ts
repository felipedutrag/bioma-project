import * as THREE from 'three';
import type { FoodItemData } from '../types/game';
import { SavannaWorld } from '../world/SavannaWorld';
import { Player } from './Player';

export class FoodSystem {
  public items: FoodItemData[] = [];
  public meshes: Map<string, THREE.Group> = new Map();
  private scene: THREE.Scene;
  private world: SavannaWorld;
  private animTimer: number = 0;

  constructor(scene: THREE.Scene, world: SavannaWorld) {
    this.scene = scene;
    this.world = world;
    this.spawnInitialFoods();
  }

  private spawnInitialFoods() {
    const foodLocations: { type: FoodItemData['type']; x: number; z: number }[] = [
      { type: 'BERRY', x: -8, z: -10 },
      { type: 'BERRY', x: 7, z: -14 },
      { type: 'MELON', x: -16, z: 8 },
      { type: 'MELON', x: 18, z: 12 },
      { type: 'TERMITE', x: -22, z: 18 },
      { type: 'TERMITE', x: 19, z: -28 },
      { type: 'CARCASS', x: 28, z: -12 },
      { type: 'CARCASS', x: -30, z: -20 },
      { type: 'BERRY', x: -25, z: 28 },
      { type: 'MELON', x: 30, z: 25 },
      { type: 'BERRY', x: -38, z: 4 },
      { type: 'MELON', x: 12, z: 32 },
      { type: 'CARCASS', x: -14, z: -32 },
      { type: 'BERRY', x: 35, z: -25 },
    ];

    foodLocations.forEach((loc, idx) => {
      const id = `food_${idx}`;
      const y = this.world.getTerrainHeight(loc.x, loc.z) + 0.3;
      const data: FoodItemData = {
        id,
        type: loc.type,
        position: [loc.x, y, loc.z],
        nutrition: loc.type === 'CARCASS' ? 50 : loc.type === 'TERMITE' ? 35 : 25,
        hydration: loc.type === 'MELON' ? 35 : 10,
        active: true,
        respawnTimer: 0,
      };

      this.items.push(data);
      this.createFoodMesh(data);
    });
  }

  private createFoodMesh(data: FoodItemData) {
    const group = new THREE.Group();
    group.position.set(data.position[0], data.position[1], data.position[2]);

    if (data.type === 'BERRY') {
      const berryMat = new THREE.MeshStandardMaterial({
        color: 0xee3355,
        roughness: 0.3,
        emissive: 0x440011,
      });
      for (let i = 0; i < 4; i++) {
        const sphere = new THREE.Mesh(new THREE.DodecahedronGeometry(0.2, 0), berryMat);
        sphere.position.set((i % 2 - 0.5) * 0.25, Math.sin(i) * 0.15 + 0.2, ((i > 1 ? 1 : -1) * 0.15));
        sphere.castShadow = true;
        group.add(sphere);
      }
    } else if (data.type === 'MELON') {
      const melonMat = new THREE.MeshStandardMaterial({
        color: 0x44aa55,
        roughness: 0.5,
        flatShading: true,
      });
      const melon = new THREE.Mesh(new THREE.DodecahedronGeometry(0.45, 1), melonMat);
      melon.position.y = 0.35;
      melon.castShadow = true;
      group.add(melon);
    } else if (data.type === 'TERMITE') {
      const termiteMat = new THREE.MeshStandardMaterial({
        color: 0xcc8833,
        roughness: 0.8,
        flatShading: true,
      });
      const mound = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.8, 5), termiteMat);
      mound.position.y = 0.4;
      mound.castShadow = true;
      group.add(mound);
    } else if (data.type === 'CARCASS') {
      const boneMat = new THREE.MeshStandardMaterial({
        color: 0xeae6d8,
        roughness: 0.9,
        flatShading: true,
      });
      const meatMat = new THREE.MeshStandardMaterial({
        color: 0x992222,
        roughness: 0.6,
      });
      const meat = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.3, 0.4), meatMat);
      meat.position.y = 0.15;
      group.add(meat);

      const rib1 = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.05, 4, 8, Math.PI), boneMat);
      rib1.position.set(0, 0.2, 0);
      group.add(rib1);
    }

    // Glow indicator ring on ground
    const auraGeo = new THREE.RingGeometry(0.4, 0.55, 16);
    auraGeo.rotateX(-Math.PI / 2);
    const auraMat = new THREE.MeshBasicMaterial({
      color: data.type === 'MELON' ? 0x66ff88 : 0xffaa44,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
    });
    const aura = new THREE.Mesh(auraGeo, auraMat);
    aura.position.y = 0.05;
    group.add(aura);

    this.scene.add(group);
    this.meshes.set(data.id, group);
  }

  public update(delta: number, player: Player) {
    this.animTimer += delta;

    this.items.forEach((item) => {
      const mesh = this.meshes.get(item.id);
      if (!mesh) return;

      if (!item.active) {
        mesh.visible = false;
        item.respawnTimer -= delta;
        if (item.respawnTimer <= 0) {
          item.active = true;
          mesh.visible = true;
        }
        return;
      }

      mesh.visible = true;
      // Gentle floating animation
      mesh.position.y = item.position[1] + Math.sin(this.animTimer * 2.5 + item.position[0]) * 0.08;
      mesh.rotation.y += delta * 0.8;

      // Player pickup check
      const d = Math.hypot(
        player.mesh.position.x - item.position[0],
        player.mesh.position.z - item.position[2]
      );

      if (d < 1.6 && !player.isDead) {
        item.active = false;
        item.respawnTimer = 25.0; // 25s respawn
        player.eat(item.nutrition);
        if (item.hydration > 0) {
          player.drink(item.hydration);
        }
      }
    });
  }
}
