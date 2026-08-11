import { Component, effect, inject, OnDestroy, ChangeDetectionStrategy, viewChild, ElementRef } from '@angular/core';
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
      box-shadow: 0 24px 48px rgba(0,0,0,0.4);
      border: 4px solid #ffffff;
      contain: layout paint;
    }

    video {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transform: scaleX(-1); /* Mirror camera */
    }

    /* Countdown & Badges */
    .countdown-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      background: rgba(0,0,0,0.4);
      z-index: 10;
    }

    .countdown-number {
      font-size: 120px;
      font-weight: 900;
      color: #ffffff;
      text-shadow: 0 4px 20px rgba(0,0,0,0.5);
    }

    .cheese-text {
      font-size: 80px;
      font-weight: 900;
      color: #ffde00;
      text-shadow: 0 4px 20px rgba(0,0,0,0.5);
      animation: pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .pop-animation {
      animation: pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    @keyframes pop {
      0% { transform: scale(0.5); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }

    /* Recording Badge */
    .burst-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(220, 38, 38, 0.85);
      color: white;
      padding: 6px 12px;
      border-radius: 12px;
      font-weight: 800;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 8px;
      z-index: 10;
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
  readonly videoElement = viewChild<ElementRef<HTMLVideoElement>>('videoElement');
  readonly webrtcService = inject(WebRtcService);

  constructor() {
    effect((onCleanup) => {
      const stream = this.webrtcService.stream();
      const videoRef = this.videoElement();
      let objectUrl: string | null = null;

      if (videoRef && videoRef.nativeElement) {
        const video = videoRef.nativeElement;
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
    const videoRef = this.videoElement();
    if (videoRef) {
      return this.webrtcService.triggerSingleSnap(videoRef.nativeElement);
    }
    return Promise.resolve(null);
  }

  startBurst(): Promise<void> {
    const videoRef = this.videoElement();
    if (videoRef) {
      return this.webrtcService.startBurstCapture(videoRef.nativeElement);
    }
    return Promise.resolve();
  }

  ngOnDestroy(): void {
    const videoRef = this.videoElement();
    if (videoRef?.nativeElement) {
      videoRef.nativeElement.srcObject = null;
    }
  }
}
