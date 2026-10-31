import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WizardLoader } from "@/components/builder/WizardLoader";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getTemplate, templateIds } from "@/templates/registry";

export function generateStaticParams() {
  return templateIds.map((template) => ({ template }));
}

export async function generateMetadata({ params }: { params: Promise<{ template: string }> }): Promise<Metadata> {
  const t = getTemplate((await params).template);
  return { title: t ? `Make a ${t.name.toLowerCase()} gift` : "Not found" };
}

export default async function CreatePage({ params }: { params: Promise<{ template: string }> }) {
  const t = getTemplate((await params).template);
  if (!t) notFound();
  return (
    <main className="min-h-dvh bg-cream">
      <SiteHeader cta={false} nav={false} />
      <WizardLoader templateId={t.id} />
    </main>
  );
}
