import { Injectable, signal, computed } from '@angular/core';

export interface FilterInfo {
  name: string;
  label: string;
  cssStyle: string;
}

@Injectable({
  providedIn: 'root'
})
export class WebRtcService {
  readonly filters: FilterInfo[] = [
    { name: 'none', label: 'Normal', cssStyle: 'none' },
    { name: 'sepia', label: 'Sepia', cssStyle: 'sepia(1)' },
    { name: 'invert', label: 'Invert', cssStyle: 'invert(1)' },
    { name: 'blur', label: 'Blur', cssStyle: 'blur(3px)' },
    { name: 'grayscale', label: 'Grayscale', cssStyle: 'grayscale(1)' },
    { name: 'colored', label: 'Colored', cssStyle: 'hue-rotate(180deg) saturate(200%)' },
    { name: 'saturate', label: 'Saturate', cssStyle: 'saturate(10)' },
    { name: 'fancy', label: 'Fancy', cssStyle: 'contrast(1.3) grayscale(0.6) saturate(10) sepia(0.4)' }
  ];

  // Signals
  readonly stream = signal<MediaStream | null>(null);
  readonly filterIndex = signal<number>(0);
  readonly capturedImageDataUrl = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly progressText = signal<string>('CHEEEEEESE');
  readonly progressValue = signal<number>(50);

  // Computed signals
  readonly isStreaming = computed(() => !!this.stream());
  readonly currentFilter = computed(() => this.filters[this.filterIndex()]);
  readonly currentFilterName = computed(() => this.currentFilter().name);
  readonly currentFilterStyle = computed(() => this.currentFilter().cssStyle);

  async startCamera(): Promise<void> {
    try {
      this.errorMessage.set(null);
      let mediaStream: MediaStream;

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      } else if ((navigator as any).webkitGetUserMedia) {
        mediaStream = await new Promise((resolve, reject) => {
          (navigator as any).webkitGetUserMedia({ video: true }, resolve, reject);
        });
      } else {
        throw new Error('WebRTC getUserMedia is not supported in this browser.');
      }

      this.stream.set(mediaStream);
    } catch (err: any) {
      console.error('Error starting camera stream:', err);
      this.errorMessage.set(err.message || 'Could not access webcam.');
    }
  }

  stopCamera(): void {
    const currentStream = this.stream();
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
      this.stream.set(null);
    }
  }

  cycleFilter(): void {
    const nextIndex = (this.filterIndex() + 1) % this.filters.length;
    this.filterIndex.set(nextIndex);
  }

  randomizeProgress(): void {
    const value = Math.floor(Math.random() * 100) + 1;
    let type = 'CHEEEEEESE';
    if (value < 25) {
      type = 'CHEEEEEESE';
    } else if (value < 50) {
      type = 'EEEEEEEEEEEEEEEEEEEEEEEEEEEE';
    } else if (value < 75) {
      type = 'Awwwwwwwwwwwwwwwwwwwwwwwwwwww';
    } else {
      type = 'Olalalalalalalalalalalalal!';
    }
    this.progressValue.set(value);
    this.progressText.set(type);
  }

  takeSnapshot(video: HTMLVideoElement, canvas: HTMLCanvasElement): string | null {
    if (!video || !canvas) return null;

    canvas.width = 480;
    canvas.height = 360;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Reset canvas styling
    canvas.className = '';
    const filterName = this.currentFilterName();
    if (filterName && filterName !== 'none') {
      canvas.classList.add(filterName);
    }

    // Bake filter into 2D context buffer
    ctx.filter = this.currentFilterStyle();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/png');
    this.capturedImageDataUrl.set(dataUrl);
    this.randomizeProgress();
    return dataUrl;
  }

  downloadPhoto(filename: string = 'myPicture.png'): void {
    const dataUrl = this.capturedImageDataUrl();
    if (!dataUrl) return;

    const anchor = document.createElement('a');
    anchor.href = dataUrl;
    anchor.download = filename;
    anchor.click();
  }
}
