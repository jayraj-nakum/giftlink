"use client";

import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { pricing } from "@/config/site";
import { ExperienceHost } from "@/templates/ExperienceHost";

const noSubscribe = () => () => {};
const nameFromUrl = () => (new URLSearchParams(window.location.search).get("to") ?? "").trim().slice(0, 40);

/** Plays a template's demo. A name from the home page (?to=Meera) replaces the demo name. */
export function DemoHost({ id, demo }: { id: string; demo: Record<string, unknown> }) {
  // Server render has no URL query: "" there, the real value right after hydration.
  const name = useSyncExternalStore(noSubscribe, nameFromUrl, () => "");
  const data = name ? { ...demo, to: name } : demo;
  const query = name ? `?to=${encodeURIComponent(name)}` : "";

  return (
    <main>
      <ExperienceHost template={id} data={data} mode="demo" />
      <div className="fixed left-3 top-[max(0.75rem,env(safe-area-inset-top))] z-40 flex items-center gap-2">
        <Link
          href="/#gifts"
          aria-label="Back to all gifts"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink shadow backdrop-blur"
        >
          <ArrowLeft size={18} />
        </Link>
        <Link
          href={`/create/${id}${query}`}
          className="flex items-center gap-1.5 rounded-full bg-coral px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-black/20"
        >
          <Sparkles size={15} /> Make yours · {pricing.displayPrice}
        </Link>
      </div>
    </main>
  );
}
