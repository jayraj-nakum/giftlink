"use client";

import { ArrowRight, Check, CheckCheck, Eye, Lock } from "lucide-react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Cover, type GiftCard } from "@/components/home/GiftPicker";
import { PhoneFrame, ScaledScreen } from "@/components/site/PhoneFrame";
import { pricing } from "@/config/site";

const TO = "Meera";
const FROM = "Kabir";
const PER_GIFT_MS = 1500;

/**
 * "How it works": three steps on the left, a phone on the right that acts each one out.
 * Auto-advances while on screen; tapping a step jumps to it.
 */
export function HowItWorks({ cards }: { cards: GiftCard[] }) {
  const steps = useMemo(
    () => [
      {
        title: "Personalise it",
        body: "Pick a gift, add their name, a few photos and your words. About five minutes, on your phone.",
        ms: 6500,
      },
      {
        title: `Watch it free, then pay ${pricing.displayPrice}`,
        body: `Play the whole gift with your own photos first. All ${cards.length} gifts have a free preview.`,
        ms: Math.max(7000, cards.length * PER_GIFT_MS),
      },
      {
        title: "Send one link",
        body: `Share it on WhatsApp or anywhere. No app needed, and the link stays live for ${pricing.lifetimeDays} days.`,
        ms: 7000,
      },
    ],
    [cards.length],
  );

  const [active, setActive] = useState(0);
  const [round, setRound] = useState(0); // bumps on every tap so the timer restarts
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.45 });
  const reduce = useReducedMotion();
  const playing = inView && !reduce;

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % steps.length), steps[active].ms);
    return () => clearTimeout(t);
  }, [active, round, playing, steps]);

  function pick(i: number) {
    setActive(i);
    setRound((r) => r + 1);
  }

  return (
    // Phones: heading, phone, steps. Desktop: heading + steps on the left, phone on the right.
    <div
      ref={ref}
      className="grid gap-8 lg:grid-cols-[1fr_auto] lg:grid-rows-[auto_1fr] lg:gap-x-20 lg:gap-y-10"
    >
      <div className="lg:col-start-1 lg:row-start-1 lg:self-end">
        <p className="text-sm font-bold uppercase tracking-widest text-coral">How it works</p>
        <h2 className="mt-2 font-display text-4xl font-semibold md:text-5xl">Three steps, all on your phone</h2>
      </div>

      <div className="max-lg:order-last lg:col-start-1 lg:row-start-2">
        <ol className="grid max-w-xl gap-2">
          {steps.map((s, i) => {
            const on = i === active;
            return (
              <li key={s.title}>
                <button
                  type="button"
                  onClick={() => pick(i)}
                  aria-current={on ? "step" : undefined}
                  className={`relative flex w-full gap-5 overflow-hidden rounded-3xl border px-6 py-5 text-left transition duration-300 ${
                    on
                      ? "border-line bg-white shadow-[0_20px_40px_-24px_rgba(36,23,43,0.3)]"
                      : "border-transparent hover:bg-white/50"
                  }`}
                >
                  <span
                    className={`font-display text-3xl font-semibold leading-none transition-colors ${on ? "text-coral" : "text-coral/30"}`}
                  >
                    {i + 1}
                  </span>
                  <span>
                    <span className={`block text-lg font-semibold transition-colors ${on ? "text-ink" : "text-ink/70"}`}>
                      {s.title}
                    </span>
                    {/* Phones show only the active step's text, so the phone stays close by */}
                    <span className={`mt-1 leading-relaxed text-ink-soft ${on ? "block" : "hidden lg:block"}`}>{s.body}</span>
                  </span>
                  {on && playing && (
                    <motion.span
                      key={`${active}-${round}`}
                      aria-hidden
                      className="absolute inset-x-0 bottom-0 h-[3px] origin-left bg-coral/70"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: s.ms / 1000, ease: "linear" }}
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ol>

        <a
          href="#gifts"
          className="ml-6 mt-6 inline-flex items-center gap-2 font-semibold text-coral transition hover:text-coral-deep"
        >
          Pick a gift to start <ArrowRight size={18} />
        </a>
      </div>

      {/* The phone that acts out the active step */}
      <div className="relative mx-auto max-lg:[zoom:0.82] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
        <div
          aria-hidden
          className="absolute inset-x-4 bottom-4 top-12 rounded-[3rem] opacity-40 blur-2xl"
          style={{ background: "linear-gradient(160deg, #ffb199, #ff5a4e)" }}
        />
        <PhoneFrame className="relative">
          <ScaledScreen width={290}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={active}
                className="absolute inset-0"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                {active === 0 && <FormScreen />}
                {active === 1 && <PreviewScreen cards={cards} playing={playing} />}
                {active === 2 && <SendScreen />}
              </motion.div>
            </AnimatePresence>
          </ScaledScreen>
        </PhoneFrame>
      </div>
    </div>
  );
}

/* ---------- Step 1: the form fills itself in ---------- */

function useTyped(text: string, startMs: number) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let iv: ReturnType<typeof setInterval> | undefined;
    const t = setTimeout(() => {
      let i = 0;
      iv = setInterval(() => {
        i += 1;
        setN(i);
        if (i >= text.length) clearInterval(iv);
      }, 110);
    }, startMs);
    return () => {
      clearTimeout(t);
      clearInterval(iv);
    };
  }, [text, startMs]);
  return text.slice(0, n);
}

function FormScreen() {
  const to = useTyped(TO, 500);
  const from = useTyped(FROM, 1500);
  const age = useTyped("25", 2500);
  const done = age.length === 2;

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#fff1e8] to-cream px-6 pt-16">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full ${i === 0 ? "bg-coral" : "bg-ink/10"}`} />
        ))}
      </div>
      <div className="mt-6 rounded-[28px] border border-line bg-white p-6 shadow-[0_20px_50px_-30px_rgba(36,23,43,0.25)]">
        <p className="font-display text-sm font-semibold text-ink-soft">
          <span className="text-3xl text-coral">01</span> / 05
        </p>
        <p className="mt-2 font-display text-[1.75rem] font-semibold leading-tight">Whose birthday is it?</p>
        <p className="mt-1.5 text-ink-soft">Their name goes on the gift tag.</p>
        <div className="mt-6 grid gap-4">
          <FakeField label="Their name" value={to} focused={to.length < TO.length} />
          <FakeField label="Your name" value={from} focused={to.length === TO.length && from.length < FROM.length} />
          <FakeField label="Turning (optional)" value={age} focused={from.length === FROM.length && !done} />
        </div>
      </div>
      <motion.div
        animate={done ? { scale: [1, 1.04, 1] } : {}}
        transition={{ duration: 0.4 }}
        className={`mt-6 flex items-center justify-center gap-2 rounded-full py-4 font-semibold text-white transition-colors ${done ? "bg-ink" : "bg-ink/40"}`}
      >
        Next <ArrowRight size={18} />
      </motion.div>
      {/* The next step, peeking in */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={done ? { opacity: 0.55, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="mt-6 rounded-[28px] border border-line bg-white p-6"
      >
        <p className="font-display text-sm font-semibold text-ink-soft">
          <span className="text-3xl text-coral">02</span> / 05
        </p>
        <p className="mt-2 font-display text-[1.75rem] font-semibold leading-tight">Fill the balloons 🎈</p>
        <p className="mt-1.5 text-ink-soft">Each balloon pops to show one wish.</p>
      </motion.div>
    </div>
  );
}

function FakeField({ label, value, focused }: { label: string; value: string; focused: boolean }) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-semibold">{label}</p>
      <div
        className={`flex h-12 items-center rounded-2xl border bg-white px-4 text-lg transition-colors ${
          focused ? "border-coral ring-4 ring-coral/10" : "border-line"
        }`}
      >
        {value}
        {focused && <span className="ml-0.5 h-5 w-0.5 animate-pulse bg-coral" />}
      </div>
    </div>
  );
}

/* ---------- Step 2: flick through every gift ---------- */

function PreviewScreen({ cards, playing }: { cards: GiftCard[]; playing: boolean }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const iv = setInterval(() => setI((x) => (x + 1) % cards.length), PER_GIFT_MS);
    return () => clearInterval(iv);
  }, [playing, cards.length]);
  const card = cards[i];

  return (
    <div className="absolute inset-0 bg-black">
      <AnimatePresence initial={false}>
        <motion.div
          key={card.id}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Cover card={{ ...card, demo: { ...card.demo, from: FROM } }} name={TO} />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-x-0 top-14 z-10 flex justify-center">
        <span className="flex items-center gap-2 rounded-full bg-black/45 px-4 py-2 text-sm font-semibold uppercase tracking-wider text-white backdrop-blur">
          <Eye size={16} /> Free preview
        </span>
      </div>

      <div className="absolute inset-x-5 bottom-6 z-10 rounded-3xl bg-white/95 p-4 shadow-xl backdrop-blur">
        <div className="flex items-center justify-between">
          <p className="font-display text-xl font-semibold">{card.name}</p>
          <p className="text-sm font-semibold text-ink-soft">
            {i + 1} / {cards.length}
          </p>
        </div>
        <div className="mt-3 flex gap-1">
          {cards.map((c, j) => (
            <span key={c.id} className={`h-1 flex-1 rounded-full transition-colors ${j <= i ? "bg-coral" : "bg-ink/10"}`} />
          ))}
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-sm text-ink-soft">
          <Lock size={14} /> Pay {pricing.displayPrice} only when you love it
        </p>
      </div>
    </div>
  );
}

/* ---------- Step 3: the link lands in a chat ---------- */

function SendScreen() {
  const pop = (delay: number) => ({
    initial: { opacity: 0, y: 16, scale: 0.96 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { delay, duration: 0.35 },
  });

  return (
    <div className="absolute inset-0 flex flex-col bg-[#efe7dd]">
      <div className="flex items-center gap-3 bg-[#1f3b36] px-5 pb-4 pt-14 text-white">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-coral font-display text-xl font-semibold">
          {TO[0]}
        </span>
        <div>
          <p className="font-semibold">{TO}</p>
          <p className="text-sm text-white/70">online</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-end gap-3 px-4 pb-8">
        <motion.div {...pop(0.4)} className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-[#d9fdd3] p-2 shadow-sm">
          <div className="overflow-hidden rounded-xl">
            <div className="relative h-40" style={{ background: "linear-gradient(160deg, #2b1846, #ff7a59)" }}>
              <div className="stars" />
              <p className="absolute inset-0 flex items-center justify-center text-6xl">🎁</p>
            </div>
            <div className="bg-black/5 px-3 py-2">
              <p className="font-semibold">A surprise for {TO}</p>
              <p className="text-sm text-ink-soft">Tap to open. Sound on 🔊</p>
            </div>
          </div>
          <p className="px-1 pt-1.5 text-[15px]">Made you something. Open it tonight ❤️</p>
          <p className="flex items-center justify-end gap-1 px-1 text-xs text-ink-soft">
            11:58 pm <CheckCheck size={15} className="text-sky-500" />
          </p>
        </motion.div>

        <motion.div {...pop(2.4)} className="mr-auto max-w-[80%] rounded-2xl rounded-tl-sm bg-white px-3 py-2 shadow-sm">
          <p className="text-[15px]">{FROM.toUpperCase()} 😭😭 you made this?? I&apos;m crying</p>
          <p className="text-right text-xs text-ink-soft">12:03 am</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, type: "spring", damping: 22, stiffness: 260 }}
        className="absolute inset-x-4 top-[132px] z-10 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-xl"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-mint/20 text-mint">
          <Eye size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{TO} opened your gift</p>
          <p className="text-sm text-ink-soft">just now</p>
        </div>
        <Check size={18} className="text-mint" strokeWidth={3} />
      </motion.div>
    </div>
  );
}
