"use client";

import { ArrowRight, Check, Eye, Play, Sparkles } from "lucide-react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { PhoneFrame, ScaledScreen } from "@/components/site/PhoneFrame";
import { TemplateIcon } from "@/components/site/icons";
import { pricing } from "@/config/site";
import { covers } from "@/templates/covers";
import type { TemplateCategory, TemplateTheme } from "@/templates/types";

export interface GiftCard {
  id: string;
  name: string;
  tagline: string;
  badge?: string;
  categories: TemplateCategory[];
  theme: TemplateTheme;
  demo: { to: string; from: string } & Record<string, unknown>;
}

const FILTERS: { id: "all" | TemplateCategory; label: string }[] = [
  { id: "all", label: "All gifts" },
  { id: "love", label: "For your love" },
  { id: "friends", label: "For friends" },
  { id: "family", label: "For family" },
  { id: "festival", label: "Festivals" },
];

function withName(href: string, name: string) {
  return name ? `${href}?to=${encodeURIComponent(name)}` : href;
}

export function Cover({ card, name }: { card: GiftCard; name: string }) {
  const C = covers[card.id];
  const data = { ...card.demo, to: name || card.demo.to };
  if (!C) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ background: `linear-gradient(160deg, ${card.theme.from}, ${card.theme.to})` }}
      >
        <TemplateIcon id={card.id} size={96} className="text-white/80" />
      </div>
    );
  }
  return <C data={data} />;
}

export function GiftPicker({ cards }: { cards: GiftCard[] }) {
  const [name, setName] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [heroIndex, setHeroIndex] = useState(0);
  const trimmed = name.trim();

  useEffect(() => {
    const id = setInterval(() => setHeroIndex((i) => (i + 1) % cards.length), 3800);
    return () => clearInterval(id);
  }, [cards.length]);

  const visible = useMemo(
    () => (filter === "all" ? cards : cards.filter((c) => c.categories.includes(filter))),
    [cards, filter],
  );
  const hero = cards[heroIndex];
  const ctaLabel = trimmed ? `Make ${trimmed}'s gift` : "Choose a gift";

  // Mobile sticky CTA: shown once the hero buttons have scrolled away
  const heroCtaRef = useRef<HTMLDivElement>(null);
  const [showSticky, setShowSticky] = useState(false);
  useEffect(() => {
    const el = heroCtaRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) =>
      setShowSticky(!entry.isIntersecting && entry.boundingClientRect.top < 0),
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  function goToGifts() {
    document.getElementById("gifts")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full opacity-60 blur-3xl"
          style={{ background: "radial-gradient(circle, #ffd9c7 0%, rgba(255,217,199,0) 70%)" }}
        />
        <div className="relative mx-auto grid max-w-page items-center gap-12 px-5 lg:px-10 pb-16 pt-10 lg:grid-cols-[1.15fr_1fr] lg:pb-24 lg:pt-16">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-line bg-white/80 px-3.5 py-1.5 text-sm font-medium text-ink-soft">
              <Sparkles size={15} className="text-coral" /> Personal gift websites · ready in 5 minutes
            </p>
            <h1 className="mt-6 font-display text-[2.9rem] font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-[4.2rem] xl:text-[4.75rem]">
              A gift they open, <span className="block italic text-coral">not just read.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
              Put their name, your photos and your words into a beautiful animated gift. Watch it free, pay{" "}
              {pricing.displayPrice} once, and send it as one link on WhatsApp.
            </p>

            <div className="mt-8 max-w-md rounded-3xl border border-line bg-white p-5 shadow-[0_20px_40px_-24px_rgba(36,23,43,0.25)]">
              <label htmlFor="hero-name" className="text-xs font-bold uppercase tracking-widest text-ink-soft">
                Who&apos;s it for?
              </label>
              <input
                id="hero-name"
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 40))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && trimmed) {
                    e.currentTarget.blur();
                    goToGifts();
                  }
                }}
                placeholder="Type their name"
                autoComplete="off"
                enterKeyHint="go"
                className="mt-1 w-full border-b-2 border-dashed border-line bg-transparent pb-1 font-hand text-4xl text-ink outline-none placeholder:text-ink/25 focus:border-coral"
              />
              <p className="mt-3 text-sm text-ink-soft">
                {trimmed ? `Every gift below now says “${trimmed}”. Take a look ↓` : "Their name appears on every gift. Try it."}
              </p>
            </div>

            <div ref={heroCtaRef} className="mt-7 flex flex-wrap gap-3">
              <a
                href="#gifts"
                className="inline-flex items-center gap-2 rounded-full bg-coral px-7 py-4 font-semibold text-white shadow-lg shadow-coral/30 transition hover:bg-coral-deep"
              >
                {ctaLabel} <ArrowRight size={18} />
              </a>
              <Link
                href={withName(`/demo/${hero.id}`, trimmed)}
                className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-white px-7 py-4 font-semibold transition hover:border-ink/40"
              >
                <Play size={16} fill="currentColor" /> Watch a demo
              </Link>
            </div>
            <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-soft">
              {["Free preview before you pay", "UPI, cards & netbanking", "Private link, no app needed"].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <Check size={16} className="text-mint" strokeWidth={3} /> {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Phone with the live cover */}
          <div className="relative mx-auto">
            <div
              aria-hidden
              className="absolute inset-x-6 bottom-6 top-16 -z-0 rounded-[3rem] opacity-70 blur-2xl transition-colors duration-700"
              style={{ background: `linear-gradient(160deg, ${hero.theme.from}, ${hero.theme.to})` }}
            />
            <Link href={withName(`/demo/${hero.id}`, trimmed)} aria-label={`Play the ${hero.name} demo`} className="relative block rotate-[2deg]">
              <PhoneFrame>
                <ScaledScreen width={290}>
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                      key={hero.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6 }}
                      className="absolute inset-0"
                    >
                      <Cover card={hero} name={trimmed} />
                    </motion.div>
                  </AnimatePresence>
                </ScaledScreen>
              </PhoneFrame>
            </Link>
            <div className="absolute -left-10 top-20 hidden rotate-[-4deg] rounded-2xl border border-line bg-white px-4 py-3 shadow-xl sm:block">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">One payment</p>
              <p className="font-display text-3xl font-semibold text-coral">{pricing.displayPrice}</p>
            </div>
            <div className="absolute -right-6 bottom-24 hidden items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3 shadow-xl sm:flex">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-mint/20 text-mint">
                <Eye size={18} />
              </span>
              <div className="text-sm">
                <p className="font-semibold">{trimmed || hero.demo.to} opened it</p>
                <p className="text-ink-soft">You&apos;ll know the moment they do</p>
              </div>
            </div>
            <div className="mt-6 flex justify-center gap-1.5">
              {cards.map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  aria-label={`Show ${c.name}`}
                  onClick={() => setHeroIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${i === heroIndex ? "w-6 bg-ink" : "w-1.5 bg-ink/20"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Gallery ---------- */}
      <section id="gifts" className="scroll-mt-16 border-y border-line bg-white py-20">
        <div className="mx-auto max-w-page px-5 lg:px-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-coral">{cards.length} gifts, all ready</p>
              <h2 className="mt-2 font-display text-4xl font-semibold md:text-5xl">Pick the occasion</h2>
              <p className="mt-3 max-w-lg text-ink-soft">
                Tap any gift to play the full demo{trimmed ? ` with ${trimmed}'s name` : ""}. Everything you see can be made yours.
              </p>
            </div>
            <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:px-0" role="tablist" aria-label="Filter gifts">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={filter === f.id}
                  onClick={() => setFilter(f.id)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    filter === f.id ? "bg-ink text-white" : "bg-cream text-ink-soft hover:text-ink"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <motion.div layout className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <AnimatePresence initial={false}>
              {visible.map((card) => (
                <motion.article
                  key={card.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="group flex flex-col rounded-[28px] border border-line bg-white p-2.5 transition hover:-translate-y-1 hover:shadow-[0_24px_48px_-24px_rgba(36,23,43,0.35)]"
                >
                  <Link
                    href={withName(`/demo/${card.id}`, trimmed)}
                    aria-label={`Play the ${card.name} demo`}
                    className="relative flex justify-center overflow-hidden rounded-[22px] px-4 pb-0 pt-6"
                    style={{ background: `linear-gradient(165deg, ${card.theme.from}1f, ${card.theme.to}40)` }}
                  >
                    {card.badge && (
                      <span className="absolute left-3 top-3 z-10 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-coral shadow-sm">
                        {card.badge}
                      </span>
                    )}
                    <div className="h-[300px] translate-y-1 transition duration-500 group-hover:-translate-y-1">
                      <PhoneFrame bezel={6}>
                        <ScaledScreen width={168}>
                          <Cover card={card} name={trimmed} />
                        </ScaledScreen>
                      </PhoneFrame>
                    </div>
                    <span className="absolute bottom-4 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-ink opacity-100 shadow-lg transition pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100">
                      <Play size={14} fill="currentColor" /> Play demo
                    </span>
                  </Link>
                  <div className="flex flex-1 flex-col px-2.5 pb-2 pt-4">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="flex items-center gap-2 font-display text-xl font-semibold">
                        <TemplateIcon id={card.id} size={18} className="text-coral" /> {card.name}
                      </h3>
                      <span className="text-sm font-bold">{pricing.displayPrice}</span>
                    </div>
                    <p className="mt-1.5 line-clamp-2 flex-1 text-sm leading-relaxed text-ink-soft">{card.tagline}</p>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Link
                        href={withName(`/demo/${card.id}`, trimmed)}
                        className="rounded-full border border-line py-2.5 text-center text-sm font-semibold transition hover:border-ink/40"
                      >
                        Preview
                      </Link>
                      <Link
                        href={withName(`/create/${card.id}`, trimmed)}
                        className="rounded-full bg-ink py-2.5 text-center text-sm font-semibold text-white transition hover:bg-ink/85"
                      >
                        Personalise
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* ---------- Mobile sticky CTA ---------- */}
      <AnimatePresence>
        {showSticky && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-cream/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md md:hidden"
          >
            <a
              href="#gifts"
              className="flex items-center justify-center gap-2 rounded-full bg-coral px-6 py-3.5 font-semibold text-white shadow-lg shadow-coral/30"
            >
              <span className="truncate">{ctaLabel}</span>
              <span className="shrink-0 opacity-80">· {pricing.displayPrice}</span>
              <ArrowRight size={18} className="shrink-0" />
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
