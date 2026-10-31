import { z } from "zod";
import { nameSchema, optionalUpcomingDate, photosSchema, stockPhoto, type TemplateDef } from "../types";

const LIMITS = { wishes: 6, wish: 60, photos: 6, caption: 60, letter: 1500 } as const;

export const birthdaySchema = z.object({
  to: nameSchema("their name"),
  from: nameSchema("your name"),
  age: z.number().int().min(1).max(120).optional(),
  birthday: optionalUpcomingDate(89),
  wishes: z.array(z.string().trim().min(1).max(LIMITS.wish)).max(LIMITS.wishes),
  photos: photosSchema({ min: 1, max: LIMITS.photos, captionMax: LIMITS.caption }),
  letter: z
    .string()
    .trim()
    .min(10, "Write at least a few words")
    .max(LIMITS.letter, `Keep it under ${LIMITS.letter} characters`),
});

export type BirthdayData = z.output<typeof birthdaySchema>;

export const birthday: TemplateDef<typeof birthdaySchema> = {
  id: "birthday",
  name: "Birthday",
  tagline: "Shake the gift, blow out the candles, pop the balloons, read your letter.",
  emoji: "🎂",
  categories: ["family", "friends", "love"],
  theme: { from: "#2b1846", to: "#ff7a59", ink: "#fff7ee" },
  schema: birthdaySchema,
  steps: [
    {
      emoji: "🎂",
      title: "Whose birthday is it?",
      subtitle: "Their name goes on the gift tag.",
      fields: [
        { type: "text", key: "to", label: "Their name", placeholder: "Meera", maxLength: 40 },
        { type: "text", key: "from", label: "Your name", placeholder: "Kabir", maxLength: 40 },
        {
          type: "number",
          key: "age",
          label: "Turning (optional)",
          placeholder: "25",
          min: 1,
          max: 120,
          hint: "We write it on the cake.",
        },
        {
          type: "date",
          key: "birthday",
          label: "Birthday date (optional)",
          hint: "Open it early and a countdown waits until 12:00 am on this day.",
        },
      ],
    },
    {
      emoji: "🎈",
      title: "Fill the balloons",
      subtitle: "Each balloon pops to show one wish. Skip this if you like.",
      fields: [
        {
          type: "list",
          key: "wishes",
          suggestions: [
            "May this year be your best one yet",
            "More road trips, less Monday mornings",
            "May every plan you make actually happen",
            "Good health, big laughs and endless chai",
            "May you get everything on your wishlist",
            "Stay exactly as wonderful as you are",
            "May all your dreams come true this year",
            "Cake for breakfast, at least once",
          ],
          label: "Wishes",
          itemPlaceholder: "May every Monday feel like a Friday",
          maxItems: LIMITS.wishes,
          maxLength: LIMITS.wish,
        },
      ],
    },
    {
      emoji: "📸",
      title: "Add your photos",
      subtitle: "They flip through them like a stack of prints.",
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
      emoji: "💌",
      title: "Write your letter",
      subtitle: "The last thing they read. Say it the way you would say it.",
      fields: [
        {
          type: "textarea",
          key: "letter",
          suggestions: [
            "Happy birthday, {to}!\n\nAnother year of you being the person who makes every room brighter. I don't say it enough, but I'm so grateful you're in my life. Thank you for every laugh, every late-night talk and every time you showed up when it mattered.\n\nI hope this year gives you everything you've been quietly wishing for.",
            "{to},\n\nI tried to find the perfect gift and realised nothing in a shop says what I actually want to say. So here it is: you matter so much to me. Your kindness, your silly jokes, the way you care about everyone around you.\n\nHave the happiest birthday. You deserve every bit of it.",
            "Happy birthday to my favourite person!\n\nI still remember when we first met, and look at us now. Thank you for all the memories, and here's to making a hundred more.\n\nEat too much cake today. That's an order.",
          ],
          label: "Your letter",
          placeholder: "Happy birthday! I still remember…",
          maxLength: LIMITS.letter,
          rows: 9,
        },
      ],
    },
  ],
  stockPhotos: [
    stockPhoto("stock/birthday/happy-birthday-candles.webp", "Make a wish ✨"),
    stockPhoto("stock/birthday/birthday-candles.webp", "Another year brighter"),
    stockPhoto("stock/birthday/cake-for-you.webp", "This one's for you"),
    stockPhoto("stock/birthday/make-a-wish.webp", "Blow out the candles"),
    stockPhoto("stock/birthday/birthday-cake.webp", "Cake first, always"),
  ],
  defaults: { to: "", from: "", wishes: [], photos: [], letter: "" },
  demo: {
    to: "Meera",
    from: "Kabir",
    age: 25,
    wishes: [
      "Endless chai and zero deadlines",
      "A year that feels like a long weekend",
      "Every playlist on shuffle hitting right",
      "More mountains, fewer meetings",
    ],
    photos: [
      { key: "stock/birthday/happy-birthday-candles.webp", url: "/stock/birthday/happy-birthday-candles.webp", caption: "That rainy evening in Lonavala" },
      { key: "stock/birthday/birthday-candles.webp", url: "/stock/birthday/birthday-candles.webp", caption: "You, mid-laugh, as always" },
      { key: "stock/birthday/cake-for-you.webp", url: "/stock/birthday/cake-for-you.webp", caption: "The sunset we drove two hours for" },
    ],
    letter:
      "Happy birthday, Meera!\n\nAnother year of you being the loudest laugh in every room. Thank you for the late-night calls, the terrible puns and for always showing up.\n\nI hope this year is as kind to you as you are to everyone around you.",
  },
};
