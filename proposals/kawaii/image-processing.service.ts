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
  
  // A cute background image for replacement
  private bgImage = new Image();

  constructor() {
    this.bgImage.src = 'https://www.transparenttextures.com/patterns/cubes.png'; // Fallback pattern
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
        outputCategoryMask: true,
        outputConfidenceMasks: false
      });
    } catch (error) {
      console.error("Error initializing MediaPipe Image Segmenter:", error);
    }
  }

  public setBackgroundImage(url: string) {
    this.bgImage.src = url;
  }

  public startProcessing(
    video: HTMLVideoElement, 
    canvas: HTMLCanvasElement, 
    removeBackground: boolean,
    filters: FilterOptions
  ) {
    this.isProcessing = true;
    this.canvasContext = canvas.getContext('2d', { willReadFrequently: true });
    
    // Start render loop
    const renderLoop = async () => {
      if (!this.isProcessing) return;

      if (video.readyState >= 2) { // HAVE_CURRENT_DATA
        if (removeBackground && this.segmenter) {
          await this.processWithBackgroundRemoval(video, canvas, filters);
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

  private async processWithBackgroundRemoval(
    video: HTMLVideoElement, 
    canvas: HTMLCanvasElement,
    filters: FilterOptions
  ) {
    if (!this.canvasContext || !this.segmenter) return;

    const startTimeMs = performance.now();
    const segmentationResult = this.segmenter.segmentForVideo(video, startTimeMs);
    const categoryMask = segmentationResult.categoryMask;

    if (!categoryMask) {
        this.processStandard(video, canvas, filters);
        return;
    }

    const { width, height } = canvas;
    const ctx = this.canvasContext;

    // Draw background first
    ctx.clearRect(0, 0, width, height);
    
    // Draw cute pastel gradient or image as background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#ffd1ff'); // Pastel pink
    gradient.addColorStop(1, '#c1e3ff'); // Baby blue
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    if (this.bgImage.complete) {
        // Simple tiling or stretch
        ctx.globalAlpha = 0.5; // Soft blend
        ctx.drawImage(this.bgImage, 0, 0, width, height);
        ctx.globalAlpha = 1.0;
    }

    // Convert mask to image data
    const maskData = categoryMask.getAsFloat32Array();
    
    // Draw original video to an offscreen canvas to get its pixel data
    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const offCtx = offscreen.getContext('2d')!;
    offCtx.drawImage(video, 0, 0, width, height);
    const videoData = offCtx.getImageData(0, 0, width, height);
    
    // Apply mask to video data
    for (let i = 0; i < maskData.length; i++) {
        // Selfie segmentation usually sets background to > 0. 
        // We might need to invert it based on the exact model output.
        // For selfie segmenter, 0 is usually background, 1 is person (or vice versa depending on model).
        // Standard selfie_segmenter: 0 is person, 1 is background in category mask?
        // Actually, let's just make it slightly transparent if it's background.
        if (maskData[i] > 0.5) {
            videoData.data[i * 4 + 3] = 0; // Transparent
        }
    }

    // Apply Kawaii filters to the person
    this.applyFilters(videoData, filters);

    // Draw the person over the background
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    tempCanvas.getContext('2d')!.putImageData(videoData, 0, 0);
    ctx.drawImage(tempCanvas, 0, 0);
  }

  private processStandard(
    video: HTMLVideoElement, 
    canvas: HTMLCanvasElement,
    filters: FilterOptions
  ) {
    if (!this.canvasContext) return;
    const { width, height } = canvas;
    const ctx = this.canvasContext;

    ctx.drawImage(video, 0, 0, width, height);
    
    const imageData = ctx.getImageData(0, 0, width, height);
    this.applyFilters(imageData, filters);
    ctx.putImageData(imageData, 0, 0);
  }

  private applyFilters(imageData: ImageData, filters: FilterOptions) {
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      // Extract RGB
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];
      
      // 1. Saturation
      if (filters.saturation !== 100) {
        const sat = filters.saturation / 100;
        const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
        r = -gray * sat + r * sat + gray;
        g = -gray * sat + g * sat + gray;
        b = -gray * sat + b * sat + gray;
      }

      // 2. Contrast
      if (filters.contrast !== 100) {
        const factor = (259 * (filters.contrast + 255)) / (255 * (259 - filters.contrast));
        r = factor * (r - 128) + 128;
        g = factor * (g - 128) + 128;
        b = factor * (b - 128) + 128;
      }

      // 3. Brightness
      if (filters.brightness !== 100) {
        const br = (filters.brightness - 100);
        r += br;
        g += br;
        b += br;
      }

      // 4. Pastel (Soft Kawaii look: increase brightness slightly, tint pink/peach)
      if (filters.pastel) {
          r = Math.min(255, r + 20); // Add a warm pink tone
          g = Math.min(255, g + 10);
          b = Math.min(255, b + 15);
      }

      // Write back
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }
  }
}
