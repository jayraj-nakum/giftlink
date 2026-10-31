"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId, type ReactNode } from "react";
import { seeded } from "../shared/ui";

export const MARIGOLD = "#ffb627";
export const SAFFRON = "#ff7b25";
export const CREAM = "#fff3c4";
export const PINK = "#ff4f8b";
export const TEAL = "#2ec4b6";
export const PLUM = "#3b0f3f";
export const FIREWORKS = [MARIGOLD, SAFFRON, CREAM, PINK];
export const TEXT_GLOW = "0 0 26px rgba(255,182,39,0.55)";

const DIYA_COUNT = 5;
export const UNLIT: readonly boolean[] = Array.from({ length: DIYA_COUNT }, () => false);

/** Safe for url(#id) references, whatever format React's ids use. */
function useSvgId(): string {
  return useId().replace(/[^a-zA-Z0-9_-]/g, "");
}

const NIGHT = "radial-gradient(130% 85% at 50% 0%, #3b0f3f 0%, #2a0c3a 45%, #1a0b2e 100%)";
const WARM =
  "radial-gradient(110% 65% at 50% 100%, rgba(255,123,37,0.5) 0%, rgba(255,182,39,0.2) 45%, rgba(255,182,39,0) 75%), " +
  "linear-gradient(to bottom, rgba(90,20,60,0) 0%, rgba(130,40,40,0.35) 100%)";

/**
 * Night-sky backdrop. `warmth` (0 to 1) fills it with lamp light as the diyas are lit.
 * `lanterns` shows the hanging akash kandils from the opening screen.
 */
export function DiwaliBackground({
  warmth = 0,
  lanterns = false,
  children,
}: {
  warmth?: number;
  lanterns?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden text-white" style={{ background: NIGHT }}>
      <div className="stars" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-[1400ms] ease-out"
        style={{ opacity: warmth, background: WARM }}
      />
      <Skyline warmth={warmth} />
      <AnimatePresence initial={false}>
        {lanterns && (
          <motion.div
            key="lanterns"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-18cqh" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="pointer-events-none absolute inset-0"
          >
            <HangingLanterns />
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </div>
  );
}

/* ---------------- town skyline ---------------- */

const WINDOWS = [
  [27, 48], [62, 40], [74, 40], [110, 52], [152, 40], [168, 40], [200, 46], [242, 48], [256, 48], [290, 44], [312, 58], [350, 40], [370, 62],
];
const ROOF_LIGHTS = Array.from({ length: 30 }, (_, i) => 6 + i * 13.2);

/** A row of rooftops along the bottom. Tiled (alternate copies mirrored) so wide screens keep its shape. */
function Skyline({ warmth }: { warmth: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 flex h-[11cqh] justify-center overflow-hidden">
      {[-2, -1, 0, 1, 2].map((k) => (
        <svg
          key={k}
          viewBox="0 0 400 80"
          className="block aspect-[5/1] h-full w-auto shrink-0"
          style={k % 2 ? { transform: "scaleX(-1)" } : undefined}
        >
          <path
            d="M0 80 V52 H22 V42 H40 V56 H56 V34 L68 25 L80 34 V50 H102 V46 H124 V58 H144 V32 C144 18 176 18 176 32 V54 H194 V40 H214 V50 H234 V42 L249 31 L264 42 V58 H284 V38 H306 V54 H326 V46 H344 V32 H364 V56 H384 V48 H400 V80 Z"
            fill="#12061f"
          />
          <path d="M160 18 V8" stroke="#12061f" strokeWidth="2.5" />
          <circle cx="160" cy="7" r="2.4" fill="#12061f" />
          {WINDOWS.map(([x, y], i) => (
            <rect
              key={i}
              x={x}
              y={y}
              width="5"
              height="6"
              rx="1"
              fill={MARIGOLD}
              style={{ opacity: 0.18 + warmth * 0.72, transition: "opacity 1.2s ease-out" }}
            />
          ))}
          {ROOF_LIGHTS.map((x, i) => (
            <circle
              key={i}
              cx={x}
              cy={70 + (i % 2) * 1.5}
              r="1.3"
              fill={i % 3 === 0 ? PINK : CREAM}
              style={{ opacity: warmth * (0.55 + seeded(i + 3) * 0.45), transition: `opacity 1s ease-out ${i * 25}ms` }}
            />
          ))}
        </svg>
      ))}
    </div>
  );
}

/* ---------------- akash kandil (hanging lanterns) ---------------- */

const LANTERN_PALETTES = [
  { edge: "#c2410c", mid: MARIGOLD, accent: PINK, tassels: [MARIGOLD, PINK, SAFFRON] },
  { edge: "#9d174d", mid: PINK, accent: MARIGOLD, tassels: [PINK, MARIGOLD, TEAL] },
  { edge: "#0f766e", mid: TEAL, accent: MARIGOLD, tassels: [TEAL, MARIGOLD, PINK] },
];

const TASSELS = [
  { x: 34, bend: -4, end: 134 },
  { x: 37, bend: -2, end: 145 },
  { x: 40, bend: 0, end: 139 },
  { x: 43, bend: 2, end: 146 },
  { x: 46, bend: 4, end: 132 },
];

/** A traditional hexagonal paper lantern with a glowing cut-out and tassels. */
export function Lantern({ palette = 0 }: { palette?: number }) {
  const id = useSvgId();
  const p = LANTERN_PALETTES[palette % LANTERN_PALETTES.length];
  return (
    <svg viewBox="0 0 80 150" className="block w-full overflow-visible" aria-hidden>
      <defs>
        <linearGradient id={`${id}-body`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={p.edge} />
          <stop offset="0.5" stopColor={p.mid} />
          <stop offset="1" stopColor={p.edge} />
        </linearGradient>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0" stopColor="#ffd56b" stopOpacity="0.5" />
          <stop offset="1" stopColor="#ffd56b" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="40" cy="52" r="44" fill={`url(#${id}-glow)`} />
      <path d="M40 0 V16" stroke="#ffd98a" strokeOpacity="0.7" strokeWidth="1.4" />
      <path d="M33 16 H47 L51 22 H29 Z" fill={MARIGOLD} />
      <path
        d="M27 22 H53 L68 52 L53 82 H27 L12 52 Z"
        fill={`url(#${id}-body)`}
        stroke="#ffd56b"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M27 22 V82 M53 22 V82" stroke="#ffe7a8" strokeOpacity="0.55" strokeWidth="1.2" />
      <path d="M27 29 H53 M27 75 H53" stroke="#ffe7a8" strokeWidth="1.5" strokeDasharray="2 2.6" />
      <path d="M40 36 L50 52 L40 68 L30 52 Z" fill={CREAM} opacity="0.95" />
      <path d="M40 41 L46.5 52 L40 63 L33.5 52 Z" fill={p.accent} />
      <circle cx="40" cy="52" r="2.6" fill={CREAM} />
      <circle cx="19.5" cy="52" r="2.2" fill={CREAM} opacity="0.85" />
      <circle cx="60.5" cy="52" r="2.2" fill={CREAM} opacity="0.85" />
      <path d="M30 82 H50 L46 89 H34 Z" fill={MARIGOLD} />
      {TASSELS.map((t, i) => (
        <g key={i}>
          <path
            d={`M${t.x} 89 C ${t.x + t.bend} 104, ${t.x + t.bend * 2} 118, ${t.x + t.bend * 1.5} ${t.end}`}
            stroke={p.tassels[i % p.tassels.length]}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx={t.x + t.bend * 1.5} cy={t.end + 2.5} r="2.2" fill={p.tassels[(i + 1) % p.tassels.length]} />
        </g>
      ))}
      <path d="M12 52 C 9 60, 12 66, 9 74" stroke={p.tassels[0]} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <circle cx="9" cy="76.5" r="2.2" fill={p.tassels[1]} />
      <path d="M68 52 C 71 60, 68 66, 71 74" stroke={p.tassels[0]} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <circle cx="71" cy="76.5" r="2.2" fill={p.tassels[1]} />
    </svg>
  );
}

const HANGING = [
  { left: "3%", drop: 4, width: 19, palette: 0, duration: 4.4, delay: 0 },
  { left: "57%", drop: 0, width: 11, palette: 2, duration: 3.8, delay: -1.1 },
  { left: "78%", drop: 3, width: 19, palette: 1, duration: 5.2, delay: -2.3 },
];

/** Three lanterns hanging from the top edge, swaying gently. */
export function HangingLanterns() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {HANGING.map((l, i) => (
        <div
          key={i}
          className="absolute top-0 flex flex-col items-center"
          style={{
            left: l.left,
            width: `min(${l.width}cqw, ${l.width * 0.68}cqh)`,
            transformOrigin: "50% 0",
            animation: `sway ${l.duration}s ease-in-out ${l.delay}s infinite alternate`,
          }}
        >
          <span className="block w-[1.4px] bg-[#ffd98a]/60" style={{ height: `${l.drop}cqh` }} />
          <Lantern palette={l.palette} />
        </div>
      ))}
    </div>
  );
}

/* ---------------- diya ---------------- */

/** A clay oil lamp. The flame grows in when `lit` and flickers with the shared `.flame` class. */
export function Diya({ lit }: { lit: boolean }) {
  const id = useSvgId();
  return (
    <svg viewBox="0 0 100 80" className="block w-full overflow-visible" aria-hidden>
      <defs>
        <linearGradient id={`${id}-clay`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#d9652c" />
          <stop offset="0.55" stopColor="#a63f17" />
          <stop offset="1" stopColor="#6e2410" />
        </linearGradient>
        <linearGradient id={`${id}-flame`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#ffd56b" />
          <stop offset="0.6" stopColor={MARIGOLD} />
          <stop offset="1" stopColor={SAFFRON} />
        </linearGradient>
        <radialGradient id={`${id}-halo`}>
          <stop offset="0" stopColor="#ffd56b" stopOpacity="0.8" />
          <stop offset="1" stopColor="#ffd56b" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g transform="translate(0 20)">
        <ellipse cx="50" cy="56" rx="17" ry="4" fill="#4a160a" />
        <path d="M5 24 C 7 44, 28 54, 50 54 C 72 54, 93 44, 95 24 Z" fill={`url(#${id}-clay)`} />
        <path
          d="M13 32 C 26 45, 74 45, 87 32"
          fill="none"
          stroke="#ffd56b"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="0 7"
        />
        <path
          d="M22 43 C 36 51, 64 51, 78 43"
          fill="none"
          stroke={CREAM}
          strokeOpacity="0.5"
          strokeWidth="1.6"
          strokeDasharray="3 3"
        />
        <circle cx="50" cy="47.5" r="2.4" fill={PINK} />
        <circle cx="45.5" cy="46" r="1.5" fill={PINK} opacity="0.85" />
        <circle cx="54.5" cy="46" r="1.5" fill={PINK} opacity="0.85" />
        <path
          d="M5 24 C 5 16, 30 13, 50 13 C 70 13, 95 16, 95 24 C 95 31, 70 33, 58 34.5 C 55 35.5, 52 37.5, 50 40 C 48 37.5, 45 35.5, 42 34.5 C 30 33, 5 31, 5 24 Z"
          fill="#e8843f"
        />
        <path d="M12 21 C 24 16, 76 16, 88 21" stroke="#ffc58a" strokeWidth="1.6" fill="none" opacity="0.8" />
        <ellipse cx="50" cy="23.5" rx="38" ry="6.5" fill={lit ? "#7a3510" : "#4a1608"} style={{ transition: "fill 0.6s" }} />
        <ellipse
          cx="45"
          cy="22.4"
          rx="18"
          ry="2.4"
          fill={MARIGOLD}
          style={{ opacity: lit ? 0.55 : 0, transition: "opacity 0.6s" }}
        />
        <path d="M50 38 C 50 35, 49 32.5, 50 29.5" stroke="#2b1408" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      </g>

      <g
        style={{
          opacity: lit ? 1 : 0,
          transform: lit ? "scale(1)" : "scale(0)",
          transformBox: "fill-box",
          transformOrigin: "50% 100%",
          transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s",
        }}
      >
        <circle cx="50" cy="34" r="28" fill={`url(#${id}-halo)`} />
        <g transform="translate(50 49.5) scale(1.35) translate(-50 -49.5)">
        <g className="flame" style={{ transformBox: "fill-box" }}>
          <path
            d="M50 18 C 55.5 26, 59 32.5, 59 38.5 C 59 45, 55 49.5, 50 49.5 C 45 49.5, 41 45, 41 38.5 C 41 32.5, 44.5 26, 50 18 Z"
            fill={`url(#${id}-flame)`}
          />
          <path
            d="M50 26 C 53.5 31, 56 35.5, 56 39.5 C 56 44, 53.3 47, 50 47 C 46.7 47, 44 44, 44 39.5 C 44 35.5, 46.5 31, 50 26 Z"
            fill="#ffe08a"
          />
          <ellipse cx="50" cy="41.5" rx="3" ry="4.6" fill="#fffbe8" />
        </g>
        </g>
      </g>
    </svg>
  );
}

/** How far each diya sits above the baseline, so the row curves like a smile. */
const ARC = [2.6, 1.1, 0, 1.1, 2.6];

/**
 * The row of five diyas. Static (opening screen and cover) unless `onLight` is given.
 * A warm glow grows behind each lit one.
 */
export function DiyaRow({
  lit = UNLIT,
  onLight,
}: {
  lit?: readonly boolean[];
  onLight?: (index: number) => void;
}) {
  return (
    <div className="isolate flex items-end justify-center gap-[1.5cqw]">
      {lit.map((on, i) => {
        const content = (
          <>
            <span
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-[40%] -z-10 block aspect-square w-[320%] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                opacity: on ? 1 : 0,
                transform: on ? "scale(1)" : "scale(0.25)",
                transition: "opacity 0.8s ease-out, transform 1.1s cubic-bezier(0.22, 1, 0.36, 1)",
                background:
                  "radial-gradient(closest-side, rgba(255,196,90,0.6), rgba(255,123,37,0.2) 55%, rgba(255,123,37,0) 100%)",
              }}
            />
            {onLight && !on && (
              <span
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-[52%] -z-10 block h-[60%] w-[60%] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full"
                style={{ background: "radial-gradient(closest-side, rgba(255,182,39,0.35), rgba(255,182,39,0))" }}
              />
            )}
            <Diya lit={on} />
          </>
        );
        const style = { marginBottom: `${ARC[i % ARC.length]}cqh` };
        return onLight ? (
          <button
            key={i}
            type="button"
            onClick={() => onLight(i)}
            aria-label={on ? `Diya ${i + 1} is lit` : `Light diya ${i + 1}`}
            className="relative block w-[16cqw] max-w-[92px] rounded-2xl outline-none focus-visible:ring-4 focus-visible:ring-[#ffb627]/50"
            style={style}
          >
            {content}
          </button>
        ) : (
          <span key={i} className="relative block w-[16cqw] max-w-[92px]" style={style}>
            {content}
          </span>
        );
      })}
    </div>
  );
}

/* ---------------- opening card ---------------- */

/** The opening card: name, a row of unlit diyas and the call to action. */
export function DiwaliGate({ to, from, action }: { to: string; from: string; action: ReactNode }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 pt-[16cqh] text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#ffe2a8]/80">A Diwali wish for</p>
      <h1
        className="mt-2 max-w-full truncate font-display text-5xl leading-tight"
        // A filter glow isn't clipped by truncate's overflow box the way a text-shadow is.
        style={{ color: MARIGOLD, filter: "drop-shadow(0 0 14px rgba(255,182,39,0.5))" }}
      >
        {to}
      </h1>
      <p className="mt-1 max-w-full truncate font-hand text-2xl text-white/80">from {from}</p>
      <div className="mt-10">
        <DiyaRow />
      </div>
      {action}
      <p className="mt-4 text-xs text-white/55">Sound on for the full effect</p>
    </div>
  );
}

/** StageButton's base look, for the cover's static copy of the button. */
export const stageButtonLook = "inline-block rounded-full px-7 py-3.5 text-base font-semibold shadow-lg shadow-black/20";
export const goldButtonStyle = {
  background: `linear-gradient(180deg, #ffc94d 0%, ${MARIGOLD} 100%)`,
  color: PLUM,
  boxShadow: "0 0 28px rgba(255,182,39,0.35), 0 10px 22px -10px rgba(0,0,0,0.6)",
};

/* ---------------- rangoli ---------------- */

const PETAL_OUTER = "M0 -102 C 13 -90, 13 -73, 0 -62 C -13 -73, -13 -90, 0 -102 Z";
const PETAL_OUTER_IN = "M0 -95 C 6.5 -88, 6.5 -78, 0 -70 C -6.5 -78, -6.5 -88, 0 -95 Z";
const PETAL_MID = "M0 -72 C 19 -60, 17 -42, 0 -33 C -17 -42, -19 -60, 0 -72 Z";
const PETAL_INNER = "M0 -46 C 14 -36, 13 -23, 0 -16 C -13 -23, -14 -36, 0 -46 Z";
const PETAL_INNER_IN = "M0 -39 C 6 -33, 6 -26, 0 -21 C -6 -26, -6 -33, 0 -39 Z";

function around(count: number, render: (i: number) => ReactNode, offset = 0) {
  return Array.from({ length: count }, (_, i) => (
    <g key={i} transform={`rotate(${offset + (i * 360) / count})`}>
      {render(i)}
    </g>
  ));
}

/** Drawn outermost first so inner rings sit on top. Each blooms on its own. */
const RANGOLI_LAYERS: ReactNode[] = [
  <g key="marigold">
    {around(16, () => (
      <>
        <path d={PETAL_OUTER} fill={MARIGOLD} />
        <path d={PETAL_OUTER_IN} fill={SAFFRON} />
      </>
    ))}
    {around(16, () => <circle cy="-96" r="2.6" fill={CREAM} />, 11.25)}
    <circle r="56" fill="none" stroke={CREAM} strokeWidth="2.6" strokeLinecap="round" strokeDasharray="0 6.5" />
  </g>,
  <g key="pink">
    {around(12, () => (
      <>
        <path d={PETAL_MID} fill={PINK} />
        <path d="M0 -64 V-42" stroke="#ffd0e0" strokeWidth="1.6" strokeLinecap="round" />
        <circle cy="-66" r="2" fill={CREAM} />
      </>
    ))}
  </g>,
  <g key="teal">
    {around(8, () => (
      <>
        <path d={PETAL_INNER} fill={TEAL} />
        <path d={PETAL_INNER_IN} fill="#a8f0e6" />
      </>
    ), 22.5)}
  </g>,
  <g key="centre">
    <circle r="17" fill={MARIGOLD} />
    <circle r="11" fill={SAFFRON} />
    <circle r="5" fill={CREAM} />
    {around(8, () => <circle cy="-14" r="1.6" fill={CREAM} />)}
  </g>,
];

/**
 * A layered rangoli. Before it blooms only a faint chalk outline and kolam dots show;
 * on `bloom` the rings open from the centre outwards with a twist, then it turns slowly.
 */
export function Rangoli({ bloom }: { bloom: boolean }) {
  return (
    <div className="relative aspect-square w-full">
      <svg
        viewBox="-110 -110 220 220"
        className="absolute inset-0 h-full w-full"
        style={{ opacity: bloom ? 0.25 : 1, transition: "opacity 1s" }}
        aria-hidden
      >
        <circle r="102" fill="none" stroke={CREAM} strokeOpacity="0.18" strokeWidth="1.2" strokeDasharray="3 5" />
        <circle r="64" fill="none" stroke={CREAM} strokeOpacity="0.14" strokeWidth="1.2" strokeDasharray="3 5" />
        <circle r="34" fill="none" stroke={CREAM} strokeOpacity="0.14" strokeWidth="1.2" strokeDasharray="3 5" />
        {[-2, -1, 0, 1, 2].flatMap((row) =>
          [-2, -1, 0, 1, 2].map((col) => (
            <circle key={`${row}:${col}`} cx={col * 26} cy={row * 26} r="1.8" fill={CREAM} opacity="0.3" />
          )),
        )}
      </svg>
      <motion.div
        className="absolute inset-0"
        animate={bloom ? { rotate: 360 } : { rotate: 0 }}
        transition={bloom ? { repeat: Infinity, duration: 90, ease: "linear", delay: 1.8 } : { duration: 0 }}
      >
        {RANGOLI_LAYERS.map((layer, i) => {
          const fromCentre = RANGOLI_LAYERS.length - 1 - i;
          return (
            <motion.div
              key={i}
              className="absolute inset-0"
              initial={false}
              animate={bloom ? { scale: 1, rotate: 0, opacity: 1 } : { scale: 0, rotate: -150, opacity: 0 }}
              transition={{ duration: 1.3, delay: bloom ? fromCentre * 0.22 : 0, ease: [0.16, 1, 0.3, 1] }}
            >
              <svg viewBox="-110 -110 220 220" className="h-full w-full" aria-hidden>
                {layer}
              </svg>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

/* ---------------- fireworks in the sky ---------------- */

const BURSTS = [
  { left: "20%", top: "9%", size: 34, color: MARIGOLD, delay: 0.2, gap: 2.6 },
  { left: "80%", top: "14%", size: 28, color: PINK, delay: 1.1, gap: 3.1 },
  { left: "52%", top: "4%", size: 24, color: CREAM, delay: 2, gap: 2.8 },
];

/** Line-art firework bursts that keep popping in the sky. */
export function SkyBursts() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {BURSTS.map((b, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: b.left,
            top: b.top,
            width: `min(${b.size}cqw, ${b.size * 0.5}cqh)`,
            aspectRatio: "1",
            x: "-50%",
          }}
          initial={{ scale: 0.2, opacity: 0 }}
          animate={{ scale: [0.2, 1, 1.12], opacity: [0, 1, 0] }}
          transition={{ duration: 1.8, delay: b.delay, repeat: Infinity, repeatDelay: b.gap, ease: "easeOut" }}
        >
          <svg viewBox="-50 -50 100 100" className="h-full w-full">
            {Array.from({ length: 16 }, (_, k) => {
              const a = (k / 16) * Math.PI * 2;
              const c = Math.cos(a);
              const s = Math.sin(a);
              return (
                <g key={k}>
                  <line x1={c * 14} y1={s * 14} x2={c * 40} y2={s * 40} stroke={b.color} strokeWidth="2.2" strokeLinecap="round" />
                  <circle cx={c * 46} cy={s * 46} r="2.2" fill={k % 2 ? CREAM : b.color} />
                </g>
              );
            })}
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

/* ---------------- floating sky lanterns (finale) ---------------- */

function SkyLantern() {
  const id = useSvgId();
  return (
    <svg viewBox="0 0 40 60" className="block w-full overflow-visible" aria-hidden>
      <defs>
        <linearGradient id={`${id}-paper`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#ffd98a" />
          <stop offset="1" stopColor={SAFFRON} />
        </linearGradient>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0" stopColor="#ffc46b" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffc46b" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="30" r="30" fill={`url(#${id}-glow)`} />
      <path d="M7 6 H33 L28 46 H12 Z" fill={`url(#${id}-paper)`} />
      <path d="M13 6 L15.5 46 M27 6 L24.5 46 M20 6 V46" stroke="#c2410c" strokeOpacity="0.3" strokeWidth="0.8" />
      <path d="M7 6 H33" stroke={CREAM} strokeWidth="1.6" strokeLinecap="round" />
      <ellipse cx="20" cy="42" rx="5.5" ry="3.4" fill="#fff7d6" />
      <path d="M12 46 H28 L26 50 H14 Z" fill="#7a2e14" />
    </svg>
  );
}

/** Paper sky lanterns drifting up the screen. */
export function FloatingLanterns({ count = 12 }: { count?: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="absolute bottom-[-18cqh] block"
          style={{
            left: `${4 + seeded(i + 13) * 86}%`,
            width: `min(${7 + seeded(i + 29) * 7}cqw, ${4 + seeded(i + 29) * 4}cqh)`,
            opacity: 0.5 + seeded(i + 37) * 0.35,
            animation: `float-up ${14 + seeded(i + 43) * 10}s linear ${-seeded(i + 53) * 22}s infinite`,
          }}
        >
          <span className="block" style={{ animation: `sway ${3 + seeded(i + 61) * 2.5}s ease-in-out infinite alternate` }}>
            <SkyLantern />
          </span>
        </span>
      ))}
    </div>
  );
}

/* ---------------- toran (marigold garland) ---------------- */

function Marigold({ cx, cy, r, color, centre }: { cx: number; cy: number; r: number; color: string; centre: string }) {
  return (
    <g>
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return <circle key={i} cx={cx + Math.cos(a) * r * 0.55} cy={cy + Math.sin(a) * r * 0.55} r={r * 0.5} fill={color} />;
      })}
      <circle cx={cx} cy={cy} r={r * 0.6} fill={centre} />
      <circle cx={cx} cy={cy} r={r * 0.22} fill="#b45309" opacity="0.6" />
    </g>
  );
}

const SWAGS = [0, 1, 2];
const SWAG_STOPS = [0.22, 0.5, 0.78];

/** A marigold-and-mango-leaf garland (toran) for the top of the wishes card. */
export function Toran({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 70" className={`block w-full ${className}`} aria-hidden>
      <path d="M0 8 Q 50 48, 100 8 Q 150 48, 200 8 Q 250 48, 300 8" fill="none" stroke="#b45309" strokeWidth="1.6" />
      {SWAGS.map((k) => (
        <g key={`leaves-${k}`}>
          {[-26, 0, 26].map((angle) => (
            <g key={angle} transform={`translate(${100 * k + 50} 30) rotate(${angle})`}>
              <path d="M0 0 C 7 10, 7 24, 0 34 C -7 24, -7 10, 0 0 Z" fill="#2f8f4e" />
              <path d="M0 3 V31" stroke="#86d39b" strokeWidth="1" />
            </g>
          ))}
        </g>
      ))}
      {SWAGS.flatMap((k) =>
        SWAG_STOPS.map((t, j) => (
          <Marigold
            key={`${k}-${j}`}
            cx={100 * k + 100 * t}
            cy={8 + 80 * t * (1 - t)}
            r={j === 1 ? 10.5 : 8.5}
            color={j === 1 ? SAFFRON : MARIGOLD}
            centre={j === 1 ? "#ffa94d" : "#ffd56b"}
          />
        )),
      )}
      {[0, 100, 200, 300].map((x) => (
        <Marigold key={`top-${x}`} cx={x} cy={8} r={9} color={PINK} centre="#ff8fb1" />
      ))}
    </svg>
  );
}
