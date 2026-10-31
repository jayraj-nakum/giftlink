"use client";

import { FloatingHearts } from "../shared/ui";

export const ROSE = "#ff5c8a";

/** Rose-night backdrop shared by the Proposal experience and its cover. */
export function ProposalBackground({ hearts = 14, children }: { hearts?: number; children?: React.ReactNode }) {
  return (
    <div
      className="absolute inset-0 text-white"
      style={{ background: "radial-gradient(120% 90% at 50% 10%, #5a1638 0%, #2a0b22 55%, #12050e 100%)" }}
    >
      <FloatingHearts count={hearts} />
      {children}
    </div>
  );
}

/** The opening card: their name and who it's from. */
export function ProposalGate({ to, from, action }: { to: string; from: string; action: React.ReactNode }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
      <p className="text-xs uppercase tracking-[0.35em] text-white/60">For</p>
      <h1 className="mt-2 max-w-full truncate font-display text-5xl">{to}</h1>
      <p className="mt-5 max-w-xs text-lg text-white/80">{from} has something to tell you.</p>
      {action}
      <p className="mt-5 text-xs text-white/50">Sound on for the full effect</p>
    </div>
  );
}
