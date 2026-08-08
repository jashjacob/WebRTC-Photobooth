import { Injectable } from '@angular/core';
import * as QRCode from 'qrcode';

@Injectable({
  providedIn: 'root'
})
export class ShareService {
  constructor() {}

  async generateQRCode(url: string): Promise<string> {
    try {
      // Returns a data URI containing a representation of the QR Code image
      return await QRCode.toDataURL(url, {
        color: {
          dark: '#000000ff', // Sleek Minimalist
          light: '#ffffffff'
        },
        margin: 2
      });
    } catch (err) {
      console.error('Failed to generate QR code', err);
      throw err;
    }
  }

  async share(title: string, text: string, file: File): Promise<void> {
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title,
          text,
          files: [file]
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      console.warn('Web Share API with files is not supported in this browser.');
      // Fallback: download the file
      this.downloadFile(file);
    }
  }

  private downloadFile(file: File): void {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
