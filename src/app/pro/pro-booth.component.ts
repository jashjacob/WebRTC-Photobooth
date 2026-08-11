import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, inject, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaceTrackingService } from './face-tracking.service';
import { FilterControlsComponent } from '../components/filter-controls/filter-controls.component';
import { FilmStripPreviewComponent } from '../components/film-strip-preview/film-strip-preview.component';
import { WebRtcService } from '../services/webrtc.service';

interface ARMask {
  id: string;
  name: string;
  emoji: string;
}

const AR_MASKS: ARMask[] = [
  { id: 'visor', name: 'Cyberpunk Visor', emoji: '🕶️' },
  { id: 'cat', name: 'Kawaii Cat', emoji: '🐱' },
  { id: 'blush', name: 'Anime Blush', emoji: '😳' },
  { id: 'none', name: 'No Mask', emoji: '✖️' },
];

@Component({
    selector: 'app-pro-booth',
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
            <video 
              #videoElement 
              autoplay 
              playsinline 
              muted
              [ngClass]="webrtcService.currentFilterName()"
            ></video>
            <canvas #canvasElement></canvas>
            
            @if (hasCameraError) {
              <div class="error-banner">
                ⚠️ Camera access denied. Please allow camera permissions and reload.
              </div>
            } @else if (faceTracking.hasFailed()) {
              <div class="ml-error-banner">
                <p>⚠️ Failed to load AI face tracking model.</p>
                <button (click)="retryML()">Retry</button>
              </div>
            } @else if (!faceTracking.isReady()) {
              <div class="loading-overlay">
                Downloading 5MB AI Models...<br>
                Please wait
              </div>
            }
          </div>
          
          <div class="ar-mask-selector">
            <button class="nav-btn" (click)="prevMask()">◀</button>
            <div class="active-mask">
              <span class="mask-emoji">{{ activeMask().emoji }}</span>
              <span class="mask-name">{{ activeMask().name }}</span>
            </div>
            <button class="nav-btn" (click)="nextMask()">▶</button>
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
    :host {
      display: block;
      width: 100%;
    }
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
      min-width: 0;
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
    .ar-mask-selector {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #111827;
      border: 2px solid #00F3FF;
      border-radius: 16px;
      padding: 12px;
      box-shadow: 0 4px 16px rgba(0, 243, 255, 0.15);
    }
    .nav-btn {
      background: transparent;
      border: none;
      color: #00F3FF;
      font-size: 1.5rem;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .nav-btn:hover {
      transform: scale(1.2);
    }
    .active-mask {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .mask-emoji {
      font-size: 2.2rem;
    }
    .mask-name {
      color: #00F3FF;
      font-weight: 900;
      font-size: 0.95rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 4px;
    }
    .controls {
      margin-top: 20px;
    }
    .error-banner {
      position: absolute;
      top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: rgba(220, 38, 38, 0.9);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      text-align: center;
      font-weight: bold;
    }
    .ml-error-banner {
      position: absolute;
      top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: #8b0000;
      color: white;
      padding: 20px;
      border-radius: 12px;
      text-align: center;
      z-index: 20;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    .ml-error-banner button {
      background: white;
      color: #8b0000;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
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
  private isDestroyed = false;
  hasCameraError = false;
  
  readonly masks = AR_MASKS;
  readonly activeMaskIndex = signal(0);
  
  private imgVisor = new Image();
  private imgCatEarLeft = new Image();
  private imgCatEarRight = new Image();
  private imgCatNose = new Image();
  
  onClose = output<void>();

  async ngAfterViewInit() {
    this.imgVisor.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgNjAiPjxwYXRoIGQ9Ik0xMCwxMCBMMTkwLDEwIEwxNzAsNTAgTDMwLDUwIFoiIGZpbGw9InJnYmEoMCwgMjQzLCAyNTUsIDAuNCkiIHN0cm9rZT0iIzAwRjNGRiIgc3Ryb2tlLXdpZHRoPSI0Ii8+PHJlY3QgeD0iMzAiIHk9IjIwIiB3aWR0aD0iMTQwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjMDBGM0ZGIi8+PC9zdmc+';
    this.imgCatEarLeft.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cG9seWdvbiBwb2ludHM9IjUwLDEwIDkwLDkwIDEwLDkwIiBmaWxsPSJwaW5rIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjUiLz48L3N2Zz4=';
    this.imgCatEarRight.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cG9seWdvbiBwb2ludHM9IjUwLDEwIDkwLDkwIDEwLDkwIiBmaWxsPSJwaW5rIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjUiLz48L3N2Zz4=';
    this.imgCatNose.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgNTAiPjxwYXRoIGQ9Ik0yMCwyNSBRNTAsNTAgODAsMjUgUTUwLDAgMjAsMjUiIGZpbGw9InBpbmsiLz48cGF0aCBkPSJNMTAsMjUgTC0yMCwxNSBNMTAsMjUgTC0yMCwyNSBNMTAsMjUgTC0yMCwzNSBNOTAsMjUgTDEyMCwxNSBNOTAsMjUgTDEyMCwyNSBNOTAsMjUgTDEyMCwzNSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSI2Ii8+PC9zdmc+';
    // Camera is already started by global Landing Modal. Just attach the stream.
    if (this.isDestroyed) return;
    
    this.stream = this.webrtcService.stream();
    if (this.stream && this.videoRef) {
      this.videoRef.nativeElement.srcObject = this.stream;
      await this.faceTracking.initialize();
      this.renderLoop();
    }
  }

  async retryML(): Promise<void> {
    this.faceTracking.reset();
    await this.faceTracking.initialize();
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

  activeMask() {
    return this.masks[this.activeMaskIndex()];
  }

  nextMask() {
    const next = (this.activeMaskIndex() + 1) % this.masks.length;
    this.activeMaskIndex.set(next);
  }

  prevMask() {
    const prev = (this.activeMaskIndex() - 1 + this.masks.length) % this.masks.length;
    this.activeMaskIndex.set(prev);
  }
  
  renderLoop = () => {
    if (this.isDestroyed) return;
    
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
      
      try {
        const results = this.faceTracking.detectVideoFrame(video, performance.now());
        if (results && results.faceLandmarks.length > 0) {
        const landmarks = results.faceLandmarks[0];
        
        const maskId = this.activeMask().id;
        
        if (maskId === 'visor') {
          const leftEye = landmarks[33];
          const rightEye = landmarks[263];
          const lx = leftEye.x * canvas.width;
          const rx = rightEye.x * canvas.width;
          const cx = (lx + rx) / 2;
          const cy = (leftEye.y + rightEye.y) / 2 * canvas.height;
          const width = Math.abs(rx - lx) * 2.8; 
          const height = width * 0.4;
          const angle = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);
          
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(angle); 
          ctx.drawImage(this.imgVisor, -width/2, -height/2, width, height);
          ctx.restore();
          
        } else if (maskId === 'cat') {
          // Forehead / Ears
          const forehead = landmarks[10];
          const leftForehead = landmarks[21];
          const rightForehead = landmarks[251];
          const lx = leftForehead.x * canvas.width;
          const rx = rightForehead.x * canvas.width;
          const fx = forehead.x * canvas.width;
          const fy = forehead.y * canvas.height;
          const earWidth = Math.abs(rx - lx) * 1.5;
          const earHeight = earWidth;
          const angle = Math.atan2(rightForehead.y - leftForehead.y, rightForehead.x - leftForehead.x);
          
          ctx.save();
          ctx.translate(fx, fy - earHeight/2);
          ctx.rotate(angle);
          // Draw left ear
          ctx.drawImage(this.imgCatEarLeft, -earWidth, -earHeight/2, earWidth, earHeight);
          // Draw right ear
          ctx.drawImage(this.imgCatEarRight, 0, -earHeight/2, earWidth, earHeight);
          ctx.restore();
          
          // Nose & Whiskers
          const nose = landmarks[1];
          const nx = nose.x * canvas.width;
          const ny = nose.y * canvas.height;
          const noseWidth = Math.abs(rx - lx) * 1.2;
          const noseHeight = noseWidth * 0.5;
          
          ctx.save();
          ctx.translate(nx, ny);
          ctx.rotate(angle);
          ctx.drawImage(this.imgCatNose, -noseWidth/2, -noseHeight/2, noseWidth, noseHeight);
          ctx.restore();
          
        } else if (maskId === 'blush') {
          // Cheeks
          const leftCheek = landmarks[116];
          const rightCheek = landmarks[345];
          const lx = leftCheek.x * canvas.width;
          const ly = leftCheek.y * canvas.height;
          const rx = rightCheek.x * canvas.width;
          const ry = rightCheek.y * canvas.height;
          
          const angle = Math.atan2(rightCheek.y - leftCheek.y, rightCheek.x - leftCheek.x);
          const blushWidth = Math.abs(rx - lx) * 0.4;
          const blushHeight = blushWidth * 0.6;
          
          ctx.save();
          ctx.fillStyle = 'rgba(255, 105, 180, 0.6)';
          ctx.filter = 'blur(6px)';
          
          // Left cheek
          ctx.translate(lx, ly);
          ctx.rotate(angle);
          ctx.beginPath();
          ctx.ellipse(0, 0, blushWidth/2, blushHeight/2, 0, 0, 2 * Math.PI);
          ctx.fill();
          ctx.resetTransform();
          
          // Right cheek
          ctx.translate(rx, ry);
          ctx.rotate(angle);
          ctx.beginPath();
          ctx.ellipse(0, 0, blushWidth/2, blushHeight/2, 0, 0, 2 * Math.PI);
          ctx.fill();
          
          ctx.restore();
        }
      }
      } catch (err) {
        console.error('Face tracking error:', err);
      }
    }
    this.animationFrameId = requestAnimationFrame(this.renderLoop);
  }
  
  closePro() {
    this.onClose.emit();
  }

  ngOnDestroy() {
    this.isDestroyed = true;
    cancelAnimationFrame(this.animationFrameId);
    if (this.videoRef?.nativeElement) {
      this.videoRef.nativeElement.srcObject = null;
    }
  }
}
