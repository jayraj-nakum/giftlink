import { z } from "zod";
import { nameSchema, optionalPastDate, photosSchema, stockPhoto, type TemplateDef } from "../types";

const LIMITS = { photos: 8, caption: 70, letter: 1500 } as const;

export const anniversarySchema = z.object({
  to: nameSchema("their name"),
  from: nameSchema("your name"),
  since: optionalPastDate(),
  photos: photosSchema({ min: 2, max: LIMITS.photos, captionMax: LIMITS.caption }),
  letter: z
    .string()
    .trim()
    .min(10, "Write at least a few words")
    .max(LIMITS.letter, `Keep it under ${LIMITS.letter} characters`),
});

export type AnniversaryData = z.output<typeof anniversarySchema>;

export const anniversary: TemplateDef<typeof anniversarySchema> = {
  id: "anniversary",
  name: "Anniversary",
  tagline: "Your story as a timeline in gold: the days together, every chapter, then your letter.",
  emoji: "💞",
  categories: ["love"],
  theme: { from: "#0f1630", to: "#b08a4a", ink: "#fff6e3" },
  schema: anniversarySchema,
  steps: [
    {
      emoji: "💞",
      title: "Whose story is this?",
      subtitle: "Your names open the story.",
      fields: [
        { type: "text", key: "to", label: "Their name", placeholder: "Nandini", maxLength: 40 },
        { type: "text", key: "from", label: "Your name", placeholder: "Aditya", maxLength: 40 },
        {
          type: "date",
          key: "since",
          range: "past",
          label: "The day it all began (optional)",
          hint: "We count every day since. Leave it empty to skip the counter.",
        },
      ],
    },
    {
      emoji: "📖",
      title: "Your story, chapter by chapter",
      subtitle: "Add the photos in the order it all happened.",
      fields: [
        {
          type: "photos",
          key: "photos",
          label: "Chapters",
          maxPhotos: LIMITS.photos,
          captionMaxLength: LIMITS.caption,
          hint: "Captions become the chapters of your timeline. Add 2 to 8 photos.",
        },
      ],
    },
    {
      emoji: "💌",
      title: "Write your letter",
      subtitle: "The last page of the story. Say it the way you would say it.",
      fields: [
        {
          type: "textarea",
          key: "letter",
          suggestions: [
            "{to},\n\nAnother year together, and I'd choose you all over again. We've had the best days and some hard ones, and every single time you made it feel like home.\n\nHappy anniversary, my love. Here's to many, many more chapters.",
            "Happy anniversary, {to}!\n\nLooking back at these photos, I see how far we've come and how much we've grown, together. Thank you for your patience, your love and your terrible jokes.\n\nI love you more today than on page one.",
            "{to},\n\nThey say time flies when you're happy. With you, it really has. Thank you for building this life with me.\n\nForever isn't long enough.",
          ],
          label: "Your letter",
          placeholder: "Happy anniversary. When I think about the day we met…",
          maxLength: LIMITS.letter,
          rows: 9,
        },
      ],
    },
  ],
  stockPhotos: [
    stockPhoto("stock/anniversary/rings-and-roses.webp", "The promise"),
    stockPhoto("stock/anniversary/walking-together.webp", "Every step, together"),
    stockPhoto("stock/anniversary/two-rings.webp", "Two of us"),
    stockPhoto("stock/anniversary/candlelight.webp", "Our quiet evenings"),
    stockPhoto("stock/anniversary/beach-walk.webp", "Still walking side by side"),
    stockPhoto("stock/anniversary/holding-hands.webp", "Hand in hand"),
  ],
  defaults: { to: "", from: "", photos: [], letter: "" },
  demo: {
    to: "Nandini",
    from: "Aditya",
    since: "2019-01-12",
    photos: [
      { key: "stock/anniversary/rings-and-roses.webp", url: "/stock/anniversary/rings-and-roses.webp", caption: "The coffee date that somehow lasted five hours" },
      { key: "stock/anniversary/walking-together.webp", url: "/stock/anniversary/walking-together.webp", caption: "Our first trip together. You packed for both of us." },
      { key: "stock/anniversary/two-rings.webp", url: "/stock/anniversary/two-rings.webp", caption: "The tiny flat with the big balcony" },
      { key: "stock/anniversary/candlelight.webp", url: "/stock/anniversary/candlelight.webp", caption: "Still my favourite person to come home to" },
    ],
    letter:
      "Nandini,\n\nA few years ago I was nervous about one coffee date. Today I can't picture an ordinary morning without you in it.\n\nThank you for the patience, the laughter, the late-night chai, and for choosing me on the hard days too.\n\nHere's to every chapter we haven't written yet. I can't wait to live them with you.",
  },
};
