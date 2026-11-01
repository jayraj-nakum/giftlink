import "server-only";

function num(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function storageDriver(): "r2" | "blob" | "local" {
  const v = process.env.STORAGE_DRIVER;
  if (v === "r2" || v === "blob" || v === "local") return v;
  // Connecting a Vercel Blob store adds this token, so Blob is the default on Vercel.
  return process.env.BLOB_READ_WRITE_TOKEN ? "blob" : "local";
}

/** Server-side settings, read once from the environment. */
export const env = {
  // On Vercel, the project's production domain unless a custom one is set.
  siteUrl: (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
    "http://localhost:3000"
  ).replace(/\/$/, ""),
  // TURSO_* are the names the Turso integration on Vercel creates.
  databaseUrl: process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL || "file:./data/giftlink.db",
  databaseAuthToken: process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN || undefined,
  pricePaise: num(process.env.PRICE_PAISE, 19900),
  linkLifetimeDays: num(process.env.LINK_LIFETIME_DAYS, 90),
  paymentMode: (process.env.PAYMENT_MODE === "razorpay" ? "razorpay" : "mock") as
    | "razorpay"
    | "mock",
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || "",
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || "",
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "",
  allowMockInProduction: process.env.ALLOW_MOCK_PAYMENTS_IN_PRODUCTION === "true",
  storageDriver: storageDriver(),
  // Must match how the Vercel Blob store was created (Vercel's default is private).
  blobAccess: (process.env.BLOB_ACCESS === "public" ? "public" : "private") as "public" | "private",
  r2: {
    endpoint: (process.env.R2_ENDPOINT || "").replace(/\/$/, ""),
    bucket: process.env.R2_BUCKET || "",
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    publicBaseUrl: (process.env.R2_PUBLIC_BASE_URL || "").replace(/\/$/, ""),
  },
  cronSecret: process.env.CRON_SECRET || "",
};

/** Mock payments are for local testing; never silently enabled in production. */
export function mockPaymentsAllowed(): boolean {
  if (env.paymentMode !== "mock") return false;
  return process.env.NODE_ENV !== "production" || env.allowMockInProduction;
}
