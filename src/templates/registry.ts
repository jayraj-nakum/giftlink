import { anniversary } from "./anniversary/definition";
import { apology } from "./apology/definition";
import { bestFriend } from "./best-friend/definition";
import { birthday } from "./birthday/definition";
import { diwali } from "./diwali/definition";
import { loveNotes } from "./love-notes/definition";
import { proposal } from "./proposal/definition";
import { puzzle } from "./puzzle/definition";
import type { BaseData, TemplateDef } from "./types";
import type { z } from "zod";

/**
 * Every live occasion. To add one:
 * 1. src/templates/<id>/definition.ts  (schema + wizard steps + demo data)
 * 2. src/templates/<id>/Experience.tsx (what the recipient sees)
 *    (+ Cover.tsx and art.tsx for the gallery card)
 * 3. register it here, in ./experiences.tsx and in ./covers.tsx
 * The order here is the order on the home page.
 */
export const templates = {
  diwali,
  birthday,
  "love-notes": loveNotes,
  proposal,
  "best-friend": bestFriend,
  anniversary,
  apology,
  puzzle,
} as unknown as Record<string, TemplateDef<z.ZodType<BaseData>>>;

export const templateIds = Object.keys(templates);

export function getTemplate(id: string): TemplateDef | undefined {
  return Object.hasOwn(templates, id) ? templates[id] : undefined;
}
