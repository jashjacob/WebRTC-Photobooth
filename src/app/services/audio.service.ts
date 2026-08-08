import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  readonly isMuted = signal<boolean>(false);
  private audioCtx: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    if (this.isMuted()) return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  toggleMute(): boolean {
    this.isMuted.update(m => !m);
    return this.isMuted();
  }

  /**
   * Synthesizes a countdown beep tone (e.g. 880Hz or 1050Hz for final tick)
   */
  playBeep(frequency: number = 880, duration: number = 0.12, isFinal: boolean = false): void {
    if (this.isMuted()) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = isFinal ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(isFinal ? 1200 : frequency, ctx.currentTime);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  /**
   * Synthesizes a realistic camera shutter sound using white noise burst and oscillator pitch drop
   */
  playShutter(): void {
    if (this.isMuted()) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // 1. Mechanical Noise Burst (Mirror/Shutter click)
      const bufferSize = ctx.sampleRate * 0.08; // 80ms
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1; // White noise
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.setValueAtTime(1000, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.4, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      // 2. Mechanical Tone Sweep (Lens/Shutter movement)
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.09);

      oscGain.gain.setValueAtTime(0.25, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      // Start sound nodes
      noise.start(now);
      osc.start(now);
      noise.stop(now + 0.08);
      osc.stop(now + 0.09);

      // Secondary click after 60ms (shutter closing)
      setTimeout(() => {
        if (this.isMuted() || !this.audioCtx) return;
        try {
          const clickNow = this.audioCtx.currentTime;
          const osc2 = this.audioCtx.createOscillator();
          const gain2 = this.audioCtx.createGain();
          osc2.type = 'square';
          osc2.frequency.setValueAtTime(200, clickNow);
          osc2.frequency.exponentialRampToValueAtTime(40, clickNow + 0.04);
          gain2.gain.setValueAtTime(0.2, clickNow);
          gain2.gain.exponentialRampToValueAtTime(0.001, clickNow + 0.04);
          osc2.connect(gain2);
          gain2.connect(this.audioCtx.destination);
          osc2.start(clickNow);
          osc2.stop(clickNow + 0.04);
        } catch (e) {
          // ignore error
        }
      }, 60);

    } catch (e) {
      console.warn('Shutter sound error:', e);
    }
  }
}
