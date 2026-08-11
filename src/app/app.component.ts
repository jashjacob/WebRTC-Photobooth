import { Component, ViewChild, inject, ChangeDetectionStrategy, HostListener, signal } from '@angular/core';

import { CameraPreviewComponent } from './components/camera-preview/camera-preview.component';
import { FilterControlsComponent } from './components/filter-controls/filter-controls.component';
import { FilmStripPreviewComponent } from './components/film-strip-preview/film-strip-preview.component';
import { ProBoothComponent } from './pro/pro-booth.component';
import { WebRtcService } from './services/webrtc.service';

@Component({
    selector: 'app-root',
    imports: [
    CameraPreviewComponent,
    FilterControlsComponent,
    FilmStripPreviewComponent,
    ProBoothComponent
],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="app-container" [class.pro-theme]="mode() === 'pro'">
      @if (!webrtcService.appInitialized()) {
        <div class="camera-landing-modal">
          <div class="modal-glass-card">
            @if (!webrtcService.errorMessage()) {
              <div class="modal-icon">📸</div>
              <h1 class="modal-title">Welcome to Kawaii Photobooth</h1>
              <p class="modal-subtitle">Snap, filter, and create a vintage film strip — right in your browser.</p>
              <button class="primary-btn pulse" (click)="webrtcService.startCamera()">Allow Camera Access</button>
              <p class="modal-hint">We only use your camera locally. No uploads, ever.</p>
            } @else {
              <div class="modal-icon">😔</div>
              <h1 class="modal-title">Camera Not Available</h1>
              <p class="modal-error-msg">{{ webrtcService.errorMessage() }}</p>
              <div class="modal-hint-box">
                <strong>How to fix this:</strong>
                <ol>
                  <li>Click the camera 🔒 icon in your browser's address bar.</li>
                  <li>Select <em>"Allow"</em> for camera access.</li>
                  <li>Refresh the page and try again.</li>
                </ol>
              </div>
              <button class="primary-btn" (click)="webrtcService.startCamera()">🔄 Retry</button>
            }
          </div>
        </div>
      } @else {
        @if (mode() === 'standard') {
        <!-- Full Page Studio White Flash Overlay -->
        <div 
          class="full-page-flash-overlay" 
          [class.active]="webrtcService.isFlashActive()"
        ></div>

        <!-- Session Progress Bar Header -->
        <div class="progress-bar-wrapper">
          <div 
            class="progress-bar" 
            [style.transform]="webrtcService.progressTransform()"
          ></div>
          <div class="progress-label-overlay">
            {{ webrtcService.progressText() }}
          </div>
        </div>

        <main class="main-content">
          <!-- Brand Header -->
          <header class="app-header">
            <div class="header-badge">🎀 VINTAGE 35MM STUDIO</div>
            <h1>✨ Kawaii Photobooth ✨</h1>
            <p class="tagline">4-Shot Automated Burst & Vertical Film Strip Collage Generator</p>
            <button 
              class="pro-mode-btn" 
              (click)="mode.set('pro')"
              [disabled]="webrtcService.isCapturing() || !webrtcService.isStreaming()"
              [title]="!webrtcService.isStreaming() ? 'Start camera first to use PRO masks' : ''"
            >Try PRO AR Masks 😎</button>
          </header>

          @if (webrtcService.errorMessage()) {
            <div class="error-banner">
              ⚠️ {{ webrtcService.errorMessage() }}
            </div>
          }

          <!-- 2-Column Photobooth Studio Layout -->
          <div class="photobooth-grid">
            <!-- Left Column: Camera Stage & Live Filter Deck -->
            <section class="stage-section">
              <app-camera-preview #cameraPreview></app-camera-preview>
              
              <app-filter-controls 
                (snapClicked)="cameraPreview.takeSnapshot()"
                (burstClicked)="cameraPreview.startBurst()"
              ></app-filter-controls>
            </section>

            <!-- Right Column: Vertical Film Strip Studio & Customizer -->
            <section class="strip-section">
              <app-film-strip-preview></app-film-strip-preview>
            </section>
          </div>
        </main>
      } @else {
        @defer {
          <app-pro-booth #proBooth (onClose)="mode.set('standard')"></app-pro-booth>
        } @loading {
          <div style="padding: 100px; color: #5a4a6a; font-weight: bold;">Loading Heavy PRO ML Models... (5MB)</div>
        }
      }
      }
    </div>
  `,
    styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      overflow-x: hidden;
      background: linear-gradient(135deg, #fff0f5 0%, #fce4ec 30%, #f3e5f5 60%, #e8eaf6 100%);
      background-attachment: fixed;
      color: #5a4a6a;
      font-family: 'Nunito', sans-serif;
      position: relative;
      transition: background 0.5s ease;
    }

    /* Dynamic Dark Theme for PRO Mode */
    .app-container.pro-theme {
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #171717 100%);
      color: #e2e8f0;
    }

    /* Landing Modal */
    .camera-landing-modal {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      backdrop-filter: blur(20px);
      background: rgba(255, 255, 255, 0.4);
    }
    
    .app-container.pro-theme .camera-landing-modal {
      background: rgba(0, 0, 0, 0.7);
    }

    .modal-glass-card {
      background: rgba(255, 255, 255, 0.7);
      padding: 60px 40px;
      border-radius: 32px;
      border: 1px solid rgba(255, 255, 255, 0.5);
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.1);
      text-align: center;
      max-width: 480px;
    }

    .app-container.pro-theme .modal-glass-card {
      background: rgba(30, 41, 59, 0.7);
      border-color: rgba(255, 255, 255, 0.1);
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
    }

    .modal-icon {
      font-size: 5rem;
      margin-bottom: 24px;
    }

    .modal-title {
      font-size: 2.2rem;
      font-weight: 900;
      margin-bottom: 12px;
      letter-spacing: -0.5px;
    }

    .modal-subtitle {
      font-size: 1.05rem;
      opacity: 0.8;
      margin-bottom: 32px;
      line-height: 1.6;
    }

    .modal-hint {
      margin-top: 16px;
      font-size: 0.82rem;
      opacity: 0.5;
    }

    .modal-error-msg {
      color: #dc2626;
      font-weight: 700;
      font-size: 1rem;
      margin-bottom: 20px;
      line-height: 1.5;
    }

    .modal-hint-box {
      background: rgba(0,0,0,0.06);
      border-radius: 16px;
      padding: 16px 20px;
      text-align: left;
      font-size: 0.9rem;
      line-height: 1.8;
      margin-bottom: 24px;
      width: 100%;
    }

    .modal-hint-box ol {
      margin: 8px 0 0 16px;
      padding: 0;
    }

    .primary-btn {
      background: linear-gradient(135deg, #ff69b4, #9370db);
      color: white;
      border: none;
      padding: 18px 40px;
      border-radius: 100px;
      font-size: 1.25rem;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(255, 105, 180, 0.4);
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .primary-btn:hover {
      transform: translateY(-4px) scale(1.05);
      box-shadow: 0 12px 32px rgba(255, 105, 180, 0.6);
    }

    .primary-btn.pulse {
      animation: gentlePulse 2s infinite;
    }

    @keyframes gentlePulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.02); }
      100% { transform: scale(1); }
    }

    /* Full-Page Studio Flash Overlay (Illuminates face from screen light) */
    .full-page-flash-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: #ffffff;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.28s cubic-bezier(0.1, 0.9, 0.2, 1);
      z-index: 99999;
      will-change: opacity;
    }

    .full-page-flash-overlay.active {
      opacity: 1;
      transition: opacity 0.02s ease-in;
    }

    /* Subtle dot pattern overlay */
    .app-container::before {
      content: '';
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background-image: radial-gradient(circle, #ffb6c1 1.2px, transparent 1.2px);
      background-size: 28px 28px;
      opacity: 0.18;
      pointer-events: none;
      z-index: 0;
    }

    .progress-bar-wrapper {
      position: relative;
      width: 100%;
      background-color: rgba(255, 182, 193, 0.25);
      height: 28px;
      overflow: hidden;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.03);
      z-index: 10;
    }

    .progress-bar {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, #ff9ebb 0%, #c19ef5 50%, #87ceeb 100%);
      transform-origin: left;
      transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      will-change: transform;
    }

    .progress-label-overlay {
      position: relative;
      z-index: 2;
      color: #ffffff;
      font-weight: 800;
      font-size: 0.82rem;
      text-align: center;
      line-height: 28px;
      text-shadow: 0 1px 2px rgba(90, 74, 106, 0.4);
      pointer-events: none;
    }

    .main-content {
      width: 100%;
      max-width: 1200px;
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
      color: #ff6b8b;
      background: #ffe4e6;
      border: 1px solid #fecdd3;
      padding: 3px 14px;
      border-radius: 20px;
      margin-bottom: 6px;
      letter-spacing: 0.8px;
    }

    .app-header h1 {
      font-size: 2.8rem;
      margin: 0 0 6px 0;
      background: linear-gradient(135deg, #ff6b8b 0%, #a855f7 50%, #38bdf8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 900;
      letter-spacing: -0.5px;
      filter: drop-shadow(0 2px 4px rgba(255, 107, 139, 0.2));
    }

    .tagline {
      margin: 0;
      font-size: 1rem;
      color: #8a7a9a;
      font-weight: 700;
    }

    .pro-mode-btn {
      margin-top: 12px;
      padding: 10px 24px;
      background: linear-gradient(135deg, #a855f7, #38bdf8);
      color: white;
      border: none;
      border-radius: 30px;
      font-size: 0.95rem;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(56, 189, 248, 0.4);
      transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .pro-mode-btn:hover:not(:disabled) {
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 6px 16px rgba(168, 85, 247, 0.5);
    }
    
    .pro-mode-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      filter: grayscale(1);
    }

    .error-banner {
      background: linear-gradient(135deg, #ff6b6b, #ee5a24);
      color: white;
      padding: 12px 20px;
      border-radius: 16px;
      margin-bottom: 20px;
      text-align: center;
      font-weight: 800;
      box-shadow: 0 4px 14px rgba(239, 68, 68, 0.25);
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
  `]
})
export class AppComponent {
  @ViewChild('cameraPreview') cameraPreview!: CameraPreviewComponent;
  @ViewChild('proBooth') proBooth!: ProBoothComponent;
  
  readonly webrtcService = inject(WebRtcService);
  readonly mode = signal<'standard' | 'pro'>('standard');

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      return;
    }
    if (this.webrtcService.isCapturing()) {
      return;
    }

    switch (event.code) {
      case 'Space':
        event.preventDefault();
        if (this.mode() === 'pro') this.proBooth?.startBurst();
        else this.cameraPreview?.startBurst();
        break;
      case 'Enter':
        event.preventDefault();
        if (this.mode() === 'pro') this.proBooth?.takeSnapshot();
        else this.cameraPreview?.takeSnapshot();
        break;
      case 'ArrowRight': {
        event.preventDefault();
        const current = this.webrtcService.filterIndex();
        const max = this.webrtcService.filters.length - 1;
        this.webrtcService.setFilterIndex(current === max ? 0 : current + 1);
        break;
      }
      case 'ArrowLeft': {
        event.preventDefault();
        const current = this.webrtcService.filterIndex();
        const max = this.webrtcService.filters.length - 1;
        this.webrtcService.setFilterIndex(current === 0 ? max : current - 1);
        break;
      }
      case 'Escape':
        event.preventDefault();
        this.webrtcService.clearPhotos();
        break;
    }
  }
}
