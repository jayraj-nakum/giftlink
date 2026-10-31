/**
 * Brand and business settings. Rename the product here.
 * Everything that is safe to show in the browser lives in this file.
 */
export const site = {
  name: "GiftLink",
  tagline: "A little website, made for one person.",
  description:
    "Make an interactive surprise page for someone you love: their name, your photos, your words. Send it as one link.",
  supportEmail: "support@example.com",
  supportWhatsApp: "910000000000", // country code + number, digits only
  instagram: "", // handle without @, or leave empty
} as const;

export const pricing = {
  /** Shown in the UI. The server always charges PRICE_PAISE from env. */
  displayPrice: "₹199",
  lifetimeDays: 90,
} as const;
