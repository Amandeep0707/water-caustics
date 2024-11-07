import * as THREE from "three/webgpu";
import Experience from "./Experience";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader.js";

export default class PostProcess {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.camera = this.experience.camera.instance;
    this.renderer = this.experience.renderer.instance;
    this.sizes = this.experience.sizes;

    /**
     * Post processing
     */
    const renderTarget = new THREE.WebGLRenderTarget(800, 600, {
      samples: 2,
    });

    this.effectComposer = new EffectComposer(this.renderer, renderTarget);
    this.effectComposer.setPixelRatio(this.sizes.pixelRatio);
    this.effectComposer.setSize(this.sizes.width, this.sizes.height);

    // Render pass
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.effectComposer.addPass(this.renderPass);

    // // Gamma Correction Pass
    // // Use this pass if using other color related passes only.
    // this.gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
    // this.effectComposer.addPass(this.gammaCorrectionPass);
  }

  resize() {
    // Update effect composer
    this.effectComposer.setSize(this.sizes.width, this.sizes.height);
    this.effectComposer.setPixelRatio(this.sizes.pixelRatio);
  }

  update() {
    this.effectComposer.render();
  }
}
