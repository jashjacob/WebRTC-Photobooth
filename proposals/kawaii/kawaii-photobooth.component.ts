import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageProcessingService, FilterOptions } from './image-processing.service';
import { ShareService } from './share.service';

@Component({
  selector: 'app-kawaii-photobooth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './kawaii-photobooth.component.html',
  styleUrls: ['./kawaii-photobooth.component.scss']
})
export class KawaiiPhotoboothComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;

  public stream: MediaStream | null = null;
  public capturedImage: string | null = null;
  public qrCodeUrl: string | null = null;
  public showFilters = false;

  public removeBackground = false;
  
  public filters: FilterOptions = {
    pastel: true,
    sparkle: false,
    brightness: 100,
    contrast: 100,
    saturation: 100
  };

  public selectedFrame = 'none';
  public frames = [
    { id: 'none', name: 'No Frame', url: '' },
    { id: 'polaroid', name: 'Polaroid', url: 'frame-polaroid' },
    { id: 'hearts', name: 'Floating Hearts', url: 'frame-hearts' },
    { id: 'stars', name: 'Starry Night', url: 'frame-stars' }
  ];

  constructor(
    private imageProcessing: ImageProcessingService,
    private shareService: ShareService
  ) {}

  async ngOnInit() {
    await this.startCamera();
  }

  ngOnDestroy() {
    this.stopCamera();
    this.imageProcessing.stopProcessing();
  }

  async startCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720, facingMode: 'user' }, 
        audio: false 
      });
      
      const video = this.videoElement.nativeElement;
      video.srcObject = this.stream;
      await video.play();

      // Give it a small delay for video dimensions to be set
      setTimeout(() => {
        const canvas = this.canvasElement.nativeElement;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        this.imageProcessing.startProcessing(
          video, 
          canvas, 
          this.removeBackground, 
          this.filters
        );
      }, 500);

    } catch (err) {
      console.error('Error accessing webcam', err);
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
  }

  toggleBackgroundRemoval() {
    this.removeBackground = !this.removeBackground;
    // Restart processing with new settings
    this.imageProcessing.stopProcessing();
    this.imageProcessing.startProcessing(
      this.videoElement.nativeElement,
      this.canvasElement.nativeElement,
      this.removeBackground,
      this.filters
    );
  }

  onFilterChange() {
    // Processing service reads the filters object reference, so it applies immediately.
    // However, if we need to restart processing we could do it here.
  }

  takePhoto() {
    const canvas = this.canvasElement.nativeElement;
    
    // Create a final composite canvas to include the frame if any
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = canvas.width;
    finalCanvas.height = canvas.height;
    const ctx = finalCanvas.getContext('2d')!;
    
    // Draw the processed image
    ctx.drawImage(canvas, 0, 0);

    // Apply soft kawaii frame logic here (mocked for simplicity, we rely on CSS overlays mostly, 
    // but for the final downloaded image we need to draw it to canvas)
    if (this.selectedFrame === 'polaroid') {
      ctx.lineWidth = 40;
      ctx.strokeStyle = '#ffffff';
      ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 100);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, canvas.height - 80, canvas.width, 80);
      ctx.fillStyle = '#ff9ebb';
      ctx.font = '40px "Nunito"';
      ctx.fillText('Kawaii Time!', canvas.width / 2 - 100, canvas.height - 25);
    }

    this.capturedImage = finalCanvas.toDataURL('image/png');
    this.generateShareLinks();
  }

  retakePhoto() {
    this.capturedImage = null;
    this.qrCodeUrl = null;
  }

  async generateShareLinks() {
    if (!this.capturedImage) return;
    
    // Normally you'd upload this image to a server and get a URL back.
    // For this demo, we'll just encode a generic fun URL or a tiny URL.
    const shareUrl = "https://kawaii-photobooth.example.com/share/123";
    
    this.qrCodeUrl = await this.shareService.generateQRCode(shareUrl);
  }

  async sharePhoto() {
    if (!this.capturedImage) return;
    
    const file = this.shareService.dataURIToFile(this.capturedImage, 'kawaii-photo.png');
    const success = await this.shareService.shareNative(
      'My Kawaii Photo!', 
      'Check out this cute photo I took!', 
      file
    );
    
    if (!success) {
      alert('Native sharing is not supported or was cancelled. You can download the image instead!');
    }
  }

  downloadPhoto() {
    if (!this.capturedImage) return;
    const a = document.createElement('a');
    a.href = this.capturedImage;
    a.download = 'kawaii-photo.png';
    a.click();
  }
}
