# Soft Kawaii WebRTC Photobooth Proposal

## Overview
This proposal introduces a "Soft Kawaii" UI/UX overhaul and implements the advanced features from Issue #6:
- **MediaPipe AI Background Removal**: Uses `@mediapipe/tasks-vision` for real-time background segmentation and replacement.
- **Advanced Canvas/WebGL Filters**: Applies soft, cute, and pastel-oriented filters directly to the video feed.
- **Custom Frames**: Playful, rounded overlay frames to match the aesthetic.
- **Instant Sharing**: Utilizes the native Web Share API and dynamically generates QR codes for easy sharing.

## Aesthetic Details
The "Soft Kawaii" aesthetic features:
- **Colors**: Pastel pinks, soft lavenders, mint greens, and baby blues.
- **Shapes**: Generous rounded corners (`border-radius: 24px` to `50px`) and pill-shaped buttons.
- **Typography**: Uses the 'Nunito' rounded font for a soft and approachable look.
- **Micro-animations**: Gentle bouncing and pulsing on hover or click, floating bubbles in the background, and smooth transitions.
- **Shadows**: Soft, diffused drop shadows to give a bubbly, 3D feel.

## Architecture & Files
- `kawaii-photobooth.component.ts|html|scss`: The main standalone component orchestrating the camera, UI, and interactions.
- `image-processing.service.ts`: An injectable service to handle the MediaPipe segmentation and advanced Canvas filtering (brightness, contrast, sepia, pastel overlays).
- `share.service.ts`: Handles the Web Share API integration and QR code generation using a data URI approach.

## How to use
To use this proposal, you can replace the contents of `src/app/app.component.ts` with the provided `KawaiiPhotoboothComponent` or import it into your app module/routing. Ensure you install any necessary dependencies:
```bash
npm install @mediapipe/tasks-vision qrcode
npm install -D @types/qrcode
```
