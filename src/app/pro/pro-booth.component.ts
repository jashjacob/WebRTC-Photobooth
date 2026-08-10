import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaceTrackingService } from './face-tracking.service';
import { FilterControlsComponent } from '../components/filter-controls/filter-controls.component';
import { FilmStripPreviewComponent } from '../components/film-strip-preview/film-strip-preview.component';
import { WebRtcService } from '../services/webrtc.service';

@Component({
  selector: 'app-pro-booth',
  standalone: true,
  imports: [CommonModule, FilterControlsComponent, FilmStripPreviewComponent],
  template: `
    <div class="pro-container">
      <header class="app-header">
        <div class="header-badge">😎 AI POWERED</div>
        <h1>✨ PRO AR Booth ✨</h1>
        <p class="tagline">Real-time Face Tracking & Augmented Reality Masks</p>
        <button class="btn-primary" (click)="closePro()">← Exit Pro Mode</button>
      </header>

      <div class="photobooth-grid">
        <section class="stage-section">
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
          
          <app-filter-controls 
            (snapClicked)="takeSnapshot()"
            (burstClicked)="startBurst()"
          ></app-filter-controls>
        </section>

        <section class="strip-section">
          <app-film-strip-preview></app-film-strip-preview>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .pro-container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px 16px 48px 16px;
      box-sizing: border-box;
      position: relative;
      z-index: 1;
    }
    .app-header {
      text-align: center;
      margin-bottom: 24px;
    }
    .header-badge {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 900;
      color: #00F3FF;
      background: #111827;
      border: 1px solid #00F3FF;
      padding: 3px 14px;
      border-radius: 20px;
      margin-bottom: 6px;
      letter-spacing: 0.8px;
    }
    .app-header h1 {
      font-size: 2.8rem;
      margin: 0 0 6px 0;
      background: linear-gradient(135deg, #00F3FF 0%, #a855f7 50%, #ff6b8b 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 900;
      letter-spacing: -0.5px;
    }
    .tagline {
      margin: 0 0 16px 0;
      font-size: 1rem;
      color: #8a7a9a;
      font-weight: 700;
    }
    .photobooth-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 28px;
      align-items: start;
    }
    @media (min-width: 960px) {
      .photobooth-grid {
        grid-template-columns: 1.05fr 0.95fr;
      }
    }
    .stage-section, .strip-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .camera-wrapper {
      position: relative;
      width: 100%;
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
  readonly webrtcService = inject(WebRtcService);
  
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

  takeSnapshot() {
    if (this.videoRef && this.canvasRef) {
      this.webrtcService.triggerSingleSnap(this.videoRef.nativeElement, this.canvasRef.nativeElement);
    }
  }

  startBurst() {
    if (this.videoRef && this.canvasRef) {
      this.webrtcService.startBurstCapture(this.videoRef.nativeElement, this.canvasRef.nativeElement);
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
        
        // Use raw MediaPipe coordinates.
        // Because the <canvas> has CSS transform: scaleX(-1) applied to it,
        // it will automatically mirror our drawing to perfectly match the mirrored <video>.
        const lx = leftEye.x * canvas.width;
        const rx = rightEye.x * canvas.width;
        
        const cx = (lx + rx) / 2;
        const cy = (leftEye.y + rightEye.y) / 2 * canvas.height;
        
        // Scale glasses based on face width
        const width = Math.abs(rx - lx) * 2.8; 
        const height = width * 0.5;
        
        // Calculate tilt angle of the head
        const angle = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);
        
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle); 
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
