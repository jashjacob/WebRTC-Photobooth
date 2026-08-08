import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MediaPipeSegmentationService } from './services/mediapipe-segmentation.service';
import { FilterEngineService, WebGLFilterType } from './services/filter-engine.service';
import { ShareService } from './services/share.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-neon-photobooth',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './neon-photobooth.component.html',
  styleUrls: ['./neon-photobooth.component.scss']
})
export class NeonPhotoboothComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement', { static: true }) videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement', { static: true }) canvasElement!: ElementRef<HTMLCanvasElement>;

  currentFilter: WebGLFilterType = 'none';
  backgroundMode: 'none' | 'blur' | 'replace' = 'none';
  activeFrame: string | null = null;
  
  capturedPhoto: string | null = null;
  qrCodeUrl: string | null = null;
  
  frames = ['neon-border.png', 'cyber-hud.png', 'synthwave-grid.png'];
  
  private stream: MediaStream | null = null;
  private animationFrameId: number = 0;

  constructor(
    private segmentationService: MediaPipeSegmentationService,
    private filterEngine: FilterEngineService,
    private shareService: ShareService
  ) {}

  async ngOnInit() {
    await this.initCamera();
    await this.segmentationService.initialize();
    this.filterEngine.initCanvas(640, 480);
    this.startProcessingLoop();
  }

  ngOnDestroy() {
    this.stopCamera();
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  async initCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false });
      this.videoElement.nativeElement.srcObject = this.stream;
      await this.videoElement.nativeElement.play();
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
  }

  setFilter(filter: WebGLFilterType) {
    this.currentFilter = filter;
  }

  setBackgroundMode(mode: 'none' | 'blur' | 'replace') {
    this.backgroundMode = mode;
  }

  setFrame(frame: string | null) {
    this.activeFrame = frame;
  }

  private startProcessingLoop() {
    const processFrame = async () => {
      const video = this.videoElement.nativeElement;
      const canvas = this.canvasElement.nativeElement;
      
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        let mask = null;
        if (this.backgroundMode !== 'none') {
          mask = await this.segmentationService.processVideoFrame(video, performance.now());
        }

        // Draw video to a temporary canvas for source
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 640;
        tempCanvas.height = 480;
        const tempCtx = tempCanvas.getContext('2d')!;
        tempCtx.drawImage(video, 0, 0, 640, 480);

        // Apply filters and background
        const processedCanvas = this.filterEngine.applyFilter(
          tempCanvas, 
          this.currentFilter, 
          mask, 
          this.backgroundMode
        );

        // Draw to actual canvas
        const ctx = canvas.getContext('2d')!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(processedCanvas, 0, 0);
      }

      this.animationFrameId = requestAnimationFrame(processFrame);
    };

    processFrame();
  }

  async takePhoto() {
    const canvas = this.canvasElement.nativeElement;
    
    // Create final capture canvas to merge video and frame
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = canvas.width;
    finalCanvas.height = canvas.height;
    const ctx = finalCanvas.getContext('2d')!;
    
    // Draw the processed video frame
    ctx.drawImage(canvas, 0, 0);

    // If frame active, draw it on top
    if (this.activeFrame) {
      // Assuming frames are in assets
      const img = new Image();
      img.src = `assets/frames/${this.activeFrame}`;
      await new Promise(resolve => {
        img.onload = () => {
          ctx.drawImage(img, 0, 0, finalCanvas.width, finalCanvas.height);
          resolve(true);
        };
        img.onerror = () => resolve(false);
      });
    }

    this.capturedPhoto = finalCanvas.toDataURL('image/png');
    this.qrCodeUrl = await this.shareService.generateQRCode(this.capturedPhoto);
  }

  async sharePhoto() {
    if (this.capturedPhoto) {
      await this.shareService.sharePhoto(this.capturedPhoto);
    }
  }

  retake() {
    this.capturedPhoto = null;
    this.qrCodeUrl = null;
  }
}
