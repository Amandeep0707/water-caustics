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
    name: "asciiTexture",
    type: "texture",
    path: "textures/fillASCII.png",
  },
];
