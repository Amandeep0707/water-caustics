import * as THREE from "three/webgpu";
import * as TSL from "three/tsl";
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
    });
  }

  init() {
    const testPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10, 10),
      new THREE.MeshStandardNodeMaterial()
    );
    this.scene.add(testPlane);

    const offset = TSL.uniform((0, 0), "vec2");

    function luminance(color) {
      return TSL.dot(color, TSL.vec3(0.299, 0.587, 0.114));
    }

    // function transformUV(uv) {
    //   let zoomUV = uv.mul(TSL.uniform(2).sub(TSL.uniform(1)));
    //   zoomUV = zoomUV.add();
    // }

    const fragmentShader = TSL.Fn(() => {
      return TSL.texture(this.resources.items.testTexture, TSL.uv());
    });

    testPlane.material.colorNode = fragmentShader();
    testPlane.material.roughnessNode = TSL.uniform(0);
  }

  update() {}
}
