"use client";

import Link from "next/link";
import { AnimatePresence, motion, useAnimate } from "motion/react";
import { useCallback, useState } from "react";
import { HAPPY_BIRTHDAY, type Synth } from "../shared/audio";
import type { Fx } from "../shared/confetti";
import { Countdown } from "../shared/Countdown";
import { LetterReveal } from "../shared/LetterReveal";
import { PhotoStack } from "../shared/PhotoStack";
import { Scene, StageButton, seeded, type ExperienceProps } from "../shared/ui";
import { localMidnightOf, type Photo } from "../types";
import { BirthdayBackground, GiftBox, GiftTag } from "./art";
import type { BirthdayData } from "./definition";

type SceneId = "countdown" | "gift" | "cake" | "balloons" | "photos" | "letter" | "finale";

const BALLOON_COLORS = ["#ff5a4e", "#ffc24b", "#6fd3bd", "#c9a7ff", "#ff8fb1", "#7cc4ff"];

/** Midnight (recipient's local time) on the birthday, if it's still ahead of us. */
function unlockTime(data: BirthdayData): number | null {
  if (!data.birthday) return null;
  const at = localMidnightOf(data.birthday).getTime();
  const ahead = at - Date.now();
  return ahead > 0 && ahead < 100 * 86_400_000 ? at : null;
}

export default function BirthdayExperience({ data, mode, synth, fx, onEvent }: ExperienceProps<BirthdayData>) {
  const [unlockAt] = useState(() => unlockTime(data));
  const [scene, setScene] = useState<SceneId>(unlockAt ? "countdown" : "gift");

  const order: SceneId[] = ["gift", "cake", ...(data.wishes.length ? (["balloons"] as const) : []), "photos", "letter", "finale"];
  const next = () => setScene(order[order.indexOf(scene) + 1] ?? "finale");
  const unlock = useCallback(() => setScene("gift"), []);

  return (
    <BirthdayBackground>
      <AnimatePresence mode="wait">
        {scene === "countdown" && unlockAt && (
          <Scene key="countdown">
            <Countdown
              target={unlockAt}
              title={`${data.to}, your surprise opens at midnight`}
              onDone={unlock}
              onSkip={mode === "live" ? undefined : unlock}
            />
          </Scene>
        )}
        {scene === "gift" && <GiftScene key="gift" to={data.to} synth={synth} fx={fx} onOpen={next} />}
        {scene === "cake" && <CakeScene key="cake" to={data.to} age={data.age} synth={synth} fx={fx} onDone={next} />}
        {scene === "balloons" && <BalloonsScene key="balloons" wishes={data.wishes} synth={synth} onDone={next} />}
        {scene === "photos" && (
          <Scene key="photos">
            <h2 className="mb-8 font-display text-3xl">A few favourite moments</h2>
            <PhotoStack photos={data.photos as Photo[]} onDone={next} />
          </Scene>
        )}
        {scene === "letter" && (
          <Scene key="letter">
            <h2 className="mb-6 font-display text-2xl text-white/90">And one last thing…</h2>
            <LetterReveal
              text={data.letter}
              from={data.from}
              synth={synth}
              cta="One more thing"
              onDone={() => {
                onEvent("complete");
                setScene("finale");
                setTimeout(() => fx.burst(), 500);
              }}
            />
          </Scene>
        )}
        {scene === "finale" && (
          <FinaleScene key="finale" to={data.to} from={data.from} mode={mode} onReplay={() => setScene("gift")} />
        )}
      </AnimatePresence>
    </BirthdayBackground>
  );
}

/* ---------------- scenes ---------------- */

function GiftScene({ to, synth, fx, onOpen }: { to: string; synth: Synth; fx: Fx; onOpen: () => void }) {
  const [taps, setTaps] = useState(0);
  const [scope, animate] = useAnimate();
  const opened = taps >= 3;

  const tap = () => {
    if (opened) return;
    synth.unlock();
    const n = taps + 1;
    setTaps(n);
    if (n < 3) {
      synth.pop();
      void animate(scope.current, { rotate: [0, -9, 9, -6, 6, 0], scale: [1, 1.05, 1] }, { duration: 0.5 });
    } else {
      synth.chime();
      fx.burst();
      setTimeout(onOpen, 1600);
    }
  };

  return (
    <Scene>
      <p className="text-xs uppercase tracking-[0.35em] text-white/60">A surprise for</p>
      <h1 className="mt-2 max-w-full truncate font-display text-5xl text-[#ffc24b]">{to}</h1>
      <button type="button" onClick={tap} aria-label="Open the gift" className="relative mt-10 h-60 w-60 outline-none">
        {opened && (
          <motion.span
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1.4 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(255,214,120,.75) 0%, rgba(255,214,120,0) 65%)" }}
          />
        )}
        <div ref={scope} className="relative h-full w-full">
          <GiftBox opened={opened} />
          <GiftTag to={to} />
        </div>
      </button>
      <p className="mt-8 h-6 text-white/80" aria-live="polite">
        {["Tap the gift", "Again!", "One more time…", ""][taps]}
      </p>
    </Scene>
  );
}

function CakeScene({ to, age, synth, fx, onDone }: { to: string; age?: number; synth: Synth; fx: Fx; onDone: () => void }) {
  const count = age && age < 5 ? age : 5;
  const [lit, setLit] = useState<boolean[]>(() => Array.from({ length: count }, () => true));
  const allOut = lit.every((on) => !on);

  const celebrate = () => {
    synth.play(HAPPY_BIRTHDAY, { bpm: 108 });
    setTimeout(() => fx.burst(), 300);
  };
  const blow = (i: number) => {
    if (!lit[i]) return;
    synth.unlock();
    synth.whoosh();
    const nextLit = lit.map((on, j) => (j === i ? false : on));
    setLit(nextLit);
    if (nextLit.every((on) => !on)) celebrate();
  };
  const blowAll = () => {
    synth.unlock();
    synth.whoosh();
    setLit(lit.map(() => false));
    celebrate();
  };

  return (
    <Scene>
      <AnimatePresence mode="wait">
        {!allOut ? (
          <motion.div key="wish" exit={{ opacity: 0 }}>
            <h2 className="font-display text-3xl">Make a wish, {to} ✨</h2>
            <p className="mt-2 text-white/70">then tap each candle to blow it out</p>
          </motion.div>
        ) : (
          <motion.div key="hb" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
            <h2 className="font-display text-4xl text-[#ffc24b]">Happy Birthday, {to}! 🎉</h2>
            <p className="mt-2 text-white/70">Your wish is on its way.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative mt-10 h-[240px] w-[280px]">
        <svg viewBox="0 0 280 240" className="absolute inset-0 h-full w-full drop-shadow-2xl">
          <ellipse cx="140" cy="224" rx="128" ry="14" fill="#efe3ff" opacity="0.9" />
          <rect x="30" y="140" width="220" height="82" rx="14" fill="#ff8fb1" />
          <path d="M30 152 q14 18 28 0 q14 18 28 0 q14 18 28 0 q14 18 28 0 q14 18 28 0 q14 18 28 0 q14 18 28 0 q14 18 24 0 V140 H30z" fill="#fff0f5" />
          <rect x="62" y="82" width="156" height="66" rx="12" fill="#fff0f5" />
          <path d="M62 92 q13 16 26 0 q13 16 26 0 q13 16 26 0 q13 16 26 0 q13 16 26 0 q13 16 26 0 V82 H62z" fill="#ff5a4e" />
          {Array.from({ length: 18 }, (_, i) => (
            <rect
              key={i}
              x={70 + seeded(i) * 140}
              y={104 + seeded(i + 40) * 36}
              width="7"
              height="2.5"
              rx="1.2"
              fill={BALLOON_COLORS[i % BALLOON_COLORS.length]}
              transform={`rotate(${seeded(i + 80) * 180} ${70 + seeded(i) * 140} ${104 + seeded(i + 40) * 36})`}
            />
          ))}
          {age ? (
            <text x="140" y="200" textAnchor="middle" fontSize="34" fontWeight="700" fill="#fff" style={{ fontFamily: "var(--nf-display)" }}>
              {age}
            </text>
          ) : null}
        </svg>
        {lit.map((on, i) => {
          const left = 78 + (count === 1 ? 62 : (i * 124) / (count - 1));
          return (
            <button
              key={i}
              type="button"
              aria-label={on ? `Blow out candle ${i + 1}` : `Candle ${i + 1} is out`}
              onClick={() => blow(i)}
              className="absolute top-[18px] h-16 w-10 -translate-x-1/2"
              style={{ left }}
            >
              <span
                className="absolute bottom-0 left-1/2 h-11 w-3 -translate-x-1/2 rounded-sm"
                style={{ background: "repeating-linear-gradient(45deg,#fff 0 5px,#7cc4ff 5px 10px)" }}
              />
              <AnimatePresence>
                {on ? (
                  <motion.span
                    key="flame"
                    exit={{ scale: 0, opacity: 0, transition: { duration: 0.25 } }}
                    className="flame absolute bottom-11 left-1/2 -ml-[7px] block h-5 w-[14px] rounded-[50%_50%_50%_50%/60%_60%_40%_40%]"
                    style={{
                      background: "radial-gradient(circle at 50% 70%, #fff7c2 0%, #ffc24b 45%, #ff7a2f 100%)",
                      boxShadow: "0 0 18px 6px rgba(255,190,80,.45)",
                    }}
                  />
                ) : (
                  <motion.span
                    key="smoke"
                    initial={{ opacity: 0.7, y: 0, scale: 0.6 }}
                    animate={{ opacity: 0, y: -40, scale: 1.6 }}
                    transition={{ duration: 1.4 }}
                    className="absolute bottom-11 left-1/2 -ml-2 block h-4 w-4 rounded-full bg-white/50 blur-[3px]"
                  />
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </div>

      {!allOut ? (
        <button type="button" onClick={blowAll} className="mt-8 text-sm text-white/60 underline underline-offset-4">
          Blow them all at once 🌬️
        </button>
      ) : (
        <StageButton
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          onClick={onDone}
          className="mt-8 bg-white text-[#2b1846]"
        >
          Keep going →
        </StageButton>
      )}
    </Scene>
  );
}

function Balloon({ color, className = "" }: { color: string; className?: string }) {
  return (
    <svg viewBox="0 0 60 96" className={className} aria-hidden>
      <ellipse cx="30" cy="31" rx="25" ry="30" fill={color} />
      <ellipse cx="21" cy="19" rx="6" ry="9" fill="#fff" opacity="0.35" />
      <path d="M26 60 L34 60 L30 66 Z" fill={color} />
      <path d="M30 66 C 26 76, 34 82, 30 96" stroke="#ffffff99" strokeWidth="1.2" fill="none" />
    </svg>
  );
}

function BalloonsScene({ wishes, synth, onDone }: { wishes: string[]; synth: Synth; onDone: () => void }) {
  const [popped, setPopped] = useState<boolean[]>(() => wishes.map(() => false));
  const allPopped = popped.every(Boolean);

  return (
    <Scene>
      <h2 className="font-display text-3xl">Pop the balloons 🎈</h2>
      <p className="mt-2 text-white/70">Each one is hiding a wish for you.</p>
      <div className="mt-8 grid w-full max-w-sm grid-cols-2 gap-x-4 gap-y-2">
        {wishes.map((wish, i) => (
          <div key={i} className="flex h-[19cqh] max-h-40 min-h-28 items-center justify-center">
            <AnimatePresence mode="wait">
              {!popped[i] ? (
                <motion.button
                  key="balloon"
                  type="button"
                  aria-label="Pop this balloon"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2.4 + seeded(i) * 1.2, ease: "easeInOut" }}
                  exit={{ scale: 1.6, opacity: 0, transition: { duration: 0.15 } }}
                  onClick={() => {
                    synth.unlock();
                    synth.pop();
                    setPopped((p) => p.map((v, j) => (j === i ? true : v)));
                  }}
                  className="h-full"
                >
                  <Balloon color={BALLOON_COLORS[i % BALLOON_COLORS.length]} className="h-full w-auto drop-shadow-xl" />
                </motion.button>
              ) : (
                <motion.p
                  key="wish"
                  initial={{ scale: 0.5, opacity: 0, rotate: seeded(i) * 10 - 5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", damping: 12 }}
                  className="rounded-lg bg-[#fff8f0] px-3 py-3 font-hand text-xl leading-tight text-[#2b1846] shadow-lg"
                >
                  {wish}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
      {allPopped && (
        <StageButton
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={onDone}
          className="mt-6 bg-white text-[#2b1846]"
        >
          Next →
        </StageButton>
      )}
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
  mode: ExperienceProps<BirthdayData>["mode"];
  onReplay: () => void;
}) {
  return (
    <Scene>
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 12 }, (_, i) => (
          <span
            key={i}
            className="absolute bottom-[-120px] w-14"
            style={{
              left: `${seeded(i + 7) * 92}%`,
              animation: `float-up ${9 + seeded(i + 3) * 7}s linear ${-seeded(i + 11) * 12}s infinite`,
            }}
          >
            <Balloon color={BALLOON_COLORS[i % BALLOON_COLORS.length]} className="w-full opacity-80" />
          </span>
        ))}
      </div>
      <motion.h1
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 10 }}
        className="relative font-display text-5xl leading-tight"
      >
        Happy Birthday,
        <br />
        <span className="text-[#ffc24b]">{to}!</span>
      </motion.h1>
      <p className="relative mt-4 text-white/75">From {from}, with all the love in the world.</p>
      <div className="relative mt-10 flex flex-col items-center gap-4">
        <StageButton onClick={onReplay} className="bg-white text-[#2b1846]">
          Play it again ↺
        </StageButton>
        {mode === "live" && (
          <Link href="/" className="text-sm text-white/70 underline underline-offset-4">
            Make one for someone you love
          </Link>
        )}
        {mode === "demo" && (
          <Link href="/create/birthday" className="rounded-full bg-[#ff5a4e] px-6 py-3 font-semibold">
            Make one like this →
          </Link>
        )}
      </div>
    </Scene>
  );
}
