/**
 * Pack opening sounds: synthetic popup/reveal cues + real GIF tear SFX.
 * Respects prefers-reduced-motion (treated as reduced audio preference).
 */

let audioCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
  if (!audioCtx) {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
  }
  if (audioCtx.state === "suspended") void audioCtx.resume();
  return audioCtx;
}

const PACK_OPENING_GIF_AUDIO_URL = "/mp3/pacotinho.mp3";

let packOpeningGifAudio: HTMLAudioElement | null = null;
let packOpeningGifSoundTimer: ReturnType<typeof setTimeout> | null = null;

function cancelScheduledPackOpeningGifSound(): void {
  if (!packOpeningGifSoundTimer) return;
  clearTimeout(packOpeningGifSoundTimer);
  packOpeningGifSoundTimer = null;
}

function startPackOpeningGifSound(volume: number): void {
  const audio = getPackOpeningGifAudio();
  if (!audio) return;
  if (!audio.paused && audio.currentTime > 0) return;
  audio.volume = volume;
  audio.currentTime = 0;
  void audio.play().catch(() => {});
}

function isAudioEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getPackOpeningGifAudio(): HTMLAudioElement | null {
  if (!isAudioEnabled()) return null;
  if (!packOpeningGifAudio) {
    packOpeningGifAudio = new Audio(PACK_OPENING_GIF_AUDIO_URL);
    packOpeningGifAudio.preload = "auto";
  }
  return packOpeningGifAudio;
}

/** Preload the real pack-tear SFX so it starts in sync with the opening GIF. */
export function preloadPackOpeningGifSound(): void {
  const audio = getPackOpeningGifAudio();
  if (audio) void audio.load();
}

/**
 * Call during a user gesture (e.g. "Abrir pacotinho" click) so later HTMLAudio
 * playback is not blocked after the async pack-open request.
 */
export function unlockPackOpeningGifSound(): void {
  const audio = getPackOpeningGifAudio();
  if (!audio) return;
  const previousVolume = audio.volume;
  audio.volume = 0.001;
  void audio
    .play()
    .then(() => {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = previousVolume || 0.85;
    })
    .catch(() => {
      audio.volume = previousVolume || 0.85;
    });
}

/** Real pack opening audio — plays with the opening GIF animation. */
export function playPackOpeningGifSound(volume = 0.85, delayMs = 0): void {
  cancelScheduledPackOpeningGifSound();
  if (delayMs > 0) {
    packOpeningGifSoundTimer = setTimeout(() => {
      packOpeningGifSoundTimer = null;
      startPackOpeningGifSound(volume);
    }, delayMs);
    return;
  }
  startPackOpeningGifSound(volume);
}

export function stopPackOpeningGifSound(): void {
  cancelScheduledPackOpeningGifSound();
  if (!packOpeningGifAudio) return;
  packOpeningGifAudio.pause();
  packOpeningGifAudio.currentTime = 0;
}

/** Light rustle + pop when the pack opener modal opens. */
export function playPackPopupSound(volume = 0.38): void {
  playPackOpenSound(volume);
}

/** Rustle + soft pop — used by {@link playPackPopupSound}. */
export function playPackOpenSound(volume = 0.42): void {
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.setValueAtTime(0, now);
  master.gain.linearRampToValueAtTime(volume, now + 0.01);
  master.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
  master.connect(ctx.destination);

  const rustleLen = ctx.sampleRate * 0.28;
  const rustleBuffer = ctx.createBuffer(1, rustleLen, ctx.sampleRate);
  const rustleData = rustleBuffer.getChannelData(0);
  for (let i = 0; i < rustleLen; i++) {
    const t = i / rustleLen;
    rustleData[i] = (Math.random() * 2 - 1) * (1 - t) * (0.35 + 0.65 * Math.sin(t * 40));
  }

  const rustle = ctx.createBufferSource();
  rustle.buffer = rustleBuffer;

  const rustleFilter = ctx.createBiquadFilter();
  rustleFilter.type = "bandpass";
  rustleFilter.frequency.setValueAtTime(900, now);
  rustleFilter.frequency.exponentialRampToValueAtTime(2400, now + 0.2);
  rustleFilter.Q.value = 0.7;

  const rustleGain = ctx.createGain();
  rustleGain.gain.setValueAtTime(0.5, now);
  rustleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

  rustle.connect(rustleFilter);
  rustleFilter.connect(rustleGain);
  rustleGain.connect(master);
  rustle.start(now);
  rustle.stop(now + 0.32);

  const pop = ctx.createOscillator();
  pop.type = "triangle";
  pop.frequency.setValueAtTime(220, now + 0.12);
  pop.frequency.exponentialRampToValueAtTime(80, now + 0.28);

  const popGain = ctx.createGain();
  popGain.gain.setValueAtTime(0.0001, now);
  popGain.gain.linearRampToValueAtTime(0.35, now + 0.13);
  popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

  pop.connect(popGain);
  popGain.connect(master);
  pop.start(now + 0.12);
  pop.stop(now + 0.34);
}

/** Short ascending chime when stickers are revealed. */
export function playPackRevealSound(volume = 0.28): void {
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.setValueAtTime(volume, now);
  master.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
  master.connect(ctx.destination);

  const notes = [523.25, 659.25, 783.99];

  notes.forEach((freq, i) => {
    const start = now + i * 0.07;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, start);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(0.22, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);

    osc.connect(gain);
    gain.connect(master);
    osc.start(start);
    osc.stop(start + 0.24);
  });
}
