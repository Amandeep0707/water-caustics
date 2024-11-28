import * as THREE from "three/webgpu";
import * as RAPIER from "@dimforge/rapier3d";
import Experience from "../Experience";
import Environment from "./Environment";
import Grid from "../Utils/Grid";

export default class World {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.camera = this.experience.camera.instance;
    this.renderer = this.experience.renderer.instance;
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
    this.scene.add(this.resources.items.damagedHelmet.scene);

    console.log(RAPIER);
  }

  update() {}
}
