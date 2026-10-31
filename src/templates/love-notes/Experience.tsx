"use client";

import Link from "next/link";
import { AnimatePresence, motion, useAnimate } from "motion/react";
import { useRef, useState } from "react";
import { SOFT_ARPEGGIO, type Synth } from "../shared/audio";
import { LetterReveal } from "../shared/LetterReveal";
import { Scene, StageButton, seeded, type ExperienceProps } from "../shared/ui";
import type { Photo } from "../types";
import { INK, JAR_BOX, JAR_LARGE, JAR_SMALL, JarHeading, JarHint, LabelledJar, LoveNotesBackground, PAPER, ROSE } from "./art";
import type { LoveNotesData } from "./definition";

type SceneId = "jar" | "photos" | "letter" | "finale";

const HEART = "M12 21s-7.5-4.6-10-9.3C.4 8.4 2.3 4.5 6 4.5c2.2 0 3.6 1.2 4.5 2.6.3.5 1 .5 1.3 0C12.7 5.7 14.1 4.5 16.3 4.5c3.7 0 5.6 3.9 4 7.2C19.5 16.4 12 21 12 21z";

const NO_BACKFACE: React.CSSProperties = { backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" };

export default function LoveNotesExperience({ data, mode, synth, fx, onEvent }: ExperienceProps<LoveNotesData>) {
  const [scene, setScene] = useState<SceneId>("jar");
  const completed = useRef(false);
  const notes = data.notes ?? [];
  const photos = (data.photos ?? []) as Photo[];

  const finish = () => {
    if (!completed.current) {
      completed.current = true;
      onEvent("complete");
    }
    synth.chime();
    setScene("finale");
    setTimeout(() => fx.hearts(), 450);
  };

  return (
    <LoveNotesBackground hearts={scene === "finale" ? 26 : 10}>
      <AnimatePresence mode="wait">
        {scene === "jar" && (
          <JarScene
            key="jar"
            to={data.to}
            from={data.from}
            notes={notes}
            synth={synth}
            onDone={() => setScene(photos.length ? "photos" : "letter")}
          />
        )}
        {scene === "photos" && (
          <Scene key="photos">
            <h2 className="mb-8 font-display text-3xl">A few favourite moments</h2>
            <PhotoPile photos={photos} onDone={() => setScene("letter")} />
          </Scene>
        )}
        {scene === "letter" && (
          <Scene key="letter">
            <h2 className="mb-6 font-display text-2xl">And the longest note of all…</h2>
            <LetterReveal text={data.letter} from={data.from} synth={synth} seal={ROSE} tone="light" cta="One more thing" onDone={finish} />
          </Scene>
        )}
        {scene === "finale" && (
          <FinaleScene key="finale" to={data.to} from={data.from} mode={mode} onReplay={() => setScene("jar")} />
        )}
      </AnimatePresence>
    </LoveNotesBackground>
  );
}

/* ---------------- the jar ---------------- */

function JarScene({
  to,
  from,
  notes,
  synth,
  onDone,
}: {
  to: string;
  from: string;
  notes: string[];
  synth: Synth;
  onDone: () => void;
}) {
  const total = notes.length;
  const [taken, setTaken] = useState(0);
  const [scope, animate] = useAnimate();
  const started = taken > 0;
  const empty = taken >= total;

  const tap = () => {
    synth.unlock();
    if (taken === 0) synth.play(SOFT_ARPEGGIO, { bpm: 90 });
    if (total === 0) {
      onDone();
      return;
    }
    if (empty) return;
    synth.pop();
    void animate(scope.current, { rotate: [0, -5, 4, -2, 0], y: [0, -8, 0] }, { duration: 0.5 });
    const n = taken + 1;
    setTaken(n);
    if (n === total) setTimeout(() => synth.chime(), 1400);
  };

  return (
    <Scene>
      {!started ? (
        <JarHeading to={to} from={from} />
      ) : (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
          <p className="font-display text-2xl" aria-live="polite">
            {taken} <span className="text-[#7a1f3d]/55">of</span> {total}
          </p>
          <div className="mt-2 flex gap-1.5" aria-hidden>
            {notes.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${i < taken ? "w-5 bg-[#c2335b]" : "w-1.5 bg-[#7a1f3d]/25"}`}
              />
            ))}
          </div>
        </motion.div>
      )}
      {started && (
        <p className="mt-1 h-7 font-hand text-xl text-[#b0405f]">
          {empty && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
              That&apos;s the whole jar… for now.
            </motion.span>
          )}
        </p>
      )}

      {started && (
        <div className="relative mt-5 h-[min(31cqh,236px)] w-[min(80cqw,320px)]">
          <AnimatePresence>
            <FoldedNote key={taken - 1} text={notes[taken - 1]} index={taken - 1} />
          </AnimatePresence>
        </div>
      )}

      <motion.button
        layout
        type="button"
        onClick={tap}
        aria-label={empty && started ? "The jar is empty" : "Take a note from the jar"}
        transition={{ layout: { type: "spring", stiffness: 140, damping: 20 } }}
        className={`${JAR_BOX} ${started ? `mt-5 ${JAR_SMALL}` : `mt-8 ${JAR_LARGE}`} block outline-none`}
      >
        <div ref={scope} className="absolute inset-0 origin-bottom">
          <LabelledJar to={to} fill={total ? (total - taken) / total : 0} />
        </div>
      </motion.button>

      <div className={`${started ? "mt-4" : "mt-6"} flex h-14 items-center justify-center`}>
        {!started ? (
          <JarHint />
        ) : !empty ? (
          <JarHint>Tap the jar for the next note</JarHint>
        ) : (
          <StageButton
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            onClick={onDone}
            className="bg-[#7a1f3d] text-[#fff4ef]"
          >
            Continue →
          </StageButton>
        )}
      </div>
    </Scene>
  );
}

/** Lined paper face of a note. Drawn twice (once per half) so the fold can open. */
function NoteFace({ text, index }: { text: string; index: number }) {
  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center px-[9%] text-center"
      style={{
        background: PAPER,
        backgroundImage: "repeating-linear-gradient(transparent 0 29px, rgba(122,31,61,.07) 29px 30px)",
      }}
    >
      <span className="absolute left-4 top-2.5 font-hand text-lg text-[#7a1f3d]/45">no. {index + 1}</span>
      <p className="break-words font-hand text-[min(7.2cqw,4.2cqh,1.8rem)] leading-[1.15] text-[#7a1f3d]">{text}</p>
      <svg viewBox="0 0 24 24" className="mt-2 h-4 w-4" aria-hidden>
        <path d={HEART} fill="#d9466f" />
      </svg>
    </div>
  );
}

/** A note that flies out of the jar folded in half, then opens. */
function FoldedNote({ text, index }: { text: string; index: number }) {
  const tilt = seeded(index + 7) * 6 - 3;
  return (
    <motion.div
      className="absolute inset-0"
      style={{ filter: "drop-shadow(0 14px 16px rgba(122,31,61,.2))" }}
      initial={{ y: "115%", scale: 0.28, rotate: -14, opacity: 0 }}
      animate={{ y: "0%", scale: 1, rotate: tilt, opacity: 1 }}
      exit={{ x: "-75%", y: "-6%", rotate: tilt - 18, scale: 0.85, opacity: 0, transition: { duration: 0.45, ease: "easeIn" } }}
      transition={{ type: "spring", stiffness: 170, damping: 19 }}
    >
      <div className="relative h-full w-full" style={{ perspective: 1100 }}>
        {/* top half, always face up */}
        <div className="absolute inset-x-0 top-0 h-1/2 overflow-hidden rounded-t-[7px]">
          <div className="absolute inset-x-0 top-0 h-[200%]">
            <NoteFace text={text} index={index} />
          </div>
          <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-[#7a1f3d]/10" />
        </div>
        {/* bottom half: starts folded up over the top half, then swings down */}
        <motion.div
          className="absolute inset-x-0 top-1/2 h-1/2"
          style={{ transformOrigin: "50% 0%", transformStyle: "preserve-3d" }}
          initial={{ rotateX: 180 }}
          animate={{ rotateX: 0 }}
          transition={{ delay: 0.55, duration: 0.8, ease: [0.3, 0.7, 0.2, 1] }}
        >
          <div className="absolute inset-0 overflow-hidden rounded-b-[7px]" style={NO_BACKFACE}>
            <div className="absolute inset-x-0 bottom-0 h-[200%]">
              <NoteFace text={text} index={index} />
            </div>
          </div>
          <div
            className="absolute inset-0 flex items-center justify-center rounded-t-[7px]"
            style={{
              ...NO_BACKFACE,
              transform: "rotateX(180deg)",
              background: "linear-gradient(160deg, #fdf1e4 0%, #f6e2d2 100%)",
            }}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#c2335b] shadow-md shadow-[#7a1f3d]/30">
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                <path d={HEART} fill="#fff4ef" />
              </svg>
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ---------------- photos ---------------- */

/** Prints drop onto a little pile, one per tap. */
function PhotoPile({ photos, onDone }: { photos: Photo[]; onDone: () => void }) {
  const [shown, setShown] = useState(1);
  const done = shown >= photos.length;
  const first = Math.max(0, shown - 3);

  return (
    <div className="flex w-full flex-col items-center">
      <button
        type="button"
        onClick={() => !done && setShown(shown + 1)}
        aria-label={done ? "That's every photo" : "Next photo"}
        className="relative aspect-[4/5] w-[min(70cqw,42cqh,300px)] outline-none"
      >
        <AnimatePresence>
          {photos.slice(first, shown).map((photo, k) => {
            const i = first + k;
            const tilt = (seeded(i + 3) * 2 - 1) * 7;
            return (
              <motion.figure
                key={i}
                className="absolute inset-0 m-0 rounded-[4px] bg-[#fffdf8] p-[4%] pb-[18%] shadow-xl shadow-[#7a1f3d]/25"
                style={{ zIndex: i }}
                initial={{ y: "-140%", rotate: tilt * 3, opacity: 0 }}
                animate={{ y: `${((seeded(i + 5) * 2 - 1) * 3).toFixed(2)}%`, x: `${((seeded(i + 9) * 2 - 1) * 6).toFixed(2)}%`, rotate: tilt, opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.3 } }}
                transition={{ type: "spring", stiffness: 120, damping: 17 }}
              >
                <span aria-hidden className="absolute -top-3 left-1/2 z-10 h-6 w-[34%] -translate-x-1/2 -rotate-3 rounded-[2px] bg-[#f6a5b5]/75" />
                {/* eslint-disable-next-line @next/next/no-img-element -- photos are already resized on upload */}
                <img
                  src={photo.url}
                  alt={photo.caption || "A shared memory"}
                  draggable={false}
                  className="h-full w-full rounded-[2px] object-cover"
                />
                {photo.caption && (
                  <figcaption className="absolute inset-x-[5%] bottom-[3.5%] truncate text-center font-hand text-[min(6.4cqw,1.6rem)] text-[#5a2338]">
                    {photo.caption}
                  </figcaption>
                )}
              </motion.figure>
            );
          })}
        </AnimatePresence>
      </button>
      <p className="mt-8 text-sm text-[#7a1f3d]/70">
        {shown} / {photos.length}
        {!done && " · tap for the next one"}
      </p>
      <div className="mt-4 flex h-14 items-center">
        {done && (
          <StageButton
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            onClick={onDone}
            className="bg-[#7a1f3d] text-[#fff4ef]"
          >
            Continue →
          </StageButton>
        )}
      </div>
    </div>
  );
}

/* ---------------- finale ---------------- */

function FinaleScene({
  to,
  from,
  mode,
  onReplay,
}: {
  to: string;
  from: string;
  mode: ExperienceProps<LoveNotesData>["mode"];
  onReplay: () => void;
}) {
  return (
    <Scene>
      <motion.div
        initial={{ scale: 0.6, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 12, delay: 0.2 }}
        className={`${JAR_BOX} w-[min(34cqw,22cqh,140px)]`}
      >
        <LabelledJar to={to} hearts />
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="mt-7 max-w-full font-display text-5xl leading-tight"
      >
        I love you,
        <span className="block truncate text-[#c2335b]">{to}</span>
      </motion.h1>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="flex max-w-full flex-col items-center"
      >
        <p className="mt-4 max-w-xs text-[#7a1f3d]/75">Every note in that jar is true, and there are plenty more where they came from.</p>
        <p className="mt-2 max-w-full truncate font-hand text-2xl text-[#b0405f]">{from}</p>
      </motion.div>
      <div className="mt-9 flex flex-col items-center gap-4">
        <StageButton onClick={onReplay} style={{ background: INK }} className="text-[#fff4ef]">
          Play again ↺
        </StageButton>
        {mode === "live" && (
          <Link href="/" className="text-sm text-[#7a1f3d]/70 underline underline-offset-4">
            Make one for someone you love
          </Link>
        )}
        {mode === "demo" && (
          <Link
            href="/create/love-notes"
            className="rounded-full px-6 py-3 font-semibold text-white shadow-lg shadow-[#7a1f3d]/20"
            style={{ background: ROSE }}
          >
            Make one like this →
          </Link>
        )}
      </div>
    </Scene>
  );
}
