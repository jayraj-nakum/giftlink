import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SLUG_RE } from "@/lib/ids";
import { ReadyView } from "./ReadyView";

export const metadata: Metadata = { title: "Your link is ready", robots: { index: false, follow: false } };

export default function ReadyPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <main className="min-h-dvh bg-cream">
      <SiteHeader cta={false} nav={false} />
      <Suspense fallback={<div className="mx-auto mt-10 h-64 max-w-xl animate-pulse rounded-[2rem] bg-ink/5" />}>
        <Ready params={params} />
      </Suspense>
    </main>
  );
}

async function Ready({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!SLUG_RE.test(slug)) notFound();
  return <ReadyView slug={slug} />;
}
