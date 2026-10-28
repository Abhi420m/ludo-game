/**
 * Procedural Web Audio API Sound Engine
 * Zero external audio assets required. 100% offline, zero latency.
 */

function safeGetAudioStorage(key, defaultVal = null) {
  try {
    const val = localStorage.getItem(key);
    return val !== null ? val : defaultVal;
  } catch (e) {
    return defaultVal;
  }
}

function safeSetAudioStorage(key, val) {
  try {
    localStorage.setItem(key, val);
  } catch (e) {}
}

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = safeGetAudioStorage('ludo_sound_muted') === 'true';
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
        this.initialized = true;
      }
    } catch (e) {
      console.warn('AudioContext init failed', e);
    }
  }

  ensureContext() {
    try {
      if (!this.initialized) this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch (e) {}
  }

  toggleMute() {
    this.muted = !this.muted;
    safeSetAudioStorage('ludo_sound_muted', this.muted);
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  // UI Button Tap
  playClick() {
    try {
      if (this.muted) return;
      this.ensureContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.05);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {}
  }

  // Dice rolling rattle
  playDiceRoll() {
    try {
      if (this.muted) return;
      this.ensureContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const rattleCount = 6;
      for (let i = 0; i < rattleCount; i++) {
        const clickTime = now + (i * 0.07) + (Math.random() * 0.02);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220 + Math.random() * 400, clickTime);
        osc.frequency.exponentialRampToValueAtTime(80, clickTime + 0.03);

        gain.gain.setValueAtTime(0.2, clickTime);
        gain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.03);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(clickTime);
        osc.stop(clickTime + 0.03);
      }

      // Final solid thud
      const finalTime = now + 0.45;
      const thudOsc = this.ctx.createOscillator();
      const thudGain = this.ctx.createGain();
      thudOsc.type = 'sine';
      thudOsc.frequency.setValueAtTime(120, finalTime);
      thudOsc.frequency.exponentialRampToValueAtTime(40, finalTime + 0.09);

      thudGain.gain.setValueAtTime(0.3, finalTime);
      thudGain.gain.exponentialRampToValueAtTime(0.001, finalTime + 0.09);

      thudOsc.connect(thudGain);
      thudGain.connect(this.ctx.destination);

      thudOsc.start(finalTime);
      thudOsc.stop(finalTime + 0.09);
    } catch (e) {}
  }

  // Token Hop (Tok sound)
  playTokenStep() {
    try {
      if (this.muted) return;
      this.ensureContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.07);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch (e) {}
  }

  // Token Kill / Cut (Dramatic strike & whoosh)
  playTokenKill() {
    try {
      if (this.muted) return;
      this.ensureContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // Bass impact slam
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.28);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      // High metal clash
      const metal = this.ctx.createOscillator();
      const metalGain = this.ctx.createGain();
      metal.type = 'square';
      metal.frequency.setValueAtTime(900, now);
      metal.frequency.exponentialRampToValueAtTime(200, now + 0.15);

      metalGain.gain.setValueAtTime(0.2, now);
      metalGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      metal.connect(metalGain);
      metalGain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.28);
      metal.start(now);
      metal.stop(now + 0.15);
    } catch (e) {}
  }

  // Star safe landing chime
  playStarSafe() {
    try {
      if (this.muted) return;
      this.ensureContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      [659.25, 880, 1046.5].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const noteTime = now + (i * 0.08);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.25, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 0.25);
      });
    } catch (e) {}
  }

  // Home Gate Unlocked! Glorious golden unlock fanfare
  playHomeUnlock() {
    try {
      if (this.muted) return;
      this.ensureContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const noteTime = now + (i * 0.1);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.35, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 0.35);
      });
    } catch (e) {}
  }

  // Token reaches final Home center
  playTokenHome() {
    try {
      if (this.muted) return;
      this.ensureContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const noteTime = now + (i * 0.08);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.3, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 0.28);
      });
    } catch (e) {}
  }

  // Game Victory Fanfare
  playGameWin() {
    try {
      if (this.muted) return;
      this.ensureContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const chords = [
        { notes: [523.25, 659.25, 783.99], time: 0, dur: 0.2 },
        { notes: [523.25, 659.25, 783.99], time: 0.25, dur: 0.2 },
        { notes: [523.25, 659.25, 783.99], time: 0.5, dur: 0.2 },
        { notes: [698.46, 880, 1046.5], time: 0.75, dur: 0.6 }
      ];

      chords.forEach(({ notes, time, dur }) => {
        notes.forEach((freq) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const chordTime = now + time;

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, chordTime);

          gain.gain.setValueAtTime(0.2, chordTime);
          gain.gain.exponentialRampToValueAtTime(0.001, chordTime + dur);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(chordTime);
          osc.stop(chordTime + dur);
        });
      });
    } catch (e) {}
  }

  // Error buzz
  playError() {
    try {
      if (this.muted) return;
      this.ensureContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.setValueAtTime(110, now + 0.08);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch (e) {}
  }
}

window.soundEngine = new SoundEngine();
