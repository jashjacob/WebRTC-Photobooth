import { Injectable } from '@angular/core';

export interface SegmentationConfig {
  modelSelection: 0 | 1; // 0 for general, 1 for landscape
}

@Injectable({
  providedIn: 'root'
})
export class MediaPipeSegmentationService {
  private segmenter: any;
  private isReady = false;

  constructor() {}

  async initialize(config: SegmentationConfig = { modelSelection: 1 }) {
    // Dynamically load the MediaPipe Tasks Vision library or rely on global script
    // E.g., import { ImageSegmenter, FilesetResolver } from '@mediapipe/tasks-vision';
    try {
      const vision = await (window as any).FilesetResolver?.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );
      
      if (vision) {
        this.segmenter = await (window as any).ImageSegmenter.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite',
            delegate: 'GPU'
          },
          runningMode: 'VIDEO',
          outputCategoryMask: true,
          outputConfidenceMasks: false
        });
        this.isReady = true;
      }
    } catch (err) {
      console.error('Failed to initialize MediaPipe:', err);
    }
  }

  async processVideoFrame(videoElement: HTMLVideoElement, timestamp: number): Promise<ImageData | null> {
    if (!this.isReady || !this.segmenter) return null;
    try {
      const result = await this.segmenter.segmentForVideo(videoElement, timestamp);
      return result.categoryMask; // Returns mask where person is segmented
    } catch (error) {
      console.error('Segmentation error:', error);
      return null;
    }
  }
}
