import "server-only";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { del, get, head, put } from "@vercel/blob";
import { AwsClient } from "aws4fetch";
import { env } from "@/lib/env";
import { UPLOAD_KEY_RE } from "@/lib/ids";

/**
 * Photo storage. "local" keeps files in ./data/uploads and serves them from /media/<key>.
 * "r2" puts them in a Cloudflare R2 (or any S3-compatible) bucket behind a public domain.
 * "blob" puts them in a Vercel Blob store; /media/<key> streams them (private store, the
 * default) or redirects to them (public store, BLOB_ACCESS=public).
 * Keys are random (u/<21 chars>.webp), so a photo URL can't be guessed.
 */
const LOCAL_DIR = path.join(process.cwd(), "data", "uploads");

function localPath(key: string): string {
  if (!UPLOAD_KEY_RE.test(key)) throw new Error("Invalid storage key");
  return path.join(LOCAL_DIR, key);
}

let r2Client: AwsClient | null = null;
function r2(): AwsClient {
  if (!env.r2.endpoint || !env.r2.bucket || !env.r2.accessKeyId || !env.r2.secretAccessKey) {
    throw new Error("STORAGE_DRIVER=r2 needs R2_ENDPOINT, R2_BUCKET, R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY");
  }
  r2Client ??= new AwsClient({
    accessKeyId: env.r2.accessKeyId,
    secretAccessKey: env.r2.secretAccessKey,
    service: "s3",
    region: "auto",
  });
  return r2Client;
}
const r2ObjectUrl = (key: string) => `${env.r2.endpoint}/${env.r2.bucket}/${key}`;

export async function putObject(key: string, body: Buffer, contentType: string): Promise<void> {
  if (env.storageDriver === "blob") {
    await put(key, body, { access: env.blobAccess, contentType, addRandomSuffix: false, cacheControlMaxAge: 31536000 });
    return;
  }
  if (env.storageDriver === "r2") {
    const res = await r2().fetch(r2ObjectUrl(key), {
      method: "PUT",
      body: new Uint8Array(body),
      headers: { "Content-Type": contentType, "Cache-Control": "public, max-age=31536000, immutable" },
    });
    if (!res.ok) throw new Error(`R2 upload failed: ${res.status}`);
    return;
  }
  const file = localPath(key);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, body);
}

export async function readLocalObject(key: string): Promise<Buffer | null> {
  try {
    return await readFile(localPath(key));
  } catch {
    return null;
  }
}

/** A photo from a private Blob store, or null if it's gone. */
export async function readBlobObject(key: string): Promise<ReadableStream<Uint8Array> | null> {
  if (!UPLOAD_KEY_RE.test(key)) return null;
  const res = await get(key, { access: "private" });
  return res?.statusCode === 200 ? res.stream : null;
}

/** Where a public Blob photo lives, or null if it's gone. */
export async function blobUrl(key: string): Promise<string | null> {
  if (!UPLOAD_KEY_RE.test(key)) return null;
  try {
    return (await head(key)).url;
  } catch {
    return null;
  }
}

export async function deleteObject(key: string): Promise<void> {
  if (env.storageDriver === "blob") {
    await del(key);
    return;
  }
  if (env.storageDriver === "r2") {
    const res = await r2().fetch(r2ObjectUrl(key), { method: "DELETE" });
    if (!res.ok && res.status !== 404) throw new Error(`R2 delete failed: ${res.status}`);
    return;
  }
  await rm(localPath(key), { force: true });
}

export function publicUrl(key: string): string {
  if (env.storageDriver === "r2") {
    if (!env.r2.publicBaseUrl) throw new Error("STORAGE_DRIVER=r2 needs R2_PUBLIC_BASE_URL");
    return `${env.r2.publicBaseUrl}/${key}`;
  }
  return `/media/${key}`;
}
