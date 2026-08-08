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
      background: #1e293b;
      color: #f8fafc;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
      border: 1px solid #334155;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .card-header h2 {
      margin: 0 0 4px 0;
      font-size: 1.5rem;
      color: #72F0EB;
    }

    .subtitle {
      margin: 0;
      font-size: 0.88rem;
      color: #94a3b8;
    }

    .section-label {
      display: block;
      font-size: 0.85rem;
      font-weight: 700;
      color: #cbd5e1;
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
      border-radius: 8px;
      border: 2px solid transparent;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: center;
    }

    .theme-btn.classic-white {
      background: #ffffff;
      color: #111827;
    }

    .theme-btn.film-black {
      background: #0f172a;
      color: #f8fafc;
      border-color: #475569;
    }

    .theme-btn.cyber-cyan {
      background: #08131F;
      color: #00F3FF;
      border-color: #00F3FF;
    }

    .theme-btn.retro-yellow {
      background: #FEF08A;
      color: #713F12;
    }

    .theme-btn.active {
      transform: translateY(-2px);
      box-shadow: 0 0 12px rgba(114, 240, 235, 0.6);
      border-color: #72F0EB !important;
    }

    /* Controls Panel */
    .controls-panel {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: center;
      background: #0f172a;
      padding: 14px 18px;
      border-radius: 10px;
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
      color: #94a3b8;
      font-weight: 600;
    }

    .input-group input {
      padding: 8px 12px;
      background: #1e293b;
      border: 1px solid #475569;
      border-radius: 6px;
      color: #ffffff;
      font-size: 0.9rem;
    }

    .toggle-group {
      display: flex;
      align-items: center;
    }

    .checkbox-label {
      font-size: 0.85rem;
      color: #e2e8f0;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Thumbnails */
    .thumbnails-container {
      background: #0f172a;
      padding: 14px;
      border-radius: 10px;
    }

    .thumbnails-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.85rem;
      font-weight: 700;
      color: #cbd5e1;
      margin-bottom: 10px;
    }

    .clear-btn {
      background: transparent;
      border: none;
      color: #ef4444;
      font-size: 0.78rem;
      font-weight: 700;
      cursor: pointer;
      text-decoration: underline;
    }

    .thumbnails-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }

    .thumb-box {
      aspect-ratio: 4/3;
      background: #1e293b;
      border: 2px dashed #475569;
      border-radius: 8px;
      overflow: hidden;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .thumb-box.filled {
      border-style: solid;
      border-color: #72F0EB;
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
      background: rgba(0, 0, 0, 0.7);
      color: #ffffff;
      font-size: 0.65rem;
      padding: 2px 4px;
      border-radius: 4px;
      font-weight: bold;
    }

    .empty-thumb {
      text-align: center;
      color: #64748b;
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
      border-radius: 12px;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
      border: 3px solid #334155;
      background: #000;
      padding: 10px;
    }

    .film-strip-img {
      display: block;
      width: 280px;
      height: auto;
      border-radius: 4px;
    }

    .empty-preview-placeholder {
      padding: 40px 20px;
      text-align: center;
      background: #0f172a;
      border-radius: 12px;
      width: 100%;
      border: 2px dashed #334155;
    }

    .placeholder-icon {
      font-size: 3rem;
      margin-bottom: 10px;
    }

    .empty-preview-placeholder h3 {
      margin: 0 0 6px 0;
      color: #e2e8f0;
    }

    .empty-preview-placeholder p {
      margin: 0;
      font-size: 0.85rem;
      color: #64748b;
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
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.92rem;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: center;
    }

    .btn-download-strip {
      background: #10b981;
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }

    .btn-download-strip:hover {
      background: #059669;
      transform: translateY(-1px);
    }

    .btn-download-single {
      background: #3b82f6;
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    .btn-download-single:hover {
      background: #2563eb;
      transform: translateY(-1px);
    }
  `]
})
export class FilmStripPreviewComponent {
  readonly webrtcService = inject(WebRtcService);
  readonly audioService = inject(AudioService);

  readonly themeKeys: FilmStripThemeKey[] = ['classic-white', 'film-black', 'cyber-cyan', 'retro-yellow'];

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
