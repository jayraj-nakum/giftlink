import { defineConfig } from "drizzle-kit";

try {
  process.loadEnvFile(".env.local");
} catch {
  // No .env.local: fall back to the defaults below.
}

// Same fallbacks as src/lib/env.ts (TURSO_* come from the Turso integration on Vercel).
const url = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL || "file:./data/giftlink.db";
const authToken = process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN || undefined;

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: url.startsWith("file:") ? "sqlite" : "turso",
  dbCredentials: { url, authToken },
});
