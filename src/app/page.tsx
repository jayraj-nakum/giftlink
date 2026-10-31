import { BellRing, Eye, IndianRupee, Lock, MoonStar, Smartphone } from "lucide-react";
import { GiftPicker, type GiftCard } from "@/components/home/GiftPicker";
import { HowItWorks } from "@/components/home/HowItWorks";
import { SiteFooter, SiteHeader } from "@/components/site/SiteHeader";
import { pricing, site } from "@/config/site";
import { templates } from "@/templates/registry";

const all = Object.values(templates);
const cards: GiftCard[] = all.map((t) => ({
  id: t.id,
  name: t.name,
  tagline: t.tagline,
  badge: t.badge,
  categories: t.categories,
  theme: t.theme,
  demo: t.demo as GiftCard["demo"],
}));

const features = [
  { icon: Eye, title: "Free, full preview", body: "Play the whole gift with your own photos before paying a rupee." },
  { icon: MoonStar, title: "Opens at midnight", body: "Birthday gifts can wait behind a countdown until 12:00 am on the day." },
  { icon: BellRing, title: "Know when they open it", body: "Your link page shows when it was opened, and when they say yes." },
  { icon: Lock, title: "Private by default", body: `Secret links, hidden from search, deleted after ${pricing.lifetimeDays} days.` },
  { icon: Smartphone, title: "Made for phones", body: "Taps, swipes, music and confetti, in any phone browser." },
  { icon: IndianRupee, title: "One simple price", body: `${pricing.displayPrice} per gift. UPI, cards or netbanking via Razorpay.` },
];

const faqs = [
  { q: "Can I see it before I pay?", a: "Yes. Every gift has a free preview with your names and photos, exactly as they will see it. You pay only when you're happy." },
  { q: "How do I pay?", a: `${pricing.displayPrice} once, through Razorpay: UPI (GPay, PhonePe, Paytm), debit/credit cards or netbanking.` },
  { q: "How do I send it?", a: "After payment you get one link. Tap “Send on WhatsApp”, or copy it and share it anywhere." },
  { q: "How long does the link work?", a: `${pricing.lifetimeDays} days from payment. After that, the page and its photos are deleted for good.` },
  { q: "Who can see our photos?", a: "Only people with the link. Links are long random codes, never listed anywhere, and hidden from search engines." },
  { q: "Can a birthday gift open exactly at midnight?", a: "Yes. Add their birthday date and, if they open it early, a countdown holds the surprise until 12:00 am." },
  { q: "Money left my account but I didn't get a link", a: `Don't pay again. Open the gift page on the same phone and we'll show your link, or email ${site.supportEmail} with your UPI reference.` },
];

export default function Home() {
  return (
    <div className="bg-cream">
      <SiteHeader />

      <GiftPicker cards={cards} />

      {/* How it works */}
      <section id="how" className="scroll-mt-16 py-20">
        <div className="mx-auto max-w-page px-5 lg:px-10">
          <HowItWorks cards={cards} />
          <div className="mt-20 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="flex gap-4 rounded-[24px] bg-cream-2/70 p-6">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-ink shadow-sm">
                  <f.icon size={19} />
                </span>
                <div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-16 border-t border-line bg-white py-20">
        <div className="mx-auto grid max-w-page gap-10 px-5 lg:px-10 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-coral">FAQ</p>
            <h2 className="mt-2 font-display text-4xl font-semibold">Questions, answered</h2>
            <p className="mt-4 text-ink-soft">
              Still stuck? Write to{" "}
              <a href={`mailto:${site.supportEmail}`} className="font-semibold text-ink underline underline-offset-4">
                {site.supportEmail}
              </a>
              . We reply fast.
            </p>
          </div>
          <div className="divide-y divide-line rounded-[28px] border border-line">
            {faqs.map((f) => (
              <details key={f.q} className="group px-6 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                  {f.q}
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cream text-lg text-ink-soft transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 leading-relaxed text-ink-soft">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto max-w-page px-5 py-20 lg:px-10">
        <div className="relative overflow-hidden rounded-[36px] bg-plum px-8 py-16 text-center text-white">
          <div className="stars" />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full opacity-50 blur-3xl"
            style={{ background: "#ff5a4e" }}
          />
          <h2 className="relative font-display text-4xl font-semibold md:text-5xl">Someone&apos;s day is about to get better.</h2>
          <p className="relative mx-auto mt-4 max-w-md text-white/75">Five minutes from now, they could be opening it.</p>
          <a href="#gifts" className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-sun px-8 py-4 font-semibold text-ink">
            Make their gift
          </a>
        </div>
      </section>

      <SiteFooter />
      {/* Room for the mobile sticky CTA */}
      <div aria-hidden className="h-20 bg-white md:hidden" />
    </div>
  );
}
