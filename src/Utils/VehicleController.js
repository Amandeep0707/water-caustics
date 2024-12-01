import * as THREE from "three/webgpu";
import RAPIER from "@dimforge/rapier3d-compat";
import { DynamicRayCastVehicleController } from "@dimforge/rapier3d-compat";
import Experience from "../Experience";

class VehicleController {
  constructor(chassisRef, wheelRef, wheelsInfo) {
    this.experience = new Experience();
    this.physics = this.experience.physics;
    this.world = this.physics.world;
    this.chassis = chassisRef;
    this.wheel = wheelRef;
    this.wheelsInfo = wheelsInfo;
    this.vehicle = null;

    this.init();
  }

  init() {}

  update(timestep) {}

  dispose() {}
}

export default VehicleController;
