import "server-only";
import { and, eq, inArray, isNull, lt, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { gifts, payments, uploads, type Gift } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { hashToken, newId, newOwnerToken, newSlug, safeEqualHex } from "@/lib/ids";
import { deleteObject, publicUrl } from "@/lib/storage";
import { getTemplate } from "@/templates/registry";
import { isStockKey, issuesByField, stockPhoto, withStockPhotos, type Photo } from "@/templates/types";

const DAY_MS = 86_400_000;

/** Every photo array in a template's data, wherever it sits. */
function photoArrays(data: Record<string, unknown>): Photo[][] {
  return Object.values(data).filter(
    (v): v is Photo[] =>
      Array.isArray(v) && v.length > 0 && typeof v[0] === "object" && v[0] !== null && "key" in v[0],
  );
}

type CreateResult =
  | { ok: true; slug: string; ownerToken: string }
  | { ok: false; status: number; error: string; fields?: Record<string, string> };

export async function createGift(templateId: string, rawData: unknown): Promise<CreateResult> {
  const template = getTemplate(templateId);
  if (!template) return { ok: false, status: 404, error: "Unknown occasion" };

  const filled =
    rawData && typeof rawData === "object" ? withStockPhotos(template, rawData as Record<string, unknown>) : rawData;
  const parsed = template.schema.safeParse(filled);
  if (!parsed.success) {
    return { ok: false, status: 422, error: "Some details need fixing", fields: issuesByField(parsed.error) };
  }
  const data = parsed.data as Record<string, unknown>;

  // Store only keys and captions; URLs are resolved when the gift is shown.
  const keys: string[] = [];
  for (const [field, value] of Object.entries(data)) {
    const arr = photoArrays({ [field]: value })[0];
    if (!arr) continue;
    data[field] = arr.map((p) => ({ key: p.key, ...(p.caption ? { caption: p.caption } : {}) }));
    // Stock photos are static files, not uploads: nothing to check or attach.
    keys.push(...arr.map((p) => p.key).filter((k) => !isStockKey(k)));
  }

  if (keys.length > 0) {
    const rows = await db
      .select({ key: uploads.key, giftStatus: gifts.status })
      .from(uploads)
      .leftJoin(gifts, eq(gifts.id, uploads.giftId))
      .where(inArray(uploads.key, keys));
    const usable = new Set(rows.filter((r) => r.giftStatus !== "paid").map((r) => r.key));
    if (keys.some((k) => !usable.has(k))) {
      return { ok: false, status: 422, error: "A photo is missing. Please upload it again.", fields: { photos: "Upload this photo again" } };
    }
  }

  const id = newId();
  const slug = newSlug();
  const ownerToken = newOwnerToken();
  await db.insert(gifts).values({
    id,
    slug,
    template: template.id,
    data,
    toName: String(data.to),
    fromName: String(data.from),
    ownerTokenHash: hashToken(ownerToken),
    status: "draft",
    createdAt: new Date(),
  });
  if (keys.length > 0) {
    await db.update(uploads).set({ giftId: id }).where(inArray(uploads.key, keys));
  }
  return { ok: true, slug, ownerToken };
}

export async function getGiftBySlug(slug: string): Promise<Gift | undefined> {
  return db.query.gifts.findFirst({ where: eq(gifts.slug, slug) });
}

export function isOwner(gift: Gift, token: string | null | undefined): boolean {
  return !!token && token.length <= 64 && safeEqualHex(hashToken(token), gift.ownerTokenHash);
}

export function isExpired(gift: Gift, now = Date.now()): boolean {
  return !!gift.expiresAt && gift.expiresAt.getTime() < now;
}

export function giftUrl(slug: string): string {
  return `${env.siteUrl}/g/${slug}`;
}

/** Template data with photo URLs filled in, ready for the Experience component. */
export function dataForRender(gift: Gift): Record<string, unknown> {
  const data = structuredClone(gift.data);
  for (const [field, value] of Object.entries(data)) {
    const arr = photoArrays({ [field]: value })[0];
    if (arr) data[field] = arr.map((p) => (isStockKey(p.key) ? stockPhoto(p.key, p.caption) : { ...p, url: publicUrl(p.key) }));
  }
  return data;
}

/** Idempotent: safe to call from the checkout callback and the webhook. */
export async function markPaid(orderId: string, paymentId: string | null): Promise<Gift | undefined> {
  const payment = await db.query.payments.findFirst({ where: eq(payments.orderId, orderId) });
  if (!payment) return undefined;
  const now = new Date();
  await db.transaction(async (tx) => {
    await tx
      .update(payments)
      .set({ status: "paid", paidAt: now, ...(paymentId ? { paymentId } : {}) })
      .where(and(eq(payments.id, payment.id), eq(payments.status, "created")));
    await tx
      .update(gifts)
      .set({
        status: "paid",
        paidAt: now,
        expiresAt: new Date(now.getTime() + env.linkLifetimeDays * DAY_MS),
      })
      .where(and(eq(gifts.id, payment.giftId), eq(gifts.status, "draft")));
  });
  return db.query.gifts.findFirst({ where: eq(gifts.id, payment.giftId) });
}

export type GiftEvent = "open" | "complete" | "yes";

export async function recordEvent(gift: Gift, event: GiftEvent): Promise<void> {
  const now = new Date();
  if (event === "open") {
    await db
      .update(gifts)
      .set({
        views: sql`${gifts.views} + 1`,
        lastOpenedAt: now,
        firstOpenedAt: sql`coalesce(${gifts.firstOpenedAt}, ${now.getTime()})`,
      })
      .where(eq(gifts.id, gift.id));
  } else if (event === "complete") {
    await db.update(gifts).set({ completedAt: now }).where(and(eq(gifts.id, gift.id), isNull(gifts.completedAt)));
  } else if (event === "yes") {
    await db
      .update(gifts)
      .set({ answeredYesAt: now })
      .where(and(eq(gifts.id, gift.id), isNull(gifts.answeredYesAt)));
  }
}

/**
 * Deletes expired gifts, unpaid drafts older than 2 days and photos never attached
 * to a gift (abandoned uploads) older than 1 day. Run it daily via /api/cron/cleanup.
 */
export async function cleanup(): Promise<{ gifts: number; photos: number }> {
  const now = Date.now();
  const doomed = await db
    .select({ id: gifts.id })
    .from(gifts)
    .where(
      or(
        lt(gifts.expiresAt, new Date(now)),
        and(eq(gifts.status, "draft"), lt(gifts.createdAt, new Date(now - 2 * DAY_MS))),
      ),
    );
  const giftIds = doomed.map((g) => g.id);

  const photoRows = await db
    .select({ key: uploads.key })
    .from(uploads)
    .where(
      or(
        giftIds.length ? inArray(uploads.giftId, giftIds) : sql`0`,
        and(isNull(uploads.giftId), lt(uploads.createdAt, new Date(now - DAY_MS))),
      ),
    );

  let photos = 0;
  for (const { key } of photoRows) {
    try {
      await deleteObject(key);
      await db.delete(uploads).where(eq(uploads.key, key));
      photos++;
    } catch (err) {
      console.error("cleanup: could not delete", key, err);
    }
  }
  if (giftIds.length) {
    await db.delete(payments).where(and(inArray(payments.giftId, giftIds), eq(payments.status, "created")));
    await db.delete(gifts).where(inArray(gifts.id, giftIds));
  }
  return { gifts: giftIds.length, photos };
}
