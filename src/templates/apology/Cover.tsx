"use client";

import type { CoverProps } from "../shared/ui";
import { ApologyGate, ApologySky, DAWN, NIGHT } from "./art";

/** The opening screen, without interaction. Used for gallery cards and previews. */
export default function ApologyCover({ data }: CoverProps) {
  return (
    <ApologySky rain={1}>
      <ApologyGate
        to={data.to}
        from={data.from}
        action={
          <span
            className="mt-9 rounded-full px-7 py-3.5 text-base font-semibold shadow-lg shadow-black/20"
            style={{ background: DAWN, color: NIGHT }}
          >
            Open
          </span>
        }
      />
    </ApologySky>
  );
}
