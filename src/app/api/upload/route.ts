import { NextResponse } from "next/server";
import sharp, { type OutputInfo } from "sharp";
import { db } from "@/lib/db";
import { uploads } from "@/lib/db/schema";
import { clientIp, jsonError, rateLimit } from "@/lib/http";
import { newUploadKey } from "@/lib/ids";
import { publicUrl, putObject } from "@/lib/storage";

const MAX_BYTES = 10 * 1024 * 1024;

/**
 * Takes one photo, re-encodes it to WebP (max 1600px) and stores it.
 * Re-encoding also strips EXIF data such as GPS location, which phones embed in photos.
 */
export async function POST(req: Request) {
  if (!rateLimit(`upload:${clientIp(req)}`, 40, 10 * 60_000)) {
    return jsonError(429, "Too many uploads. Please wait a few minutes.");
  }
  if (Number(req.headers.get("content-length") || 0) > MAX_BYTES + 100_000) {
    return jsonError(413, "That photo is too large (max 10 MB).");
  }

  let file: FormDataEntryValue | null;
  try {
    file = (await req.formData()).get("file");
  } catch {
    return jsonError(400, "Upload failed. Please try again.");
  }
  if (!(file instanceof File) || file.size === 0) return jsonError(400, "No photo received.");
  if (file.size > MAX_BYTES) return jsonError(413, "That photo is too large (max 10 MB).");

  let output: { data: Buffer; info: OutputInfo };
  try {
    output = await sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 60_000_000 })
      .rotate() // respect the phone's orientation before metadata is dropped
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });
  } catch {
    return jsonError(415, "We couldn't read that image. Please use a JPG, PNG or WebP photo.");
  }

  const key = newUploadKey();
  try {
    await putObject(key, output.data, "image/webp");
  } catch (err) {
    console.error("upload: storage failed", err);
    return jsonError(500, "Couldn't save the photo. Please try again.");
  }
  await db.insert(uploads).values({
    key,
    giftId: null,
    bytes: output.info.size,
    width: output.info.width,
    height: output.info.height,
    createdAt: new Date(),
  });

  return NextResponse.json({ key, url: publicUrl(key), width: output.info.width, height: output.info.height });
}
