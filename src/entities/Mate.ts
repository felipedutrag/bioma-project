import * as THREE from 'three';
import { SavannaWorld } from '../world/SavannaWorld';
import { Player } from './Player';

export class Mate {
  public mesh: THREE.Group;
  public world: SavannaWorld;
  private heartParticles: THREE.Points;
  private heartGeo: THREE.BufferGeometry;
  private animTimer: number = 0;

  constructor(world: SavannaWorld, pos: THREE.Vector3) {
    this.world = world;
    this.mesh = new THREE.Group();

    this.buildModel();
    this.heartGeo = new THREE.BufferGeometry();
    this.heartParticles = this.createHeartParticles();

    this.mesh.position.copy(pos);
    this.mesh.position.y = this.world.getTerrainHeight(pos.x, pos.z) + 0.45;
    this.world.scene.add(this.mesh);
  }

  private buildModel() {
    const mateMat = new THREE.MeshStandardMaterial({
      color: 0xe6b074, // Beautiful lighter coat
      flatShading: true,
      roughness: 0.8,
    });

    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x5a3e2b,
      flatShading: true,
    });

    // Torso
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.6, 1.2), mateMat);
    body.position.y = 0.55;
    body.castShadow = true;
    this.mesh.add(body);

    // Head
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.85, 0.65);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.45, 0.5), mateMat);
    headGroup.add(head);

    const snout = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 0.35), darkMat);
    snout.position.set(0, -0.08, 0.35);
    headGroup.add(snout);

    // Ears
    const earGeo = new THREE.ConeGeometry(0.12, 0.25, 4);
    const earL = new THREE.Mesh(earGeo, darkMat);
    earL.position.set(0.2, 0.3, 0);
    earL.rotation.z = -0.3;
    headGroup.add(earL);

    const earR = new THREE.Mesh(earGeo, darkMat);
    earR.position.set(-0.2, 0.3, 0);
    earR.rotation.z = 0.3;
    headGroup.add(earR);

    this.mesh.add(headGroup);

    // Sitting legs
    const legGeo = new THREE.BoxGeometry(0.2, 0.35, 0.35);
    const legFL = new THREE.Mesh(legGeo, mateMat);
    legFL.position.set(0.26, 0.2, 0.35);
    this.mesh.add(legFL);

    const legFR = new THREE.Mesh(legGeo, mateMat);
    legFR.position.set(-0.26, 0.2, 0.35);
    this.mesh.add(legFR);

    // Tail curled
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 0.7, 4), darkMat);
    tail.position.set(0.3, 0.4, -0.6);
    tail.rotation.z = 0.8;
    this.mesh.add(tail);
  }

  private createHeartParticles(): THREE.Points {
    const particleCount = 12;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 1.5;
      positions[i * 3 + 1] = 1.0 + Math.random() * 1.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
    }

    this.heartGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const pMat = new THREE.PointsMaterial({
      color: 0xff4488,
      size: 0.25,
      transparent: true,
      opacity: 0,
    });

    const points = new THREE.Points(this.heartGeo, pMat);
    this.mesh.add(points);
    return points;
  }

  public update(delta: number, player: Player, onMatingReady: () => void) {
    this.animTimer += delta;

    const canReproduce = player.stats.canReproduce && !player.isDead;
    const pMat = this.heartParticles.material as THREE.PointsMaterial;

    if (canReproduce) {
      pMat.opacity = 0.75 + Math.sin(this.animTimer * 4) * 0.25;

      // Animate floating heart particles
      const posAttr = this.heartGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < posAttr.count; i++) {
        let y = posAttr.getY(i);
        y += delta * 0.6;
        if (y > 2.8) y = 1.0;
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;

      // Proximity check for mating
      const dist = this.mesh.position.distanceTo(player.mesh.position);
      if (dist < 2.2) {
        onMatingReady();
      }
    } else {
      pMat.opacity = 0;
    }
  }
}
