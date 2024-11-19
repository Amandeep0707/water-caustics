import * as THREE from "three/webgpu";
import Experience from "../Experience";
import Environment from "./Environment";
import { TransformControls } from "three/examples/jsm/Addons.js";
import { smoothstep } from "three/webgpu";

export default class World {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.camera = this.experience.camera.instance;
    this.renderer = this.experience.renderer.instance;
    this.time = this.experience.time;
    this.debug = this.experience.debug;
    this.resources = this.experience.resources;

    this.resources.on("ready", () => {
      // Setup
      this.environment = new Environment();
      this.init();
    });
  }

  init() {
    const attractorsPositions = THREE.uniformArray([
      new THREE.Vector3(-1, 0, 0),
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(1, 0.5, 1),
    ]);

    const attractorsRotationAxes = THREE.uniformArray([
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(1, 0, -0.5).normalize(),
    ]);

    const attractorsLength = THREE.uniform(attractorsPositions.array.length);
    const attractors = [];

    const helpersRingGeometry = new THREE.RingGeometry(
      1,
      1.02,
      32,
      1,
      0,
      Math.PI * 1.5
    );
    const helpersArrowGeometry = new THREE.ConeGeometry(0.1, 0.4, 12, 1, false);
    const helpersMaterial = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
    });

    for (let i = 0; i < attractorsPositions.array.length; i++) {
      const attractor = {};

      attractor.position = attractorsPositions.array[i];
      attractor.orientation = attractorsRotationAxes.array[i];
      attractor.reference = new THREE.Object3D();
      attractor.reference.position.copy(attractor.position);
      attractor.reference.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        attractor.orientation
      );
      this.scene.add(attractor.reference);

      attractor.helper = new THREE.Group();
      attractor.helper.scale.setScalar(0.325);
      attractor.reference.add(attractor.helper);

      attractor.ring = new THREE.Mesh(helpersRingGeometry, helpersMaterial);
      attractor.ring.rotation.x = -Math.PI * 0.5;
      attractor.helper.add(attractor.ring);

      attractor.arrow = new THREE.Mesh(helpersArrowGeometry, helpersMaterial);
      attractor.arrow.position.x = 1;
      attractor.arrow.position.z = 0.2;
      attractor.arrow.rotation.x = Math.PI * 0.5;
      attractor.helper.add(attractor.arrow);

      attractor.controls = new TransformControls(
        this.camera,
        this.renderer.domElement
      );
      attractor.controls.mode = "rotate";
      attractor.controls.size = 0.5;
      attractor.controls.attach(attractor.reference);
      attractor.controls.visible = true;
      attractor.controls.enabled = attractor.controls.visible;
      this.scene.add(attractor.controls.getHelper());

      attractor.controls.addEventListener("dragging-changed", (event) => {
        this.experience.camera.controls.enabled = !event.value;
      });

      attractor.controls.addEventListener("change", () => {
        attractor.position.copy(attractor.reference.position);
        attractor.orientation.copy(
          new THREE.Vector3(0, 1, 0).applyQuaternion(
            attractor.reference.quaternion
          )
        );
      });

      attractors.push(attractor);
    }

    const count = Math.pow(2, 18);
    const material = new THREE.SpriteNodeMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const attractorMass = THREE.uniform(Number(`1e${7}`));
    const particleGlobalMass = THREE.uniform(Number(`1e${4}`));
    const timeScale = THREE.uniform(1);
    const spinningStrength = THREE.uniform(2.75);
    const maxSpeed = THREE.uniform(8);
    const gravityConstant = 6.67e-11;
    const velocityDamping = THREE.uniform(0.1);
    const scale = THREE.uniform(0.008);
    const boundHalfExtent = THREE.uniform(8);
    const colorA = THREE.uniform(THREE.color("#5900ff"));
    const colorB = THREE.uniform(THREE.color("#ffa575"));

    const positionBuffer = THREE.storage(
      new THREE.StorageInstancedBufferAttribute(count, 3),
      "vec3",
      count
    );
    const velocityBuffer = THREE.storage(
      new THREE.StorageInstancedBufferAttribute(count, 3),
      "vec3",
      count
    );

    const sphericalToVec3 = THREE.Fn(([phi, theta]) => {
      const sinPhiRadius = THREE.sin(phi);

      return THREE.vec3(
        sinPhiRadius.mul(THREE.sin(theta)),
        THREE.cos(phi),
        sinPhiRadius.mul(THREE.cos(theta))
      );
    });

    // init compute

    const init = THREE.Fn(() => {
      const position = positionBuffer.element(THREE.instanceIndex);
      const velocity = velocityBuffer.element(THREE.instanceIndex);

      const basePosition = THREE.vec3(
        THREE.hash(
          THREE.instanceIndex.add(THREE.uint(Math.random() * 0xffffff))
        ),
        THREE.hash(
          THREE.instanceIndex.add(THREE.uint(Math.random() * 0xffffff))
        ),
        THREE.hash(
          THREE.instanceIndex.add(THREE.uint(Math.random() * 0xffffff))
        )
      )
        .sub(0.5)
        .mul(THREE.vec3(5, 0.2, 5));
      position.assign(basePosition);

      const phi = THREE.hash(
        THREE.instanceIndex.add(THREE.uint(Math.random() * 0xffffff))
      )
        .mul(THREE.PI)
        .mul(2);
      const theta = THREE.hash(
        THREE.instanceIndex.add(THREE.uint(Math.random() * 0xffffff))
      ).mul(THREE.PI);
      const baseVelocity = sphericalToVec3(phi, theta).mul(0.05);
      velocity.assign(baseVelocity);
    });

    const initCompute = init().compute(count);

    const reset = () => {
      this.renderer.computeAsync(initCompute);
    };

    reset();

    // update compute

    const particleMassMultiplier = THREE.hash(
      THREE.instanceIndex.add(THREE.uint(Math.random() * 0xffffff))
    )
      .remap(0.25, 1)
      .toVar();

    const particleMass = particleMassMultiplier.mul(particleGlobalMass).toVar();

    const update = THREE.Fn(() => {
      const delta = THREE.float(1 / 60)
        .mul(timeScale)
        .toVar();
      const position = positionBuffer.element(THREE.instanceIndex);
      const velocity = velocityBuffer.element(THREE.instanceIndex);

      // force
      const force = THREE.vec3(0).toVar();

      THREE.Loop(attractorsLength, ({ i }) => {
        const attractorPosition = attractorsPositions.element(i);
        const attractorRotationAxis = attractorsRotationAxes.element(i);
        const toAttractor = attractorPosition.sub(position);
        const distance = toAttractor.length();
        const direction = toAttractor.normalize();

        // gravity
        const gravityStrength = attractorMass
          .mul(particleMass)
          .mul(gravityConstant)
          .div(distance.pow(2))
          .toVar();
        const gravityForce = direction.mul(gravityStrength);
        force.addAssign(gravityForce);

        // spinning
        const spinningForce = attractorRotationAxis
          .mul(gravityStrength)
          .mul(spinningStrength);
        const spinningVelocity = spinningForce.cross(toAttractor);
        force.addAssign(spinningVelocity);
      });

      // velocity
      velocity.addAssign(force.mul(delta));
      const speed = velocity.length();
      THREE.If(speed.greaterThan(maxSpeed), () => {
        velocity.assign(velocity.normalize().mul(maxSpeed));
      });
      velocity.mulAssign(velocityDamping.oneMinus());

      // position
      position.addAssign(velocity.mul(delta));

      // box loop
      const halfHalfExtent = boundHalfExtent.div(2).toVar();
      position.assign(
        THREE.mod(position.add(halfHalfExtent), boundHalfExtent).sub(
          halfHalfExtent
        )
      );
    });
    this.updateCompute = update().compute(count);

    // nodes
    material.positionNode = positionBuffer.toAttribute();
    material.colorNode = THREE.Fn(() => {
      const velocity = velocityBuffer.toAttribute();
      const speed = velocity.length();
      const colorMix = speed.div(maxSpeed);
      const finalColor = THREE.mix(colorA, colorB, colorMix);

      return THREE.vec4(finalColor, 1);
    })();

    material.scaleNode = particleMassMultiplier.mul(scale);

    const geometry = new THREE.PlaneGeometry(1, 1);
    const mesh = new THREE.InstancedMesh(geometry, material, count);
    this.scene.add(mesh);
  }

  update() {
    if (this.updateCompute) {
      this.renderer.compute(this.updateCompute);
    }
  }
}
