"use client";

import confetti from "canvas-confetti";

/** Celebration effects, drawn on a canvas inside the gift's own screen. */
export interface Fx {
  /** Big multicolour confetti burst */
  burst(colors?: string[]): void;
  /** Hearts shooting up */
  hearts(): void;
  /** Any emoji/text raining down, e.g. "✨" or "🪔" */
  shower(text: string, count?: number): void;
}

const DEFAULT_COLORS = ["#ffc24b", "#ff5a4e", "#6fd3bd", "#ffffff", "#c9a7ff"];

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function createFx(getCanvas: () => HTMLCanvasElement | null): Fx {
  let fire: confetti.CreateTypes | null = null;
  let canvas: HTMLCanvasElement | null = null;
  const get = () => {
    const c = getCanvas();
    if (!c || reducedMotion()) return null;
    if (c !== canvas) {
      canvas = c;
      fire = confetti.create(c, { resize: true, useWorker: false });
    }
    return fire;
  };

  return {
    burst(colors = DEFAULT_COLORS) {
      const f = get();
      if (!f) return;
      void f({ particleCount: 140, spread: 90, startVelocity: 42, origin: { y: 0.6 }, colors });
      setTimeout(() => {
        void f({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.75 }, colors });
        void f({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.75 }, colors });
      }, 250);
    },
    hearts() {
      const f = get();
      if (!f) return;
      const heart = confetti.shapeFromText({ text: "❤️", scalar: 2 });
      const shoot = () => f({ shapes: [heart], scalar: 2, particleCount: 36, spread: 120, startVelocity: 36, origin: { y: 0.65 } });
      void shoot();
      setTimeout(() => void shoot(), 400);
      setTimeout(() => void shoot(), 900);
    },
    shower(text, count = 40) {
      const f = get();
      if (!f) return;
      const shape = confetti.shapeFromText({ text, scalar: 2 });
      void f({ shapes: [shape], scalar: 2, particleCount: count, spread: 160, startVelocity: 20, gravity: 0.6, origin: { y: -0.1 }, ticks: 320 });
    },
  };
}
