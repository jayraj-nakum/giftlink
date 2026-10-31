"use client";

import { motion } from "motion/react";

/** Night-sky backdrop shared by the Birthday experience and its cover. */
export function BirthdayBackground({ children }: { children?: React.ReactNode }) {
  return (
    <div
      className="absolute inset-0 text-white"
      style={{ background: "radial-gradient(120% 80% at 50% 0%, #4a2a6e 0%, #2b1846 45%, #160c25 100%)" }}
    >
      <div className="stars" />
      {children}
    </div>
  );
}

export function GiftBox({ opened = false }: { opened?: boolean }) {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full drop-shadow-2xl">
      <rect x="30" y="92" width="140" height="98" rx="8" fill="#ff5a4e" />
      <rect x="30" y="92" width="140" height="14" fill="#000" opacity="0.12" />
      <rect x="90" y="92" width="20" height="98" fill="#ffc24b" />
      <motion.g
        initial={false}
        animate={opened ? { y: -150, rotate: -28, opacity: 0 } : { y: 0, rotate: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      >
        <rect x="20" y="64" width="160" height="32" rx="6" fill="#ff7468" />
        <rect x="90" y="64" width="20" height="32" fill="#ffd36b" />
        <ellipse cx="78" cy="54" rx="24" ry="13" fill="#ffc24b" transform="rotate(-20 78 54)" />
        <ellipse cx="122" cy="54" rx="24" ry="13" fill="#ffc24b" transform="rotate(20 122 54)" />
        <circle cx="100" cy="60" r="9" fill="#ffb21f" />
      </motion.g>
    </svg>
  );
}

export function GiftTag({ to }: { to: string }) {
  return (
    <span className="absolute -right-2 top-24 max-w-40 rotate-12 truncate rounded-md bg-[#fff8f0] px-3 py-1 font-hand text-xl text-[#2b1846] shadow-lg">
      for {to}
    </span>
  );
}
