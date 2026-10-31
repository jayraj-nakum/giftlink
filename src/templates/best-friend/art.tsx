"use client";

import { motion } from "motion/react";
import { useId } from "react";
import { seeded } from "../shared/ui";

/** Mint + kraft-paper palette. */
export const BF = {
  mint: "#e6f4ef",
  paper: "#f4e9d8",
  ink: "#1f3d36",
  accent: "#2bb39a",
  red: "#d9534f",
} as const;

export const BF_CONFETTI = ["#2bb39a", "#d9534f", "#f4e9d8", "#1f3d36", "#ffd35c"];

const svgId = (raw: string) => raw.replace(/[^\w-]/g, "");

/* ---------------- backdrop ---------------- */

const DOODLES: { x: string; y: string; kind: number; size: number }[] = [
  { x: "6%", y: "7%", kind: 0, size: 26 },
  { x: "72%", y: "4%", kind: 1, size: 30 },
  { x: "88%", y: "30%", kind: 2, size: 22 },
  { x: "4%", y: "40%", kind: 3, size: 28 },
  { x: "90%", y: "62%", kind: 0, size: 20 },
  { x: "8%", y: "74%", kind: 2, size: 24 },
  { x: "78%", y: "90%", kind: 3, size: 30 },
  { x: "36%", y: "94%", kind: 1, size: 24 },
];

function Doodle({ kind }: { kind: number }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (kind) {
    case 0: // star
      return <path {...common} d="M12 2.5l2.8 6 6.5.7-4.9 4.4 1.4 6.4L12 16.8 6.2 20l1.4-6.4L2.7 9.2l6.5-.7z" />;
    case 1: // squiggle
      return <path {...common} d="M2 14c3-6 5-6 7 0s4 6 6 0 4-6 7 0" />;
    case 2: // heart
      return <path {...common} d="M12 20s-7-4.4-9-8.8C1.6 8 3.4 4.6 6.6 4.6c2 0 3.3 1.1 4.1 2.4.6.9 1.8.9 2.4 0 .8-1.3 2.1-2.4 4.1-2.4 3.2 0 5 3.4 3.6 6.6C19 15.6 12 20 12 20z" />;
    default: // spiral
      return <path {...common} d="M12 12c0-1 1-1.6 1.8-1 1.3.9.8 3-.7 3.4-2 .6-3.8-1.2-3.4-3.2.5-2.6 3.5-3.8 5.8-2.6 2.9 1.5 3.2 5.6 1 7.8-2.6 2.6-7.2 2-9-1.2" />;
  }
}

/** Mint graph-paper desk shared by the experience and its cover. `dim` dims the lights for the letter. */
export function FriendBackground({ dim = false, children }: { dim?: boolean; children?: React.ReactNode }) {
  return (
    <div
      className="absolute inset-0 text-[#1f3d36]"
      style={{
        backgroundColor: BF.mint,
        backgroundImage:
          "radial-gradient(rgba(31,61,54,0.10) 1px, transparent 1.4px), radial-gradient(120% 75% at 50% 0%, #f3fbf8 0%, #e6f4ef 55%, #d5ebe3 100%)",
        backgroundSize: "20px 20px, 100% 100%",
      }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 text-[#2bb39a]">
        {DOODLES.map((d, i) => (
          <svg
            key={i}
            viewBox="0 0 24 24"
            width={d.size}
            height={d.size}
            className="absolute"
            style={{ left: d.x, top: d.y, opacity: 0.22 + seeded(i + 21) * 0.14, transform: `rotate(${(seeded(i + 5) - 0.5) * 40}deg)` }}
          >
            <Doodle kind={d.kind} />
          </svg>
        ))}
      </div>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        initial={false}
        animate={{ opacity: dim ? 1 : 0 }}
        transition={{ duration: 0.9, ease: "easeInOut" }}
        style={{ background: "radial-gradient(95% 65% at 50% 38%, #2c5a50 0%, #1f3d36 55%, #132823 100%)" }}
      />
      {children}
    </div>
  );
}

/* ---------------- small props ---------------- */

/** A strip of washi tape with torn ends. Size it with a width class. */
export function Tape({ className = "", color = "rgba(43,179,154,0.55)" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 80 22" aria-hidden className={`pointer-events-none ${className}`}>
      <path d="M3 1 L77 1 L79.5 5 L76.5 8.5 L79.5 12.5 L76.5 16.5 L79 21 L1 21 L3.5 16.5 L0.5 12.5 L3.5 8.5 L0.5 5 Z" fill={color} />
      <rect x="3" y="7" width="74" height="3" fill="#fff" opacity="0.18" />
      <path d="M3 1.5 H77" stroke="#fff" strokeOpacity="0.35" />
    </svg>
  );
}

/** Red rubber stamp: TOP SECRET · BEST FRIENDS ONLY, with a little ink texture. */
export function SecretStamp({ className = "" }: { className?: string }) {
  const id = svgId(useId());
  return (
    <svg viewBox="0 0 220 84" aria-label="Top secret, best friends only" role="img" className={className}>
      <defs>
        <mask id={`${id}-ink`}>
          <rect width="220" height="84" fill="#fff" />
          {Array.from({ length: 46 }, (_, i) => (
            <circle key={i} cx={seeded(i + 1) * 220} cy={seeded(i + 61) * 84} r={0.5 + seeded(i + 121) * 1.7} fill="#000" />
          ))}
        </mask>
      </defs>
      <g mask={`url(#${id}-ink)`} fill="none" stroke={BF.red} opacity="0.9">
        <rect x="3" y="3" width="214" height="78" rx="9" strokeWidth="4" />
        <rect x="10" y="10" width="200" height="64" rx="5" strokeWidth="1.4" />
        <g fill={BF.red} stroke="none" style={{ fontFamily: "var(--nf-body), system-ui, sans-serif" }}>
          <text x="110" y="46" textAnchor="middle" fontSize="30" fontWeight="800" textLength="176" lengthAdjust="spacingAndGlyphs">
            TOP SECRET
          </text>
          <text x="110" y="64" textAnchor="middle" fontSize="10.5" fontWeight="700" textLength="168" lengthAdjust="spacingAndGlyphs">
            ★ BEST FRIENDS ONLY ★
          </text>
        </g>
      </g>
    </svg>
  );
}

/* ---------------- the case-file folder ---------------- */

const FOLDER_BACK =
  "M10 50 Q10 38 22 38 L30 38 L42 16 Q45 10 52 10 L132 10 Q139 10 142 16 L152 38 L318 38 Q330 38 330 50 L330 278 Q330 290 318 290 L22 290 Q10 290 10 278 Z";
const FOLDER_FRONT =
  "M10 16 Q10 6 20 6 L130 6 Q148 6 155 18 Q161 28 170 28 Q179 28 185 18 Q192 6 210 6 L320 6 Q330 6 330 16 L330 214 Q330 226 318 226 L22 226 Q10 226 10 214 Z";

/** A kraft case-file folder with papers inside. `open` swings the front flap down and lifts the papers. */
export function CaseFolder({ to, from, open = false }: { to: string; from: string; open?: boolean }) {
  const id = svgId(useId());
  return (
    <div className="relative aspect-[340/290] w-full">
      <svg viewBox="0 0 340 290" aria-hidden className="absolute inset-0 h-full w-full overflow-visible drop-shadow-[0_14px_22px_rgba(31,61,54,0.28)]">
        <path d={FOLDER_BACK} fill="#bf8f5b" />
        <rect x="58" y="17" width="66" height="15" rx="2" fill={BF.paper} opacity="0.92" />
        <text x="91" y="28" textAnchor="middle" fontSize="8.5" fontWeight="700" letterSpacing="1.6" fill={BF.ink} opacity="0.7" style={{ fontFamily: "var(--nf-body), sans-serif" }}>
          FILE 001
        </text>
        <motion.g initial={false} animate={{ y: open ? -38 : 0 }} transition={{ duration: 0.9, delay: open ? 0.25 : 0, ease: "easeOut" }}>
          <rect x="34" y="34" width="268" height="230" rx="3" fill="#ecdcc2" transform="rotate(-3 168 150)" />
          <g transform="rotate(2.5 170 140)">
            <rect x="44" y="26" width="252" height="230" rx="3" fill="#faf4e8" />
            {[0, 1, 2, 3].map((k) => (
              <rect key={k} x="62" y={44 + k * 9} width={k === 3 ? 80 : 130 - k * 14} height="3" rx="1.5" fill={BF.ink} opacity="0.14" />
            ))}
          </g>
          <g transform="rotate(9 262 46)">
            <rect x="226" y="6" width="68" height="78" rx="2" fill="#fffdf8" />
            <rect x="232" y="12" width="56" height="52" fill="#9fd8c6" />
            <circle cx="274" cy="26" r="7" fill="#ffe7a3" />
            <path d="M232 64 L250 40 L262 52 L272 44 L288 60 V64 Z" fill="#2bb39a" opacity="0.85" />
            <path d="M246 0 V22 a5 5 0 0 0 10 0 V4 a3 3 0 0 0 -6 0 V20" fill="none" stroke="#8b9b97" strokeWidth="2" strokeLinecap="round" />
          </g>
        </motion.g>
      </svg>

      <motion.div
        className="absolute inset-x-0 bottom-0 h-[77.93%]"
        style={{ transformOrigin: "50% 100%", transformPerspective: 900 }}
        initial={false}
        animate={open ? { rotateX: -64, y: 8 } : { rotateX: 0, y: 0 }}
        transition={{ duration: 0.85, ease: [0.3, 0.7, 0.3, 1] }}
      >
        <svg viewBox="0 0 340 226" aria-hidden className="absolute inset-0 h-full w-full overflow-visible">
          <defs>
            <linearGradient id={`${id}-front`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#e3c08f" />
              <stop offset="1" stopColor="#d0a46d" />
            </linearGradient>
          </defs>
          <path d={FOLDER_FRONT} fill={`url(#${id}-front)`} />
          <path d="M14 10 Q20 6 28 6 L130 6 Q148 6 155 18 Q161 28 170 28 Q179 28 185 18 Q192 6 210 6 L318 6" fill="none" stroke="#f0d8b0" strokeWidth="1.6" />
          {Array.from({ length: 38 }, (_, i) => (
            <circle
              key={i}
              cx={22 + seeded(i + 300) * 296}
              cy={40 + seeded(i + 340) * 176}
              r={0.6 + seeded(i + 380) * 1.2}
              fill="#9b6f3f"
              opacity={0.18 + seeded(i + 420) * 0.25}
            />
          ))}
          <text x="26" y="212" fontSize="8" fontWeight="700" letterSpacing="2.2" fill={BF.ink} opacity="0.42" style={{ fontFamily: "var(--nf-body), sans-serif" }}>
            DEPT. OF FRIENDSHIP
          </text>
        </svg>

        <div className="absolute left-1/2 top-[18%] w-[72%] -translate-x-1/2 -rotate-[1.5deg] rounded-[3px] bg-[#f6eddd] px-3 pb-2.5 pt-2 text-center shadow-[0_3px_8px_rgba(31,61,54,0.22)]">
          <Tape className="absolute -left-3 -top-2 w-12 -rotate-[28deg]" color="rgba(217,83,79,0.45)" />
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#1f3d36]/55">Case file · No. 001</p>
          <p className="mt-1 truncate font-display text-[length:min(1.55rem,7.4cqw)] leading-tight text-[#1f3d36]">
            <span className="text-[0.62em] italic text-[#1f3d36]/70">The </span>
            {to} &amp; {from}
          </p>
          <p className="-mt-0.5 font-hand text-[length:min(1.6rem,7.6cqw)] leading-none text-[#2bb39a]">files</p>
        </div>

        <SecretStamp className="absolute bottom-[6%] right-[4%] w-[54%] rotate-[-8deg] mix-blend-multiply" />
      </motion.div>
    </div>
  );
}

/** The opening screen: who it's for, the closed folder and the hint. With `onOpen` the folder is a button. */
export function CaseFileGate({
  to,
  from,
  open = false,
  onOpen,
  hint = "Tap to open",
}: {
  to: string;
  from: string;
  open?: boolean;
  onOpen?: () => void;
  hint?: string;
}) {
  const folderBox = "mt-[4cqh] w-[min(78cqw,44cqh)] max-w-[320px]";
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-[#1f3d36]">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#1f3d36]/60">Strictly for the eyes of</p>
      <h1 className="mt-2 max-w-full truncate font-display text-5xl leading-tight text-[#1f3d36]">{to}</h1>
      {onOpen ? (
        <motion.button
          type="button"
          onClick={onOpen}
          aria-label="Open the case file"
          animate={open ? { y: 0, rotate: 0 } : { y: [0, -6, 0], rotate: [0, -1, 0.6, 0] }}
          transition={open ? { duration: 0.3 } : { repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
          whileTap={{ scale: 0.97 }}
          className={`${folderBox} outline-none`}
        >
          <CaseFolder to={to} from={from} open={open} />
        </motion.button>
      ) : (
        <div className={folderBox}>
          <CaseFolder to={to} from={from} />
        </div>
      )}
      <p className="mt-[4cqh] h-8 font-hand text-[1.7rem] leading-8 text-[#1f3d36]/75" aria-live="polite">
        {hint}
      </p>
    </div>
  );
}

/* ---------------- certificate seal ---------------- */

function scallop(cx: number, cy: number, r: number, bump: number, n: number): string {
  const pt = (radius: number, a: number) => `${(cx + radius * Math.cos(a)).toFixed(2)} ${(cy + radius * Math.sin(a)).toFixed(2)}`;
  let d = `M${pt(r, 0)}`;
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2;
    const a1 = ((i + 1) / n) * Math.PI * 2;
    d += ` Q${pt(r + bump, (a0 + a1) / 2)} ${pt(r, a1)}`;
  }
  return `${d} Z`;
}

const SEAL_EDGE = scallop(60, 54, 40, 10, 22);

/** Rosette seal with ribbons for the Certificate of Best Friendship. */
export function FriendSeal({ className = "" }: { className?: string }) {
  const id = svgId(useId());
  return (
    <svg viewBox="0 0 120 140" aria-hidden className={className}>
      <defs>
        <path id={`${id}-arc`} d="M60 54 m-30 0 a30 30 0 1 1 60 0 a30 30 0 1 1 -60 0" />
      </defs>
      <path d="M44 82 L30 132 L41 125 L49 137 L58 90 Z" fill={BF.red} />
      <path d="M76 82 L90 132 L79 125 L71 137 L62 90 Z" fill="#bf3f3b" />
      <path d={SEAL_EDGE} fill={BF.accent} />
      <circle cx="60" cy="54" r="38" fill="none" stroke={BF.paper} strokeWidth="1" strokeDasharray="2 2.6" opacity="0.85" />
      <circle cx="60" cy="54" r="23" fill="#219983" stroke={BF.paper} strokeWidth="1.2" />
      <text fontSize="7.4" fontWeight="800" fill={BF.paper} style={{ fontFamily: "var(--nf-body), sans-serif" }}>
        <textPath href={`#${id}-arc`} textLength="184" lengthAdjust="spacingAndGlyphs">
          BEST FRIENDS · VALID FOREVER ·
        </textPath>
      </text>
      <path d="M60 37.5l2.1 4.4 4.8.6-3.5 3.3.9 4.7L60 48.2l-4.3 2.3.9-4.7-3.5-3.3 4.8-.6z" fill="#ffd35c" />
      <text x="60" y="66" textAnchor="middle" fontSize="13" fontWeight="800" letterSpacing="1" fill={BF.paper} style={{ fontFamily: "var(--nf-display), serif" }}>
        BFF
      </text>
    </svg>
  );
}
