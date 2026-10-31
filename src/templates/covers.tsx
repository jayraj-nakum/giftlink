"use client";

import type { ComponentType } from "react";
import BirthdayCover from "./birthday/Cover";
import ProposalCover from "./proposal/Cover";
import BestFriendCover from "./best-friend/Cover";
import AnniversaryCover from "./anniversary/Cover";
import PuzzleCover from "./puzzle/Cover";
import DiwaliCover from "./diwali/Cover";
import LoveNotesCover from "./love-notes/Cover";
import ApologyCover from "./apology/Cover";
import type { CoverProps } from "./shared/ui";

/** Static opening screen per template, for gallery cards and hero phones. Register new templates here. */
export const covers: Record<string, ComponentType<CoverProps>> = {
  birthday: BirthdayCover,
  proposal: ProposalCover,
  "best-friend": BestFriendCover,
  anniversary: AnniversaryCover,
  puzzle: PuzzleCover,
  diwali: DiwaliCover,
  "love-notes": LoveNotesCover,
  apology: ApologyCover,
};
