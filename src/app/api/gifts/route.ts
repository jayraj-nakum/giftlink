import { NextResponse } from "next/server";
import { createGift } from "@/lib/gifts";
import { clientIp, jsonError, rateLimit, readJson } from "@/lib/http";

/** Saves a finished draft as an unpaid gift. Returns its slug and the owner's secret token. */
export async function POST(req: Request) {
  if (!rateLimit(`create:${clientIp(req)}`, 20, 10 * 60_000)) {
    return jsonError(429, "Too many attempts. Please wait a few minutes.");
  }
  const body = await readJson<{ template?: unknown; data?: unknown }>(req);
  if (!body || typeof body.template !== "string") return jsonError(400, "Bad request");

  const result = await createGift(body.template, body.data);
  if (!result.ok) return jsonError(result.status, result.error, { fields: result.fields });
  return NextResponse.json({ slug: result.slug, ownerToken: result.ownerToken });
}
