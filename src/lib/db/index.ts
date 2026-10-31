import "server-only";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { env } from "@/lib/env";
import * as schema from "./schema";

function createDb() {
  const client = createClient({ url: env.databaseUrl, authToken: env.databaseAuthToken });
  return drizzle(client, { schema });
}

// Reuse one connection across hot reloads in development.
const globalForDb = globalThis as unknown as { __giftlinkDb?: ReturnType<typeof createDb> };
export const db = (globalForDb.__giftlinkDb ??= createDb());
export { schema };
