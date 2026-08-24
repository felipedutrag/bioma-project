import * as THREE from 'three';

export interface BushZone {
  position: THREE.Vector3;
  radius: number;
}

export interface WaterZone {
  position: THREE.Vector3;
  radius: number;
}

export class SavannaWorld {
  public scene: THREE.Scene;
  public terrainMesh!: THREE.Mesh;
  public waterMesh!: THREE.Mesh;
  public bushes: BushZone[] = [];
  public waterZones: WaterZone[] = [];
  public obstacleObjects: THREE.Object3D[] = [];
  
  public dirLight!: THREE.DirectionalLight;
  public hemiLight!: THREE.HemisphereLight;
  
  private waterUniformTime: number = 0;
  private bushGroup: THREE.Group = new THREE.Group();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.createAtmosphere();
    this.createTerrain();
    this.createWaterHoles();
    this.createAcaciaTrees();
    this.createBushes();
    this.createTermiteMoundsAndRocks();
  }

  private createAtmosphere() {
    // Warm African savanna fog and golden sky
    this.scene.background = new THREE.Color(0xf2bf80);
    this.scene.fog = new THREE.FogExp2(0xe8b374, 0.0075);

    // Ambient/Hemisphere lighting
    this.hemiLight = new THREE.HemisphereLight(0xffdfa9, 0x82542a, 0.9);
    this.hemiLight.position.set(0, 50, 0);
    this.scene.add(this.hemiLight);

    // Golden Sunlight
    this.dirLight = new THREE.DirectionalLight(0xfff1cc, 1.4);
    this.dirLight.position.set(45, 60, 35);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 1;
    this.dirLight.shadow.camera.far = 160;
    const d = 60;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.dirLight.shadow.bias = -0.0005;
    this.scene.add(this.dirLight);
  }

  private createTerrain() {
    const size = 180;
    const segments = 75;
    const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
    geometry.rotateX(-Math.PI / 2);

    const posAttr = geometry.attributes.position;
    const count = posAttr.count;
    const colors: number[] = [];

    // Water hole center for height depression
    const waterCenter = new THREE.Vector2(12, -8);

    for (let i = 0; i < count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);

      // Distance to water hole
      const distToWater = Math.hypot(x - waterCenter.x, z - waterCenter.y);
      
      // Procedural height
      let y = Math.sin(x * 0.04) * Math.cos(z * 0.04) * 2.2 +
              Math.sin(x * 0.09 + 1.2) * Math.cos(z * 0.08) * 1.0 +
              Math.sin(x * 0.015) * 3.5;

      // Depress area near water hole
      if (distToWater < 22) {
        const factor = Math.max(0, (22 - distToWater) / 22);
        y -= factor * 4.5;
      }

      // Edge boundaries rise up to keep player inside
      const distFromCenter = Math.hypot(x, z);
      if (distFromCenter > 65) {
        const edgeFactor = (distFromCenter - 65) / 25;
        y += Math.pow(edgeFactor, 2) * 9.0;
      }

      posAttr.setY(i, y);

      // Vertex Coloring
      const color = new THREE.Color();
      if (distToWater < 14) {
        // Mud & lush near water
        color.setRGB(0.36 + Math.random() * 0.05, 0.42 + Math.random() * 0.05, 0.22);
      } else if (y > 3.0) {
        // High dry ridge (terracotta/clay)
        color.setRGB(0.78 + Math.random() * 0.04, 0.46, 0.28);
      } else {
        // Savanna golden grasses
        const grassShade = Math.sin(x * 0.1) * 0.05;
        color.setRGB(0.85 + grassShade, 0.68 + grassShade, 0.38);
      }

      colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      flatShading: true,
      roughness: 0.88,
      metalness: 0.05,
    });

    this.terrainMesh = new THREE.Mesh(geometry, material);
    this.terrainMesh.receiveShadow = true;
    this.scene.add(this.terrainMesh);
  }

  public getTerrainHeight(x: number, z: number): number {
    const waterCenter = new THREE.Vector2(12, -8);
    const distToWater = Math.hypot(x - waterCenter.x, z - waterCenter.y);

    let y = Math.sin(x * 0.04) * Math.cos(z * 0.04) * 2.2 +
            Math.sin(x * 0.09 + 1.2) * Math.cos(z * 0.08) * 1.0 +
            Math.sin(x * 0.015) * 3.5;

    if (distToWater < 22) {
      const factor = Math.max(0, (22 - distToWater) / 22);
      y -= factor * 4.5;
    }

    const distFromCenter = Math.hypot(x, z);
    if (distFromCenter > 65) {
      const edgeFactor = (distFromCenter - 65) / 25;
      y += Math.pow(edgeFactor, 2) * 9.0;
    }

    return y;
  }

  private createWaterHoles() {
    const waterRadius = 11;
    const waterPos = new THREE.Vector3(12, -1.8, -8);

    const waterGeo = new THREE.CylinderGeometry(waterRadius, waterRadius * 0.9, 0.4, 24);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x228899,
      roughness: 0.15,
      metalness: 0.3,
      transparent: true,
      opacity: 0.85,
      flatShading: true,
    });

    this.waterMesh = new THREE.Mesh(waterGeo, waterMat);
    this.waterMesh.position.copy(waterPos);
    this.waterMesh.receiveShadow = true;
    this.scene.add(this.waterMesh);

    this.waterZones.push({
      position: waterPos.clone(),
      radius: waterRadius + 2.5,
    });

    // Secondary smaller pond
    const pond2Pos = new THREE.Vector3(-35, 0.2, 30);
    pond2Pos.y = this.getTerrainHeight(pond2Pos.x, pond2Pos.z) - 0.4;
    const pond2Geo = new THREE.CylinderGeometry(6, 5.5, 0.3, 16);
    const pond2 = new THREE.Mesh(pond2Geo, waterMat);
    pond2.position.copy(pond2Pos);
    pond2.receiveShadow = true;
    this.scene.add(pond2);

    this.waterZones.push({
      position: pond2Pos.clone(),
      radius: 7.5,
    });
  }

  private createAcaciaTrees() {
    const treeTrunkMat = new THREE.MeshStandardMaterial({
      color: 0x5a3e2b,
      flatShading: true,
      roughness: 0.9,
    });

    const canopyMat = new THREE.MeshStandardMaterial({
      color: 0x60773b,
      flatShading: true,
      roughness: 0.85,
    });

    const treePositions = [
      [-25, -15], [-45, 10], [-10, 35], [28, 25], [42, -22],
      [-30, -40], [18, -45], [35, 45], [-50, -25], [5, 48],
      [-18, -2], [32, -5], [50, 10], [-40, 40]
    ];

    treePositions.forEach(([x, z]) => {
      const y = this.getTerrainHeight(x, z);
      const tree = new THREE.Group();
      tree.position.set(x, y, z);

      // Low-poly twisted trunk
      const trunkGeo = new THREE.CylinderGeometry(0.5, 0.9, 6.5, 6);
      trunkGeo.rotateZ(0.12 * (Math.random() - 0.5));
      const trunk = new THREE.Mesh(trunkGeo, treeTrunkMat);
      trunk.position.y = 3.2;
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      tree.add(trunk);

      // Branch forks
      const branchGeo = new THREE.CylinderGeometry(0.3, 0.4, 3.2, 5);
      const branch1 = new THREE.Mesh(branchGeo, treeTrunkMat);
      branch1.position.set(0.6, 5.2, 0.4);
      branch1.rotation.z = -0.55;
      branch1.rotation.y = 0.4;
      branch1.castShadow = true;
      tree.add(branch1);

      const branch2 = new THREE.Mesh(branchGeo, treeTrunkMat);
      branch2.position.set(-0.6, 5.0, -0.4);
      branch2.rotation.z = 0.55;
      branch2.rotation.y = -0.3;
      branch2.castShadow = true;
      tree.add(branch2);

      // Flat-topped Acacia umbrella canopy layers
      const canopy1 = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 5.0, 0.8, 8), canopyMat);
      canopy1.position.set(0.8, 6.8, 0.5);
      canopy1.castShadow = true;
      tree.add(canopy1);

      const canopy2 = new THREE.Mesh(new THREE.CylinderGeometry(3.0, 3.8, 0.65, 7), canopyMat);
      canopy2.position.set(-1.0, 6.4, -0.6);
      canopy2.castShadow = true;
      tree.add(canopy2);

      const canopyTop = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.8, 0.5, 6), canopyMat);
      canopyTop.position.set(0.2, 7.4, 0);
      canopyTop.castShadow = true;
      tree.add(canopyTop);

      const scale = 0.85 + Math.random() * 0.45;
      tree.scale.set(scale, scale, scale);
      tree.rotation.y = Math.random() * Math.PI * 2;

      this.scene.add(tree);
      this.obstacleObjects.push(tree);
    });
  }

  private createBushes() {
    this.scene.add(this.bushGroup);

    const bushMat = new THREE.MeshStandardMaterial({
      color: 0x4d6829,
      flatShading: true,
      roughness: 0.9,
    });

    const bushPositions: [number, number][] = [
      [-12, -8], [-5, -18], [5, -12], [-18, 12], [8, 15],
      [-28, 5], [22, 12], [-32, -18], [25, -30], [-8, 25],
      [-40, -10], [15, 38], [-22, -35], [38, 5], [-15, 42],
      [2, -35], [30, -18], [-35, 22], [42, 30], [-2, 18],
      [14, -22], [-20, 28], [35, -38], [-48, 8], [20, 48]
    ];

    bushPositions.forEach(([x, z]) => {
      const y = this.getTerrainHeight(x, z);
      const bush = new THREE.Group();
      bush.position.set(x, y + 0.3, z);

      // Low poly cluster of 4-6 randomized icosahedrons
      const clusterCount = 5;
      for (let i = 0; i < clusterCount; i++) {
        const r = 0.9 + Math.random() * 0.7;
        const leafGeo = new THREE.IcosahedronGeometry(r, 0);
        const leafMesh = new THREE.Mesh(leafGeo, bushMat);
        leafMesh.position.set(
          (Math.random() - 0.5) * 1.8,
          0.4 + Math.random() * 0.6,
          (Math.random() - 0.5) * 1.8
        );
        leafMesh.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
        leafMesh.castShadow = true;
        bush.add(leafMesh);
      }

      this.bushGroup.add(bush);

      // Register stealth zone
      this.bushes.push({
        position: new THREE.Vector3(x, y, z),
        radius: 2.6,
      });
    });
  }

  private createTermiteMoundsAndRocks() {
    const moundMat = new THREE.MeshStandardMaterial({
      color: 0x964828,
      flatShading: true,
      roughness: 0.95,
    });

    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x8a7f75,
      flatShading: true,
      roughness: 0.85,
    });

    // Termite Mounds
    const mounds = [[-22, 18], [19, -28], [-38, -32], [32, 28], [2, 32]];
    mounds.forEach(([x, z]) => {
      const y = this.getTerrainHeight(x, z);
      const mound = new THREE.Group();
      mound.position.set(x, y, z);

      const baseGeo = new THREE.ConeGeometry(1.6, 4.2, 6);
      const base = new THREE.Mesh(baseGeo, moundMat);
      base.position.y = 2.1;
      base.castShadow = true;
      mound.add(base);

      const topGeo = new THREE.ConeGeometry(1.0, 2.5, 5);
      const top = new THREE.Mesh(topGeo, moundMat);
      top.position.set(0.3, 4.0, 0.1);
      top.castShadow = true;
      mound.add(top);

      mound.rotation.y = Math.random() * Math.PI;
      this.scene.add(mound);
      this.obstacleObjects.push(mound);
    });

    // Boulder clusters
    const rocks = [[-8, 8], [14, 8], [-15, -24], [28, -8], [-28, 38], [40, -12]];
    rocks.forEach(([x, z]) => {
      const y = this.getTerrainHeight(x, z);
      const cluster = new THREE.Group();
      cluster.position.set(x, y + 0.4, z);

      for (let i = 0; i < 3; i++) {
        const size = 0.8 + Math.random() * 0.9;
        const rockGeo = new THREE.DodecahedronGeometry(size, 0);
        const rock = new THREE.Mesh(rockGeo, rockMat);
        rock.position.set((Math.random() - 0.5) * 1.5, size * 0.6, (Math.random() - 0.5) * 1.5);
        rock.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
        rock.castShadow = true;
        cluster.add(rock);
      }

      this.scene.add(cluster);
      this.obstacleObjects.push(cluster);
    });
  }

  public checkInBush(pos: THREE.Vector3): number {
    let maxStealth = 0;
    for (const b of this.bushes) {
      const d = Math.hypot(pos.x - b.position.x, pos.z - b.position.z);
      if (d < b.radius) {
        const stealth = Math.min(1, (b.radius - d) / (b.radius * 0.6));
        if (stealth > maxStealth) {
          maxStealth = stealth;
        }
      }
    }
    return maxStealth; // 0 to 1
  }

  public checkInWater(pos: THREE.Vector3): boolean {
    for (const w of this.waterZones) {
      const d = Math.hypot(pos.x - w.position.x, pos.z - w.position.z);
      if (d < w.radius) {
        return true;
      }
    }
    return false;
  }

  public update(delta: number) {
    this.waterUniformTime += delta;
    if (this.waterMesh) {
      // Gentle surface shimmer
      this.waterMesh.rotation.y += delta * 0.02;
    }
  }
}
