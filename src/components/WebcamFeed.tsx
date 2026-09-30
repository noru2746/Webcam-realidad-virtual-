import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, ChevronDown, ChevronUp, Eye, EyeOff, RefreshCw, Sparkles, Video } from 'lucide-react';
import { GestureState } from '../types';
import { handVisionService } from '../services/handDetector';

interface WebcamFeedProps {
  gestureState: GestureState;
  selectedCameraId: string;
  onCameraChange: (deviceId: string) => void;
  onRetryCamera: () => void;
  isVisible: boolean;
  onToggleVisibility: () => void;
  showSkeleton: boolean;
  onToggleSkeleton: () => void;
}

export const WebcamFeed: React.FC<WebcamFeedProps> = ({
  gestureState,
  selectedCameraId,
  onCameraChange,
  onRetryCamera,
  isVisible,
  onToggleVisibility,
  showSkeleton,
  onToggleSkeleton,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);

  // Fetch available cameras
  useEffect(() => {
    const fetchDevices = async () => {
      const videoDevices = await handVisionService.getAvailableCameras();
      setCameras(videoDevices);
    };
    fetchDevices();

    navigator.mediaDevices?.addEventListener?.('devicechange', fetchDevices);
    return () => {
      navigator.mediaDevices?.removeEventListener?.('devicechange', fetchDevices);
    };
  }, []);

  // Bind active stream to preview video
  useEffect(() => {
    if (videoRef.current && gestureState.cameraStatus === 'active') {
      const stream = handVisionService.getStream();
      if (stream && videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    }
  }, [gestureState.cameraStatus]);

  // Real-time canvas overlay for hand landmarks skeleton
  useEffect(() => {
    let animId: number;
    const renderSkeleton = () => {
      if (canvasRef.current && showSkeleton && gestureState.cameraStatus === 'active') {
        const rawLandmarks = handVisionService.getRawLandmarks();
        handVisionService.drawSkeleton(canvasRef.current, rawLandmarks);
      } else if (canvasRef.current && !showSkeleton) {
        const ctx = canvasRef.current.getContext('2d');
        ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      animId = requestAnimationFrame(renderSkeleton);
    };

    animId = requestAnimationFrame(renderSkeleton);
    return () => cancelAnimationFrame(animId);
  }, [showSkeleton, gestureState.cameraStatus]);

  if (!isVisible) {
    return (
      <button
        onClick={onToggleVisibility}
        className="fixed bottom-6 right-6 z-20 flex items-center gap-2 px-3 py-2 bg-slate-900/80 hover:bg-slate-850 text-slate-200 text-xs font-medium rounded-xl border border-white/10 backdrop-blur-md shadow-xl transition-all"
        title="Mostrar vista de cámara"
      >
        <Camera className="w-4 h-4 text-cyan-400" />
        <span>Abrir Cámara</span>
      </button>
    );
  }

  // Determine gesture pill color and icon
  const getGestureIndicator = () => {
    if (gestureState.isOpenPalm) {
      return {
        label: '🖐️ Palma Abierta: Regenerar',
        color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      };
    }
    if (gestureState.isPeaceSign) {
      return {
        label: '✌️ Signo de la Paz: Siguiente',
        color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      };
    }
    if (gestureState.isFist) {
      return {
        label: '✊ Puño: Núcleo Denso',
        color: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
      };
    }
    if (gestureState.handsDetected >= 2) {
      return {
        label: `👐 Expansión: ${Math.round(gestureState.tension * 100)}%`,
        color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      };
    }
    if (gestureState.handsDetected === 1) {
      return {
        label: `👌 Control: ${Math.round(gestureState.tension * 100)}%`,
        color: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      };
    }
    return {
      label: 'Esperando manos...',
      color: 'bg-slate-800/40 text-slate-400 border-slate-700/40',
    };
  };

  const gestureInfo = getGestureIndicator();

  return (
    <aside aria-label="Webcam vision overlay" className="fixed bottom-6 right-6 z-20 w-72 bg-slate-950/85 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-white/[0.03] border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${gestureState.cameraStatus === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span className="text-xs font-semibold text-slate-200 tracking-wide font-mono">
            VISION FEED
          </span>
          <span className="text-[10px] text-slate-400 font-mono tabular-nums">
            {gestureState.fps} FPS
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onToggleSkeleton}
            className={`p-1.5 rounded-lg transition-colors ${showSkeleton ? 'text-cyan-400 bg-cyan-950/40' : 'text-slate-400 hover:text-slate-200'}`}
            title={showSkeleton ? 'Ocultar esqueleto' : 'Mostrar esqueleto'}
          >
            {showSkeleton ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
            title={isMinimized ? 'Expandir' : 'Minimizar'}
          >
            {isMinimized ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onToggleVisibility}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg transition-colors text-xs"
            title="Cerrar panel"
          >
            ✕
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="p-3 space-y-2.5">
          {/* Video & Skeleton Canvas Container */}
          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-900 border border-white/10">
            {gestureState.cameraStatus === 'active' ? (
              <>
                <video
                  id="mediapipe-webcam-element"
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover -scale-x-100"
                />
                <canvas
                  ref={canvasRef}
                  width={320}
                  height={240}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                />
              </>
            ) : gestureState.cameraStatus === 'requesting' ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin mb-2" />
                <p className="text-xs text-slate-300 font-medium">Iniciando cámara y MediaPipe...</p>
                <p className="text-[11px] text-slate-500 mt-1">Concede permiso en el navegador</p>
              </div>
            ) : gestureState.cameraStatus === 'denied' || gestureState.cameraStatus === 'error' ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-red-950/20">
                <CameraOff className="w-6 h-6 text-rose-400 mb-1.5" />
                <p className="text-xs text-rose-300 font-medium">Cámara no accesible</p>
                <p className="text-[10px] text-slate-400 mt-0.5 mb-2.5">
                  Usa el ratón o reintenta dar permisos
                </p>
                <button
                  onClick={onRetryCamera}
                  className="px-2.5 py-1 text-xs bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  Reintentar
                </button>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                <Video className="w-6 h-6 text-slate-500 mb-1.5" />
                <button
                  onClick={onRetryCamera}
                  className="px-3 py-1.5 text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-colors"
                >
                  Activar Cámara Web
                </button>
              </div>
            )}

            {/* Gesture HUD pill inside video overlay */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
              <span className={`text-[11px] px-2 py-0.5 rounded-md border backdrop-blur-md font-medium transition-all ${gestureInfo.color}`}>
                {gestureInfo.label}
              </span>
              {gestureState.handsDetected > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/60 text-slate-300 backdrop-blur-sm font-mono">
                  {gestureState.handsDetected} {gestureState.handsDetected === 1 ? 'mano' : 'manos'}
                </span>
              )}
            </div>
          </div>

          {/* Camera input device selector */}
          {cameras.length > 1 && (
            <div className="flex items-center gap-2 pt-1 text-xs">
              <label htmlFor="camera-device-select" className="text-[11px] text-slate-400 shrink-0">Cámara:</label>
              <select
                id="camera-device-select"
                value={selectedCameraId}
                onChange={(e) => onCameraChange(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 text-slate-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-cyan-500 truncate"
              >
                {cameras.map((cam, idx) => (
                  <option key={cam.deviceId || idx} value={cam.deviceId}>
                    {cam.label || `Cámara ${idx + 1}`}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
