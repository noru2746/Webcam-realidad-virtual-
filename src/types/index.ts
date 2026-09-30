export type ShapeType = 'heart' | 'flower' | 'saturn' | 'buddha' | 'fireworks' | 'galaxy';

export interface GestureState {
  handsDetected: number;
  isOpenPalm: boolean;
  isPeaceSign: boolean;
  isFist: boolean;
  tension: number; // 0.0 to 1.0 (distance between wrists or fingers spread)
  handCenter: { x: number; y: number; z: number }; // normalized -1 to 1
  activeGestureName: string;
  fps: number;
  isModelLoaded: boolean;
  cameraStatus: 'idle' | 'requesting' | 'active' | 'denied' | 'error';
  errorMessage?: string;
}

export interface ColorPreset {
  id: string;
  name: string;
  colorA: string;
  colorB: string;
  bgGlow: string;
}

export interface SimulationConfig {
  shape: ShapeType;
  particleCount: number;
  pointSize: number;
  turbulence: number;
  dispersion: number;
  scale: number;
  speed: number;
  autoRotate: boolean;
  rotationSpeed: number;
  handAttraction: boolean;
  colorA: string;
  colorB: string;
  activePresetId: string;
  showWebcamPIP: boolean;
  showSkeleton: boolean;
  selectedCameraId: string;
}
