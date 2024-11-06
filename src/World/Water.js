import * as THREE from "three";
import Experience from "../Experience";
import { SimplexNoise } from "three/addons/math/SimplexNoise.js";
import { uniform } from "three/webgpu";

export default class Water {
  constructor() {
    this.experience = new Experience();
    this.camera = this.experience.camera.instance;
    this.scene = this.experience.scene;

    // Dimensions of Simulation Grid
    this.WIDTH = 128;

    // Water Size in system units.
    this.BOUNDS = 512;
    this.BOUNDS_HALF = this.BOUNDS * 0.5;

    this.waterMaxHeight = 10;

    this.mouseCoords = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();

    this.NUM_Spheres = 100;

    this.simplex = new SimplexNoise();

    this.initializeWater();
  }

  initializeWater() {
    // this.camera.near = 1;
    // this.camera.far = 1000;
    // this.camera.updateProjectionMatrix();
    this.camera.position.set(0, 2, 3.5);
    this.camera.lookAt(0, 0, 0);

    const sun = new THREE.DirectionalLight(0xffffff, 3.0);
    sun.position.set(3, 4, 1.75);
    this.scene.add(sun);

    const sun2 = new THREE.DirectionalLight(0xffffff, 2.0);
    sun2.position.set(-1, 3.5, -2);
    this.scene.add(sun2);

    const effectController = {
      mousePos: uniform(new THREE.Vector2(10000, 10000)).label("mousePos"),
      mouseSize: uniform(30).label("mouseSize"),
      viscosity: uniform(0.95).label("viscosity"),
      spheresEnabled: true,
      wireframe: false,
    };

    // Initialize Height Storage Buffers
    const heightArray = new Float32Array(this.WIDTH * this.WIDTH);
    const prevHeightArray = new Float32Array(this.WIDTH * this.WIDTH);

    let p = 0;
    for (let j = 0; j < this.WIDTH; j++) {
      for (let i = 0; i < this.WIDTH; i++) {
        const x = (i * 128) / this.WIDTH;
        const y = (j * 128) / this.WIDTH;

        const height = this.noise(x, y);

        heightArray[p] = height;
        prevHeightArray[p] = height;

        p++;
      }
    }
  }

  noise(x, y) {
    let multR = this.waterMaxHeight;
    let mult = 0.025;
    let r = 0;
    for (let i = 0; i < 15; i++) {
      r += multR * this.simplex.noise(x * mult, y * mult);
      multR *= 0.53 + 0.025 * i;
      mult *= 1.25;
    }

    return r;
  }

  // Get Indices of Neighbor Values of an Index in the Simulation Grid
  getNeighborIndicesTSL(index) {
    const width = uint(this.WIDTH);

    // Get 2-D compute coordinate from one-dimensional instanceIndex. The calculation will
    // still work even if you dispatch your compute shader 2-dimensionally, since within a compute
    // context, instanceIndex is a 1-dimensional value derived from the workgroup dimensions.

    // Cast to int to prevent unintended index overflow upon subtraction.
    const x = int(index.modInt(this.WIDTH));
    const y = int(index.div(this.WIDTH));

    // The original shader accesses height via texture uvs. However, unlike with textures, we can't
    // access areas that are out of bounds. Accordingly, we emulate the Clamp to Edge Wrapping
    // behavior of accessing a DataTexture with out of bounds uvs.

    const leftX = max(0, x.sub(1));
    const rightX = min(x.add(1), width.sub(1));

    const bottomY = max(0, y.sub(1));
    const topY = min(y.add(1), width.sub(1));

    const westIndex = y.mul(width).add(leftX);
    const eastIndex = y.mul(width).add(rightX);

    const southIndex = bottomY.mul(width).add(x);
    const northIndex = topY.mul(width).add(x);

    return { northIndex, southIndex, eastIndex, westIndex };
  }

  // Get simulation index neighbor values
  getNeighborValuesTSL(index, store) {
    const { northIndex, southIndex, eastIndex, westIndex } =
      this.getNeighborIndicesTSL(index);

    const north = store.element(northIndex);
    const south = store.element(southIndex);
    const east = store.element(eastIndex);
    const west = store.element(westIndex);

    return { north, south, east, west };
  }

  // Get new normals of simulation area.
  getNormalsFromHeightTSL(index, store) {
    const { north, south, east, west } = this.getNeighborValuesTSL(
      index,
      store
    );

    const normalX = west.sub(east).mul(this.WIDTH / this.BOUNDS);
    const normalY = south.sub(north).mul(this.WIDTH / this.BOUNDS);

    return { normalX, normalY };
  }

  update() {
    /**
     *
     */
  }
}
