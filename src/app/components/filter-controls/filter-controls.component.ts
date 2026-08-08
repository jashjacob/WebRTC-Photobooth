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
    }

    .timer-selector {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #161b22;
      padding: 6px 14px;
      border-radius: 20px;
      border: 1px solid #30363d;
    }

    .timer-label {
      font-size: 0.85rem;
      font-weight: 700;
      color: #94a3b8;
    }

    .timer-options {
      display: flex;
      gap: 6px;
    }

    .timer-btn {
      background: #21262d;
      border: 1px solid #30363d;
      color: #8b949e;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .timer-btn:hover:not(:disabled) {
      background: #30363d;
      color: #f0f6fc;
    }

    .timer-btn.active {
      background: #388bfd;
      color: #ffffff;
      border-color: #58a6ff;
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
      padding: 10px 18px;
      font-size: 0.95rem;
      font-weight: 700;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .btn-primary {
      background: #72F0EB;
      color: #0d1117;
    }
    .btn-primary:hover:not(:disabled) {
      background: #50d0ca;
    }

    .btn-secondary {
      background: #30363d;
      color: #f0f6fc;
      border: 1px solid #484f58;
    }
    .btn-secondary:hover:not(:disabled) {
      background: #484f58;
    }

    .btn-snap {
      background: #1f6feb;
      color: #ffffff;
    }
    .btn-snap:hover:not(:disabled) {
      background: #388bfd;
    }

    .btn-burst {
      background: linear-gradient(135deg, #e11d48 0%, #be123c 100%);
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(225, 29, 72, 0.4);
    }
    .btn-burst:hover:not(:disabled) {
      background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);
      box-shadow: 0 6px 18px rgba(225, 29, 72, 0.6);
    }

    .btn-icon {
      background: #21262d;
      color: #8b949e;
      border: 1px solid #30363d;
    }
    .btn-icon:hover:not(:disabled) {
      background: #30363d;
      color: #c9d1d9;
    }

    .btn-success {
      background: #238636;
      color: #ffffff;
    }
    .btn-success:hover:not(:disabled) {
      background: #2ea043;
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
      font-weight: 600;
      color: #58a6ff;
      text-decoration: underline;
      cursor: pointer;
    }
    .download-link-btn:hover {
      color: #79c0ff;
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
