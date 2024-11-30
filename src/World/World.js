import * as THREE from "three/webgpu";
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
    if (this.physics) {
      const visualCube = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshNormalNodeMaterial()
      );
      visualCube.position.set(0, 1, 0);
      this.scene.add(visualCube);

      this.physics.addEntity(
        {
          type: "dynamic",
          colliders: [{ shape: "cuboid", parameters: [0.5, 0.5, 0.5] }],
          position: { ...visualCube.position },
        },
        visualCube
      );

      this.physics.addEntity({
        type: "static",
        colliders: [
          {
            shape: "cuboid",
            parameters: [100, 1, 100],
          },
        ],
        position: { x: 0, y: -1.01, z: 0 },
      });
    }
  }

  update() {}
}
