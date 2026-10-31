"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { SOFT_ARPEGGIO } from "../shared/audio";
import { Scene, StageButton, seeded, type ExperienceProps } from "../shared/ui";
import type { Photo } from "../types";
import { ProposalBackground, ProposalGate, ROSE } from "./art";
import { questionText, type ProposalData } from "./definition";

type SceneId = "gate" | "intro" | "photos" | "message" | "question" | "yes";

const NO_LINES = [
  "No",
  "Are you sure?",
  "Really sure?",
  "Think again 🥺",
  "Pretty please?",
  "Last chance!",
  "You're breaking my heart 💔",
  "Okay, try the other one 😌",
];

export default function ProposalExperience({ data, mode, synth, fx, onEvent }: ExperienceProps<ProposalData>) {
  const [scene, setScene] = useState<SceneId>("gate");
  const toPhotos = useCallback(() => setScene("photos"), []);
  const toMessage = useCallback(() => setScene("message"), []);

  return (
    <ProposalBackground hearts={scene === "yes" ? 32 : 14}>
      <AnimatePresence mode="wait">
        {scene === "gate" && (
          <Scene key="gate">
            <ProposalGate
              to={data.to}
              from={data.from}
              action={
                <StageButton
                  onClick={() => {
                    synth.unlock();
                    synth.play(SOFT_ARPEGGIO, { bpm: 84 });
                    setScene("intro");
                  }}
                  className="mt-10 text-white"
                  style={{ background: ROSE }}
                >
                  Open it 💌
                </StageButton>
              }
            />
          </Scene>
        )}
        {scene === "intro" && <IntroScene key="intro" onDone={toPhotos} />}
        {scene === "photos" && (
          <Scene key="photos">
            <Slideshow photos={data.photos as Photo[]} onDone={toMessage} />
          </Scene>
        )}
        {scene === "message" && (
          <MessageScene key="message" to={data.to} from={data.from} message={data.message} onDone={() => setScene("question")} />
        )}
        {scene === "question" && (
          <QuestionScene
            key="question"
            question={questionText(data)}
            onYes={() => {
              synth.chime();
              fx.hearts();
              onEvent("yes");
              onEvent("complete");
              setScene("yes");
            }}
          />
        )}
        {scene === "yes" && (
          <Scene key="yes">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 8 }}
              className="text-7xl"
            >
              {data.question === "marry" ? "💍" : "💖"}
            </motion.div>
            <h1 className="mt-4 font-display text-6xl">Yay!</h1>
            <p className="mt-3 text-xl text-white/90">{data.to} said yes.</p>
            {mode === "live" && (
              <p className="mt-6 max-w-xs text-sm text-white/70">
                {data.from} can see your answer now. Take a screenshot and send it to them too. 📸
              </p>
            )}
            {mode === "live" && (
              <Link href="/" className="mt-10 text-sm text-white/60 underline underline-offset-4">
                Make one for someone you love
              </Link>
            )}
            {mode === "demo" && (
              <Link href="/create/proposal" className="mt-10 rounded-full px-6 py-3 font-semibold" style={{ background: ROSE }}>
                Make one like this →
              </Link>
            )}
          </Scene>
        )}
      </AnimatePresence>
    </ProposalBackground>
  );
}

function IntroScene({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const id = setTimeout(onDone, 5200);
    return () => clearTimeout(id);
  }, [onDone]);

  return (
    <Scene>
      <button type="button" onClick={onDone} className="flex flex-col gap-4 font-display text-3xl leading-snug">
        <motion.span initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 1 }}>
          Every story has a beginning…
        </motion.span>
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 1 }}
          className="text-[#ffb3c9]"
        >
          …and ours has a few favourite pages.
        </motion.span>
      </button>
    </Scene>
  );
}

function Slideshow({ photos, onDone }: { photos: Photo[]; onDone: () => void }) {
  const [index, setIndex] = useState(0);
  const advance = useCallback(() => {
    if (index + 1 >= photos.length) onDone();
    else setIndex(index + 1);
  }, [index, photos.length, onDone]);

  useEffect(() => {
    const id = setTimeout(advance, 4200);
    return () => clearTimeout(id);
  }, [advance]);

  const photo = photos[index];
  return (
    <button type="button" onClick={advance} className="flex w-full flex-col items-center" aria-label="Next photo">
      <div className="relative aspect-[4/5] w-[80cqw] max-w-[360px] overflow-hidden rounded-3xl shadow-2xl shadow-black/50">
        <AnimatePresence>
          <motion.img
            key={index}
            src={photo?.url}
            alt={photo?.caption || "A shared memory"}
            draggable={false}
            initial={{ opacity: 0, scale: 1.12 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ opacity: { duration: 0.8 }, scale: { duration: 4.5, ease: "linear" } }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>
      </div>
      <p className="mt-6 min-h-9 font-hand text-3xl text-[#ffd1de]">{photo?.caption}</p>
      <div className="mt-4 flex gap-2">
        {photos.map((_, i) => (
          <span key={i} className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-1.5 bg-white/35"}`} />
        ))}
      </div>
    </button>
  );
}

function MessageScene({ to, from, message, onDone }: { to: string; from: string; message: string; onDone: () => void }) {
  const paragraphs = message.split(/\n+/).filter((p) => p.trim());
  const doneAt = paragraphs.length * 1.3 + 0.8;
  return (
    <Scene>
      <div className="max-h-[66cqh] w-full max-w-md overflow-y-auto rounded-3xl bg-white/[0.08] px-6 py-7 text-left backdrop-blur-md">
        <p className="font-display text-2xl">{to},</p>
        {paragraphs.map((p, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 1.3, duration: 0.9 }}
            className="mt-4 whitespace-pre-wrap break-words font-hand text-2xl leading-snug text-white/90"
          >
            {p}
          </motion.p>
        ))}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: doneAt - 0.4 }}
          className="mt-6 text-right font-hand text-2xl text-[#ffb3c9]"
        >
          {from}
        </motion.p>
      </div>
      <StageButton
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: doneAt }}
        onClick={onDone}
        className="mt-8 text-white"
        style={{ background: ROSE }}
      >
        I have a question…
      </StageButton>
    </Scene>
  );
}

function QuestionScene({ question, onYes }: { question: string; onYes: () => void }) {
  const [dodges, setDodges] = useState(0);
  const gaveUp = dodges >= NO_LINES.length + 2;

  const dodge = (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    setDodges((d) => d + 1);
  };
  const noProps = {
    type: "button" as const,
    onPointerDown: dodge,
    onMouseEnter: () => dodge(),
    onClick: dodge,
    className: "whitespace-nowrap rounded-full border border-white/30 bg-white/5 px-6 py-3 text-white/85 backdrop-blur",
  };
  const label = NO_LINES[Math.min(Math.max(dodges - 1, 0), NO_LINES.length - 1)];

  return (
    <Scene>
      <p className="text-5xl">💌</p>
      <h1 className="mt-5 max-w-sm font-display text-4xl leading-tight">{question}</h1>
      <div className="mt-14 flex min-h-20 items-center justify-center gap-6">
        <StageButton
          animate={{ scale: Math.min(1 + dodges * 0.14, 2) }}
          onClick={onYes}
          className="px-10 text-lg text-white"
          style={{ background: ROSE }}
        >
          Yes 💖
        </StageButton>
        {dodges === 0 && <button {...noProps}>No</button>}
      </div>
      {dodges > 0 && !gaveUp && (
        <motion.button
          {...noProps}
          className={`absolute z-20 ${noProps.className}`}
          initial={false}
          // Alternate between a band above the question and one below the buttons, so it never covers "Yes".
          animate={{
            left: `${6 + seeded(dodges * 7) * 56}%`,
            top: `${dodges % 2 ? 12 + seeded(dodges * 13) * 14 : 74 + seeded(dodges * 13) * 12}%`,
          }}
          transition={{ type: "spring", stiffness: 420, damping: 26 }}
        >
          {label}
        </motion.button>
      )}
      {gaveUp && <p className="mt-6 text-sm text-white/60">The No button gave up. 😌</p>}
    </Scene>
  );
}
