"use client";

import { useEffect, useState } from "react";

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

/** Holds the gift until `target`. Calls onDone when the time comes. */
export function Countdown({
  target,
  title,
  onDone,
  onSkip,
}: {
  target: number;
  title: string;
  onDone: () => void;
  /** Only offered in previews, so the maker can see the rest. */
  onSkip?: () => void;
}) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => {
      const t = Date.now();
      setNow(t);
      if (t >= target) onDone();
    };
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [target, onDone]);

  const p = parts(now === null ? target : target - now);
  const units: [number, string][] = [
    ...(p.d > 0 ? ([[p.d, "days"]] as [number, string][]) : []),
    [p.h, "hrs"],
    [p.m, "min"],
    [p.s, "sec"],
  ];

  return (
    <div className="flex flex-col items-center text-white">
      <div className="text-6xl" aria-hidden>
        🎁
      </div>
      <p className="mt-6 max-w-xs font-display text-2xl leading-snug">{title}</p>
      <div className="mt-6 flex gap-3" aria-live="polite">
        {units.map(([value, label]) => (
          <div key={label} className="w-[4.5rem] rounded-2xl bg-white/10 py-3 backdrop-blur">
            <div className="font-display text-3xl tabular-nums">{String(value).padStart(2, "0")}</div>
            <div className="text-xs uppercase tracking-widest text-white/60">{label}</div>
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm text-white/60">It opens at 12:00 am. Keep this link safe.</p>
      {onSkip && (
        <button type="button" onClick={onSkip} className="mt-8 rounded-full border border-white/30 px-5 py-2 text-sm text-white/80">
          Skip countdown (preview only)
        </button>
      )}
    </div>
  );
}
