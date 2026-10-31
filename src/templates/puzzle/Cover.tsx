"use client";

import type { CoverProps } from "../shared/ui";
import { PuzzleBackground, PuzzleGate, firstPhoto, primaryButtonClass, primaryButtonStyle, stageButtonLook } from "./art";

/** The opening screen, without interaction. Used for gallery cards and previews. */
export default function PuzzleCover({ data }: CoverProps) {
  return (
    <PuzzleBackground>
      <PuzzleGate
        to={data.to}
        from={data.from}
        photoUrl={firstPhoto(data.photos).url}
        action={
          <span className={`mt-9 ${stageButtonLook} ${primaryButtonClass}`} style={primaryButtonStyle}>
            Start
          </span>
        }
      />
    </PuzzleBackground>
  );
}
