import { z } from "zod";
import { nameSchema, photosSchema, stockPhoto, type TemplateDef } from "../types";

const LIMITS = { photos: 4, caption: 60, message: 1200 } as const;

export const GREETINGS = ["Happy Diwali", "Shubh Deepavali", "Happy Deepavali"] as const;

export const diwaliSchema = z.object({
  to: nameSchema("their name"),
  from: nameSchema("your name"),
  greeting: z.enum(GREETINGS),
  photos: photosSchema({ min: 0, max: LIMITS.photos, captionMax: LIMITS.caption }),
  message: z
    .string()
    .trim()
    .min(10, "Write at least a few words")
    .max(LIMITS.message, `Keep it under ${LIMITS.message} characters`),
});

export type DiwaliData = z.output<typeof diwaliSchema>;

export const diwali: TemplateDef<typeof diwaliSchema> = {
  id: "diwali",
  name: "Diwali",
  tagline: "They light five diyas, a rangoli blooms, the sky bursts open, then your wishes.",
  emoji: "🪔",
  categories: ["festival", "family", "friends"],
  badge: "Diwali special",
  theme: { from: "#2a0d3a", to: "#ff8a2a", ink: "#fff6e0" },
  schema: diwaliSchema,
  steps: [
    {
      emoji: "🪔",
      title: "Who's it for?",
      subtitle: "Their name glows over the diyas.",
      fields: [
        { type: "text", key: "to", label: "Their name", placeholder: "Dadi", maxLength: 40 },
        { type: "text", key: "from", label: "Your name", placeholder: "Kabir", maxLength: 40 },
      ],
    },
    {
      emoji: "✨",
      title: "Pick your greeting",
      subtitle: "It lights up the sky once every diya is lit.",
      fields: [
        {
          type: "choice",
          key: "greeting",
          label: "Greeting",
          options: [
            { value: "Happy Diwali", label: "Happy Diwali", emoji: "🪔" },
            { value: "Shubh Deepavali", label: "Shubh Deepavali", emoji: "✨" },
            { value: "Happy Deepavali", label: "Happy Deepavali", emoji: "🎆" },
          ],
        },
      ],
    },
    {
      emoji: "📸",
      title: "Add a few photos",
      subtitle: "Optional. They flip through them like a stack of prints.",
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
      title: "Write your wishes",
      subtitle: "The last thing they read, framed in marigolds.",
      fields: [
        {
          type: "textarea",
          key: "message",
          suggestions: [
            "Happy Diwali, {to}!\n\nMay the diyas light up every corner of your home and the year ahead bring you good health, happiness and lots of laughter. Thank you for always being there.\n\nWith love, this Diwali and always.",
            "Wishing you and the whole family a very happy Diwali!\n\nMay Lakshmi ji bless your home with prosperity, and may this festival of lights fill your life with joy, sweets and peace.",
            "{to},\n\nDiwali never feels complete without you. Even from far away, I'm lighting a diya for you tonight. May this year be your brightest yet.\n\nHappy Diwali!",
          ],
          label: "Your wishes",
          placeholder: "Happy Diwali! This year I hope…",
          maxLength: LIMITS.message,
          rows: 8,
        },
      ],
    },
  ],
  stockPhotos: [
    stockPhoto("stock/diwali/diyas.webp", "Diyas, lit for you"),
    stockPhoto("stock/diwali/marigolds-and-lamp.webp", "Marigolds and light"),
    stockPhoto("stock/diwali/diya-glow.webp", "May your year glow"),
    stockPhoto("stock/diwali/fireworks.webp", "Light up the sky"),
  ],
  defaults: { to: "", from: "", greeting: "Happy Diwali", photos: [], message: "" },
  demo: {
    to: "Dadi",
    from: "Kabir",
    greeting: "Happy Diwali",
    photos: [
      { key: "stock/diwali/diyas.webp", url: "/stock/diwali/diyas.webp", caption: "The rangoli we made on the terrace" },
      { key: "stock/diwali/marigolds-and-lamp.webp", url: "/stock/diwali/marigolds-and-lamp.webp", caption: "Your kaju katli, still undefeated" },
      { key: "stock/diwali/diya-glow.webp", url: "/stock/diwali/diya-glow.webp", caption: "Everyone in one frame, finally" },
    ],
    message:
      "Every year you light the first diya and somehow the whole house feels warmer. Thank you for the stories, for the extra laddoo you sneak onto my plate, and for teaching me that a rangoli doesn't have to be perfect to be beautiful.\n\nI wish I could be there to light them with you this year. Save me some chakli, I'll be home before you know it.\n\nHappy Diwali, Dadi. Love you lots.",
  },
};
