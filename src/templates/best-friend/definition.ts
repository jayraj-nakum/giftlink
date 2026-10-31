import { z } from "zod";
import { nameSchema, photosSchema, stockPhoto, type TemplateDef } from "../types";

const LIMITS = { jokes: 6, joke: 70, photos: 6, caption: 60, letter: 1500, firstYear: 1950, lastYear: new Date().getFullYear() };

export const bestFriendSchema = z.object({
  to: nameSchema("their name"),
  from: nameSchema("your name"),
  since: z
    .number()
    .int()
    .min(LIMITS.firstYear, `Pick a year after ${LIMITS.firstYear}`)
    .max(LIMITS.lastYear, "That year hasn't happened yet")
    .optional(),
  jokes: z
    .array(z.string().trim().min(1).max(LIMITS.joke))
    .min(1, "Add at least one inside joke")
    .max(LIMITS.jokes),
  photos: photosSchema({ min: 1, max: LIMITS.photos, captionMax: LIMITS.caption }),
  letter: z
    .string()
    .trim()
    .min(10, "Write at least a few words")
    .max(LIMITS.letter, `Keep it under ${LIMITS.letter} characters`),
});

export type BestFriendData = z.output<typeof bestFriendSchema>;

export const bestFriend: TemplateDef<typeof bestFriendSchema> = {
  id: "best-friend",
  name: "Best friend",
  tagline: "A top-secret case file on your friendship: the facts, the inside jokes, the evidence.",
  emoji: "🫶",
  categories: ["friends"],
  theme: { from: "#1f3d36", to: "#2bb39a", ink: "#f2fbf7" },
  schema: bestFriendSchema,
  steps: [
    {
      emoji: "🫶",
      title: "Who's your best friend?",
      subtitle: "Their name goes on the top-secret case file.",
      fields: [
        { type: "text", key: "to", label: "Their name", placeholder: "Zoya", maxLength: 40 },
        { type: "text", key: "from", label: "Your name", placeholder: "Neha", maxLength: 40 },
        {
          type: "number",
          key: "since",
          label: "Friends since (year, optional)",
          placeholder: "2016",
          min: LIMITS.firstYear,
          max: LIMITS.lastYear,
          hint: "We work out how many years it's been.",
        },
      ],
    },
    {
      emoji: "🤫",
      title: "The inside jokes",
      subtitle: "Each one hides under a 'classified' note. They tap to reveal it.",
      fields: [
        {
          type: "list",
          key: "jokes",
          suggestions: [
            "The 'shortcut' that took us two hours",
            "That one photo we swore to never post",
            "Our secret code word for 'let's leave'",
            "The night we ate maggi at 3 am",
            "You still owe me ₹50 from college",
            "The song we can never sing sober",
          ],
          label: "Inside jokes only you two get",
          itemPlaceholder: "The great Maggi disaster of 2017",
          maxItems: LIMITS.jokes,
          maxLength: LIMITS.joke,
          hint: "Add 1 to 6. A few words is enough. They'll know.",
        },
      ],
    },
    {
      emoji: "📸",
      title: "The evidence",
      subtitle: "Your photos, taped into the case file.",
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
      title: "Your letter",
      subtitle: "The one document in the file marked 'eyes only'.",
      fields: [
        {
          type: "textarea",
          key: "letter",
          suggestions: [
            "{to},\n\nYou've seen me at my best and at my absolute worst, and somehow you're still here. Thank you for every laugh, every secret kept and every time you picked up the phone without asking why.\n\nFriends like you are rare. I'm keeping you forever.",
            "Dear partner in crime,\n\nIf anyone ever reads this case file, they'll know two things: we are a little bit crazy, and we always have each other's backs. Here's to all the stories we can't tell our parents.\n\nLove you, idiot.",
            "{to},\n\nLife got busy, cities changed, but you never did. You're the one person I can not talk to for weeks and pick up exactly where we left off.\n\nThank you for being my person.",
          ],
          label: "Your letter",
          placeholder: "I don't say this enough, but…",
          maxLength: LIMITS.letter,
          rows: 9,
        },
      ],
    },
  ],
  stockPhotos: [
    stockPhoto("stock/best-friend/road-trip.webp", "Road trips"),
    stockPhoto("stock/best-friend/snack-run.webp", "Midnight snack runs"),
    stockPhoto("stock/best-friend/beach-day.webp", "Beach days"),
    stockPhoto("stock/best-friend/cheers.webp", "Cheers to us"),
    stockPhoto("stock/best-friend/sunset-chats.webp", "Sunset talks"),
  ],
  defaults: { to: "", from: "", jokes: [], photos: [], letter: "" },
  demo: {
    to: "Zoya",
    from: "Neha",
    since: 2016,
    jokes: [
      "The great Maggi disaster of 2017",
      "\"I'm five minutes away\" (she was not)",
      "The auto uncle who sang Kishore Kumar all the way home",
      "Bhaiya, thoda aur chutney",
      "Locked out of the hostel at 2 am, again",
    ],
    photos: [
      { key: "stock/best-friend/road-trip.webp", url: "/stock/best-friend/road-trip.webp", caption: "Goa, the trip we planned for three years" },
      { key: "stock/best-friend/snack-run.webp", url: "/stock/best-friend/snack-run.webp", caption: "Proof you can't take a serious photo" },
      { key: "stock/best-friend/beach-day.webp", url: "/stock/best-friend/beach-day.webp", caption: "Our usual table, our usual chaos" },
      { key: "stock/best-friend/cheers.webp", url: "/stock/best-friend/cheers.webp", caption: "Convocation day. We actually made it." },
    ],
    letter:
      "Zoya,\n\nTen years ago you borrowed a pen in chemistry class and never gave it back. You've been stuck with me ever since.\n\nThank you for every 2 am call, every honest opinion I didn't want to hear, and for laughing at my jokes even when they weren't funny. (Most of them were, though.)\n\nWherever life takes us, you'll always be my first call.",
  },
};
