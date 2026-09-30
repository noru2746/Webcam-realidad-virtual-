import * as THREE from 'three';
import { ShapeType } from '../types';

export interface GeneratedBufferData {
  positions: Float32Array;
  colors: Float32Array;
}

// Helper to generate normalized random variations
function randFloat(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

// 1. Heart 3D (Corazón paramétrico volumétrico)
function generateHeart(count: number): GeneratedBufferData {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const tempColor = new THREE.Color();

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    // Parameter t along the heart contour
    const t = Math.PI * 2 * Math.random();
    // Radial jitter for volume
    const r = Math.pow(Math.random(), 0.45);

    // Parametric heart formula
    const x = 16 * Math.pow(Math.sin(t), 3) * r * 0.22;
    const y =
      (13 * Math.cos(t) -
        5 * Math.cos(2 * t) -
        2 * Math.cos(3 * t) -
        Math.cos(4 * t)) *
      r *
      0.22;

    // 3D thickness with taper at top and bottom
    const zSpan = (1.0 - Math.abs(y) * 0.25) * 1.8;
    const z = (Math.random() - 0.5) * zSpan * r;

    // Subtle noise offset
    positions[i3] = x + (Math.random() - 0.5) * 0.1;
    positions[i3 + 1] = y + (Math.random() - 0.5) * 0.1;
    positions[i3 + 2] = z + (Math.random() - 0.5) * 0.1;

    // Ruby / Crimson / Violet gradient based on depth & height
    const hue = 0.94 + 0.12 * ((y + 3) / 6) + (Math.random() - 0.5) * 0.05;
    const lightness = 0.45 + 0.35 * (1.0 - Math.abs(z) / 2.0);
    tempColor.setHSL(hue % 1.0, 0.95, lightness);

    colors[i3] = tempColor.r;
    colors[i3 + 1] = tempColor.g;
    colors[i3 + 2] = tempColor.b;
  }

  return { positions, colors };
}

// 2. Spiral / Lotus Flower (Espiral / Flor de loto en 3D)
function generateFlowerSpiral(count: number): GeneratedBufferData {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const tempColor = new THREE.Color();

  const goldenAngle = 137.50776405 * (Math.PI / 180);
  const numPetals = 8;

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const norm = i / count;
    const r = Math.sqrt(norm) * 3.8;
    const theta = i * goldenAngle;

    // Petal curve function
    const petalWarp = Math.sin(theta * numPetals) * 0.35 * Math.min(r, 2.5);
    const zCurve =
      Math.sin(r * 1.8) * 0.75 * (1.0 - norm * 0.4) +
      Math.pow(r * 0.28, 2.2) * 0.4 +
      petalWarp * 0.4;

    const x = Math.cos(theta) * (r + petalWarp * 0.4);
    const y = Math.sin(theta) * (r + petalWarp * 0.4);
    const z = zCurve + (Math.random() - 0.5) * 0.15;

    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z - 0.5;

    // Golden / Emerald / Magenta floral gradient
    const hue = 0.8 + norm * 0.35 + Math.sin(theta) * 0.05;
    const saturation = 0.85 + 0.15 * Math.sin(r);
    const lightness = 0.5 + 0.3 * (1.0 - norm * 0.6);
    tempColor.setHSL(hue % 1.0, saturation, lightness);

    colors[i3] = tempColor.r;
    colors[i3 + 1] = tempColor.g;
    colors[i3 + 2] = tempColor.b;
  }

  return { positions, colors };
}

// 3. Saturn with rings (Saturno con esfera y anillos concéntricos)
function generateSaturn(count: number): GeneratedBufferData {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const tempColor = new THREE.Color();

  const sphereCount = Math.floor(count * 0.42);
  const ringCount = count - sphereCount;

  // Planet sphere
  for (let i = 0; i < sphereCount; i++) {
    const i3 = i * 3;
    // Uniform sphere surface + slight mantle volume
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const radius = 2.1 * (0.92 + 0.08 * Math.random());

    // Saturn polar flattening
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi) * 0.88; // oblate spheroid
    const z = radius * Math.sin(phi) * Math.sin(theta);

    // Tilt the entire system by 26.7 degrees like real Saturn
    const tilt = 0.46; // radians
    const rotY = y * Math.cos(tilt) - z * Math.sin(tilt);
    const rotZ = y * Math.sin(tilt) + z * Math.cos(tilt);

    positions[i3] = x;
    positions[i3 + 1] = rotY;
    positions[i3 + 2] = rotZ;

    // Gas giant atmospheric bands
    const band = Math.sin(y * 8.0) * 0.06;
    const hue = 0.1 + band + 0.02 * (Math.random() - 0.5); // Golden amber
    tempColor.setHSL(hue, 0.85, 0.55 + band * 0.5);

    colors[i3] = tempColor.r;
    colors[i3 + 1] = tempColor.g;
    colors[i3 + 2] = tempColor.b;
  }

  // Rings with Cassini division
  const innerR = 2.9;
  const outerR = 6.4;
  const cassiniMin = 4.3;
  const cassiniMax = 4.65;

  for (let i = 0; i < ringCount; i++) {
    const i3 = (sphereCount + i) * 3;
    let r = innerR + Math.random() * (outerR - innerR);

    // Cassini Division gap probability rejection
    if (r > cassiniMin && r < cassiniMax && Math.random() > 0.12) {
      r = Math.random() > 0.5 ? innerR + Math.random() * (cassiniMin - innerR) : cassiniMax + Math.random() * (outerR - cassiniMax);
    }

    const angle = Math.random() * Math.PI * 2;
    const ringThickness = (Math.random() - 0.5) * 0.08;

    const rx = Math.cos(angle) * r;
    const ry = ringThickness;
    const rz = Math.sin(angle) * r;

    // Apply Saturn tilt
    const tilt = 0.46;
    const rotY = ry * Math.cos(tilt) - rz * Math.sin(tilt);
    const rotZ = ry * Math.sin(tilt) + rz * Math.cos(tilt);

    positions[i3] = rx;
    positions[i3 + 1] = rotY;
    positions[i3 + 2] = rotZ;

    // Ring brightness rings and icy blue-amber tones
    const normR = (r - innerR) / (outerR - innerR);
    const ringHue = normR > 0.5 ? 0.55 : 0.12; // icy cyan outer, amber inner
    tempColor.setHSL(ringHue, 0.75, 0.45 + 0.3 * Math.sin(normR * Math.PI * 12.0));

    colors[i3] = tempColor.r;
    colors[i3 + 1] = tempColor.g;
    colors[i3 + 2] = tempColor.b;
  }

  return { positions, colors };
}

// 4. Buddha Statue in meditation (Estatua de Buda meditando)
function generateBuddha(count: number): GeneratedBufferData {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const tempColor = new THREE.Color();

  // Allocation of Buddha parts:
  // 1. Lotus Throne base: 28%
  // 2. Meditating folded legs & hips: 24%
  // 3. Torso & Arms in Dhyana Mudra: 22%
  // 4. Head & Ushnisha: 14%
  // 5. Halo / Aura disc: 12%

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const p = Math.random();

    let x = 0;
    let y = 0;
    let z = 0;
    let partHue = 0.12; // Celestial gold default

    if (p < 0.28) {
      // 1. Lotus base (tiered disc petals)
      const u = Math.random();
      const r = 1.2 + 2.0 * Math.sqrt(u);
      const angle = Math.random() * Math.PI * 2;
      const petalBump = Math.sin(angle * 12) * 0.25;
      x = Math.cos(angle) * (r + petalBump);
      z = Math.sin(angle) * (r + petalBump) * 0.78;
      y = -2.4 + (Math.random() - 0.5) * 0.45;
      partHue = 0.08; // deep bronze/gold base
    } else if (p < 0.52) {
      // 2. Folded knees in lotus pose
      const side = Math.random() > 0.5 ? 1 : -1;
      const legProgress = Math.random();
      const kneeX = side * (1.8 - legProgress * 0.6);
      const kneeY = -1.8 + Math.sin(legProgress * Math.PI) * 0.5;
      const kneeZ = Math.cos(legProgress * Math.PI) * 0.85;

      const jitter = 0.4;
      x = kneeX + (Math.random() - 0.5) * jitter;
      y = kneeY + (Math.random() - 0.5) * jitter;
      z = kneeZ + (Math.random() - 0.5) * jitter;
      partHue = 0.11;
    } else if (p < 0.74) {
      // 3. Upright meditative torso & arms resting in lap
      const heightFrac = Math.random(); // 0 to 1
      const torsoY = -1.2 + heightFrac * 2.0;
      const width = (1.4 - heightFrac * 0.4) * (0.8 + 0.2 * Math.random());
      const angle = Math.random() * Math.PI * 2;

      x = Math.cos(angle) * width * 0.8;
      z = Math.sin(angle) * width * 0.55;
      y = torsoY;

      // Lap hands (Dhyana mudra)
      if (Math.random() < 0.25) {
        x = (Math.random() - 0.5) * 0.8;
        y = -1.3 + (Math.random() - 0.5) * 0.3;
        z = 0.65 + (Math.random() - 0.5) * 0.3;
      }
      partHue = 0.13;
    } else if (p < 0.88) {
      // 4. Head and Ushnisha topknot
      const isTopKnot = Math.random() < 0.22;
      if (isTopKnot) {
        const rad = 0.4 * Math.random();
        const a = Math.random() * Math.PI * 2;
        x = Math.cos(a) * rad;
        z = Math.sin(a) * rad;
        y = 1.7 + Math.random() * 0.45;
      } else {
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const rad = 0.72;
        x = rad * Math.sin(phi) * Math.cos(theta);
        y = 1.1 + rad * Math.cos(phi) * 1.15;
        z = rad * Math.sin(phi) * Math.sin(theta);
      }
      partHue = 0.14; // brighter golden enlightenment
    } else {
      // 5. Radiant halo disk behind head
      const haloR = 1.1 + Math.random() * 1.6;
      const haloAngle = Math.random() * Math.PI * 2;
      x = Math.cos(haloAngle) * haloR;
      y = 1.3 + Math.sin(haloAngle) * haloR;
      z = -0.65 + (Math.random() - 0.5) * 0.15;
      partHue = 0.16 + (haloR / 2.7) * 0.08; // radiant aureole
    }

    positions[i3] = x;
    positions[i3 + 1] = y + 0.3; // balance center of mass
    positions[i3 + 2] = z;

    tempColor.setHSL(partHue, 0.9, 0.52 + 0.25 * ((y + 2.5) / 5.0));
    colors[i3] = tempColor.r;
    colors[i3 + 1] = tempColor.g;
    colors[i3 + 2] = tempColor.b;
  }

  return { positions, colors };
}

// 5. Fireworks / Cosmic Burst (Fuegos artificiales esféricos con estelas)
function generateFireworks(count: number): GeneratedBufferData {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const tempColor = new THREE.Color();

  const numStreams = 48; // radial emission rays
  const particlesPerStream = Math.floor((count * 0.65) / numStreams);
  const coreParticles = count - numStreams * particlesPerStream;

  // 1. Concentric shockwave explosion core
  for (let i = 0; i < coreParticles; i++) {
    const i3 = i * 3;
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);

    // Multi-shell blast waves
    const shell = Math.floor(Math.random() * 3) + 1;
    const radius = shell * 1.1 + (Math.random() - 0.5) * 0.3;

    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.cos(phi) - 0.2;
    positions[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

    tempColor.setHSL(0.05 + 0.85 * Math.random(), 0.95, 0.7);
    colors[i3] = tempColor.r;
    colors[i3 + 1] = tempColor.g;
    colors[i3 + 2] = tempColor.b;
  }

  // 2. Trailing stream cascades
  let idx = coreParticles * 3;
  for (let s = 0; s < numStreams; s++) {
    // Random emission angle for this streamer
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);

    const dirX = Math.sin(phi) * Math.cos(theta);
    const dirY = Math.cos(phi);
    const dirZ = Math.sin(phi) * Math.sin(theta);
    const streamHue = Math.random();

    for (let p = 0; p < particlesPerStream; p++) {
      const frac = p / particlesPerStream;
      const speed = 1.5 + 2.5 * Math.pow(frac, 1.2);
      const gravity = Math.pow(frac, 2.0) * 0.9; // downwards curvature

      positions[idx] = dirX * speed + (Math.random() - 0.5) * 0.15;
      positions[idx + 1] = dirY * speed - gravity + (Math.random() - 0.5) * 0.15;
      positions[idx + 2] = dirZ * speed + (Math.random() - 0.5) * 0.15;

      tempColor.setHSL((streamHue + frac * 0.1) % 1.0, 0.95, 0.8 - frac * 0.45);
      colors[idx] = tempColor.r;
      colors[idx + 1] = tempColor.g;
      colors[idx + 2] = tempColor.b;

      idx += 3;
    }
  }

  return { positions, colors };
}

// 6. Galaxy Spiral (Galaxia Espiral de 2 brazos con núcleo luminoso)
function generateGalaxy(count: number): GeneratedBufferData {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const tempColor = new THREE.Color();

  const arms = 2;
  const maxRadius = 4.2;

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    // Radial distribution concentrated toward galactic core
    const r = Math.pow(Math.random(), 2.0) * maxRadius;
    const armAngle = ((i % arms) * 2 * Math.PI) / arms;
    const spiralAngle = r * 1.6;
    const angle = armAngle + spiralAngle;

    // Scatter increases with radius
    const scatter = Math.pow(r / maxRadius, 1.5) * 0.55;
    const x = Math.cos(angle) * r + randFloat(-scatter, scatter);
    const z = Math.sin(angle) * r + randFloat(-scatter, scatter);

    // Galactic disk vertical thickness
    const diskThickness = Math.max(0.12, (1.0 - r / maxRadius) * 0.7);
    const y = randFloat(-diskThickness, diskThickness) * 0.5;

    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;

    // Core is brilliant amber/white, outer arms are deep electric cyan / purple
    const normR = r / maxRadius;
    if (normR < 0.25) {
      tempColor.setHSL(0.12, 0.95, 0.85); // Core
    } else {
      tempColor.setHSL(0.58 + normR * 0.35, 0.9, 0.55); // Spiral arms
    }

    colors[i3] = tempColor.r;
    colors[i3 + 1] = tempColor.g;
    colors[i3 + 2] = tempColor.b;
  }

  return { positions, colors };
}

// Main generator dispatching by shape type
export function generateParticleData(shape: ShapeType, count: number): GeneratedBufferData {
  switch (shape) {
    case 'heart':
      return generateHeart(count);
    case 'flower':
      return generateFlowerSpiral(count);
    case 'saturn':
      return generateSaturn(count);
    case 'buddha':
      return generateBuddha(count);
    case 'fireworks':
      return generateFireworks(count);
    case 'galaxy':
    default:
      return generateGalaxy(count);
  }
}

// Generator for random attributes
export function generateParticleAttributes(count: number): {
  randoms: Float32Array;
  sizes: Float32Array;
} {
  const randoms = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    randoms[i3] = Math.random() * 2.0 - 1.0;
    randoms[i3 + 1] = Math.random() * 2.0 - 1.0;
    randoms[i3 + 2] = Math.random() * 2.0 - 1.0;

    sizes[i] = 0.5 + Math.random() * 0.9;
  }

  return { randoms, sizes };
}
