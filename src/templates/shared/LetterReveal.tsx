"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { Synth } from "./audio";
import { StageButton } from "./ui";

/** A sealed envelope. Tap the seal and the letter types itself out. Tap the letter to show it all. */
export function LetterReveal({
  text,
  from,
  synth,
  onDone,
  seal = "#e2433a",
  cta = "Continue",
  tone = "dark",
}: {
  text: string;
  from: string;
  synth: Synth;
  onDone: () => void;
  seal?: string;
  cta?: string;
  /** "dark" for night backgrounds (white hint), "light" for pale ones (ink hint, dark button). */
  tone?: "dark" | "light";
}) {
  const [opened, setOpened] = useState(false);
  const [shown, setShown] = useState(0);
  const done = shown >= text.length;

  useEffect(() => {
    if (!opened || done) return;
    const id = setTimeout(() => setShown((s) => Math.min(text.length, s + 2)), 24);
    return () => clearTimeout(id);
  }, [opened, done, shown, text.length]);

  return (
    <div className="flex w-full max-w-md flex-col items-center">
      <AnimatePresence mode="wait">
        {!opened ? (
          <motion.button
            key="envelope"
            type="button"
            aria-label="Open the letter"
            onClick={() => {
              synth.whoosh();
              setOpened(true);
            }}
            exit={{ y: 60, opacity: 0, transition: { duration: 0.35 } }}
            whileTap={{ scale: 0.96 }}
            className="relative h-48 w-72 rounded-md bg-[#f6e7d3] shadow-2xl shadow-black/40"
          >
            <svg viewBox="0 0 288 192" className="absolute inset-0 h-full w-full">
              <path d="M0 0 L144 108 L288 0" fill="#efdcc2" stroke="#e0c7a6" strokeWidth="2" />
              <path d="M0 192 L118 92 M288 192 L170 92" stroke="#e0c7a6" strokeWidth="2" />
            </svg>
            <motion.span
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 1.6 }}
              className="absolute left-1/2 top-[92px] flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-2xl shadow-md"
              style={{ background: seal }}
            >
              ♥
            </motion.span>
            <span className={`absolute inset-x-0 -bottom-10 text-sm ${tone === "light" ? "font-medium text-ink/70" : "text-white/80"}`}>Tap the seal</span>
          </motion.button>
        ) : (
          <motion.article
            key="letter"
            initial={{ y: 80, opacity: 0, rotate: -2 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 18 }}
            onClick={() => setShown(text.length)}
            className="max-h-[64cqh] w-full overflow-y-auto rounded-md bg-[#fffaf1] px-6 py-7 text-left shadow-2xl shadow-black/40"
            style={{
              backgroundImage: "repeating-linear-gradient(transparent 0 33px, rgba(58,36,48,.08) 33px 34px)",
            }}
          >
            <p className="whitespace-pre-wrap break-words font-hand text-[1.45rem] leading-[34px] text-[#3a2430]">
              {text.slice(0, shown)}
              {!done && <span className="animate-pulse">|</span>}
            </p>
            {done && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 text-right font-hand text-2xl text-[#3a2430]"
              >
                with love, {from}
              </motion.p>
            )}
          </motion.article>
        )}
      </AnimatePresence>
      {opened && done && (
        <StageButton
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={onDone}
          className={`mt-6 ${tone === "light" ? "bg-ink text-white" : "bg-white text-[#2b1846]"}`}
        >
          {cta}
        </StageButton>
      )}
    </div>
  );
}
