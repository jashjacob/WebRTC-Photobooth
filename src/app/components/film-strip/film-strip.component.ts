import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WebRtcService, FilmStripThemeKey } from '../../services/webrtc.service';

@Component({
  selector: 'app-film-strip',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="film-strip-container">
      <div class="film-strip-card">
        <div class="card-header">
          <h2>📸 Film Strip Collage & Gallery</h2>
          <p class="subtitle">4-Shot Photobooth Burst Generator</p>
        </div>

        @if (webrtcService.capturedPhotos().length > 0) {
          <!-- Theme & Customization Panel -->
          <div class="customization-panel">
            <div class="theme-selector">
              <label class="control-label">Strip Theme:</label>
              <div class="theme-buttons">
                @for (theme of themeList; track theme.key) {
                  <button 
                    type="button"
                    class="theme-btn" 
                    [class.active]="webrtcService.selectedThemeKey() === theme.key"
                    (click)="onSelectTheme(theme.key)"
                  >
                    <span class="theme-swatch" [style.background-color]="theme.bgColor"></span>
                    {{ theme.label }}
                  </button>
                }
              </div>
            </div>

            <div class="footer-customizer">
              <div class="input-group">
                <label for="footerInput" class="control-label">Custom Caption:</label>
                <input 
                  id="footerInput" 
                  type="text" 
                  class="form-control"
                  [ngModel]="webrtcService.customFooterText()"
                  (ngModelChange)="webrtcService.setCustomFooterText($event)"
                  placeholder="e.g., PARTY TIME 2026"
                />
              </div>

              <div class="checkbox-group">
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    [checked]="webrtcService.includeTimestamp()"
                    (change)="webrtcService.toggleTimestamp()"
                  />
                  Include Date & Timestamp
                </label>
              </div>
            </div>
          </div>

          <div class="content-grid">
            <!-- Film Strip Preview -->
            @if (webrtcService.filmStripDataUrl()) {
              <div class="strip-preview-section">
                <h3>Vertical Film Strip</h3>
                <div class="film-strip-wrapper">
                  <img 
                    [src]="webrtcService.filmStripDataUrl()" 
                    alt="Photobooth 4-Shot Film Strip" 
                    class="film-strip-image"
                  />
                </div>
                <div class="action-bar">
                  <button 
                    class="btn btn-download-strip" 
                    (click)="webrtcService.downloadFilmStrip()"
                  >
                    📥 Download Film Strip PNG
                  </button>
                </div>
              </div>
            }

            <!-- Individual Shots Gallery -->
            <div class="shots-gallery-section">
              <h3>Captured Shots ({{ webrtcService.capturedPhotos().length }}/4)</h3>
              <div class="shots-grid">
                @for (photo of webrtcService.capturedPhotos(); track $index) {
                  <div class="shot-card">
                    <div class="shot-badge">Shot #{{ $index + 1 }}</div>
                    <img [src]="photo" [alt]="'Shot ' + ($index + 1)" class="shot-img" />
                    <button 
                      class="btn btn-sm btn-shot-download"
                      (click)="downloadShot($index)"
                      title="Download individual shot"
                    >
                      💾 Save Shot #{{ $index + 1 }}
                    </button>
                  </div>
                }
              </div>

              <div class="gallery-actions">
                <button class="btn btn-danger-outline" (click)="webrtcService.clearPhotos()">
                  🗑️ Clear Gallery & Retake
                </button>
              </div>
            </div>
          </div>
        } @else {
          <!-- Empty State -->
          <div class="empty-state">
            <div class="empty-icon">🎞️</div>
            <h3>No Photos Captured Yet</h3>
            <p>Click <strong>"📸 Start 4-Shot Burst"</strong> above to trigger the photobooth countdown capture sequence and automatically build your vertical film strip collage!</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .film-strip-container {
      width: 100%;
      margin-top: 24px;
    }

    .film-strip-card {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 16px;
      padding: 24px;
      color: #f0f6fc;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    }

    .card-header h2 {
      margin: 0 0 4px 0;
      font-size: 1.5rem;
      color: #58a6ff;
    }

    .subtitle {
      margin: 0 0 20px 0;
      color: #8b949e;
      font-size: 0.9rem;
    }

    /* Customization Panel */
    .customization-panel {
      background: #0d1117;
      border: 1px solid #21262d;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .control-label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #c9d1d9;
      margin-bottom: 8px;
      display: block;
    }

    .theme-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    .theme-btn {
      background: #21262d;
      border: 1px solid #30363d;
      color: #c9d1d9;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 0.85rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
    }

    .theme-btn:hover {
      background: #30363d;
      color: #ffffff;
    }

    .theme-btn.active {
      border-color: #58a6ff;
      background: #1f6feb;
      color: #ffffff;
      font-weight: bold;
    }

    .theme-swatch {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 1px solid rgba(255, 255, 255, 0.4);
      display: inline-block;
    }

    .footer-customizer {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 20px;
    }

    .input-group {
      flex: 1;
      min-width: 220px;
    }

    .form-control {
      width: 100%;
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 6px;
      padding: 8px 12px;
      color: #ffffff;
      font-size: 0.9rem;
      box-sizing: border-box;
    }

    .form-control:focus {
      outline: none;
      border-color: #58a6ff;
    }

    .checkbox-label {
      font-size: 0.85rem;
      color: #c9d1d9;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }

    /* Content Grid */
    .content-grid {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    @media (min-width: 850px) {
      .content-grid {
        flex-direction: row;
        align-items: flex-start;
      }
    }

    /* Film Strip Preview */
    .strip-preview-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      background: #0d1117;
      border: 1px solid #21262d;
      border-radius: 12px;
      padding: 16px;
    }

    .strip-preview-section h3 {
      margin-top: 0;
      color: #f0f6fc;
      font-size: 1.1rem;
    }

    .film-strip-wrapper {
      max-height: 520px;
      overflow-y: auto;
      border-radius: 8px;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.5);
      border: 1px solid #30363d;
      padding: 8px;
      background: #000000;
    }

    .film-strip-image {
      max-width: 260px;
      width: 100%;
      height: auto;
      display: block;
      border-radius: 4px;
    }

    .action-bar {
      margin-top: 16px;
      width: 100%;
      text-align: center;
    }

    .btn-download-strip {
      background: #238636;
      color: #ffffff;
      font-weight: bold;
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.95rem;
      transition: background 0.2s ease;
      width: 100%;
      max-width: 280px;
    }

    .btn-download-strip:hover {
      background: #2ea043;
    }

    /* Shots Gallery Section */
    .shots-gallery-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .shots-gallery-section h3 {
      margin-top: 0;
      color: #f0f6fc;
      font-size: 1.1rem;
    }

    .shots-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 12px;
    }

    .shot-card {
      position: relative;
      background: #0d1117;
      border: 1px solid #30363d;
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .shot-badge {
      position: absolute;
      top: 6px;
      left: 6px;
      background: rgba(0, 0, 0, 0.75);
      color: #ffffff;
      font-size: 0.7rem;
      font-weight: bold;
      padding: 2px 6px;
      border-radius: 4px;
      z-index: 2;
    }

    .shot-img {
      width: 100%;
      aspect-ratio: 4 / 3;
      object-fit: cover;
      display: block;
    }

    .btn-shot-download {
      background: #21262d;
      color: #c9d1d9;
      border: none;
      border-top: 1px solid #30363d;
      padding: 6px;
      font-size: 0.75rem;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .btn-shot-download:hover {
      background: #30363d;
      color: #ffffff;
    }

    .gallery-actions {
      margin-top: 12px;
    }

    .btn-danger-outline {
      background: transparent;
      border: 1px solid #da3633;
      color: #f85149;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
      transition: all 0.2s ease;
    }

    .btn-danger-outline:hover {
      background: #da3633;
      color: #ffffff;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 40px 20px;
      background: #0d1117;
      border: 2px dashed #30363d;
      border-radius: 12px;
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 12px;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      color: #c9d1d9;
    }

    .empty-state p {
      margin: 0;
      color: #8b949e;
      font-size: 0.9rem;
      max-width: 480px;
      margin: 0 auto;
      line-height: 1.5;
    }
  `]
})
export class FilmStripComponent {
  readonly webrtcService = inject(WebRtcService);

  readonly themeList = Object.values(this.webrtcService.themes);

  onSelectTheme(themeKey: FilmStripThemeKey): void {
    this.webrtcService.setTheme(themeKey);
  }

  downloadShot(index: number): void {
    const photoUrl = this.webrtcService.capturedPhotos()[index];
    if (photoUrl) {
      this.webrtcService.downloadSinglePhoto(`photobooth-shot-${index + 1}.png`);
    }
  }
}
