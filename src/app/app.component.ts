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
          <h1>📸 WebRTC Photobooth</h1>
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
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      background-color: #0f172a;
      color: #f8fafc;
    }

    .progress-bar-wrapper {
      width: 100%;
      background-color: #1e293b;
      height: 28px;
      overflow: hidden;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
    }

    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #3b82f6 0%, #72F0EB 50%, #10b981 100%);
      color: #0f172a;
      font-weight: 800;
      font-size: 0.85rem;
      text-align: center;
      line-height: 28px;
      transition: width 0.3s ease;
      text-shadow: 0 0 2px rgba(255,255,255,0.5);
    }

    .main-content {
      width: 100%;
      max-width: 1280px;
      padding: 24px 16px 40px 16px;
      box-sizing: border-box;
    }

    .app-header {
      text-align: center;
      margin-bottom: 24px;
    }

    .app-header h1 {
      font-size: 2.6rem;
      margin: 0 0 6px 0;
      color: #72F0EB;
      font-weight: 900;
      letter-spacing: -0.5px;
      text-shadow: 0 0 20px rgba(114, 240, 235, 0.3);
    }

    .tagline {
      margin: 0;
      font-size: 1.05rem;
      color: #94a3b8;
    }

    .error-banner {
      background-color: #ef4444;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      text-align: center;
      font-weight: 700;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
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
