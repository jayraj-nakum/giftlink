"use client";

import { ownerKey } from "@/templates/ExperienceHost";

/**
 * Pay flow: save the draft as a gift → create a payment order → Razorpay checkout
 * (or the fake "mock" checkout in development) → verify on the server → link is live.
 */

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}
interface RazorpayInstance {
  open(): void;
}
declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

type OrderResponse =
  | { paid: true; slug: string }
  | { mode: "razorpay"; keyId: string; orderId: string; amount: number; currency: string; name: string; description: string }
  | { mode: "mock"; orderId: string; amount: number; currency: string; description: string };

export type CheckoutOutcome =
  | { status: "paid"; slug: string }
  | { status: "cancelled" }
  | { status: "error"; error: string; fields?: Record<string, string> };

interface Pending {
  slug: string;
  ownerToken: string;
  draftJson: string;
}

const pendingKey = (template: string) => `gl:pending:${template}`;
export const draftKey = (template: string) => `gl:draft:${template}`;

export function readPending(template: string): Pending | null {
  try {
    return JSON.parse(localStorage.getItem(pendingKey(template)) || "null") as Pending | null;
  } catch {
    return null;
  }
}

function store(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // storage blocked (private mode): the flow still works for this page view
  }
}

async function post<T>(url: string, body: unknown): Promise<{ ok: boolean; status: number; json: T & { error?: string } }> {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const json = (await res.json().catch(() => ({}))) as T & { error?: string };
  return { ok: res.ok, status: res.status, json };
}

function loadRazorpayScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Couldn't load the payment window. Check your connection."));
    document.body.appendChild(s);
  });
}

export async function checkout(
  template: string,
  data: Record<string, unknown>,
  confirmMock: (amount: number) => Promise<boolean>,
): Promise<CheckoutOutcome> {
  try {
    const draftJson = JSON.stringify(data);
    let pending = readPending(template);

    // Re-use the saved gift if nothing changed since the last attempt.
    for (let attempt = 0; attempt < 2; attempt++) {
      if (!pending || pending.draftJson !== draftJson) {
        const created = await post<{ slug: string; ownerToken: string; fields?: Record<string, string> }>("/api/gifts", {
          template,
          data,
        });
        if (!created.ok) return { status: "error", error: created.json.error || "Couldn't save your gift.", fields: created.json.fields };
        pending = { slug: created.json.slug, ownerToken: created.json.ownerToken, draftJson };
        store(pendingKey(template), JSON.stringify(pending));
        store(ownerKey(pending.slug), pending.ownerToken);
      }

      const order = await post<OrderResponse>("/api/checkout", { slug: pending.slug, ownerToken: pending.ownerToken });
      if (order.status === 404 && attempt === 0) {
        pending = null; // the saved draft expired; make a fresh one
        continue;
      }
      if (!order.ok) return { status: "error", error: order.json.error || "Couldn't start the payment." };

      const o = order.json;
      const { slug, ownerToken } = pending;
      const verify = async (extra: Record<string, string>): Promise<CheckoutOutcome> => {
        const v = await post<{ slug: string }>("/api/checkout/verify", { slug, ownerToken, ...extra });
        if (!v.ok) return { status: "error", error: v.json.error || "Payment check failed." };
        store(pendingKey(template), null);
        store(draftKey(template), null);
        return { status: "paid", slug };
      };

      if ("paid" in o) {
        store(pendingKey(template), null);
        return { status: "paid", slug: o.slug };
      }
      if (o.mode === "mock") {
        if (!(await confirmMock(o.amount))) return { status: "cancelled" };
        return verify({ orderId: o.orderId });
      }

      await loadRazorpayScript();
      return await new Promise<CheckoutOutcome>((resolve) => {
        const rzp = new window.Razorpay!({
          key: o.keyId,
          amount: o.amount,
          currency: o.currency,
          order_id: o.orderId,
          name: o.name,
          description: o.description,
          theme: { color: "#ff5a4e" },
          handler: (r: RazorpayResponse) => {
            void verify({ orderId: r.razorpay_order_id, paymentId: r.razorpay_payment_id, signature: r.razorpay_signature }).then(resolve);
          },
          modal: { ondismiss: () => resolve({ status: "cancelled" }) },
        });
        rzp.open();
      });
    }
    return { status: "error", error: "Couldn't start the payment." };
  } catch (e) {
    return { status: "error", error: e instanceof Error ? e.message : "Something went wrong. Please try again." };
  }
}
