"use client";

const MAX_SIDE = 1600;

/**
 * Shrinks a phone photo in the browser before upload (a 6 MB camera photo becomes ~300 KB),
 * which matters a lot on mobile data. Falls back to the original file if the browser can't decode it.
 */
async function compressImage(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const toBlob = (type: string) =>
      new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.86));
    let blob = await toBlob("image/webp");
    if (!blob || blob.type !== "image/webp") blob = await toBlob("image/jpeg"); // Safari can't encode WebP
    if (blob && blob.size < file.size) return blob;
  } catch {
    // e.g. HEIC on a browser that can't read it: let the server try.
  }
  return file;
}

export async function uploadPhoto(file: File): Promise<{ key: string; url: string }> {
  const blob = await compressImage(file);
  const form = new FormData();
  form.append("file", blob, "photo");
  let res: Response;
  try {
    res = await fetch("/api/upload", { method: "POST", body: form });
  } catch {
    throw new Error("No internet connection. Please try again.");
  }
  const json = (await res.json().catch(() => ({}))) as { key?: string; url?: string; error?: string };
  if (!res.ok || !json.key || !json.url) throw new Error(json.error || "Upload failed. Please try again.");
  return { key: json.key, url: json.url };
}
