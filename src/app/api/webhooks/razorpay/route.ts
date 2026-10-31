import { NextResponse } from "next/server";
import { markPaid } from "@/lib/gifts";
import { jsonError } from "@/lib/http";
import { verifyWebhookSignature } from "@/lib/razorpay";

interface RazorpayWebhook {
  event?: string;
  payload?: {
    payment?: { entity?: { id?: string; order_id?: string; status?: string } };
    order?: { entity?: { id?: string } };
  };
}

/**
 * Razorpay → Dashboard → Webhooks: point it at /api/webhooks/razorpay with events
 * "payment.captured" and "order.paid". This unlocks the gift even when the buyer's
 * browser closed before the checkout callback ran ("money left my account but no link").
 */
export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyWebhookSignature(raw, req.headers.get("x-razorpay-signature") ?? "")) {
    return jsonError(400, "Invalid signature");
  }
  let evt: RazorpayWebhook;
  try {
    evt = JSON.parse(raw) as RazorpayWebhook;
  } catch {
    return jsonError(400, "Bad payload");
  }

  if (evt.event === "payment.captured" || evt.event === "order.paid") {
    const payment = evt.payload?.payment?.entity;
    const orderId = payment?.order_id ?? evt.payload?.order?.entity?.id;
    if (orderId) await markPaid(orderId, payment?.id ?? null);
  }
  return NextResponse.json({ ok: true });
}
