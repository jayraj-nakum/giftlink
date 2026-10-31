"use client";

import type { CoverProps } from "../shared/ui";
import { AnniversaryBackground, GOLD_OUTLINE_BUTTON, StoryGate } from "./art";

/** The opening screen, without interaction. Used for gallery cards and previews. */
export default function AnniversaryCover({ data }: CoverProps) {
  const since = typeof data.since === "string" && data.since ? data.since : undefined;
  return (
    <AnniversaryBackground>
      <StoryGate
        to={data.to}
        from={data.from}
        since={since}
        action={
          <span
            className={`mt-[4.5cqh] inline-block rounded-full px-7 py-3.5 text-base font-semibold shadow-lg shadow-black/20 ${GOLD_OUTLINE_BUTTON}`}
          >
            Begin
          </span>
        }
      />
    </AnniversaryBackground>
  );
}
