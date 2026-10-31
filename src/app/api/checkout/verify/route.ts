import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { payments } from "@/lib/db/schema";
import { mockPaymentsAllowed } from "@/lib/env";
import { getGiftBySlug, giftUrl, isOwner, markPaid } from "@/lib/gifts";
import { clientIp, jsonError, rateLimit, readJson } from "@/lib/http";
import { verifyCheckoutSignature } from "@/lib/razorpay";

interface VerifyBody {
  slug?: string;
  ownerToken?: string;
  orderId?: string;
  paymentId?: string;
  signature?: string;
}

/** Called by the browser right after checkout succeeds. The webhook is the backup path. */
export async function POST(req: Request) {
  if (!rateLimit(`verify:${clientIp(req)}`, 30, 10 * 60_000)) return jsonError(429, "Slow down");
  const body = await readJson<VerifyBody>(req, 4_000);
  const gift = body?.slug ? await getGiftBySlug(String(body.slug)) : undefined;
  if (!gift || !isOwner(gift, body?.ownerToken)) return jsonError(404, "Gift not found");

  const orderId = String(body?.orderId ?? "");
  const payment = await db.query.payments.findFirst({
    where: and(eq(payments.orderId, orderId), eq(payments.giftId, gift.id)),
  });
  if (!payment) return jsonError(404, "Payment not found");

  if (payment.provider === "razorpay") {
    const paymentId = String(body?.paymentId ?? "");
    if (!paymentId || !verifyCheckoutSignature(orderId, paymentId, String(body?.signature ?? ""))) {
      return jsonError(400, "We couldn't confirm this payment. If money left your account, contact us.");
    }
    await markPaid(orderId, paymentId);
  } else {
    if (!mockPaymentsAllowed()) return jsonError(400, "Test payments are turned off.");
    await markPaid(orderId, `mockpay_${Date.now()}`);
  }

  return NextResponse.json({ paid: true, slug: gift.slug, url: giftUrl(gift.slug) });
}
