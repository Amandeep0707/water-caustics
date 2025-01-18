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
    this.grid = new Grid(this.scene, this.camera);

    this.resources.on("ready", () => {
      // Setup
      this.environment = new Environment();

      this.scene.add(this.resources.items.damagedHelmet.scene);

      this.PlaneGeometry = new THREE.PlaneGeometry(10, 10);
      this.planeMaterial = new THREE.MeshStandardNodeMaterial();
      this.planeMaterial.roughnessNode = 0.1;
      this.planeMesh = new THREE.Mesh(this.PlaneGeometry, this.planeMaterial);
      this.planeMesh.rotateX(-Math.PI / 2);
      this.planeMesh.position.y = -0.01;
      this.scene.add(this.planeMesh);
    });
  }

  init() {}

  update() {}
}
