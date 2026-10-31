"use client";

/**
 * Tiny Web Audio synth, so the experiences have music without shipping licensed tracks.
 * A "music box" voice (sine + quiet octave) plays note lists; a few sound effects too.
 * Browsers only allow audio after a tap, so call unlock() from a click handler.
 *
 * Want real songs instead? Put licensed MP3s in /public/music and play them with <audio>.
 */

type Note = [pitch: string | null, beats: number];

const NOTE_INDEX: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
function freq(pitch: string): number {
  const m = /^([A-G])(#|b)?(\d)$/.exec(pitch);
  if (!m) return 440;
  const semitone = NOTE_INDEX[m[1]] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0);
  const midi = (Number(m[3]) + 1) * 12 + semitone;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/** "Happy Birthday to You" (public-domain melody), 3/4 time. */
export const HAPPY_BIRTHDAY: Note[] = [
  ["G4", 0.75], ["G4", 0.25], ["A4", 1], ["G4", 1], ["C5", 1], ["B4", 2],
  ["G4", 0.75], ["G4", 0.25], ["A4", 1], ["G4", 1], ["D5", 1], ["C5", 2],
  ["G4", 0.75], ["G4", 0.25], ["G5", 1], ["E5", 1], ["C5", 1], ["B4", 1], ["A4", 2],
  ["F5", 0.75], ["F5", 0.25], ["E5", 1], ["C5", 1], ["D5", 1], ["C5", 3],
  [null, 2],
];

/** A slow, original arpeggio over C – G – Am – F. */
export const SOFT_ARPEGGIO: Note[] = [
  ["C4", 0.5], ["G4", 0.5], ["C5", 0.5], ["E5", 0.5], ["G5", 0.5], ["E5", 0.5], ["C5", 0.5], ["G4", 0.5],
  ["G3", 0.5], ["D4", 0.5], ["G4", 0.5], ["B4", 0.5], ["D5", 0.5], ["B4", 0.5], ["G4", 0.5], ["D4", 0.5],
  ["A3", 0.5], ["E4", 0.5], ["A4", 0.5], ["C5", 0.5], ["E5", 0.5], ["C5", 0.5], ["A4", 0.5], ["E4", 0.5],
  ["F3", 0.5], ["C4", 0.5], ["F4", 0.5], ["A4", 0.5], ["C5", 0.5], ["A4", 0.5], ["F4", 0.5], ["C4", 0.5],
];

export class Synth {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private songId = 0;
  muted = false;

  /** Must run inside a user gesture (tap/click). */
  unlock(): void {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.22;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(muted ? 0 : 0.22, this.ctx.currentTime, 0.05);
  }

  private tone(f: number, start: number, dur: number, volume = 1, type: OscillatorType = "sine"): void {
    if (!this.ctx || !this.master) return;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(volume, start + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, start + Math.max(dur, 0.25) * 1.6);
    g.connect(this.master);
    const o = this.ctx.createOscillator();
    o.type = type;
    o.frequency.value = f;
    o.connect(g);
    o.start(start);
    o.stop(start + Math.max(dur, 0.25) * 1.7);
  }

  /** Plays a note list; loops until stop() or another play(). */
  play(notes: Note[], { bpm = 100, loop = true }: { bpm?: number; loop?: boolean } = {}): void {
    if (!this.ctx) return;
    this.stop();
    const id = ++this.songId;
    const beat = 60 / bpm;
    const run = () => {
      if (!this.ctx || id !== this.songId) return;
      let t = this.ctx.currentTime + 0.05;
      for (const [pitch, beats] of notes) {
        if (pitch) {
          const f = freq(pitch);
          this.tone(f, t, beats * beat, 0.55);
          this.tone(f * 2, t, beats * beat * 0.6, 0.08, "triangle");
        }
        t += beats * beat;
      }
      const total = notes.reduce((s, [, b]) => s + b, 0) * beat;
      if (loop) this.timer = setTimeout(run, total * 1000);
    };
    run();
  }

  stop(): void {
    this.songId++;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }

  private noise(dur: number, filterFreq: number, volume: number): void {
    if (!this.ctx || !this.master) return;
    const len = Math.floor(this.ctx.sampleRate * dur);
    const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const ch = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2;
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = filterFreq;
    const g = this.ctx.createGain();
    g.gain.value = volume;
    src.connect(filter).connect(g).connect(this.master);
    src.start();
  }

  pop(): void {
    this.noise(0.12, 1800, 2.2);
  }

  whoosh(): void {
    this.noise(0.45, 600, 1.4);
  }

  chime(): void {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    ["E6", "G6", "C7"].forEach((p, i) => this.tone(freq(p), t + i * 0.07, 0.6, 0.25));
  }

  dispose(): void {
    this.stop();
    void this.ctx?.close();
    this.ctx = null;
    this.master = null;
  }
}
