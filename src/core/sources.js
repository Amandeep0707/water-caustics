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
    name: "ring",
    type: "gltfModel",
    path: "models/ring.glb",
  },
  {
    name: "asciiTexture",
    type: "texture",
    path: "textures/fillASCII.png",
  },
];
