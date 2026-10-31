"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Synth } from "../shared/audio";
import type { Fx } from "../shared/confetti";
import { Scene, StageButton, seeded, type ExperienceProps } from "../shared/ui";
import {
  ACCENT,
  ACCENT_DEEP,
  BoardFrame,
  INK,
  JigsawPiece,
  Padlock,
  PuzzleBackground,
  PuzzleGate,
  TILE_GAP,
  Tape,
  TileFace,
  firstPhoto,
  isSolved,
  photoBackground,
  primaryButtonClass,
  primaryButtonStyle,
  scramble,
  seedForRound,
} from "./art";
import type { PuzzleData } from "./definition";

type SceneId = "gate" | "puzzle" | "note" | "finale";

/** A light, original tune in C major pentatonic. Sparse on purpose, so it stays in the background. */
const PUZZLE_TUNE: Parameters<Synth["play"]>[0] = [
  ["C5", 0.5], ["E5", 0.5], ["G5", 1], ["E5", 0.5], ["D5", 0.5], [null, 1],
  ["D5", 0.5], ["E5", 0.5], ["A5", 1], ["G5", 1], [null, 1],
  ["E5", 0.5], ["G5", 0.5], ["A5", 0.5], ["G5", 0.5], ["E5", 1], ["D5", 1],
  ["C5", 0.5], ["D5", 0.5], ["E5", 0.5], ["D5", 0.5], ["C5", 2],
  [null, 2],
  ["G4", 0.5], ["A4", 0.5], ["C5", 1], ["A4", 0.5], ["G4", 0.5], [null, 1],
  ["A4", 0.5], ["C5", 0.5], ["D5", 1], ["E5", 1], [null, 1],
  ["G5", 0.5], ["E5", 0.5], ["D5", 0.5], ["C5", 0.5], ["D5", 1], ["E5", 1],
  ["D5", 0.5], ["C5", 0.5], ["A4", 0.5], ["G4", 0.5], ["C5", 2],
  [null, 2],
];

const CELEBRATE = ["#ff7a59", "#ffc94d", "#ffffff", "#9fd8cb", "#f78fb3"];

export default function PuzzleExperience({ data, mode, synth, fx, onEvent }: ExperienceProps<PuzzleData>) {
  const [scene, setScene] = useState<SceneId>("gate");
  const [round, setRound] = useState(0);
  const [moves, setMoves] = useState(0);
  const completed = useRef(false);
  const photo = firstPhoto(data.photos);
  const background = photoBackground(photo.url);

  const solved = (count: number) => {
    setMoves(count);
    if (!completed.current) {
      completed.current = true;
      onEvent("complete");
    }
  };

  return (
    <PuzzleBackground>
      <AnimatePresence mode="wait">
        {scene === "gate" && (
          <Scene key="gate">
            <PuzzleGate
              to={data.to}
              from={data.from}
              photoUrl={photo.url}
              action={
                <StageButton
                  onClick={() => {
                    synth.unlock();
                    synth.play(PUZZLE_TUNE, { bpm: 92 });
                    setScene("puzzle");
                  }}
                  className={`mt-9 ${primaryButtonClass}`}
                  style={primaryButtonStyle}
                >
                  Start
                </StageButton>
              }
            />
          </Scene>
        )}
        {scene === "puzzle" && (
          <PuzzleScene
            key={`puzzle-${round}`}
            to={data.to}
            seed={seedForRound(round)}
            background={background}
            synth={synth}
            fx={fx}
            onSolved={solved}
            onContinue={() => setScene("note")}
          />
        )}
        {scene === "note" && (
          <NoteScene key="note" note={data.note} from={data.from} synth={synth} onDone={() => setScene("finale")} />
        )}
        {scene === "finale" && (
          <FinaleScene
            key="finale"
            to={data.to}
            from={data.from}
            caption={photo.caption}
            background={background}
            moves={moves}
            mode={mode}
            onReplay={() => {
              setRound((r) => r + 1);
              setScene("puzzle");
            }}
          />
        )}
      </AnimatePresence>
    </PuzzleBackground>
  );
}

/* ---------------- scenes ---------------- */

const SHADOW_IDLE = "0 0 0 0px rgba(255,122,89,0), 0 3px 8px rgba(61,44,30,0.22)";
const SHADOW_PICKED = "0 0 0 3px rgba(255,122,89,1), 0 12px 22px rgba(232,85,47,0.45)";
const SHADOW_SOLVED = "0 0 0 0px rgba(255,122,89,0), 0 0px 0px rgba(61,44,30,0)";

function PuzzleScene({
  to,
  seed,
  background,
  synth,
  fx,
  onSolved,
  onContinue,
}: {
  to: string;
  seed: number;
  background: string;
  synth: Synth;
  fx: Fx;
  onSolved: (moves: number) => void;
  onContinue: () => void;
}) {
  const [order, setOrder] = useState(() => scramble(seed));
  const [picked, setPicked] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [solved, setSolved] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [peeking, setPeeking] = useState(false);

  const home = order.filter((piece, slot) => piece === slot).length;

  const tap = (slot: number) => {
    if (solved) return;
    synth.unlock();
    if (picked === null) {
      setPicked(slot);
      synth.pop();
      return;
    }
    if (picked === slot) {
      setPicked(null);
      return;
    }
    const next = order.slice();
    [next[picked], next[slot]] = [next[slot], next[picked]];
    const count = moves + 1;
    setOrder(next);
    setMoves(count);
    setPicked(null);
    synth.pop();
    if (isSolved(next)) {
      setSolved(true);
      setPeeking(false);
      onSolved(count);
      // Let the gaps close first, then show the whole photo.
      setTimeout(() => {
        setRevealed(true);
        synth.chime();
        fx.burst(CELEBRATE);
      }, 650);
    }
  };

  const hint = solved
    ? ""
    : picked !== null
      ? "Now tap the tile to swap it with."
      : moves === 0
        ? "Tap a tile, then another, to swap them."
        : moves >= 14 && home < 6
          ? "Stuck? Hold Peek to see the photo."
          : `${home} of 9 in place. A white edge means it's home.`;

  const peek = (on: boolean) => {
    if (!solved) setPeeking(on);
  };

  return (
    <Scene>
      <p className="max-w-full truncate text-xs font-semibold uppercase tracking-[0.3em] opacity-70">For {to}</p>
      <h2 className="mt-1 font-display text-3xl leading-tight">{solved ? "You did it!" : "Piece it together"}</h2>

      <div className="mt-5 w-[min(84cqw,52cqh)] max-w-[420px]">
        <div className="mb-3 flex h-10 items-center justify-between gap-3">
          <div className="flex items-center gap-2 rounded-full bg-white/75 px-4 py-2 text-sm font-semibold shadow-sm">
            <span className="opacity-70">Moves</span>
            <span className="relative inline-block min-w-[2ch] overflow-hidden text-left tabular-nums">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={moves}
                  initial={{ y: -14, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 14, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="inline-block"
                  style={{ color: ACCENT_DEEP }}
                >
                  {moves}
                </motion.span>
              </AnimatePresence>
            </span>
          </div>
          {!solved && (
            <motion.button
              type="button"
              aria-label="Hold to see the original photo"
              whileTap={{ scale: 0.94 }}
              onPointerDown={(e) => {
                try {
                  e.currentTarget.setPointerCapture(e.pointerId);
                } catch {
                  // Capture is only a nicety: release still ends the peek via pointerup/blur.
                }
                synth.unlock();
                peek(true);
              }}
              onPointerUp={() => peek(false)}
              onPointerCancel={() => peek(false)}
              onLostPointerCapture={() => peek(false)}
              onKeyDown={(e) => {
                if ((e.key === " " || e.key === "Enter") && !e.repeat) {
                  e.preventDefault();
                  peek(true);
                }
              }}
              onKeyUp={() => peek(false)}
              onBlur={() => peek(false)}
              onContextMenu={(e) => e.preventDefault()}
              className="flex touch-none items-center gap-2 rounded-full border-2 bg-white/80 px-4 py-2 text-sm font-semibold shadow-sm outline-none focus-visible:ring-4"
              style={{ borderColor: peeking ? ACCENT : "rgba(61,44,30,0.12)", WebkitTouchCallout: "none" }}
            >
              <EyeIcon />
              {peeking ? "Peeking…" : "Hold to peek"}
            </motion.button>
          )}
        </div>

        <div className="relative">
          <AnimatePresence>
            {revealed && (
              <motion.div
                key="glow"
                aria-hidden
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                className="pointer-events-none absolute -inset-[18%] rounded-full"
                style={{ background: "radial-gradient(closest-side, rgba(255,186,110,0.9), rgba(255,186,110,0) 100%)" }}
              />
            )}
          </AnimatePresence>
          {revealed && <SunBurst />}
          <motion.div
            animate={revealed ? { scale: [1, 1.07, 1] } : { scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative"
          >
            <BoardFrame>
              <div className="relative">
                <div className="grid grid-cols-3" style={{ gap: solved ? 0 : TILE_GAP }}>
                  {order.map((piece, slot) => {
                    const isPicked = picked === slot;
                    const isHome = piece === slot && !solved;
                    return (
                      <motion.button
                        key={piece}
                        type="button"
                        layout
                        layoutDependency={`${order.join("")}-${solved}`}
                        onClick={() => tap(slot)}
                        disabled={solved}
                        aria-label={`Tile ${piece + 1}${isPicked ? ", selected" : ""}`}
                        aria-pressed={isPicked}
                        initial={false}
                        animate={{
                          scale: isPicked ? 0.9 : 1,
                          borderRadius: solved ? 0 : 10,
                          boxShadow: solved ? SHADOW_SOLVED : isPicked ? SHADOW_PICKED : SHADOW_IDLE,
                        }}
                        transition={{
                          layout: { type: "spring", stiffness: 420, damping: 34 },
                          default: { duration: 0.22 },
                        }}
                        className="relative block aspect-square cursor-pointer overflow-hidden outline-none focus-visible:ring-4 focus-visible:ring-[#ff7a59]/60 disabled:cursor-default"
                        style={{ zIndex: isPicked ? 2 : 1 }}
                      >
                        <TileFace piece={piece} background={background} />
                        <motion.span
                          aria-hidden
                          initial={false}
                          animate={{ opacity: solved ? 0 : 1 }}
                          className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent"
                        />
                        {/* A settled tile gets a soft white edge, so look-alike tiles (plain sky) are still solvable. */}
                        <motion.span
                          aria-hidden
                          initial={false}
                          animate={{ opacity: isHome ? 1 : 0 }}
                          transition={{ duration: 0.3 }}
                          className="absolute inset-0 rounded-[inherit] ring-[2.5px] ring-inset ring-white/90"
                        />
                        <motion.span
                          aria-hidden
                          initial={false}
                          animate={{ opacity: isHome ? [0, 0.55, 0] : 0 }}
                          transition={{ duration: 0.6 }}
                          className="absolute inset-0 bg-white"
                        />
                      </motion.button>
                    );
                  })}
                </div>
                <AnimatePresence>
                  {(peeking || revealed) && (
                    <motion.div
                      key="full"
                      role="img"
                      aria-label="The original photo"
                      initial={{ opacity: 0, scale: revealed ? 0.97 : 1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: revealed ? 0.5 : 0.18 }}
                      className="pointer-events-none absolute inset-0 z-10 rounded-[4px]"
                      style={{ backgroundImage: background, backgroundSize: "cover", backgroundPosition: "center" }}
                    >
                      {peeking && !revealed && (
                        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/45 px-3 py-1 text-xs font-semibold text-white">
                          Original
                        </span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </BoardFrame>
          </motion.div>
        </div>
      </div>

      <div className="mt-7 flex min-h-24 flex-col items-center">
        {!solved ? (
          <p className="text-sm opacity-75" aria-live="polite">
            {hint}
          </p>
        ) : (
          <>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="font-hand text-2xl"
              style={{ color: ACCENT_DEEP }}
              aria-live="polite"
            >
              Solved in {moves} {moves === 1 ? "move" : "moves"}!
            </motion.p>
            <StageButton
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              onClick={onContinue}
              className={`mt-4 ${primaryButtonClass}`}
              style={primaryButtonStyle}
            >
              Unlock my note 🔓
            </StageButton>
          </>
        )}
      </div>
    </Scene>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Slowly turning rays behind the finished photo. */
function SunBurst() {
  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 0.85, scale: 1 }}
      transition={{ duration: 1 }}
      className="pointer-events-none absolute -inset-[34%]"
    >
      <motion.svg
        viewBox="-100 -100 200 200"
        className="h-full w-full"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
      >
        {Array.from({ length: 16 }, (_, i) => (
          <path key={i} d="M-6 -30 L0 -100 L6 -30 Z" fill="#fff6d8" opacity="0.8" transform={`rotate(${i * 22.5})`} />
        ))}
      </motion.svg>
    </motion.div>
  );
}

function NoteScene({ note, from, synth, onDone }: { note: string; from: string; synth: Synth; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const paragraphs = note.split(/\n+/).filter((p) => p.trim());
  const doneAt = 1.1 + paragraphs.length * 0.9;

  useEffect(() => {
    const id = setTimeout(() => {
      setOpen(true);
      synth.whoosh();
    }, 450);
    return () => clearTimeout(id);
  }, [synth]);

  return (
    <Scene>
      <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 12 }}>
        <Padlock open={open} className="h-16 w-16 drop-shadow-lg" />
      </motion.div>
      <h2 className="mt-2 font-display text-3xl">Unlocked!</h2>
      <p className="mt-1 text-sm opacity-70">Your secret note</p>

      <div className="relative mt-6 w-full max-w-md">
        <Tape className="absolute -top-4 left-1/2 z-10 w-28 -translate-x-1/2 -rotate-3" />
        <motion.article
          initial={{ y: 70, opacity: 0, rotate: -4 }}
          animate={{ y: 0, opacity: 1, rotate: -1 }}
          transition={{ type: "spring", damping: 18, delay: 0.5 }}
          className="max-h-[52cqh] overflow-y-auto rounded-[6px] bg-[#fffdf6] px-6 pb-6 pt-8 text-left"
          style={{
            boxShadow: "0 26px 50px -22px rgba(120,60,20,0.55), 0 0 0 1px rgba(61,44,30,0.06)",
            backgroundImage: "repeating-linear-gradient(transparent 0 33px, rgba(61,44,30,0.08) 33px 34px)",
            backgroundPosition: "0 22px",
            backgroundAttachment: "local",
          }}
        >
          {paragraphs.map((p, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 + i * 0.9, duration: 0.7 }}
              className="mb-[34px] whitespace-pre-wrap break-words font-hand text-[1.45rem] leading-[34px] last:mb-0"
              style={{ color: INK }}
            >
              {p}
            </motion.p>
          ))}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: doneAt }}
            className="mt-3 max-w-full truncate text-right font-hand text-2xl"
            style={{ color: ACCENT_DEEP }}
          >
            — {from}
          </motion.p>
        </motion.article>
      </div>

      <StageButton
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: doneAt + 0.3 }}
        onClick={onDone}
        className={`mt-7 ${primaryButtonClass}`}
        style={primaryButtonStyle}
      >
        See the finished photo →
      </StageButton>
    </Scene>
  );
}

const FLOAT_COLORS = ["#ffb38a", "#ffd166", "#9fd8cb", "#ffc6d3", "#c9b6ff", ACCENT];

function FinaleScene({
  to,
  from,
  caption,
  background,
  moves,
  mode,
  onReplay,
}: {
  to: string;
  from: string;
  caption?: string;
  background: string;
  moves: number;
  mode: ExperienceProps<PuzzleData>["mode"];
  onReplay: () => void;
}) {
  return (
    <Scene>
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 10 }, (_, i) => (
          <span
            key={i}
            className="absolute bottom-[-80px] block"
            style={{
              left: `${seeded(i + 41) * 90}%`,
              width: `min(${6 + seeded(i + 51) * 6}cqw, ${3.5 + seeded(i + 51) * 3}cqh)`,
              animation: `float-up ${12 + seeded(i + 61) * 9}s linear ${-seeded(i + 71) * 18}s infinite`,
              opacity: 0.55,
            }}
          >
            <span className="block" style={{ animation: `sway ${3 + seeded(i + 81) * 2}s ease-in-out infinite alternate` }}>
              <JigsawPiece color={FLOAT_COLORS[i % FLOAT_COLORS.length]} />
            </span>
          </span>
        ))}
      </div>

      <p className="relative max-w-full truncate text-xs font-semibold uppercase tracking-[0.3em] opacity-70">
        Solved by {to}
      </p>

      <motion.figure
        initial={{ y: 40, opacity: 0, rotate: 4 }}
        animate={{ y: 0, opacity: 1, rotate: -2.5 }}
        transition={{ type: "spring", damping: 14 }}
        className="relative mt-5 w-[min(70cqw,44cqh)] max-w-[340px] rounded-[6px] bg-[#fffdf8] p-[clamp(10px,3cqw,14px)] pb-0"
        style={{ boxShadow: "0 30px 60px -24px rgba(120,60,20,0.6), 0 0 0 1px rgba(61,44,30,0.05)" }}
      >
        <Tape className="absolute -top-4 left-1/2 w-24 -translate-x-1/2 rotate-2" color="#9fd8cb" />
        <div
          role="img"
          aria-label={caption || "The finished photo"}
          className="aspect-square w-full rounded-[3px]"
          style={{ backgroundImage: background, backgroundSize: "cover", backgroundPosition: "center" }}
        />
        <figcaption
          className="line-clamp-2 break-words px-1 py-3 text-center font-hand text-xl leading-tight"
          style={{ color: INK }}
        >
          {caption || `for ${to}, from ${from}`}
        </figcaption>
      </motion.figure>

      <motion.p
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", damping: 10 }}
        className="relative mt-6 inline-flex items-center gap-2 rounded-full bg-white/80 px-5 py-2 text-sm font-semibold shadow-sm"
      >
        <span className="inline-block w-5">
          <JigsawPiece color={ACCENT} />
        </span>
        Solved in {moves} {moves === 1 ? "move" : "moves"}
      </motion.p>

      <div className="relative mt-7 flex flex-col items-center gap-4">
        <StageButton onClick={onReplay} className={primaryButtonClass} style={primaryButtonStyle}>
          Play again ↺
        </StageButton>
        {mode === "live" && (
          <Link href="/" className="text-sm underline underline-offset-4 opacity-70">
            Make one for someone you love
          </Link>
        )}
        {mode === "demo" && (
          <Link href="/create/puzzle" className="rounded-full px-6 py-3 font-semibold text-white" style={{ background: INK }}>
            Make one like this →
          </Link>
        )}
      </div>
    </Scene>
  );
}
