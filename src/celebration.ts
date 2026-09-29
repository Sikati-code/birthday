/**
 * ============================================================================
 * ANNE VICTOIRE - 5-PHASE LUXURY BIRTHDAY CELEBRATION WEBPAGE MODULE
 * Native Vanilla TypeScript / JavaScript (Zero Frameworks: No React / Vue)
 *
 * Theme Colors (Recipient's Favorites):
 *   - Red: #EF4444, #F43F5E, #DC2626
 *   - Blue: #2563EB, #3B82F6, #60A5FA
 *   - Black: #06070B, #0E1017, #151826
 *   - White: #FFFFFF, #F8FAFC
 *   - Diamond & Gold Celebratory Sparkles: #FFFFFF, #F5D77F
 *
 * Complete Autoplay: Everything plays automatically on page load without
 * requiring any clicks!
 * ============================================================================
 */
import { ParticleText } from './particleText';
import { GalaxyCarousel } from './galaxyCarousel';

/* ============================================================================
 * 🛠️ DEVELOPER CONFIGURATION: INJECT CUSTOM LOCAL ASSETS & SETTINGS HERE
 * You can configure custom local/remote image paths, custom audio file URLs,
 * personalized scripture verses, and recipient details below.
 * ============================================================================ */
export const CELEBRATION_CONFIG = {
  // Recipient details
  recipient: {
    title: "Sœur & Infirmière",
    name: "Anne Victoire",
    birthDateText: "30 Septembre 2026",
    monogram: "AV",
  },

  // 1. Mapped Image Blocks with the user's provided official celebration photos/flyers
  imagePaths: {
    heroImage: 'file_0000000063a881f4a8c43d1030c7727e.png',        // Slide 1: Affiche Royale Bronze & Satin Victoire
    profilePortrait: 'file_00000000f6688210b8ccd681f741894e.png',  // Slide 2: Affiche Tailleur Blanc & Triple Portrait
    fullBodyPortrait: 'file_00000000346c8246b99cf08330ce0937.png', // Slide 3: Affiche Soie Bleue Ciel & Sac Chanel
    calendarImage: 'file_0000000073e082109dac65fd82cfe83a.png',    // Slide 4: Affiche Déchirure Calendrier 30 Septembre
    studioImage: 'file_00000000cc2c8210a26483be504fc71d.png',      // Slide 5: Affiche Studio Podium Blanc & Bleu
  },

  // 2. Custom Background Music (Optional MP3 / Audio URL)
  // If left null, the built-in Web Audio API synthesizer will play celebratory music!
  customAudioUrl: "/adoration.mp3", // e.g. "./audio/celebration-theme.mp3"

  // 3. Empowering Bible Verses in French (Dynamic Text Ticker in Phase 4 & 5)
  scriptures: [
    {
      text: "À tes résolutions répondra le succès; sur tes sentiers brillera la lumière.",
      reference: "— Job 22:28",
    },
    {
      text: "L'Éternel, ton Dieu, est au milieu de toi, comme un héros qui sauve; Il fera de toi sa plus grande joie; Il aura pour toi des transports d'allégresse.",
      reference: "— Sophonie 3:17",
    },
    {
      text: "Car je connais les projets que j'ai formés sur vous, dit l'Éternel, projets de paix et non de malheur, afin de vous donner un avenir et de l'espérance.",
      reference: "— Jérémie 29:11",
    },
    {
      text: "Que l'Éternel te bénisse, et qu'il te garde! Que l'Éternel fasse luire sa face sur toi, et qu'il t'accorde sa grâce! Que l'Éternel tourne sa face vers toi, et qu'il te donne la paix!",
      reference: "— Nombres 6:24-26",
    },
    {
      text: "La force et la dignité sont sa parure, et elle sourit à l'avenir avec sérénité et assurance.",
      reference: "— Proverbes 31:25",
    },
  ],

  // 4. Color Tokens (Red, Blue, Black, White + Sparkles)
  colors: {
    blue: "#2563EB",
    blueLight: "#60A5FA",
    blueDark: "#1E3A8A",
    red: "#EF4444",
    redLight: "#F87171",
    redDark: "#B91C1C",
    black: "#06070B",
    white: "#FFFFFF",
    sparkleGold: "#F5D77F",
  },
};

/* ============================================================================
 * 💾 INDEXEDDB ASSET STORAGE & IMAGE OPTIMIZER
 * Stores large photo assets without hitting the 5MB localStorage limit.
 * Automatically downscales large phone camera photos for maximum performance.
 * ============================================================================ */
class AssetStorage {
  private static DB_NAME = 'VictoireCelebrationDB';
  private static STORE_NAME = 'custom_assets';
  private static dbPromise: Promise<IDBDatabase> | null = null;

  private static getDB(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(this.DB_NAME, 1);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains(this.STORE_NAME)) {
            db.createObjectStore(this.STORE_NAME);
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    }
    return this.dbPromise;
  }

  public static async setItem(key: string, value: string): Promise<void> {
    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(this.STORE_NAME, 'readwrite');
        const store = tx.objectStore(this.STORE_NAME);
        const req = store.put(value, key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('IndexedDB set failed:', e);
    }

    try {
      if (value.length < 500000) {
        localStorage.setItem(key, value);
      } else {
        localStorage.removeItem(key);
      }
    } catch {
      // Gracefully ignore QuotaExceededError
    }
  }

  public static async getItem(key: string): Promise<string | null> {
    try {
      const db = await this.getDB();
      const val = await new Promise<string | null>((resolve, reject) => {
        const tx = db.transaction(this.STORE_NAME, 'readonly');
        const store = tx.objectStore(this.STORE_NAME);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
      if (val) return val;
    } catch {
      // fallback
    }

    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  public static async removeItem(key: string): Promise<void> {
    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(this.STORE_NAME, 'readwrite');
        const store = tx.objectStore(this.STORE_NAME);
        const req = store.delete(key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('IndexedDB delete failed:', e);
    }

    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }

  public static compressImage(file: File, maxDimension: number = 1400, quality: number = 0.88): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        };
        img.onerror = reject;
        img.src = event.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

/* ============================================================================
 * 🎵 CELEBRATORY WEB AUDIO SYNTHESIZER ENGINE
 * High-energy, joyful celebratory chord progression, bassline, and arpeggios.
 * Automatically tries to play immediately; handles browser autoplay policies.
 * ============================================================================ */
class CelebrationAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isPlaying: boolean = false;
  private masterGain: GainNode | null = null;
  private loopTimer: number | null = null;
  private customAudio: HTMLAudioElement | null = null;
  private promptBanner: HTMLElement | null = null;

  constructor() {
    this.promptBanner = document.getElementById('audio-prompt-banner');
    if (CELEBRATION_CONFIG.customAudioUrl) {
      this.customAudio = new Audio(CELEBRATION_CONFIG.customAudioUrl);
      this.customAudio.loop = true;
    }
    this.setupAutoplayFallback();
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
  }

  public async startAudio(): Promise<boolean> {
    this.initContext();
    if (!this.ctx) return false;

    try {
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }

      if (this.ctx.state === 'running') {
        this.hidePromptBanner();
        if (!this.isPlaying) {
          this.isPlaying = true;
          if (this.customAudio) {
            this.customAudio.play().catch(() => { });
          } else {
            this.playCelebratoryTune();
          }
        }
        return true;
      } else {
        // Browser suspended audio until user gesture
        this.showPromptBanner();
        return false;
      }
    } catch {
      this.showPromptBanner();
      return false;
    }
  }

  public ensurePlaying() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().then(() => {
        this.hidePromptBanner();
        if (!this.isPlaying) {
          this.isPlaying = true;
          if (this.customAudio) {
            this.customAudio.play().catch(() => { });
          } else {
            this.playCelebratoryTune();
          }
        }
      });
    } else {
      this.startAudio();
    }
  }

  private setupAutoplayFallback() {
    // If the browser initially blocks audio without gesture,
    // any tap/click/touch or scroll on the entire page immediately starts the sound!
    const unlock = () => {
      this.ensurePlaying();
    };

    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('touchstart', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    window.addEventListener('scroll', unlock, { once: true });

    if (this.promptBanner) {
      this.promptBanner.addEventListener('click', () => {
        this.ensurePlaying();
      });
    }
  }

  private showPromptBanner() {
    if (this.promptBanner) {
      this.promptBanner.classList.remove('hidden');
    }
  }

  private hidePromptBanner() {
    if (this.promptBanner) {
      this.promptBanner.classList.add('hidden');
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.customAudio) {
      this.customAudio.muted = this.isMuted;
    }
    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : 0.35;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    }
    return !this.isMuted;
  }

  public playClimaxFanfare() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Triumphant Brass Fanfare: F4 -> A4 -> C5 -> F5 (Triumphant Majestic Burst)
    const notes = [349.23, 440.00, 523.25, 698.46, 880.00];
    notes.forEach((freq, i) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = i % 2 === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, now + (i * 0.05));

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2200, now);
      filter.frequency.exponentialRampToValueAtTime(3800, now + 0.3);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + (i * 0.05));
      osc.stop(now + 2.6);
    });

    // Celebratory Chimes
    this.playCelebratoryChime(now + 0.15, 1046.50); // C6
    this.playCelebratoryChime(now + 0.35, 1318.51); // E6
    this.playCelebratoryChime(now + 0.55, 1567.98); // G6
    this.playCelebratoryChime(now + 0.75, 2093.00); // C7
  }

  private playCelebratoryChime(startTime: number, freq: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.2, startTime + 0.2);

    gain.gain.setValueAtTime(0.14, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.4);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + 1.4);
  }

  private playCelebratoryTune() {
    if (!this.isPlaying) return;
    if (!this.ctx || !this.masterGain) return;

    // Upbeat Anthemic Progression:
    // 1. Bb Major (Celebratory & Bright)
    // 2. F Major (Joyful & Royal)
    // 3. G Minor (Deep Emotion)
    // 4. Eb Major (Triumphant Resolution)
    const chords = [
      { root: 116.54, notes: [233.08, 293.66, 349.23, 466.16] }, // Bb major
      { root: 87.31, notes: [174.61, 220.00, 261.63, 349.23] }, // F major
      { root: 98.00, notes: [196.00, 233.08, 293.66, 392.00] }, // G minor
      { root: 77.78, notes: [155.56, 196.00, 233.08, 311.13] }, // Eb major
    ];

    const beatDuration = 1.5;
    let currentBeat = 0;

    const playStep = () => {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const chord = chords[currentBeat % chords.length];

      // 1. Warm Synth Bass Note
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = 'triangle';
      bassOsc.frequency.setValueAtTime(chord.root, now);
      bassGain.gain.setValueAtTime(0.08, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + beatDuration);
      bassOsc.connect(bassGain);
      bassGain.connect(this.masterGain);
      bassOsc.start(now);
      bassOsc.stop(now + beatDuration);

      // 2. Harmonic Pad Chords
      chord.notes.forEach((freq) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.035, now + 0.2);
        gain.gain.linearRampToValueAtTime(0.02, now + beatDuration - 0.2);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + beatDuration);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + beatDuration);
      });

      // 3. Sparkling Dancing Celesta Bells
      const arpeggioNotes = [chord.notes[0] * 2, chord.notes[1] * 2, chord.notes[2] * 2, chord.notes[3] * 2];
      arpeggioNotes.forEach((noteFreq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const noteTime = now + (idx * 0.32);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(noteFreq, noteTime);

        gain.gain.setValueAtTime(0.04, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.55);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(noteTime);
        osc.stop(noteTime + 0.55);
      });

      currentBeat++;
      this.loopTimer = window.setTimeout(playStep, beatDuration * 1000);
    };

    playStep();
  }

  public stopAudio() {
    this.isPlaying = false;
    if (this.loopTimer) {
      clearTimeout(this.loopTimer);
      this.loopTimer = null;
    }
    if (this.customAudio) {
      this.customAudio.pause();
      this.customAudio.currentTime = 0;
    }
  }
}

/* ============================================================================
 * ✨ CANVAS 2D SPARKLE & CONFETTI ENGINE (RED, BLUE, WHITE, GOLD)
 * High-performance 60fps particle effects on any screen size.
 * ============================================================================ */
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  life: number;
  maxLife: number;
  shape: 'rect' | 'circle' | 'sparkle';
}

class CanvasParticleEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private ambientStars: { x: number; y: number; size: number; alpha: number; speed: number; color: string }[] = [];
  private isRunning: boolean = false;
  private animationId: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.initAmbientStars(60);
    this.startLoop();
  }

  private resize() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.ctx.scale(dpr, dpr);
  }

  private initAmbientStars(count: number) {
    this.ambientStars = [];
    const colors = [
      CELEBRATION_CONFIG.colors.white,
      CELEBRATION_CONFIG.colors.blueLight,
      CELEBRATION_CONFIG.colors.redLight,
      CELEBRATION_CONFIG.colors.sparkleGold,
    ];

    for (let i = 0; i < count; i++) {
      this.ambientStars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 2.5 + 1.2,
        alpha: Math.random() * 0.8 + 0.2,
        speed: (Math.random() * 0.02 + 0.01) * (Math.random() > 0.5 ? 1 : -1),
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  }

  public explodeClimax(count: number = 320) {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const colors = [
      CELEBRATION_CONFIG.colors.blue,
      CELEBRATION_CONFIG.colors.blueLight,
      CELEBRATION_CONFIG.colors.red,
      CELEBRATION_CONFIG.colors.redLight,
      CELEBRATION_CONFIG.colors.white,
      CELEBRATION_CONFIG.colors.sparkleGold,
    ];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 16 + 6;
      const shapeType = Math.random() > 0.35 ? 'rect' : Math.random() > 0.5 ? 'sparkle' : 'circle';

      this.particles.push({
        x: centerX + (Math.random() - 0.5) * 50,
        y: centerY + (Math.random() - 0.5) * 50,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        size: Math.random() * 9 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 14,
        opacity: 1,
        life: 0,
        maxLife: Math.random() * 100 + 80,
        shape: shapeType,
      });
    }
  }

  public emitAmbientGlitter(count: number = 3) {
    const colors = [
      CELEBRATION_CONFIG.colors.blueLight,
      CELEBRATION_CONFIG.colors.redLight,
      CELEBRATION_CONFIG.colors.white,
      CELEBRATION_CONFIG.colors.sparkleGold,
    ];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * window.innerWidth,
        y: -10,
        vx: (Math.random() - 0.5) * 1.5,
        vy: Math.random() * 1.4 + 0.8,
        size: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 4,
        opacity: 0.9,
        life: 0,
        maxLife: Math.random() * 200 + 150,
        shape: Math.random() > 0.4 ? 'sparkle' : 'circle',
      });
    }
  }

  private startLoop() {
    this.isRunning = true;
    const loop = () => {
      if (!this.isRunning) return;
      this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // 1. Render ambient starry background
      for (const star of this.ambientStars) {
        star.alpha += star.speed;
        if (star.alpha > 0.95 || star.alpha < 0.15) {
          star.speed = -star.speed;
        }

        this.ctx.save();
        this.ctx.fillStyle = star.color;
        this.ctx.globalAlpha = Math.max(0.1, star.alpha);
        this.ctx.shadowBlur = 8;
        this.ctx.shadowColor = star.color;
        this.ctx.beginPath();
        this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }

      // 2. Render and update active particles
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.16; // gravity
        p.vx *= 0.985;
        p.rotation += p.rotationSpeed;
        p.opacity = Math.max(0, 1 - (p.life / p.maxLife));

        if (p.life >= p.maxLife || p.y > window.innerHeight + 50) {
          this.particles.splice(i, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.globalAlpha = p.opacity;

        if (p.shape === 'rect') {
          this.ctx.fillStyle = p.color;
          this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        } else if (p.shape === 'circle') {
          this.ctx.fillStyle = p.color;
          this.ctx.beginPath();
          this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          this.ctx.fill();
        } else if (p.shape === 'sparkle') {
          // 4-point Diamond Starburst
          this.ctx.fillStyle = p.color;
          this.ctx.shadowBlur = 10;
          this.ctx.shadowColor = p.color;
          this.ctx.beginPath();
          this.ctx.moveTo(0, -p.size);
          this.ctx.quadraticCurveTo(0, 0, p.size, 0);
          this.ctx.quadraticCurveTo(0, 0, 0, p.size);
          this.ctx.quadraticCurveTo(0, 0, -p.size, 0);
          this.ctx.quadraticCurveTo(0, 0, 0, -p.size);
          this.ctx.fill();
        }

        this.ctx.restore();
      }

      this.animationId = requestAnimationFrame(loop);
    };

    loop();
  }

  public stop() {
    this.isRunning = false;
    cancelAnimationFrame(this.animationId);
  }
}

/* ============================================================================
 * 🎈 MULTI-COLOR BALLOON SYSTEM (BLUE, RED, WHITE, GOLD)
 * Rises continuously in Phase 5 with realistic physics.
 * ============================================================================ */
class BalloonSystem {
  private container: HTMLElement;
  private timer: number | null = null;
  private isActive: boolean = false;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  public start() {
    if (this.isActive) return;
    this.isActive = true;
    this.container.classList.add('active');

    const themes = ['balloon-blue', 'balloon-red', 'balloon-white', 'balloon-gold'];

    const spawn = () => {
      if (!this.isActive) return;
      const balloon = document.createElement('div');
      const themeClass = themes[Math.floor(Math.random() * themes.length)];
      balloon.className = `soft-balloon ${themeClass}`;

      const leftPercent = Math.random() * 88 + 6;
      const duration = Math.random() * 5 + 10; // 10 to 15 seconds
      const scale = Math.random() * 0.4 + 0.8;
      const delay = Math.random() * 1.2;

      balloon.style.left = `${leftPercent}%`;
      balloon.style.animationDuration = `${duration}s`;
      balloon.style.animationDelay = `${delay}s`;
      balloon.style.transform = `scale(${scale})`;

      this.container.appendChild(balloon);

      setTimeout(() => {
        balloon.remove();
      }, (duration + delay) * 1000);

      this.timer = window.setTimeout(spawn, Math.random() * 2000 + 1200);
    };

    // Pre-spawn 5 balloons across viewport
    for (let i = 0; i < 5; i++) {
      setTimeout(spawn, i * 500);
    }
  }

  public stop() {
    this.isActive = false;
    this.container.classList.remove('active');
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.container.innerHTML = '';
  }
}

/* ============================================================================
 * 📖 SCRIPTURE VERSE TICKER CONTROLLER
 * ============================================================================ */
class VerseTicker {
  private bodyElem: HTMLElement;
  private refElem: HTMLElement;
  private dots: NodeListOf<HTMLElement>;
  private currentIndex: number = 0;
  private timer: number | null = null;

  constructor(bodyElem: HTMLElement, refElem: HTMLElement, dots: NodeListOf<HTMLElement>) {
    this.bodyElem = bodyElem;
    this.refElem = refElem;
    this.dots = dots;
  }

  public start() {
    this.showVerse(0);
    this.scheduleNext();
  }

  private scheduleNext() {
    this.timer = window.setTimeout(() => {
      this.currentIndex = (this.currentIndex + 1) % CELEBRATION_CONFIG.scriptures.length;
      this.showVerse(this.currentIndex);
      this.scheduleNext();
    }, 5500);
  }

  public showVerse(index: number) {
    this.currentIndex = index;
    const verse = CELEBRATION_CONFIG.scriptures[index];
    if (!verse) return;

    this.bodyElem.style.opacity = '0';
    this.refElem.style.opacity = '0';

    setTimeout(() => {
      this.bodyElem.textContent = verse.text;
      this.refElem.textContent = verse.reference;

      this.dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === index);
      });

      this.bodyElem.style.opacity = '1';
      this.refElem.style.opacity = '1';
    }, 400);
  }

  public stop() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}

/* ============================================================================
 * 🖼️ PHOTO ASSET MANAGER & MONTAGE SYSTEM
 * ============================================================================ */
class PhotoManager {
  private heroImg: HTMLImageElement | null;
  private profileImg: HTMLImageElement | null;
  private fullbodyImg: HTMLImageElement | null;

  private heroFallback: HTMLElement | null;
  private profileFallback: HTMLElement | null;
  private fullbodyFallback: HTMLElement | null;

  constructor() {
    this.heroImg = document.getElementById('img-hero') as HTMLImageElement | null;
    this.profileImg = document.getElementById('img-profile') as HTMLImageElement | null;
    this.fullbodyImg = document.getElementById('img-fullbody') as HTMLImageElement | null;

    this.heroFallback = document.getElementById('fallback-hero');
    this.profileFallback = document.getElementById('fallback-profile');
    this.fullbodyFallback = document.getElementById('fallback-fullbody');

    this.loadSavedAssets();
    this.setupModalHandlers();
  }

  private async loadSavedAssets() {
    const savedHero = (await AssetStorage.getItem('victoire_asset_hero')) || CELEBRATION_CONFIG.imagePaths.heroImage;
    const savedProfile = (await AssetStorage.getItem('victoire_asset_profile')) || CELEBRATION_CONFIG.imagePaths.profilePortrait;
    const savedFullbody = (await AssetStorage.getItem('victoire_asset_fullbody')) || CELEBRATION_CONFIG.imagePaths.fullBodyPortrait;

    this.applySlot('hero', savedHero);
    this.applySlot('profile', savedProfile);
    this.applySlot('fullbody', savedFullbody);
  }

  public applySlot(slot: 'hero' | 'profile' | 'fullbody', src: string | null) {
    let img: HTMLImageElement | null = null;
    let fallback: HTMLElement | null = null;
    let preview: HTMLElement | null = null;
    let defaultSrc: string | null = null;

    if (slot === 'hero') {
      img = this.heroImg;
      fallback = this.heroFallback;
      preview = document.getElementById('preview-hero');
      defaultSrc = CELEBRATION_CONFIG.imagePaths.heroImage;
    } else if (slot === 'profile') {
      img = this.profileImg;
      fallback = this.profileFallback;
      preview = document.getElementById('preview-profile');
      defaultSrc = CELEBRATION_CONFIG.imagePaths.profilePortrait;
    } else {
      img = this.fullbodyImg;
      fallback = this.fullbodyFallback;
      preview = document.getElementById('preview-fullbody');
      defaultSrc = CELEBRATION_CONFIG.imagePaths.fullBodyPortrait;
    }

    const effectiveSrc = (src && src.trim() !== '') ? src : defaultSrc;

    if (img && effectiveSrc) {
      img.src = effectiveSrc;
      img.style.display = 'block';
      if (fallback) fallback.style.display = 'none';

      if (preview) {
        preview.style.backgroundImage = `url(${effectiveSrc})`;
        preview.classList.add('has-image');
      }

      if (src && src.trim() !== '') {
        AssetStorage.setItem(`victoire_asset_${slot}`, src);
      } else {
        AssetStorage.removeItem(`victoire_asset_${slot}`);
      }
    }
  }

  public resetAll() {
    this.applySlot('hero', null);
    this.applySlot('profile', null);
    this.applySlot('fullbody', null);
  }

  private setupModalHandlers() {
    const slots = ['hero', 'profile', 'fullbody'] as const;
    slots.forEach((slot) => {
      const dropzone = document.getElementById(`drop-${slot}`);
      const fileInput = document.querySelector(`.file-input[data-target="${slot}"]`) as HTMLInputElement | null;
      const urlInput = document.querySelector(`.url-input[data-url-target="${slot}"]`) as HTMLInputElement | null;

      if (dropzone && fileInput) {
        dropzone.addEventListener('dragover', (e) => {
          e.preventDefault();
          dropzone.classList.add('dragover');
        });

        dropzone.addEventListener('dragleave', () => {
          dropzone.classList.remove('dragover');
        });

        dropzone.addEventListener('drop', (e) => {
          e.preventDefault();
          dropzone.classList.remove('dragover');
          if (e.dataTransfer && e.dataTransfer.files.length > 0) {
            this.handleFile(e.dataTransfer.files[0], slot);
          }
        });

        fileInput.addEventListener('change', () => {
          if (fileInput.files && fileInput.files.length > 0) {
            this.handleFile(fileInput.files[0], slot);
          }
        });
      }

      if (urlInput) {
        urlInput.addEventListener('change', () => {
          if (urlInput.value.trim() !== '') {
            this.applySlot(slot, urlInput.value.trim());
          }
        });
      }
    });

    const resetBtn = document.getElementById('btn-reset-assets');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.resetAll();
      });
    }
  }

  private async handleFile(file: File, slot: 'hero' | 'profile' | 'fullbody') {
    if (!file.type.startsWith('image/')) return;
    try {
      const compressedDataUrl = await AssetStorage.compressImage(file, 1400, 0.88);
      this.applySlot(slot, compressedDataUrl);
    } catch {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          this.applySlot(slot, result);
        }
      };
      reader.readAsDataURL(file);
    }
  }
}

/* ============================================================================
 * 🎞️ AUTOMATED CELEBRATION SLIDESHOW ENGINE
 * Auto-plays photo slides on a loop with Ken Burns zoom, smooth progress timer,
 * touch swipe support, and clickable filmstrip ribbon navigation.
 * ============================================================================ */
class CelebrationSlideshow {
  private slides: NodeListOf<HTMLElement>;
  private thumbs: NodeListOf<HTMLElement>;
  private progressBar: HTMLElement;
  private counter: HTMLElement;
  private playStateText: HTMLElement;
  private playIcon: HTMLElement;
  private prevBtn: HTMLElement | null;
  private nextBtn: HTMLElement | null;
  private togglePlayBtn: HTMLElement | null;
  private viewport: HTMLElement | null;

  private currentSlideIndex: number = 0;
  private isAutoPlaying: boolean = true;
  private slideDuration: number = 3800; // 3.8s per slide
  private progressTimer: number | null = null;
  private startTime: number = 0;
  private elapsedBeforePause: number = 0;

  constructor() {
    this.slides = document.querySelectorAll('.celebration-slide');
    this.thumbs = document.querySelectorAll('.film-thumb-card');
    this.progressBar = document.getElementById('slide-progress-bar')!;
    this.counter = document.getElementById('slide-counter')!;
    this.playStateText = document.getElementById('slide-play-state')!;
    this.playIcon = document.getElementById('slide-play-icon')!;
    this.prevBtn = document.getElementById('btn-slide-prev');
    this.nextBtn = document.getElementById('btn-slide-next');
    this.togglePlayBtn = document.getElementById('btn-toggle-slide-play');
    this.viewport = document.getElementById('slideshow-viewport');

    this.bindEvents();
    this.startAutoPlay();
  }

  private bindEvents() {
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => {
        this.prevSlide();
      });
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => {
        this.nextSlide();
      });
    }

    if (this.togglePlayBtn) {
      this.togglePlayBtn.addEventListener('click', () => {
        this.toggleAutoPlay();
      });
    }

    this.thumbs.forEach((thumb) => {
      thumb.addEventListener('click', () => {
        const targetIdx = parseInt(thumb.getAttribute('data-goto-slide') || '0', 10);
        this.goToSlide(targetIdx);
      });
    });

    // Mobile Touch Swipe Handling
    if (this.viewport) {
      let touchStartX = 0;
      let touchEndX = 0;

      this.viewport.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      this.viewport.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchEndX - touchStartX;
        if (Math.abs(diff) > 40) {
          if (diff < 0) {
            this.nextSlide(); // swipe left -> next slide
          } else {
            this.prevSlide(); // swipe right -> prev slide
          }
        }
      }, { passive: true });
    }
  }

  public goToSlide(index: number) {
    if (this.slides.length === 0) return;
    this.slides.forEach((slide) => slide.classList.remove('active'));
    this.thumbs.forEach((thumb) => {
      thumb.classList.remove('active');
      thumb.setAttribute('aria-selected', 'false');
    });

    this.currentSlideIndex = (index + this.slides.length) % this.slides.length;
    const activeSlide = this.slides[this.currentSlideIndex];
    const activeThumb = this.thumbs[this.currentSlideIndex];

    if (activeSlide) activeSlide.classList.add('active');
    if (activeThumb) {
      activeThumb.classList.add('active');
      activeThumb.setAttribute('aria-selected', 'true');
      activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    if (this.counter) {
      const currentFormatted = String(this.currentSlideIndex + 1).padStart(2, '0');
      const totalFormatted = String(this.slides.length).padStart(2, '0');
      this.counter.textContent = `${currentFormatted} / ${totalFormatted}`;
    }

    this.resetTimer();
  }

  public nextSlide() {
    this.goToSlide(this.currentSlideIndex + 1);
  }

  public prevSlide() {
    this.goToSlide(this.currentSlideIndex - 1);
  }

  public toggleAutoPlay() {
    this.isAutoPlaying = !this.isAutoPlaying;
    if (this.playStateText) {
      this.playStateText.textContent = this.isAutoPlaying ? 'En lecture auto' : 'En pause';
    }
    if (this.playIcon) {
      this.playIcon.textContent = this.isAutoPlaying ? '⏸' : '▶';
    }

    if (this.isAutoPlaying) {
      this.startProgress();
    } else {
      this.stopProgress();
    }
  }

  public startAutoPlay() {
    this.isAutoPlaying = true;
    if (this.playStateText) this.playStateText.textContent = 'En lecture auto';
    if (this.playIcon) this.playIcon.textContent = '⏸';
    this.resetTimer();
  }

  private resetTimer() {
    this.stopProgress();
    this.elapsedBeforePause = 0;
    if (this.progressBar) this.progressBar.style.width = '0%';
    if (this.isAutoPlaying) {
      this.startProgress();
    }
  }

  private startProgress() {
    this.startTime = performance.now() - this.elapsedBeforePause;
    const tick = (now: number) => {
      if (!this.isAutoPlaying) return;
      const elapsed = now - this.startTime;
      const percent = Math.min(100, (elapsed / this.slideDuration) * 100);

      if (this.progressBar) {
        this.progressBar.style.width = `${percent}%`;
      }

      if (elapsed >= this.slideDuration) {
        this.nextSlide();
      } else {
        this.progressTimer = requestAnimationFrame(tick);
      }
    };
    this.progressTimer = requestAnimationFrame(tick);
  }

  private stopProgress() {
    if (this.progressTimer) {
      cancelAnimationFrame(this.progressTimer);
      this.progressTimer = null;
    }
    this.elapsedBeforePause = performance.now() - this.startTime;
  }
}

/* ============================================================================
 * ⏱️ 5-PHASE RUNTIME TIMELINE CONTROLLER (100% AUTOMATIC PLAYBACK)
 * When someone opens the link, it runs all phases automatically!
 * ============================================================================ */
class CelebrationTimeline {
  private currentPhase: number = 1;
  private isTransitioning: boolean = false;
  private ambientInterval: number | null = null;

  private audio: CelebrationAudioEngine;
  private particles: CanvasParticleEngine;
  private balloons: BalloonSystem;
  private ticker: VerseTicker;
  private photoMgr: PhotoManager;
  private slideshow: CelebrationSlideshow;

  private phase1View: HTMLElement;
  private phase2View: HTMLElement;
  private phase3View: HTMLElement;
  private phase4View: HTMLElement;
  private countdownDigit: HTMLElement;
  private climaxTitle: HTMLElement;
  private crowningSignature: HTMLElement;

  constructor(
    audio: CelebrationAudioEngine,
    particles: CanvasParticleEngine,
    balloons: BalloonSystem,
    ticker: VerseTicker,
    photoMgr: PhotoManager,
    slideshow: CelebrationSlideshow
  ) {
    this.audio = audio;
    this.particles = particles;
    this.balloons = balloons;
    this.ticker = ticker;
    this.photoMgr = photoMgr;
    this.slideshow = slideshow;

    this.phase1View = document.getElementById('phase-1-gateway')!;
    this.phase2View = document.getElementById('phase-2-countdown')!;
    this.phase3View = document.getElementById('phase-3-climax')!;
    this.phase4View = document.getElementById('phase-4-showcase')!;
    this.countdownDigit = document.getElementById('countdown-number')!;
    this.climaxTitle = document.getElementById('climax-title')!;
    this.crowningSignature = document.getElementById('crowning-signature-wrap')!;

    this.bindControls();
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private bindControls() {
    // Phase 1 Gateway Click Triggers (In case user clicks before auto-trigger)
    const unlockBtn = document.getElementById('btn-unlock-gateway');
    const giftBox = document.getElementById('gift-box-trigger');

    const handleUnlock = () => {
      if (this.currentPhase === 1) {
        this.advanceFromGateway();
      }
    };

    if (unlockBtn) unlockBtn.addEventListener('click', handleUnlock);
    if (giftBox) giftBox.addEventListener('click', handleUnlock);

    // Sound toggle button
    const soundBtn = document.getElementById('btn-sound-toggle');
    const soundText = document.getElementById('sound-status-text');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        const isAudible = this.audio.toggleMute();
        if (soundText) {
          soundText.textContent = isAudible ? 'Son activé' : 'Son coupé';
        }
      });
    }

    // Replay button
    const replayBtn = document.getElementById('btn-replay');
    if (replayBtn) {
      replayBtn.addEventListener('click', () => {
        this.jumpToPhase(1);
      });
    }

    // Phase Navigation Pills
    const phasePills = document.querySelectorAll<HTMLButtonElement>('.phase-pill-btn');
    phasePills.forEach((pill) => {
      pill.addEventListener('click', () => {
        const targetPhase = parseInt(pill.getAttribute('data-phase') || '1', 10);
        this.jumpToPhase(targetPhase);
      });
    });

    // Modal Triggers: Asset Manager
    const assetModal = document.getElementById('modal-asset-manager')!;
    const btnAssetManager = document.getElementById('btn-asset-manager');
    const btnCustomAssetLink = document.getElementById('btn-custom-asset-link');

    const openAssetModal = () => {
      assetModal.classList.add('active');
    };

    if (btnAssetManager) btnAssetManager.addEventListener('click', openAssetModal);
    if (btnCustomAssetLink) btnCustomAssetLink.addEventListener('click', openAssetModal);

    // Modal Triggers: Birthday Tribute
    const tributeModal = document.getElementById('modal-tribute')!;
    const btnCardModal = document.getElementById('btn-card-modal');
    if (btnCardModal) {
      btnCardModal.addEventListener('click', () => {
        tributeModal.classList.add('active');
      });
    }

    // Modal Close Buttons
    document.querySelectorAll('[data-close-modal]').forEach((btn) => {
      btn.addEventListener('click', () => {
        assetModal.classList.remove('active');
        tributeModal.classList.remove('active');
      });
    });

    // Share / Copy link
    const shareBtn = document.getElementById('btn-share-tribute');
    if (shareBtn) {
      shareBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(window.location.href);
          const orig = shareBtn.innerHTML;
          shareBtn.innerHTML = '<span>✓ Lien copié !</span>';
          setTimeout(() => {
            shareBtn.innerHTML = orig;
          }, 2500);
        } catch {
          const orig = shareBtn.innerHTML;
          shareBtn.innerHTML = '<span>✓ Lien copié !</span>';
          setTimeout(() => {
            shareBtn.innerHTML = orig;
          }, 2500);
        }
      });
    }

    // Print Tribute Poster
    const printBtn = document.getElementById('btn-print-tribute');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }

    // Save Tribute to Page
    const saveTributeBtn = document.getElementById('btn-save-tribute');
    if (saveTributeBtn) {
      saveTributeBtn.addEventListener('click', () => {
        const sender = (document.getElementById('tribute-sender-name') as HTMLInputElement).value;
        const msg = (document.getElementById('tribute-message-text') as HTMLTextAreaElement).value;

        const blessingP = document.querySelector('.blessing-p');
        const blessingSig = document.querySelector('.blessing-signature strong');

        if (blessingP && msg) blessingP.textContent = msg;
        if (blessingSig && sender) blessingSig.textContent = sender;

        tributeModal.classList.remove('active');
      });
    }
  }

  private updateNavPills(phase: number) {
    document.querySelectorAll('.phase-pill-btn').forEach((pill) => {
      const p = parseInt(pill.getAttribute('data-phase') || '1', 10);
      pill.classList.toggle('active', p === phase);
    });
  }

  /**
   * 🚀 COMPLETE AUTOPLAY ON PAGE LOAD
   * Initiates the entire celebration automatically!
   */
  public async startAutoCelebration() {
    // 1. Kick off audio immediately
    this.audio.startAudio();

    // 2. Display Phase 1 title and monogram for 1.4 seconds
    this.currentPhase = 1;
    this.updateNavPills(1);
    this.phase1View.classList.add('active');
    this.phase1View.style.opacity = '1';
    this.phase1View.style.transform = 'scale(1)';

    await this.sleep(1400);

    // 3. Automatically advance to Phase 2 (Countdown)
    if (this.currentPhase === 1) {
      this.advanceFromGateway();
    }
  }

  public async advanceFromGateway() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    this.audio.ensurePlaying();

    this.phase1View.style.opacity = '0';
    this.phase1View.style.transform = 'scale(0.95)';
    await this.sleep(600);

    this.phase1View.classList.remove('active');
    this.runPhase2();
  }

  public async runPhase2() {
    this.currentPhase = 2;
    this.updateNavPills(2);
    this.isTransitioning = true;

    this.phase2View.classList.add('active');
    this.phase2View.style.opacity = '1';
    this.phase2View.style.transform = 'scale(1)';

    const countSequence = ['3', '2', '1'];

    for (const num of countSequence) {
      this.countdownDigit.textContent = num;
      this.countdownDigit.classList.remove('pop-in');
      void this.countdownDigit.offsetWidth;
      this.countdownDigit.classList.add('pop-in');

      await this.sleep(1000);
    }

    this.phase2View.style.opacity = '0';
    await this.sleep(300);
    this.phase2View.classList.remove('active');

    this.runPhase3();
  }

  public async runPhase3() {
    this.currentPhase = 3;
    this.updateNavPills(3);
    this.isTransitioning = true;

    this.phase3View.classList.add('active');
    this.phase3View.style.opacity = '1';
    this.phase3View.style.transform = 'scale(1)';

    // Multi-color explosion (Red, Blue, White, Gold)
    this.particles.explodeClimax(340);

    // Triumphant brass fanfare
    this.audio.playClimaxFanfare();

    this.climaxTitle.classList.remove('rising');
    void this.climaxTitle.offsetWidth;
    this.climaxTitle.classList.add('rising');

    await this.sleep(3200);

    this.phase3View.style.opacity = '0';
    this.phase3View.style.transform = 'scale(1.05)';
    await this.sleep(700);
    this.phase3View.classList.remove('active');

    this.runPhase4();
  }

  public async runPhase4() {
    this.currentPhase = 4;
    this.updateNavPills(4);
    this.isTransitioning = false;

    this.phase4View.classList.add('active');
    this.phase4View.style.opacity = '1';
    this.phase4View.style.transform = 'scale(1)';

    this.ticker.start();
    this.startAmbientGlitter();
    this.slideshow.startAutoPlay();

    // Dwell for 5.5s to let the user enjoy the montage, then auto-blossom into Phase 5
    await this.sleep(5500);

    if (this.currentPhase === 4) {
      this.runPhase5();
    }
  }

  public runPhase5() {
    this.currentPhase = 5;
    this.updateNavPills(5);

    this.phase4View.classList.add('active');
    this.phase4View.style.opacity = '1';

    // Start rising multi-color balloons
    this.balloons.start();

    if (this.crowningSignature) {
      this.crowningSignature.style.transform = 'scale(1.04)';
      this.crowningSignature.style.transition = 'transform 1s cubic-bezier(0.16, 1, 0.3, 1)';
    }

    this.startAmbientGlitter();
  }

  private startAmbientGlitter() {
    if (this.ambientInterval) return;
    this.ambientInterval = window.setInterval(() => {
      this.particles.emitAmbientGlitter(3);
    }, 500);
  }

  private stopAmbientGlitter() {
    if (this.ambientInterval) {
      clearInterval(this.ambientInterval);
      this.ambientInterval = null;
    }
  }

  public async jumpToPhase(target: number) {
    this.isTransitioning = true;
    this.balloons.stop();
    this.ticker.stop();
    this.stopAmbientGlitter();

    [this.phase1View, this.phase2View, this.phase3View, this.phase4View].forEach((view) => {
      view.classList.remove('active');
      view.style.opacity = '0';
    });

    await this.sleep(200);

    if (target === 1) {
      this.currentPhase = 1;
      this.updateNavPills(1);
      this.phase1View.classList.add('active');
      this.phase1View.style.opacity = '1';
      this.phase1View.style.transform = 'scale(1)';
      this.audio.stopAudio();
      this.isTransitioning = false;
    } else if (target === 2) {
      this.audio.ensurePlaying();
      this.runPhase2();
    } else if (target === 3) {
      this.audio.ensurePlaying();
      this.runPhase3();
    } else if (target === 4) {
      this.audio.ensurePlaying();
      this.runPhase4();
    } else if (target === 5) {
      this.audio.ensurePlaying();
      this.ticker.start();
      this.slideshow.startAutoPlay();
      this.runPhase5();
    }
  }
}

/* ============================================================================
 * 🚀 APPLICATION BOOTSTRAPPER (AUTOMATIC ON LOAD)
 * ============================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('fx-canvas') as HTMLCanvasElement;
  const balloonsContainer = document.getElementById('balloons-container') as HTMLElement;
  const verseBody = document.getElementById('verse-body') as HTMLElement;
  const verseRef = document.getElementById('verse-ref') as HTMLElement;
  const dots = document.querySelectorAll<HTMLElement>('.progress-dot');

  const audioEngine = new CelebrationAudioEngine();
  const particleEngine = new CanvasParticleEngine(canvas);
  const balloonSystem = new BalloonSystem(balloonsContainer);
  const verseTicker = new VerseTicker(verseBody, verseRef, dots);
  const photoManager = new PhotoManager();
  const slideshow = new CelebrationSlideshow();

  // Initialize interactive particle name
  const interactiveName = new ParticleText('name-particles-canvas', 'Sœur Anne Victoire');
  interactiveName.start();

  // Initialize 3D Galaxy Carousel (replaces flat slideshow)
  const imageUrls = [
    '/' + CELEBRATION_CONFIG.imagePaths.heroImage,
    '/' + CELEBRATION_CONFIG.imagePaths.profilePortrait,
    '/' + CELEBRATION_CONFIG.imagePaths.fullBodyPortrait,
    '/' + CELEBRATION_CONFIG.imagePaths.calendarImage,
    '/' + CELEBRATION_CONFIG.imagePaths.studioImage
  ];
  const galaxyCarousel = new GalaxyCarousel('slideshow-container', imageUrls);
  galaxyCarousel.start();

  const timeline = new CelebrationTimeline(
    audioEngine,
    particleEngine,
    balloonSystem,
    verseTicker,
    photoManager,
    slideshow
  );

  // Auto-play everything immediately upon loading!
  timeline.startAutoCelebration();

  (window as unknown as { VictoireCelebration: unknown }).VictoireCelebration = {
    timeline,
    audioEngine,
    particleEngine,
    photoManager,
    slideshow,
    config: CELEBRATION_CONFIG,
  };
});
