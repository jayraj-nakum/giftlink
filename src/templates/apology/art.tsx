"use client";

import { motion } from "motion/react";
import { useId } from "react";
import { seeded } from "../shared/ui";

/** Warm accent: the first hint of the sunrise that's coming. */
export const DAWN = "#ffd9a8";
export const NIGHT = "#1f2a44";
/** Text colour once the sky turns warm. */
export const EMBER = "#5b2a26";

const uidOf = (id: string) => id.replace(/[^A-Za-z0-9_-]/g, "");

/* ---------------- clouds ---------------- */

const CLOUD_BANKS = [
  "M34 92 C14 92 4 78 10 64 C15 52 28 47 40 50 C44 32 62 22 82 27 C92 10 120 4 140 16 C154 4 184 2 198 18 C212 8 240 12 248 32 C266 26 290 36 292 54 C310 56 318 70 312 82 C308 90 300 92 290 92 Z",
  "M28 92 C10 92 2 80 8 68 C13 58 24 55 34 57 C36 42 52 34 68 38 C76 24 98 18 116 26 C128 10 160 6 178 20 C190 12 214 14 224 30 C238 22 262 26 270 42 C290 40 308 52 308 68 C316 76 312 92 296 92 Z",
] as const;

const TONES = {
  storm: { top: "#6b78a3", bottom: "#353f64", rim: "#8e9ac4", shade: "#151b36" },
  dusk: { top: "#465180", bottom: "#252d4c", rim: "#58639a", shade: "#10152c" },
  light: { top: "#ffffff", bottom: "#ffe6cf", rim: "#ffffff", shade: "#eaa47f" },
} as const;

/** A long, low cloud. `stretch` lets it fill any box (used for the tappable rows). */
export function Cloud({
  tone = "storm",
  stretch = false,
  variant = 0,
  flip = false,
  className = "",
}: {
  tone?: keyof typeof TONES;
  stretch?: boolean;
  variant?: number;
  flip?: boolean;
  className?: string;
}) {
  const id = uidOf(useId());
  const c = TONES[tone];
  const d = CLOUD_BANKS[variant % CLOUD_BANKS.length];
  return (
    <svg
      viewBox="0 0 320 100"
      preserveAspectRatio={stretch ? "none" : "xMidYMid meet"}
      className={`overflow-visible ${className}`}
      aria-hidden
    >
      <defs>
        <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c.top} />
          <stop offset="1" stopColor={c.bottom} />
        </linearGradient>
      </defs>
      <g transform={flip ? "matrix(-1 0 0 1 320 0)" : undefined}>
        <path d={d} fill={c.rim} transform="translate(0 -3)" />
        <path d={d} fill={`url(#${id}-fill)`} />
        <path d="M30 92 C90 78 230 78 292 92 Z" fill={c.shade} opacity=".35" />
      </g>
    </svg>
  );
}

const CLOUD_ROUND =
  "M52 118 C26 118 12 100 16 82 C20 64 38 56 54 60 C56 36 78 18 104 22 C116 6 150 2 166 22 C186 16 210 30 210 52 C228 56 236 74 230 92 C226 108 212 118 196 118 Z";

const DRIPS = [
  { x: 66, delay: 0 },
  { x: 92, delay: 0.55 },
  { x: 118, delay: 0.2 },
  { x: 144, delay: 0.8 },
  { x: 170, delay: 0.35 },
  { x: 196, delay: 0.95 },
];

/** The opening illustration: a heavy rain cloud with the moon hiding behind it. */
export function RainCloud() {
  const id = uidOf(useId());
  return (
    <svg viewBox="0 0 240 190" className="h-auto w-full overflow-visible drop-shadow-2xl" aria-hidden>
      <defs>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0" stopColor="#fff4d6" stopOpacity=".55" />
          <stop offset="1" stopColor="#fff4d6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7884ac" />
          <stop offset="1" stopColor="#3a4469" />
        </linearGradient>
      </defs>
      <circle cx="184" cy="36" r="44" fill={`url(#${id}-glow)`} />
      <circle cx="184" cy="36" r="19" fill="#f3eedb" />
      <path d={CLOUD_ROUND} transform="translate(-18 -8) scale(.62)" fill="#4b5680" />
      <path d={CLOUD_ROUND} fill="#949fc6" transform="translate(0 -3.5)" />
      <path d={CLOUD_ROUND} fill={`url(#${id}-body)`} />
      <path d="M40 118 C80 104 170 104 214 118 Z" fill="#151b36" opacity=".35" />
      <g stroke="#bccaf2" strokeWidth="3" strokeLinecap="round">
        {DRIPS.map((d) => (
          <line key={d.x} x1={d.x} y1="128" x2={d.x - 3} y2="140" opacity="0">
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0; -5 40"
              dur="1.2s"
              begin={`${d.delay}s`}
              repeatCount="indefinite"
            />
            <animate attributeName="opacity" values="0;.9;0" dur="1.2s" begin={`${d.delay}s`} repeatCount="indefinite" />
          </line>
        ))}
      </g>
    </svg>
  );
}

/* ---------------- weather ---------------- */

const DROPS = 40;

/** Light rain. `intensity` 0..1 fades drops out one by one. */
export function Rain({ intensity }: { intensity: number }) {
  const shown = Math.round(DROPS * Math.min(1, Math.max(0, intensity)));
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -inset-[15%] rotate-[9deg]">
        {Array.from({ length: DROPS }, (_, i) => (
          <span
            key={i}
            className="absolute top-full block w-px rounded-full transition-opacity duration-1000"
            style={{
              left: `${(seeded(i + 21) * 100).toFixed(2)}%`,
              height: `${(14 + seeded(i + 51) * 16).toFixed(1)}px`,
              opacity: i < shown ? 0.3 + seeded(i + 81) * 0.4 : 0,
              background: "linear-gradient(to bottom, rgba(205,218,255,0), rgba(205,218,255,.9))",
              // float-up reversed = falling: from above the top edge down past the bottom.
              animation: `float-up ${(0.7 + seeded(i + 111) * 0.5).toFixed(2)}s linear ${(-seeded(i + 141) * 2).toFixed(2)}s infinite reverse`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

const HILL_BACK = "M0 70 C60 40 120 50 180 66 C240 82 300 40 400 56 V120 H0 Z";
const HILL_FRONT = "M0 92 C80 70 150 84 220 96 C290 106 340 80 400 88 V120 H0 Z";

/**
 * The whole sky. `clear` (0..1) lifts the storm, `warm` brings the sunrise, `rain` (0..1) is how hard it rains.
 * Everything is CSS-transitioned, so it renders the same on the server.
 */
export function ApologySky({
  clear = 0,
  warm = false,
  rain = 0,
  children,
}: {
  clear?: number;
  warm?: boolean;
  rain?: number;
  children?: React.ReactNode;
}) {
  const gloom = warm ? 0 : 1 - clear;
  return (
    <div
      className="absolute inset-0 overflow-hidden text-white"
      style={{ background: "linear-gradient(180deg, #1f2a44 0%, #2e3a60 52%, #5b6b9a 100%)" }}
    >
      {/* clear evening, with the first glow of dawn on the horizon (the sunrise layer covers it, so it never fades back) */}
      <div
        aria-hidden
        className="absolute inset-0 transition-opacity duration-[1600ms]"
        style={{
          opacity: clear,
          background:
            "radial-gradient(90% 38% at 50% 100%, rgba(255,186,150,.38) 0%, rgba(255,186,150,0) 70%), linear-gradient(180deg, #1a2552 0%, #33488c 52%, #7d92cf 100%)",
        }}
      />
      {/* sunrise */}
      <div
        aria-hidden
        className="absolute inset-0 transition-opacity duration-[2200ms]"
        style={{
          opacity: warm ? 1 : 0,
          background:
            "radial-gradient(80% 50% at 50% 22%, rgba(255,247,214,.9) 0%, rgba(255,247,214,0) 70%), linear-gradient(180deg, #ffb987 0%, #ffd5a6 48%, #fff0db 100%)",
        }}
      />
      <div aria-hidden className="absolute inset-0 transition-opacity duration-[1600ms]" style={{ opacity: warm ? 0 : clear }}>
        <div className="stars" />
      </div>

      {/* heavy clouds hanging over everything until the storm lifts */}
      <div aria-hidden className="pointer-events-none absolute inset-0 transition-opacity duration-[1600ms]" style={{ opacity: gloom * 0.9 }}>
        <Cloud tone="dusk" className="absolute -left-[18cqw] top-[2cqh] w-[78cqw]" />
        <Cloud tone="dusk" variant={1} flip className="absolute -right-[22cqw] top-[9cqh] w-[86cqw]" />
        <Cloud tone="dusk" variant={1} className="absolute -left-[30cqw] top-[18cqh] w-[70cqw] opacity-70" />
      </div>

      {/* soft white clouds once it's warm */}
      <div aria-hidden className="pointer-events-none absolute inset-0 transition-opacity duration-[2400ms]" style={{ opacity: warm ? 1 : 0 }}>
        <motion.div
          className="absolute -left-[12cqw] top-[6cqh] w-[46cqw] opacity-90"
          animate={{ x: [0, 18, 0] }}
          transition={{ repeat: Infinity, duration: 16, ease: "easeInOut" }}
        >
          <Cloud tone="light" />
        </motion.div>
        <motion.div
          className="absolute -right-[10cqw] top-[40cqh] w-[38cqw] opacity-80"
          animate={{ x: [0, -14, 0] }}
          transition={{ repeat: Infinity, duration: 19, ease: "easeInOut" }}
        >
          <Cloud tone="light" variant={1} flip />
        </motion.div>
      </div>

      <Sun up={warm} />

      <svg
        aria-hidden
        viewBox="0 0 400 120"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[20cqh] w-full"
      >
        <path d={HILL_BACK} style={{ fill: warm ? "#f2a585" : "#19223d", transition: "fill 2s ease" }} />
        <path d={HILL_FRONT} style={{ fill: warm ? "#de8770" : "#111829", transition: "fill 2s ease" }} />
      </svg>

      <Rain intensity={rain} />
      {children}
    </div>
  );
}

/** The sun, rising from behind the hills when `up`. */
function Sun({ up }: { up: boolean }) {
  const id = uidOf(useId());
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-[8cqh] aspect-square w-[min(46cqw,24cqh,230px)] -translate-x-1/2"
      initial={false}
      animate={up ? { y: "0%", opacity: 1 } : { y: "320%", opacity: 0 }}
      transition={{ y: { duration: 2.6, ease: [0.2, 0.7, 0.2, 1] }, opacity: { duration: up ? 0.6 : 0.4 } }}
    >
      <svg viewBox="0 0 200 200" className="h-full w-full overflow-visible">
        <defs>
          <radialGradient id={`${id}-halo`}>
            <stop offset=".35" stopColor="#fff2c2" stopOpacity=".85" />
            <stop offset="1" stopColor="#ffd08a" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${id}-disc`} cx=".42" cy=".38">
            <stop offset="0" stopColor="#fffbe8" />
            <stop offset=".55" stopColor="#ffd977" />
            <stop offset="1" stopColor="#ffb347" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="128" fill={`url(#${id}-halo)`} />
        <motion.g animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 60, ease: "linear" }}>
          {Array.from({ length: 12 }, (_, i) => (
            <path
              key={i}
              d="M100 4 L106 30 L94 30 Z"
              fill="#ffd27a"
              opacity=".75"
              transform={`rotate(${i * 30} 100 100)`}
            />
          ))}
        </motion.g>
        <circle cx="100" cy="100" r="58" fill={`url(#${id}-disc)`} />
      </svg>
    </motion.div>
  );
}

/** A crescent moon with a soft glow. */
export function Moon({ className = "" }: { className?: string }) {
  const id = uidOf(useId());
  return (
    <svg viewBox="0 0 100 100" className={`overflow-visible ${className}`} aria-hidden>
      <defs>
        <radialGradient id={`${id}-glow`}>
          <stop offset=".4" stopColor="#fff6dc" stopOpacity=".35" />
          <stop offset="1" stopColor="#fff6dc" stopOpacity="0" />
        </radialGradient>
        <mask id={`${id}-cut`}>
          <rect width="100" height="100" fill="#fff" />
          <circle cx="66" cy="38" r="30" fill="#000" />
        </mask>
      </defs>
      <circle cx="50" cy="50" r="62" fill={`url(#${id}-glow)`} />
      <circle cx="50" cy="50" r="36" fill="#f7f1dc" mask={`url(#${id}-cut)`} />
    </svg>
  );
}

/** The opening card: the rain cloud, who it's from, and a slot for the button. */
export function ApologyGate({ to, from, action }: { to: string; from: string; action: React.ReactNode }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
      <div className="w-[min(66cqw,32cqh,270px)]">
        <RainCloud />
      </div>
      <p className="mt-5 max-w-full text-balance break-words font-display text-[1.65rem] leading-snug text-white/90">
        {from} has something to say,
      </p>
      <h1 className="mt-1 max-w-full truncate font-display text-5xl leading-tight" style={{ color: DAWN }}>
        {to}
      </h1>
      {action}
      <p className="mt-5 text-xs text-white/55">Sound on, and take your time</p>
    </div>
  );
}
