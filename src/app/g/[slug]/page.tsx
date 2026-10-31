import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { dataForRender, getGiftBySlug, isExpired } from "@/lib/gifts";
import { SLUG_RE } from "@/lib/ids";
import { ExperienceHost } from "@/templates/ExperienceHost";

type Props = { params: Promise<{ slug: string }> };

async function loadLiveGift(slug: string) {
  await connection(); // always read fresh: payment, expiry and views change
  if (!SLUG_RE.test(slug)) return null;
  const gift = await getGiftBySlug(slug);
  return gift && gift.status === "paid" ? gift : null;
}

/** The link preview WhatsApp shows: "A surprise for Meera 🎁". */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const gift = await loadLiveGift((await params).slug);
  const robots = { index: false, follow: false };
  if (!gift || isExpired(gift)) return { title: { absolute: "A little surprise 🎁" }, robots };
  const title = `A surprise for ${gift.toName} 🎁`;
  const description = `${gift.fromName} made something just for you. Open it with sound on.`;
  return { title: { absolute: title }, description, robots, openGraph: { title, description, type: "website" } };
}

export default function GiftPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-[#1a0f2b]" />}>
      <Gift params={params} />
    </Suspense>
  );
}

async function Gift({ params }: Props) {
  const gift = await loadLiveGift((await params).slug);
  if (!gift) notFound();
  if (isExpired(gift)) {
    return (
      <main className="flex min-h-dvh bg-cream flex-col items-center justify-center px-6 text-center">
        <div className="text-6xl">🍂</div>
        <h1 className="mt-6 font-display text-4xl font-semibold">This surprise has ended</h1>
        <p className="mt-3 max-w-sm text-ink-soft">
          Gifts stay open for a limited time, then they and their photos are deleted. Ask {gift.fromName} for a new one, or
          make one of your own.
        </p>
        <Link href="/" className="mt-8 rounded-full bg-coral px-7 py-4 font-semibold text-white">
          Make a surprise
        </Link>
      </main>
    );
  }
  return <ExperienceHost template={gift.template} data={dataForRender(gift)} mode="live" slug={gift.slug} />;
}
