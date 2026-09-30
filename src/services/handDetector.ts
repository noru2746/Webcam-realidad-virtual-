import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { GestureState } from '../types';

export type GestureCallback = (state: GestureState) => void;
export type GestureActionCallback = (action: 'open_palm' | 'peace_sign' | 'fist') => void;

// MediaPipe 21 hand landmarks connection pairs
export const HAND_CONNECTIONS = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle
  [0, 9], [9, 10], [10, 11], [11, 12],
  // Ring
  [0, 13], [13, 14], [14, 15], [15, 16],
  // Pinky
  [0, 17], [17, 18], [18, 19], [19, 20],
  // Palm Base
  [5, 9], [9, 13], [13, 17],
];

export class HandVisionService {
  private handLandmarker: HandLandmarker | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private stream: MediaStream | null = null;
  private isProcessing = false;
  private animFrameId: number | null = null;
  private lastVideoTime = -1;
  private lastProcessTimestamp = 0;
  private targetFpsInterval = 1000 / 30; // ~30 FPS throttling

  private onGestureUpdate: GestureCallback | null = null;
  private onGestureAction: GestureActionCallback | null = null;

  // Gesture state tracking & debouncing
  private lastPeaceSignTime = 0;
  private lastOpenPalmTime = 0;
  private wasPeaceSign = false;
  private wasOpenPalm = false;

  private fpsHistory: number[] = [];
  private lastFpsCalcTime = performance.now();
  private frameCounter = 0;
  private currentFps = 30;

  public isInitialized = false;

  public async init(
    video: HTMLVideoElement,
    onUpdate: GestureCallback,
    onAction: GestureActionCallback
  ): Promise<boolean> {
    this.videoElement = video;
    this.onGestureUpdate = onUpdate;
    this.onGestureAction = onAction;

    try {
      // Load wasm from reliable jsdelivr CDN
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 2,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      this.isInitialized = true;
      return true;
    } catch (err) {
      console.warn('MediaPipe HandLandmarker init warning/error:', err);
      return false;
    }
  }

  public async startCamera(deviceId?: string): Promise<boolean> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Webcam API is not supported in this browser environment.');
    }

    this.stopCamera();

    const constraints: MediaStreamConstraints = {
      video: deviceId
        ? { deviceId: { exact: deviceId }, width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30 } }
        : { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30 }, facingMode: 'user' },
      audio: false,
    };

    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (this.videoElement) {
        this.videoElement.srcObject = this.stream;
        await new Promise<void>((resolve) => {
          if (!this.videoElement) return resolve();
          this.videoElement.onloadedmetadata = () => {
            this.videoElement?.play();
            resolve();
          };
        });
      }

      this.startVisionLoop();
      return true;
    } catch (error) {
      console.error('Camera stream error:', error);
      throw error;
    }
  }

  public stopCamera(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
  }

  private startVisionLoop(): void {
    const loop = (timestamp: number) => {
      // Throttle vision processing to ~30 FPS decoupled from WebGL 60 FPS
      const elapsed = timestamp - this.lastProcessTimestamp;

      if (elapsed >= this.targetFpsInterval) {
        this.lastProcessTimestamp = timestamp - (elapsed % this.targetFpsInterval);
        this.processCurrentFrame(timestamp);
      }

      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  private processCurrentFrame(timestamp: number): void {
    if (
      !this.videoElement ||
      !this.handLandmarker ||
      this.videoElement.readyState < HTMLMediaElement.HAVE_CURRENT_DATA
    ) {
      return;
    }

    // Measure FPS
    this.frameCounter++;
    const now = performance.now();
    if (now - this.lastFpsCalcTime >= 1000) {
      this.currentFps = Math.round((this.frameCounter * 1000) / (now - this.lastFpsCalcTime));
      this.frameCounter = 0;
      this.lastFpsCalcTime = now;
    }

    if (this.videoElement.currentTime !== this.lastVideoTime) {
      this.lastVideoTime = this.videoElement.currentTime;

      try {
        const results = this.handLandmarker.detectForVideo(this.videoElement, timestamp);
        this.evaluateResults(results);
      } catch (err) {
        console.warn('Vision detection frame skipped:', err);
      }
    }
  }

  private evaluateResults(results: any): void {
    const landmarks = results.landmarks || [];
    const handsDetected = landmarks.length;

    if (handsDetected === 0) {
      this.wasPeaceSign = false;
      this.wasOpenPalm = false;

      this.onGestureUpdate?.({
        handsDetected: 0,
        isOpenPalm: false,
        isPeaceSign: false,
        isFist: false,
        tension: 0.5,
        handCenter: { x: 0, y: 0, z: 0 },
        activeGestureName: 'None',
        fps: this.currentFps,
        isModelLoaded: true,
        cameraStatus: 'active',
      });
      return;
    }

    let isOpenPalm = false;
    let isPeaceSign = false;
    let isFist = false;
    let tension = 0.5;
    let activeGestureName = 'Tracking Hand';

    // Calculate centroid of all detected hands
    let sumX = 0;
    let sumY = 0;
    let sumZ = 0;
    let totalPoints = 0;

    landmarks.forEach((hand: any[]) => {
      hand.forEach((pt: any) => {
        sumX += pt.x;
        sumY += pt.y;
        sumZ += pt.z || 0;
        totalPoints++;
      });
    });

    // Invert X because camera is mirrored, map from 0..1 to -1..1
    const handCenterX = totalPoints > 0 ? (1.0 - (sumX / totalPoints)) * 2 - 1 : 0;
    const handCenterY = totalPoints > 0 ? -(sumY / totalPoints * 2 - 1) : 0;
    const handCenterZ = totalPoints > 0 ? (sumZ / totalPoints) * 2 : 0;

    // Dual-hand tension check
    if (handsDetected >= 2) {
      const wrist1 = landmarks[0][0];
      const wrist2 = landmarks[1][0];
      const dist = Math.hypot(wrist1.x - wrist2.x, wrist1.y - wrist2.y);
      // Map wrist distance (approx 0.15 to 0.7) to 0.0 to 1.0
      tension = Math.max(0.05, Math.min(1.0, (dist - 0.12) / 0.55));
      activeGestureName = 'Dual Hands Expansion';
    }

    // Inspect individual hand postures (check primary hand)
    for (const hand of landmarks) {
      const wrist = hand[0];
      const thumbTip = hand[4];
      const indexTip = hand[8];
      const indexPip = hand[6];
      const middleTip = hand[12];
      const middlePip = hand[10];
      const ringTip = hand[16];
      const ringPip = hand[14];
      const pinkyTip = hand[20];
      const pinkyPip = hand[18];

      // Distance helper from wrist
      const distToWrist = (pt: any) => Math.hypot(pt.x - wrist.x, pt.y - wrist.y);

      // Check finger extensions relative to PIP joints
      const isIndexExtended = distToWrist(indexTip) > distToWrist(indexPip) * 1.15;
      const isMiddleExtended = distToWrist(middleTip) > distToWrist(middlePip) * 1.15;
      const isRingExtended = distToWrist(ringTip) > distToWrist(ringPip) * 1.15;
      const isPinkyExtended = distToWrist(pinkyTip) > distToWrist(pinkyPip) * 1.15;
      const isThumbExtended = distToWrist(thumbTip) > distToWrist(hand[2]) * 1.1;

      // 1. Gesto Signo de la Paz ("V"):
      // Index and Middle extended, while Ring and Pinky are contracted
      if (isIndexExtended && isMiddleExtended && !isRingExtended && !isPinkyExtended) {
        isPeaceSign = true;
        activeGestureName = 'Peace Sign (V)';
      }

      // 2. Palma Abierta (Open Palm):
      // All 5 fingertips fully extended away from wrist / MCPs
      if (
        isThumbExtended &&
        isIndexExtended &&
        isMiddleExtended &&
        isRingExtended &&
        isPinkyExtended
      ) {
        isOpenPalm = true;
        activeGestureName = 'Open Palm';
      }

      // 3. Fist / Puño cerrado:
      // None of the 4 long fingers are extended
      if (!isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended) {
        isFist = true;
        activeGestureName = 'Fist / Focus Core';
      }

      // If single hand, map thumb-to-pinky span to tension
      if (handsDetected === 1) {
        const thumbPinkyDist = Math.hypot(thumbTip.x - pinkyTip.x, thumbTip.y - pinkyTip.y);
        tension = Math.max(0.1, Math.min(1.0, thumbPinkyDist / 0.45));
      }
    }

    const currentTime = performance.now();

    // Trigger Open Palm dynamic regeneration event (with debounce of 600ms)
    if (isOpenPalm && !this.wasOpenPalm && currentTime - this.lastOpenPalmTime > 600) {
      this.lastOpenPalmTime = currentTime;
      this.onGestureAction?.('open_palm');
    }
    this.wasOpenPalm = isOpenPalm;

    // Trigger Peace Sign template morphing event (with debounce of 900ms)
    if (isPeaceSign && !this.wasPeaceSign && currentTime - this.lastPeaceSignTime > 900) {
      this.lastPeaceSignTime = currentTime;
      this.onGestureAction?.('peace_sign');
    }
    this.wasPeaceSign = isPeaceSign;

    if (isFist) {
      this.onGestureAction?.('fist');
    }

    this.onGestureUpdate?.({
      handsDetected,
      isOpenPalm,
      isPeaceSign,
      isFist,
      tension,
      handCenter: { x: handCenterX, y: handCenterY, z: handCenterZ },
      activeGestureName,
      fps: this.currentFps,
      isModelLoaded: true,
      cameraStatus: 'active',
    });
  }

  // Draw landmarks onto canvas preview
  public drawSkeleton(canvas: HTMLCanvasElement, landmarksList: any[]): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!landmarksList || landmarksList.length === 0) return;

    ctx.save();
    // Mirror horizontally so it feels natural for the user
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);

    for (const landmarks of landmarksList) {
      // Draw connection lines
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.75)'; // Electric Cyan
      ctx.lineWidth = 2.5;

      for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
        const p1 = landmarks[startIdx];
        const p2 = landmarks[endIdx];
        if (p1 && p2) {
          ctx.beginPath();
          ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
          ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
          ctx.stroke();
        }
      }

      // Draw landmark points
      landmarks.forEach((pt: any, idx: number) => {
        const x = pt.x * canvas.width;
        const y = pt.y * canvas.height;

        ctx.beginPath();
        ctx.arc(x, y, idx === 8 || idx === 12 || idx === 4 ? 4.5 : 2.5, 0, 2 * Math.PI);
        // Fingertips in vibrant gold/magenta
        if (idx === 4 || idx === 8 || idx === 12 || idx === 16 || idx === 20) {
          ctx.fillStyle = '#F59E0B';
        } else {
          ctx.fillStyle = '#06B6D4';
        }
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }

    ctx.restore();
  }

  public getRawLandmarks(): any[] {
    if (!this.handLandmarker || !this.videoElement) return [];
    try {
      const results = this.handLandmarker.detectForVideo(this.videoElement, performance.now());
      return results?.landmarks || [];
    } catch {
      return [];
    }
  }

  public getStream(): MediaStream | null {
    return this.stream;
  }

  public async getAvailableCameras(): Promise<MediaDeviceInfo[]> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return [];
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter((d) => d.kind === 'videoinput');
    } catch (e) {
      console.warn('Failed to enumerate cameras:', e);
      return [];
    }
  }

  public dispose(): void {
    this.stopCamera();
    if (this.handLandmarker) {
      this.handLandmarker.close();
      this.handLandmarker = null;
    }
    this.isInitialized = false;
  }
}

export const handVisionService = new HandVisionService();
