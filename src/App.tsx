import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ParticleScene } from './components/ParticleScene';
import { TopBar } from './components/TopBar';
import { ControlPanel } from './components/ControlPanel';
import { WebcamFeed } from './components/WebcamFeed';
import { GestureGuideModal } from './components/GestureGuideModal';
import { ShapeType, SimulationConfig, GestureState } from './types';
import { handVisionService } from './services/handDetector';
import { Zap, HelpCircle, Check, Camera, MousePointer, Info } from 'lucide-react';

const SHAPE_SEQUENCE: ShapeType[] = ['saturn', 'heart', 'flower', 'buddha', 'fireworks', 'galaxy'];

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Simulation parameters state
  const [config, setConfig] = useState<SimulationConfig>({
    shape: 'saturn',
    particleCount: 50000,
    pointSize: 1.8,
    turbulence: 0.35,
    dispersion: 0.0,
    scale: 1.0,
    speed: 1.0,
    autoRotate: true,
    rotationSpeed: 0.3,
    handAttraction: true,
    colorA: '#06b6d4',
    colorB: '#8b5cf6',
    activePresetId: 'cyber-violet',
    showWebcamPIP: true,
    showSkeleton: true,
    selectedCameraId: '',
  });

  // Hand gesture detection state
  const [gestureState, setGestureState] = useState<GestureState>({
    handsDetected: 0,
    isOpenPalm: false,
    isPeaceSign: false,
    isFist: false,
    tension: 0.5,
    handCenter: { x: 0, y: 0, z: 0 },
    activeGestureName: 'None',
    fps: 0,
    isModelLoaded: false,
    cameraStatus: 'idle',
  });

  // UI state
  const [webglFps, setWebglFps] = useState(60);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [gestureToast, setGestureToast] = useState<{ text: string; icon: string } | null>({
    text: 'Haz el gesto "V" (Paz) para cambiar de forma o abre la palma para regenerar',
    icon: '✨',
  });

  // Cycle to next shape with GPU morphing
  const handleNextShape = useCallback(() => {
    setConfig((prev) => {
      const currentIndex = SHAPE_SEQUENCE.indexOf(prev.shape);
      const nextIndex = (currentIndex + 1) % SHAPE_SEQUENCE.length;
      return { ...prev, shape: SHAPE_SEQUENCE[nextIndex] };
    });

    setGestureToast({
      text: '✌️ Gesto "V": Cambiando plantilla 3D en GPU',
      icon: '✌️',
    });
  }, []);

  // Trigger dispersion shockwave
  const handleTriggerDispersion = useCallback(() => {
    setConfig((prev) => ({ ...prev, dispersion: 1.6 }));
    setGestureToast({
      text: '🖐️ Palma Abierta: Onda expansiva y regeneración dinámica',
      icon: '🖐️',
    });
  }, []);

  // Update config helper
  const handleUpdateConfig = useCallback((newConfig: Partial<SimulationConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  }, []);

  // Camera start / stop logic
  const startCameraVision = useCallback(async (deviceId?: string) => {
    if (!videoRef.current) return;

    setGestureState((prev) => ({ ...prev, cameraStatus: 'requesting' }));

    try {
      if (!handVisionService.isInitialized) {
        await handVisionService.init(
          videoRef.current,
          (state) => {
            setGestureState((prev) => ({
              ...prev,
              ...state,
              cameraStatus: 'active',
            }));
          },
          (action) => {
            if (action === 'open_palm') {
              handleTriggerDispersion();
            } else if (action === 'peace_sign') {
              handleNextShape();
            }
          }
        );
      }

      await handVisionService.startCamera(deviceId);
      setGestureState((prev) => ({ ...prev, cameraStatus: 'active', isModelLoaded: true }));
      setGestureToast({
        text: 'Cámara conectada. Muestra tus manos para interactuar.',
        icon: '📷',
      });
    } catch (err: any) {
      console.error('Camera activation failed:', err);
      setGestureState((prev) => ({
        ...prev,
        cameraStatus: err.name === 'NotAllowedError' ? 'denied' : 'error',
        errorMessage: err.message,
      }));
      setGestureToast({
        text: 'Cámara bloqueada o no disponible. Puedes usar el ratón para rotar y zoom.',
        icon: '⚠️',
      });
    }
  }, [handleNextShape, handleTriggerDispersion]);

  const toggleCameraVision = useCallback(() => {
    if (gestureState.cameraStatus === 'active') {
      handVisionService.stopCamera();
      setGestureState((prev) => ({
        ...prev,
        cameraStatus: 'idle',
        handsDetected: 0,
        activeGestureName: 'None',
      }));
      setGestureToast({
        text: 'Visión por cámara desactivada.',
        icon: '📷',
      });
    } else {
      startCameraVision(config.selectedCameraId);
    }
  }, [gestureState.cameraStatus, config.selectedCameraId, startCameraVision]);

  // Keyboard accessibility & hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleNextShape();
      } else if (e.key.toLowerCase() === 'd') {
        handleTriggerDispersion();
      } else if (e.key.toLowerCase() === 'c') {
        toggleCameraVision();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextShape, handleTriggerDispersion, toggleCameraVision]);

  // Dismiss toast after 5s
  useEffect(() => {
    if (gestureToast) {
      const timer = setTimeout(() => setGestureToast(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [gestureToast]);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black text-white font-sans">
      {/* Background radial atmosphere glow matching active colors */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25 transition-all duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${config.colorA}33 0%, ${config.colorB}15 45%, #010206 90%)`,
        }}
      />

      {/* Hidden video element for MediaPipe stream input */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="hidden pointer-events-none"
      />

      {/* 3D WebGL Particle Canvas (Single draw call THREE.Points with custom GPU Shaders) */}
      <ParticleScene
        config={config}
        gestureState={gestureState}
        onFPSUpdate={setWebglFps}
        onTriggerDispersion={handleTriggerDispersion}
      />

      {/* Top Navigation Bar with 3-Zone Contract */}
      <TopBar
        currentShape={config.shape}
        onSelectShape={(shape) => handleUpdateConfig({ shape })}
        onOpenGuide={() => setIsGuideOpen(true)}
        onToggleWebcam={toggleCameraVision}
        isWebcamActive={gestureState.cameraStatus === 'active'}
      />

      {/* Interactive Control Panel */}
      <ControlPanel
        config={config}
        onChangeConfig={handleUpdateConfig}
        onNextShape={handleNextShape}
        onTriggerDispersion={handleTriggerDispersion}
        fps={webglFps}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Picture-In-Picture Webcam Feed & Hand Landmark Skeleton */}
      <WebcamFeed
        gestureState={gestureState}
        selectedCameraId={config.selectedCameraId}
        onCameraChange={(deviceId) => {
          handleUpdateConfig({ selectedCameraId: deviceId });
          startCameraVision(deviceId);
        }}
        onRetryCamera={() => startCameraVision(config.selectedCameraId)}
        isVisible={config.showWebcamPIP}
        onToggleVisibility={() =>
          handleUpdateConfig({ showWebcamPIP: !config.showWebcamPIP })
        }
        showSkeleton={config.showSkeleton}
        onToggleSkeleton={() =>
          handleUpdateConfig({ showSkeleton: !config.showSkeleton })
        }
      />

      {/* Gesture Notification Pill */}
      {gestureToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 bg-slate-950/90 border border-white/10 rounded-full shadow-2xl backdrop-blur-xl text-xs text-slate-200 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <span className="text-sm">{gestureToast.icon}</span>
          <span className="font-medium tracking-wide">{gestureToast.text}</span>
          <button
            onClick={() => setGestureToast(null)}
            className="ml-2 text-slate-500 hover:text-slate-300 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Center bottom subtle gesture helper hint */}
      <div className="fixed bottom-2 left-6 z-10 hidden lg:flex items-center gap-4 text-[11px] text-slate-500 font-mono">
        <div className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">Espacio</kbd>
          <span>Siguiente Figura</span>
        </div>
        <div className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">D</kbd>
          <span>Dispersión</span>
        </div>
        <div className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">Arrastrar</kbd>
          <span>Rotar 3D</span>
        </div>
        <div className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">Rueda</kbd>
          <span>Zoom</span>
        </div>
      </div>

      {/* Gesture Guide Modal */}
      <GestureGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </main>
  );
}
