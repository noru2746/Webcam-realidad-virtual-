export const particleVertexShader = `
uniform float uTime;
uniform float uMorphProgress;
uniform float uDispersion;
uniform float uTurbulence;
uniform float uScale;
uniform float uPointSize;
uniform vec3 uHandAttractor;
uniform float uHandAttractorStrength;
uniform vec3 uColorA;
uniform vec3 uColorB;

attribute vec3 aTargetPosition;
attribute vec3 aRandom;
attribute float aSize;
attribute vec3 aColor;
attribute vec3 aTargetColor;

varying vec3 vColor;
varying float vAlpha;
varying float vDist;

// Classic Perlin / Simplex 3D Noise by Ashima Arts & Stefan Gustavson
vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  // First corner
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  // Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

  // Permutations
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  // Gradients
  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  // Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  // Mix contributions
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

// 3D Curl Noise approximation for fluid-like streamlines
vec3 curlNoise(vec3 p) {
  float e = 0.1;
  float n1 = snoise(vec3(p.x, p.y + e, p.z));
  float n2 = snoise(vec3(p.x, p.y - e, p.z));
  float n3 = snoise(vec3(p.x, p.y, p.z + e));
  float n4 = snoise(vec3(p.x, p.y, p.z - e));
  float n5 = snoise(vec3(p.x + e, p.y, p.z));
  float n6 = snoise(vec3(p.x - e, p.y, p.z));

  float x = (n1 - n2) - (n3 - n4);
  float y = (n3 - n4) - (n5 - n6);
  float z = (n5 - n6) - (n1 - n2);

  return normalize(vec3(x, y, z));
}

void main() {
  // 1. Direct GPU morphing between source position and target position
  float smoothProgress = smoothstep(0.0, 1.0, uMorphProgress);
  vec3 basePos = mix(position, aTargetPosition, smoothProgress);

  // Interpolate vertex colors
  vec3 mixedColor = mix(aColor, aTargetColor, smoothProgress);

  // Blend with global theme uniforms
  float colorMix = clamp((basePos.y + 3.0) / 6.0, 0.0, 1.0);
  vec3 themeColor = mix(uColorA, uColorB, colorMix);
  vColor = mix(mixedColor, themeColor, 0.45);

  // 2. Procedural fluid / wind turbulence via 3D noise
  vec3 noiseCoord = basePos * 0.35 + vec3(uTime * 0.18, uTime * 0.12, uTime * 0.15) + aRandom * 0.5;
  vec3 fluidForce = curlNoise(noiseCoord);
  float turbStrength = uTurbulence * (0.8 + aRandom.y * 0.6);
  vec3 displacedPos = basePos + fluidForce * turbStrength;

  // 3. Shockwave / Dispersion dynamics (triggered by open palm gesture)
  if (uDispersion > 0.001) {
    vec3 dispDir = normalize(basePos + aRandom * 1.5 + vec3(0.0001));
    float dispMag = uDispersion * (1.2 + aRandom.x * 2.8);
    displacedPos += dispDir * dispMag;
  }

  // 4. Hand attractor / Repulsor interaction in 3D
  if (uHandAttractorStrength != 0.0) {
    vec3 handOffset = uHandAttractor - displacedPos;
    float distToHand = length(handOffset) + 0.5;
    vec3 pullDir = normalize(handOffset);
    // Inverse square gravitational / magnetic falloff
    float pullForce = (uHandAttractorStrength / (distToHand * distToHand + 1.0)) * 2.5;
    displacedPos += pullDir * pullForce;
  }

  // 5. Global scale factor from hand openness / tension
  vec3 finalPos = displacedPos * uScale;

  // Camera projection
  vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // 6. Point size attenuation with distance and dynamic scale
  float depthDistance = -mvPosition.z;
  vDist = depthDistance;
  vAlpha = smoothstep(25.0, 2.0, depthDistance);

  gl_PointSize = uPointSize * (0.7 + aSize * 0.6) * (340.0 / max(depthDistance, 1.0)) * (0.85 + uScale * 0.15);
}
`;

export const particleFragmentShader = `
uniform float uTime;
varying vec3 vColor;
varying float vAlpha;
varying float vDist;

void main() {
  // Smooth radial circular particle profile (eliminating square point textures)
  vec2 coord = gl_PointCoord - vec2(0.5);
  float r = length(coord);

  if (r > 0.5) {
    discard;
  }

  // Soft luminous falloff: intense center core with ethereal perimeter
  float innerGlow = smoothstep(0.2, 0.0, r);
  float outerHalo = smoothstep(0.5, 0.05, r);

  float intensity = outerHalo * 0.75 + innerGlow * 0.95;

  // Slight chromatic brilliance
  vec3 finalColor = vColor + vec3(innerGlow * 0.5);

  gl_FragColor = vec4(finalColor, intensity * vAlpha);
}
`;
