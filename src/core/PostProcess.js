import * as THREE from "three/webgpu";
import * as TSL from "three/tsl";
import Experience from "./Experience";

export default class PostProcess {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.camera = this.experience.camera.instance;
    this.renderer = this.experience.renderer.instance;
    this.sizes = this.experience.sizes;

    const scenePass = TSL.pass(this.scene, this.camera);
    const scenePassColor = scenePass.getTextureNode("output");

    this.experience.resources.on("ready", () => {
      // Constants
      const imageWidth = TSL.uniform(100);
      const imageHeight = TSL.uniform(80);
      const characterWidth = TSL.uniform(10);
      const characterHeight = TSL.uniform(10);

      const asciiTexture = this.experience.resources.items.asciiTexture;
      asciiTexture.magFilter = THREE.NearestFilter;
      asciiTexture.minFilter = THREE.NearestFilter;
      asciiTexture.wrapS = THREE.RepeatWrapping;

      scenePassColor.uvNode = gridUV();

      function gridUV() {
        const xComp = TSL.div(
          TSL.floor(TSL.mul(imageWidth, TSL.uv().x)),
          imageWidth
        );

        const yComp = TSL.div(
          TSL.floor(TSL.mul(imageHeight, TSL.uv().y)),
          imageHeight
        );

        return TSL.vec2(xComp, yComp);
      }

      function characterGridUV() {
        const xComp = TSL.div(
          TSL.mod(TSL.mul(imageWidth, TSL.uv().x), TSL.uniform(1)),
          TSL.uniform(characterWidth)
        );
        const yComp = TSL.div(
          TSL.mod(TSL.mul(imageHeight, TSL.uv().y), TSL.uniform(1)),
          TSL.uniform(characterHeight)
        );

        return TSL.vec2(xComp, yComp);
      }

      function offsetX() {
        return TSL.div(
          TSL.floor(
            TSL.mul(
              TSL.dot(scenePassColor, TSL.vec3(0.2125, 0.7154, 0.0721)),
              characterWidth
            )
          ),
          characterWidth
        );
      }

      function offsetY() {
        return TSL.mul(
          TSL.round(TSL.mul(TSL.uniform(Math.random()), characterHeight)),
          TSL.div(TSL.uniform(1), characterHeight)
        );
      }

      const fragmentShader = TSL.Fn(() => {
        const finalUV = TSL.add(
          characterGridUV(),
          TSL.vec2(offsetX().x, offsetY().x)
        );

        return TSL.texture(asciiTexture, finalUV);
      });

      this.postProcessing = new THREE.PostProcessing(this.renderer);
      this.postProcessing.outputNode = fragmentShader();

      if (this.experience.debug.active) {
        const postProcessFolder = this.experience.debug.ui.addFolder({
          title: "Post Process",
          expanded: false,
        });
        postProcessFolder.addBinding(imageWidth, "value", {
          min: 10,
          max: 1000,
          step: 1,
          label: "Screen Width",
        });
        postProcessFolder.addBinding(imageHeight, "value", {
          min: 10,
          max: 1000,
          step: 1,
          label: "Screen Height",
        });
      }
    });
  }

  resize() {}

  update() {
    if (this.postProcessing) {
      this.postProcessing.renderAsync();
    }
  }
}
