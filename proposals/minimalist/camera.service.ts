import { Injectable, ElementRef } from '@angular/core';
import { SelfieSegmentation, Results } from '@mediapipe/selfie_segmentation';

export type FilterType = 'none' | 'monochrome' | 'sepia' | 'invert' | 'blur';

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  private selfieSegmentation: SelfieSegmentation;
  private videoElement!: HTMLVideoElement;
  private canvasElement!: HTMLCanvasElement;
  private canvasCtx!: CanvasRenderingContext2D;
  private isProcessing = false;
  
  public currentFilter: FilterType = 'none';
  public backgroundMode: 'none' | 'blur' | 'color' = 'none';
  public frameImage: HTMLImageElement | null = null;
  public backgroundColor: string = '#000000';

  constructor() {
    this.selfieSegmentation = new SelfieSegmentation({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`
    });
    
    this.selfieSegmentation.setOptions({
      modelSelection: 1, // 0 for general, 1 for landscape (faster)
    });

    this.selfieSegmentation.onResults(this.onResults.bind(this));
  }

  async initialize(video: HTMLVideoElement, canvas: HTMLCanvasElement): Promise<void> {
    this.videoElement = video;
    this.canvasElement = canvas;
    const ctx = this.canvasElement.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    this.canvasCtx = ctx;

    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { width: 1280, height: 720 }, 
      audio: false 
    });
    this.videoElement.srcObject = stream;
    await this.videoElement.play();
    
    this.startProcessing();
  }

  private startProcessing() {
    this.isProcessing = true;
    const processFrame = async () => {
      if (!this.isProcessing) return;
      await this.selfieSegmentation.send({ image: this.videoElement });
      requestAnimationFrame(processFrame);
    };
    processFrame();
  }

  stopProcessing() {
    this.isProcessing = false;
    const stream = this.videoElement?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
  }

  private onResults(results: Results): void {
    this.canvasCtx.save();
    this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

    // 1. Draw Segmentation Mask (Background Removal)
    if (this.backgroundMode !== 'none') {
      this.canvasCtx.drawImage(results.segmentationMask, 0, 0, this.canvasElement.width, this.canvasElement.height);
      
      // Draw background
      this.canvasCtx.globalCompositeOperation = 'source-out';
      if (this.backgroundMode === 'color') {
        this.canvasCtx.fillStyle = this.backgroundColor;
        this.canvasCtx.fillRect(0, 0, this.canvasElement.width, this.canvasElement.height);
      } else if (this.backgroundMode === 'blur') {
        this.canvasCtx.filter = 'blur(10px)';
        this.canvasCtx.drawImage(results.image, 0, 0, this.canvasElement.width, this.canvasElement.height);
        this.canvasCtx.filter = 'none';
      }

      // Draw person
      this.canvasCtx.globalCompositeOperation = 'destination-atop';
      this.applyFilter();
      this.canvasCtx.drawImage(results.image, 0, 0, this.canvasElement.width, this.canvasElement.height);
    } else {
      // No background removal
      this.applyFilter();
      this.canvasCtx.drawImage(results.image, 0, 0, this.canvasElement.width, this.canvasElement.height);
    }

    this.canvasCtx.restore();

    // 3. Draw Frame overlay
    if (this.frameImage) {
      this.canvasCtx.drawImage(this.frameImage, 0, 0, this.canvasElement.width, this.canvasElement.height);
    }
  }

  private applyFilter() {
    switch (this.currentFilter) {
      case 'monochrome':
        this.canvasCtx.filter = 'grayscale(100%) contrast(120%) brightness(90%)';
        break;
      case 'sepia':
        this.canvasCtx.filter = 'sepia(100%)';
        break;
      case 'invert':
        this.canvasCtx.filter = 'invert(100%)';
        break;
      case 'blur':
        this.canvasCtx.filter = 'blur(5px)';
        break;
      default:
        this.canvasCtx.filter = 'none';
    }
  }
  
  takePhoto(): string {
    return this.canvasElement.toDataURL('image/png');
  }

  setFrame(url: string | null) {
    if (!url) {
      this.frameImage = null;
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    img.onload = () => {
      this.frameImage = img;
    };
  }
}
