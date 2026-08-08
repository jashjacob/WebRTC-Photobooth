import { Injectable } from '@angular/core';
import { ImageSegmenter, FilesetResolver } from '@mediapipe/tasks-vision';

export interface FilterOptions {
  pastel: boolean;
  sparkle: boolean;
  brightness: number;
  contrast: number;
  saturation: number;
}

@Injectable({
  providedIn: 'root'
})
export class ImageProcessingService {
  private segmenter: ImageSegmenter | null = null;
  private isProcessing = false;
  private canvasContext: CanvasRenderingContext2D | null = null;

  // Cached offscreen canvases to avoid creating new ones every frame
  private offscreenCanvas: HTMLCanvasElement | null = null;
  private offscreenCtx: CanvasRenderingContext2D | null = null;
  private maskCanvas: HTMLCanvasElement | null = null;
  private maskCtx: CanvasRenderingContext2D | null = null;

  private lastTimestamp = 0;

  constructor() {
    this.initializeSegmenter();
  }

  private async initializeSegmenter() {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
      );

      this.segmenter = await ImageSegmenter.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite",
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        outputCategoryMask: false,
        outputConfidenceMasks: true
      });
      console.log('MediaPipe Selfie Segmenter initialized successfully');
    } catch (error) {
      console.error("Error initializing MediaPipe Image Segmenter:", error);
    }
  }

  public startProcessing(
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement,
    removeBackground: boolean,
    filters: FilterOptions
  ) {
    this.isProcessing = true;
    this.canvasContext = canvas.getContext('2d', { willReadFrequently: true });

    // Pre-allocate offscreen canvases
    this.ensureOffscreenCanvases(canvas.width, canvas.height);

    // Start render loop
    const renderLoop = async () => {
      if (!this.isProcessing) return;

      if (video.readyState >= 2) { // HAVE_CURRENT_DATA
        if (removeBackground && this.segmenter) {
          this.processWithBackgroundRemoval(video, canvas, filters);
        } else {
          this.processStandard(video, canvas, filters);
        }
      }

      requestAnimationFrame(renderLoop);
    };

    renderLoop();
  }

  public stopProcessing() {
    this.isProcessing = false;
  }

  private ensureOffscreenCanvases(width: number, height: number) {
    if (!this.offscreenCanvas || this.offscreenCanvas.width !== width || this.offscreenCanvas.height !== height) {
      this.offscreenCanvas = document.createElement('canvas');
      this.offscreenCanvas.width = width;
      this.offscreenCanvas.height = height;
      this.offscreenCtx = this.offscreenCanvas.getContext('2d')!;
    }
    if (!this.maskCanvas || this.maskCanvas.width !== width || this.maskCanvas.height !== height) {
      this.maskCanvas = document.createElement('canvas');
      this.maskCanvas.width = width;
      this.maskCanvas.height = height;
      this.maskCtx = this.maskCanvas.getContext('2d')!;
    }
  }

  private processWithBackgroundRemoval(
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement,
    filters: FilterOptions
  ) {
    if (!this.canvasContext || !this.segmenter || !this.offscreenCtx || !this.maskCtx) return;

    const { width, height } = canvas;
    const ctx = this.canvasContext;

    // Ensure monotonically increasing timestamps for MediaPipe
    const now = performance.now();
    const timestamp = now > this.lastTimestamp ? now : this.lastTimestamp + 1;
    this.lastTimestamp = timestamp;

    // Run segmentation
    let segmentationResult;
    try {
      segmentationResult = this.segmenter.segmentForVideo(video, timestamp);
    } catch (e) {
      console.warn('Segmentation frame skipped:', e);
      this.processStandard(video, canvas, filters);
      return;
    }

    const confidenceMasks = segmentationResult.confidenceMasks;
    if (!confidenceMasks || confidenceMasks.length === 0) {
      this.processStandard(video, canvas, filters);
      segmentationResult.close();
      return;
    }

    // The selfie segmenter confidence mask: higher values = more likely person
    const maskData = confidenceMasks[0].getAsFloat32Array();
    const maskWidth = confidenceMasks[0].width;
    const maskHeight = confidenceMasks[0].height;

    // Step 1: Draw pastel gradient background on the main canvas
    ctx.save();
    ctx.filter = 'none';
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#ffd1ff'); // Pastel pink
    gradient.addColorStop(0.5, '#ffe8f0'); // Soft rose
    gradient.addColorStop(1, '#c1e3ff'); // Baby blue
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    // Step 2: Draw video to offscreen canvas
    this.offscreenCtx.drawImage(video, 0, 0, width, height);

    // Step 3: Build a grayscale alpha mask on the mask canvas
    // White = person (keep), Black = background (remove)
    const maskImageData = this.maskCtx.createImageData(maskWidth, maskHeight);
    for (let i = 0; i < maskData.length; i++) {
      const confidence = maskData[i]; // 0.0 = background, 1.0 = person
      const alpha = Math.round(confidence * 255);
      maskImageData.data[i * 4] = 255;     // R
      maskImageData.data[i * 4 + 1] = 255; // G
      maskImageData.data[i * 4 + 2] = 255; // B
      maskImageData.data[i * 4 + 3] = alpha; // A - person is opaque, bg is transparent
    }
    this.maskCtx.putImageData(maskImageData, 0, 0);

    // Step 4: Use the mask to cut out the person from the video
    // Draw mask to offscreen, then use 'destination-in' to keep only person pixels
    this.offscreenCtx.save();
    this.offscreenCtx.globalCompositeOperation = 'destination-in';
    this.offscreenCtx.drawImage(this.maskCanvas!, 0, 0, width, height);
    this.offscreenCtx.restore();

    // Step 5: Draw the masked person (with filters) over the gradient background
    ctx.save();
    ctx.filter = this.buildCssFilterString(filters);
    ctx.drawImage(this.offscreenCanvas!, 0, 0);
    ctx.restore();

    // Clean up the segmentation result to prevent memory leaks
    segmentationResult.close();
  }

  private processStandard(
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement,
    filters: FilterOptions
  ) {
    if (!this.canvasContext) return;
    const { width, height } = canvas;
    const ctx = this.canvasContext;

    ctx.filter = this.buildCssFilterString(filters);
    ctx.drawImage(video, 0, 0, width, height);
    ctx.filter = 'none';
  }

  private buildCssFilterString(filters: FilterOptions): string {
    const filterParts: string[] = [];
    if (filters.brightness !== 100) {
      filterParts.push(`brightness(${filters.brightness}%)`);
    }
    if (filters.contrast !== 100) {
      filterParts.push(`contrast(${filters.contrast}%)`);
    }
    if (filters.saturation !== 100) {
      filterParts.push(`saturate(${filters.saturation}%)`);
    }
    if (filters.pastel) {
      // Warm pink/peach tint for Kawaii look
      filterParts.push('sepia(20%) hue-rotate(-20deg) saturate(120%) brightness(105%)');
    }
    return filterParts.length > 0 ? filterParts.join(' ') : 'none';
  }
}
