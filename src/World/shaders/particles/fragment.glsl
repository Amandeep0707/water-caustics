uniform sampler2D pointTexture;
uniform vec3 uPrimaryColor;
uniform vec3 uSecondaryColor;
uniform vec3 uMouse;

varying vec3 vOriginalPos;
varying vec3 vCurrentPos;
varying float vHealth;

void main() {

  vec3 finalColor = mix(uSecondaryColor, uPrimaryColor, clamp(vHealth, 0.0, 1.0));

  vec3 distanceFalloff = mix(finalColor, finalColor * 0.5, (distance(vCurrentPos, uMouse) * 0.008));

  gl_FragColor = vec4(distanceFalloff, 1.0 );
  gl_FragColor *= texture2D( pointTexture, gl_PointCoord );
}