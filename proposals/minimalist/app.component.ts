import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CameraService, FilterType } from './camera.service';
import { ShareService } from './share.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [CameraService, ShareService]
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement', { static: true }) videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement', { static: true }) canvasElement!: ElementRef<HTMLCanvasElement>;

  capturedPhotos: string[] = [];
  qrCodeUrl: string | null = null;
  activePhoto: string | null = null;

  filters: FilterType[] = ['none', 'monochrome', 'sepia', 'invert', 'blur'];
  activeFilter: FilterType = 'none';

  backgroundModes: Array<'none' | 'blur' | 'color'> = ['none', 'blur', 'color'];
  activeBackgroundMode: 'none' | 'blur' | 'color' = 'none';

  // Sample frames - you would use actual image URLs or data URIs
  frames = [
    { label: 'None', url: null },
    { label: 'Minimal', url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjgwIiBoZWlnaHQ9IjcyMCI+PHJlY3QgeD0iMjAiIHk9IjIwIiB3aWR0aD0iMTI0MCIgaGVpZ2h0PSI2ODAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMTAiLz48L3N2Zz4=' }, // A white border SVG
  ];

  constructor(
    private cameraService: CameraService,
    private shareService: ShareService
  ) {}

  ngOnInit() {
    this.cameraService.initialize(this.videoElement.nativeElement, this.canvasElement.nativeElement)
      .catch(err => console.error('Error starting camera', err));
  }

  ngOnDestroy() {
    this.cameraService.stopProcessing();
  }

  setFilter(f: FilterType) {
    this.activeFilter = f;
    this.cameraService.currentFilter = f;
  }

  setBackgroundMode(mode: 'none' | 'blur' | 'color') {
    this.activeBackgroundMode = mode;
    this.cameraService.backgroundMode = mode;
  }

  setFrame(url: string | null) {
    this.cameraService.setFrame(url);
  }

  takePhoto() {
    const photoUrl = this.cameraService.takePhoto();
    this.capturedPhotos.unshift(photoUrl);
  }

  async sharePhoto(photoUrl: string) {
    this.activePhoto = photoUrl;
    
    // In a real app, this would be an uploaded URL. Using dummy URL for demo.
    const dummyPublicUrl = 'https://example.com/photo/12345'; 
    this.qrCodeUrl = await this.shareService.generateQRCode(dummyPublicUrl);
    
    // Attempt Web Share API
    const blob = await (await fetch(photoUrl)).blob();
    const file = new File([blob], 'photo.png', { type: 'image/png' });
    await this.shareService.share('My Photobooth Pic', 'Check out this photo!', file);
  }

  closeShareModal() {
    this.activePhoto = null;
    this.qrCodeUrl = null;
  }
}
