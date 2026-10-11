/**
 * audio_visualizer.js — Real-Time Web Audio Frequency HUD & Synthetic Voice Narrator.
 * Animates dynamic frequency spectrum bars on canvas and speaks executive briefings.
 */

class AudioVisualizerHUD {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext("2d") : null;
    this.isSpeaking = false;
    this.voiceEnabled = true;
    this.bars = 28;
    this.heights = new Array(this.bars).fill(4);

    this.setupVoiceToggle();
    this.startOscillatorLoop();
  }

  setupVoiceToggle() {
    const btn = document.getElementById("btn-voice-toggle");
    const label = document.getElementById("voice-label");
    if (btn) {
      btn.addEventListener("click", () => {
        this.voiceEnabled = !this.voiceEnabled;
        if (!this.voiceEnabled) {
          window.speechSynthesis.cancel();
          this.isSpeaking = false;
        }
        label.textContent = this.voiceEnabled ? "[VOX: ON]" : "[VOX: OFF]";
        btn.style.opacity = this.voiceEnabled ? "1" : "0.5";
      });
    }
  }

  speak(text) {
    if (!this.voiceEnabled || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[\/\*\_\[\]\#]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 0.95;

    // Pick a natural voice if available
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
        // High dynamic frequency modulation when voice is speaking
        const target = 6 + Math.random() * (this.canvas.height - 8);
        this.heights[i] += (target - this.heights[i]) * 0.35;
      } else {
        // Gentle ambient idle pulse
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

      // Color gradient in Amber CRT Phosphor
      const grad = this.ctx.createLinearGradient(0, this.canvas.height, 0, 0);
      grad.addColorStop(0, "rgba(255, 176, 0, 0.25)");
      grad.addColorStop(1, this.isSpeaking ? "#ffb000" : "rgba(255, 176, 0, 0.65)");

      this.ctx.fillStyle = grad;
      this.ctx.fillRect(x, y, barWidth, h);
    }
  }
}

window.audioHUD = null;
document.addEventListener("DOMContentLoaded", () => {
  window.audioHUD = new AudioVisualizerHUD("audio-waveform-canvas");
});
