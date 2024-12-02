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
    name: "damagedHelmet",
    type: "gltfModel",
    path: "models/DamagedHelmet.glb",
  },
  {
    name: "testTexture",
    type: "texture",
    path: "textures/testImage.png",
  },
];
