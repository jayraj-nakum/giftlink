import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const gifts = sqliteTable(
  "gifts",
  {
    id: text("id").primaryKey(),
    /** Public, unguessable code used in the share link: /g/<slug> */
    slug: text("slug").notNull().unique(),
    template: text("template").notNull(),
    /** Template-specific content (names, letter, photo keys...). Validated by the template schema. */
    data: text("data", { mode: "json" }).$type<Record<string, unknown>>().notNull(),
    toName: text("to_name").notNull(),
    fromName: text("from_name").notNull(),
    /** sha256 of the secret the creator's browser keeps. Lets them see stats. */
    ownerTokenHash: text("owner_token_hash").notNull(),
    status: text("status", { enum: ["draft", "paid"] }).notNull().default("draft"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    paidAt: integer("paid_at", { mode: "timestamp_ms" }),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }),
    views: integer("views").notNull().default(0),
    firstOpenedAt: integer("first_opened_at", { mode: "timestamp_ms" }),
    lastOpenedAt: integer("last_opened_at", { mode: "timestamp_ms" }),
    completedAt: integer("completed_at", { mode: "timestamp_ms" }),
    answeredYesAt: integer("answered_yes_at", { mode: "timestamp_ms" }),
  },
  (t) => [index("gifts_status_idx").on(t.status, t.createdAt), index("gifts_expiry_idx").on(t.expiresAt)],
);

export const uploads = sqliteTable(
  "uploads",
  {
    key: text("key").primaryKey(),
    giftId: text("gift_id"),
    bytes: integer("bytes").notNull(),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [index("uploads_gift_idx").on(t.giftId), index("uploads_created_idx").on(t.createdAt)],
);

export const payments = sqliteTable(
  "payments",
  {
    id: text("id").primaryKey(),
    giftId: text("gift_id").notNull(),
    provider: text("provider", { enum: ["razorpay", "mock"] }).notNull(),
    orderId: text("order_id").notNull().unique(),
    paymentId: text("payment_id"),
    amount: integer("amount").notNull(),
    currency: text("currency").notNull().default("INR"),
    status: text("status", { enum: ["created", "paid"] }).notNull().default("created"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    paidAt: integer("paid_at", { mode: "timestamp_ms" }),
  },
  (t) => [index("payments_gift_idx").on(t.giftId)],
);

export type Gift = typeof gifts.$inferSelect;
export type Upload = typeof uploads.$inferSelect;
export type Payment = typeof payments.$inferSelect;
