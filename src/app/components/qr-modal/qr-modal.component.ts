import { Component, input, output, effect, ElementRef, viewChild } from '@angular/core';
import QRCode from 'qrcode';

@Component({
  selector: 'app-qr-modal',
  standalone: true,
  template: `
    @if (isOpen()) {
      <div class="qr-modal-backdrop" (click)="close()">
        <div class="qr-modal-card" (click)="$event.stopPropagation()">
          <button class="close-btn" (click)="close()" aria-label="Close modal">✕</button>
          
          <div class="modal-header">
            <h2>📱 Share Your Photos</h2>
            <p>Scan with your phone to save your film strip instantly!</p>
          </div>

          <div class="qr-container">
            @if (isLoading()) {
              <div class="loading-spinner"></div>
              <p class="loading-text">Uploading to Cloud...</p>
            } @else if (error()) {
              <div class="error-state">
                <span class="icon">⚠️</span>
                <p>Upload failed. Please try again.</p>
              </div>
            } @else {
              <canvas #qrCanvas class="qr-canvas"></canvas>
            }
          </div>

          @if (shareUrl() && !isLoading() && !error()) {
            <div class="share-link-container">
              <input type="text" [value]="shareUrl()" readonly #linkInput>
              <button class="copy-btn" (click)="copyLink(linkInput)" [class.copied]="copied">
                {{ copied ? '✓ Copied!' : 'Copy Link' }}
              </button>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .qr-modal-backdrop {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 16px;
      animation: fadeIn 0.3s ease-out;
    }
    .qr-modal-card {
      background: rgba(255, 255, 255, 0.95);
      border: 2px solid rgba(255, 255, 255, 1);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
      border-radius: 24px;
      padding: 32px;
      max-width: 400px;
      width: 100%;
      position: relative;
      text-align: center;
      animation: slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .close-btn {
      position: absolute;
      top: 16px; right: 16px;
      background: rgba(0,0,0,0.05);
      border: none;
      width: 32px; height: 32px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .close-btn:hover {
      background: rgba(0,0,0,0.1);
      transform: scale(1.1);
    }
    .modal-header h2 {
      margin: 0 0 8px 0;
      font-size: 1.5rem;
      color: #333;
    }
    .modal-header p {
      margin: 0 0 24px 0;
      color: #666;
      font-size: 0.95rem;
    }
    .qr-container {
      background: white;
      border-radius: 16px;
      padding: 16px;
      min-height: 200px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-shadow: inset 0 2px 10px rgba(0,0,0,0.05);
      margin-bottom: 24px;
    }
    .qr-canvas {
      width: 200px !important;
      height: 200px !important;
    }
    .loading-spinner {
      width: 40px; height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #ff69b4;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }
    .loading-text {
      color: #ff69b4;
      font-weight: bold;
    }
    .error-state .icon {
      font-size: 2rem;
      display: block;
      margin-bottom: 8px;
    }
    .error-state p {
      color: #ff4444;
      font-weight: bold;
      margin: 0;
    }
    .share-link-container {
      display: flex;
      gap: 8px;
      background: #f5f5f5;
      padding: 8px;
      border-radius: 12px;
    }
    .share-link-container input {
      flex: 1;
      border: none;
      background: transparent;
      padding: 8px;
      font-size: 0.9rem;
      color: #555;
      outline: none;
    }
    .copy-btn {
      background: #ff69b4;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 8px 16px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.2s;
    }
    .copy-btn:hover {
      background: #ff1493;
    }
    .copy-btn.copied {
      background: #4CAF50;
    }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class QrModalComponent {
  isOpen = input<boolean>(false);
  isLoading = input<boolean>(false);
  error = input<boolean>(false);
  shareUrl = input<string | null>(null);
  
  onClose = output<void>();
  qrCanvas = viewChild<ElementRef<HTMLCanvasElement>>('qrCanvas');
  
  copied = false;

  constructor() {
    effect(() => {
      const url = this.shareUrl();
      const canvasRef = this.qrCanvas();
      
      if (url && canvasRef?.nativeElement && !this.isLoading() && !this.error()) {
        QRCode.toCanvas(canvasRef.nativeElement, url, {
          width: 200,
          margin: 1,
          color: {
            dark: '#ff69b4',
            light: '#ffffff'
          }
        }, (error) => {
          if (error) console.error('QR Code generation error:', error);
        });
      }
    });
  }

  close() {
    this.copied = false;
    this.onClose.emit();
  }

  copyLink(inputEl: HTMLInputElement) {
    inputEl.select();
    document.execCommand('copy');
    this.copied = true;
    setTimeout(() => this.copied = false, 2000);
  }
}
