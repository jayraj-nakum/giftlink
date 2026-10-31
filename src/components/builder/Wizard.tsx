"use client";

import { ArrowLeft, ArrowRight, Eye, Lock, Play, RotateCcw, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { PhoneFrame } from "@/components/site/PhoneFrame";
import { TemplateIcon } from "@/components/site/icons";
import { pricing, site } from "@/config/site";
import { ExperienceHost } from "@/templates/ExperienceHost";
import { getTemplate } from "@/templates/registry";
import { isStockKey, issuesByField, withStockPhotos, type Field, type Photo, type Step, type TemplateDef } from "@/templates/types";
import { checkout, draftKey, readPending } from "./checkout";
import { FieldView, type Updater } from "./fields";

type Data = Record<string, unknown>;

function loadDraft(template: TemplateDef): Data {
  let data: Data = { ...template.defaults };
  try {
    const saved = JSON.parse(localStorage.getItem(draftKey(template.id)) || "null") as Data | null;
    if (saved && typeof saved === "object") data = { ...data, ...saved };
  } catch {
    // ignore a corrupt draft
  }
  // A name typed on the home page (?to=Meera) fills the first field.
  const to = new URLSearchParams(window.location.search).get("to")?.trim().slice(0, 40);
  if (to && !data.to) data.to = to;
  return data;
}

const isShown = (field: Field, data: Data) => !field.showIf || data[field.showIf.key] === field.showIf.equals;

/** Drops hidden fields and empty optional values before validation / saving. */
function clean(template: TemplateDef, data: Data): Data {
  const out: Data = { ...data };
  for (const step of template.steps) {
    for (const field of step.fields) {
      const v = out[field.key];
      if (!isShown(field, data)) delete out[field.key];
      else if ((field.type === "date" || field.type === "number") && (v === "" || v === null || Number.isNaN(v))) delete out[field.key];
    }
  }
  // No photos of their own? The gift uses the occasion's stock photos.
  return withStockPhotos(template, out);
}

/**
 * What the live preview shows: everything they've filled in so far, and the demo's
 * content for steps they haven't reached yet, so the preview always looks complete.
 */
function previewData(template: TemplateDef, data: Data, step: number): Data {
  const out: Data = { ...(template.demo as Data) };
  const empty = (v: unknown) => v === undefined || v === "" || (Array.isArray(v) && v.length === 0);
  template.steps.forEach((s, i) => {
    for (const f of s.fields) {
      if (i <= step) {
        if (f.key in data) out[f.key] = data[f.key];
        else delete out[f.key];
      } else if (!empty(data[f.key])) {
        out[f.key] = data[f.key];
      }
    }
  });
  out.to = String(data.to || "").trim() || "Their name";
  out.from = String(data.from || "").trim() || "You";
  return out;
}

function stepOf(template: TemplateDef, key: string): number {
  const i = template.steps.findIndex((s) => s.fields.some((f) => f.key === key));
  return i === -1 ? 0 : i;
}

function inAppBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Instagram|FBAN|FBAV|FB_IAB|Snapchat|Line\//i.test(navigator.userAgent);
}

const pad = (n: number) => String(n).padStart(2, "0");

export default function Wizard({ templateId }: { templateId: string }) {
  const template = getTemplate(templateId)!;
  const router = useRouter();
  const [data, setData] = useState<Data>(() => loadDraft(template));
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(0);
  const [previewing, setPreviewing] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [mockAsk, setMockAsk] = useState<{ amount: number; resolve: (ok: boolean) => void } | null>(null);
  const [paidSlug, setPaidSlug] = useState<string | null>(null);
  const [showInAppNotice] = useState(inAppBrowser);

  const steps = template.steps;
  const total = steps.length + 1;
  const isReview = step === steps.length;
  const cleaned = clean(template, data);
  const preview = previewData(template, cleaned, isReview ? steps.length : step);
  const { from: themeFrom, to: themeTo } = template.theme;

  // Keep the draft so a refresh (or a phone call) doesn't lose their work.
  useEffect(() => {
    try {
      localStorage.setItem(draftKey(template.id), JSON.stringify(data));
    } catch {
      // storage full or blocked
    }
  }, [data, template.id]);

  // A payment that finished while the page was closed: offer the link.
  useEffect(() => {
    const pending = readPending(template.id);
    if (!pending) return;
    void fetch(`/api/gifts/${pending.slug}`, { headers: { "x-owner-token": pending.ownerToken } })
      .then((r) => (r.ok ? r.json() : null))
      .then((s: { status?: string } | null) => {
        if (s?.status === "paid") setPaidSlug(pending.slug);
      })
      .catch(() => {});
  }, [template.id]);

  useEffect(() => {
    if (!previewing) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [previewing]);

  const set = (key: string, next: Updater) => {
    setData((d) => ({ ...d, [key]: typeof next === "function" ? (next as (p: unknown) => unknown)(d[key]) : next }));
    setErrors((e) => {
      if (!(key in e)) return e;
      const rest = { ...e };
      delete rest[key];
      return rest;
    });
  };

  const validate = () => {
    const r = template.schema.safeParse(cleaned);
    return r.success ? {} : issuesByField(r.error);
  };

  const goTo = (i: number) => {
    setStep(i);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const next = () => {
    const keys = steps[step].fields.filter((f) => isShown(f, data)).map((f) => f.key);
    const stepErrors = Object.fromEntries(Object.entries(validate()).filter(([k]) => keys.includes(k)));
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length === 0) goTo(step + 1);
  };

  /** Before preview/pay: everything must be valid. Jumps to the first broken step. */
  const ensureValid = () => {
    const all = validate();
    const keys = Object.keys(all);
    if (keys.length === 0) return true;
    setErrors(all);
    goTo(Math.min(...keys.map((k) => stepOf(template, k))));
    return false;
  };

  const pay = async () => {
    if (!ensureValid() || paying) return;
    setPreviewing(false);
    setPaying(true);
    setPayError(null);
    const outcome = await checkout(template.id, cleaned, (amount) => new Promise((resolve) => setMockAsk({ amount, resolve })));
    setMockAsk(null);
    if (outcome.status === "paid") {
      router.push(`/ready/${outcome.slug}`);
      return;
    }
    setPaying(false);
    if (outcome.status === "error") {
      setPayError(outcome.error);
      if (outcome.fields && Object.keys(outcome.fields).length) {
        setErrors(outcome.fields);
        goTo(Math.min(...Object.keys(outcome.fields).map((k) => stepOf(template, k))));
      }
    }
  };

  return (
    <div className="pb-36 lg:pb-16">
      {/* Themed header band */}
      <div className="border-b border-line" style={{ background: `linear-gradient(120deg, ${themeFrom}14, ${themeTo}2e)` }}>
        <div className="mx-auto max-w-6xl px-5 pb-5 pt-6">
          <div className="flex items-center gap-3">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-md"
              style={{ background: `linear-gradient(135deg, ${themeFrom}, ${themeTo})` }}
            >
              <TemplateIcon id={template.id} size={20} />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest text-ink-soft">Personalising</p>
              <p className="truncate font-display text-2xl font-semibold leading-tight">{template.name}</p>
            </div>
            <Link
              href={`/demo/${template.id}`}
              className="ml-auto hidden items-center gap-1.5 rounded-full border border-ink/10 bg-white/70 px-4 py-2 text-sm font-semibold sm:inline-flex"
            >
              <Play size={13} fill="currentColor" /> Watch demo
            </Link>
          </div>
          <Progress total={total} current={step} onJump={(i) => i < step && goTo(i)} />
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-5 pt-6 lg:grid-cols-[minmax(0,1fr)_372px] lg:pt-10">
        <div className="min-w-0">
          {showInAppNotice && (
            <div className="mb-4 rounded-2xl border border-sun/60 bg-sun/15 px-4 py-3 text-sm">
              <strong>Tip:</strong> UPI apps sometimes don&apos;t open from inside Instagram or Facebook. Tap ⋯ and choose{" "}
              <em>Open in browser</em> before you pay.
            </div>
          )}
          {paidSlug && (
            <Link href={`/ready/${paidSlug}`} className="mb-4 block rounded-2xl border border-mint bg-mint/15 px-4 py-3 text-sm font-medium">
              ✅ Your last payment went through. Tap to get your link →
            </Link>
          )}

          <div className="rounded-[28px] border border-line bg-white p-5 shadow-[0_20px_50px_-30px_rgba(36,23,43,0.25)] sm:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.22 }}
              >
                {!isReview ? (
                  <>
                    <StepHeader step={steps[step]} index={step} total={total} />
                    <div className="mt-7 grid gap-6">
                      {steps[step].fields
                        .filter((f) => isShown(f, data))
                        .map((field) => (
                          <FieldView
                            key={field.key}
                            field={field}
                            value={data[field.key]}
                            error={errors[field.key]}
                            onChange={(v) => set(field.key, v)}
                            onUploading={(d) => setUploading((n) => n + d)}
                            names={{ to: String(data.to ?? "").trim(), from: String(data.from ?? "").trim() }}
                            stockPhotos={template.stockPhotos}
                          />
                        ))}
                    </div>
                  </>
                ) : (
                  <Review template={template} data={cleaned} total={total} onEdit={goTo} onPreview={() => ensureValid() && setPreviewing(true)} />
                )}
              </motion.div>
            </AnimatePresence>

            {payError && (
              <p role="alert" className="mt-6 rounded-2xl bg-coral/10 px-4 py-3 text-sm font-medium text-coral-deep">
                {payError}
              </p>
            )}

            {/* Actions: sticky bar on phones, inside the card on desktop */}
            <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur lg:static lg:mt-8 lg:border-0 lg:bg-transparent lg:backdrop-blur-none">
              <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:p-0">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={() => goTo(step - 1)}
                    aria-label="Back"
                    className="flex items-center gap-1.5 rounded-full border border-line bg-white px-5 py-3.5 font-semibold"
                  >
                    <ArrowLeft size={17} /> <span className="hidden sm:inline">Back</span>
                  </button>
                )}
                {!isReview ? (
                  <button
                    type="button"
                    onClick={next}
                    disabled={uploading > 0}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full bg-ink py-3.5 font-semibold text-white transition hover:bg-ink/85 disabled:opacity-40"
                  >
                    {uploading > 0 ? "Uploading photos…" : step === steps.length - 1 ? "Review & preview" : "Continue"}
                    {uploading === 0 && <ArrowRight size={17} />}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={pay}
                    disabled={paying}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full bg-coral py-3.5 font-semibold text-white shadow-lg shadow-coral/30 transition hover:bg-coral-deep disabled:opacity-60"
                  >
                    <Lock size={16} /> {paying ? "Opening payment…" : `Pay ${pricing.displayPrice} & get the link`}
                  </button>
                )}
              </div>
            </div>
          </div>

          <p className="mt-5 flex items-center justify-center gap-2 text-xs text-ink-soft lg:justify-start">
            <ShieldCheck size={14} className="text-mint" /> Your draft saves on this device as you type. Nothing is shared until you pay.
          </p>
        </div>

        {/* Live preview (desktop) */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 [@media(max-height:900px)]:[zoom:0.82]">
            <div className="mb-3 flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-mint" />
                </span>
                Live preview
              </p>
              <button
                type="button"
                onClick={() => setPreviewKey((k) => k + 1)}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-ink-soft hover:bg-white hover:text-ink"
              >
                <RotateCcw size={14} /> Restart
              </button>
            </div>
            <PhoneFrame>
              <div className="relative h-[700px] w-[340px]">
                <ExperienceHost key={previewKey} template={template.id} data={preview} mode="preview" framed />
              </div>
            </PhoneFrame>
            <p className="mt-3 text-center text-sm text-ink-soft">Tap inside to play it. It updates as you type.</p>
          </div>
        </aside>
      </div>

      {/* Phone: open the preview full-screen */}
      {!isReview && !previewing && (
        <button
          type="button"
          onClick={() => setPreviewing(true)}
          className="fixed bottom-24 right-4 z-30 flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold shadow-xl ring-1 ring-line lg:hidden"
        >
          <Eye size={16} className="text-coral" /> Preview
        </button>
      )}

      {previewing && (
        <div className="fixed inset-0 z-50">
          <ExperienceHost template={template.id} data={preview} mode="preview" />
          <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex items-center gap-2 p-3 pr-16 pt-[max(0.75rem,env(safe-area-inset-top))]">
            <button
              type="button"
              onClick={() => setPreviewing(false)}
              className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-ink shadow"
            >
              <ArrowLeft size={15} /> Edit
            </button>
            <span className="rounded-full bg-black/40 px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-white backdrop-blur">
              Preview
            </span>
            {isReview && (
              <button
                type="button"
                onClick={pay}
                className="pointer-events-auto ml-auto rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white shadow"
              >
                Pay {pricing.displayPrice} →
              </button>
            )}
          </div>
        </div>
      )}

      {mockAsk && <MockCheckout amount={mockAsk.amount} onAnswer={mockAsk.resolve} />}
    </div>
  );
}

function Progress({ total, current, onJump }: { total: number; current: number; onJump: (i: number) => void }) {
  return (
    <nav aria-label="Progress" className="mt-5 flex items-center gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onJump(i)}
          aria-current={i === current ? "step" : undefined}
          aria-label={`Step ${i + 1}`}
          className={`h-1.5 flex-1 rounded-full transition-colors ${i <= current ? "bg-coral" : "bg-ink/10"} ${i < current ? "cursor-pointer" : "cursor-default"}`}
        />
      ))}
    </nav>
  );
}

function StepHeader({ step, index, total }: { step: Step; index: number; total: number }) {
  return (
    <header>
      <p className="font-display text-sm font-semibold text-ink-soft">
        <span className="text-3xl text-coral">{pad(index + 1)}</span> / {pad(total)}
      </p>
      <h1 className="mt-2 font-display text-[1.9rem] font-semibold leading-tight">{step.title}</h1>
      {step.subtitle && <p className="mt-2 text-ink-soft">{step.subtitle}</p>}
    </header>
  );
}

function Review({
  template,
  data,
  total,
  onEdit,
  onPreview,
}: {
  template: TemplateDef;
  data: Data;
  total: number;
  onEdit: (step: number) => void;
  onPreview: () => void;
}) {
  return (
    <div>
      <p className="font-display text-sm font-semibold text-ink-soft">
        <span className="text-3xl text-coral">{pad(total)}</span> / {pad(total)}
      </p>
      <h1 className="mt-2 font-display text-[1.9rem] font-semibold leading-tight">Watch it, then send it</h1>
      <p className="mt-2 text-ink-soft">The preview is free and shows exactly what {String(data.to || "they")} will see.</p>

      <button
        type="button"
        onClick={onPreview}
        className="mt-7 flex w-full items-center gap-4 rounded-3xl p-5 text-left text-white shadow-xl transition hover:brightness-110"
        style={{ background: `linear-gradient(135deg, ${template.theme.from}, ${template.theme.to})` }}
      >
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/20">
          <Play size={22} fill="currentColor" />
        </span>
        <span>
          <span className="block text-lg font-semibold">Play the full preview</span>
          <span className="block text-sm text-white/80">With your names, photos and words</span>
        </span>
      </button>

      <ul className="mt-6 divide-y divide-line overflow-hidden rounded-3xl border border-line">
        {template.steps.map((s, i) => (
          <li key={s.title} className="flex items-center gap-3 px-5 py-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream text-xs font-bold text-ink-soft">
              {pad(i + 1)}
            </span>
            <span className="min-w-0 flex-1 text-sm">
              <span className="font-semibold">{s.title}</span>
              <span className="block truncate text-ink-soft">{summarize(s, data) || "—"}</span>
            </span>
            <button type="button" onClick={() => onEdit(i)} className="text-sm font-semibold text-coral">
              Edit
            </button>
          </li>
        ))}
      </ul>

      <ul className="mt-6 grid gap-2.5 text-sm text-ink-soft">
        <li>• One payment of {pricing.displayPrice}: UPI, cards or netbanking, secured by Razorpay.</li>
        <li>• You get one private link to send on WhatsApp, Instagram or anywhere.</li>
        <li>• It stays live for {pricing.lifetimeDays} days, then it and the photos are deleted.</li>
        <li>
          • Need help? <a className="underline" href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>
        </li>
      </ul>
    </div>
  );
}

function summarize(step: Step, data: Data): string {
  return step.fields
    .map((f) => {
      const v = data[f.key];
      if (v === undefined || v === "") return null;
      if (f.type === "photos") {
        const photos = v as Photo[];
        return photos.length && photos.every((p) => isStockKey(p.key)) ? "Our photos" : `${photos.length} photo(s)`;
      }
      if (f.type === "list") return (v as unknown[]).length ? `${(v as unknown[]).length} item(s)` : null;
      if (f.type === "choice") return f.options.find((o) => o.value === v)?.label ?? String(v);
      return String(v);
    })
    .filter(Boolean)
    .join(" · ");
}

function MockCheckout({ amount, onAnswer }: { amount: number; onAnswer: (ok: boolean) => void }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div role="dialog" aria-modal="true" aria-labelledby="mock-title" className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
        <p className="text-xs font-bold uppercase tracking-widest text-coral">Test mode</p>
        <h2 id="mock-title" className="mt-2 font-display text-2xl font-semibold">
          Fake payment of ₹{(amount / 100).toFixed(0)}
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          PAYMENT_MODE is &quot;mock&quot;, so no money moves. Set it to &quot;razorpay&quot; with your keys to take real
          payments.
        </p>
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={() => onAnswer(false)} className="flex-1 rounded-full border border-line py-3 font-semibold">
            Cancel
          </button>
          <button type="button" onClick={() => onAnswer(true)} className="flex-1 rounded-full bg-mint py-3 font-semibold text-ink">
            Pay (test)
          </button>
        </div>
      </div>
    </div>
  );
}
