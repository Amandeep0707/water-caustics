import * as THREE from "three/webgpu";
import Experience from "../Experience";

export default class Grid {
  constructor(scene, camera) {
    this.debug = new Experience().debug;

    const planeGeo = new THREE.PlaneGeometry(500, 500, 1, 1);
    const planeMat = new THREE.MeshBasicNodeMaterial();
    const planeMesh = new THREE.Mesh(planeGeo, planeMat);
    planeMesh.rotateX(Math.PI * -0.5);
    scene.add(planeMesh);

    const uvScale = THREE.uniform(1);
    const cameraPos = THREE.uniform(camera.position, "vec3");
    const angleFadeControl = THREE.uniform(20);
    const distanceControl = THREE.uniform(0.01);
    const gridColor = THREE.uniform(THREE.color(0x505050));

    const fragmentShader = THREE.Fn(() => {
      const uv = THREE.positionWorld.xz.mul(uvScale);

      const grid = THREE.abs(
        THREE.fract(uv.sub(THREE.uniform(0.5))).sub(THREE.uniform(0.5))
      ).div(THREE.fwidth(uv));
      let angle = THREE.fwidth(uv);
      angle = THREE.uniform(1).sub(angle);
      angle = THREE.pow(angle, angleFadeControl);
      angle = THREE.clamp(angle, THREE.uniform(0), THREE.uniform(1));
      angle = THREE.min(angle.x, angle.y);
      const line = THREE.min(grid.x, grid.y);
      let distance = THREE.distance(cameraPos, THREE.positionWorld).mul(
        distanceControl
      );
      distance = THREE.uniform(1).sub(distance);
      distance = THREE.clamp(distance, THREE.uniform(0), THREE.uniform(1));

      let color = THREE.uniform(1).sub(THREE.min(line, THREE.uniform(1)));
      color = color.mul(angle).mul(distance);

      return THREE.vec4(gridColor, color.x);
    });

    planeMat.fragmentNode = fragmentShader();
    planeMat.side = THREE.DoubleSide;
    planeMat.transparent = true;

    if (this.debug.active) {
      const gridFolder = this.debug.ui.addFolder({
        title: "Grid",
        expanded: false,
      });
      gridFolder.addBinding(uvScale, "value", {
        min: 1,
        max: 10,
        step: 0.01,
        label: "Pattern Scale",
      });
      gridFolder.addBinding(angleFadeControl, "value", {
        min: 0,
        max: 20,
        step: 0.01,
        label: "Angle Fade Control",
      });
      gridFolder.addBinding(distanceControl, "value", {
        min: 0,
        max: 0.1,
        step: 0.001,
        label: "Distance Control",
      });
      gridFolder.addBinding(gridColor, "value", {
        view: "color",
        color: {
          alpha: true,
          type: "float",
        },
        label: "Grid Color",
      });
    }
  }
}
