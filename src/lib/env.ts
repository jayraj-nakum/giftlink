import "server-only";

function num(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/** Server-side settings, read once from the environment. */
export const env = {
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  databaseUrl: process.env.DATABASE_URL || "file:./data/giftlink.db",
  databaseAuthToken: process.env.DATABASE_AUTH_TOKEN || undefined,
  pricePaise: num(process.env.PRICE_PAISE, 19900),
  linkLifetimeDays: num(process.env.LINK_LIFETIME_DAYS, 90),
  paymentMode: (process.env.PAYMENT_MODE === "razorpay" ? "razorpay" : "mock") as
    | "razorpay"
    | "mock",
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || "",
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || "",
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "",
  allowMockInProduction: process.env.ALLOW_MOCK_PAYMENTS_IN_PRODUCTION === "true",
  storageDriver: (process.env.STORAGE_DRIVER === "r2" ? "r2" : "local") as "r2" | "local",
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
