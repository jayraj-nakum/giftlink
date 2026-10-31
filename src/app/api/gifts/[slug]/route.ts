import { NextResponse } from "next/server";
import { getGiftBySlug, giftUrl, isExpired, isOwner } from "@/lib/gifts";
import { jsonError } from "@/lib/http";
import { SLUG_RE } from "@/lib/ids";

/** Status and stats for the person who made the gift (needs their owner token). */
export async function GET(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  if (!SLUG_RE.test(slug)) return jsonError(404, "Not found");
  const gift = await getGiftBySlug(slug);
  if (!gift || !isOwner(gift, req.headers.get("x-owner-token"))) return jsonError(404, "Not found");

  return NextResponse.json({
    slug: gift.slug,
    template: gift.template,
    toName: gift.toName,
    status: gift.status,
    expired: isExpired(gift),
    url: giftUrl(gift.slug),
    paidAt: gift.paidAt,
    expiresAt: gift.expiresAt,
    views: gift.views,
    firstOpenedAt: gift.firstOpenedAt,
    lastOpenedAt: gift.lastOpenedAt,
    completedAt: gift.completedAt,
    answeredYesAt: gift.answeredYesAt,
  });
}
