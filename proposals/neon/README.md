# Neon Cyberpunk - UI/UX Overhaul & Advanced AI Features Proposal

This directory contains the proposed implementation for **Issue #6: AI background removal, advanced filters, custom frames, and instant sharing** under a cohesive **Neon Cyberpunk Aesthetic**. 

> Note: These files are provided as a complete module proposal and do not disrupt the existing codebase in `src/`.

## 1. Design Choices (The Neon Cyberpunk Aesthetic)

We redesigned the entire photobooth interface with a high-contrast dark mode that immerses the user in a retro-futuristic Cyberpunk world:
- **Color Palette:** Deep blacks and dark violets contrasted heavily with bright Cyan (`#0ff`) and Magenta (`#f0f`).
- **Typography:** Courier / Monospace fonts mixed with glowing block text to simulate terminal hacking aesthetics.
- **Effects & Overlays:**
  - **CRT Scanlines:** An animated/static CSS overlay simulates looking through a vintage monitor.
  - **Glitch Text:** The primary header (`CYBERBOOTH`) uses advanced CSS keyframe animations with text-shadow slicing to create a chaotic glitch effect.
  - **Glowing Borders:** Inputs and viewfinder are wrapped in box-shadows that mimic neon light tubes.

## 2. Technical Implementation details

### 2.1. MediaPipe AI Background Segmentation
**Service:** `mediapipe-segmentation.service.ts`
- Utilizes Google's `@mediapipe/tasks-vision` API to inject the WASM Selfie Segmentation model.
- Processess video frames in real-time (`ImageSegmenter.segmentForVideo`) to extract a precise `categoryMask` where the user is detected.

### 2.2. Advanced Canvas & WebGL Filters
**Service:** `filter-engine.service.ts`
- A robust Filter Engine built on HTML5 Canvas API (serving as a fallback/wrapper for WebGL-style effects).
- **Background Replacement/Blur:** Merges the original video with the MediaPipe segmentation mask. We use Canvas `globalCompositeOperation` (`source-in` and `destination-over`) to either blur the background or replace it entirely.
- **Filters:** 
  - *Neon Glow:* Screen composite operations with heavy CSS-style Canvas context filters.
  - *Cyber Glitch:* Simulates RGB splitting by shifting red and cyan channels on top of the original image with varying opacities, and performs pixel-slicing using `drawImage`.

### 2.3. Holographic Custom Frames
- Frames are overlayed in real-time in the viewfinder using CSS grid/absolute positioning, giving the user immediate feedback.
- At capture time, the `takePhoto()` method merges the processed canvas and the selected frame image dynamically before generating the final Data URI.

### 2.4. QR Code and Web Share API
**Service:** `share.service.ts`
- Once captured, the user can instantly share their creation.
- Uses `navigator.share()` (Web Share API) where supported, packing the final Data URI into a `File` object for seamless OS-level sharing (Instagram, Twitter, WhatsApp).
- Generates a **QR Code** dynamically, mocking an upload to a cloud bucket, returning a scannable URL link directly on the user's screen.

## 3. Recommended External Libraries

To integrate this proposal into the main app cleanly, you will need the following dependencies:
- `@mediapipe/tasks-vision`: For robust, on-device AI selfie segmentation.
- `qrcode`: To generate the QR code SVGs/Data URLs for instant sharing.

## 4. Usage Instructions

1. Incorporate the components and services from this folder into the main Angular app module.
2. Update the `angular.json` to include any required MediaPipe WASM assets.
3. Ensure the app is served securely via HTTPS, as the `navigator.share` and `navigator.mediaDevices.getUserMedia` APIs require a secure context to operate fully.
