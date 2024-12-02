import * as THREE from "three/webgpu";
import * as TSL from "three/tsl";
import Experience from "../core/Experience";
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

      const testPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(5, 6),
        new THREE.MeshStandardNodeMaterial()
      );
      this.scene.add(testPlane);

      // Constants
      const imageWidth = TSL.uniform(150);
      const imageHeight = TSL.uniform(90);
      const characterWidth = TSL.uniform(10);
      const characterHeight = TSL.uniform(10);

      const asciiTexture = this.resources.items.asciiTexture;
      const testTexture = this.resources.items.testTexture;
      asciiTexture.magFilter = THREE.NearestFilter;
      asciiTexture.minFilter = THREE.NearestFilter;
      asciiTexture.wrapS = THREE.RepeatWrapping;
      testTexture.magFilter = THREE.NearestFilter;
      testTexture.minFilter = THREE.NearestFilter;
      testTexture.wrapS = THREE.RepeatWrapping;

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
              TSL.dot(
                TSL.texture(testTexture, gridUV()),
                TSL.vec3(0.2125, 0.7154, 0.0721)
              ),
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

        // return finalUV;
        return TSL.texture(this.resources.items.asciiTexture, finalUV);
      });

      testPlane.material.colorNode = fragmentShader();
      testPlane.material.roughnessNode = TSL.uniform(0);
      testPlane.material.side = THREE.DoubleSide;
    });
  }

  init() {}

  update() {}
}
