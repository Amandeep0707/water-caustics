import * as THREE from "three/webgpu";
import * as TSL from "three/tsl";
import Experience from "../Experience";

export default class Grid {
  constructor(scene, camera) {
    this.debug = new Experience().debug;

    const planeGeo = new THREE.PlaneGeometry(500, 500, 1, 1);
    const planeMat = new THREE.MeshBasicNodeMaterial();
    const planeMesh = new THREE.Mesh(planeGeo, planeMat);
    planeMesh.rotateX(Math.PI * -0.5);
    scene.add(planeMesh);

    const uvScale = TSL.uniform(1);
    const cameraPos = TSL.uniform(camera.position, "vec3");
    const angleFadeControl = TSL.uniform(20);
    const distanceControl = TSL.uniform(0.01);
    const gridColor = TSL.uniform(TSL.color(0x505050));

    const fragmentShader = TSL.Fn(() => {
      const uv = TSL.positionWorld.xz.mul(uvScale);

      const grid = TSL.abs(
        TSL.fract(uv.sub(TSL.uniform(0.5))).sub(TSL.uniform(0.5))
      ).div(TSL.fwidth(uv));
      let angle = TSL.fwidth(uv);
      angle = TSL.uniform(1).sub(angle);
      angle = TSL.pow(angle, angleFadeControl);
      angle = TSL.clamp(angle, TSL.uniform(0), TSL.uniform(1));
      angle = TSL.min(angle.x, angle.y);
      const line = TSL.min(grid.x, grid.y);
      let distance = TSL.distance(cameraPos, TSL.positionWorld).mul(
        distanceControl
      );
      distance = TSL.uniform(1).sub(distance);
      distance = TSL.clamp(distance, TSL.uniform(0), TSL.uniform(1));

      let color = TSL.uniform(1).sub(TSL.min(line, TSL.uniform(1)));
      color = color.mul(angle).mul(distance);

      return TSL.vec4(gridColor, color.x);
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
