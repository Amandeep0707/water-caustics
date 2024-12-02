import * as THREE from "three/webgpu";
import EventEmitter from "./Utils/EventEmitter.js";
import Sizes from "./Utils/Sizes.js";
import Time from "./Utils/Time.js";
import Camera from "./Camera.js";
import Renderer from "./Renderer.js";
import World from "./World/World.js";
import Debug from "./Utils/Debug.js";
import Resources from "./Utils/Resources.js";
import sources from "./sources.js";
import PostProcess from "./PostProcess.js";
import { Physics, DebugPhysics } from "./Physics.js";

let instance = null;

export default class Experience extends EventEmitter {
  constructor(canvas) {
    super();

    if (instance) {
      return instance;
    }
    instance = this;

    // Constants
    this.usePostProcessing = false;
    this.usePhysics = false;

    // Global Access
    window.experience = this;

    // Options
    this.canvas = canvas;

    // Setup
    this.debug = new Debug();
    this.sizes = new Sizes();
    this.time = new Time();
    this.scene = new THREE.Scene();
    this.resources = new Resources(sources);
    this.camera = new Camera();
    this.renderer = new Renderer();
    if (this.usePhysics) this.physics = new Physics();
    if (this.usePostProcessing) this.postProcess = new PostProcess();
    this.world = new World();

    if (this.physics) {
      this.physics.on("init", () => {
        this.world.init();
      });
    } else {
      this.world.init();
    }

    // Sizes resize event
    this.sizes.on("resize", () => {
      this.resize();
    });

    // Tick Event
    this.time.on("tick", () => {
      this.update();
    });
  }

  resize() {
    this.camera.resize();
    this.renderer.resize();
    if (this.postProcess) this.postProcess.resize();
  }

  update() {
    // Frame trace begins here
    if (this.debug.active) this.debug.stats.begin();

    this.trigger("tick");

    this.camera.update();
    this.world.update();
    this.renderer.update();
    if (this.postProcess) this.postProcess.update();

    // Frame trace ends here
    if (this.debug.active) this.debug.stats.end();
  }

  destroy() {
    this.sizes.off("resize");
    this.time.off("tick");

    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();

        for (const key in child.material) {
          const value = child.material.key;
          if (value && typeof value.dispose === "function") {
            value.dispose();
          }
        }
      }
    });

    this.camera.controls.dispose();
    this.renderer.instance.dispose();

    if (this.debug.active) {
      this.debug.ui.destroy();
    }
  }
}
