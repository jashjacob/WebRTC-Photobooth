import { Component, ElementRef, ViewChild, effect, inject, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebRtcService } from '../../services/webrtc.service';

@Component({
    selector: 'app-camera-preview',
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="camera-preview-card">
      <div class="video-container">
        <video 
          #videoElement 
          autoplay 
          playsinline 
          muted
          [ngClass]="webrtcService.currentFilterName()"
        ></video>

        <!-- Countdown Overlay Badge -->
        @if (webrtcService.countdownValue() !== null) {
          <div class="countdown-overlay" aria-live="polite">
            @if (webrtcService.countdownValue()! > 0) {
              <div class="countdown-number pop-animation">
                {{ webrtcService.countdownValue() }}
              </div>
            } @else {
              <div class="cheese-text">
                📸 CHEESE!
              </div>
            }
          </div>
        }

        <!-- Burst Shot Counter Badge -->
        @if (webrtcService.isCapturing()) {
          <div class="burst-badge" aria-live="polite">
            <span class="pulse-dot"></span>
            Shot {{ webrtcService.burstIndex() }} / 4
          </div>
        }

        <!-- Active Filter Watermark Tag -->
        <div class="filter-tag" aria-live="polite">
          {{ webrtcService.currentFilter().label }}
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
      background: #111827;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(255, 158, 187, 0.18);
      border: 2px solid rgba(255, 158, 187, 0.4);
      contain: layout paint;
    }

    video {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      /* GPU promotion and horizontal mirror for natural selfie camera view */
      transform: translateZ(0) scaleX(-1);
      backface-visibility: hidden;
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
      background: rgba(0, 0, 0, 0.35);
      z-index: 20;
    }

    .countdown-number {
      font-size: 7.5rem;
      font-weight: 900;
      color: #ffffff;
      text-shadow: 0 0 25px rgba(255, 158, 187, 0.9), 0 4px 12px rgba(0, 0, 0, 0.6);
      font-family: 'Nunito', sans-serif;
    }

    .cheese-text {
      font-size: 3rem;
      font-weight: 900;
      color: #fef08a;
      text-shadow: 0 0 20px rgba(254, 240, 138, 0.8), 0 4px 8px rgba(0, 0, 0, 0.6);
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
      background: linear-gradient(135deg, #ff6b8b, #a855f7);
      color: #ffffff;
      padding: 6px 14px;
      border-radius: 25px;
      font-size: 0.88rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 8px;
      z-index: 15;
      box-shadow: 0 4px 14px rgba(255, 107, 139, 0.4);
      font-family: 'Nunito', sans-serif;
    }

    .pulse-dot {
      width: 9px;
      height: 9px;
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
      background: rgba(0, 0, 0, 0.65);
      color: #ffffff;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 0.4px;
      z-index: 15;
      font-family: 'Nunito', sans-serif;
    }
  `]
})
export class CameraPreviewComponent implements OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;

  readonly webrtcService = inject(WebRtcService);

  constructor() {
    effect((onCleanup) => {
      const stream = this.webrtcService.stream();
      let objectUrl: string | null = null;

      if (this.videoElement && this.videoElement.nativeElement) {
        const video = this.videoElement.nativeElement;
        if ('srcObject' in video) {
          video.srcObject = stream;
        } else if (stream) {
          objectUrl = URL.createObjectURL(stream as any);
          (video as any).src = objectUrl;
        } else {
          (video as any).src = '';
        }
      }

      onCleanup(() => {
        if (objectUrl) {
          try {
            URL.revokeObjectURL(objectUrl);
          } catch (e) {
            // Ignore revoke error
          }
        }
      });
    });
  }

  takeSnapshot(): Promise<string | null> {
    if (this.videoElement) {
      return this.webrtcService.triggerSingleSnap(this.videoElement.nativeElement);
    }
    return Promise.resolve(null);
  }

  startBurst(): Promise<void> {
    if (this.videoElement) {
      return this.webrtcService.startBurstCapture(this.videoElement.nativeElement);
    }
    return Promise.resolve();
  }

  ngOnDestroy(): void {
    this.webrtcService.stopCamera();
    if (this.videoElement?.nativeElement) {
      this.videoElement.nativeElement.srcObject = null;
    }
  }
}
