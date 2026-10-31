"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Synth } from "../shared/audio";
import { LetterReveal } from "../shared/LetterReveal";
import { Scene, StageButton, seeded, type ExperienceProps } from "../shared/ui";
import type { Photo } from "../types";
import { BF_CONFETTI, CaseFileGate, FriendBackground, FriendSeal, Tape } from "./art";
import type { BestFriendData } from "./definition";

type SceneId = "gate" | "facts" | "jokes" | "photos" | "letter" | "finale";

/** An original, bouncy little tune in C major (4/4). */
const CASE_FILE_TUNE: Parameters<Synth["play"]>[0] = [
  ["E5", 0.5], ["G5", 0.5], ["E5", 0.5], ["C5", 0.5], ["D5", 0.5], ["E5", 0.5], ["G5", 1],
  ["A5", 0.5], ["G5", 0.5], ["E5", 0.5], ["C5", 0.5], ["D5", 1], [null, 1],
  ["E5", 0.5], ["G5", 0.5], ["E5", 0.5], ["C5", 0.5], ["D5", 0.5], ["E5", 0.5], ["C5", 1],
  ["A4", 0.5], ["C5", 0.5], ["D5", 0.5], ["E5", 0.5], ["C5", 1.5], [null, 0.5],
  ["F5", 0.5], ["E5", 0.5], ["D5", 0.5], ["C5", 0.5], ["D5", 0.5], ["E5", 0.5], ["F5", 1],
  ["G5", 0.5], ["F5", 0.5], ["E5", 0.5], ["D5", 0.5], ["E5", 1], [null, 1],
  ["A5", 0.5], ["G5", 0.5], ["F5", 0.5], ["E5", 0.5], ["D5", 0.5], ["C5", 0.5], ["D5", 0.5], ["E5", 0.5],
  ["C5", 1], ["G4", 0.5], ["C5", 0.5], ["C5", 1.5], [null, 0.5],
];

const NOTE_COLORS: [string, string][] = [
  ["#fff1a6", "#f3df7a"],
  ["#ffd9c7", "#f6bfa6"],
  ["#c9eee0", "#a6dcc9"],
  ["#ddd7ff", "#c3baf5"],
  ["#ffdfe9", "#f7c2d3"],
  ["#dff1bd", "#c6e397"],
];

const EYEBROW = "text-xs font-bold uppercase tracking-[0.32em] text-[#2bb39a]";
const INK_BUTTON = "bg-[#1f3d36] text-white";

/** Whole years since the year they became friends (runs in a state initializer, never in render). */
function yearsSince(since?: number): number | null {
  if (!since) return null;
  return Math.max(0, new Date().getFullYear() - since);
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export default function BestFriendExperience({ data, mode, synth, fx, onEvent }: ExperienceProps<BestFriendData>) {
  const [scene, setScene] = useState<SceneId>("gate");
  const [opening, setOpening] = useState(false);
  const completed = useRef(false);

  const openFile = () => {
    if (opening) return;
    synth.unlock();
    synth.whoosh();
    synth.play(CASE_FILE_TUNE, { bpm: 132 });
    setOpening(true);
    setTimeout(() => setScene("facts"), 1500);
  };

  const finish = () => {
    if (!completed.current) {
      completed.current = true;
      onEvent("complete");
    }
    setScene("finale");
    // Lands with the seal being stamped onto the certificate.
    setTimeout(() => {
      synth.pop();
      synth.chime();
      fx.burst(BF_CONFETTI);
    }, 1450);
  };

  const replay = () => {
    setOpening(false);
    setScene("gate");
  };

  return (
    <FriendBackground dim={scene === "letter"}>
      <AnimatePresence mode="wait">
        {scene === "gate" && (
          <Scene key="gate">
            <CaseFileGate
              to={data.to}
              from={data.from}
              open={opening}
              onOpen={openFile}
              hint={opening ? "Opening the file…" : "Tap to open"}
            />
          </Scene>
        )}
        {scene === "facts" && (
          <FactsScene key="facts" since={data.since} jokeCount={data.jokes.length} synth={synth} onDone={() => setScene("jokes")} />
        )}
        {scene === "jokes" && <JokesScene key="jokes" jokes={data.jokes} synth={synth} onDone={() => setScene("photos")} />}
        {scene === "photos" && (
          <Scene key="photos">
            <p className={EYEBROW}>Exhibit C</p>
            <h2 className="mb-[4cqh] mt-1 font-display text-3xl">The evidence</h2>
            <EvidenceStack photos={data.photos as Photo[]} onDone={() => setScene("letter")} />
          </Scene>
        )}
        {scene === "letter" && (
          <Scene key="letter">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#8fdcc7]">Exhibit D · eyes only</p>
            <h2 className="mb-6 mt-1 font-display text-2xl text-[#f4e9d8]">One last document</h2>
            <LetterReveal text={data.letter} from={data.from} synth={synth} seal="#d9534f" cta="Close the case →" onDone={finish} />
          </Scene>
        )}
        {scene === "finale" && (
          <FinaleScene key="finale" to={data.to} from={data.from} since={data.since} mode={mode} onReplay={replay} />
        )}
      </AnimatePresence>
    </FriendBackground>
  );
}

/* ---------------- helpers ---------------- */

/** Counts up to `to` once, after `delay` ms. */
function CountUp({ to, delay = 0, duration = 1300 }: { to: number; delay?: number; duration?: number }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf = 0;
    const timer = setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        setValue(Math.round(to * (1 - Math.pow(1 - p, 3))));
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

/* ---------------- scenes ---------------- */

type Fact = { label: string; value: React.ReactNode; note?: string; wide?: boolean; big?: boolean };

function FactsScene({
  since,
  jokeCount,
  synth,
  onDone,
}: {
  since?: number;
  jokeCount: number;
  synth: Synth;
  onDone: () => void;
}) {
  const [years] = useState(() => yearsSince(since));
  const step = 0.42;
  const first = 0.35;

  const facts: Fact[] = [
    {
      label: "Friends since",
      value: since ?? "Forever, basically",
      note:
        years === null
          ? "Nobody remembers a time before it."
          : years === 0
            ? "Brand new, and already legendary."
            : `That's ${plural(years, "year")} of showing up for each other.`,
      wide: true,
    },
    years
      ? { label: "Days on file", value: <><CountUp to={years * 365} delay={(first + step) * 1000} />+</>, big: true }
      : { label: "Late-night calls", value: "Countless" },
    { label: "Snacks shared", value: "Too many to count" },
    { label: "Secrets kept", value: "Every single one" },
    { label: "Inside jokes on file", value: jokeCount, note: "and counting", big: true },
  ];
  const count = facts.length;
  const doneAt = first + count * step + 0.5;

  // A soft thud as each card lands on the desk.
  useEffect(() => {
    const ids = Array.from({ length: count }, (_, i) => setTimeout(() => synth.pop(), (first + i * step + 0.12) * 1000));
    return () => ids.forEach(clearTimeout);
  }, [count, synth]);

  return (
    <Scene>
      <p className={EYEBROW}>Exhibit A</p>
      <h2 className="mt-1 font-display text-3xl">The facts of the case</h2>
      <div className="mt-[4cqh] grid w-full max-w-sm grid-cols-2 gap-3">
        {facts.map((fact, i) => {
          const tilt = (seeded(i + 3) - 0.5) * 4;
          return (
            <motion.div
              key={fact.label}
              initial={{ opacity: 0, scale: 1.35, rotate: tilt * 4, y: -18 }}
              animate={{ opacity: 1, scale: 1, rotate: tilt, y: 0 }}
              transition={{ delay: first + i * step, type: "spring", stiffness: 420, damping: 24 }}
              className={`relative rounded-md bg-[#f4e9d8] px-3.5 pb-3 pt-3.5 text-left shadow-[0_8px_18px_-8px_rgba(31,61,54,0.45)] ${
                fact.wide ? "col-span-2" : ""
              }`}
            >
              <Tape className="absolute -top-2.5 left-1/2 w-14 -translate-x-1/2" color={i % 2 ? "rgba(217,83,79,0.42)" : undefined} />
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#1f3d36]/55">{fact.label}</p>
              <p
                className={`mt-1 font-display leading-tight ${
                  i === 0 ? `${since ? "text-[2.6rem]" : "pr-20 text-[1.9rem]"} text-[#2bb39a]` : fact.big ? "text-3xl text-[#1f3d36]" : "text-lg text-[#1f3d36]"
                }`}
              >
                {fact.value}
              </p>
              {fact.note && <p className="mt-0.5 text-[13px] leading-snug text-[#1f3d36]/70">{fact.note}</p>}
              {i === 0 && (
                <motion.span
                  initial={{ opacity: 0, scale: 2.2 }}
                  animate={{ opacity: 0.9, scale: 1 }}
                  transition={{ delay: doneAt - 0.3, type: "spring", stiffness: 380, damping: 16 }}
                  className="absolute right-3 top-4 rotate-[-10deg] rounded-[4px] border-2 border-[#d9534f] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#d9534f]"
                >
                  Verified
                </motion.span>
              )}
            </motion.div>
          );
        })}
      </div>
      <StageButton
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: doneAt }}
        onClick={onDone}
        className={`mt-[4cqh] ${INK_BUTTON}`}
      >
        Read the classified notes →
      </StageButton>
    </Scene>
  );
}

function JokesScene({ jokes, synth, onDone }: { jokes: string[]; synth: Synth; onDone: () => void }) {
  const [flipped, setFlipped] = useState<boolean[]>(() => jokes.map(() => false));
  const allFlipped = flipped.every(Boolean);

  const flip = (i: number) => {
    if (flipped[i]) return;
    synth.unlock();
    synth.pop();
    const next = flipped.map((v, j) => (j === i ? true : v));
    setFlipped(next);
    if (next.every(Boolean)) setTimeout(() => synth.chime(), 550);
  };
  const flipAll = () => {
    synth.unlock();
    synth.chime();
    setFlipped(jokes.map(() => true));
  };

  const single = jokes.length === 1;
  const oddLast = !single && jokes.length % 2 === 1;

  return (
    <Scene>
      <p className={EYEBROW}>Exhibit B</p>
      <h2 className="mt-1 font-display text-3xl">Inside jokes</h2>
      <p className="mt-1 text-[#1f3d36]/70">Tap each note to declassify it.</p>
      <div className="mt-[2.5cqh] max-h-[58cqh] w-full max-w-sm overflow-y-auto px-2 pb-3 pt-4">
        <div className={`grid gap-x-3.5 gap-y-5 ${single ? "mx-auto max-w-[15rem] grid-cols-1" : "grid-cols-2"}`}>
          {jokes.map((joke, i) => {
            const [color, shade] = NOTE_COLORS[i % NOTE_COLORS.length];
            const tilt = (seeded(i + 11) - 0.5) * 6;
            const faceStyle = {
              background: `linear-gradient(172deg, ${color} 0%, ${color} 72%, ${shade} 100%)`,
              backfaceVisibility: "hidden" as const,
              WebkitBackfaceVisibility: "hidden" as const,
            };
            const number = String(i + 1).padStart(2, "0");
            return (
              <motion.button
                key={i}
                type="button"
                onClick={() => flip(i)}
                aria-label={flipped[i] ? joke : `Reveal inside joke ${i + 1}`}
                initial={{ opacity: 0, y: 24, rotate: tilt }}
                animate={{ opacity: 1, y: 0, rotate: tilt }}
                transition={{ delay: 0.15 + i * 0.12, type: "spring", damping: 18 }}
                className={`relative text-left outline-none ${
                  oddLast && i === jokes.length - 1 ? "col-span-2 mx-auto w-[calc(50%-0.45rem)]" : ""
                }`}
                style={{ perspective: 900 }}
              >
                <motion.div
                  className="grid"
                  style={{ transformStyle: "preserve-3d" }}
                  initial={false}
                  animate={{ rotateY: flipped[i] ? 180 : 0 }}
                  transition={{ duration: 0.7, ease: [0.4, 0.1, 0.2, 1] }}
                >
                  {/* front: redacted */}
                  <div
                    className="relative flex min-h-[7.25rem] flex-col justify-between rounded-[3px] p-3 pt-3.5 shadow-[0_8px_16px_-8px_rgba(31,61,54,0.5)] [grid-area:1/1]"
                    style={faceStyle}
                  >
                    <Tape className="absolute -top-2.5 left-1/2 w-12 -translate-x-1/2 -rotate-3" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#1f3d36]/55">Joke No. {number}</p>
                    <div className="my-2 space-y-1.5">
                      {[0, 1, 2].map((k) => (
                        <span
                          key={k}
                          className="block h-2.5 rounded-[2px] bg-[#1f3d36]/90"
                          style={{ width: `${48 + seeded(i * 7 + k) * 46}%` }}
                        />
                      ))}
                    </div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#d9534f]">Classified · tap</p>
                  </div>
                  {/* back: the joke */}
                  <div
                    className="relative flex min-h-[7.25rem] flex-col rounded-[3px] p-3 pt-3.5 shadow-[0_8px_16px_-8px_rgba(31,61,54,0.5)] [grid-area:1/1]"
                    style={{ ...faceStyle, transform: "rotateY(180deg)" }}
                  >
                    <Tape className="absolute -top-2.5 left-1/2 w-12 -translate-x-1/2 rotate-3" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#2bb39a]">No. {number} · declassified</p>
                    <p className={`mt-1.5 break-words font-hand leading-[1.12] text-[#1f3d36] ${joke.length > 46 ? "text-[1.2rem]" : "text-[1.4rem]"}`}>
                      {joke}
                    </p>
                  </div>
                </motion.div>
              </motion.button>
            );
          })}
        </div>
      </div>
      <div className="mt-[2cqh] flex h-14 items-center justify-center">
        {allFlipped ? (
          <StageButton
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={onDone}
            className={INK_BUTTON}
          >
            On to the evidence →
          </StageButton>
        ) : (
          <button type="button" onClick={flipAll} className="text-sm text-[#1f3d36]/60 underline underline-offset-4">
            Declassify them all
          </button>
        )}
      </div>
    </Scene>
  );
}

const stackVariants = {
  gone: (dir: number) => ({ x: dir * 420, rotate: dir * 22, opacity: 0, transition: { duration: 0.4 } }),
};

/** Taped-in prints. Swipe (or tap) the top one away to see the next. */
function EvidenceStack({ photos, onDone }: { photos: Photo[]; onDone: () => void }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const next = (dir: number) => {
    if (index >= photos.length) return;
    setDirection(dir);
    const nextIndex = index + 1;
    setIndex(nextIndex);
    if (nextIndex >= photos.length) setTimeout(onDone, 450);
  };

  const visible = photos
    .map((photo, i) => ({ photo, i }))
    .slice(index, index + 3)
    .reverse();

  return (
    <div className="flex flex-col items-center">
      <div className="relative aspect-[4/5] w-[min(70cqw,44cqh)] max-w-[300px]">
        <AnimatePresence custom={direction}>
          {visible.map(({ photo, i }) => {
            const depth = i - index;
            const tilt = (seeded(i + 31) - 0.5) * 10;
            const isTop = depth === 0;
            return (
              <motion.div
                key={i}
                custom={direction}
                className="absolute inset-0 cursor-grab rounded-[4px] bg-[#fffdf8] p-3 pb-14 shadow-[0_18px_40px_-14px_rgba(31,61,54,0.55)] active:cursor-grabbing"
                style={{ zIndex: 10 - depth }}
                initial={{ scale: 0.9, opacity: 0, rotate: tilt }}
                animate={{ scale: 1 - depth * 0.04, y: depth * 10, rotate: isTop ? tilt * 0.35 : tilt, opacity: 1 }}
                variants={stackVariants}
                exit="gone"
                drag={isTop ? "x" : false}
                dragSnapToOrigin
                dragElastic={0.8}
                onDragEnd={(_, info) => {
                  if (Math.abs(info.offset.x) > 90 || Math.abs(info.velocity.x) > 450) next(info.offset.x > 0 ? 1 : -1);
                }}
                onTap={() => isTop && next(1)}
              >
                <Tape className="absolute -top-3 left-1/2 z-10 w-24 -translate-x-1/2 -rotate-2" />
                <div className="relative h-full w-full overflow-hidden rounded-[2px] bg-[#e7ddcb]">
                  {/* eslint-disable-next-line @next/next/no-img-element -- photos are already resized on upload */}
                  <img
                    src={photo.url}
                    alt={photo.caption || "A shared memory"}
                    draggable={false}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute left-2 top-2 rounded-[2px] bg-[#f4e9d8] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#1f3d36] shadow-sm">
                    Exhibit C-{i + 1}
                  </span>
                </div>
                <p className="absolute inset-x-3 bottom-3 truncate text-center font-hand text-2xl text-[#1f3d36]">{photo.caption}</p>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      <p className="mt-7 text-sm text-[#1f3d36]/60">
        {Math.min(index + 1, photos.length)} / {photos.length} · swipe or tap
      </p>
    </div>
  );
}

function FinaleScene({
  to,
  from,
  since,
  mode,
  onReplay,
}: {
  to: string;
  from: string;
  since?: number;
  mode: ExperienceProps<BestFriendData>["mode"];
  onReplay: () => void;
}) {
  const [years] = useState(() => yearsSince(since));
  const citation = years
    ? `for ${plural(years, "year")} of plot twists, kept secrets and laughing at the jokes nobody else gets.`
    : "for every plot twist, every kept secret and laughing at the jokes nobody else gets.";

  return (
    <Scene>
      <p className={EYEBROW}>Case closed</p>
      <motion.div
        initial={{ opacity: 0, y: 40, rotate: -5, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, rotate: -1.2, scale: 1 }}
        transition={{ delay: 0.2, type: "spring", damping: 16 }}
        className="relative mt-[2.5cqh] w-[86cqw] max-w-[350px] bg-[#fbf4e6] p-2.5 shadow-[0_26px_50px_-20px_rgba(31,61,54,0.6)]"
      >
        <Tape className="absolute -left-5 top-1 z-10 w-20 -rotate-[38deg]" />
        <Tape className="absolute -right-5 top-1 z-10 w-20 rotate-[38deg]" color="rgba(217,83,79,0.42)" />
        <div className="relative border-2 border-[#2bb39a] px-5 pb-[2.4cqh] pt-[2.8cqh] text-center outline outline-offset-[-7px] outline-[#2bb39a]/50">
          <p className="text-[9px] font-bold uppercase tracking-[0.32em] text-[#1f3d36]/55">The Department of Friendship</p>
          <h1 className="mt-2 font-display leading-none text-[#1f3d36]">
            <span className="block text-base italic text-[#1f3d36]/75">Certificate of</span>
            <span className="mt-1 block text-[1.85rem]">Best Friendship</span>
          </h1>
          <svg viewBox="0 0 160 12" aria-hidden className="mx-auto mt-2.5 w-32">
            <path d="M4 6 H64 M96 6 H156" stroke="#2bb39a" strokeWidth="1" />
            <path d="M80 1.2l1.4 3 3.2.4-2.4 2.2.6 3.2L80 8.4 77.2 10l.6-3.2-2.4-2.2 3.2-.4z" fill="#d9534f" />
          </svg>
          <p className="mt-[1.6cqh] text-[10px] font-bold uppercase tracking-[0.24em] text-[#1f3d36]/55">Proudly awarded to</p>
          <p className="truncate px-1 font-hand text-5xl leading-[1.15] text-[#2bb39a]">{to}</p>
          <div className="mx-auto h-px w-4/5 bg-[#1f3d36]/25" />
          <p className="mx-auto mt-2.5 max-w-[16.5rem] text-[13px] leading-relaxed text-[#1f3d36]/80">{citation}</p>
          <div className="mt-[1.8cqh] flex items-end justify-between gap-2">
            <div className="min-w-0 flex-1 pb-1 text-left">
              <p className="truncate font-hand text-[1.9rem] leading-none text-[#1f3d36]">{from}</p>
              <div className="mt-1 h-px bg-[#1f3d36]/40" />
              <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.24em] text-[#1f3d36]/55">Signed · best friend</p>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 2.4, rotate: -40 }}
              animate={{ opacity: 1, scale: 1, rotate: -10 }}
              transition={{ delay: 1.25, type: "spring", stiffness: 320, damping: 15 }}
              className="-mb-3 -mr-2 w-[4.6rem] shrink-0 drop-shadow-[0_4px_6px_rgba(31,61,54,0.35)]"
            >
              <FriendSeal className="w-full" />
            </motion.div>
          </div>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
        className="mt-[3.5cqh] flex flex-col items-center gap-3.5"
      >
        <StageButton onClick={onReplay} className={INK_BUTTON}>
          Play again ↺
        </StageButton>
        {mode === "live" && (
          <Link href="/" className="text-sm text-[#1f3d36]/70 underline underline-offset-4">
            Make one for someone you love
          </Link>
        )}
        {mode === "demo" && (
          <Link href="/create/best-friend" className="rounded-full bg-[#2bb39a] px-6 py-3 font-semibold text-white shadow-lg shadow-[#1f3d36]/20">
            Make one like this →
          </Link>
        )}
      </motion.div>
    </Scene>
  );
}
