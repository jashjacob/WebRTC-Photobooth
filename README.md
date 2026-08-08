# ✨ Kawaii WebRTC Photobooth ✨

[![Netlify Status](https://api.netlify.com/api/v1/badges/e77881c2-022b-4501-8378-e7c65ff2233c/deploy-status)](https://app.netlify.com/projects/phtbth/deploys)

A modern, aesthetic WebRTC photobooth built with **Angular 18**, **HTML5 Canvas**, and **Web Audio API**. Snap single shots or trigger a 4-photo burst session to generate vintage vertical film strip collages with customizable themes and live filters!

---

## 🌟 Key Features

- 📸 **4-Shot Burst Capture:** Multi-shot automated sequence with countdown timer (3s / 5s), screen flash, and audio beeps.
- 🎞️ **Vertical Film Strip Studio:** Auto-generates high-res 35mm film strip collages with custom captions, dates, and sprocket perforations.
- 🎨 **Collage Themes:** Choose between *Classic White*, *Film Black*, *Cyber Cyan*, and *Retro Yellow*.
- 🪄 **Real-time Live Filters:** Hardware-accelerated GPU filters (Sepia, Grayscale, Colored, Pastel Glow, Invert, and more).
- 💾 **Instant Export:** One-click downloads for full vertical film strips and individual shots.
- 🎀 **Soft Kawaii UI:** Pastel glassmorphic interface styled with Google Fonts (Nunito) and smooth micro-animations.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation & Local Run
```bash
# Clone the repository
git clone https://github.com/jashjacob/WebRTC-Photobooth.git

# Install dependencies
npm install

# Start the Angular development server
npm start
```

Navigate to `http://localhost:4200` in your browser.

---

## 🛠️ Tech Stack

- **Framework:** Angular 18+ (Standalone Components, Signals)
- **Video Capture:** WebRTC `MediaDevices.getUserMedia`
- **Graphics & Rendering:** HTML5 2D Canvas & CSS3 Filters
- **Sound Engine:** Web Audio API Oscillator synthesis
- **Hosting / CI/CD:** Netlify

---

## 🕰️ Origin & Evolution

> *Originally built 12 years ago as a minimalist demonstration for a WebRTC tech talk. Completely revamped and modernized into a full-fledged photobooth studio.*
