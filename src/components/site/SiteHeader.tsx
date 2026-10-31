import { Gift, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { pricing, site } from "@/config/site";
import { templates } from "@/templates/registry";
import { TemplateIcon } from "./icons";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 font-display text-xl font-semibold tracking-tight text-ink">
      <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-gradient-to-br from-coral to-[#ff8a5c] text-white shadow-md shadow-coral/30">
        <Gift size={18} strokeWidth={2.2} />
      </span>
      {site.name}
    </Link>
  );
}

export function SiteHeader({ cta = true, nav = true }: { cta?: boolean; nav?: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-cream/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-page items-center justify-between gap-6 px-5 lg:px-10">
        <Logo />
        {nav && (
          <nav className="hidden items-center gap-8 text-sm font-medium text-ink-soft md:flex">
            <Link href="/#gifts" className="transition hover:text-ink">Gifts</Link>
            <Link href="/#how" className="transition hover:text-ink">How it works</Link>
            <Link href="/#faq" className="transition hover:text-ink">FAQ</Link>
            <Link href="/contact" className="transition hover:text-ink">Help</Link>
          </nav>
        )}
        {cta && (
          <Link
            href="/#gifts"
            className="rounded-full bg-coral px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-coral/25 transition hover:bg-coral-deep"
          >
            Make a gift
          </Link>
        )}
      </div>
    </header>
  );
}

export function SiteFooter() {
  const gifts = Object.values(templates);
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto grid max-w-page gap-10 px-5 lg:px-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-soft">{site.description}</p>
          <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-cream px-3 py-1.5 text-xs font-medium text-ink-soft">
            <ShieldCheck size={14} className="text-mint" /> Payments secured by Razorpay
          </p>
        </div>
        <FooterCol title="Gifts">
          {gifts.map((t) => (
            <Link key={t.id} href={`/create/${t.id}`} className="flex items-center gap-2 hover:text-ink">
              <TemplateIcon id={t.id} size={14} /> {t.name}
            </Link>
          ))}
        </FooterCol>
        <FooterCol title="Help">
          <Link href="/#how" className="hover:text-ink">How it works</Link>
          <Link href="/#faq" className="hover:text-ink">FAQ</Link>
          <Link href="/contact" className="hover:text-ink">Contact us</Link>
          <a href={`mailto:${site.supportEmail}`} className="hover:text-ink">{site.supportEmail}</a>
        </FooterCol>
        <FooterCol title="Policies">
          <Link href="/terms" className="hover:text-ink">Terms</Link>
          <Link href="/privacy" className="hover:text-ink">Privacy</Link>
          <Link href="/refunds" className="hover:text-ink">Refunds</Link>
          <Link href="/delivery" className="hover:text-ink">Delivery</Link>
        </FooterCol>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-page px-5 lg:px-10 py-5 text-xs text-ink-soft">
          © 2026 {site.name}. Every gift {pricing.displayPrice}, live for {pricing.lifetimeDays} days.
        </p>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-widest text-ink">{title}</h3>
      <div className="mt-4 grid gap-2.5 text-sm text-ink-soft">{children}</div>
    </div>
  );
}
