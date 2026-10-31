import { z } from "zod";
import { nameSchema, photosSchema, stockPhoto, type TemplateDef } from "../types";

const LIMITS = { photos: 6, caption: 60, message: 1200, customQuestion: 60 } as const;

export const QUESTIONS = {
  girlfriend: "Will you be my girlfriend?",
  boyfriend: "Will you be my boyfriend?",
  partner: "Will you be mine?",
  valentine: "Will you be my Valentine?",
  marry: "Will you marry me?",
} as const;

export const proposalSchema = z
  .object({
    to: nameSchema("their name"),
    from: nameSchema("your name"),
    question: z.enum(["girlfriend", "boyfriend", "partner", "valentine", "marry", "custom"]),
    customQuestion: z.string().trim().max(LIMITS.customQuestion).optional(),
    photos: photosSchema({ min: 1, max: LIMITS.photos, captionMax: LIMITS.caption }),
    message: z
      .string()
      .trim()
      .min(10, "Write at least a few words")
      .max(LIMITS.message, `Keep it under ${LIMITS.message} characters`),
  })
  .refine((d) => d.question !== "custom" || (d.customQuestion ?? "").length >= 3, {
    path: ["customQuestion"],
    message: "Write your question",
  });

export type ProposalData = z.output<typeof proposalSchema>;

export function questionText(d: Pick<ProposalData, "question" | "customQuestion">): string {
  if (d.question === "custom") {
    const q = (d.customQuestion ?? "").trim();
    return q.endsWith("?") ? q : `${q}?`;
  }
  return QUESTIONS[d.question];
}

export const proposal: TemplateDef<typeof proposalSchema> = {
  id: "proposal",
  name: "Proposal",
  tagline: "Your photos, your words, then one question. The No button won't sit still.",
  emoji: "💍",
  categories: ["love"],
  yesLabel: "They said YES! 💍",
  theme: { from: "#3a0d2a", to: "#ff5c8a", ink: "#fff1f5" },
  schema: proposalSchema,
  steps: [
    {
      emoji: "💝",
      title: "Who's the lucky one?",
      fields: [
        { type: "text", key: "to", label: "Their name", placeholder: "Riya", maxLength: 40 },
        { type: "text", key: "from", label: "Your name", placeholder: "Arjun", maxLength: 40 },
      ],
    },
    {
      emoji: "💍",
      title: "What are you asking?",
      subtitle: "This is the big question at the end.",
      fields: [
        {
          type: "choice",
          key: "question",
          label: "The question",
          options: [
            { value: "girlfriend", label: QUESTIONS.girlfriend, emoji: "💖" },
            { value: "boyfriend", label: QUESTIONS.boyfriend, emoji: "💙" },
            { value: "partner", label: QUESTIONS.partner, emoji: "💞" },
            { value: "valentine", label: QUESTIONS.valentine, emoji: "🌹" },
            { value: "marry", label: QUESTIONS.marry, emoji: "💍" },
            { value: "custom", label: "Write my own", emoji: "✍️" },
          ],
        },
        {
          type: "text",
          key: "customQuestion",
          suggestions: [
            "Will you be my girlfriend?",
            "Will you be my boyfriend?",
            "Will you go on a date with me?",
            "Will you be my Valentine?",
          ],
          label: "Your question",
          placeholder: "Will you go on a date with me?",
          maxLength: LIMITS.customQuestion,
          showIf: { key: "question", equals: "custom" },
        },
      ],
    },
    {
      emoji: "📸",
      title: "Your story in photos",
      subtitle: "They play as a slideshow before the question.",
      fields: [
        {
          type: "photos",
          key: "photos",
          label: "Photos",
          maxPhotos: LIMITS.photos,
          captionMaxLength: LIMITS.caption,
          hint: "Up to 6. Captions show under each photo.",
        },
      ],
    },
    {
      emoji: "💌",
      title: "Say what you feel",
      subtitle: "They read this right before the question.",
      fields: [
        {
          type: "textarea",
          key: "message",
          suggestions: [
            "{to},\n\nFrom the first day we met, something just felt right. You make me laugh, you make me better, and you make every ordinary day feel like an adventure.\n\nI don't want to imagine a life without you in it. So I have one question to ask you...",
            "{to},\n\nI've rehearsed this a hundred times and I still don't have the perfect words. So I'll keep it simple: I love you. I love who I am with you, and I want to spend every day making you happy.\n\nReady for the question?",
            "Every memory in these photos has one thing in common: you. You are my favourite story, {to}, and I want to keep writing it with you.\n\nSo here goes...",
          ],
          label: "Your message",
          placeholder: "From the day we met…",
          maxLength: LIMITS.message,
          rows: 8,
        },
      ],
    },
  ],
  stockPhotos: [
    stockPhoto("stock/proposal/the-ring.webp", "For you"),
    stockPhoto("stock/proposal/candlelight-dinner.webp", "A table for two"),
    stockPhoto("stock/proposal/sunset-together.webp", "Every sunset with you"),
    stockPhoto("stock/proposal/roses.webp", "Roses, because you deserve them"),
    stockPhoto("stock/proposal/silhouettes.webp", "Just us"),
  ],
  defaults: { to: "", from: "", question: "girlfriend", photos: [], message: "" },
  demo: {
    to: "Riya",
    from: "Arjun",
    question: "girlfriend",
    photos: [
      { key: "stock/proposal/the-ring.webp", url: "/stock/proposal/the-ring.webp", caption: "The day you stole my fries" },
      { key: "stock/proposal/candlelight-dinner.webp", url: "/stock/proposal/candlelight-dinner.webp", caption: "Our first 'just friends' trip" },
      { key: "stock/proposal/sunset-together.webp", url: "/stock/proposal/sunset-together.webp", caption: "Every sunset is better with you" },
    ],
    message:
      "Riya, somewhere between the late-night calls and the fights over the last slice of pizza, you became my favourite person.\n\nI don't want to be just friends anymore.",
  },
};
