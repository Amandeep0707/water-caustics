import * as THREE from "three/webgpu";
import RAPIER from "https://cdn.skypack.dev/pin/@dimforge/rapier3d-compat@v0.14.0-9fFno0Co5H1pOBbDcBZz/mode=imports/optimized/@dimforge/rapier3d-compat.js";
import Experience from "./Experience";
import EventEmitter from "./Utils/EventEmitter";

// // Process for adding physical enitties to the world
// this.physics.addEntity(
//   {
//     type: "dynamic",  ** ['dyanmic', 'static', 'kinematic'] **
//     colliders: [{ shape: "cuboid", parameters: [0.5, 0.5, 0.5] }], ** Shape and size of physics Collidor **
//     position: { x: 0, y: 4, z: 0 }, ** Location of the Collidor **
//   },
//   visualGeometry ** Reference for the Visual Geometry to bind to **
// );

export class Physics extends EventEmitter {
  constructor() {
    super();
    this.experience = new Experience();
    this.useDebug = true;

    // Initialize entities map and key in the constructor
    this.entities = new Map();
    this.entitiesKey = 0;

    this.init();
  }

  async init() {
    this.physics = await RAPIER.init().then(() => {
      this.gravity = { x: 0.0, y: -9.81, z: 0.0 };
      this.world = new RAPIER.World(this.gravity);
      this.trigger("init");

      if (this.useDebug) this.debugPhysics = new DebugPhysics();

      if (this.experience.debug.active) {
        const physicsFolder = this.experience.debug.ui.addFolder({
          title: "Physics",
          expanded: false,
        });
        physicsFolder.addBinding({ gravity: this.gravity }, "gravity", {
          label: "Gravity",
        });
        physicsFolder
          .addButton({
            title: "Toggle Debug",
          })
          .on("click", () => {
            if (this.debugPhysics) {
              this.debugPhysics.experience.off("tick");
              this.experience.scene.remove(this.debugPhysics.lineSegments);
              this.debugPhysics.destroy();
              this.debugPhysics = null;
            } else {
              this.debugPhysics = new DebugPhysics();
            }
          });
      }
    });

    this.experience.on("tick", () => {
      this.update();
    });
  }

  getPhysical(_physicalDescription) {
    if (!_physicalDescription) return null;

    // Create rigid body description based on type
    let rigidBodyDesc;
    switch (_physicalDescription.type) {
      case "dynamic":
        rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic();
        break;
      case "static":
        rigidBodyDesc = RAPIER.RigidBodyDesc.fixed();
        break;
      case "kinematic":
        rigidBodyDesc = RAPIER.RigidBodyDesc.kinematicVelocityBased();
        break;
      default:
        rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic(); // Default to dynamic
    }

    // Set initial position if provided
    if (_physicalDescription.position) {
      rigidBodyDesc.setTranslation(
        _physicalDescription.position.x,
        _physicalDescription.position.y,
        _physicalDescription.position.z
      );
    }
    if (_physicalDescription.rotation) {
      rigidBodyDesc.setRotation(
        _physicalDescription.rotation.x,
        _physicalDescription.rotation.y,
        _physicalDescription.rotation.z
      );
    }

    // Create the rigid body
    const body = this.world.createRigidBody(rigidBodyDesc);

    // Create colliders if specified
    if (_physicalDescription.colliders) {
      _physicalDescription.colliders.forEach((collider) => {
        let colliderDesc;
        switch (collider.shape) {
          case "cuboid":
            colliderDesc = RAPIER.ColliderDesc.cuboid(...collider.parameters);
            break;
          case "sphere":
            colliderDesc = RAPIER.ColliderDesc.ball(collider.parameters[0]);
            break;
          default:
            console.warn("Unknown collider shape");
            return;
        }
        this.world.createCollider(colliderDesc, body);
      });
    }

    return { body };
  }

  addEntity(_physicalDescription = null, _visual = null) {
    const entity = {
      physical: this.getPhysical(_physicalDescription),
      visual: _visual,
    };

    // Increment the key and set the entity
    this.entitiesKey++;
    this.entities.set(this.entitiesKey, entity);

    return entity;
  }

  update() {
    if (this.world) {
      this.world.step();

      if (this.entities) {
        this.entities.forEach((_entity) => {
          if (_entity.visual) {
            _entity.visual.position.copy(_entity.physical.body.translation());
            _entity.visual.quaternion.copy(_entity.physical.body.rotation());
          }
        });
      }
    }
  }
}

export class DebugPhysics {
  constructor() {
    this.experience = new Experience();
    this.init();
  }

  init() {
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute([], 3)
    );
    this.geometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute([], 4)
    );

    this.material = new THREE.LineBasicNodeMaterial({ vertexColors: true });

    this.lineSegments = new THREE.LineSegments(this.geometry, this.material);

    this.experience.scene.add(this.lineSegments);

    this.experience.on("tick", () => {
      this.update();
    });
  }

  update() {
    if (this.geometry && this.experience.physics.world) {
      const { vertices, colors } = this.experience.physics.world.debugRender();

      this.geometry.attributes.position.array = vertices;
      this.geometry.attributes.position.count = vertices.length / 3;
      this.geometry.attributes.position.needsUpdate = true;

      this.geometry.attributes.color.array = colors;
      this.geometry.attributes.color.count = colors.length / 4;
      this.geometry.attributes.color.needsUpdate = true;
    }
  }

  destroy() {
    if (this.lineSegments) {
      this.material.dispose();
      this.geometry.dispose();
    }
  }
}
