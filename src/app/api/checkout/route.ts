import { NextResponse } from "next/server";
import { site } from "@/config/site";
import { db } from "@/lib/db";
import { payments } from "@/lib/db/schema";
import { env, mockPaymentsAllowed } from "@/lib/env";
import { getGiftBySlug, isOwner } from "@/lib/gifts";
import { clientIp, jsonError, rateLimit, readJson } from "@/lib/http";
import { newId } from "@/lib/ids";
import { createRazorpayOrder } from "@/lib/razorpay";
import { getTemplate } from "@/templates/registry";

/** Creates a payment order for a draft gift. The amount always comes from the server. */
export async function POST(req: Request) {
  if (!rateLimit(`checkout:${clientIp(req)}`, 20, 10 * 60_000)) {
    return jsonError(429, "Too many attempts. Please wait a few minutes.");
  }
  const body = await readJson<{ slug?: string; ownerToken?: string }>(req, 2_000);
  const gift = body?.slug ? await getGiftBySlug(String(body.slug)) : undefined;
  if (!gift || !isOwner(gift, body?.ownerToken)) return jsonError(404, "Gift not found");
  if (gift.status === "paid") return NextResponse.json({ paid: true, slug: gift.slug });

  const description = `${getTemplate(gift.template)?.name ?? "Gift"} for ${gift.toName}`;

  if (env.paymentMode === "razorpay") {
    let order;
    try {
      order = await createRazorpayOrder({
        amount: env.pricePaise,
        receipt: gift.id,
        notes: { giftId: gift.id, slug: gift.slug },
      });
    } catch (err) {
      console.error("checkout: razorpay order failed", err);
      return jsonError(502, "Couldn't start the payment. Please try again.");
    }
    await db.insert(payments).values({
      id: newId(),
      giftId: gift.id,
      provider: "razorpay",
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      status: "created",
      createdAt: new Date(),
    });
    return NextResponse.json({
      mode: "razorpay",
      keyId: env.razorpayKeyId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      name: site.name,
      description,
    });
  }

  if (mockPaymentsAllowed()) {
    const orderId = `mock_${newId()}`;
    await db.insert(payments).values({
      id: newId(),
      giftId: gift.id,
      provider: "mock",
      orderId,
      amount: env.pricePaise,
      currency: "INR",
      status: "created",
      createdAt: new Date(),
    });
    return NextResponse.json({ mode: "mock", orderId, amount: env.pricePaise, currency: "INR", description });
  }

  return jsonError(503, "Payments are not set up yet.");
}
