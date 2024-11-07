import * as THREE from "three/webgpu";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Experience from "./Experience";

export default class Camera {
  constructor() {
    this.experience = new Experience();
    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.canvas = this.experience.canvas;

    // Constants
    this.nearClip = 0.1;
    this.farClip = 100;

    this.setInstance();
    this.setOrbitControls();
  }

  setInstance() {
    this.instance = new THREE.PerspectiveCamera(
      65,
      this.sizes.width / this.sizes.height,
      this.nearClip,
      this.farClip
    );
    this.instance.position.set(0, 2, 5);
    this.instance.lookAt(0, 0, 0);
  }

  setOrbitControls() {
    this.controls = new OrbitControls(this.instance, this.canvas);
    this.controls.enabled = true;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.2;
  }

  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height;
    this.instance.updateProjectionMatrix();
  }

  update() {
    this.controls.update();
  }
}
