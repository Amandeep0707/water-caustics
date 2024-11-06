import * as THREE from "three";
import Experience from "../Experience";

export default class Environment {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    // this.setSunlight();
    this.setEnvironmentMap();
  }

  setSunlight() {
    this.sunLight = new THREE.DirectionalLight("#ffffff", 1);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.camera.far = 15;
    this.sunLight.shadow.mapSize.set(1024, 1024);
    this.sunLight.shadow.normalBias = 0.05;
    this.sunLight.position.set(3, 3, -3);
    this.scene.add(this.sunLight);
  }

  setEnvironmentMap() {
    const pmremGenerator = new THREE.PMREMGenerator(
      this.experience.renderer.instance
    );

    this.environmentMap = {};
    this.environmentMap.intensity = 1;
    this.environmentMap.texture = pmremGenerator.fromEquirectangular(
      this.resources.items.environmentMapTexture
    ).texture;
    this.scene.environment = this.environmentMap.texture;

    this.environmentMap.updateMaterial = () => {
      this.scene.traverse((child) => {
        if (
          child instanceof THREE.Mesh &&
          child.material instanceof THREE.MeshStandardMaterial
        ) {
          child.material.envMap = this.environmentMap.texture;
          child.material.envMapIntensity = this.environmentMap.intensity;
          child.material.needsUpdate = true;
        }
      });
    };

    this.environmentMap.updateMaterial();
  }
}
