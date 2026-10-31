import { NextResponse } from "next/server";
import { getGiftBySlug, isExpired, recordEvent, type GiftEvent } from "@/lib/gifts";
import { clientIp, jsonError, rateLimit, readJson } from "@/lib/http";
import { SLUG_RE } from "@/lib/ids";

const EVENTS: GiftEvent[] = ["open", "complete", "yes"];

/** The recipient's page reports opens, finishing, and a "Yes" so the sender can see it. */
export async function POST(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  if (!SLUG_RE.test(slug)) return jsonError(404, "Not found");
  if (!rateLimit(`event:${clientIp(req)}:${slug}`, 30, 60 * 60_000)) return jsonError(429, "Slow down");

  const body = await readJson<{ event?: string }>(req, 1_000);
  const event = EVENTS.find((e) => e === body?.event);
  if (!event) return jsonError(400, "Unknown event");

  const gift = await getGiftBySlug(slug);
  if (!gift || gift.status !== "paid" || isExpired(gift)) return jsonError(404, "Not found");
  await recordEvent(gift, event);
  return NextResponse.json({ ok: true });
}
