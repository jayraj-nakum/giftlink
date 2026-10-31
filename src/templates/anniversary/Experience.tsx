"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { SOFT_ARPEGGIO } from "../shared/audio";
import { LetterReveal } from "../shared/LetterReveal";
import { Scene, StageButton, type ExperienceProps } from "../shared/ui";
import { localMidnightOf, type Photo } from "../types";
import {
  AnniversaryBackground,
  GOLD_CONFETTI,
  GOLD_OUTLINE_BUTTON,
  GoldDivider,
  GoldRings,
  StoryGate,
  formatLongDate,
} from "./art";
import type { AnniversaryData } from "./definition";

type SceneId = "gate" | "counter" | "timeline" | "letter" | "finale";

const EYEBROW = "text-[11px] font-semibold uppercase tracking-[0.42em] text-[#e8c27a]/80";
const GOLD_FILLED_BUTTON = "bg-[#e8c27a] text-[#0f1630]";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
const plural = (n: number, word: string) => `${word}${n === 1 ? "" : "s"}`;

interface Elapsed {
  days: number;
  years: number;
  months: number;
  rest: number;
  /** Today is the exact anniversary of the start date. */
  exact: boolean;
}

/** Time since the start date, in local calendar terms. Runs in a state initializer, never in render. */
function elapsedSince(since: string): Elapsed {
  const start = localMidnightOf(since);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.max(0, Math.round((today.getTime() - start.getTime()) / 86_400_000));

  let years = today.getFullYear() - start.getFullYear();
  let months = today.getMonth() - start.getMonth();
  let rest = today.getDate() - start.getDate();
  if (rest < 0) {
    months -= 1;
    rest += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years < 0 || days === 0) return { days, years: 0, months: 0, rest: 0, exact: false };
  return { days, years, months, rest, exact: years > 0 && months === 0 && rest === 0 };
}

export default function AnniversaryExperience({ data, mode, synth, fx, onEvent }: ExperienceProps<AnniversaryData>) {
  const [scene, setScene] = useState<SceneId>("gate");
  const completed = useRef(false);
  const photos = data.photos as Photo[];

  const begin = () => {
    synth.unlock();
    synth.play(SOFT_ARPEGGIO, { bpm: 76 });
    setScene(data.since ? "counter" : "timeline");
  };

  const finish = () => {
    if (!completed.current) {
      completed.current = true;
      onEvent("complete");
    }
    setScene("finale");
    setTimeout(() => {
      synth.chime();
      fx.shower("✨");
      fx.burst(GOLD_CONFETTI);
    }, 700);
  };

  return (
    <AnniversaryBackground>
      <AnimatePresence mode="wait">
        {scene === "gate" && (
          <Scene key="gate">
            <StoryGate
              to={data.to}
              from={data.from}
              since={data.since}
              animated
              action={
                <StageButton onClick={begin} className={`mt-[4.5cqh] ${GOLD_OUTLINE_BUTTON}`}>
                  Begin
                </StageButton>
              }
            />
          </Scene>
        )}
        {scene === "counter" && data.since && (
          <CounterScene key="counter" since={data.since} onDone={() => setScene("timeline")} />
        )}
        {scene === "timeline" && <TimelineScene key="timeline" photos={photos} onDone={() => setScene("letter")} />}
        {scene === "letter" && (
          <Scene key="letter">
            <p className={EYEBROW}>The last page</p>
            <h2 className="mb-6 mt-2 font-display text-[1.65rem] leading-snug text-[#e8c27a]">Some things are better written down</h2>
            <LetterReveal text={data.letter} from={data.from} synth={synth} seal="#c9a24a" cta="Turn the page" onDone={finish} />
          </Scene>
        )}
        {scene === "finale" && (
          <FinaleScene key="finale" to={data.to} from={data.from} mode={mode} onReplay={() => setScene("gate")} />
        )}
      </AnimatePresence>
    </AnniversaryBackground>
  );
}

/* ---------------- helpers ---------------- */

/** Counts up to `to` once, after `delay` ms, easing out. */
function CountUp({ to, delay = 0, duration = 2200 }: { to: number; delay?: number; duration?: number }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf = 0;
    const timer = setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        setValue(Math.round(to * (1 - Math.pow(1 - p, 4))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, delay);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [to, delay, duration]);
  return <>{value.toLocaleString("en-IN")}</>;
}

/** A thin gold frame with corner brackets around a photo. */
function GoldFrame({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const corner = "absolute h-5 w-5 border-[#e8c27a]";
  return (
    <div className={`relative aspect-[4/5] border border-[#e8c27a]/45 p-2 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9)] ${className}`}>
      <span className={`${corner} -left-1.5 -top-1.5 border-l border-t`} />
      <span className={`${corner} -right-1.5 -top-1.5 border-r border-t`} />
      <span className={`${corner} -bottom-1.5 -left-1.5 border-b border-l`} />
      <span className={`${corner} -bottom-1.5 -right-1.5 border-b border-r`} />
      <div className="relative h-full w-full overflow-hidden bg-[#1c2547]">{children}</div>
    </div>
  );
}

/* ---------------- scenes ---------------- */

function CounterScene({ since, onDone }: { since: string; onDone: () => void }) {
  const [t] = useState(() => elapsedSince(since));
  const countMs = Math.min(2400, 900 + t.days * 2);
  const after = 0.5 + countMs / 1000;
  const parts = (
    [
      [t.years, "Year"],
      [t.months, "Month"],
      [t.rest, "Day"],
    ] as const
  ).filter(([n]) => n > 0);
  const line =
    t.days === 0
      ? "Day one. And already the best one."
      : t.exact
        ? `Exactly ${t.years} ${plural(t.years, "year")} ago today.`
        : "And I'd choose every single one of them again.";

  return (
    <Scene>
      <p className={EYEBROW}>Since {formatLongDate(since)}</p>
      <p className="mt-[4cqh] font-display text-xl italic text-[#f7efe0]/80">We have shared</p>
      <p
        className="mt-2 font-display text-[length:clamp(3.4rem,19cqw,6rem)] leading-none text-[#e8c27a] tabular-nums"
        style={{ textShadow: "0 0 36px rgba(232,194,122,0.35)" }}
      >
        <CountUp to={t.days} delay={500} duration={countMs} />
      </p>
      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.45em] text-[#e8c27a]/85">
        {plural(t.days, "day")} together
      </p>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: after, duration: 0.8 }}
        className="flex flex-col items-center"
      >
        <GoldDivider className="mt-[3.5cqh]" />
        {parts.length > 0 && (
          <div className="mt-[3cqh] flex items-stretch justify-center">
            {parts.map(([n, unit], i) => (
              <div key={unit} className={`px-5 ${i > 0 ? "border-l border-[#e8c27a]/25" : ""}`}>
                <p className="font-display text-3xl leading-none text-[#f7efe0]">{n}</p>
                <p className="mt-1.5 text-[10px] uppercase tracking-[0.3em] text-[#f7efe0]/55">{plural(n, unit)}</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: after + 0.7, duration: 1 }}
        className="mt-[3.5cqh] max-w-xs font-display text-lg italic leading-snug text-[#f7efe0]/80"
      >
        {line}
      </motion.p>
      <StageButton
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: after + 1.3 }}
        onClick={onDone}
        className={`mt-[4.5cqh] ${GOLD_OUTLINE_BUTTON}`}
      >
        Our story →
      </StageButton>
    </Scene>
  );
}

function TimelineScene({ photos, onDone }: { photos: Photo[]; onDone: () => void }) {
  const [index, setIndex] = useState(0);
  const n = photos.length;
  const last = index >= n - 1;
  const photo = photos[index];
  const advance = () => (last ? onDone() : setIndex(index + 1));
  const at = (i: number) => (i + 0.5) / n;

  return (
    <Scene>
      {/* The gold line: it draws downwards to each chapter as the story moves on. */}
      <div aria-hidden className="absolute bottom-[12cqh] left-[max(1.75rem,8cqw)] top-[10cqh] w-px">
        <div className="absolute inset-0 bg-[#e8c27a]/15" />
        <motion.div
          className="absolute inset-0 origin-top"
          style={{ background: "linear-gradient(180deg, rgba(232,194,122,0.35), #e8c27a 30%, #f3d9a4)" }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: at(index) }}
          transition={{ duration: 1.1, ease: "easeInOut" }}
        />
        {photos.map((_, i) => (
          <motion.span
            key={i}
            className="absolute left-1/2 block h-2.5 w-2.5 border border-[#e8c27a]"
            style={{ top: `${at(i) * 100}%`, x: "-50%", y: "-50%", rotate: 45 }}
            initial={false}
            animate={{
              backgroundColor: i <= index ? "#e8c27a" : "rgba(15,22,48,1)",
              scale: i === index ? 1.35 : 1,
              boxShadow: i === index ? "0 0 12px 2px rgba(232,194,122,0.55)" : "0 0 0 0 rgba(232,194,122,0)",
            }}
            transition={{ delay: i === index ? 0.9 : 0, duration: 0.4 }}
          />
        ))}
      </div>

      <div className="flex w-full flex-col items-center pl-[7cqw]">
        <AnimatePresence mode="wait">
          <motion.button
            key={index}
            type="button"
            onClick={advance}
            aria-label={last ? "Continue" : "Next chapter"}
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -36 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex w-full flex-col items-center outline-none"
          >
            <p className={EYEBROW}>Chapter {ROMAN[index] ?? index + 1}</p>
            <GoldFrame className="mt-[2.5cqh] w-[min(62cqw,36cqh)] max-w-[320px]">
              <motion.img
                src={photo?.url}
                alt={photo?.caption || `Chapter ${index + 1}`}
                draggable={false}
                initial={{ scale: 1.12, filter: "saturate(0.25) brightness(0.7)" }}
                animate={{ scale: 1, filter: "saturate(1) brightness(1)" }}
                transition={{ scale: { duration: 7, ease: "linear" }, filter: { duration: 1.6, ease: "easeOut" } }}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </GoldFrame>
            <p className="mt-[2.8cqh] min-h-[2lh] max-w-[74cqw] break-words font-display text-[1.3rem] italic leading-snug text-[#f7efe0]">
              {photo?.caption}
            </p>
          </motion.button>
        </AnimatePresence>
        <StageButton onClick={advance} className={`mt-[2.5cqh] ${GOLD_OUTLINE_BUTTON}`}>
          {last ? "One last page" : "Next chapter"}
        </StageButton>
        <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-[#f7efe0]/45">
          {index + 1} of {n}
        </p>
      </div>
    </Scene>
  );
}

function FinaleScene({
  to,
  from,
  mode,
  onReplay,
}: {
  to: string;
  from: string;
  mode: ExperienceProps<AnniversaryData>["mode"];
  onReplay: () => void;
}) {
  return (
    <Scene>
      <GoldRings animated className="h-[min(7rem,15cqh)] w-auto" />
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.9 }}
        className="mt-[3.5cqh] font-display text-2xl italic text-[#f7efe0]/85"
      >
        Happy anniversary,
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 1, ease: "easeOut" }}
        className="mt-1 max-w-full truncate pb-1 font-display text-[3.3rem] leading-tight text-[#e8c27a]"
        style={{ textShadow: "0 0 32px rgba(232,194,122,0.35)" }}
      >
        {to}
      </motion.h1>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        className="flex w-full flex-col items-center"
      >
        <GoldDivider className="mt-2" />
        <p className="mt-[3cqh] max-w-[17rem] font-display text-lg italic leading-snug text-[#f7efe0]/80">
          Here&apos;s to every chapter we haven&apos;t written yet.
        </p>
        <p className="mt-3 max-w-full truncate font-hand text-[1.75rem] text-[#e8c27a]/90">Always yours, {from}</p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.4 }}
        className="mt-[5cqh] flex flex-col items-center gap-4"
      >
        <StageButton onClick={onReplay} className={GOLD_FILLED_BUTTON}>
          Play again ↺
        </StageButton>
        {mode === "live" && (
          <Link href="/" className="text-sm text-[#f7efe0]/65 underline underline-offset-4">
            Make one for someone you love
          </Link>
        )}
        {mode === "demo" && (
          <Link
            href="/create/anniversary"
            className="rounded-full border border-[#e8c27a]/70 px-6 py-3 font-semibold text-[#f6dcaa] transition hover:bg-[#e8c27a]/10"
          >
            Make one like this →
          </Link>
        )}
      </motion.div>
    </Scene>
  );
}
