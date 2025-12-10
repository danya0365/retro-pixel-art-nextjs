/**
 * Sound Service - Generate game sounds using Web Audio API
 * Farming game sounds - No external audio files needed!
 */

type SoundType =
  | "footstep"
  | "plant"
  | "water"
  | "harvest"
  | "pickup"
  | "select"
  | "error"
  | "levelUp"
  | "chicken"
  | "ambient";

type BgmType = "day" | "night" | "rain";

class SoundService {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.3;
  private bgmEnabled: boolean = true;
  private bgmVolume: number = 0.1;
  private bgmInterval: NodeJS.Timeout | null = null;
  private bgmPlaying: boolean = false;
  private currentBgmType: BgmType | null = null;
  private footstepToggle: boolean = false;

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
    }
    return this.audioContext;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) {
      this.stopBgm();
    }
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getVolume(): number {
    return this.volume;
  }

  // BGM Controls
  setBgmEnabled(enabled: boolean) {
    this.bgmEnabled = enabled;
    if (!enabled) {
      this.stopBgm();
    }
  }

  setBgmVolume(volume: number) {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
  }

  isBgmEnabled(): boolean {
    return this.bgmEnabled;
  }

  isBgmPlaying(): boolean {
    return this.bgmPlaying;
  }

  /**
   * Play a sound effect
   */
  play(type: SoundType) {
    if (!this.enabled || typeof window === "undefined") return;

    try {
      const ctx = this.getAudioContext();
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      switch (type) {
        case "footstep":
          this.playFootstepSound(ctx);
          break;
        case "plant":
          this.playPlantSound(ctx);
          break;
        case "water":
          this.playWaterSound(ctx);
          break;
        case "harvest":
          this.playHarvestSound(ctx);
          break;
        case "pickup":
          this.playPickupSound(ctx);
          break;
        case "select":
          this.playSelectSound(ctx);
          break;
        case "error":
          this.playErrorSound(ctx);
          break;
        case "levelUp":
          this.playLevelUpSound(ctx);
          break;
        case "chicken":
          this.playChickenSound(ctx);
          break;
        case "ambient":
          this.playAmbientSound(ctx);
          break;
      }
    } catch (e) {
      console.warn("Sound play failed:", e);
    }
  }

  // Footstep - soft walking sound
  private playFootstepSound(ctx: AudioContext) {
    // Alternate between two pitches for realistic walking
    this.footstepToggle = !this.footstepToggle;
    const baseFreq = this.footstepToggle ? 100 : 120;

    // Create noise for footstep
    const bufferSize = ctx.sampleRate * 0.05;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Low pass filter for muffled sound
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = baseFreq;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.volume * 0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(ctx.currentTime);
  }

  // Plant - soft earth/digging sound
  private playPlantSound(ctx: AudioContext) {
    // Digging sound - low rumble
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);

    // Add sparkle
    setTimeout(() => this.playSparkle(ctx), 150);
  }

  // Water - splash sound
  private playWaterSound(ctx: AudioContext) {
    // Create water splash with noise
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const t = i / ctx.sampleRate;
      // Bubbling effect
      data[i] =
        (Math.random() * 2 - 1) *
        Math.exp(-t * 8) *
        (1 + 0.5 * Math.sin(t * 100));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Band pass for water sound
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 800;
    filter.Q.value = 0.5;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.volume * 0.25, ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(ctx.currentTime);

    // Add drip sounds
    [0.05, 0.1, 0.18].forEach((delay) => {
      const drip = ctx.createOscillator();
      const dripGain = ctx.createGain();

      drip.type = "sine";
      drip.frequency.setValueAtTime(
        800 + Math.random() * 400,
        ctx.currentTime + delay
      );
      drip.frequency.exponentialRampToValueAtTime(
        400,
        ctx.currentTime + delay + 0.05
      );

      dripGain.gain.setValueAtTime(this.volume * 0.15, ctx.currentTime + delay);
      dripGain.gain.exponentialRampToValueAtTime(
        0.01,
        ctx.currentTime + delay + 0.08
      );

      drip.connect(dripGain);
      dripGain.connect(ctx.destination);

      drip.start(ctx.currentTime + delay);
      drip.stop(ctx.currentTime + delay + 0.08);
    });
  }

  // Harvest - happy celebration sound
  private playHarvestSound(ctx: AudioContext) {
    // Rising arpeggio
    const notes = [392, 494, 587, 784]; // G4, B4, D5, G5

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.connect(gain);
      gain.connect(ctx.destination);

      const startTime = ctx.currentTime + i * 0.08;

      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(this.volume * 0.3, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

      osc.start(startTime);
      osc.stop(startTime + 0.15);
    });

    // Add shimmer
    this.playSparkle(ctx);
  }

  // Sparkle helper
  private playSparkle(ctx: AudioContext) {
    const sparkleNotes = [1200, 1400, 1600, 1800];

    sparkleNotes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.connect(gain);
      gain.connect(ctx.destination);

      const startTime = ctx.currentTime + i * 0.03;

      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(this.volume * 0.08, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);

      osc.start(startTime);
      osc.stop(startTime + 0.1);
    });
  }

  // Pickup item sound
  private playPickupSound(ctx: AudioContext) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  }

  // Select/click sound
  private playSelectSound(ctx: AudioContext) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(this.volume * 0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  }

  // Error sound
  private playErrorSound(ctx: AudioContext) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.setValueAtTime(150, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  }

  // Level up sound
  private playLevelUpSound(ctx: AudioContext) {
    const notes = [523, 659, 784, 1047, 1319]; // C5, E5, G5, C6, E6

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.connect(gain);
      gain.connect(ctx.destination);

      const startTime = ctx.currentTime + i * 0.1;

      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(this.volume * 0.35, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

      osc.start(startTime);
      osc.stop(startTime + 0.2);
    });
  }

  // Chicken cluck sound
  private playChickenSound(ctx: AudioContext) {
    // Cluck sound with frequency modulation
    const clucks = [0, 0.12, 0.22];

    clucks.forEach((delay) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.connect(gain);
      gain.connect(ctx.destination);

      const startTime = ctx.currentTime + delay;
      const baseFreq = 400 + Math.random() * 100;

      osc.frequency.setValueAtTime(baseFreq, startTime);
      osc.frequency.exponentialRampToValueAtTime(
        baseFreq * 0.7,
        startTime + 0.05
      );
      osc.frequency.exponentialRampToValueAtTime(baseFreq, startTime + 0.08);

      gain.gain.setValueAtTime(this.volume * 0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);

      osc.start(startTime);
      osc.stop(startTime + 0.1);
    });
  }

  // Ambient nature sound
  private playAmbientSound(ctx: AudioContext) {
    // Create gentle wind/nature noise
    const bufferSize = ctx.sampleRate * 1;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const t = i / ctx.sampleRate;
      // Gentle undulating noise
      data[i] =
        (Math.random() * 2 - 1) * 0.3 * (0.5 + 0.5 * Math.sin(t * 2 * Math.PI));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 400;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.volume * 0.05, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(
      this.volume * 0.08,
      ctx.currentTime + 0.5
    );
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 1);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(ctx.currentTime);
  }

  // BGM - Relaxing farm music
  startBgm(type: BgmType = "day") {
    if (!this.bgmEnabled || this.bgmPlaying) return;

    this.bgmPlaying = true;
    this.currentBgmType = type;

    switch (type) {
      case "day":
        this.playDayBgm();
        break;
      case "night":
        this.playNightBgm();
        break;
      case "rain":
        this.playRainBgm();
        break;
    }
  }

  private playDayBgm() {
    // Simple peaceful melody
    const melody = [
      392,
      440,
      494,
      523,
      494,
      440,
      392,
      330, // G4, A4, B4, C5...
      349,
      392,
      440,
      494,
      440,
      392,
      349,
      330,
    ];
    let noteIndex = 0;

    const playNote = () => {
      if (!this.bgmPlaying) return;

      try {
        const ctx = this.getAudioContext();
        const freq = melody[noteIndex % melody.length];

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(
          this.bgmVolume,
          ctx.currentTime + 0.1
        );
        gain.gain.linearRampToValueAtTime(
          this.bgmVolume * 0.7,
          ctx.currentTime + 0.4
        );
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);

        noteIndex++;
      } catch (e) {
        console.warn("BGM failed:", e);
      }
    };

    playNote();
    this.bgmInterval = setInterval(playNote, 600);
  }

  private playNightBgm() {
    // Slower, more ambient melody
    const melody = [262, 294, 330, 294, 262, 247, 220, 247]; // C4, D4, E4...
    let noteIndex = 0;

    const playNote = () => {
      if (!this.bgmPlaying) return;

      try {
        const ctx = this.getAudioContext();
        const freq = melody[noteIndex % melody.length];

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(
          this.bgmVolume * 0.6,
          ctx.currentTime + 0.2
        );
        gain.gain.linearRampToValueAtTime(
          this.bgmVolume * 0.3,
          ctx.currentTime + 0.8
        );
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 1);

        noteIndex++;
      } catch (e) {
        console.warn("Night BGM failed:", e);
      }
    };

    playNote();
    this.bgmInterval = setInterval(playNote, 1200);
  }

  private playRainBgm() {
    const playRain = () => {
      if (!this.bgmPlaying) return;

      try {
        const ctx = this.getAudioContext();

        // Rain noise
        const bufferSize = ctx.sampleRate * 0.5;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.5;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = "highpass";
        filter.frequency.value = 1000;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(this.bgmVolume * 0.3, ctx.currentTime);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start(ctx.currentTime);
      } catch (e) {
        console.warn("Rain BGM failed:", e);
      }
    };

    playRain();
    this.bgmInterval = setInterval(playRain, 500);
  }

  stopBgm() {
    this.bgmPlaying = false;
    this.currentBgmType = null;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  getCurrentBgmType(): BgmType | null {
    return this.currentBgmType;
  }

  toggleBgm(type?: BgmType) {
    if (this.bgmPlaying) {
      this.stopBgm();
    } else {
      this.startBgm(type || "day");
    }
    return this.bgmPlaying;
  }
}

// Singleton instance
export const soundService = new SoundService();
