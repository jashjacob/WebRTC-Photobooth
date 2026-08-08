import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ShareService {
  constructor() {}

  async sharePhoto(dataUrl: string, filename: string = 'cyber-photo.png'): Promise<void> {
    try {
      const blob = await this.dataUrlToBlob(dataUrl);
      const file = new File([blob], filename, { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'My Neon Cyberpunk Photo',
          text: 'Check out my awesome photo from the Neon Photobooth!',
          files: [file]
        });
      } else {
        // Fallback for browsers that don't support Web Share API with files
        this.downloadLocal(dataUrl, filename);
      }
    } catch (error) {
      console.error('Sharing failed:', error);
      // Fallback
      this.downloadLocal(dataUrl, filename);
    }
  }

  generateQRCode(dataUrl: string): Promise<string> {
    // In a real app, you'd upload the dataUrl to a cloud bucket (e.g. AWS S3, Cloudinary)
    // and generate a QR code for the public URL using a library like `qrcode`.
    // For this proposal, we mock the QR code generation of a mock URL.
    return new Promise((resolve) => {
      // Assuming 'qrcode' package is available: qrcode.toDataURL(url)
      // Mocking the result with a placeholder QR image
      const mockQrDataUrl = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="%23fff"/><text x="10" y="100" fill="%23000">QR Code Mock</text></svg>';
      resolve(mockQrDataUrl);
    });
  }

  private async dataUrlToBlob(dataUrl: string): Promise<Blob> {
    const res = await fetch(dataUrl);
    return await res.blob();
  }

  private downloadLocal(dataUrl: string, filename: string) {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
