import * as THREE from "three/webgpu";
import Experience from "../Experience";
import Environment from "./Environment";
import * as TSL from "three/tsl";

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

      const topTexture = this.resources.items.iceColor;
      topTexture.colorSpace = THREE.SRGBColorSpace;

      const bottomTexture = this.resources.items.concreteColor;
      bottomTexture.colorSpace = THREE.SRGBColorSpace;
      bottomTexture.wrapS = THREE.RepeatWrapping;
      bottomTexture.wrapT = THREE.RepeatWrapping;

      const roughnessTexture = this.resources.items.iceRoughness;
      roughnessTexture.colorSpace = THREE.NoColorSpace;

      const normalTexture = this.resources.items.iceNormal;
      normalTexture.colorSpace = THREE.NoColorSpace;

      const heightTexture = this.resources.items.iceHeight;
      heightTexture.colorSpace = THREE.NoColorSpace;

      // Parallax Effect
      const parallaxScale = 0.3;
      const offsetUV = TSL.texture(heightTexture).mul(parallaxScale);

      const parallaxUVOffset = TSL.parallaxUV(TSL.uv(), offsetUV);
      const parallaxResult = TSL.texture(bottomTexture, parallaxUVOffset);

      const iceNode = TSL.overlay(TSL.texture(topTexture), parallaxResult);

      const testGeo = new THREE.BoxGeometry(2, 2, 2);
      const testMaterial = new THREE.MeshStandardNodeMaterial();
      testMaterial.colorNode = iceNode.mul(5);
      testMaterial.roughnessNode = TSL.texture(roughnessTexture);
      this.testPlane = new THREE.Mesh(testGeo, testMaterial);
      this.scene.add(this.testPlane);
    });
  }

  update() {
    // if (this.waterSim) this.waterSim.update();
  }
}
