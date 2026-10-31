import { ImageResponse } from "next/og";
import { getGiftBySlug, isExpired } from "@/lib/gifts";
import { SLUG_RE } from "@/lib/ids";
import { getTemplate } from "@/templates/registry";

export const alt = "A surprise made just for you";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The picture in the WhatsApp / Instagram link preview. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const gift = SLUG_RE.test(slug) ? await getGiftBySlug(slug) : undefined;
  const live = gift && gift.status === "paid" && !isExpired(gift);
  const t = live ? getTemplate(gift.template) : undefined;
  const from = t?.theme.from ?? "#2b1846";
  const to = t?.theme.to ?? "#ff5a4e";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(135deg, ${from}, ${to})`,
          color: "white",
          fontSize: 40,
        }}
      >
        <div style={{ fontSize: 140 }}>{t?.emoji ?? "🎁"}</div>
        <div style={{ marginTop: 20, opacity: 0.75, letterSpacing: 8, textTransform: "uppercase", fontSize: 30 }}>
          A surprise for
        </div>
        <div style={{ marginTop: 8, fontSize: 96, fontWeight: 700 }}>{live ? gift.toName : "you"}</div>
        {live && <div style={{ marginTop: 16, opacity: 0.8 }}>{`from ${gift.fromName} · tap to open`}</div>}
      </div>
    ),
    size,
  );
}
