uniform float uTime;

attribute vec3 aOriginalPos;
attribute float aSize;
attribute float aHealth;

varying float vHealth;
varying vec3 vOriginalPos;
varying vec3 vCurrentPos;

void main() {

  vOriginalPos = aOriginalPos;
  vCurrentPos = position;
  vHealth = aHealth;

  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0 );

  gl_PointSize = aSize * ( 300.0 / -mvPosition.z );
  gl_Position = projectionMatrix * mvPosition;
}