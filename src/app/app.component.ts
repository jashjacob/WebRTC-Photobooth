import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CameraPreviewComponent } from './components/camera-preview/camera-preview.component';
import { FilterControlsComponent } from './components/filter-controls/filter-controls.component';
import { WebRtcService } from './services/webrtc.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, CameraPreviewComponent, FilterControlsComponent],
  template: `
    <div class="app-container">
      <div class="progress-bar-wrapper">
        <div class="progress-bar" [style.width.%]="webrtcService.progressValue()">
          {{ webrtcService.progressText() }}
        </div>
      </div>

      <main class="main-content">
        <h1>Photobooth</h1>

        @if (webrtcService.errorMessage()) {
          <div class="error-banner">
            {{ webrtcService.errorMessage() }}
          </div>
        }

        <app-camera-preview #cameraPreview></app-camera-preview>

        <app-filter-controls (snapClicked)="onSnapTriggered()"></app-filter-controls>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .progress-bar-wrapper {
      width: 100%;
      background-color: #e0e0e0;
      height: 24px;
      overflow: hidden;
    }

    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
      color: #fff;
      font-weight: bold;
      text-align: center;
      line-height: 24px;
      transition: width 0.3s ease;
    }

    .main-content {
      text-align: center;
      padding: 20px;
      width: 100%;
      max-width: 1080px;
    }

    h1 {
      font-size: 2.5rem;
      margin-bottom: 10px;
      color: #2c3e50;
    }

    .error-banner {
      background-color: #ff4d4d;
      color: white;
      padding: 10px 15px;
      border-radius: 4px;
      margin-bottom: 15px;
      display: inline-block;
    }
  `]
})
export class AppComponent {
  @ViewChild('cameraPreview') cameraPreview!: CameraPreviewComponent;
  readonly webrtcService = inject(WebRtcService);

  onSnapTriggered(): void {
    if (this.cameraPreview) {
      this.cameraPreview.takeSnapshot();
    }
  }
}
