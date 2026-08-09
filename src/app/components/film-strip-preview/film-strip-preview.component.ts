import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WebRtcService, FilmStripThemeKey } from '../../services/webrtc.service';
import { AudioService } from '../../services/audio.service';

@Component({
  selector: 'app-film-strip-preview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="film-strip-card">
      
      <!-- Studio Header -->
      <div class="card-header">
        <div class="header-text-group">
          <h2>🎞️ Film Strip Studio</h2>
          <p class="subtitle">Customize theme, caption, and export your 35mm collage</p>
        </div>
        @if (webrtcService.capturedPhotos().length > 0) {
          <button class="clear-session-btn" (click)="onClearPhotos()" title="Clear and retake photos">
            🗑️ Retake
          </button>
        }
      </div>

      <!-- Theme Selector Swatches -->
      <div class="theme-selector-section">
        <label class="section-label">🎨 Strip Theme & Border Style:</label>
        <div class="theme-swatch-grid">
          @for (themeKey of themeKeys; track themeKey) {
            <button 
              type="button"
              class="theme-chip" 
              [class.active]="webrtcService.selectedThemeKey() === themeKey"
              (click)="onSelectTheme(themeKey)"
              [title]="webrtcService.themes[themeKey].label"
            >
              <span class="theme-dot" [style.background-color]="webrtcService.themes[themeKey].bgColor" [style.border-color]="webrtcService.themes[themeKey].frameBorderColor"></span>
              <span class="theme-text">{{ webrtcService.themes[themeKey].label }}</span>
            </button>
          }
        </div>
      </div>

      <!-- Caption & Date Customization Box -->
      <div class="customization-deck">
        <div class="input-field-group">
          <label for="stripText">✍️ Custom Footer Title:</label>
          <input 
            id="stripText" 
            type="text" 
            [ngModel]="webrtcService.customFooterText()" 
            (ngModelChange)="onTextChange($event)"
            placeholder="e.g. PARTY MEMORIES 2026"
            maxlength="32"
          />
        </div>

        <div class="checkbox-field-group">
          <label class="cute-checkbox-label">
            <input 
              type="checkbox" 
              [checked]="webrtcService.includeTimestamp()" 
              (change)="onToggleTimestamp()" 
            />
            <span class="check-box-custom"></span>
            Include Timestamp
          </label>
        </div>
      </div>

      <!-- Burst Progress Indicator Thumbnails (1 to 4) -->
      <div class="burst-slots-panel">
        <div class="slots-header">
          <span class="slots-title">📸 Session Shots ({{ webrtcService.capturedPhotos().length }} / 4)</span>
          <span class="slots-hint" aria-live="polite">
            @if (webrtcService.capturedPhotos().length === 4) {
              ✨ Complete! Ready to print
            } @else if (webrtcService.isCapturing()) {
              ⏳ Capturing sequence...
            } @else {
              Ready for 4-shot burst
            }
          </span>
        </div>
        <div class="slots-grid">
          @for (slot of [0, 1, 2, 3]; track slot) {
            <div class="slot-box" [class.filled]="webrtcService.capturedPhotos()[slot]">
              @if (webrtcService.capturedPhotos()[slot]) {
                <img [src]="webrtcService.capturedPhotos()[slot]" [alt]="'Shot ' + (slot + 1)" />
                <span class="slot-badge">#{{ slot + 1 }}</span>
              } @else {
                <div class="empty-slot-content">
                  <span class="empty-camera-icon">📷</span>
                  <small>Shot {{ slot + 1 }}</small>
                </div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Generated Film Strip Canvas Output -->
      <div class="strip-output-container" aria-live="polite">
        @if (webrtcService.filmStripDataUrl()) {
          <!-- Printed Film Strip with Slide-in Animation -->
          <div class="film-strip-printout print-slide-in">
            <img 
              [src]="webrtcService.filmStripDataUrl()" 
              alt="Vertical 4-Shot Film Strip" 
              class="film-strip-img" 
            />
          </div>

          <!-- Quick Action Buttons -->
          <div class="action-buttons-stack">
            <button class="btn btn-download-strip pulse-glow" (click)="onDownloadStrip()">
              📥 Download Film Strip PNG
            </button>
            
            <div class="secondary-btn-row">
              <button class="btn btn-secondary-action" (click)="copyToClipboard()">
                {{ copySuccess ? '✅ Copied to Clipboard!' : '📋 Copy Image' }}
              </button>
              <button class="btn btn-secondary-action" (click)="onDownloadSingle()">
                📸 Save Latest Shot
              </button>
            </div>
          </div>
        } @else {
          <!-- Empty State Graphic -->
          <div class="empty-strip-hero">
            <div class="hero-graphic">🎞️</div>
            <h3>Your Film Strip Will Appear Here</h3>
            <p>Start a <strong>4-Shot Burst</strong> on the left to capture your photos and automatically generate your vintage vertical collage!</p>
          </div>
        }
      </div>

    </div>
  `,
  styles: [`
    .film-strip-card {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(12px);
      color: #5a4a6a;
      border-radius: 24px;
      padding: 22px;
      box-shadow: 0 10px 30px rgba(255, 158, 187, 0.15);
      border: 1px solid rgba(255, 158, 187, 0.4);
      display: flex;
      flex-direction: column;
      gap: 18px;
      font-family: 'Nunito', sans-serif;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .card-header h2 {
      margin: 0 0 4px 0;
      font-size: 1.45rem;
      font-weight: 900;
      background: linear-gradient(135deg, #ff9ebb 0%, #c19ef5 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .subtitle {
      margin: 0;
      font-size: 0.82rem;
      color: #8a7a9a;
      font-weight: 600;
    }

    .clear-session-btn {
      background: #fee2e2;
      color: #dc2626;
      border: 1px solid #fca5a5;
      padding: 6px 12px;
      border-radius: 16px;
      font-size: 0.78rem;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: 'Nunito', sans-serif;
    }

    .clear-session-btn:hover {
      background: #fecaca;
      transform: translateY(-1px);
    }

    /* Theme Selector */
    .theme-selector-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .section-label {
      font-size: 0.82rem;
      font-weight: 800;
      color: #718096;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }

    .theme-swatch-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
      gap: 8px;
    }

    .theme-chip {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 10px;
      border-radius: 16px;
      background: #ffffff;
      border: 1.5px solid #fed7e2;
      font-size: 0.78rem;
      font-weight: 800;
      color: #5a4a6a;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
      font-family: 'Nunito', sans-serif;
      text-align: left;
    }

    .theme-chip:hover {
      transform: translateY(-2px);
      border-color: #ff9ebb;
      background: #fff5f7;
    }

    .theme-chip.active {
      background: linear-gradient(135deg, #ff9ebb 0%, #c19ef5 100%);
      color: #ffffff;
      border-color: transparent;
      box-shadow: 0 4px 10px rgba(255, 158, 187, 0.4);
      transform: translateY(-2px);
    }

    .theme-dot {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 2px solid;
      flex-shrink: 0;
    }

    .theme-text {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Customization Deck */
    .customization-deck {
      display: flex;
      flex-wrap: wrap;
      gap: 14px;
      align-items: center;
      background: #fff5f7;
      padding: 12px 16px;
      border-radius: 18px;
      border: 1px solid rgba(255, 158, 187, 0.35);
    }

    .input-field-group {
      flex: 1;
      min-width: 180px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .input-field-group label {
      font-size: 0.78rem;
      font-weight: 800;
      color: #718096;
    }

    .input-field-group input {
      padding: 8px 12px;
      background: #ffffff;
      border: 1.5px solid #fed7e2;
      border-radius: 12px;
      color: #5a4a6a;
      font-size: 0.85rem;
      font-weight: 700;
      font-family: 'Nunito', sans-serif;
    }

    .input-field-group input:focus {
      outline: none;
      border-color: #ff9ebb;
      box-shadow: 0 0 0 3px rgba(255, 158, 187, 0.2);
    }

    .checkbox-field-group {
      display: flex;
      align-items: center;
      padding-top: 14px;
    }

    .cute-checkbox-label {
      font-size: 0.82rem;
      font-weight: 700;
      color: #5a4a6a;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Burst Slots Panel */
    .burst-slots-panel {
      background: #ffffff;
      padding: 12px 14px;
      border-radius: 18px;
      border: 1px solid #fed7e2;
    }

    .slots-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-size: 0.8rem;
    }

    .slots-title {
      font-weight: 800;
      color: #5a4a6a;
    }

    .slots-hint {
      font-weight: 700;
      color: #a855f7;
    }

    .slots-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
    }

    .slot-box {
      aspect-ratio: 4/3;
      background: #f8fafc;
      border: 2px dashed #cbd5e1;
      border-radius: 12px;
      overflow: hidden;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .slot-box.filled {
      border-style: solid;
      border-color: #ff9ebb;
      box-shadow: 0 3px 8px rgba(255, 158, 187, 0.2);
    }

    .slot-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .slot-badge {
      position: absolute;
      bottom: 4px;
      right: 4px;
      background: rgba(90, 74, 106, 0.8);
      color: #ffffff;
      font-size: 0.65rem;
      font-weight: 800;
      padding: 1px 6px;
      border-radius: 6px;
    }

    .empty-slot-content {
      text-align: center;
      color: #94a3b8;
    }

    .empty-camera-icon {
      font-size: 1.1rem;
      display: block;
    }

    .empty-slot-content small {
      font-size: 0.65rem;
      font-weight: 700;
    }

    /* Output Section */
    .strip-output-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .film-strip-printout {
      max-height: 480px;
      overflow-y: auto;
      border-radius: 16px;
      box-shadow: 0 12px 30px rgba(90, 74, 106, 0.18);
      border: 4px solid #ffffff;
      background: #ffffff;
      padding: 6px;
    }

    .film-strip-img {
      display: block;
      width: 240px;
      height: auto;
      border-radius: 8px;
    }

    .print-slide-in {
      animation: printSlideDown 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes printSlideDown {
      0% {
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .empty-strip-hero {
      padding: 32px 20px;
      text-align: center;
      background: #fff5f7;
      border-radius: 18px;
      width: 100%;
      border: 2px dashed #fed7e2;
      box-sizing: border-box;
    }

    .hero-graphic {
      font-size: 2.8rem;
      margin-bottom: 8px;
    }

    .empty-strip-hero h3 {
      margin: 0 0 6px 0;
      color: #5a4a6a;
      font-size: 1.05rem;
      font-weight: 800;
    }

    .empty-strip-hero p {
      margin: 0;
      font-size: 0.82rem;
      color: #8a7a9a;
      max-width: 320px;
      margin-left: auto;
      margin-right: auto;
      line-height: 1.4;
    }

    /* Actions Stack */
    .action-buttons-stack {
      display: flex;
      flex-direction: column;
      gap: 10px;
      width: 100%;
      max-width: 320px;
    }

    .btn {
      padding: 12px 18px;
      border: none;
      border-radius: 18px;
      font-weight: 800;
      font-size: 0.92rem;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      text-align: center;
      font-family: 'Nunito', sans-serif;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .btn-download-strip {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #ffffff;
      box-shadow: 0 6px 18px rgba(16, 185, 129, 0.35);
    }

    .btn-download-strip:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(16, 185, 129, 0.45);
    }

    .secondary-btn-row {
      display: flex;
      gap: 8px;
    }

    .btn-secondary-action {
      flex: 1;
      background: #ffffff;
      border: 1.5px solid #fed7e2;
      color: #5a4a6a;
      font-size: 0.8rem;
      padding: 8px 10px;
    }

    .btn-secondary-action:hover {
      background: #fff5f7;
      border-color: #ff9ebb;
      transform: translateY(-1px);
    }
  `]
})
export class FilmStripPreviewComponent {
  readonly webrtcService = inject(WebRtcService);
  readonly audioService = inject(AudioService);

  copySuccess = false;

  readonly themeKeys: FilmStripThemeKey[] = [
    'sakura-blossom',
    'kawaii-paws',
    'y2k-sparkle',
    'washi-tape',
    'rainbow-sherbet',
    'vintage-stamp',
    'classic-white',
    'film-black',
    'cyber-cyan',
    'retro-yellow'
  ];

  onSelectTheme(themeKey: FilmStripThemeKey): void {
    this.webrtcService.setTheme(themeKey);
  }

  onTextChange(text: string): void {
    this.webrtcService.setCustomFooterText(text);
  }

  onToggleTimestamp(): void {
    this.webrtcService.toggleTimestamp();
  }

  onClearPhotos(): void {
    this.webrtcService.clearPhotos();
  }

  onDownloadStrip(): void {
    this.webrtcService.downloadFilmStrip('photobooth-filmstrip.png');
  }

  onDownloadSingle(): void {
    this.webrtcService.downloadSinglePhoto('photobooth-single.png');
  }

  async copyToClipboard(): Promise<void> {
    const dataUrl = this.webrtcService.filmStripDataUrl();
    if (!dataUrl) return;

    try {
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      this.copySuccess = true;
      setTimeout(() => {
        this.copySuccess = false;
      }, 2500);
    } catch (err) {
      console.warn('Clipboard copy failed, falling back to download:', err);
      this.onDownloadStrip();
    }
  }
}
