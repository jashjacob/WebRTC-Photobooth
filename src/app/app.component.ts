import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CameraPreviewComponent } from './components/camera-preview/camera-preview.component';
import { FilterControlsComponent } from './components/filter-controls/filter-controls.component';
import { FilmStripComponent } from './components/film-strip/film-strip.component';
import { FilmStripPreviewComponent } from './components/film-strip-preview/film-strip-preview.component';
import { WebRtcService } from './services/webrtc.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    CameraPreviewComponent, 
    FilterControlsComponent, 
    FilmStripComponent,
    FilmStripPreviewComponent
  ],
  template: `
    <div class="app-container">
      <!-- Session Progress Bar Header -->
      <div class="progress-bar-wrapper">
        <div 
          class="progress-bar" 
          [style.width.%]="webrtcService.progressValue()"
        >
          {{ webrtcService.progressText() }}
        </div>
      </div>

      <main class="main-content">
        <header class="app-header">
          <h1>✨ Kawaii Photobooth ✨</h1>
          <p class="tagline">4-Shot Burst Capture & Customizable Vertical Film Strip Generator</p>
        </header>

        @if (webrtcService.errorMessage()) {
          <div class="error-banner">
            ⚠️ {{ webrtcService.errorMessage() }}
          </div>
        }

        <div class="photobooth-grid">
          <!-- Left Column: Camera Stage & Controls -->
          <section class="stage-section">
            <app-camera-preview #cameraPreview></app-camera-preview>
            
            <app-filter-controls 
              (snapClicked)="cameraPreview.takeSnapshot()"
              (burstClicked)="cameraPreview.startBurst()"
            ></app-filter-controls>
          </section>

          <!-- Right Column: Vertical Film Strip Studio -->
          <section class="strip-section">
            <app-film-strip-preview></app-film-strip-preview>
          </section>
        </div>

        <!-- Standalone Film Strip Component Section -->
        <app-film-strip></app-film-strip>
      </main>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');

    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      background: linear-gradient(135deg, #fff0f5 0%, #fce4ec 30%, #f3e5f5 60%, #e8eaf6 100%);
      background-attachment: fixed;
      color: #5a4a6a;
      font-family: 'Nunito', sans-serif;
      position: relative;
    }

    /* Subtle dot pattern overlay */
    .app-container::before {
      content: '';
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background-image: radial-gradient(circle, #ffb6c1 1px, transparent 1px);
      background-size: 30px 30px;
      opacity: 0.15;
      pointer-events: none;
      z-index: 0;
    }

    .progress-bar-wrapper {
      width: 100%;
      background-color: rgba(255, 182, 193, 0.3);
      height: 28px;
      overflow: hidden;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
      z-index: 1;
    }

    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #ff9ebb 0%, #ffb347 50%, #87ceeb 100%);
      color: #fff;
      font-weight: 800;
      font-size: 0.85rem;
      text-align: center;
      line-height: 28px;
      transition: width 0.3s ease;
      text-shadow: 0 1px 2px rgba(0,0,0,0.2);
      border-radius: 0 14px 14px 0;
    }

    .main-content {
      width: 100%;
      max-width: 1280px;
      padding: 24px 16px 40px 16px;
      box-sizing: border-box;
      position: relative;
      z-index: 1;
    }

    .app-header {
      text-align: center;
      margin-bottom: 24px;
    }

    .app-header h1 {
      font-size: 2.8rem;
      margin: 0 0 6px 0;
      background: linear-gradient(135deg, #ff9ebb 0%, #c19ef5 50%, #87ceeb 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 900;
      letter-spacing: -0.5px;
      filter: drop-shadow(0 2px 4px rgba(255,158,187,0.3));
    }

    .tagline {
      margin: 0;
      font-size: 1.05rem;
      color: #b08dba;
      font-weight: 700;
    }

    .error-banner {
      background: linear-gradient(135deg, #ff6b6b, #ee5a24);
      color: white;
      padding: 12px 20px;
      border-radius: 16px;
      margin-bottom: 20px;
      text-align: center;
      font-weight: 700;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
    }

    .photobooth-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 32px;
      margin-bottom: 24px;
    }

    @media (min-width: 960px) {
      .photobooth-grid {
        grid-template-columns: 1fr 1fr;
        align-items: start;
      }
    }

    .stage-section, .strip-section {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
  `]
})
export class AppComponent {
  @ViewChild('cameraPreview') cameraPreview!: CameraPreviewComponent;
  readonly webrtcService = inject(WebRtcService);
}
