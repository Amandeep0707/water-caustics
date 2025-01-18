import * as THREE from "three/webgpu";
import * as TSL from "three/tsl";
import { ssr } from "three/addons/tsl/display/SSRNode.js";
import Experience from "./Experience";

export default class PostProcess {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.camera = this.experience.camera.instance;
    this.renderer = this.experience.renderer.instance;
    this.sizes = this.experience.sizes;

    this.experience.resources.on("ready", () => {
      const postProcessing = new THREE.PostProcessing(this.renderer);

      const scenePass = TSL.pass(this.scene, this.camera, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
      });
      scenePass.setMRT(
        TSL.mrt({
          output: TSL.output,
          normal: TSL.transformedNormalView,
          metalness: TSL.metalness,
        })
      );

      const scenePassColor = scenePass.getTextureNode("output");
      const scenePassNormal = scenePass.getTextureNode("normal");
      const scenePassDepth = scenePass.getTextureNode("depth");
      const scenePassMetalness = scenePass.getTextureNode("metalness");

      const ssrPass = ssr(
        scenePassColor,
        scenePassDepth,
        scenePassNormal,
        scenePassMetalness,
        this.camera
      );
      ssrPass.maxDistance.value = 0;
      ssrPass.opacity.value = 1;
      ssrPass.thickness.value = 0.05;
      ssrPass.resolutionScale = 1.0;
      postProcessing.outputNode = ssrPass;
    });
  }

  resize() {}

  update() {
    if (this.postProcessing) {
      this.postProcessing.renderAsync();
    }
  }
}
