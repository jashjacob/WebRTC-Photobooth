import { Component, ElementRef, ViewChild, EffectRef, effect, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebRtcService } from '../../services/webrtc.service';

@Component({
  selector: 'app-camera-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="preview-container">
      <div class="video-wrapper">
        <video 
          #videoElement 
          autoplay 
          playsinline 
          [ngClass]="webrtcService.currentFilterName()"
        ></video>
      </div>

      <div class="canvas-wrapper">
        <canvas 
          #canvasElement 
          [ngClass]="webrtcService.currentFilterName()"
        ></canvas>
      </div>
    </div>
  `,
  styles: [`
    .preview-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      margin-top: 10px;
    }

    video {
      border: 2px solid black;
      width: 480px;
      height: 360px;
      background-color: #000;
      object-fit: cover;
    }

    canvas {
      border: 5px solid black;
      width: 480px;
      height: 360px;
      background-color: #f0f0f0;
    }

    @media (min-width: 900px) {
      .preview-container {
        flex-direction: row;
        justify-content: center;
      }
    }
  `]
})
export class CameraPreviewComponent implements OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;

  readonly webrtcService = inject(WebRtcService);
  private streamEffect: EffectRef;

  constructor() {
    this.streamEffect = effect(() => {
      const stream = this.webrtcService.stream();
      if (this.videoElement && this.videoElement.nativeElement) {
        const video = this.videoElement.nativeElement;
        if ('srcObject' in video) {
          video.srcObject = stream;
        } else {
          (video as any).src = stream ? URL.createObjectURL(stream as any) : '';
        }
      }
    });
  }

  takeSnapshot(): void {
    if (this.videoElement && this.canvasElement) {
      this.webrtcService.takeSnapshot(
        this.videoElement.nativeElement,
        this.canvasElement.nativeElement
      );
    }
  }

  ngOnDestroy(): void {
    this.streamEffect.destroy();
  }
}
