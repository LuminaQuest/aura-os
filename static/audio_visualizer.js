/**
 * audio_visualizer.js — Real-Time Web Audio Frequency HUD & Procedural Sound Engine.
 * Generates luxury sci-fi audio on-the-fly (zero external audio files needed):
 * - Sub-bass warp sweeps during camera zoom fly-throughs
 * - Crystalline harmonic chords on portal entry
 * - Laser forcefield deflection pulses on guardrail intercept
 * - Real-time speech synthesis narrator and 24-band frequency spectrum
 */

class AudioVisualizerHUD {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext("2d") : null;
    this.isSpeaking = false;
    this.voiceEnabled = true;
    this.sfxEnabled = true;
    this.bars = 28;
    this.heights = new Array(this.bars).fill(4);

    this.audioCtx = null;

    this.setupToggles();
    this.startOscillatorLoop();
  }

  ensureAudioContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  }

  setupToggles() {
    // Voice Narrator Toggle
    const btnVoice = document.getElementById("btn-voice-toggle");
    const labelVoice = document.getElementById("voice-label");
    if (btnVoice) {
      btnVoice.addEventListener("click", () => {
        this.voiceEnabled = !this.voiceEnabled;
        if (!this.voiceEnabled) {
          window.speechSynthesis.cancel();
          this.isSpeaking = false;
        }
        if (labelVoice) labelVoice.textContent = this.voiceEnabled ? "[VOX: ON]" : "[VOX: OFF]";
        btnVoice.style.opacity = this.voiceEnabled ? "1" : "0.5";
      });
    }

    // SFX Toggle
    const btnSfx = document.getElementById("btn-sfx-toggle");
    const labelSfx = document.getElementById("sfx-label");
    if (btnSfx) {
      btnSfx.addEventListener("click", () => {
        this.sfxEnabled = !this.sfxEnabled;
        if (labelSfx) labelSfx.textContent = this.sfxEnabled ? "[SFX: ON]" : "[SFX: OFF]";
        btnSfx.style.opacity = this.sfxEnabled ? "1" : "0.5";
      });
    }

    // Unlock AudioContext on first pointer interaction
    window.addEventListener("pointerdown", () => this.ensureAudioContext(), { once: true });
  }

  /**
   * Cinematic Sub-Bass Warp Sweep (55Hz -> 240Hz with exponential ramp)
   * Triggered when camera plunges into a 3D portal
   */
  playWarpSweep() {
    if (!this.sfxEnabled) return;
    this.ensureAudioContext();
    if (!this.audioCtx) return;

    const t = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const filter = this.audioCtx.createBiquadFilter();

    osc.type = "sine";
    osc.frequency.setValueAtTime(55, t);
    osc.frequency.exponentialRampToValueAtTime(240, t + 0.85);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(200, t);
    filter.frequency.exponentialRampToValueAtTime(1400, t + 0.85);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.22, t + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(t);
    osc.stop(t + 0.95);
  }

  /**
   * Crystalline Harmonic Chord (880Hz, 1100Hz, 1320Hz suspended)
   * Triggered on portal arrival
   */
  playPortalEntry() {
    if (!this.sfxEnabled) return;
    this.ensureAudioContext();
    if (!this.audioCtx) return;

    const freqs = [880, 1100, 1320, 1760];
    const t = this.audioCtx.currentTime;

    freqs.forEach((freq, idx) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.04 / (idx + 1), t + 0.05 + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(t + idx * 0.04);
      osc.stop(t + 0.75);
    });
  }

  /**
   * Soft Harmonic Hover Blip
   */
  playHover() {
    if (!this.sfxEnabled) return;
    this.ensureAudioContext();
    if (!this.audioCtx) return;

    const t = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(1174, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.025, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  /**
   * High-Tech Laser Shield Deflection
   */
  playShieldDeflect() {
    if (!this.sfxEnabled) return;
    this.ensureAudioContext();
    if (!this.audioCtx) return;

    const t = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.28);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(t);
    osc.stop(t + 0.32);
  }

  speak(text) {
    if (!this.voiceEnabled || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[\/\*\_\[\]\#]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Samantha")));
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => { this.isSpeaking = true; };
    utterance.onend = () => { this.isSpeaking = false; };
    utterance.onerror = () => { this.isSpeaking = false; };

    window.speechSynthesis.speak(utterance);
  }

  startOscillatorLoop() {
    const render = () => {
      this.updateWaveform();
      this.draw();
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }

  updateWaveform() {
    for (let i = 0; i < this.bars; i++) {
      if (this.isSpeaking) {
        const target = 6 + Math.random() * (this.canvas.height - 8);
        this.heights[i] += (target - this.heights[i]) * 0.35;
      } else {
        const idle = 3 + Math.sin(performance.now() * 0.003 + i * 0.3) * 2.5;
        this.heights[i] += (idle - this.heights[i]) * 0.15;
      }
    }
  }

  draw() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const barWidth = this.canvas.width / this.bars - 2;
    for (let i = 0; i < this.bars; i++) {
      const h = Math.max(2, this.heights[i]);
      const x = i * (barWidth + 2);
      const y = this.canvas.height - h;

      const grad = this.ctx.createLinearGradient(0, this.canvas.height, 0, 0);
      grad.addColorStop(0, "rgba(196, 181, 253, 0.2)");
      grad.addColorStop(1, this.isSpeaking ? "#38bdf8" : "rgba(196, 181, 253, 0.75)");

      this.ctx.fillStyle = grad;
      this.ctx.fillRect(x, y, barWidth, h);
    }
  }
}

window.audioHUD = null;
document.addEventListener("DOMContentLoaded", () => {
  window.audioHUD = new AudioVisualizerHUD("audio-waveform-canvas");
});
