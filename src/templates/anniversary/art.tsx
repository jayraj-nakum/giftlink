"use client";

import { motion } from "motion/react";
import { useId } from "react";
import { seeded } from "../shared/ui";

export const GOLD = "#e8c27a";
export const GOLD_DEEP = "#c9a24a";
export const CREAM = "#f7efe0";
export const NAVY = "#0f1630";
export const GOLD_CONFETTI = ["#e8c27a", "#fff3d6", "#c9a24a"];

/** Classes for the gold outline button, shared so the cover matches the live button exactly. */
export const GOLD_OUTLINE_BUTTON =
  "border border-[#e8c27a]/70 bg-[#e8c27a]/10 uppercase tracking-[0.28em] text-[#f6dcaa] backdrop-blur-sm";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** "2019-01-12" → "12 January 2019". Pure string work, so it renders the same on the server and in the browser. */
export function formatLongDate(value: string): string {
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d || m > 12) return value;
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

const svgId = (raw: string) => raw.replace(/[^\w-]/g, "");

/** Midnight-navy backdrop with drifting gold dust and a thin gold frame. */
export function AnniversaryBackground({ children }: { children?: React.ReactNode }) {
  return (
    <div
      className="absolute inset-0 text-[#f7efe0]"
      style={{
        backgroundColor: NAVY,
        backgroundImage:
          "radial-gradient(90% 55% at 50% 0%, rgba(232,194,122,0.13) 0%, rgba(232,194,122,0) 70%), linear-gradient(180deg, #1c2547 0%, #141c3b 48%, #0f1630 100%)",
      }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {Array.from({ length: 30 }, (_, i) => {
          const size = 1 + seeded(i + 7) * 2;
          return (
            <span
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${seeded(i + 40) * 100}%`,
                top: `${seeded(i + 80) * 100}%`,
                width: size,
                height: size,
                background: GOLD,
                boxShadow: `0 0 ${size * 3}px rgba(232,194,122,0.7)`,
                animation: `twinkle ${3 + seeded(i + 120) * 4}s ease-in-out ${-seeded(i + 160) * 6}s infinite alternate`,
              }}
            />
          );
        })}
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-3 rounded-[3px] border border-[#e8c27a]/15" />
      <div aria-hidden className="pointer-events-none absolute inset-[18px] rounded-[2px] border border-[#e8c27a]/[0.07]" />
      {children}
    </div>
  );
}

/** Thin gold rule with a diamond in the middle. */
export function GoldDivider({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 14" aria-hidden className={`w-40 ${className}`}>
      <g stroke={GOLD} fill="none">
        <path d="M6 7 H64 M96 7 H154" strokeWidth="0.8" opacity="0.75" />
        <path d="M80 1.5 L85.5 7 L80 12.5 L74.5 7 Z" strokeWidth="0.9" />
      </g>
      <circle cx="80" cy="7" r="1.5" fill={GOLD} />
      <circle cx="69" cy="7" r="1" fill={GOLD} />
      <circle cx="91" cy="7" r="1" fill={GOLD} />
    </svg>
  );
}

function RingLine({ cx, cy, r, delay, animated }: { cx: number; cy: number; r: number; delay: number; animated: boolean }) {
  if (!animated) return <circle cx={cx} cy={cy} r={r} />;
  return (
    <motion.circle
      cx={cx}
      cy={cy}
      r={r}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ pathLength: { duration: 1.6, delay, ease: "easeInOut" }, opacity: { duration: 0.2, delay } }}
    />
  );
}

function Sparkle({ x, y, s, delay }: { x: number; y: number; s: number; delay: number }) {
  return (
    <path
      d={`M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s} Z`}
      fill={GOLD}
      style={{ animation: `twinkle 2.6s ease-in-out ${delay}s infinite alternate` }}
    />
  );
}

/**
 * Two interlocking rings in thin gold line art, with a small diamond.
 * `animated` draws them in; without it (the cover) they are simply there.
 */
export function GoldRings({ animated = false, className = "" }: { animated?: boolean; className?: string }) {
  const id = svgId(useId());
  // Ring A passes over B at the top crossing, B passes over A at the bottom one.
  const arcOfAOverB = "M83.15 61.36 A37 37 0 0 1 109.38 78.39";
  const arcOfBOverA = "M115.58 134.44 A37 37 0 0 1 89.96 116.5";
  return (
    <svg viewBox="0 0 200 170" aria-hidden className={`overflow-visible ${className}`}>
      <defs>
        <mask id={`${id}-a`} maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="170">
          <rect width="200" height="170" fill="#fff" />
          <path d={arcOfBOverA} stroke="#000" strokeWidth="12" fill="none" />
        </mask>
        <mask id={`${id}-b`} maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="170">
          <rect width="200" height="170" fill="#fff" />
          <path d={arcOfAOverB} stroke="#000" strokeWidth="12" fill="none" />
        </mask>
        <filter id={`${id}-glow`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g fill="none" stroke={GOLD} strokeWidth="1.5" filter={`url(#${id}-glow)`}>
        <g mask={`url(#${id}-a)`}>
          <RingLine cx={78} cy={98} r={40} delay={0} animated={animated} />
          <RingLine cx={78} cy={98} r={34} delay={0.15} animated={animated} />
        </g>
        <g mask={`url(#${id}-b)`}>
          <RingLine cx={122} cy={98} r={40} delay={0.55} animated={animated} />
          <RingLine cx={122} cy={98} r={34} delay={0.7} animated={animated} />
        </g>
        <motion.g
          strokeWidth="1.2"
          strokeLinejoin="round"
          initial={animated ? { opacity: 0, y: -6 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.7, duration: 0.8, ease: "easeOut" }}
        >
          <path d="M110 46 L115 40 L129 40 L134 46 L122 58 Z" fill="rgba(232,194,122,0.12)" />
          <path d="M110 46 H134 M119 46 L122 40 L125 46 M115 40 L119 46 L122 58 L125 46 L129 40" strokeWidth="0.8" />
        </motion.g>
      </g>
      <Sparkle x={146} y={32} s={6} delay={0} />
      <Sparkle x={98} y={34} s={3.5} delay={-1.2} />
      <Sparkle x={160} y={60} s={3} delay={-0.6} />
    </svg>
  );
}

/** The opening screen: rings, both names, the date it began and the call to begin. */
export function StoryGate({
  to,
  from,
  since,
  action,
  animated = false,
}: {
  to: string;
  from: string;
  since?: string;
  action: React.ReactNode;
  animated?: boolean;
}) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
      <GoldRings animated={animated} className="h-[min(8.5rem,18cqh)] w-auto" />
      <p className="mt-[3.5cqh] text-[11px] font-semibold uppercase tracking-[0.42em] text-[#e8c27a]/80">The story of</p>
      <h1
        className="mt-3 w-full font-display text-[2.7rem] leading-[1.12] text-[#e8c27a]"
        style={{ textShadow: "0 0 28px rgba(232,194,122,0.28)" }}
      >
        <span className="block truncate pb-0.5">{to}</span>
        <span className="block text-2xl italic text-[#f7efe0]/65">&amp;</span>
        <span className="block truncate pb-0.5">{from}</span>
      </h1>
      <GoldDivider className="mt-4" />
      {since ? (
        <p className="mt-3 text-xs uppercase tracking-[0.3em] text-[#f7efe0]/60">Since {formatLongDate(since)}</p>
      ) : null}
      {action}
      <p className="mt-5 text-xs text-[#f7efe0]/45">Sound on for the full effect</p>
    </div>
  );
}
