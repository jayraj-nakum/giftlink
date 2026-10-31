import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { cleanup } from "@/lib/gifts";
import { jsonError } from "@/lib/http";

/** Run daily (Vercel Cron, GitHub Actions, or crontab + curl) with "Authorization: Bearer $CRON_SECRET". */
export async function GET(req: Request) {
  if (!env.cronSecret || env.cronSecret === "change-me") return jsonError(503, "Set CRON_SECRET first");
  if (req.headers.get("authorization") !== `Bearer ${env.cronSecret}`) return jsonError(401, "Unauthorized");
  const result = await cleanup();
  return NextResponse.json({ ok: true, deleted: result });
}
