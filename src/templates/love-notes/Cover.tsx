"use client";

import type { CoverProps } from "../shared/ui";
import { JAR_BOX, JAR_LARGE, JarHeading, JarHint, LabelledJar, LoveNotesBackground } from "./art";

/** The opening screen, without interaction. Used for gallery cards and previews. */
export default function LoveNotesCover({ data }: CoverProps) {
  return (
    <LoveNotesBackground>
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <JarHeading to={data.to} from={data.from} />
        <div className={`${JAR_BOX} ${JAR_LARGE} mt-8`}>
          <LabelledJar to={data.to} />
        </div>
        <div className="mt-6 flex h-14 items-center justify-center">
          <JarHint />
        </div>
      </div>
    </LoveNotesBackground>
  );
}
