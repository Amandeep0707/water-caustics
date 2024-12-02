import * as THREE from "three/webgpu";
import * as TSL from "three/tsl";
import Experience from "./Experience";
import { bloom } from "three/addons/tsl/display/BloomNode.js";

export default class PostProcess {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.camera = this.experience.camera.instance;
    this.renderer = this.experience.renderer.instance;
    this.sizes = this.experience.sizes;

    const scenePass = TSL.pass(this.scene, this.camera);
    const scenePassColor = scenePass.getTextureNode("output");

    const bloomPass = bloom(scenePassColor);

    this.postProcessing = new THREE.PostProcessing(this.renderer);
    this.postProcessing.outputNode = scenePassColor.add(bloomPass);

    if (this.experience.debug.active) {
      const bloomParams = {
        threshold: TSL.uniform(0.2),
        strength: TSL.uniform(0.15),
        radius: TSL.uniform(0.8),
      };
      const postProcessFolder = this.experience.debug.ui.addFolder({
        title: "Post Process",
        expanded: false,
      });
      postProcessFolder
        .addBinding(bloomParams.threshold, "value", {
          min: 0,
          max: 1,
          step: 0.01,
          label: "Bloom Threshold",
        })
        .on("change", (e) => {
          bloomPass.threshold.value = e.value;
        });
      postProcessFolder
        .addBinding(bloomParams.strength, "value", {
          min: 0,
          max: 1,
          step: 0.01,
          label: "Bloom Strength",
        })
        .on("change", (e) => {
          bloomPass.strength.value = e.value;
        });
      postProcessFolder
        .addBinding(bloomParams.radius, "value", {
          min: 0,
          max: 1,
          step: 0.01,
          label: "Bloom Radius",
        })
        .on("change", (e) => {
          bloomPass.radius.value = e.value;
        });
    }
  }

  resize() {}

  update() {
    if (this.postProcessing) {
      this.postProcessing.renderAsync();
    }
  }
}
