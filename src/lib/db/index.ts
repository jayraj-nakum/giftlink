import "server-only";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { env } from "@/lib/env";
import * as schema from "./schema";

function createDb() {
  if (process.env.VERCEL && env.databaseUrl.startsWith("file:")) {
    // Vercel has no disk to keep a SQLite file on.
    throw new Error("No database configured: connect a Turso database (Vercel → Storage) or set DATABASE_URL.");
  }
  const client = createClient({ url: env.databaseUrl, authToken: env.databaseAuthToken });
  return drizzle(client, { schema });
}

type Db = ReturnType<typeof createDb>;

// Reuse one connection across hot reloads in development.
const globalForDb = globalThis as unknown as { __giftlinkDb?: Db };
const getDb = () => (globalForDb.__giftlinkDb ??= createDb());

/**
 * Connects on first use, not on import, so `next build` (which loads every route)
 * never needs a database.
 */
export const db = new Proxy({} as Db, {
  get(_target, prop) {
    const real = getDb();
    const value = Reflect.get(real, prop, real);
    return typeof value === "function" ? value.bind(real) : value;
  },
});
export { schema };
