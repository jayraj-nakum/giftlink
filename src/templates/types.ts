import { z } from "zod";

/**
 * A template = one occasion (Birthday, Proposal, ...).
 * Its definition (this shape) is plain data + a zod schema, so the server and
 * the browser validate exactly the same rules. Its animated Experience lives in
 * a separate client component (see ./experiences.tsx).
 */

export interface Photo {
  /** Storage key, e.g. u/AbC...xyz.webp */
  key: string;
  /** Resolved display URL. Filled in by the upload response or by the server at render time. */
  url?: string;
  caption?: string;
}

interface FieldBase {
  key: string;
  label: string;
  hint?: string;
  /** Show this field only when another choice field has a given value. */
  showIf?: { key: string; equals: string };
}

/**
 * Ready-made lines the maker can tap to use. `{to}` and `{from}` are swapped for
 * the names they typed.
 */
type Suggestions = { suggestions?: string[] };

export type Field =
  | (FieldBase & Suggestions & { type: "text"; placeholder?: string; maxLength: number })
  | (FieldBase & Suggestions & { type: "textarea"; placeholder?: string; maxLength: number; rows?: number })
  | (FieldBase & { type: "number"; placeholder?: string; min: number; max: number })
  | (FieldBase & { type: "date"; range?: "upcoming" | "past" })
  | (FieldBase & { type: "choice"; options: { value: string; label: string; emoji?: string }[] })
  | (FieldBase & Suggestions & { type: "list"; itemPlaceholder: string; maxItems: number; maxLength: number })
  | (FieldBase & { type: "photos"; maxPhotos: number; captionMaxLength: number });

export interface Step {
  emoji: string;
  title: string;
  subtitle?: string;
  fields: Field[];
}

export interface TemplateTheme {
  /** Card gradient on the landing page */
  from: string;
  to: string;
  /** Text colour on the card */
  ink: string;
}

export type BaseData = { to: string; from: string } & Record<string, unknown>;

export type TemplateCategory = "love" | "friends" | "family" | "festival";

export interface TemplateDef<S extends z.ZodType<BaseData> = z.ZodType<BaseData>> {
  id: string;
  name: string;
  /** One line under the card */
  tagline: string;
  emoji: string;
  /** Who it's for, used to filter the gallery. A template can be in several. */
  categories: TemplateCategory[];
  /** Small label on the card, e.g. "Popular" or "New" */
  badge?: string;
  theme: TemplateTheme;
  /** If the experience asks a question, what the maker sees when it's answered with "yes". */
  yesLabel?: string;
  schema: S;
  steps: Step[];
  /** Initial wizard values */
  defaults: Partial<z.input<S>>;
  /** Filled-in example used by /demo/<id> */
  demo: z.output<S>;
  /**
   * Photos that match the occasion, used when the maker adds none of their own.
   * Files live in public/stock/<id>/ (see public/stock/CREDITS.md).
   */
  stockPhotos?: Photo[];
}

/* ---------- shared schema pieces ---------- */

/** A user upload (u/...) or one of our bundled occasion photos (stock/...). */
export const PHOTO_KEY_RE = /^(?:u\/[A-Za-z0-9_-]{21}|stock\/[a-z-]+\/[a-z0-9-]+)\.webp$/;

export const isStockKey = (key: string) => key.startsWith("stock/");

/** Bundled photos are static files, served straight from /public. */
export const stockPhoto = (key: string, caption?: string): Photo => ({
  key,
  url: `/${key}`,
  ...(caption ? { caption } : {}),
});

/** Fills every empty photo field with the template's stock photos. Runs in the wizard and on the server. */
export function withStockPhotos<D extends Record<string, unknown>>(template: TemplateDef, data: D): D {
  if (!template.stockPhotos?.length) return data;
  const out: Record<string, unknown> = { ...data };
  for (const step of template.steps) {
    for (const field of step.fields) {
      if (field.type !== "photos") continue;
      const v = out[field.key];
      if (Array.isArray(v) && v.length > 0) continue;
      out[field.key] = template.stockPhotos.slice(0, field.maxPhotos).map((p) => stockPhoto(p.key, p.caption));
    }
  }
  return out as D;
}

export const nameSchema = (what: string) =>
  z.string().trim().min(1, `Add ${what}`).max(40, "Keep it under 40 characters");

export const photosSchema = (opts: { min: number; max: number; captionMax: number }) =>
  z
    .array(
      z.object({
        key: z.string().regex(PHOTO_KEY_RE, "Photo upload is incomplete"),
        url: z.string().optional(),
        caption: z.string().trim().max(opts.captionMax).optional(),
      }),
    )
    .min(opts.min, opts.min === 1 ? "Add at least one photo" : `Add at least ${opts.min} photos`)
    .max(opts.max, `Up to ${opts.max} photos`);

function parseLocalDate(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Optional YYYY-MM-DD from today up to `maxDaysAhead` days ahead. */
export const optionalUpcomingDate = (maxDaysAhead: number) =>
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date")
    .optional()
    .refine((value) => {
      if (!value) return true;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const days = (parseLocalDate(value).getTime() - today.getTime()) / 86_400_000;
      // -1 tolerates the server and the browser being in different time zones.
      return days >= -1 && days <= maxDaysAhead;
    }, `Pick a date within the next ${Math.round(maxDaysAhead / 30)} months`);

/** Optional YYYY-MM-DD in the past (e.g. the day you met). */
export const optionalPastDate = () =>
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date")
    .optional()
    .refine((value) => !value || (parseLocalDate(value).getTime() <= Date.now() + 86_400_000 && value >= "1940-01-01"), "Pick a date in the past");

export function localMidnightOf(value: string): Date {
  return parseLocalDate(value);
}

/** Error messages per top-level field key. */
export function issuesByField(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "_");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
