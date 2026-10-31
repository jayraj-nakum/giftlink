"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Synth } from "../shared/audio";
import { PhotoStack } from "../shared/PhotoStack";
import { Scene, StageButton, seeded, type ExperienceProps } from "../shared/ui";
import type { Photo } from "../types";
import { ApologyGate, ApologySky, Cloud, DAWN, EMBER, Moon, NIGHT } from "./art";
import type { ApologyData } from "./definition";

type SceneId = "gate" | "clouds" | "promises" | "photos" | "message" | "question" | "forgiven" | "time";
type Melody = Parameters<Synth["play"]>[0];

/** Original: a hushed music-box arpeggio over Am – F – C – G. */
const RAINY_EVENING: Melody = [
  ["A3", 0.5], ["E4", 0.5], ["A4", 0.5], ["C5", 1], ["B4", 0.5], ["A4", 1],
  ["F3", 0.5], ["C4", 0.5], ["F4", 0.5], ["A4", 1], ["G4", 0.5], ["F4", 1],
  ["C4", 0.5], ["G4", 0.5], ["C5", 0.5], ["E5", 1], ["D5", 0.5], ["C5", 1],
  ["G3", 0.5], ["D4", 0.5], ["G4", 0.5], ["B4", 1], ["A4", 0.5], ["G4", 1],
];

/** Original: the same walk, resolved into bright C major. */
const DAYBREAK: Melody = [
  ["C4", 0.5], ["E4", 0.5], ["G4", 0.5], ["C5", 0.5], ["E5", 1], ["D5", 0.5], ["C5", 0.5],
  ["F3", 0.5], ["A3", 0.5], ["C4", 0.5], ["F4", 0.5], ["A4", 1], ["G4", 0.5], ["F4", 0.5],
  ["G3", 0.5], ["B3", 0.5], ["D4", 0.5], ["G4", 0.5], ["B4", 1], ["D5", 0.5], ["B4", 0.5],
  ["C4", 0.5], ["G4", 0.5], ["C5", 0.5], ["E5", 0.5], ["G5", 2],
];

export default function ApologyExperience({ data, mode, synth, fx, onEvent }: ExperienceProps<ApologyData>) {
  const sorry = data.sorry ?? [];
  const promises = data.promises ?? [];
  const photos = (data.photos ?? []) as Photo[];

  const [scene, setScene] = useState<SceneId>("gate");
  const [cleared, setCleared] = useState<boolean[]>([]);
  const reported = useRef({ yes: false, complete: false });

  const order: SceneId[] = [
    "gate",
    "clouds",
    ...(promises.length ? (["promises"] as const) : []),
    ...(photos.length ? (["photos"] as const) : []),
    "message",
    "question",
  ];
  const next = () => setScene(order[order.indexOf(scene) + 1] ?? "question");

  const clearedCount = sorry.filter((_, i) => cleared[i]).length;
  const left = sorry.length ? 1 - clearedCount / sorry.length : 0;
  const rain = scene === "gate" ? 1 : scene === "clouds" ? left : 0;
  const clear = scene === "gate" ? 0 : scene === "clouds" ? 1 - left : 1;

  const report = (event: "yes" | "complete") => {
    if (reported.current[event]) return;
    reported.current[event] = true;
    onEvent(event);
  };

  const clearCloud = (i: number) => {
    if (cleared[i]) return;
    synth.unlock();
    synth.whoosh();
    const nextCleared = sorry.map((_, j) => j === i || !!cleared[j]);
    setCleared(nextCleared);
    if (nextCleared.every(Boolean)) setTimeout(() => synth.chime(), 900);
  };

  const forgive = () => {
    synth.unlock();
    synth.chime();
    report("yes");
    report("complete");
    setScene("forgiven");
    setTimeout(() => synth.play(DAYBREAK, { bpm: 96 }), 700);
    setTimeout(() => fx.shower("🤍"), 1100);
  };

  const needTime = () => {
    synth.unlock();
    report("complete");
    synth.play(RAINY_EVENING, { bpm: 60 });
    setScene("time");
  };

  const replay = () => {
    setCleared([]);
    setScene("gate");
  };

  return (
    <ApologySky clear={clear} warm={scene === "forgiven"} rain={rain}>
      <AnimatePresence mode="wait">
        {scene === "gate" && (
          <Scene key="gate">
            <ApologyGate
              to={data.to}
              from={data.from}
              action={
                <StageButton
                  onClick={() => {
                    synth.unlock();
                    synth.play(RAINY_EVENING, { bpm: 72 });
                    setScene("clouds");
                  }}
                  className="mt-9"
                  style={{ background: DAWN, color: NIGHT }}
                >
                  Open
                </StageButton>
              }
            />
          </Scene>
        )}
        {scene === "clouds" && (
          <CloudsScene key="clouds" sorry={sorry} cleared={cleared} onClear={clearCloud} onDone={next} />
        )}
        {scene === "promises" && <PromisesScene key="promises" promises={promises} from={data.from} synth={synth} onDone={next} />}
        {scene === "photos" && (
          <Scene key="photos">
            <h2 className="mb-8 font-display text-3xl">The days I want back</h2>
            <PhotoStack photos={photos} onDone={next} />
          </Scene>
        )}
        {scene === "message" && <MessageScene key="message" from={data.from} message={data.message} onDone={next} />}
        {scene === "question" && <QuestionScene key="question" onForgive={forgive} onTime={needTime} />}
        {scene === "forgiven" && (
          <ForgivenScene
            key="forgiven"
            to={data.to}
            from={data.from}
            promised={promises.length > 0}
            mode={mode}
            onReplay={replay}
          />
        )}
        {scene === "time" && <TimeScene key="time" from={data.from} mode={mode} onReplay={replay} />}
      </AnimatePresence>
    </ApologySky>
  );
}

/* ---------------- clouds ---------------- */

function CloudsScene({
  sorry,
  cleared,
  onClear,
  onDone,
}: {
  sorry: string[];
  cleared: boolean[];
  onClear: (i: number) => void;
  onDone: () => void;
}) {
  const total = sorry.length;
  const count = sorry.filter((_, i) => cleared[i]).length;
  const allClear = count >= total;

  return (
    <Scene>
      <div className="flex h-[4.75rem] flex-col items-center justify-start">
        <h2 className="font-display text-3xl">{count === 0 ? "Tap each cloud" : "I'm sorry for…"}</h2>
        <p className="mt-1.5 text-sm text-white/70" aria-live="polite">
          {count === 0
            ? "Every one is hiding something I need to say."
            : allClear
              ? "The rain has stopped."
              : `${count} of ${total} cleared`}
        </p>
      </div>

      <div className="mt-6 flex w-full max-w-sm flex-col gap-[1.4cqh]">
        {sorry.map((line, i) => {
          const dir = i % 2 ? 1 : -1;
          const width = 104 + seeded(i + 8) * 12;
          const left = (100 - width) / 2 + (seeded(i + 4) * 2 - 1) * 3;
          return (
            <div key={i} className="relative flex h-[min(10.5cqh,92px)] items-center justify-center">
              <motion.p
                initial={false}
                animate={cleared[i] ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
                transition={{ delay: cleared[i] ? 0.45 : 0, duration: 0.8 }}
                className="max-w-full break-words px-3 font-hand text-[min(1.45rem,3.6cqh)] leading-[1.12] text-white [text-shadow:0_1px_14px_rgba(10,16,36,.55)]"
              >
                {line}
              </motion.p>
              <AnimatePresence>
                {!cleared[i] && (
                  <motion.button
                    key="cloud"
                    type="button"
                    aria-label={`Clear cloud ${i + 1} of ${total}`}
                    onClick={() => onClear(i)}
                    className="absolute -top-[28%] h-[156%] outline-none"
                    style={{ left: `${left.toFixed(2)}%`, width: `${width.toFixed(2)}%`, zIndex: 10 + i }}
                    initial={{ opacity: 0, x: dir * 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ x: `${dir * 125}%`, opacity: 0, transition: { duration: 1.4, ease: [0.4, 0, 0.6, 1] } }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ delay: 0.12 * i, duration: 0.9, ease: "easeOut" }}
                  >
                    <motion.span
                      className="block h-full w-full"
                      animate={{ x: [0, dir * 7, 0] }}
                      transition={{ repeat: Infinity, duration: 5 + seeded(i) * 3, ease: "easeInOut" }}
                    >
                      <Cloud tone="storm" stretch variant={i} flip={seeded(i + 12) > 0.5} className="h-full w-full drop-shadow-xl" />
                    </motion.span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex h-14 items-center">
        {allClear && (
          <StageButton
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: total ? 1.6 : 0.2 }}
            onClick={onDone}
            style={{ background: DAWN, color: NIGHT }}
          >
            Keep reading →
          </StageButton>
        )}
      </div>
    </Scene>
  );
}

/* ---------------- promises ---------------- */

const PROMISE_STEP = 1.25;

function TickBox({ delay }: { delay: number }) {
  return (
    <svg viewBox="0 0 28 28" className="mt-1 h-6 w-6 shrink-0 overflow-visible" aria-hidden>
      <path
        d="M4.5 5.5 C10 4.6 18 4.8 23.6 5.2 C24 11 23.8 17.5 23.3 23.4 C17 23.9 10.5 23.7 4.8 23.2 C4.3 17 4.2 11 4.5 5.5 Z"
        fill="none"
        stroke="#28304f"
        strokeOpacity=".55"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <motion.path
        d="M7.5 14.5 L12.5 20 L26 2.5"
        fill="none"
        stroke="#e2725b"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay, duration: 0.45, ease: "easeOut" }}
      />
    </svg>
  );
}

function PromisesScene({ promises, from, synth, onDone }: { promises: string[]; from: string; synth: Synth; onDone: () => void }) {
  const doneAt = 0.6 + promises.length * PROMISE_STEP + 0.3;

  useEffect(() => {
    const id = setTimeout(() => synth.chime(), doneAt * 1000);
    return () => clearTimeout(id);
  }, [synth, doneAt]);

  return (
    <Scene>
      <motion.div
        initial={{ rotate: -4, y: 30 }}
        animate={{ rotate: -1.2, y: 0 }}
        transition={{ type: "spring", damping: 16 }}
        className="max-h-[68cqh] w-full max-w-sm overflow-y-auto rounded-md bg-[#fffaf1] px-6 pb-6 pt-6 text-left text-[#28304f] shadow-2xl shadow-black/40"
        style={{
          backgroundImage:
            "linear-gradient(90deg, transparent 0 30px, rgba(226,114,91,.35) 30px 31px, transparent 31px), repeating-linear-gradient(transparent 0 35px, rgba(40,48,79,.09) 35px 36px)",
        }}
      >
        <h2 className="pl-4 font-hand text-[2rem] leading-tight">From now on, I promise…</h2>
        <svg viewBox="0 0 200 10" className="ml-4 h-2.5 w-44" aria-hidden>
          <motion.path
            d="M2 6 C40 2 80 9 120 5 S180 3 198 6"
            fill="none"
            stroke="#e2725b"
            strokeWidth="2.4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          />
        </svg>
        <ul className="mt-4 grid gap-3.5 pl-4">
          {promises.map((p, i) => {
            const at = 0.6 + i * PROMISE_STEP;
            return (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: at, duration: 0.5 }}
                className="flex items-start gap-3"
              >
                <TickBox delay={at + 0.55} />
                <span className="min-w-0 break-words font-hand text-[1.45rem] leading-[1.2]">{p}</span>
              </motion.li>
            );
          })}
        </ul>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: doneAt }}
          className="mt-5 truncate text-right font-hand text-2xl text-[#b5523b]"
        >
          {from}
        </motion.p>
      </motion.div>
      <div className="mt-7 flex h-14 items-center">
        <StageButton
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: doneAt + 0.3 }}
          onClick={onDone}
          style={{ background: DAWN, color: NIGHT }}
        >
          Continue →
        </StageButton>
      </div>
    </Scene>
  );
}

/* ---------------- message ---------------- */

function MessageScene({ from, message, onDone }: { from: string; message: string; onDone: () => void }) {
  const paragraphs = message.split(/\n+/).filter((p) => p.trim());
  const at = (i: number) => 0.4 + Math.min(i, 5) * 1.2;
  const doneAt = at(paragraphs.length) + 0.3;

  return (
    <Scene>
      <div className="max-h-[66cqh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/10 bg-white/[0.08] px-6 py-7 text-left shadow-2xl shadow-black/20 backdrop-blur-md">
        {paragraphs.map((p, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: at(i), duration: 0.9 }}
            className="mt-4 whitespace-pre-wrap break-words font-hand text-2xl leading-snug text-white/90 first:mt-0"
          >
            {p}
          </motion.p>
        ))}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: doneAt - 0.3 }}
          className="mt-6 truncate text-right font-hand text-2xl"
          style={{ color: DAWN }}
        >
          {from}
        </motion.p>
      </div>
      <StageButton
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: doneAt }}
        onClick={onDone}
        className="mt-8"
        style={{ background: DAWN, color: NIGHT }}
      >
        One last thing…
      </StageButton>
    </Scene>
  );
}

/* ---------------- the question ---------------- */

function QuestionScene({ onForgive, onTime }: { onForgive: () => void; onTime: () => void }) {
  return (
    <Scene>
      <motion.svg
        viewBox="0 0 24 24"
        className="h-14 w-14"
        aria-hidden
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
      >
        <path
          d="M12 21s-7.5-4.6-10-9.3C.4 8.4 2.3 4.5 6 4.5c2.2 0 3.6 1.2 4.5 2.6.3.5 1 .5 1.3 0C12.7 5.7 14.1 4.5 16.3 4.5c3.7 0 5.6 3.9 4 7.2C19.5 16.4 12 21 12 21z"
          fill="none"
          stroke="#fff"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </motion.svg>
      <h1 className="mt-6 max-w-sm font-display text-4xl leading-tight">Will you forgive me?</h1>
      <p className="mt-3 max-w-xs text-white/70">Whatever your answer is, it&apos;s okay.</p>
      <div className="mt-10 flex w-full max-w-xs flex-col gap-3">
        <StageButton onClick={onForgive} className="w-full" style={{ background: DAWN, color: NIGHT }}>
          I forgive you 🤍
        </StageButton>
        <StageButton onClick={onTime} className="w-full border border-white/40 bg-white/10 text-white backdrop-blur">
          I need a little time
        </StageButton>
      </div>
    </Scene>
  );
}

/* ---------------- endings ---------------- */

function EndLinks({
  mode,
  onReplay,
  tone,
}: {
  mode: ExperienceProps<ApologyData>["mode"];
  onReplay: () => void;
  tone: "warm" | "night";
}) {
  const soft = tone === "warm" ? "text-[#5b2a26]/70" : "text-white/70";
  return (
    <div className="mt-9 flex flex-col items-center gap-4">
      <button type="button" onClick={onReplay} className={`text-sm font-medium ${soft} underline underline-offset-4`}>
        Read it again ↺
      </button>
      {mode === "live" && (
        <Link href="/" className={`text-sm ${soft} underline underline-offset-4`}>
          Make one for someone you love
        </Link>
      )}
      {mode === "demo" && (
        <Link
          href="/create/apology"
          className="rounded-full px-6 py-3 font-semibold shadow-lg shadow-black/20"
          style={tone === "warm" ? { background: EMBER, color: "#fff4e6" } : { background: DAWN, color: NIGHT }}
        >
          Make one like this →
        </Link>
      )}
    </div>
  );
}

function ForgivenScene({
  to,
  from,
  promised,
  mode,
  onReplay,
}: {
  to: string;
  from: string;
  promised: boolean;
  mode: ExperienceProps<ApologyData>["mode"];
  onReplay: () => void;
}) {
  return (
    <Scene className="text-[#5b2a26]">
      {/* room for the sun rising behind the text */}
      <div aria-hidden className="h-[22cqh] shrink-0" />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="text-xs font-semibold uppercase tracking-[0.35em] text-[#5b2a26]/60"
      >
        The sun&apos;s out
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.9 }}
        className="mt-3 max-w-full font-display text-5xl leading-tight"
      >
        Thank you,
        <span className="block truncate">{to}.</span>
      </motion.h1>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 0.9 }}
        className="flex max-w-full flex-col items-center"
      >
        <p className="mt-4 max-w-xs text-lg text-[#5b2a26]/80">
          {promised ? "I meant every promise. You'll see." : "You have no idea how much this means to me."}
        </p>
        <p className="mt-2 max-w-full truncate font-hand text-3xl text-[#b5523b]">{from}</p>
        <EndLinks mode={mode} onReplay={onReplay} tone="warm" />
      </motion.div>
    </Scene>
  );
}

function TimeScene({ from, mode, onReplay }: { from: string; mode: ExperienceProps<ApologyData>["mode"]; onReplay: () => void }) {
  return (
    <Scene>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
        className="w-24"
      >
        <Moon className="h-auto w-full" />
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.9 }}
        className="mt-8 max-w-sm font-display text-4xl leading-tight"
      >
        Take all the time you need.
      </motion.h1>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.9 }}
        className="flex max-w-full flex-col items-center"
      >
        <p className="mt-4 max-w-full break-words text-lg text-white/80">{from} will be here. 🤍</p>
        <EndLinks mode={mode} onReplay={onReplay} tone="night" />
      </motion.div>
    </Scene>
  );
}
