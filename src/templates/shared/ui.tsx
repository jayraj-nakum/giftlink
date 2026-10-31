"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import type { Synth } from "./audio";
import type { Fx } from "./confetti";

export type ExperienceMode = "live" | "preview" | "demo";
export type ExperienceEvent = "complete" | "yes";

export interface ExperienceProps<D> {
  data: D;
  mode: ExperienceMode;
  synth: Synth;
  /** Confetti drawn inside the gift's own screen (works in phone-frame previews too). */
  fx: Fx;
  onEvent: (event: ExperienceEvent) => void;
}

/** A template's static opening screen (gallery cards, hero phones). Must be safe to server-render. */
export interface CoverProps {
  data: { to: string; from: string } & Record<string, unknown>;
}

/** Deterministic pseudo-random in [0, 1) so layouts are stable between renders. */
export function seeded(n: number): number {
  const x = Math.sin(n * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

export function StageButton({ className = "", ...props }: HTMLMotionProps<"button">) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      whileHover={{ scale: 1.03 }}
      className={`rounded-full px-7 py-3.5 text-base font-semibold shadow-lg shadow-black/20 outline-none focus-visible:ring-4 focus-visible:ring-white/50 ${className}`}
      {...props}
    />
  );
}

/** Wraps each scene so AnimatePresence can cross-fade between them. */
export function Scene({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className={`absolute inset-0 flex flex-col items-center justify-center px-6 text-center ${className}`}
    >
      {children}
    </motion.section>
  );
}

export function FloatingHearts({ count = 14, color = "#ff8fb1" }: { count?: number; color?: string }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }, (_, i) => {
        const size = 12 + seeded(i) * 22;
        return (
          <span
            key={i}
            className="absolute bottom-[-40px]"
            style={{
              left: `${seeded(i + 100) * 100}%`,
              animation: `float-up ${11 + seeded(i + 200) * 9}s linear ${-seeded(i + 300) * 18}s infinite`,
              opacity: 0.25 + seeded(i + 400) * 0.4,
            }}
          >
            <span className="block" style={{ animation: `sway ${2.5 + seeded(i + 500) * 2}s ease-in-out infinite alternate` }}>
              <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
                <path d="M12 21s-7.5-4.6-10-9.3C.4 8.4 2.3 4.5 6 4.5c2.2 0 3.6 1.2 4.5 2.6.3.5 1 .5 1.3 0C12.7 5.7 14.1 4.5 16.3 4.5c3.7 0 5.6 3.9 4 7.2C19.5 16.4 12 21 12 21z" />
              </svg>
            </span>
          </span>
        );
      })}
    </div>
  );
}
