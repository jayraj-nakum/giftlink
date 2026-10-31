import { defineConfig } from "drizzle-kit";

try {
  process.loadEnvFile(".env.local");
} catch {
  // No .env.local: fall back to the defaults below.
}

const url = process.env.DATABASE_URL || "file:./data/giftlink.db";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: url.startsWith("file:") ? "sqlite" : "turso",
  dbCredentials: { url, authToken: process.env.DATABASE_AUTH_TOKEN || undefined },
});
