"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { ExperienceProps } from "./shared/ui";

function Loading() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#1a0f2b]">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white" />
    </div>
  );
}

const load = (importer: () => Promise<{ default: ComponentType<ExperienceProps<never>> }>) =>
  dynamic(importer, { ssr: false, loading: Loading }) as unknown as ComponentType<ExperienceProps<Record<string, unknown>>>;

/**
 * Each occasion's Experience: code-split and rendered only in the browser
 * (it uses audio, time and touch). Register new templates here.
 */
export const experiences: Record<string, ComponentType<ExperienceProps<Record<string, unknown>>>> = {
  birthday: load(() => import("./birthday/Experience")),
  proposal: load(() => import("./proposal/Experience")),
  "best-friend": load(() => import("./best-friend/Experience")),
  anniversary: load(() => import("./anniversary/Experience")),
  puzzle: load(() => import("./puzzle/Experience")),
  diwali: load(() => import("./diwali/Experience")),
  "love-notes": load(() => import("./love-notes/Experience")),
  apology: load(() => import("./apology/Experience")),
};
