import * as THREE from "three";
import Experience from "../Experience";
import Environment from "./Environment";
import Water from "./Water";

export default class World {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.camera = this.experience.camera.instance;
    this.renderer = this.experience.renderer.instance;
    this.time = this.experience.time;
    this.debug = this.experience.debug;
    this.resources = this.experience.resources;

    this.resources.on("ready", () => {
      // Setup
      this.environment = new Environment();

      this.scene.add(this.resources.items.poolMesh.scene);

      this.waterSim = new Water();
    });
  }

  update() {
    if (this.waterSim) this.waterSim.update();
  }
}
