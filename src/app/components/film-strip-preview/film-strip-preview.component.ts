import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WebRtcService, FilmStripThemeKey } from '../../services/webrtc.service';
import { AudioService } from '../../services/audio.service';

@Component({
  selector: 'app-film-strip-preview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="film-strip-card">
      <div class="card-header">
        <h2>🎞️ Vertical 4-Shot Film Strip</h2>
        <p class="subtitle">Customizable themes, timestamps, and high-res PNG collage</p>
      </div>

      <!-- Theme Selector Tabs -->
      <div class="theme-selector">
        <label class="section-label">Choose Strip Theme:</label>
        <div class="theme-buttons">
          @for (themeKey of themeKeys; track themeKey) {
            <button 
              class="theme-btn" 
              [class.active]="webrtcService.selectedThemeKey() === themeKey"
              [ngClass]="themeKey"
              (click)="onSelectTheme(themeKey)"
            >
              {{ webrtcService.themes[themeKey].label }}
            </button>
          }
        </div>
      </div>

      <!-- Customization Controls -->
      <div class="controls-panel">
        <div class="input-group">
          <label for="stripText">Footer Title / Text:</label>
          <input 
            id="stripText" 
            type="text" 
            [ngModel]="webrtcService.customFooterText()" 
            (ngModelChange)="onTextChange($event)"
            placeholder="e.g. PHOTOBOOTH MEMORIES"
            maxlength="30"
          />
        </div>

        <div class="toggle-group">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              [checked]="webrtcService.includeTimestamp()" 
              (change)="onToggleTimestamp()" 
            />
            Render Date & Timestamp
          </label>
        </div>
      </div>

      <!-- Captured Photos Thumbnails Strip -->
      <div class="thumbnails-container">
        <div class="thumbnails-header">
          <span>Captured Shots ({{ webrtcService.capturedPhotos().length }} / 4)</span>
          @if (webrtcService.capturedPhotos().length > 0) {
            <button class="clear-btn" (click)="onClearPhotos()">Clear All</button>
          }
        </div>
        <div class="thumbnails-grid">
          @for (slot of [0, 1, 2, 3]; track slot) {
            <div class="thumb-box" [class.filled]="webrtcService.capturedPhotos()[slot]">
              @if (webrtcService.capturedPhotos()[slot]) {
                <img [src]="webrtcService.capturedPhotos()[slot]" [alt]="'Shot ' + (slot + 1)" />
                <span class="slot-tag">#{{ slot + 1 }}</span>
              } @else {
                <div class="empty-thumb">
                  <span>📸</span>
                  <small>Shot {{ slot + 1 }}</small>
                </div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Main Film Strip Canvas Preview -->
      <div class="strip-preview-wrapper">
        @if (webrtcService.filmStripDataUrl()) {
          <div class="canvas-image-container">
            <img 
              [src]="webrtcService.filmStripDataUrl()" 
              alt="Vertical Film Strip Preview" 
              class="film-strip-img" 
            />
          </div>

          <!-- Download Action Buttons -->
          <div class="download-actions">
            <button class="btn btn-download-strip" (click)="onDownloadStrip()">
              📥 Download Vertical Film Strip PNG
            </button>
            <button class="btn btn-download-single" (click)="onDownloadSingle()">
              📸 Download Latest Shot PNG
            </button>
          </div>
        } @else {
          <div class="empty-preview-placeholder">
            <div class="placeholder-icon">🎞️</div>
            <h3>No Film Strip Generated Yet</h3>
            <p>Start a 4-photo burst capture or take snapshots to generate your vertical film strip collage!</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .film-strip-card {
      font-family: 'Nunito', sans-serif;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(10px);
      color: #5a4a6a;
      border-radius: 20px;
      padding: 24px;
      box-shadow: 0 8px 32px rgba(255, 158, 187, 0.15);
      border: 1px solid rgba(255, 158, 187, 0.3);
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .card-header h2 {
      margin: 0 0 4px 0;
      font-size: 1.5rem;
      background: linear-gradient(45deg, #ff9ebb, #c19ef5);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .subtitle {
      margin: 0;
      font-size: 0.88rem;
      color: #5a4a6a;
    }

    .section-label {
      display: block;
      font-size: 0.85rem;
      font-weight: 700;
      color: #5a4a6a;
      margin-bottom: 8px;
    }

    /* Theme Buttons */
    .theme-buttons {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 8px;
    }

    .theme-btn {
      padding: 8px 12px;
      font-size: 0.82rem;
      font-weight: 700;
      border-radius: 25px;
      border: 2px solid transparent;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: center;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
      font-family: 'Nunito', sans-serif;
    }

    .theme-btn.classic-white {
      background: #ffffff;
      color: #5a4a6a;
      border-color: #ff9ebb;
    }

    .theme-btn.film-black {
      background: #334155;
      color: #ffffff;
    }

    .theme-btn.cyber-cyan {
      background: #06b6d4;
      color: #ffffff;
    }

    .theme-btn.retro-yellow {
      background: #f59e0b;
      color: #ffffff;
    }

    .theme-btn.sakura-blossom {
      background: #fbcfe8;
      color: #831843;
    }

    .theme-btn.kawaii-paws {
      background: #ffe4e6;
      color: #9f1239;
    }

    .theme-btn.y2k-sparkle {
      background: #e9d5ff;
      color: #581c87;
    }

    .theme-btn.washi-tape {
      background: #fef3c7;
      color: #78350f;
    }

    .theme-btn.rainbow-sherbet {
      background: linear-gradient(135deg, #fbcfe8, #fef08a, #bae6fd);
      color: #1e3a8a;
    }

    .theme-btn.vintage-stamp {
      background: #e2e8f0;
      color: #334155;
    }

    .theme-btn.active {
      transform: translateY(-2px);
      box-shadow: 0 0 12px rgba(255, 158, 187, 0.6);
      border-color: #ff9ebb !important;
    }

    /* Controls Panel */
    .controls-panel {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: center;
      background: #fff5f7;
      padding: 14px 18px;
      border-radius: 16px;
      border: 1px solid rgba(255, 158, 187, 0.3);
    }

    .input-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1;
      min-width: 200px;
    }

    .input-group label {
      font-size: 0.8rem;
      color: #5a4a6a;
      font-weight: 600;
    }

    .input-group input {
      padding: 8px 12px;
      background: #faf0ff;
      border: 1px solid rgba(255, 158, 187, 0.3);
      border-radius: 8px;
      color: #5a4a6a;
      font-size: 0.9rem;
      font-family: 'Nunito', sans-serif;
    }

    .toggle-group {
      display: flex;
      align-items: center;
    }

    .checkbox-label {
      font-size: 0.85rem;
      color: #5a4a6a;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Thumbnails */
    .thumbnails-container {
      background: #fff5f7;
      padding: 14px;
      border-radius: 16px;
      border: 1px solid rgba(255, 158, 187, 0.3);
    }

    .thumbnails-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.85rem;
      font-weight: 700;
      color: #5a4a6a;
      margin-bottom: 10px;
    }

    .clear-btn {
      background: transparent;
      border: none;
      color: #ff9ebb;
      font-size: 0.78rem;
      font-weight: 700;
      cursor: pointer;
      text-decoration: underline;
      font-family: 'Nunito', sans-serif;
    }

    .thumbnails-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }

    .thumb-box {
      aspect-ratio: 4/3;
      background: #ffffff;
      border: 2px dashed #ff9ebb;
      border-radius: 12px;
      overflow: hidden;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .thumb-box.filled {
      border-style: solid;
      border-color: #ff9ebb;
    }

    .thumb-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .slot-tag {
      position: absolute;
      bottom: 4px;
      right: 4px;
      background: rgba(255, 158, 187, 0.8);
      color: #ffffff;
      font-size: 0.65rem;
      padding: 2px 4px;
      border-radius: 4px;
      font-weight: bold;
    }

    .empty-thumb {
      text-align: center;
      color: #c19ef5;
    }

    .empty-thumb span {
      font-size: 1.2rem;
      display: block;
    }

    .empty-thumb small {
      font-size: 0.65rem;
    }

    /* Strip Preview Wrapper */
    .strip-preview-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .canvas-image-container {
      max-height: 580px;
      overflow-y: auto;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(255, 158, 187, 0.2);
      border: 2px solid rgba(255, 158, 187, 0.3);
      background: #ffffff;
      padding: 10px;
    }

    .film-strip-img {
      display: block;
      width: 280px;
      height: auto;
      border-radius: 8px;
    }

    .empty-preview-placeholder {
      padding: 40px 20px;
      text-align: center;
      background: #faf0ff;
      border-radius: 16px;
      width: 100%;
      border: 2px dashed #c19ef5;
    }

    .placeholder-icon {
      font-size: 3rem;
      margin-bottom: 10px;
    }

    .empty-preview-placeholder h3 {
      margin: 0 0 6px 0;
      color: #5a4a6a;
    }

    .empty-preview-placeholder p {
      margin: 0;
      font-size: 0.85rem;
      color: #5a4a6a;
    }

    /* Download Buttons */
    .download-actions {
      display: flex;
      flex-direction: column;
      gap: 10px;
      width: 100%;
      max-width: 360px;
    }

    .btn {
      padding: 12px 18px;
      border: none;
      border-radius: 25px;
      font-weight: 700;
      font-size: 0.92rem;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: center;
      font-family: 'Nunito', sans-serif;
    }

    .btn-download-strip {
      background: linear-gradient(45deg, #98d8a8, #87ceeb);
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(152, 216, 168, 0.4);
    }

    .btn-download-strip:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(152, 216, 168, 0.6);
    }

    .btn-download-single {
      background: linear-gradient(45deg, #87ceeb, #c19ef5);
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(135, 206, 235, 0.4);
    }

    .btn-download-single:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(135, 206, 235, 0.6);
    }
  `]
})
export class FilmStripPreviewComponent {
  readonly webrtcService = inject(WebRtcService);
  readonly audioService = inject(AudioService);

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
}
