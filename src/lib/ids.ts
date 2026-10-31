import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { customAlphabet, nanoid } from "nanoid";

// No look-alike characters (0/o, 1/l/i) so links survive being read aloud or retyped.
const slugAlphabet = "23456789abcdefghjkmnpqrstuvwxyz";
/** 10 chars from 31 symbols is about 49 bits: not guessable, still short in WhatsApp. */
export const newSlug = customAlphabet(slugAlphabet, 10);
export const newId = () => nanoid(16);
export const newOwnerToken = () => nanoid(32);
export const newUploadKey = () => `u/${nanoid(21)}.webp`;

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function safeEqualHex(a: string, b: string): boolean {
  const ab = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  return ab.length === bb.length && ab.length > 0 && timingSafeEqual(ab, bb);
}

export const SLUG_RE = /^[23456789abcdefghjkmnpqrstuvwxyz]{10}$/;
export const UPLOAD_KEY_RE = /^u\/[A-Za-z0-9_-]{21}\.webp$/;
