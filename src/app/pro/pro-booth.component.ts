import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaceTrackingService } from './face-tracking.service';

@Component({
  selector: 'app-pro-booth',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pro-container">
      <h2>😎 Pro AR Booth</h2>
      
      <div class="camera-wrapper">
        <video #videoElement autoplay playsinline muted></video>
        <canvas #canvasElement></canvas>
        
        @if (!faceTracking.isReady()) {
          <div class="loading-overlay">
            Downloading 5MB AI Models...<br>
            Please wait
          </div>
        }
      </div>
      
      <div class="controls">
        <button class="btn btn-primary" (click)="closePro()">← Exit Pro Mode</button>
      </div>
    </div>
  `,
  styles: [`
    .pro-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      padding: 20px;
    }
    .camera-wrapper {
      position: relative;
      width: 100%;
      max-width: 640px;
      aspect-ratio: 4/3;
      border-radius: 20px;
      overflow: hidden;
      background: #111827;
      box-shadow: 0 8px 32px rgba(0, 243, 255, 0.2);
      border: 2px solid rgba(0, 243, 255, 0.5);
    }
    video, canvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transform: scaleX(-1);
    }
    .loading-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      background: rgba(0,0,0,0.85);
      color: #00F3FF;
      font-weight: bold;
      font-size: 1.2rem;
      z-index: 10;
    }
    .controls {
      margin-top: 20px;
    }
    .btn-primary {
      padding: 12px 24px;
      background: #111827;
      color: #00F3FF;
      border: 2px solid #00F3FF;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-primary:hover {
      background: #00F3FF;
      color: #111827;
    }
  `]
})
export class ProBoothComponent implements AfterViewInit, OnDestroy {
  @ViewChild('videoElement') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  readonly faceTracking = inject(FaceTrackingService);
  private stream: MediaStream | null = null;
  private animationFrameId = 0;
  private lastVideoTime = -1;
  private sunglassesImage = new Image();
  
  onClose = output<void>();

  async ngAfterViewInit() {
    // Basic SVG sunglasses
    this.sunglassesImage.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50"><rect x="10" y="10" width="35" height="25" rx="5" fill="black"/><rect x="55" y="10" width="35" height="25" rx="5" fill="black"/><path d="M45 20 Q50 15 55 20" stroke="black" stroke-width="4" fill="none"/></svg>';
    
    await this.startCamera();
    await this.faceTracking.initialize();
    this.renderLoop();
  }
  
  async startCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
      });
      this.videoRef.nativeElement.srcObject = this.stream;
    } catch (e) {
      console.error('Camera access denied');
    }
  }
  
  renderLoop = () => {
    const video = this.videoRef?.nativeElement;
    const canvas = this.canvasRef?.nativeElement;
    if (!video || !canvas || !this.faceTracking.isReady()) {
      this.animationFrameId = requestAnimationFrame(this.renderLoop);
      return;
    }

    if (canvas.width !== video.videoWidth && video.videoWidth > 0) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    const ctx = canvas.getContext('2d');
    if (ctx && video.currentTime !== this.lastVideoTime && canvas.width > 0) {
      this.lastVideoTime = video.currentTime;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const results = this.faceTracking.detectVideoFrame(video, performance.now());
      if (results && results.faceLandmarks.length > 0) {
        const landmarks = results.faceLandmarks[0];
        
        // MediaPipe landmarks: 33 (left eye corner), 263 (right eye corner)
        const leftEye = landmarks[33];
        const rightEye = landmarks[263];
        
        // Mirroring coordinates because video is mirrored via CSS scaleX(-1)
        const rx = (1 - rightEye.x) * canvas.width;
        const lx = (1 - leftEye.x) * canvas.width;
        
        const cx = (lx + rx) / 2;
        const cy = (leftEye.y + rightEye.y) / 2 * canvas.height;
        
        // Scale glasses based on face width
        const width = Math.abs(lx - rx) * 2.8; 
        const height = width * 0.5;
        
        // Calculate tilt angle of the head
        const angle = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);
        
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-angle); // Rotate in opposite direction due to mirroring
        ctx.drawImage(this.sunglassesImage, -width/2, -height/2, width, height);
        ctx.restore();
      }
    }
    this.animationFrameId = requestAnimationFrame(this.renderLoop);
  }
  
  closePro() {
    this.onClose.emit();
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animationFrameId);
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
    }
  }
}
