import { Injectable } from '@angular/core';

export interface FilmStripOptions {
  stripTitle?: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  showSprockets?: boolean;
  filterStyle?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CollageGeneratorService {

  async generateFilmStrip(
    photoDataUrls: string[],
    options: FilmStripOptions = {}
  ): Promise<string> {
    if (!photoDataUrls || photoDataUrls.length === 0) {
      throw new Error('No photos provided for film strip generation.');
    }

    const {
      stripTitle = '✦ PHOTOBOOTH ✦',
      backgroundColor = '#18181c',
      borderColor = '#ffffff',
      textColor = '#f0f0f0',
      showSprockets = true
    } = options;

    const images = await Promise.all(
      photoDataUrls.map(url => this.loadImage(url))
    );

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not obtain 2D rendering context for canvas.');
    }

    const canvasWidth = 520;
    const sideMargin = 45;
    const photoWidth = canvasWidth - (sideMargin * 2); // 430px
    const photoHeight = Math.round(photoWidth * (3 / 4)); // 322.5px ~ 323px (4:3 aspect ratio)
    const headerHeight = 95;
    const footerHeight = 85;
    const photoGap = 20;

    const totalHeight = headerHeight + (images.length * photoHeight) + ((images.length - 1) * photoGap) + footerHeight;

    canvas.width = canvasWidth;
    canvas.height = totalHeight;

    // 1. Fill background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, totalHeight);

    // Subtle inner border line on film strip edge
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.strokeRect(4, 4, canvasWidth - 8, totalHeight - 8);

    // 2. Draw Sprocket Holes along left and right margins
    if (showSprockets) {
      const sprocketWidth = 14;
      const sprocketHeight = 22;
      const sprocketRadius = 4;
      const sprocketGap = 36;
      const leftX = 15;
      const rightX = canvasWidth - 15 - sprocketWidth;

      ctx.fillStyle = '#0a0a0c'; // dark cut-out hole color
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;

      for (let y = 20; y < totalHeight - 20; y += sprocketGap) {
        // Left sprocket hole
        this.drawRoundedRect(ctx, leftX, y, sprocketWidth, sprocketHeight, sprocketRadius);
        ctx.fill();
        ctx.stroke();

        // Right sprocket hole
        this.drawRoundedRect(ctx, rightX, y, sprocketWidth, sprocketHeight, sprocketRadius);
        ctx.fill();
        ctx.stroke();
      }
    }

    // 3. Draw Header
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 24px "Helvetica Neue", Arial, sans-serif';
    ctx.fillText(stripTitle.toUpperCase(), canvasWidth / 2, 45);

    // Decorative line under title
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sideMargin + 20, 72);
    ctx.lineTo(canvasWidth - sideMargin - 20, 72);
    ctx.stroke();

    // 4. Draw Photos & Frame Borders
    images.forEach((img, index) => {
      const photoY = headerHeight + index * (photoHeight + photoGap);

      // Frame background / border shadow
      ctx.fillStyle = '#000000';
      ctx.fillRect(sideMargin - 4, photoY - 4, photoWidth + 8, photoHeight + 8);

      // Draw photo image
      ctx.drawImage(img, sideMargin, photoY, photoWidth, photoHeight);

      // Photo border highlight
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 3;
      ctx.strokeRect(sideMargin, photoY, photoWidth, photoHeight);

      // Shot number badge overlay
      const badgeText = `#${index + 1}`;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.fillRect(sideMargin + 8, photoY + 8, 36, 24);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(sideMargin + 8, photoY + 8, 36, 24);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeText, sideMargin + 26, photoY + 20);
    });

    // 5. Draw Footer
    const footerY = totalHeight - (footerHeight / 2);

    // Timestamp
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    }).toUpperCase();
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    ctx.fillStyle = textColor;
    ctx.font = 'bold 14px "Helvetica Neue", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${dateStr} • ${timeStr}`, canvasWidth / 2, footerY - 8);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '11px sans-serif';
    ctx.fillText('WEBRTC PHOTOBOOTH • 4-SHOT MEMORIES', canvasWidth / 2, footerY + 14);

    return canvas.toDataURL('image/png');
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
    width: number,
    height: number,
    radius: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
}
