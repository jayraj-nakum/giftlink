"use client";

import type { CoverProps } from "../shared/ui";
import { CaseFileGate, FriendBackground } from "./art";

/** The opening screen, without interaction. Used for gallery cards and previews. */
export default function BestFriendCover({ data }: CoverProps) {
  return (
    <FriendBackground>
      <CaseFileGate to={data.to} from={data.from} />
    </FriendBackground>
  );
}
