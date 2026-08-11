import { Component, Output, EventEmitter, inject, ChangeDetectionStrategy } from '@angular/core';

import { WebRtcService } from '../../services/webrtc.service';
import { AudioService } from '../../services/audio.service';

@Component({
    selector: 'app-filter-controls',
    imports: [],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="controls-container">
      
      <!-- 1. Horizontal Live Filter Picker Carousel -->
      <div class="filter-carousel-section">
        <div class="section-title-row">
          <span class="section-badge">✨ Live Camera Filters</span>
          <span class="active-filter-indicator">{{ webrtcService.currentFilter().label }}</span>
        </div>
        <div class="filter-scroll-track">
          @for (f of webrtcService.filters; track f.name; let i = $index) {
            <button
              type="button"
              class="filter-chip"
              [class.active]="webrtcService.filterIndex() === i"
              [disabled]="webrtcService.isCapturing()"
              (click)="webrtcService.setFilterIndex(i)"
              [title]="'Select ' + f.label + ' filter'"
              [attr.aria-label]="f.label + ' filter'"
              [attr.aria-pressed]="webrtcService.filterIndex() === i"
            >
              <span class="chip-icon">{{ f.emoji }}</span>
              <span class="chip-label">{{ f.label }}</span>
            </button>
          }
        </div>
      </div>

      <!-- 2. Main Shutter Console Card -->
      <div class="shutter-console-card">
        
        <!-- Header Controls Row: Timer & Audio -->
        <div class="console-top-row">
          <!-- Segmented Countdown Timer -->
          <div class="timer-segment">
            <span class="timer-tag">⏱️ Countdown:</span>
            <div class="segmented-pill">
              <button 
                type="button" 
                class="seg-btn" 
                [class.active]="webrtcService.countdownSeconds() === 3"
                [disabled]="webrtcService.isCapturing()"
                (click)="webrtcService.setCountdownSeconds(3)"
                [attr.aria-pressed]="webrtcService.countdownSeconds() === 3"
              >
                3s
              </button>
              <button 
                type="button" 
                class="seg-btn" 
                [class.active]="webrtcService.countdownSeconds() === 5"
                [disabled]="webrtcService.isCapturing()"
                (click)="webrtcService.setCountdownSeconds(5)"
                [attr.aria-pressed]="webrtcService.countdownSeconds() === 5"
              >
                5s
              </button>
            </div>
          </div>

          <!-- Camera Stream & Audio Action Buttons -->
          <div class="console-mini-actions">
            @if (!webrtcService.isStreaming()) {
              <button 
                id="btn1" 
                class="mini-btn start-cam-btn" 
                (click)="onStart()"
                title="Start Camera Stream"
                aria-label="Start Camera"
              >
                📹 Start Camera
              </button>
            } @else {
              <button 
                class="mini-btn stop-cam-btn" 
                (click)="webrtcService.stopCamera()"
                title="Stop Camera (also aborts capture)"
                aria-label="Stop Camera"
              >
                🛑 Stop
              </button>
            }

            <button 
              id="btnAudio" 
              class="mini-btn audio-btn" 
              [class.muted]="audioService.isMuted()"
              (click)="onToggleAudio()"
              [title]="audioService.isMuted() ? 'Unmute countdown audio' : 'Mute countdown audio'"
              aria-label="Toggle audio"
              [attr.aria-pressed]="audioService.isMuted()"
            >
              {{ audioService.isMuted() ? '🔇 Muted' : '🔊 Sound On' }}
            </button>
          </div>
        </div>

        <!-- Giant Arcade Shutter & Snap Actions Row -->
        <div class="shutter-actions-row">
          <!-- Primary CTA: 4-Shot Photobooth Burst -->
          <button 
            id="btn4" 
            class="arcade-shutter-btn" 
            [class.capturing]="webrtcService.isCapturing()"
            [disabled]="!webrtcService.isStreaming() || webrtcService.isCapturing()" 
            (click)="onBurst()"
          >
            <div class="shutter-inner-content">
              <span class="shutter-icon">📸</span>
              <div class="shutter-text-stack">
                <strong class="shutter-main-text">
                  @if (webrtcService.isCapturing()) {
                    Taking Shot {{ webrtcService.burstIndex() }} / 4...
                  } @else {
                    Start 4-Shot Burst
                  }
                </strong>
                <small class="shutter-sub-text">Auto-generates vertical film strip</small>
              </div>
            </div>
          </button>

          <!-- Secondary Quick Snap Button -->
          <button 
            id="btn3" 
            class="single-snap-pill-btn" 
            [disabled]="!webrtcService.isStreaming() || webrtcService.isCapturing()" 
            (click)="onSnap()"
            title="Capture a single photo"
          >
            <span>📷</span> Single Snap
          </button>
        </div>
      </div>

    </div>
  `,
    styles: [`
    .controls-container {
      margin-top: 14px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
      margin-left: auto;
      margin-right: auto;
      font-family: 'Nunito', sans-serif;
    }

    /* 1. Filter Carousel Section */
    .filter-carousel-section {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(12px);
      border-radius: 20px;
      padding: 12px 14px;
      border: 1px solid rgba(255, 158, 187, 0.4);
      box-shadow: 0 6px 20px rgba(255, 158, 187, 0.12);
      position: relative; /* for fade-edge pseudo elements */
    }

    /* Fade edge to signal scrollability without clipping text */
    .filter-carousel-section::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 48px;
      height: 100%;
      background: linear-gradient(to right, transparent, rgba(255,255,255,0.9));
      border-radius: 0 20px 20px 0;
      pointer-events: none;
      z-index: 1;
    }

    .section-title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      padding: 0 4px;
    }

    .section-badge {
      font-size: 0.82rem;
      font-weight: 800;
      color: #9333ea;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .active-filter-indicator {
      font-size: 0.82rem;
      font-weight: 800;
      color: #be123c;
      background: #ffe4e6;
      padding: 2px 10px;
      border-radius: 12px;
    }

    .filter-scroll-track {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 6px;
      padding-right: 48px; /* room for fade edge */
      scrollbar-width: thin;
      scroll-behavior: smooth;
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
    }

    .filter-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: #ffffff;
      border: 1.5px solid #fed7e2;
      border-radius: 20px;
      cursor: pointer;
      white-space: nowrap;
      font-size: 0.82rem;
      font-weight: 700;
      color: #5a4a6a;
      transition: transform 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
      flex-shrink: 0;
      font-family: 'Nunito', sans-serif;
      scroll-snap-align: start;
    }

    .filter-chip:hover:not(:disabled) {
      transform: translateY(-2px);
      border-color: #ff9ebb;
      background: #fff5f7;
    }

    .filter-chip.active {
      background: linear-gradient(135deg, #ff9ebb 0%, #c19ef5 100%);
      color: #ffffff;
      border-color: transparent;
      box-shadow: 0 4px 12px rgba(255, 158, 187, 0.4);
      transform: translateY(-2px) scale(1.02);
    }

    .filter-chip:focus-visible {
      outline: 3px solid #ff69b4;
      outline-offset: 2px;
    }

    .filter-chip:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .chip-icon {
      font-size: 1rem;
    }

    /* 2. Shutter Console Card - sticky on mobile so always reachable */
    .shutter-console-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(16px);
      border-radius: 24px;
      padding: 16px 20px;
      border: 1px solid rgba(255, 158, 187, 0.4);
      box-shadow: 0 8px 24px rgba(255, 158, 187, 0.15);
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    @media (max-width: 959px) {
      .shutter-console-card {
        position: sticky;
        bottom: 0;
        z-index: 100;
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
        box-shadow: 0 -4px 24px rgba(255, 158, 187, 0.25);
        margin: 0 -4px; /* bleed to edges on narrow screens */
      }
    }

    .console-top-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }

    /* Segmented Timer */
    .timer-segment {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .timer-tag {
      font-size: 0.82rem;
      font-weight: 700;
      color: #718096;
    }

    .segmented-pill {
      display: flex;
      background: #f1f5f9;
      border-radius: 20px;
      padding: 2px;
      border: 1px solid #e2e8f0;
    }

    .seg-btn {
      border: none;
      background: transparent;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 0.8rem;
      font-weight: 800;
      color: #64748b;
      cursor: pointer;
      transition: background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
      font-family: 'Nunito', sans-serif;
    }

    .seg-btn.active {
      background: #ffffff;
      color: #ff6b8b;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }

    .seg-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Console Mini Actions */
    .console-mini-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .mini-btn {
      padding: 6px 14px;
      border-radius: 18px;
      font-size: 0.8rem;
      font-weight: 800;
      border: none;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      font-family: 'Nunito', sans-serif;
    }

    .start-cam-btn {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #ffffff;
      box-shadow: 0 3px 8px rgba(16, 185, 129, 0.3);
    }

    .start-cam-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 5px 12px rgba(16, 185, 129, 0.4);
    }

    .stop-cam-btn {
      background: #fee2e2;
      color: #dc2626;
      border: 1px solid #fca5a5;
    }

    .audio-btn {
      background: #f3e8ff;
      color: #7e22ce;
      border: 1px solid #d8b4fe;
    }

    .audio-btn.muted {
      background: #f1f5f9;
      color: #94a3b8;
      border-color: #cbd5e1;
    }

    .mini-btn:hover:not(:disabled) {
      transform: translateY(-1px);
    }

    .mini-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .mini-btn:focus-visible {
      outline: 3px solid #ff69b4;
      outline-offset: 2px;
    }

    /* Shutter Actions Row */
    .shutter-actions-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    /* Giant Arcade Shutter Button */
    .arcade-shutter-btn {
      flex: 1;
      position: relative;
      background: linear-gradient(135deg, #e11d48 0%, #ea580c 100%);
      border: none;
      border-radius: 20px;
      padding: 14px 20px;
      cursor: pointer;
      box-shadow: 0 8px 20px rgba(255, 107, 139, 0.4);
      transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.2s ease;
      color: #ffffff;
      font-family: 'Nunito', sans-serif;
      overflow: hidden;
    }

    .arcade-shutter-btn:hover:not(:disabled) {
      transform: translateY(-3px) scale(1.01);
      box-shadow: 0 12px 28px rgba(255, 107, 139, 0.55);
    }

    .arcade-shutter-btn:active:not(:disabled) {
      transform: translateY(1px) scale(0.98);
      box-shadow: 0 4px 12px rgba(255, 107, 139, 0.3);
    }

    .arcade-shutter-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .arcade-shutter-btn:focus-visible {
      outline: 3px solid #ff69b4;
      outline-offset: 3px;
    }

    .arcade-shutter-btn.capturing {
      background: linear-gradient(135deg, #7e22ce 0%, #db2777 100%);
    }

    .arcade-shutter-btn.capturing::after {
      content: '';
      position: absolute;
      top: -4px; left: -4px; right: -4px; bottom: -4px;
      border-radius: 24px;
      border: 3px solid #ec4899;
      animation: gpuPulse 1.2s infinite;
      pointer-events: none;
    }

    @keyframes gpuPulse {
      0% {
        transform: scale(0.96);
        opacity: 0.8;
      }
      100% {
        transform: scale(1.12);
        opacity: 0;
      }
    }

    .shutter-inner-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      position: relative;
      z-index: 1;
    }

    .shutter-icon {
      font-size: 1.8rem;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    }

    .shutter-text-stack {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      text-align: left;
    }

    .shutter-main-text {
      font-size: 1.15rem;
      font-weight: 900;
      letter-spacing: -0.3px;
      line-height: 1.2;
    }

    .shutter-sub-text {
      font-size: 0.72rem;
      opacity: 0.92;
      font-weight: 700;
    }

    /* Single Snap Pill Button */
    .single-snap-pill-btn {
      padding: 14px 18px;
      border-radius: 20px;
      background: #ffffff;
      border: 2px solid #ff9ebb;
      color: #5a4a6a;
      font-weight: 800;
      font-size: 0.88rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
      box-shadow: 0 4px 10px rgba(255, 158, 187, 0.15);
      font-family: 'Nunito', sans-serif;
      white-space: nowrap;
    }

    .single-snap-pill-btn:hover:not(:disabled) {
      background: #fff5f7;
      transform: translateY(-2px);
      box-shadow: 0 6px 14px rgba(255, 158, 187, 0.25);
    }

    .single-snap-pill-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .single-snap-pill-btn:focus-visible {
      outline: 3px solid #ff69b4;
      outline-offset: 2px;
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

  onSnap(): void {
    this.snapClicked.emit();
  }

  onBurst(): void {
    this.burstClicked.emit();
  }

  onToggleAudio(): void {
    this.audioService.toggleMute();
  }
}
