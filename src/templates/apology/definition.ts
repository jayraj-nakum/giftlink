import { z } from "zod";
import { nameSchema, photosSchema, stockPhoto, type TemplateDef } from "../types";

const LIMITS = { sorry: 6, promises: 5, line: 80, photos: 4, caption: 60, message: 1200 } as const;

const line = z.string().trim().min(1).max(LIMITS.line, `Keep each line under ${LIMITS.line} characters`);

export const apologySchema = z.object({
  to: nameSchema("their name"),
  from: nameSchema("your name"),
  sorry: z.array(line).min(1, "Add at least one").max(LIMITS.sorry, `Up to ${LIMITS.sorry} lines`),
  promises: z.array(line).max(LIMITS.promises, `Up to ${LIMITS.promises} promises`),
  photos: photosSchema({ min: 0, max: LIMITS.photos, captionMax: LIMITS.caption }),
  message: z
    .string()
    .trim()
    .min(10, "Write at least a few words")
    .max(LIMITS.message, `Keep it under ${LIMITS.message} characters`),
});

export type ApologyData = z.output<typeof apologySchema>;

export const apology: TemplateDef<typeof apologySchema> = {
  id: "apology",
  name: "Apology",
  tagline: "Tap away the rain clouds, say sorry in your words, and let the sun come back out.",
  emoji: "🌦️",
  categories: ["love", "friends", "family"],
  yesLabel: "You're forgiven 🤍",
  theme: { from: "#1f2a44", to: "#5b6b9a", ink: "#f4f2ff" },
  schema: apologySchema,
  steps: [
    {
      emoji: "🤍",
      title: "Who are you apologising to?",
      subtitle: "Their name goes on the first screen.",
      fields: [
        { type: "text", key: "to", label: "Their name", placeholder: "Zoya", maxLength: 40 },
        { type: "text", key: "from", label: "Your name", placeholder: "Ishaan", maxLength: 40 },
      ],
    },
    {
      emoji: "🌧️",
      title: "What are you sorry for?",
      subtitle: "Each line hides behind a rain cloud. They tap the clouds away one by one.",
      fields: [
        {
          type: "list",
          key: "sorry",
          suggestions: [
            "For not listening when you needed me",
            "For the things I said when I was angry",
            "For making you feel unimportant",
            "For being late, again",
            "For not saying sorry sooner",
            "For taking you for granted",
          ],
          label: "I'm sorry for…",
          itemPlaceholder: "Snapping at you when you were only trying to help",
          maxItems: LIMITS.sorry,
          maxLength: LIMITS.line,
          hint: "1 to 6 lines. Being specific means more than being long.",
        },
      ],
    },
    {
      emoji: "🤞",
      title: "What will you do differently?",
      subtitle: "Optional. Shown as a handwritten checklist that ticks itself.",
      fields: [
        {
          type: "list",
          key: "promises",
          suggestions: [
            "I'll listen before I react",
            "I'll call when I say I will",
            "I'll talk to you, not shut you out",
            "I'll make time for us, every week",
            "I'll say sorry first next time",
          ],
          label: "From now on, I promise…",
          itemPlaceholder: "To call when I'm running late",
          maxItems: LIMITS.promises,
          maxLength: LIMITS.line,
          hint: "Up to 5. Skip this if you'd rather say it in your message.",
        },
      ],
    },
    {
      emoji: "📸",
      title: "Add a few photos",
      subtitle: "Optional. A reminder of the good days.",
      fields: [
        {
          type: "photos",
          key: "photos",
          label: "Photos (optional)",
          maxPhotos: LIMITS.photos,
          captionMaxLength: LIMITS.caption,
          hint: "Up to 4. Skip this step if you like.",
        },
      ],
    },
    {
      emoji: "💌",
      title: "Say it in your words",
      subtitle: "They read this right before you ask for forgiveness.",
      fields: [
        {
          type: "textarea",
          key: "message",
          suggestions: [
            "{to},\n\nI'm sorry. Not the quick kind of sorry, the real kind. I hurt you, and you didn't deserve that. I've been thinking about it a lot, and I want to do better, for you and for us.\n\nI'm not asking you to forget it. I'm asking for a chance to show you I mean it.",
            "{to},\n\nI miss you. I miss us. I know I messed up, and I hate that I made you feel this way. You mean far more to me than any argument ever could.\n\nWhenever you're ready, I'm here.",
            "I'm sorry, {to}.\n\nI should have said it sooner and I should have said it better. You matter to me more than being right. Can we start again?",
          ],
          label: "Your message",
          placeholder: "I've been thinking about what happened…",
          maxLength: LIMITS.message,
          rows: 8,
        },
      ],
    },
  ],
  stockPhotos: [
    stockPhoto("stock/apology/bouquet.webp", "Flowers, and a sorry"),
    stockPhoto("stock/apology/pink-roses.webp", "For you"),
    stockPhoto("stock/apology/new-day.webp", "Better days ahead"),
    stockPhoto("stock/apology/calm-sky.webp", "Calm after the storm"),
  ],
  defaults: { to: "", from: "", sorry: [], promises: [], photos: [], message: "" },
  demo: {
    to: "Zoya",
    from: "Ishaan",
    sorry: [
      "Snapping at you when you were only trying to help",
      "Missing your cousin's mehendi after I promised I'd be there",
      "Making you feel like you came second to work",
      "Going quiet instead of just talking to you",
    ],
    promises: [
      "To call when I'm running late, every single time",
      "To put my phone away at dinner",
      "To talk it through, even when it's hard",
    ],
    photos: [
      { key: "stock/apology/bouquet.webp", url: "/stock/apology/bouquet.webp", caption: "Lost in Coorg, together" },
      { key: "stock/apology/pink-roses.webp", url: "/stock/apology/pink-roses.webp", caption: "Our kind of Sunday" },
    ],
    message:
      "Zoya,\n\nI've been replaying that evening all week, and I keep landing in the same place: you deserved better from me. Not a big speech, just me actually listening.\n\nI'm not asking you to forget it. I'm asking for the chance to show you I've understood.\n\nThank you for reading this far. I miss us.",
  },
};
