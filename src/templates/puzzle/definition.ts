import { z } from "zod";
import { nameSchema, photosSchema, stockPhoto, type TemplateDef } from "../types";

const LIMITS = { caption: 40, note: 600 } as const;

export const puzzleSchema = z.object({
  to: nameSchema("their name"),
  from: nameSchema("your name"),
  photos: photosSchema({ min: 1, max: 1, captionMax: LIMITS.caption }),
  note: z
    .string()
    .trim()
    .min(10, "Write at least a few words")
    .max(LIMITS.note, `Keep it under ${LIMITS.note} characters`),
});

export type PuzzleData = z.output<typeof puzzleSchema>;

export const puzzle: TemplateDef<typeof puzzleSchema> = {
  id: "puzzle",
  name: "Photo puzzle",
  tagline: "Your favourite photo, scrambled into nine tiles. Solving it unlocks your secret note.",
  emoji: "🧩",
  categories: ["friends", "love", "family"],
  theme: { from: "#fff4d6", to: "#ff9b6e", ink: "#3d2c1e" },
  schema: puzzleSchema,
  steps: [
    {
      emoji: "🧩",
      title: "Who's solving it?",
      subtitle: "Their name goes on the puzzle box.",
      fields: [
        { type: "text", key: "to", label: "Their name", placeholder: "Naina", maxLength: 40 },
        { type: "text", key: "from", label: "Your name", placeholder: "Aarav", maxLength: 40 },
      ],
    },
    {
      emoji: "📸",
      title: "Pick the photo",
      subtitle: "We cut it into 9 tiles and shuffle them. They swap tiles until it's whole again.",
      fields: [
        {
          type: "photos",
          key: "photos",
          label: "The photo to scramble",
          maxPhotos: 1,
          captionMaxLength: LIMITS.caption,
          hint: "Faces and bold colours make the best puzzles. The caption goes under the finished print.",
        },
      ],
    },
    {
      emoji: "🔐",
      title: "Hide a secret note",
      subtitle: "It stays locked until the last tile clicks into place.",
      fields: [
        {
          type: "textarea",
          key: "note",
          suggestions: [
            "You did it, {to}! Just like you always figure things out. I'm so proud of you.",
            "Every piece fits, just like us. Love you.",
            "Solved it! Your prize is a big hug, a coffee and me, all day.",
          ],
          label: "Your secret note",
          hint: "They read it after solving.",
          placeholder: "If you're reading this, you solved it…",
          maxLength: LIMITS.note,
          rows: 7,
        },
      ],
    },
  ],
  stockPhotos: [
    stockPhoto("stock/puzzle/venice.webp", "Solve me"),
  ],
  defaults: { to: "", from: "", photos: [], note: "" },
  demo: {
    to: "Naina",
    from: "Aarav",
    photos: [{ key: "stock/puzzle/venice.webp", url: "/stock/puzzle/venice.webp", caption: "The sunrise hike we almost skipped" }],
    note:
      "Okay, you solved it. I knew you would, you finish every crossword before I find a pen.\n\nThis photo is from the morning you dragged me out of bed at 5 am and I complained the whole way up. Then the sun came out and you were right, as usual.\n\nThanks for always pulling me towards the good stuff. Same hill next year?",
  },
};
