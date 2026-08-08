# WebRTC Photobooth - Sleek Minimalist Proposal (Agent 3)

## Overview
This proposal introduces a **premium, high-contrast monochromatic design** featuring subtle glassmorphism (`.glass` classes utilizing `backdrop-filter: blur()`). It implements all requirements from Issue #6 without modifying the core `src/` directory.

## Features Implemented
1. **MediaPipe AI Background Removal**: 
   - Uses `@mediapipe/selfie_segmentation` in `camera.service.ts` to generate segmentation masks. 
   - Uses `destination-atop` and `source-out` composite operations on the Canvas 2D Context to separate the foreground (person) from the background.
   - Provides options to replace the background with a blur or a solid color.
2. **Advanced Canvas Filters**:
   - Instead of complex WebGL overhead, native Canvas 2D `filter` property provides high-performance filters (Monochrome, Sepia, Invert, Blur).
3. **Custom Frames**:
   - Supports overlaying transparent images/SVGs over the processed camera feed.
4. **Instant Sharing (QR & Web Share API)**:
   - Uses the `qrcode` library to generate QR codes with custom styling matching the monochromatic minimalist theme.
   - Leverages `navigator.share` (Web Share API) where supported, allowing users to native-share the generated image file straight to other apps.

## Design Choices
- **Glassmorphism**: Minimalist frosted glass panels allow the radial dark background to shine through, emphasizing the content.
- **Monochrome UI**: A strict black-and-white color palette with varying opacities for text and borders to maintain a premium feel.
- **Performance**: Operations are chained efficiently inside `requestAnimationFrame` using a single offscreen canvas approach in the service.

## Installation / Testing (for the main project later)
If you wish to integrate these features into the main app:
```bash
npm install @mediapipe/selfie_segmentation qrcode
npm install -D @types/qrcode
```
Then copy the contents of `app.component.ts`, `app.component.html`, `app.component.scss`, `camera.service.ts`, and `share.service.ts` into the main `src/app/` folder.
