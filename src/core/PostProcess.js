import * as THREE from "three/webgpu";
import * as TSL from "three/tsl";
import { bloom } from "three/addons/tsl/display/BloomNode.js";
import { ssr } from "three/addons/tsl/display/SSRNode.js";
import { smaa } from "three/addons/tsl/display/SMAANode.js";
import Experience from "./Experience";

export default class PostProcess {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.camera = this.experience.camera.instance;
    this.renderer = this.experience.renderer.instance;
    this.sizes = this.experience.sizes;

    this.experience.resources.on("ready", () => {
      const scenePass = TSL.pass(this.scene, this.camera, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
      });

      scenePass.setMRT(
        TSL.mrt({
          output: TSL.output,
          depth: TSL.depth,
          normal: TSL.transformedNormalView,
          metalness: TSL.metalness,
          emissive: TSL.emissive,
        })
      );

      const scenePassColor = scenePass.getTextureNode("output");
      const scenePassNormal = scenePass.getTextureNode("normal");
      const scenePassDepth = scenePass.getTextureNode("depth");
      const scenePassMetalness = scenePass.getTextureNode("metalness");
      const scenePassEmissive = scenePass.getTextureNode("metalness");

      const ssrPass = ssr(
        scenePassColor,
        scenePassDepth,
        scenePassNormal,
        scenePassMetalness,
        this.camera
      );
      ssrPass.resolutionScale = 1.0;
      ssrPass.maxDistance.value = 1.5;
      ssrPass.opacity.value = 1.0;
      ssrPass.thickness.value = 0.015;

      const bloomPass = bloom(scenePassEmissive, 5.0, 1.0, 0.6);

      const outputNode = smaa(
        TSL.blendColor(scenePassColor.add(bloomPass), ssrPass)
      );

      const postProcessing = new THREE.PostProcessing(this.renderer);
      postProcessing.outputNode = outputNode;
    });
  }

  resize() {}

  update() {
    if (this.postProcessing) {
      this.postProcessing.renderAsync();
    }
  }
}
