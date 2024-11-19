import * as THREE from "three/webgpu";
import Experience from "./Experience";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { bloom } from "three/addons/tsl/display/BloomNode.js";

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
    // const renderTarget = new THREE.WebGLRenderTarget(800, 600, {
    //   samples: 2,
    // });

    // this.effectComposer = new Effe`ctComposer(this.renderer, renderTarget);
    // this.effectComposer.setPixelRatio(this.sizes.pixelRatio);
    // this.effectComposer.setSize(this.sizes.width, this.sizes.height);

    // // Render pass
    // this.renderPass = new RenderPass(this.scene, this.camera);
    // this.effectComposer.addPass(this.renderPass);

    const scenePass = THREE.pass(this.scene, this.camera);
    scenePass.setMRT(THREE.mrt(THREE.output, THREE.emissive));

    const outputPass = scenePass.getTextureNode();
    const emissivePass = scenePass.getTextureNode("emissive");

    const bloomPass = bloom(emissivePass, 2.5, 0.5);

    const postProcessing = new THREE.PostProcessing(this.renderer);
    postProcessing.outputNode = outputPass.add(bloomPass);

    console.log(postProcessing);
  }

  resize() {
    // // Update effect composer
    // this.effectComposer.setSize(this.sizes.width, this.sizes.height);
    // this.effectComposer.setPixelRatio(this.sizes.pixelRatio);
  }

  update() {
    // this.effectComposer.render();
  }
}
