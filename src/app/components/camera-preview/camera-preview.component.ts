import { Component, ElementRef, ViewChild, EffectRef, effect, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebRtcService } from '../../services/webrtc.service';

@Component({
  selector: 'app-camera-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="camera-preview-card">
      <div class="video-container" [ngClass]="webrtcService.currentFilterName()">
        <video 
          #videoElement 
          autoplay 
          playsinline 
          [ngClass]="webrtcService.currentFilterName()"
        ></video>

        <!-- Hidden canvas for processing frame snapshots -->
        <canvas #canvasElement style="display: none;"></canvas>

        <!-- Screen Flash Overlay -->
        <div 
          class="screen-flash-overlay" 
          [class.active]="webrtcService.isFlashActive()"
        ></div>

        <!-- Countdown Overlay Badge -->
        @if (webrtcService.countdownValue() !== null) {
          <div class="countdown-overlay">
            @if (webrtcService.countdownValue()! > 0) {
              <div class="countdown-number pop-animation">
                {{ webrtcService.countdownValue() }}
              </div>
            } @else {
              <div class="cheese-text flash-animation">
                📸 CHEESE!
              </div>
            }
          </div>
        }

        <!-- Burst Shot Counter Badge -->
        @if (webrtcService.isCapturing()) {
          <div class="burst-badge">
            <span class="pulse-dot"></span>
            Shot {{ webrtcService.burstIndex() }} / 4
          </div>
        }

        <!-- Active Filter Watermark Tag -->
        <div class="filter-tag">
          Filter: {{ webrtcService.currentFilter().label }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .camera-preview-card {
      display: flex;
      justify-content: center;
      width: 100%;
      max-width: 640px;
      margin: 0 auto;
    }

    .video-container {
      position: relative;
      width: 100%;
      aspect-ratio: 4 / 3;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(255, 158, 187, 0.15);
      border: 1px solid rgba(255, 158, 187, 0.3);
    }

    video {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    /* Flash Animation Overlay */
    .screen-flash-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: #ffffff;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.05s ease-out;
      z-index: 10;
    }

    .screen-flash-overlay.active {
      opacity: 0.95;
      transition: opacity 0.01s ease-in;
    }

    /* Countdown Overlay */
    .countdown-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 158, 187, 0.2);
      backdrop-filter: blur(4px);
      z-index: 20;
    }

    .countdown-number {
      font-size: 7.5rem;
      font-weight: 900;
      background: linear-gradient(45deg, #ff9ebb, #c19ef5);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 4px 15px rgba(255, 158, 187, 0.4);
      font-family: 'Nunito', sans-serif;
    }

    .cheese-text {
      font-size: 3rem;
      font-weight: 900;
      color: #ff9ebb;
      text-shadow: 0 0 20px rgba(255, 158, 187, 0.6), 0 4px 8px rgba(255, 158, 187, 0.3);
      font-family: 'Nunito', sans-serif;
    }

    .pop-animation {
      animation: popZoom 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    @keyframes popZoom {
      0% {
        transform: scale(0.2);
        opacity: 0;
      }
      50% {
        transform: scale(1.2);
        opacity: 1;
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }

    /* Burst Badge */
    .burst-badge {
      position: absolute;
      top: 14px;
      right: 14px;
      background: linear-gradient(135deg, #ff9ebb, #c19ef5);
      color: #ffffff;
      padding: 6px 14px;
      border-radius: 25px;
      font-size: 0.9rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
      z-index: 15;
      box-shadow: 0 4px 15px rgba(255, 158, 187, 0.4);
      font-family: 'Nunito', sans-serif;
    }

    .pulse-dot {
      width: 10px;
      height: 10px;
      background-color: #ffffff;
      border-radius: 50%;
      animation: pulse 1s infinite;
    }

    @keyframes pulse {
      0% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.8); }
      100% { opacity: 1; transform: scale(1); }
    }

    /* Filter Tag */
    .filter-tag {
      position: absolute;
      bottom: 12px;
      left: 12px;
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(4px);
      color: #5a4a6a;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.5px;
      z-index: 15;
      border: 1px solid rgba(255, 158, 187, 0.3);
      font-family: 'Nunito', sans-serif;
    }
  `]
})
export class CameraPreviewComponent implements OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;

  readonly webrtcService = inject(WebRtcService);
  private streamEffect: EffectRef;

  constructor() {
    this.streamEffect = effect(() => {
      const stream = this.webrtcService.stream();
      if (this.videoElement && this.videoElement.nativeElement) {
        const video = this.videoElement.nativeElement;
        if ('srcObject' in video) {
          video.srcObject = stream;
        } else {
          (video as any).src = stream ? URL.createObjectURL(stream as any) : '';
        }
      }
    });
  }

  takeSnapshot(): Promise<string | null> {
    if (this.videoElement && this.canvasElement) {
      return this.webrtcService.triggerSingleSnap(
        this.videoElement.nativeElement,
        this.canvasElement.nativeElement
      );
    }
    return Promise.resolve(null);
  }

  startBurst(): Promise<void> {
    if (this.videoElement && this.canvasElement) {
      return this.webrtcService.startBurstCapture(
        this.videoElement.nativeElement,
        this.canvasElement.nativeElement
      );
    }
    return Promise.resolve();
  }

  ngOnDestroy(): void {
    this.streamEffect.destroy();
  }
}
