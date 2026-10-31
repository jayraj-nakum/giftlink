"use client";

import type { CSSProperties, ReactNode } from "react";
import { seeded } from "../shared/ui";

export const INK = "#3d2c1e";
export const ACCENT = "#ff7a59";
/** A deeper coral for filled buttons, so white text on it stays readable. */
export const ACCENT_DEEP = "#e8552f";

/** Seed of the first scramble. The cover and the opening screen show the same one. */
export const FIRST_SEED = 3;
export const seedForRound = (round: number) => FIRST_SEED + round * 7;

/** Soft "sunny photo" shown until the maker uploads a picture. */
const PLACEHOLDER =
  "radial-gradient(circle at 70% 30%, #fff6c9 0 10%, rgba(255,246,201,0) 10.5%), " +
  "linear-gradient(195deg, #ffd6a5 0%, #ffae86 42%, #f78fb3 72%, #b49cff 100%)";

/** CSS background-image for the puzzle photo (or a gentle gradient while there is none yet). */
export function photoBackground(url?: string): string {
  return url ? `url(${JSON.stringify(url)})` : PLACEHOLDER;
}

/** Reads the first photo's url/caption from loosely typed data (covers get unvalidated data). */
export function firstPhoto(photos: unknown): { url?: string; caption?: string } {
  if (!Array.isArray(photos) || !photos[0] || typeof photos[0] !== "object") return {};
  const p = photos[0] as { url?: unknown; caption?: unknown };
  return {
    url: typeof p.url === "string" && p.url ? p.url : undefined,
    caption: typeof p.caption === "string" && p.caption.trim() ? p.caption.trim() : undefined,
  };
}

/**
 * A deterministic 3×3 shuffle. order[slot] = the piece sitting in that slot.
 * Never solved, and at least 7 of 9 pieces start out of place.
 */
export function scramble(seed: number): number[] {
  for (let attempt = 0; attempt < 40; attempt++) {
    const order = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(seeded(seed * 131 + attempt * 17 + i) * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    if (order.filter((piece, slot) => piece !== slot).length >= 7) return order;
  }
  return [4, 8, 6, 0, 2, 7, 1, 5, 3];
}

export const isSolved = (order: number[]) => order.every((piece, slot) => piece === slot);

/** Sunny paper backdrop with a few loose jigsaw pieces around the edges. */
export function PuzzleBackground({ children }: { children?: ReactNode }) {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ color: INK, background: "linear-gradient(172deg, #fff4d6 0%, #ffe8c2 48%, #ffd6a5 100%)" }}
    >
      <SunRays />
      <LoosePieces />
      {children}
    </div>
  );
}

function SunRays() {
  return (
    <svg
      aria-hidden
      viewBox="-100 -100 200 200"
      className="pointer-events-none absolute -right-[min(38cqw,20cqh)] -top-[min(38cqw,20cqh)] h-[min(110cqw,58cqh)] w-[min(110cqw,58cqh)] opacity-60"
    >
      <defs>
        <radialGradient id="puzzle-sun">
          <stop offset="0" stopColor="#fffbe8" />
          <stop offset="1" stopColor="#fffbe8" stopOpacity="0" />
        </radialGradient>
      </defs>
      {Array.from({ length: 18 }, (_, i) => (
        <path key={i} d="M-5 -16 L0 -100 L5 -16 Z" fill="#fff8e1" opacity="0.7" transform={`rotate(${i * 20})`} />
      ))}
      <circle r="44" fill="url(#puzzle-sun)" />
    </svg>
  );
}

const PIECES = [
  { left: "5%", top: "6%", size: 12, rotate: -18, color: "#ffb38a" },
  { left: "83%", top: "17%", size: 9, rotate: 26, color: "#ffd166" },
  { left: "-3%", top: "40%", size: 11, rotate: 34, color: "#ffc6d3" },
  { left: "88%", top: "48%", size: 8, rotate: -40, color: "#9fd8cb" },
  { left: "86%", top: "78%", size: 12, rotate: 14, color: "#ffb38a" },
  { left: "3%", top: "80%", size: 9, rotate: -28, color: "#ffd166" },
  { left: "40%", top: "94%", size: 7, rotate: 40, color: "#c9b6ff" },
];

function LoosePieces() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {PIECES.map((p, i) => (
        <span
          key={i}
          className="absolute block"
          style={{
            left: p.left,
            top: p.top,
            width: `min(${p.size}cqw, ${p.size * 0.55}cqh)`,
            animation: `sway ${4 + seeded(i + 21) * 3}s ease-in-out ${-seeded(i + 5) * 4}s infinite alternate`,
          }}
        >
          <JigsawPiece color={p.color} style={{ transform: `rotate(${p.rotate}deg)`, opacity: 0.75 }} />
        </span>
      ))}
    </div>
  );
}

/** One classic jigsaw piece (two tabs out, two blanks in). */
export function JigsawPiece({
  color,
  className = "",
  style,
}: {
  color: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg viewBox="2 2 100 100" className={`block w-full ${className}`} style={style} aria-hidden>
      <path
        d="M20 28 H40 C34 20 42 8 50 8 C58 8 66 20 60 28 H80 V48 C88 40 100 48 100 58 C100 68 88 76 80 68 V88 H60 C66 80 58 70 50 70 C42 70 34 80 40 88 H20 V68 C28 76 36 68 36 58 C36 48 28 40 20 48 Z"
        fill={color}
        stroke="#ffffff"
        strokeOpacity="0.7"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M26 34 H44" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

/** The tray the tiles sit in. Children go in the recessed well. */
export function BoardFrame({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative rounded-[22px] p-[clamp(8px,2.6cqw,14px)]"
      style={{
        background: "linear-gradient(150deg, #ffffff 0%, #fff2dd 100%)",
        boxShadow:
          "0 24px 46px -20px rgba(150,70,20,0.5), inset 0 2px 0 rgba(255,255,255,0.9), 0 0 0 1px rgba(61,44,30,0.06)",
      }}
    >
      <div
        className="relative rounded-[14px] p-[clamp(3px,1.3cqw,6px)]"
        style={{ background: "#f1dcbd", boxShadow: "inset 0 2px 7px rgba(61,44,30,0.22)" }}
      >
        {children}
      </div>
      <span className="pointer-events-none absolute -left-[min(4cqw,18px)] -top-[min(4cqw,18px)] w-[min(12cqw,52px)]">
        <JigsawPiece color={ACCENT} style={{ transform: "rotate(-16deg)" }} />
      </span>
      <span className="pointer-events-none absolute -bottom-[min(3.5cqw,16px)] -right-[min(3.5cqw,16px)] w-[min(10cqw,44px)]">
        <JigsawPiece color="#ffc94d" style={{ transform: "rotate(22deg)" }} />
      </span>
    </div>
  );
}

/** Gap between tiles while the puzzle is unsolved. */
export const TILE_GAP = "clamp(3px, 1.3cqw, 6px)";

/** The slice of the photo that belongs to `piece`, drawn inside a tile. */
export function TileFace({ piece, background }: { piece: number; background: string }) {
  const row = Math.floor(piece / 3);
  const col = piece % 3;
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute block h-[300%] w-[300%]"
      style={{
        left: `${-col * 100}%`,
        top: `${-row * 100}%`,
        backgroundImage: background,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    />
  );
}

/** A non-interactive scrambled board, for the opening screen and the cover. */
export function StaticBoard({ order, background }: { order: number[]; background: string }) {
  return (
    <BoardFrame>
      <div className="grid grid-cols-3" style={{ gap: TILE_GAP }}>
        {order.map((piece) => (
          <span
            key={piece}
            className="relative block aspect-square overflow-hidden rounded-[10px]"
            style={{ boxShadow: "0 3px 8px rgba(61,44,30,0.22)" }}
          >
            <TileFace piece={piece} background={background} />
            <span className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent" />
          </span>
        ))}
      </div>
    </BoardFrame>
  );
}

/** The opening card: who it's for, the scrambled photo and a call to action. */
export function PuzzleGate({
  to,
  from,
  photoUrl,
  action,
}: {
  to: string;
  from: string;
  photoUrl?: string;
  action: ReactNode;
}) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] opacity-70">A puzzle for</p>
      <h1 className="mt-2 max-w-full truncate font-display text-5xl leading-tight">{to}</h1>
      <p className="mt-1 max-w-full truncate font-hand text-2xl" style={{ color: ACCENT_DEEP }}>
        from {from}
      </p>
      <div className="mt-8 w-[min(72cqw,44cqh)] max-w-[360px]">
        <StaticBoard order={scramble(FIRST_SEED)} background={photoBackground(photoUrl)} />
      </div>
      {action}
      <p className="mt-4 text-sm opacity-70">Solve it to unlock a secret note</p>
    </div>
  );
}

/** Filled primary button look, added on top of StageButton's base classes. */
export const primaryButtonClass = "text-white";
/** StageButton's own base classes, for the cover's static copy of the button. */
export const stageButtonLook = "inline-block rounded-full px-7 py-3.5 text-base font-semibold shadow-lg shadow-black/20";
export const primaryButtonStyle: CSSProperties = {
  background: `linear-gradient(180deg, ${ACCENT} 0%, ${ACCENT_DEEP} 100%)`,
  boxShadow: "0 12px 24px -10px rgba(232,85,47,0.7)",
};

/** Washi tape strip for the note card and the finished print. */
export function Tape({ className = "", color = "#ffd166" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 120 32" className={`pointer-events-none ${className}`} aria-hidden>
      <path
        d="M4 2 L116 2 L112 8 L117 14 L112 20 L117 26 L114 30 L4 30 L8 24 L3 18 L8 12 L3 6 Z"
        fill={color}
        opacity="0.82"
      />
      <path d="M10 9 H108" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="3" strokeDasharray="6 6" />
    </svg>
  );
}

/** Small padlock. `open` lifts the shackle. */
export function Padlock({ open, className = "" }: { open: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 64 72" className={className} aria-hidden>
      <g
        style={{
          transform: open ? "translateY(-9px) rotate(-24deg)" : "none",
          transformBox: "fill-box",
          transformOrigin: "100% 100%",
          transition: "transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <path d="M18 34 V22 a14 14 0 0 1 28 0 V34" fill="none" stroke="#b9a48b" strokeWidth="7" strokeLinecap="round" />
      </g>
      <rect x="8" y="32" width="48" height="36" rx="10" fill={ACCENT} />
      <rect x="8" y="32" width="48" height="10" rx="5" fill="#ffffff" opacity="0.18" />
      <circle cx="32" cy="48" r="5" fill={INK} />
      <path d="M30 50 H34 L35 59 H29 Z" fill={INK} />
    </svg>
  );
}
