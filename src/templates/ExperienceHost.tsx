"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { experiences } from "./experiences";
import { Synth } from "./shared/audio";
import { createFx } from "./shared/confetti";
import type { ExperienceEvent, ExperienceMode } from "./shared/ui";

/** Key under which the maker's browser remembers its owner token. */
export const ownerKey = (slug: string) => `gl:own:${slug}`;

function isMakersBrowser(slug: string): boolean {
  try {
    return !!localStorage.getItem(ownerKey(slug));
  } catch {
    return false;
  }
}

function sendEvent(slug: string, event: "open" | ExperienceEvent) {
  void fetch(`/api/gifts/${slug}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event }),
    keepalive: true,
  }).catch(() => {});
}

/**
 * Plays one gift. Full-screen by default; with `framed` it fills its parent instead
 * (used for the live preview inside a phone frame while building).
 */
export function ExperienceHost({
  template,
  data,
  mode,
  slug,
  framed = false,
}: {
  template: string;
  data: Record<string, unknown>;
  mode: ExperienceMode;
  slug?: string;
  framed?: boolean;
}) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [synth] = useState(() => new Synth());
  const fx = useMemo(() => createFx(() => canvas), [canvas]);
  const [muted, setMuted] = useState(false);
  useEffect(() => () => synth.dispose(), [synth]);

  // Count an open once per browser session. The maker's own visits don't count.
  useEffect(() => {
    if (mode !== "live" || !slug || isMakersBrowser(slug)) return;
    try {
      const key = `gl:opened:${slug}`;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // storage blocked: still count it
    }
    sendEvent(slug, "open");
  }, [mode, slug]);

  const onEvent = useCallback(
    (event: ExperienceEvent) => {
      if (mode === "live" && slug && !isMakersBrowser(slug)) sendEvent(slug, event);
    },
    [mode, slug],
  );

  const Experience = experiences[template];
  if (!Experience) return null;

  return (
    <div className={`${framed ? "absolute" : "fixed"} inset-0 overflow-hidden bg-[#160c25]`}>
      <div className="stage">
        <Experience data={data} mode={mode} synth={synth} fx={fx} onEvent={onEvent} />
        <canvas ref={setCanvas} aria-hidden className="pointer-events-none absolute inset-0 z-50 h-full w-full" />
        <button
          type="button"
          aria-label={muted ? "Turn sound on" : "Mute"}
          onClick={() => {
            synth.setMuted(!muted);
            setMuted(!muted);
          }}
          className="absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-40 flex h-10 w-10 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur"
        >
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>
    </div>
  );
}
