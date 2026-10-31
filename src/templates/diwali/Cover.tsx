"use client";

import type { CoverProps } from "../shared/ui";
import { DiwaliBackground, DiwaliGate, goldButtonStyle, stageButtonLook } from "./art";

/** The opening screen, without interaction. Used for gallery cards and previews. */
export default function DiwaliCover({ data }: CoverProps) {
  return (
    <DiwaliBackground lanterns>
      <DiwaliGate
        to={data.to}
        from={data.from}
        action={
          <span className={`mt-9 ${stageButtonLook}`} style={goldButtonStyle}>
            Light the diyas
          </span>
        }
      />
    </DiwaliBackground>
  );
}
