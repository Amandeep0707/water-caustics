/**
 * Supported Types = [
 *  gltfModel,
 *  texture,
 *  cubeTexture,
 *  environmentTexture,
 *  font
 * ]
 */

export default [
  {
    name: "environmentMapTexture",
    type: "environmentTexture",
    path: "textures/environments/lighting.hdr",
  },
  {
    name: "poolMesh",
    type: "gltfModel",
    path: "models/PoolMesh.glb",
  },
  {
    name: "iceColor",
    type: "texture",
    path: "textures/Ice/iceColor.jpg",
  },
  {
    name: "concreteColor",
    type: "texture",
    path: "textures/Ice/concreteColor.jpg",
  },
  {
    name: "iceRoughness",
    type: "texture",
    path: "textures/Ice/iceRoughness.jpg",
  },
  {
    name: "iceNormal",
    type: "texture",
    path: "textures/Ice/iceNormal.jpg",
  },
  {
    name: "iceHeight",
    type: "texture",
    path: "textures/Ice/iceDisplacement.jpg",
  },
];
