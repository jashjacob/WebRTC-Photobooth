import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebRtcService } from '../../services/webrtc.service';

@Component({
  selector: 'app-filter-controls',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="controls-container">
      <div class="button-group">
        <button 
          id="btn1" 
          class="btn btn-sm btn-primary" 
          [disabled]="webrtcService.isStreaming()" 
          (click)="onStart()"
        >
          Start Camera
        </button>

        <button 
          id="btn2" 
          class="btn btn-sm btn-primary" 
          [disabled]="!webrtcService.isStreaming()" 
          (click)="onChangeFilter()"
        >
          Change Filter ({{ webrtcService.currentFilter().label }})
        </button>

        <button 
          id="btn3" 
          class="btn btn-sm btn-primary" 
          [disabled]="!webrtcService.isStreaming()" 
          (click)="onSnap()"
        >
          Click (Snapshot)
        </button>
      </div>

      <div class="download-link">
        @if (webrtcService.capturedImageDataUrl()) {
          <a id="download" class="btn btn-sm btn-success" (click)="onDownload()">
            Download Photo
          </a>
        } @else {
          <span class="placeholder-text">Take a photo to enable download</span>
        }
      </div>
    </div>
  `,
  styles: [`
    .controls-container {
      margin-top: 15px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .button-group {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 10px;
    }

    button {
      background: #72F0EB;
      color: #333;
      padding: 8px 14px;
      font-weight: bold;
      display: inline-block;
      border: none;
      cursor: pointer;
      border-radius: 3px;
      transition: background 0.2s ease;
    }

    button:hover:not(:disabled) {
      background: #50d0ca;
    }

    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    #download {
      font-size: 14px;
      cursor: pointer;
      color: #0066cc;
      text-decoration: underline;
      font-weight: bold;
    }

    .placeholder-text {
      font-size: 12px;
      color: #666;
    }
  `]
})
export class FilterControlsComponent {
  readonly webrtcService = inject(WebRtcService);

  @Output() snapClicked = new EventEmitter<void>();

  onStart(): void {
    this.webrtcService.startCamera();
  }

  onChangeFilter(): void {
    this.webrtcService.cycleFilter();
  }

  onSnap(): void {
    this.snapClicked.emit();
  }

  onDownload(): void {
    this.webrtcService.downloadPhoto();
  }
}
