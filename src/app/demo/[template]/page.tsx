import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTemplate, templateIds } from "@/templates/registry";
import { DemoHost } from "./DemoHost";

export function generateStaticParams() {
  return templateIds.map((template) => ({ template }));
}

export async function generateMetadata({ params }: { params: Promise<{ template: string }> }): Promise<Metadata> {
  const t = getTemplate((await params).template);
  return { title: t ? `${t.name} gift demo` : "Not found", description: t?.tagline };
}

export default async function DemoPage({ params }: { params: Promise<{ template: string }> }) {
  const t = getTemplate((await params).template);
  if (!t) notFound();
  return <DemoHost id={t.id} demo={t.demo as Record<string, unknown>} />;
}
