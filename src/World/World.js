import * as THREE from "three/webgpu";
import Experience from "../Experience";
import Environment from "./Environment";
import Grid from "../Utils/Grid";
import VehicleController from "../Utils/VehicleController";

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
    });
  }

  init() {
    if (this.physics) {
    }
  }

  update() {
    if (this.physics && this.vehicle) {
    }
  }
}
