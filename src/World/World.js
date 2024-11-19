import * as THREE from "three/webgpu";
import * as TSL from "three/tsl";
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
      this.init();
    });
  }

  init() {
    this.planeGeo = new THREE.PlaneGeometry(2, 2, 20, 20);
    this.planeMat = new THREE.MeshStandardNodeMaterial();
    this.planeMesh = new THREE.Mesh(this.planeGeo, this.planeMat);
    this.planeMesh.rotateX(Math.PI / 2);
    this.scene.add(this.planeMesh);

    this.params = {
      distanceFactor: TSL.uniform(1),
      distanceSpeed: TSL.uniform(2),
    };

    if (this.debug.active) {
      this.debug.ui.addBinding(this.params.distanceFactor, "value", {
        min: 0,
        max: 2,
        step: 0.01,
      });
      this.debug.ui.addBinding(this.params.distanceSpeed, "value", {
        min: 0,
        max: 2,
        step: 0.01,
      });
    }

    this.planeMat.wireframe = true;
    this.planeMat.colorNode = new THREE.Color(0x000000);
    this.planeMat.positionNode = TSL.Fn(() => {
      const position = TSL.positionLocal;

      const move = TSL.sin(TSL.time.mul(this.params.distanceSpeed));

      position.z.addAssign(move.mul(this.params.distanceFactor));

      return TSL.positionLocal;
    })();
  }

  update() {}
}
