import * as THREE from "three/webgpu";
import RAPIER from "https://cdn.skypack.dev/pin/@dimforge/rapier3d-compat@v0.14.0-9fFno0Co5H1pOBbDcBZz/mode=imports/optimized/@dimforge/rapier3d-compat.js";
import Experience from "../Experience";
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
      this.init();
    });
  }

  init() {
    if (this.physics) {
    }
  }

  update() {}
}
