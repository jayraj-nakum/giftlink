"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import type { Synth } from "../shared/audio";
import { PhotoStack } from "../shared/PhotoStack";
import { Scene, StageButton, type ExperienceProps } from "../shared/ui";
import type { Photo } from "../types";
import {
  CREAM,
  DiwaliBackground,
  DiwaliGate,
  Diya,
  DiyaRow,
  FIREWORKS,
  FloatingLanterns,
  MARIGOLD,
  PLUM,
  Rangoli,
  SAFFRON,
  SkyBursts,
  TEXT_GLOW,
  Toran,
  UNLIT,
  goldButtonStyle,
} from "./art";
import type { DiwaliData } from "./definition";

type SceneId = "gate" | "diyas" | "photos" | "message" | "finale";

/** An original, unhurried melody on the D major pentatonic (D E F# A B), octaves 4 and 5. */
const DIWALI_TUNE: Parameters<Synth["play"]>[0] = [
  ["D4", 1], ["F#4", 0.5], ["A4", 0.5], ["B4", 1], ["A4", 1],
  ["F#4", 0.5], ["E4", 0.5], ["D4", 1], ["E4", 2],
  ["F#4", 1], ["A4", 0.5], ["B4", 0.5], ["D5", 1], ["B4", 1],
  ["A4", 0.5], ["B4", 0.5], ["A4", 1], ["F#4", 2],
  ["A4", 1], ["B4", 0.5], ["D5", 0.5], ["E5", 1], ["D5", 1],
  ["B4", 0.5], ["D5", 0.5], ["E5", 1], ["F#5", 2],
  ["E5", 1], ["D5", 0.5], ["B4", 0.5], ["A4", 1], ["F#4", 1],
  ["E4", 0.5], ["F#4", 0.5], ["E4", 1], ["D4", 2],
  [null, 2],
];

/** When each firework goes off after the last diya is lit (ms). */
const FIREWORK_TIMES = [700, 2000, 3200];

export default function DiwaliExperience({ data, mode, synth, fx, onEvent }: ExperienceProps<DiwaliData>) {
  const [scene, setScene] = useState<SceneId>("gate");
  const [lit, setLit] = useState<readonly boolean[]>(UNLIT);
  const [round, setRound] = useState(0);
  const completed = useRef(false);

  const greeting = data.greeting || "Happy Diwali";
  const photos = (data.photos ?? []).filter((p) => !!p.url) as Photo[];
  const litCount = lit.filter(Boolean).length;

  const order: SceneId[] = ["diyas", ...(photos.length ? (["photos"] as const) : []), "message", "finale"];
  const next = () => setScene(order[order.indexOf(scene) + 1] ?? "finale");

  const light = (i: number) => {
    if (lit[i]) return;
    synth.unlock();
    synth.chime();
    if (litCount === 0) synth.play(DIWALI_TUNE, { bpm: 76 });
    const nextLit = lit.map((on, j) => on || j === i);
    setLit(nextLit);
    if (nextLit.every(Boolean)) {
      for (const t of FIREWORK_TIMES) {
        setTimeout(() => synth.whoosh(), t - 380);
        setTimeout(() => {
          synth.pop();
          fx.burst(FIREWORKS);
        }, t);
      }
      setTimeout(() => fx.shower("✨", 36), 1300);
    }
  };

  const finish = () => {
    if (!completed.current) {
      completed.current = true;
      onEvent("complete");
    }
    setScene("finale");
    setTimeout(() => fx.burst(FIREWORKS), 500);
  };

  const replay = () => {
    synth.stop();
    setLit(UNLIT);
    setRound((r) => r + 1);
    setScene("diyas");
  };

  return (
    <DiwaliBackground warmth={litCount / lit.length} lanterns={scene === "gate" || scene === "diyas"}>
      <AnimatePresence mode="wait">
        {scene === "gate" && (
          <Scene key="gate">
            <DiwaliGate
              to={data.to}
              from={data.from}
              action={
                <StageButton
                  onClick={() => {
                    synth.unlock();
                    setScene("diyas");
                  }}
                  className="mt-9"
                  style={goldButtonStyle}
                >
                  Light the diyas
                </StageButton>
              }
            />
          </Scene>
        )}
        {scene === "diyas" && (
          <DiyaScene
            key={`diyas-${round}`}
            to={data.to}
            greeting={greeting}
            lit={lit}
            onLight={light}
            nextLabel={photos.length ? "See our moments →" : "Read my wishes →"}
            onDone={next}
          />
        )}
        {scene === "photos" && (
          <Scene key="photos">
            <h2 className="mb-8 font-display text-3xl" style={{ color: MARIGOLD, textShadow: TEXT_GLOW }}>
              Moments that glow
            </h2>
            <PhotoStack photos={photos} onDone={next} />
          </Scene>
        )}
        {scene === "message" && (
          <MessageScene key="message" to={data.to} from={data.from} message={data.message} onDone={finish} />
        )}
        {scene === "finale" && (
          <FinaleScene key="finale" greeting={greeting} to={data.to} from={data.from} mode={mode} onReplay={replay} />
        )}
      </AnimatePresence>
    </DiwaliBackground>
  );
}

/* ---------------- scenes ---------------- */

function DiyaScene({
  to,
  greeting,
  lit,
  onLight,
  nextLabel,
  onDone,
}: {
  to: string;
  greeting: string;
  lit: readonly boolean[];
  onLight: (i: number) => void;
  nextLabel: string;
  onDone: () => void;
}) {
  const litCount = lit.filter(Boolean).length;
  const bloom = litCount === lit.length;

  return (
    <Scene className="pt-[9cqh]">
      {bloom && <SkyBursts />}
      <div className="relative flex min-h-[18cqh] w-full flex-col items-center justify-end">
        <AnimatePresence mode="wait">
          {!bloom ? (
            <motion.div key="ask" exit={{ opacity: 0, y: -10, transition: { duration: 0.3 } }}>
              <h2 className="font-display text-3xl leading-tight">Light the diyas</h2>
              <p className="mt-2 text-white/75" aria-live="polite">
                {litCount === 0 ? "Tap each one to light it" : `${litCount} of ${lit.length} lit`}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="greet"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9, type: "spring", damping: 12 }}
              className="w-full"
              aria-live="polite"
            >
              <h2 className="font-display text-4xl leading-tight" style={{ color: MARIGOLD, textShadow: TEXT_GLOW }}>
                {greeting},
              </h2>
              <p className="mx-auto mt-1 max-w-full truncate font-display text-4xl leading-tight">{to}!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative mt-[3cqh] w-[min(66cqw,34cqh)] max-w-[340px]">
        <Rangoli bloom={bloom} />
      </div>

      <div className="relative mt-[2cqh]">
        <DiyaRow lit={lit} onLight={onLight} />
      </div>

      <div className="relative mt-6 flex h-14 items-center justify-center">
        {bloom ? (
          <StageButton
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3.4 }}
            onClick={onDone}
            style={goldButtonStyle}
          >
            {nextLabel}
          </StageButton>
        ) : (
          <p className="text-sm text-white/55">The more you light, the warmer it gets</p>
        )}
      </div>
    </Scene>
  );
}

function MessageScene({
  to,
  from,
  message,
  onDone,
}: {
  to: string;
  from: string;
  message: string;
  onDone: () => void;
}) {
  const paragraphs = message.split(/\n+/).filter((p) => p.trim());
  const doneAt = 1 + paragraphs.length * 1.1;

  return (
    <Scene>
      <motion.article
        initial={{ y: 50, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 18 }}
        className="flex max-h-[70cqh] w-full max-w-md flex-col overflow-hidden rounded-[22px] text-left"
        style={{
          background: "#fff8e8",
          border: `3px solid ${MARIGOLD}`,
          boxShadow:
            "0 0 0 6px rgba(255,182,39,0.16), 0 0 60px rgba(255,150,50,0.28), 0 30px 60px -24px rgba(0,0,0,0.7)",
        }}
      >
        <Toran className="shrink-0" />
        <div className="overflow-y-auto px-6 pb-6 pt-1">
          <p className="break-words font-display text-2xl" style={{ color: "#9a3412" }}>
            Dear {to},
          </p>
          {paragraphs.map((p, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 1.1, duration: 0.8 }}
              className="mt-4 whitespace-pre-wrap break-words font-hand text-[1.45rem] leading-snug text-[#3b1a0e]"
            >
              {p}
            </motion.p>
          ))}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: doneAt - 0.3 }}
            className="mt-5 break-words text-right font-hand text-2xl"
            style={{ color: "#c2410c" }}
          >
            with love, {from}
          </motion.p>
        </div>
        <div
          aria-hidden
          className="h-2 shrink-0"
          style={{ background: `repeating-linear-gradient(90deg, ${MARIGOLD} 0 12px, ${SAFFRON} 12px 24px)` }}
        />
      </motion.article>
      <StageButton
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: doneAt }}
        onClick={onDone}
        className="mt-7"
        style={goldButtonStyle}
      >
        One last thing ✨
      </StageButton>
    </Scene>
  );
}

function FinaleScene({
  greeting,
  to,
  from,
  mode,
  onReplay,
}: {
  greeting: string;
  to: string;
  from: string;
  mode: ExperienceProps<DiwaliData>["mode"];
  onReplay: () => void;
}) {
  return (
    <Scene>
      <FloatingLanterns />
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 12 }}
        className="relative w-[min(28cqw,15cqh)] max-w-[130px]"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[40%] block aspect-square w-[340%] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(closest-side, rgba(255,196,90,0.55), rgba(255,123,37,0.18) 55%, rgba(255,123,37,0) 100%)",
          }}
        />
        <div className="relative">
          <Diya lit />
        </div>
      </motion.div>
      <motion.h1
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.8 }}
        className="relative mt-6 text-balance font-display text-5xl leading-tight"
        style={{ color: MARIGOLD, textShadow: TEXT_GLOW }}
      >
        {greeting}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="relative mt-3 max-w-full truncate font-hand text-3xl"
        style={{ color: CREAM }}
      >
        from {from}
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="relative mt-3 max-w-xs break-words text-white/75"
      >
        May your year be as bright as tonight, {to}.
      </motion.p>
      <div className="relative mt-10 flex flex-col items-center gap-4">
        <StageButton onClick={onReplay} style={goldButtonStyle}>
          Play again ↺
        </StageButton>
        {mode === "live" && (
          <Link href="/" className="text-sm text-white/70 underline underline-offset-4">
            Make one for someone you love
          </Link>
        )}
        {mode === "demo" && (
          <Link
            href="/create/diwali"
            className="rounded-full px-6 py-3 font-semibold"
            style={{ background: SAFFRON, color: PLUM }}
          >
            Make one like this →
          </Link>
        )}
      </div>
    </Scene>
  );
}
