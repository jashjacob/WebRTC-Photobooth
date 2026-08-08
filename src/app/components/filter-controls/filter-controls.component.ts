import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebRtcService } from '../../services/webrtc.service';
import { AudioService } from '../../services/audio.service';

@Component({
  selector: 'app-filter-controls',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="controls-container">
      <!-- Countdown Duration Selector -->
      <div class="timer-selector">
        <span class="timer-label">⏱️ Countdown Timer:</span>
        <div class="timer-options">
          <button 
            type="button" 
            class="timer-btn" 
            [class.active]="webrtcService.countdownSeconds() === 3"
            [disabled]="webrtcService.isCapturing()"
            (click)="webrtcService.setCountdownSeconds(3)"
          >
            3 Seconds
          </button>
          <button 
            type="button" 
            class="timer-btn" 
            [class.active]="webrtcService.countdownSeconds() === 5"
            [disabled]="webrtcService.isCapturing()"
            (click)="webrtcService.setCountdownSeconds(5)"
          >
            5 Seconds
          </button>
        </div>
      </div>

      <div class="button-group">
        <!-- Start / Stop Camera -->
        <button 
          id="btn1" 
          class="btn btn-primary" 
          [disabled]="webrtcService.isStreaming() || webrtcService.isCapturing()" 
          (click)="onStart()"
        >
          📹 Start Camera
        </button>

        <!-- Change Filter -->
        <button 
          id="btn2" 
          class="btn btn-secondary" 
          [disabled]="!webrtcService.isStreaming() || webrtcService.isCapturing()" 
          (click)="onChangeFilter()"
        >
          🎨 Filter: {{ webrtcService.currentFilter().label }}
        </button>

        <!-- Single Photo Snap -->
        <button 
          id="btn3" 
          class="btn btn-snap" 
          [disabled]="!webrtcService.isStreaming() || webrtcService.isCapturing()" 
          (click)="onSnap()"
        >
          📷 Single Photo ({{ webrtcService.countdownSeconds() }}s)
        </button>

        <!-- 4-Shot Photobooth Burst -->
        <button 
          id="btn4" 
          class="btn btn-burst" 
          [disabled]="!webrtcService.isStreaming() || webrtcService.isCapturing()" 
          (click)="onBurst()"
        >
          📸 Start 4-Shot Burst ({{ webrtcService.countdownSeconds() }}s)
        </button>

        <!-- Audio Toggle -->
        <button 
          id="btnAudio" 
          class="btn btn-icon" 
          (click)="onToggleAudio()"
          [title]="audioService.isMuted() ? 'Unmute countdown audio' : 'Mute countdown audio'"
        >
          {{ audioService.isMuted() ? '🔇 Audio Off' : '🔊 Audio On' }}
        </button>
      </div>

      <!-- Quick Action / Download Links -->
      <div class="download-bar">
        @if (webrtcService.filmStripDataUrl()) {
          <button id="downloadFilmStrip" class="btn btn-success" (click)="onDownloadFilmStrip()">
            🎞️ Download Film Strip Collage
          </button>
        }
        @if (webrtcService.capturedImageDataUrl()) {
          <a id="download" class="download-link-btn" (click)="onDownloadSingle()">
            💾 Download Last Photo
          </a>
        }
      </div>
    </div>
  `,
  styles: [`
    .controls-container {
      margin-top: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      width: 100%;
      font-family: 'Nunito', sans-serif;
    }

    .timer-selector {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(8px);
      padding: 8px 16px;
      border-radius: 20px;
      border: 1px solid rgba(255, 158, 187, 0.3);
      box-shadow: 0 8px 32px rgba(255, 158, 187, 0.15);
    }

    .timer-label {
      font-size: 0.9rem;
      font-weight: 700;
      color: #5a4a6a;
    }

    .timer-options {
      display: flex;
      gap: 6px;
    }

    .timer-btn {
      background: rgba(255, 158, 187, 0.1);
      border: 1px solid rgba(255, 158, 187, 0.3);
      color: #5a4a6a;
      padding: 6px 14px;
      border-radius: 25px;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: 'Nunito', sans-serif;
    }

    .timer-btn:hover:not(:disabled) {
      background: rgba(255, 158, 187, 0.2);
    }

    .timer-btn.active {
      background: linear-gradient(135deg, #ff9ebb, #c19ef5);
      color: #ffffff;
      border-color: #ff9ebb;
      box-shadow: 0 4px 12px rgba(255, 158, 187, 0.3);
    }

    .timer-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .button-group {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      gap: 12px;
    }

    .btn {
      padding: 10px 20px;
      font-size: 0.95rem;
      font-weight: 700;
      border: none;
      border-radius: 25px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
      box-shadow: 0 8px 32px rgba(255, 158, 187, 0.15);
      font-family: 'Nunito', sans-serif;
      color: #5a4a6a;
    }

    .btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(255, 158, 187, 0.25);
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .btn-primary {
      background: linear-gradient(135deg, #98d8a8, #87ceeb);
    }
    .btn-primary:hover:not(:disabled) {
      background: linear-gradient(135deg, #87ceeb, #98d8a8);
    }

    .btn-secondary {
      background: linear-gradient(135deg, #c19ef5, #ff9ebb);
    }
    .btn-secondary:hover:not(:disabled) {
      background: linear-gradient(135deg, #ff9ebb, #c19ef5);
    }

    .btn-snap {
      background: linear-gradient(135deg, #87ceeb, #c19ef5);
    }
    .btn-snap:hover:not(:disabled) {
      background: linear-gradient(135deg, #c19ef5, #87ceeb);
    }

    .btn-burst {
      background: linear-gradient(135deg, #ff9ebb, #ffb347);
    }
    .btn-burst:hover:not(:disabled) {
      background: linear-gradient(135deg, #ffb347, #ff9ebb);
    }

    .btn-icon {
      background: rgba(255, 158, 187, 0.15);
      border: 1px solid rgba(255, 158, 187, 0.3);
    }
    .btn-icon:hover:not(:disabled) {
      background: rgba(255, 158, 187, 0.25);
    }

    .btn-success {
      background: linear-gradient(135deg, #98d8a8, #87ceeb);
    }
    .btn-success:hover:not(:disabled) {
      background: linear-gradient(135deg, #87ceeb, #98d8a8);
    }

    .download-bar {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      gap: 16px;
      margin-top: 4px;
    }

    .download-link-btn {
      font-size: 0.9rem;
      font-weight: 700;
      color: #c19ef5;
      text-decoration: underline;
      cursor: pointer;
      font-family: 'Nunito', sans-serif;
    }
    .download-link-btn:hover {
      color: #ff9ebb;
    }
  `]
})
export class FilterControlsComponent {
  readonly webrtcService = inject(WebRtcService);
  readonly audioService = inject(AudioService);

  @Output() snapClicked = new EventEmitter<void>();
  @Output() burstClicked = new EventEmitter<void>();

  onStart(): void {
    this.webrtcService.startCamera();
  }

  onChangeFilter(): void {
    this.webrtcService.cycleFilter();
  }

  onSnap(): void {
    this.snapClicked.emit();
  }

  onBurst(): void {
    this.burstClicked.emit();
  }

  onToggleAudio(): void {
    this.audioService.toggleMute();
  }

  onDownloadSingle(): void {
    this.webrtcService.downloadSinglePhoto();
  }

  onDownloadFilmStrip(): void {
    this.webrtcService.downloadFilmStrip();
  }
}
