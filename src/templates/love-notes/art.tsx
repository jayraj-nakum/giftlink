"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId } from "react";
import { FloatingHearts, seeded } from "../shared/ui";

export const INK = "#7a1f3d";
export const ROSE = "#c2335b";
export const PAPER = "#fffaf0";

/** Size boxes for the jar. Each is a container, so the label inside scales with the jar. */
export const JAR_BOX = "@container relative aspect-[200/260]";
export const JAR_LARGE = "w-[min(58cqw,34cqh,240px)]";
export const JAR_SMALL = "w-[min(42cqw,24cqh,180px)]";

const HEART = "M12 21s-7.5-4.6-10-9.3C.4 8.4 2.3 4.5 6 4.5c2.2 0 3.6 1.2 4.5 2.6.3.5 1 .5 1.3 0C12.7 5.7 14.1 4.5 16.3 4.5c3.7 0 5.6 3.9 4 7.2C19.5 16.4 12 21 12 21z";

/** Warm daytime blush, with a soft patch of sunlight and a few drifting hearts. */
export function LoveNotesBackground({ hearts = 10, children }: { hearts?: number; children?: React.ReactNode }) {
  return (
    <div
      className="absolute inset-0 text-[#7a1f3d]"
      style={{ background: "linear-gradient(172deg, #fff3ee 0%, #fde8e4 38%, #f7c6c7 100%)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 45% at 18% 8%, rgba(255,249,236,.95) 0%, rgba(255,249,236,0) 70%), radial-gradient(60% 40% at 100% 100%, rgba(232,120,146,.22) 0%, rgba(232,120,146,0) 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{ backgroundImage: "radial-gradient(rgba(122,31,61,.07) 1px, transparent 1px)", backgroundSize: "22px 22px" }}
      />
      <FloatingHearts count={hearts} color="#ee8aa0" />
      {children}
    </div>
  );
}

/* ---------------- the jar ---------------- */

const BODY = "M64 48 V58 C64 70 36 74 36 100 V226 C36 240 46 248 60 248 H140 C154 248 164 240 164 226 V100 C164 74 136 70 136 58 V48 Z";
const INSIDE = "M68 48 V60 C68 74 40 78 40 102 V224 C40 236 48 244 60 244 H140 C152 244 160 236 160 224 V102 C160 78 132 74 132 60 V48 Z";
/** Gingham cloth topper: a low dome, then a skirt with pinked (zigzag) edges flaring over the neck. */
const CLOTH = (() => {
  const teeth = 16;
  const step = 102 / teeth;
  let d = "M56 46 C54 33 74 25 100 25 C126 25 146 33 144 46 L151 59";
  for (let i = 1; i <= teeth; i++) d += ` L${(151 - i * step).toFixed(2)} ${i % 2 ? 55 : 59}`;
  return `${d} Z`;
})();
const GINGHAM = Array.from({ length: 12 }, (_, i) => 46 + i * 10);

const PIECES = 24;
const PAPERS = ["#fffaf0", "#ffe9e3", "#fde0e6", "#fff2d8", "#fbe8f1"];
const HEART_FILLS = ["#e2557a", "#f07a95", ROSE, "#ff9db2", "#d9466f"];

function piecePlace(i: number) {
  const row = Math.floor(i / 4);
  const col = i % 4;
  return {
    x: 58 + col * 28 + (row % 2 ? 13 : 0) + (seeded(i + 1) * 8 - 4),
    y: 230 - row * 21 + (seeded(i + 31) * 6 - 3),
    rotate: seeded(i + 61) * 76 - 38,
  };
}

function FoldedPiece({ i }: { i: number }) {
  const { x, y, rotate } = piecePlace(i);
  const paper = PAPERS[Math.floor(seeded(i + 91) * PAPERS.length)];
  return (
    <g transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${rotate.toFixed(2)})`}>
      <rect x="-14" y="-9" width="28" height="18" rx="2" fill={paper} stroke="#dfb2a6" strokeWidth=".8" />
      <rect x="-14" y="0" width="28" height="9" rx="2" fill={INK} opacity=".05" />
      <path d="M-14 0 H14" stroke="#dfb2a6" strokeWidth=".7" />
      {i % 3 === 0 && <path d={HEART} transform="translate(-3.6 -7.4) scale(.3)" fill="#d9466f" />}
    </g>
  );
}

function HeartPiece({ i }: { i: number }) {
  const { x, y, rotate } = piecePlace(i);
  return (
    <g transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${(rotate * 0.6).toFixed(2)})`}>
      <path d={HEART} transform="translate(-11.4 -12.5) scale(.95)" fill={HEART_FILLS[i % HEART_FILLS.length]} />
      <ellipse cx="-4.5" cy="-5" rx="2.6" ry="1.6" fill="#fff" opacity=".45" transform="rotate(-30 -4.5 -5)" />
    </g>
  );
}

/**
 * A glass jar with a cloth lid. `fill` (0..1) is how full it is: notes leave from the top.
 * With `hearts` it holds little hearts instead of folded notes.
 */
export function Jar({ fill = 1, hearts = false }: { fill?: number; hearts?: boolean }) {
  const uid = useId().replace(/[^A-Za-z0-9_-]/g, "");
  const visible = Math.round(PIECES * Math.min(1, Math.max(0, fill)));

  return (
    <svg viewBox="0 0 200 260" className="h-full w-full overflow-visible" aria-hidden>
      <defs>
        <clipPath id={`${uid}-in`}>
          <path d={INSIDE} />
        </clipPath>
        <linearGradient id={`${uid}-glass`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity=".62" />
          <stop offset=".45" stopColor="#fff" stopOpacity=".2" />
          <stop offset="1" stopColor="#fff" stopOpacity=".5" />
        </linearGradient>
        <clipPath id={`${uid}-cloth`}>
          <path d={CLOTH} />
        </clipPath>
      </defs>

      <ellipse cx="100" cy="252" rx="72" ry="7" fill={INK} opacity=".14" />

      {/* glass, back */}
      <path d={BODY} fill={`url(#${uid}-glass)`} />

      {/* what's inside */}
      <g clipPath={`url(#${uid}-in)`}>
        <AnimatePresence initial={false}>
          {Array.from({ length: visible }, (_, i) => (
            <motion.g key={i} exit={{ y: -110, opacity: 0, transition: { duration: 0.55, ease: "easeIn" } }}>
              {hearts ? <HeartPiece i={i} /> : <FoldedPiece i={i} />}
            </motion.g>
          ))}
        </AnimatePresence>
      </g>

      {/* glass, front */}
      <path d={BODY} fill="none" stroke="#fff" strokeOpacity=".92" strokeWidth="3" />
      <path d={BODY} fill="none" stroke="#c76a80" strokeOpacity=".4" strokeWidth="1.1" />
      <path d="M50 108 C45 142 45 192 51 226" stroke="#fff" strokeWidth="7" strokeLinecap="round" opacity=".6" fill="none" />
      <path d="M57 116 C55 130 55 142 56 150" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" opacity=".5" fill="none" />
      <path d="M151 116 C154 140 154 168 152 190" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" opacity=".45" fill="none" />
      <path d="M46 238 C70 247 130 247 154 238" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" opacity=".55" fill="none" />

      {/* rim */}
      <rect x="58" y="40" width="84" height="13" rx="5" fill="#fff" fillOpacity=".6" stroke="#c76a80" strokeOpacity=".35" />

      {/* gingham cloth topper tied with twine */}
      <g clipPath={`url(#${uid}-cloth)`}>
        <rect x="40" y="20" width="120" height="44" fill="#e7738f" />
        {GINGHAM.map((v) => (
          <rect key={`v${v}`} x={v} y="20" width="5" height="44" fill="#fff" opacity=".3" />
        ))}
        {GINGHAM.slice(0, 5).map((_, i) => (
          <rect key={`h${i}`} x="40" y={22 + i * 10} width="120" height="5" fill="#fff" opacity=".3" />
        ))}
        <rect x="40" y="47" width="120" height="14" fill={INK} opacity=".1" />
        <path d="M62 35 C80 28 120 28 138 35" stroke="#fff" strokeOpacity=".35" strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>
      <path d={CLOTH} fill="none" stroke="#c94f6d" strokeOpacity=".5" strokeWidth=".8" />
      <path d="M55 46 C80 50.5 120 50.5 145 46" stroke="#9c6a3c" strokeWidth="2.6" fill="none" />
      <path d="M55 48.4 C80 52.9 120 52.9 145 48.4" stroke="#c08a52" strokeWidth="1.2" fill="none" />
      <g stroke="#9c6a3c" strokeWidth="2.2" fill="none" strokeLinecap="round">
        <ellipse cx="92" cy="47.5" rx="7.5" ry="4" transform="rotate(-18 92 47.5)" />
        <ellipse cx="108" cy="47.5" rx="7.5" ry="4" transform="rotate(18 108 47.5)" />
        <path d="M99 51 L94 62" />
        <path d="M101 51 L107 61" />
      </g>
      <circle cx="100" cy="49.5" r="2.6" fill="#9c6a3c" />

      {/* string the heart tag hangs from */}
      <path d="M100 51 C99 62 101 74 100 86" stroke="#9c6a3c" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/**
 * Heart-shaped paper tag hanging from the twine, over the jar's shoulder, so the notes below stay in view.
 * Lives inside a JAR_BOX, so cqw means "jar width".
 */
export function JarLabel({ to }: { to: string }) {
  const size = to.length <= 6 ? "text-[9.5cqw]" : to.length <= 9 ? "text-[8cqw]" : "text-[6.5cqw]";
  return (
    <div className="pointer-events-none absolute left-1/2 top-[27%] aspect-[110/100] w-[48%] origin-top -translate-x-1/2 -rotate-3">
      <svg viewBox="0 0 110 100" className="absolute inset-0 h-full w-full drop-shadow-md" aria-hidden>
        <path
          d="M55 95 C55 95 6 66 6 34 C6 16 19 6 33 6 C44 6 51 12 55 20 C59 12 66 6 77 6 C91 6 104 16 104 34 C104 66 55 95 55 95 Z"
          fill="#fffaf2"
          stroke="#e7b9ab"
          strokeWidth="1.5"
        />
        <path
          d="M55 95 C55 95 6 66 6 34 C6 16 19 6 33 6 C44 6 51 12 55 20 C59 12 66 6 77 6 C91 6 104 16 104 34 C104 66 55 95 55 95 Z"
          transform="translate(55 48) scale(.84) translate(-55 -48)"
          fill="none"
          stroke="#e091a5"
          strokeWidth="1.3"
          strokeDasharray="3 3"
        />
      </svg>
      <div className="relative mx-auto flex h-full max-w-[66%] flex-col items-center justify-center pb-[16%] leading-none">
        <span className="font-hand text-[6cqw] text-[#b0405f]">for</span>
        <span className={`mt-[0.06em] max-w-full truncate font-hand font-bold ${size} text-[#7a1f3d]`}>{to}</span>
      </div>
    </div>
  );
}

/** The jar with its "for {to}" label. Put it inside a JAR_BOX. */
export function LabelledJar({ to, fill, hearts }: { to: string; fill?: number; hearts?: boolean }) {
  return (
    <>
      <Jar fill={fill} hearts={hearts} />
      <JarLabel to={to} />
    </>
  );
}

/** Title block on the opening screen. */
export function JarHeading({ to, from }: { to: string; from: string }) {
  return (
    <div className="flex max-w-full flex-col items-center">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#7a1f3d]/60">A jar of love notes for</p>
      <h1 className="mt-2 max-w-full truncate font-display text-5xl leading-tight text-[#7a1f3d]">{to}</h1>
      <p className="mt-1 max-w-full truncate font-hand text-2xl text-[#b0405f]">filled by {from}</p>
    </div>
  );
}

/** "Tap the jar" line under the jar on the opening screen. */
export function JarHint({ children = "Tap the jar" }: { children?: React.ReactNode }) {
  return <p className="text-sm font-semibold tracking-wide text-[#7a1f3d]/75">{children}</p>;
}
