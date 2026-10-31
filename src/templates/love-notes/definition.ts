import { z } from "zod";
import { nameSchema, photosSchema, stockPhoto, type TemplateDef } from "../types";

const LIMITS = { notes: 10, note: 80, photos: 6, caption: 60, letter: 1500 } as const;

export const loveNotesSchema = z.object({
  to: nameSchema("their name"),
  from: nameSchema("your name"),
  notes: z
    .array(z.string().trim().min(1).max(LIMITS.note, `Keep each note under ${LIMITS.note} characters`))
    .min(3, "Add at least 3 notes")
    .max(LIMITS.notes, `Up to ${LIMITS.notes} notes`),
  photos: photosSchema({ min: 1, max: LIMITS.photos, captionMax: LIMITS.caption }),
  letter: z
    .string()
    .trim()
    .min(10, "Write at least a few words")
    .max(LIMITS.letter, `Keep it under ${LIMITS.letter} characters`),
});

export type LoveNotesData = z.output<typeof loveNotesSchema>;

export const loveNotes: TemplateDef<typeof loveNotesSchema> = {
  id: "love-notes",
  name: "Love notes",
  tagline: "A glass jar of folded notes, each one a little thing you love about them.",
  emoji: "💌",
  categories: ["love"],
  theme: { from: "#fde8e4", to: "#f4b3bb", ink: "#7a1f3d" },
  schema: loveNotesSchema,
  steps: [
    {
      emoji: "💌",
      title: "Who's the jar for?",
      subtitle: "Their name goes on the heart label.",
      fields: [
        { type: "text", key: "to", label: "Their name", placeholder: "Tara", maxLength: 40 },
        { type: "text", key: "from", label: "Your name", placeholder: "Vihaan", maxLength: 40 },
      ],
    },
    {
      emoji: "🫙",
      title: "Fill the jar",
      subtitle: "Every line becomes a folded note. They tap the jar to pull them out one by one.",
      fields: [
        {
          type: "list",
          key: "notes",
          suggestions: [
            "The way you laugh at your own jokes",
            "How you always save me the last bite",
            "Your good-morning texts",
            "The way you say my name",
            "How safe I feel when you hold my hand",
            "You make ordinary days feel special",
            "Your terrible singing in the car",
            "How you remember the little things",
            "You never let me sleep angry",
            "Simply, you. Every bit of you.",
          ],
          label: "Things you love about them",
          itemPlaceholder: "The way you hum while making chai",
          maxItems: LIMITS.notes,
          maxLength: LIMITS.note,
          hint: "Add 3 to 10. Small, specific things hit hardest.",
        },
      ],
    },
    {
      emoji: "📸",
      title: "Add your photos",
      subtitle: "They drop onto a little pile of prints, one tap at a time.",
      fields: [
        {
          type: "photos",
          key: "photos",
          label: "Photos",
          maxPhotos: LIMITS.photos,
          captionMaxLength: LIMITS.caption,
          hint: "Up to 6. Add a caption to any of them.",
        },
      ],
    },
    {
      emoji: "✍️",
      title: "Write your letter",
      subtitle: "The longest note of all, saved for last.",
      fields: [
        {
          type: "textarea",
          key: "letter",
          suggestions: [
            "{to},\n\nThis jar is full of tiny reasons, but the truth is I could never fit all of them in. You make my days softer and my life happier. Thank you for loving me the way you do.\n\nI choose you, today and every day.",
            "My love,\n\nSome days I still can't believe I get to call you mine. You are my calm on chaotic days and my favourite part of every good one.\n\nOpen this jar whenever you need reminding of how loved you are.",
            "{to},\n\nI wanted to give you something you can come back to: a little jar of all the things I love about you. Read one whenever you miss me. I'll be thinking of you either way.",
          ],
          label: "Your letter",
          placeholder: "I wanted to write down the things I don't say enough…",
          maxLength: LIMITS.letter,
          rows: 9,
        },
      ],
    },
  ],
  stockPhotos: [
    stockPhoto("stock/love-notes/holding-hands.webp", "You and me"),
    stockPhoto("stock/love-notes/roses.webp", "Roses for you"),
    stockPhoto("stock/love-notes/hands-in-the-field.webp", "Hand in hand"),
    stockPhoto("stock/love-notes/sunset-together.webp", "Every sunset with you"),
  ],
  defaults: { to: "", from: "", notes: [], photos: [], letter: "" },
  demo: {
    to: "Tara",
    from: "Vihaan",
    notes: [
      "The way you hum old Kishore songs while the chai boils",
      "How you always save me the last bite, even of gulab jamun",
      "Your laugh when you're trying very hard not to laugh",
      "That you know the name of every street dog on our road",
      "How you hold my hand a little tighter in crowds",
      "Your terrible, wonderful puns",
      "The way you make an ordinary Sunday feel like a holiday",
    ],
    photos: [
      { key: "stock/love-notes/holding-hands.webp", url: "/stock/love-notes/holding-hands.webp", caption: "Chai, rain and Marine Drive" },
      { key: "stock/love-notes/roses.webp", url: "/stock/love-notes/roses.webp", caption: "Tourists in our own city" },
      { key: "stock/love-notes/hands-in-the-field.webp", url: "/stock/love-notes/hands-in-the-field.webp", caption: "You, mid-sentence, as always" },
      { key: "stock/love-notes/sunset-together.webp", url: "/stock/love-notes/sunset-together.webp", caption: "Our first trip together" },
    ],
    letter:
      "Tara,\n\nI started writing these notes on the back of bills and movie tickets, and somewhere along the way I realised the jar was never going to be big enough.\n\nThank you for the patience, the playlists and the way you make even the boring days feel like ours.\n\nThere are a hundred more notes where these came from. I'll keep writing them.",
  },
};
