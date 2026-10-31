import { env } from "@/lib/env";
import { UPLOAD_KEY_RE } from "@/lib/ids";
import { blobUrl, readLocalObject } from "@/lib/storage";

/**
 * Serves photos when STORAGE_DRIVER=local, and points to them in the Blob store when
 * STORAGE_DRIVER=blob. With R2 the bucket's public domain serves them.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ key: string[] }> }) {
  const key = (await ctx.params).key.join("/");
  if (env.storageDriver === "blob") {
    const url = await blobUrl(key);
    if (!url) return new Response("Not found", { status: 404 });
    // Keys never change content, so the CDN can keep this redirect.
    return new Response(null, {
      status: 308,
      headers: { Location: url, "Cache-Control": "public, max-age=86400, s-maxage=31536000, immutable" },
    });
  }
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
