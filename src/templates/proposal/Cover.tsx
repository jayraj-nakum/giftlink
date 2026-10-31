"use client";

import type { CoverProps } from "../shared/ui";
import { ProposalBackground, ProposalGate, ROSE } from "./art";

export default function ProposalCover({ data }: CoverProps) {
  return (
    <ProposalBackground>
      <ProposalGate
        to={data.to}
        from={data.from}
        action={
          <span className="mt-10 rounded-full px-7 py-3.5 font-semibold text-white shadow-lg shadow-black/20" style={{ background: ROSE }}>
            Open it 💌
          </span>
        }
      />
    </ProposalBackground>
  );
}
