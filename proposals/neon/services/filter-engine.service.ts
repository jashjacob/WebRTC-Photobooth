import { Injectable } from '@angular/core';

export type GlitchEffectParams = { intensity: number; shift: number };
export type WebGLFilterType = 'none' | 'cyber-glitch' | 'neon-glow' | 'crt-scanline';

@Injectable({
  providedIn: 'root'
})
export class FilterEngineService {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;

  constructor() {}

  initCanvas(width: number, height: number): HTMLCanvasElement {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })!;
    return this.canvas;
  }

  applyFilter(
    sourceCanvas: HTMLCanvasElement, 
    filterType: WebGLFilterType, 
    segmentationMask: ImageData | null,
    backgroundMode: 'blur' | 'replace' | 'none',
    bgImage?: HTMLImageElement
  ): HTMLCanvasElement {
    if (!this.ctx) return sourceCanvas;

    const width = this.canvas.width;
    const height = this.canvas.height;

    // Clear and prepare
    this.ctx.clearRect(0, 0, width, height);
    
    // Draw background if masked
    if (segmentationMask && backgroundMode !== 'none') {
      this.ctx.putImageData(segmentationMask, 0, 0);
      this.ctx.globalCompositeOperation = 'source-in';
      this.ctx.drawImage(sourceCanvas, 0, 0, width, height);
      
      this.ctx.globalCompositeOperation = 'destination-over';
      if (backgroundMode === 'replace' && bgImage) {
        this.ctx.drawImage(bgImage, 0, 0, width, height);
      } else if (backgroundMode === 'blur') {
        this.ctx.filter = 'blur(15px)';
        this.ctx.drawImage(sourceCanvas, 0, 0, width, height);
        this.ctx.filter = 'none';
      }
      this.ctx.globalCompositeOperation = 'source-over';
    } else {
      this.ctx.drawImage(sourceCanvas, 0, 0, width, height);
    }

    // Apply Cyberpunk Filters (Simulated WebGL effects using Canvas context filters & pixel manipulation)
    switch (filterType) {
      case 'neon-glow':
        this.applyNeonGlow(sourceCanvas);
        break;
      case 'cyber-glitch':
        this.applyGlitch(sourceCanvas);
        break;
      case 'crt-scanline':
        this.applyCrtScanlines();
        break;
      case 'none':
      default:
        break;
    }

    return this.canvas;
  }

  private applyNeonGlow(source: HTMLCanvasElement) {
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'screen';
    this.ctx.filter = 'contrast(1.5) saturate(1.8) drop-shadow(0 0 10px #0ff) drop-shadow(0 0 20px #f0f)';
    this.ctx.drawImage(source, 0, 0);
    this.ctx.restore();
  }

  private applyGlitch(source: HTMLCanvasElement) {
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    // RGB shift
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'screen';
    this.ctx.fillStyle = 'rgba(255,0,0,0.5)';
    this.ctx.drawImage(source, 10, 0, width, height);
    this.ctx.fillStyle = 'rgba(0,255,255,0.5)';
    this.ctx.drawImage(source, -10, 0, width, height);
    this.ctx.restore();
    
    // Slice and offset
    for (let i = 0; i < 5; i++) {
      const sliceY = Math.random() * height;
      const sliceH = Math.random() * 50;
      const offset = (Math.random() - 0.5) * 50;
      this.ctx.drawImage(source, 0, sliceY, width, sliceH, offset, sliceY, width, sliceH);
    }
  }

  private applyCrtScanlines() {
    const width = this.canvas.width;
    const height = this.canvas.height;
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    for (let i = 0; i < height; i += 4) {
      this.ctx.fillRect(0, i, width, 1);
    }
    this.ctx.restore();
  }
}
