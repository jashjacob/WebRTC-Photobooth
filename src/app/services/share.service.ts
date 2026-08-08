import { Injectable } from '@angular/core';
import * as QRCode from 'qrcode';

@Injectable({
  providedIn: 'root'
})
export class ShareService {

  constructor() { }

  /**
   * Generates a QR Code as a Data URI string
   * @param data The data (usually a URL) to encode
   */
  async generateQRCode(data: string): Promise<string> {
    try {
      // Soft pastel colors for the QR code to match the Kawaii aesthetic!
      return await QRCode.toDataURL(data, {
        color: {
          dark: '#FF9EBB', // Pastel pink
          light: '#FFFFFF' // White background
        },
        margin: 2,
        scale: 6
      });
    } catch (err) {
      console.error('Error generating QR code', err);
      return '';
    }
  }

  /**
   * Invokes the native Web Share API if available
   */
  async shareNative(title: string, text: string, file?: File): Promise<boolean> {
    if (navigator.share) {
      try {
        const shareData: ShareData = { title, text };
        
        if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
          shareData.files = [file];
        } else if (file) {
           console.warn('File sharing not supported on this browser.');
        }

        await navigator.share(shareData);
        return true;
      } catch (error) {
        console.error('Error sharing:', error);
        return false;
      }
    } else {
      console.warn('Web Share API is not supported in this browser.');
      return false;
    }
  }

  /**
   * Converts a base64 Data URI to a File object
   */
  dataURIToFile(dataUrl: string, filename: string): File {
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, { type: mime });
  }
}
