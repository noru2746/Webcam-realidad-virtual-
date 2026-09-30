import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ShapeType, SimulationConfig, GestureState } from '../types';
import { particleVertexShader, particleFragmentShader } from '../shaders/particleShaders';
import { generateParticleData, generateParticleAttributes } from '../utils/geometryGenerator';

interface ParticleSceneProps {
  config: SimulationConfig;
  gestureState: GestureState;
  onFPSUpdate?: (fps: number) => void;
  onSceneReady?: () => void;
  onTriggerDispersion?: () => void;
}

export const ParticleScene: React.FC<ParticleSceneProps> = ({
  config,
  gestureState,
  onFPSUpdate,
  onSceneReady,
  onTriggerDispersion,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const geometryRef = useRef<THREE.BufferGeometry | null>(null);

  // Animation & morphing state
  const currentShapeRef = useRef<ShapeType>(config.shape);
  const targetShapeRef = useRef<ShapeType>(config.shape);
  const isMorphingRef = useRef(false);
  const morphProgressRef = useRef(0);
  const dispersionDecayRef = useRef(0);

  // Mouse / Touch orbit interaction
  const isDraggingRef = useRef(false);
  const previousPointerPosRef = useRef({ x: 0, y: 0 });
  const rotationVelocityRef = useRef({ x: 0, y: 0 });
  const objectRotationRef = useRef({ x: 0.15, y: 0 });
  const targetZoomRef = useRef(11.5);
  const currentZoomRef = useRef(11.5);

  // Performance tracking
  const frameCountRef = useRef(0);
  const lastFpsTimeRef = useRef(performance.now());

  // Store latest props in refs to avoid recreating the Three.js loop
  const configRef = useRef(config);
  configRef.current = config;

  const gestureRef = useRef(gestureState);
  gestureRef.current = gestureState;

  // Trigger dispersion shockwave externally
  useEffect(() => {
    if (config.dispersion > 0) {
      dispersionDecayRef.current = Math.max(dispersionDecayRef.current, config.dispersion);
    }
  }, [config.dispersion]);

  // Handle shape change and trigger GPU morphing
  useEffect(() => {
    if (config.shape !== currentShapeRef.current) {
      const geometry = geometryRef.current;
      if (!geometry) return;

      const targetData = generateParticleData(config.shape, config.particleCount);

      // Set target buffer attributes
      geometry.setAttribute(
        'aTargetPosition',
        new THREE.BufferAttribute(targetData.positions, 3)
      );
      geometry.setAttribute(
        'aTargetColor',
        new THREE.BufferAttribute(targetData.colors, 3)
      );

      targetShapeRef.current = config.shape;
      isMorphingRef.current = true;
      morphProgressRef.current = 0;
    }
  }, [config.shape, config.particleCount]);

  // Main Three.js Lifecycle
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020205, 0.025);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, currentZoomRef.current);
    cameraRef.current = camera;

    // 2. WebGL Renderer with performance flags
    const renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: true,
      alpha: true,
      stencil: false,
      depth: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x010206, 1);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Initialize Particle System Geometry & Material
    const count = configRef.current.particleCount;
    const geometry = new THREE.BufferGeometry();
    geometryRef.current = geometry;

    const initialData = generateParticleData(configRef.current.shape, count);
    const { randoms, sizes } = generateParticleAttributes(count);

    geometry.setAttribute('position', new THREE.BufferAttribute(initialData.positions, 3));
    geometry.setAttribute('aTargetPosition', new THREE.BufferAttribute(new Float32Array(initialData.positions), 3));
    geometry.setAttribute('aColor', new THREE.BufferAttribute(initialData.colors, 3));
    geometry.setAttribute('aTargetColor', new THREE.BufferAttribute(new Float32Array(initialData.colors), 3));
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    // Colors
    const colorA = new THREE.Color(configRef.current.colorA);
    const colorB = new THREE.Color(configRef.current.colorB);

    const material = new THREE.ShaderMaterial({
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uMorphProgress: { value: 0 },
        uDispersion: { value: 0 },
        uTurbulence: { value: configRef.current.turbulence },
        uScale: { value: configRef.current.scale },
        uPointSize: { value: configRef.current.pointSize },
        uHandAttractor: { value: new THREE.Vector3(0, 0, 0) },
        uHandAttractorStrength: { value: 0 },
        uColorA: { value: colorA },
        uColorB: { value: colorB },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    materialRef.current = material;

    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    scene.add(points);
    pointsRef.current = points;

    currentShapeRef.current = configRef.current.shape;
    targetShapeRef.current = configRef.current.shape;

    // 4. Subtle Ambient Starfield / Dust
    const starCount = 1200;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 50;
      starPos[i + 1] = (Math.random() - 0.5) * 50;
      starPos[i + 2] = (Math.random() - 0.5) * 40 - 10;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      size: 1.2,
      color: 0x4a6491,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    onSceneReady?.();

    // 5. Animation Render Loop (Target 60 FPS)
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const renderLoop = () => {
      animationFrameId = requestAnimationFrame(renderLoop);

      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsedTime = clock.getElapsedTime();

      // FPS Calculation
      frameCountRef.current++;
      const now = performance.now();
      if (now - lastFpsTimeRef.current >= 1000) {
        const measuredFps = Math.round((frameCountRef.current * 1000) / (now - lastFpsTimeRef.current));
        onFPSUpdate?.(measuredFps);
        frameCountRef.current = 0;
        lastFpsTimeRef.current = now;
      }

      // Smooth Morphing interpolation
      if (isMorphingRef.current) {
        morphProgressRef.current += delta * 1.25; // ~0.8s transition
        if (morphProgressRef.current >= 1.0) {
          morphProgressRef.current = 1.0;
          isMorphingRef.current = false;
          currentShapeRef.current = targetShapeRef.current;

          // Swap target position into source position attribute for continuous morphing
          const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute;
          const targetPosAttr = geometry.getAttribute('aTargetPosition') as THREE.BufferAttribute;
          const colorAttr = geometry.getAttribute('aColor') as THREE.BufferAttribute;
          const targetColorAttr = geometry.getAttribute('aTargetColor') as THREE.BufferAttribute;

          if (posAttr && targetPosAttr && colorAttr && targetColorAttr) {
            posAttr.copy(targetPosAttr);
            colorAttr.copy(targetColorAttr);
            posAttr.needsUpdate = true;
            colorAttr.needsUpdate = true;
          }
          morphProgressRef.current = 0;
        }
      }

      // Smooth dispersion decay
      if (dispersionDecayRef.current > 0.001) {
        dispersionDecayRef.current *= Math.pow(0.04, delta); // exponential damping
      } else {
        dispersionDecayRef.current = 0;
      }

      // Gesture mapping values
      const currentGesture = gestureRef.current;
      const currentConf = configRef.current;

      // Dynamic scale & turbulence modulated by hand tension
      let dynamicScale = currentConf.scale;
      let dynamicTurbulence = currentConf.turbulence;
      let attractorStrength = 0;

      if (currentGesture.handsDetected > 0) {
        // Tensión / Apertura mapping: expands scale and turbulence
        dynamicScale = currentConf.scale * (0.65 + currentGesture.tension * 0.85);
        dynamicTurbulence = currentConf.turbulence * (0.7 + currentGesture.tension * 1.1);

        if (currentGesture.isFist) {
          // Fist condenses particles into core
          dynamicScale *= 0.55;
          attractorStrength = 4.5;
        } else if (currentConf.handAttraction) {
          attractorStrength = 2.0;
        }
      }

      // Update shader uniforms
      material.uniforms.uTime.value = elapsedTime * currentConf.speed;
      material.uniforms.uMorphProgress.value = morphProgressRef.current;
      material.uniforms.uDispersion.value = dispersionDecayRef.current;
      material.uniforms.uTurbulence.value = dynamicTurbulence;
      material.uniforms.uScale.value = dynamicScale;
      material.uniforms.uPointSize.value = currentConf.pointSize;
      material.uniforms.uColorA.value.set(currentConf.colorA);
      material.uniforms.uColorB.value.set(currentConf.colorB);

      // Hand attractor 3D coordinate
      if (currentGesture.handsDetected > 0) {
        material.uniforms.uHandAttractor.value.set(
          currentGesture.handCenter.x * 5.0,
          currentGesture.handCenter.y * 4.0,
          currentGesture.handCenter.z * 3.0
        );
        material.uniforms.uHandAttractorStrength.value = attractorStrength;
      } else {
        material.uniforms.uHandAttractorStrength.value = 0;
      }

      // Model rotation & Inertial damping
      if (currentConf.autoRotate) {
        objectRotationRef.current.y += currentConf.rotationSpeed * delta;
      }

      // Add user drag momentum
      if (!isDraggingRef.current) {
        objectRotationRef.current.x += rotationVelocityRef.current.x;
        objectRotationRef.current.y += rotationVelocityRef.current.y;
        rotationVelocityRef.current.x *= 0.92;
        rotationVelocityRef.current.y *= 0.92;
      }

      // Subtle hand tilt when tracking hand
      if (currentGesture.handsDetected > 0 && !isDraggingRef.current) {
        objectRotationRef.current.y += currentGesture.handCenter.x * delta * 0.8;
        objectRotationRef.current.x = THREE.MathUtils.lerp(
          objectRotationRef.current.x,
          currentGesture.handCenter.y * 0.45,
          delta * 2.0
        );
      }

      points.rotation.x = objectRotationRef.current.x;
      points.rotation.y = objectRotationRef.current.y;

      // Smooth camera zoom lerping
      currentZoomRef.current = THREE.MathUtils.lerp(
        currentZoomRef.current,
        targetZoomRef.current,
        delta * 5.0
      );
      camera.position.z = currentZoomRef.current;

      renderer.render(scene, camera);
    };

    renderLoop();

    // 6. Pointer & Touch Event Handlers
    const handlePointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      previousPointerPosRef.current = { x: e.clientX, y: e.clientY };
      rotationVelocityRef.current = { x: 0, y: 0 };
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousPointerPosRef.current.x;
      const deltaY = e.clientY - previousPointerPosRef.current.y;

      const rotSpeed = 0.006;
      objectRotationRef.current.y += deltaX * rotSpeed;
      objectRotationRef.current.x += deltaY * rotSpeed;

      rotationVelocityRef.current = {
        x: deltaY * rotSpeed * 0.4,
        y: deltaX * rotSpeed * 0.4,
      };

      previousPointerPosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetZoomRef.current = Math.max(5.0, Math.min(22.0, targetZoomRef.current + e.deltaY * 0.015));
    };

    const handleDoubleClick = () => {
      // Double click triggers dispersion wave (same as open palm)
      dispersionDecayRef.current = 1.4;
      onTriggerDispersion?.();
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    domElement.addEventListener('wheel', handleWheel, { passive: false });
    domElement.addEventListener('dblclick', handleDoubleClick);

    // 7. Window Resize
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      cameraRef.current.aspect = newW / newH;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    // 8. Explicit Resource Cleanup (Preventing VRAM & Memory Leaks)
    return () => {
      cancelAnimationFrame(animationFrameId);

      domElement.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      domElement.removeEventListener('wheel', handleWheel);
      domElement.removeEventListener('dblclick', handleDoubleClick);
      window.removeEventListener('resize', handleResize);

      // Memory cleaning
      geometry.dispose();
      material.dispose();
      starGeo.dispose();
      starMat.dispose();
      renderer.dispose();

      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }

      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
      geometryRef.current = null;
      materialRef.current = null;
      pointsRef.current = null;
    };
  }, [config.particleCount]); // Reinitialize buffers only when particle count changes

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-none select-none z-0"
    />
  );
};
