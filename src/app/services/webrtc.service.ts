import { Injectable, signal, computed, inject } from '@angular/core';
import { AudioService } from './audio.service';
import confetti from 'canvas-confetti';

export interface FilterInfo {
  name: string;
  label: string;
  cssStyle: string;
}

export type FilmStripThemeKey = 
  | 'classic-white' 
  | 'film-black' 
  | 'cyber-cyan' 
  | 'retro-yellow'
  | 'sakura-blossom'
  | 'y2k-sparkle'
  | 'washi-tape'
  | 'kawaii-paws'
  | 'vintage-stamp'
  | 'rainbow-sherbet';

export interface FilmStripTheme {
  key: FilmStripThemeKey;
  label: string;
  bgColor: string;
  frameBorderColor: string;
  sprocketColor: string;
  textColor: string;
  accentColor: string;
  headerTitle: string;
}

@Injectable({
  providedIn: 'root'
})
export class WebRtcService {
  private readonly audioService = inject(AudioService);

  readonly themes: Record<FilmStripThemeKey, FilmStripTheme> = {
    'classic-white': {
      key: 'classic-white',
      label: 'Classic White',
      bgColor: '#FFFFFF',
      frameBorderColor: '#D1D5DB',
      sprocketColor: '#1F2937',
      textColor: '#111827',
      accentColor: '#EF4444',
      headerTitle: 'PHOTOBOOTH MEMORIES'
    },
    'film-black': {
      key: 'film-black',
      label: 'Film Black',
      bgColor: '#121212',
      frameBorderColor: '#262626',
      sprocketColor: '#E5E7EB',
      textColor: '#F9FAFB',
      accentColor: '#FACC15',
      headerTitle: '35MM FILM STRIP'
    },
    'cyber-cyan': {
      key: 'cyber-cyan',
      label: 'Cyber Cyan',
      bgColor: '#08131F',
      frameBorderColor: '#00F3FF',
      sprocketColor: '#00F3FF',
      textColor: '#00F3FF',
      accentColor: '#FF007F',
      headerTitle: 'CYBER PHOTO LAB'
    },
    'retro-yellow': {
      key: 'retro-yellow',
      label: 'Retro Yellow',
      bgColor: '#FEF08A',
      frameBorderColor: '#854D0E',
      sprocketColor: '#451A03',
      textColor: '#713F12',
      accentColor: '#DC2626',
      headerTitle: 'RETRO 1970s BOOTH'
    },
    'sakura-blossom': {
      key: 'sakura-blossom',
      label: '🌸 Sakura Blossom',
      bgColor: '#FFF0F5',
      frameBorderColor: '#FFB6C1',
      sprocketColor: '#FF69B4',
      textColor: '#4A0E2E',
      accentColor: '#FF1493',
      headerTitle: '🌸 SAKURA MEMORIES 🌸'
    },
    'y2k-sparkle': {
      key: 'y2k-sparkle',
      label: '✨ Y2K Hologram',
      bgColor: '#F3E8FF',
      frameBorderColor: '#C084FC',
      sprocketColor: '#818CF8',
      textColor: '#3B0764',
      accentColor: '#9333EA',
      headerTitle: '✨ Y2K SPARKLE LAB ✨'
    },
    'washi-tape': {
      key: 'washi-tape',
      label: '💌 Washi Scrapbook',
      bgColor: '#FEF9E7',
      frameBorderColor: '#D4A373',
      sprocketColor: '#A98467',
      textColor: '#43281C',
      accentColor: '#E07A5F',
      headerTitle: '💌 MEMORY SCRAPBOOK 💌'
    },
    'kawaii-paws': {
      key: 'kawaii-paws',
      label: '🐾 Kawaii Paws',
      bgColor: '#FFF1F2',
      frameBorderColor: '#FDA4AF',
      sprocketColor: '#FB7185',
      textColor: '#881337',
      accentColor: '#E11D48',
      headerTitle: '🐾 KAWAII POOKIE BOOTH 🐾'
    },
    'vintage-stamp': {
      key: 'vintage-stamp',
      label: '📬 Vintage Postage',
      bgColor: '#FDFBF7',
      frameBorderColor: '#B7B7A4',
      sprocketColor: '#6B705C',
      textColor: '#3D405B',
      accentColor: '#C97A7E',
      headerTitle: '📬 AIRMAIL POSTCARD 📬'
    },
    'rainbow-sherbet': {
      key: 'rainbow-sherbet',
      label: '🌈 Rainbow Sherbet',
      bgColor: '#F0FDF4',
      frameBorderColor: '#38BDF8',
      sprocketColor: '#F472B6',
      textColor: '#1E3A8A',
      accentColor: '#EC4899',
      headerTitle: '🌈 RAINBOW SHERBET 🌈'
    }
  };

  readonly filters: FilterInfo[] = [
    { name: 'none', label: 'Normal', cssStyle: 'none' },
    { name: 'pastel', label: 'Pastel Glow', cssStyle: 'brightness(1.1) saturate(0.9) sepia(0.15) hue-rotate(-10deg)' },
    { name: 'dreamy', label: 'Dreamy Bloom', cssStyle: 'brightness(1.15) contrast(0.95) saturate(1.15) sepia(0.1)' },
    { name: 'vhs', label: '90s VHS Cam', cssStyle: 'contrast(1.15) saturate(1.45) hue-rotate(-15deg) sepia(0.2)' },
    { name: 'golden-hour', label: 'Golden Hour', cssStyle: 'sepia(0.4) saturate(1.55) hue-rotate(-25deg) brightness(1.05) contrast(1.1)' },
    { name: 'matcha', label: 'Matcha Film', cssStyle: 'contrast(0.92) brightness(1.08) saturate(0.85) sepia(0.2) hue-rotate(15deg)' },
    { name: 'bubblegum', label: 'Bubblegum Pop', cssStyle: 'saturate(2.2) contrast(1.2) brightness(1.05) hue-rotate(10deg)' },
    { name: 'film-noir', label: 'Classic Noir', cssStyle: 'grayscale(1) contrast(1.45) brightness(0.95)' },
    { name: 'sepia', label: 'Vintage Sepia', cssStyle: 'sepia(1)' },
    { name: 'grayscale', label: 'Grayscale', cssStyle: 'grayscale(1)' },
    { name: 'invert', label: 'Invert', cssStyle: 'invert(1)' },
    { name: 'blur', label: 'Soft Blur', cssStyle: 'blur(3px)' },
    { name: 'colored', label: 'Psychedelic', cssStyle: 'hue-rotate(180deg) saturate(200%)' },
    { name: 'fancy', label: 'Fancy Pop', cssStyle: 'contrast(1.3) grayscale(0.6) saturate(10) sepia(0.4)' }
  ];

  // Core Stream & Filter Signals
  readonly stream = signal<MediaStream | null>(null);
  readonly filterIndex = signal<number>(0);
  readonly capturedImageDataUrl = signal<string | null>(null);
  readonly capturedPhotos = signal<string[]>([]);
  readonly errorMessage = signal<string | null>(null);
  readonly progressText = signal<string>('Ready for Photobooth');
  readonly progressValue = signal<number>(0);

  // Countdown & Burst Signals
  readonly countdownSeconds = signal<number>(3); // 3s or 5s
  readonly countdownValue = signal<number | null>(null);
  readonly isCapturing = signal<boolean>(false);
  readonly burstIndex = signal<number>(1); // 1..4
  readonly isFlashActive = signal<boolean>(false);

  // Film Strip Settings Signals
  readonly selectedThemeKey = signal<FilmStripThemeKey>('sakura-blossom');
  readonly customFooterText = signal<string>('PHOTOBOOTH SESSION');
  readonly includeTimestamp = signal<boolean>(true);
  readonly filmStripDataUrl = signal<string | null>(null);

  // Computed signals
  readonly isStreaming = computed(() => !!this.stream());
  readonly currentFilter = computed(() => this.filters[this.filterIndex()]);
  readonly currentFilterName = computed(() => this.currentFilter().name);
  readonly currentFilterStyle = computed(() => this.currentFilter().cssStyle);
  readonly currentTheme = computed(() => this.themes[this.selectedThemeKey()]);
  readonly isCountingDown = computed(() => this.countdownValue() !== null && this.countdownValue()! > 0);

  async startCamera(): Promise<void> {
    try {
      this.errorMessage.set(null);
      let mediaStream: MediaStream;

      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          facingMode: 'user',
          frameRate: { ideal: 30, max: 60 }
        },
        audio: false
      };

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      } else if ((navigator as any).webkitGetUserMedia) {
        mediaStream = await new Promise((resolve, reject) => {
          (navigator as any).webkitGetUserMedia(constraints, resolve, reject);
        });
      } else {
        throw new Error('WebRTC getUserMedia is not supported in this browser.');
      }

      this.stream.set(mediaStream);
      this.progressText.set('Camera active! Select countdown and click 4-Shot Burst.');
      this.progressValue.set(25);
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

  setFilterIndex(index: number): void {
    if (index >= 0 && index < this.filters.length) {
      this.filterIndex.set(index);
    }
  }

  setTheme(themeKey: FilmStripThemeKey): void {
    this.selectedThemeKey.set(themeKey);
    if (this.capturedPhotos().length > 0) {
      this.renderFilmStripCollage();
    }
  }

  setCountdownSeconds(sec: number): void {
    if (sec === 3 || sec === 5) {
      this.countdownSeconds.set(sec);
    }
  }

  setCustomFooterText(text: string): void {
    this.customFooterText.set(text);
    if (this.capturedPhotos().length > 0) {
      this.renderFilmStripCollage();
    }
  }

  toggleTimestamp(): void {
    this.includeTimestamp.update(v => !v);
    if (this.capturedPhotos().length > 0) {
      this.renderFilmStripCollage();
    }
  }

  /**
   * Triggers single photo snapshot with countdown timer and audio-visual shutter
   */
  async triggerSingleSnap(video: HTMLVideoElement, canvas: HTMLCanvasElement): Promise<string | null> {
    if (!video || !canvas || this.isCapturing()) return null;

    this.isCapturing.set(true);
    const delaySec = this.countdownSeconds();

    for (let sec = delaySec; sec >= 1; sec--) {
      this.countdownValue.set(sec);
      this.audioService.playBeep(880, 0.12, sec === 1);
      this.progressText.set(`Get ready! Snap in ${sec}...`);
      await this.sleep(1000);
    }

    this.countdownValue.set(0);
    this.triggerFlashAndShutter();
    const dataUrl = this.takeFrameSnapshot(video, canvas);
    this.capturedImageDataUrl.set(dataUrl);

    if (dataUrl) {
      this.capturedPhotos.update(photos => {
        const next = [...photos, dataUrl];
        return next.slice(-4);
      });
    }

    await this.sleep(300);
    this.countdownValue.set(null);
    this.isCapturing.set(false);

    if (this.capturedPhotos().length > 0) {
      await this.renderFilmStripCollage();
    }

    this.progressText.set('Single photo captured!');
    this.progressValue.set(100);
    return dataUrl;
  }

  /**
   * Executes a 4-photo burst capture sequence with 3s/5s countdowns and flash effects
   */
  async startBurstCapture(video: HTMLVideoElement, canvas: HTMLCanvasElement): Promise<void> {
    if (!video || !canvas || this.isCapturing() || !this.isStreaming()) return;

    this.isCapturing.set(true);
    this.capturedPhotos.set([]); // Reset photos for new burst session
    this.filmStripDataUrl.set(null);

    const photos: string[] = [];
    const totalShots = 4;
    const delaySec = this.countdownSeconds();

    for (let i = 1; i <= totalShots; i++) {
      this.burstIndex.set(i);
      this.progressValue.set(Math.round(((i - 1) / totalShots) * 100));

      // Countdown loop for current shot
      for (let sec = delaySec; sec >= 1; sec--) {
        this.countdownValue.set(sec);
        this.progressText.set(`Shot ${i} of ${totalShots}: Pose! Snap in ${sec}s...`);
        this.audioService.playBeep(880 + (delaySec - sec) * 100, 0.12, sec === 1);
        await this.sleep(1000);
      }

      // Flash & Capture
      this.countdownValue.set(0);
      this.triggerFlashAndShutter();

      const dataUrl = this.takeFrameSnapshot(video, canvas);
      if (dataUrl) {
        photos.push(dataUrl);
        this.capturedPhotos.set([...photos]);
        this.capturedImageDataUrl.set(dataUrl);
      }

      await this.sleep(400);
      this.countdownValue.set(null);

      // Pause between shots if not the last one
      if (i < totalShots) {
        this.progressText.set(`Pose for shot ${i + 1}!`);
        await this.sleep(800);
      }
    }

    this.progressValue.set(90);
    this.progressText.set('Stitching 4-Shot Film Strip Collage...');

    // Generate collage
    await this.renderFilmStripCollage();

    this.isCapturing.set(false);
    this.progressValue.set(100);
    this.progressText.set('Burst session complete! Download your film strip below.');
    this.launchConfetti();
  }

  launchConfetti(): void {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFB6C1', '#FF9EBB', '#C19EF5', '#87CEEB', '#FEF08A']
      });
    } catch (e) {
      console.warn('Confetti launch error:', e);
    }
  }

  clearPhotos(): void {
    this.capturedPhotos.set([]);
    this.capturedImageDataUrl.set(null);
    this.filmStripDataUrl.set(null);
    this.progressText.set('Cleared gallery. Ready for next session!');
  }

  private triggerFlashAndShutter(): void {
    this.isFlashActive.set(true);
    this.audioService.playShutter();
    setTimeout(() => {
      this.isFlashActive.set(false);
    }, 280);
  }

  takeFrameSnapshot(video: HTMLVideoElement, canvas: HTMLCanvasElement): string | null {
    if (!video || !canvas) return null;

    canvas.width = 640;
    canvas.height = 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.save();
    const filterStyle = this.currentFilterStyle();
    if (filterStyle && filterStyle !== 'none') {
      ctx.filter = filterStyle;
    } else {
      ctx.filter = 'none';
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    return canvas.toDataURL('image/png');
  }

  /**
   * HTML5 Canvas 2D Vertical Film Strip Collage Generator
   */
  async renderFilmStripCollage(): Promise<string | null> {
    const photos = this.capturedPhotos();
    if (photos.length === 0) return null;

    const theme = this.currentTheme();
    const canvas = document.createElement('canvas');

    // High resolution canvas dimensions
    const width = 600;
    const headerHeight = 110;
    const footerHeight = 130;
    const sideMargin = 60; // Space for sprocket holes
    const frameGap = 20;

    const photoWidth = width - sideMargin * 2; // 480px
    const photoHeight = Math.round(photoWidth * (3 / 4)); // 360px (4:3 aspect ratio)

    const numFrames = 4;
    const framesTotalHeight = numFrames * photoHeight + (numFrames - 1) * frameGap;
    const height = headerHeight + framesTotalHeight + footerHeight;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // 1. Draw Background
    if (theme.key === 'rainbow-sherbet') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#FFE4E6');
      grad.addColorStop(0.25, '#FEF3C7');
      grad.addColorStop(0.5, '#ECFDF5');
      grad.addColorStop(0.75, '#E0F2FE');
      grad.addColorStop(1, '#F3E8FF');
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = theme.bgColor;
    }
    ctx.fillRect(0, 0, width, height);

    // 2. Draw Outer Border Glow / Styling
    if (theme.key === 'cyber-cyan') {
      ctx.shadowColor = '#00F3FF';
      ctx.shadowBlur = 15;
      ctx.strokeStyle = '#00F3FF';
      ctx.lineWidth = 3;
      ctx.strokeRect(4, 4, width - 8, height - 8);
      ctx.shadowBlur = 0;
    } else if (theme.key === 'sakura-blossom' || theme.key === 'kawaii-paws') {
      ctx.strokeStyle = theme.frameBorderColor;
      ctx.lineWidth = 3;
      ctx.strokeRect(6, 6, width - 12, height - 12);
    }

    // 3. Draw Film Strip Perforations (Sprocket Holes)
    const holeWidth = 14;
    const holeHeight = 22;
    const holeRadius = 4;
    const holeSpacing = 38;
    const leftHoleX = 22;
    const rightHoleX = width - 22 - holeWidth;

    ctx.fillStyle = theme.sprocketColor;
    for (let y = 15; y < height - 15; y += holeSpacing) {
      if (theme.key === 'kawaii-paws') {
        // Cute mini paw or rounded dot
        ctx.beginPath();
        ctx.arc(leftHoleX + holeWidth / 2, y + holeHeight / 2, 7, 0, Math.PI * 2);
        ctx.arc(rightHoleX + holeWidth / 2, y + holeHeight / 2, 7, 0, Math.PI * 2);
        ctx.fill();
      } else {
        this.drawRoundedRect(ctx, leftHoleX, y, holeWidth, holeHeight, holeRadius);
        this.drawRoundedRect(ctx, rightHoleX, y, holeWidth, holeHeight, holeRadius);
      }
    }

    // 4. Draw Header
    ctx.fillStyle = theme.textColor;
    ctx.font = 'bold 24px "Nunito", "Courier New", monospace, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(theme.headerTitle, width / 2, 52);

    ctx.fillStyle = theme.accentColor;
    ctx.font = 'bold 13px "Nunito", sans-serif';
    ctx.fillText('★ BURST SHOT SESSION ★', width / 2, 78);

    // Header divider line
    ctx.strokeStyle = theme.frameBorderColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sideMargin, 92);
    ctx.lineTo(width - sideMargin, 92);
    ctx.stroke();

    // 5. Load and Draw Photo Frames
    const loadedImages = await Promise.all(
      photos.slice(0, 4).map(src => this.loadImage(src))
    );

    let startY = headerHeight;

    for (let i = 0; i < numFrames; i++) {
      const frameY = startY + i * (photoHeight + frameGap);

      // Frame background placeholder
      ctx.fillStyle = theme.key === 'film-black' ? '#1F2937' : '#F3F4F6';
      ctx.fillRect(sideMargin, frameY, photoWidth, photoHeight);

      // Draw photo image if captured
      if (loadedImages[i]) {
        ctx.drawImage(loadedImages[i], sideMargin, frameY, photoWidth, photoHeight);
      } else {
        // Empty frame marker
        ctx.fillStyle = theme.textColor;
        ctx.font = '16px "Nunito", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`FRAME ${i + 1} EMPTY`, width / 2, frameY + photoHeight / 2);
      }

      // Photo Frame Stroke
      ctx.strokeStyle = theme.frameBorderColor;
      ctx.lineWidth = 3;
      ctx.strokeRect(sideMargin, frameY, photoWidth, photoHeight);

      // Theme-specific photo decorations
      if (theme.key === 'washi-tape') {
        // Draw cute pastel tape on top-left and top-right corners
        ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 182, 193, 0.75)' : 'rgba(186, 230, 253, 0.75)';
        ctx.fillRect(sideMargin - 10, frameY - 6, 45, 16);
        ctx.fillStyle = i % 2 === 0 ? 'rgba(254, 240, 138, 0.75)' : 'rgba(233, 213, 255, 0.75)';
        ctx.fillRect(sideMargin + photoWidth - 35, frameY - 6, 45, 16);
      } else if (theme.key === 'y2k-sparkle') {
        // Draw sparkle stars at frame corners
        ctx.fillStyle = '#C084FC';
        ctx.font = '16px sans-serif';
        ctx.fillText('✦', sideMargin + 14, frameY + 22);
        ctx.fillText('✦', sideMargin + photoWidth - 14, frameY + photoHeight - 10);
      } else if (theme.key === 'sakura-blossom') {
        ctx.font = '14px sans-serif';
        ctx.fillText('🌸', sideMargin + 16, frameY + 20);
      }

      // Frame Number Labels on Film Margin
      ctx.fillStyle = theme.textColor;
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`0${i + 1} A`, leftHoleX + holeWidth + 6, frameY + 20);
      ctx.fillText('FUJI 400', rightHoleX - 58, frameY + 20);
    }

    // 6. Draw Footer
    const footerStartY = headerHeight + framesTotalHeight + 15;

    // Footer divider line
    ctx.strokeStyle = theme.frameBorderColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sideMargin, footerStartY);
    ctx.lineTo(width - sideMargin, footerStartY);
    ctx.stroke();

    // Custom Footer Text
    ctx.fillStyle = theme.textColor;
    ctx.font = 'bold 18px "Nunito", "Courier New", monospace, sans-serif';
    ctx.textAlign = 'center';
    const customText = this.customFooterText() || 'PHOTOBOOTH SESSION';
    ctx.fillText(customText.toUpperCase(), width / 2, footerStartY + 35);

    // Timestamp & Date rendering
    if (this.includeTimestamp()) {
      const now = new Date();
      const dateStr = now.toISOString().replace('T', ' ').substring(0, 19);
      ctx.fillStyle = theme.accentColor;
      ctx.font = 'bold 13px monospace';
      ctx.fillText(`DATE: ${dateStr}`, width / 2, footerStartY + 60);
    }

    // Decorative Barcode / Serial stamp
    ctx.fillStyle = theme.textColor;
    ctx.font = '10px monospace';
    ctx.fillText('||| | ||||| ||| |||| || ||||| |||', width / 2, footerStartY + 82);
    ctx.fillText(`#PB-${Date.now().toString().slice(-6)}`, width / 2, footerStartY + 96);

    const dataUrl = canvas.toDataURL('image/png');
    this.filmStripDataUrl.set(dataUrl);
    return dataUrl;
  }

  downloadSinglePhoto(filename: string = 'photobooth-snap.png'): void {
    const dataUrl = this.capturedImageDataUrl();
    if (!dataUrl) return;
    this.triggerDownload(dataUrl, filename);
  }

  downloadFilmStrip(filename: string = 'photobooth-filmstrip.png'): void {
    const dataUrl = this.filmStripDataUrl();
    if (!dataUrl) return;
    this.triggerDownload(dataUrl, filename);
  }

  private triggerDownload(dataUrl: string, filename: string): void {
    const anchor = document.createElement('a');
    anchor.href = dataUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
      img.src = src;
    });
  }

  private drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fill();
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
