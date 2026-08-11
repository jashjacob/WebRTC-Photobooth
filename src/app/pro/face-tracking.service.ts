import { Injectable, signal } from '@angular/core';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

@Injectable({
  providedIn: 'root'
})
export class FaceTrackingService {
  private faceLandmarker: FaceLandmarker | null = null;
  readonly isReady = signal<boolean>(false);
  readonly hasFailed = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);

  async initialize(): Promise<void> {
    if (this.faceLandmarker) return;

    this.isLoading.set(true);
    try {
      // Load WebAssembly binaries from jsdelivr CDN (keeps our bundle small)
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
      );

      this.faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU' // Use WebGL/GPU acceleration
        },
        outputFaceBlendshapes: true,
        runningMode: 'VIDEO',
        numFaces: 1
      });

      this.isReady.set(true);
      this.isLoading.set(false);
    } catch (e) {
      this.hasFailed.set(true);
      this.isLoading.set(false);
      console.error('Failed to initialize Face Landmarker', e);
    }
  }

  reset(): void {
    this.hasFailed.set(false);
    this.isReady.set(false);
    this.faceLandmarker = null;
  }

  detectVideoFrame(video: HTMLVideoElement, timestamp: number) {
    if (!this.faceLandmarker || !this.isReady()) return null;
    return this.faceLandmarker.detectForVideo(video, timestamp);
  }
}
