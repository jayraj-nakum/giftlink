import { env } from "@/lib/env";
import { UPLOAD_KEY_RE } from "@/lib/ids";
import { readLocalObject } from "@/lib/storage";

/** Serves photos when STORAGE_DRIVER=local. With R2 the bucket's public domain serves them. */
export async function GET(_req: Request, ctx: { params: Promise<{ key: string[] }> }) {
  const key = (await ctx.params).key.join("/");
  if (env.storageDriver !== "local" || !UPLOAD_KEY_RE.test(key)) {
    return new Response("Not found", { status: 404 });
  }
  const file = await readLocalObject(key);
  if (!file) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(file), {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
