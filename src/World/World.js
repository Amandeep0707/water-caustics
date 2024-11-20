import * as THREE from "three/webgpu";
import Experience from "../Experience";
import Environment from "./Environment";

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
      // this.init();

      const planeGeo = new THREE.PlaneGeometry(10, 10, 1, 1);
      const PlaneMat = new THREE.MeshBasicNodeMaterial({
        side: THREE.DoubleSide,
      });
      const planeMesh = new THREE.Mesh(planeGeo, PlaneMat);
      planeMesh.rotateX(Math.PI * 0.5);
      this.scene.add(planeMesh);

      const lineWidth = THREE.uniform(0);
      const lineAA = THREE.uniform(0.01);
      const uvScale = THREE.uniform(50);

      const fragmentShader = THREE.Fn(() => {
        const uv = THREE.uv().mul(uvScale);
        const gridUV = THREE.uniform(1).sub(
          THREE.abs(THREE.fract(uv).mul(2).sub(1))
        );
        const grid2 = THREE.smoothstep(
          gridUV,
          lineWidth.sub(lineAA),
          lineWidth.add(lineAA)
        );

        const finalColor = THREE.uniform(1).sub(grid2.x.mul(grid2.y));
        return finalColor;
      });

      PlaneMat.fragmentNode = fragmentShader();

      if (this.debug.active) {
        this.debug.ui.addBinding(lineWidth, "value", {
          min: -1,
          max: 2,
          step: 0.01,
          label: "Line Width",
        });
      }
      if (this.debug.active) {
        this.debug.ui.addBinding(lineAA, "value", {
          min: 0,
          max: 0.1,
          step: 0.001,
          label: "Line AA",
        });
      }
      if (this.debug.active) {
        this.debug.ui.addBinding(uvScale, "value", {
          min: 1,
          max: 100,
          step: 0.1,
          label: "Pattern Scale",
        });
      }
    });
  }

  update() {}
}
