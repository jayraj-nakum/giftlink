import { env } from "@/lib/env";
import { UPLOAD_KEY_RE } from "@/lib/ids";
import { blobUrl, readBlobObject, readLocalObject } from "@/lib/storage";

const PHOTO_HEADERS = {
  "Content-Type": "image/webp",
  // Keys are random and never change content, so browsers and the CDN can keep them.
  "Cache-Control": "public, max-age=31536000, immutable",
  "X-Content-Type-Options": "nosniff",
};

/**
 * Serves photos for STORAGE_DRIVER=local and =blob (streamed from a private store, or a
 * redirect into a public one). With R2 the bucket's public domain serves them.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ key: string[] }> }) {
  const key = (await ctx.params).key.join("/");
  if (env.storageDriver === "blob" && env.blobAccess === "private") {
    const stream = await readBlobObject(key);
    if (!stream) return new Response("Not found", { status: 404 });
    return new Response(stream, { headers: PHOTO_HEADERS });
  }
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
  return new Response(new Uint8Array(file), { headers: PHOTO_HEADERS });
}
