import { SiteFooter, SiteHeader } from "./SiteHeader";

/**
 * Shared layout for policy pages. Razorpay asks for Contact, Terms, Privacy,
 * Refund and Delivery pages before it activates payments.
 * The text in these pages is a starting draft: have it checked for your business.
 */
export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh bg-cream flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-20 pt-6">
        <h1 className="font-display text-4xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-ink-soft">Last updated {updated}</p>
        <div className="mt-8 grid gap-5 rounded-[2rem] border border-line bg-white p-7 leading-relaxed text-ink/85 [&_h2]:mt-3 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-ink">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
