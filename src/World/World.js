import * as THREE from "three/webgpu";
import * as TSL from "three/tsl";
import Experience from "../core/Experience";
import Environment from "./Environment";
import Grid from "../Utils/Grid";

export default class World {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.camera = this.experience.camera.instance;
    this.renderer = this.experience.renderer.instance;
    this.physics = this.experience.physics;
    this.time = this.experience.time;
    this.debug = this.experience.debug;
    this.resources = this.experience.resources;

    this.resources.on("ready", () => {
      // Setup
      this.environment = new Environment();

      const ring = this.resources.items.ring.scene;
      ring.position.y = 0.029;
      ring.rotateX(-Math.PI / 25.15);
      ring.children[1].material.ior = 2.3;
      this.scene.add(ring);

      this.PlaneGeometry = new THREE.PlaneGeometry(5, 5);
      this.planeMaterial = new THREE.MeshStandardNodeMaterial();
      this.planeMaterial.color = new THREE.Color("#a7b4d4");
      this.planeMaterial.roughnessNode = 0.5;
      this.planeMesh = new THREE.Mesh(this.PlaneGeometry, this.planeMaterial);
      this.planeMesh.rotateX(-Math.PI / 2);
      this.scene.add(this.planeMesh);
    });
  }

  init() {}

  update() {}
}
