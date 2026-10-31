"use client";

import type { CoverProps } from "../shared/ui";
import { BirthdayBackground, GiftBox, GiftTag } from "./art";

/** The opening screen, without interaction. Used for gallery cards and previews. */
export default function BirthdayCover({ data }: CoverProps) {
  return (
    <BirthdayBackground>
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-white/60">A surprise for</p>
        <h1 className="mt-2 max-w-full truncate font-display text-5xl text-[#ffc24b]">{data.to}</h1>
        <div className="relative mt-10 h-60 w-60">
          <GiftBox />
          <GiftTag to={data.to} />
        </div>
        <p className="mt-8 text-white/80">Tap the gift</p>
      </div>
    </BirthdayBackground>
  );
}
