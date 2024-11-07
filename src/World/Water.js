import * as THREE from "three/webgpu";
import Experience from "../Experience";
import { SimplexNoise } from "three/addons/math/SimplexNoise.js";

export default class Water {
  constructor() {
    this.experience = new Experience();
    this.camera = this.experience.camera.instance;
    this.scene = this.experience.scene;
    this.renderer = this.experience.renderer.instance;

    // Dimensions of Simulation Grid
    this.WIDTH = 128;

    // Water Size in system units.
    this.BOUNDS = 10;
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

    this.effectController = {
      mousePos: THREE.uniform(new THREE.Vector2(10000, 10000)).label(
        "mousePos"
      ),
      mouseSize: THREE.uniform(30).label("mouseSize"),
      viscosity: THREE.uniform(0.95).label("viscosity"),
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

    const heightBufferAttribute = new THREE.StorageBufferAttribute(
      heightArray,
      1
    );

    const prevHeightBufferAttribute = new THREE.StorageBufferAttribute(
      prevHeightArray,
      1
    );

    const heightStorage = THREE.storageObject(
      heightBufferAttribute,
      "float",
      heightBufferAttribute.count
    ).label("Height");
    const prevHeightStorage = THREE.storageObject(
      prevHeightBufferAttribute,
      "float",
      prevHeightBufferAttribute.count
    ).label("PrevHeight");

    const heightRead = THREE.storageObject(
      heightBufferAttribute,
      "float",
      heightBufferAttribute.count
    )
      .toReadOnly()
      .label("HeightRead");

    this.computeHeight = THREE.Fn(() => {
      console.log("computeHeight");
      const { viscosity, mousePos, mouseSize } = this.effectController;

      const height = heightStorage.element(THREE.instanceIndex).toVar();
      const prevHeight = prevHeightStorage.element(THREE.instanceIndex).toVar();

      const { north, south, east, west } = this.getNeighborValuesTSL(
        THREE.instanceIndex,
        heightStorage
      );

      const neighborHeight = north.add(south).add(east).add(west);
      neighborHeight.mulAssign(0.5);
      neighborHeight.subAssign(prevHeight);

      const newHeight = neighborHeight.mul(viscosity);

      // Get 2-D compute coordinate from one-dimensional THREE.instanceIndex.
      const x = THREE.float(THREE.instanceIndex.modInt(this.WIDTH)).mul(
        1 / this.WIDTH
      );
      const y = THREE.float(THREE.instanceIndex.div(this.WIDTH)).mul(
        1 / this.WIDTH
      );

      // Mouse influence
      const centerVec = THREE.vec2(0.5);
      // Get length of position in range [ -BOUNDS / 2, BOUNDS / 2 ], offset by mousePos, then scale.
      const mousePhase = THREE.clamp(
        THREE.length(
          THREE.vec2(x, y).sub(centerVec).mul(this.BOUNDS).sub(mousePos)
        )
          .mul(Math.PI)
          .div(mouseSize),
        0.0,
        Math.PI
      );

      newHeight.addAssign(THREE.cos(mousePhase).add(1.0).mul(0.28));

      prevHeightStorage.element(THREE.instanceIndex).assign(height);
      heightStorage.element(THREE.instanceIndex).assign(newHeight);
    })().compute(this.WIDTH * this.WIDTH);

    /**
     * Creating Water Geometry
     */
    this.waterGeometry = new THREE.PlaneGeometry(
      this.BOUNDS,
      this.BOUNDS,
      this.WIDTH - 1,
      this.WIDTH - 1
    );

    this.waterMaterial = new THREE.MeshPhysicalNodeMaterial();
    this.waterMaterial.lights = true;
    this.waterMaterial.colorNode = new THREE.Color(0x0040c0);
    this.waterMaterial.roughnessNode = 0.1;

    this.waterMesh = new THREE.Mesh(this.waterGeometry, this.waterMaterial);
    this.waterMesh.rotation.x = -Math.PI / 2;
    this.waterMesh.matrixAutoUpdate = false;
    this.waterMesh.updateMatrix();

    this.scene.add(this.waterMesh);

    /**
     * Creating Mesh For Raycasting
     */
    this.rayGEO = new THREE.PlaneGeometry(this.BOUNDS, this.BOUNDS, 1, 1);
    this.rayMesh = new THREE.Mesh(
      this.rayGEO,
      new THREE.MeshBasicNodeMaterial({ color: 0xffffff, visible: false })
    );
    this.rayMesh.rotation.x = -Math.PI / 2;
    this.rayMesh.matrixAutoUpdate = false;
    this.rayMesh.updateMatrix();
    this.scene.add(this.rayMesh);

    // Event Listener for Mouse Move
    window.addEventListener("pointermove", this.onPointerMove.bind(this));
  }

  onPointerMove(event) {
    if (event.isPrimary === false) return;

    this.setMouseCoords(event.clientX, event.clientY);
  }

  setMouseCoords(x, y) {
    this.mouseCoords.set(
      (x / this.renderer.domElement.clientWidth) * 2 - 1,
      -(y / this.renderer.domElement.clientHeight) * 2 + 1
    );
    this.mouseMoved = true;
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
    const width = THREE.uint(this.WIDTH);

    // Get 2-D compute coordinate from one-dimensional THREE.instanceIndex. The calculation will
    // still work even if you dispatch your compute shader 2-dimensionally, since within a compute
    // context, THREE.instanceIndex is a 1-dimensional value derived from the workgroup dimensions.

    // Cast to int to prevent unintended index overflow upon subtraction.
    const x = THREE.int(index.modInt(this.WIDTH));
    const y = THREE.int(index.div(this.WIDTH));

    // The original shader accesses height via texture uvs. However, unlike with textures, we can't
    // access areas that are out of bounds. Accordingly, we emulate the Clamp to Edge Wrapping
    // behavior of accessing a DataTexture with out of bounds uvs.

    const leftX = THREE.max(0, x.sub(1));
    const rightX = THREE.min(x.add(1), width.sub(1));

    const bottomY = THREE.max(0, y.sub(1));
    const topY = THREE.min(y.add(1), width.sub(1));

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

    if (this.mouseMoved) {
      this.raycaster.setFromCamera(this.mouseCoords, this.camera);

      const intersects = this.raycaster.intersectObject(this.rayMesh);

      if (intersects.length > 0) {
        const point = intersects[0].point;
        this.effectController.mousePos.value.set(point.x, point.z);
      } else {
        this.effectController.mousePos.value.set(10000, 10000);
      }

      this.mouseMoved = false;
    }
    console.log("render");
    this.renderer.computeAsync(this.computeHeight);
  }
}
