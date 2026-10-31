"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/config/site";
import { ownerKey } from "@/templates/ExperienceHost";
import { getTemplate } from "@/templates/registry";

interface Status {
  status: "draft" | "paid";
  toName: string;
  template: string;
  expired: boolean;
  expiresAt: string | null;
  views: number;
  firstOpenedAt: string | null;
  lastOpenedAt: string | null;
  completedAt: string | null;
  answeredYesAt: string | null;
}

function when(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString(undefined, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

function readToken(slug: string): string | null {
  try {
    return localStorage.getItem(ownerKey(slug));
  } catch {
    return null;
  }
}

/** After payment: the link, share buttons and live "have they opened it?" status. */
export function ReadyView({ slug }: { slug: string }) {
  const [status, setStatus] = useState<Status | null>(null);
  const [noAccess, setNoAccess] = useState(false);
  const [checks, setChecks] = useState(0);
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState(`/g/${slug}`);

  useEffect(() => {
    const id = setTimeout(() => setUrl(`${window.location.origin}/g/${slug}`), 0);
    return () => clearTimeout(id);
  }, [slug]);

  // Poll: quickly while a payment is still confirming, slowly afterwards to catch "opened".
  useEffect(() => {
    const token = readToken(slug);
    const delay = checks === 0 ? 0 : status?.status === "draft" ? 3000 : 20000;
    const id = setTimeout(async () => {
      if (!token) {
        setNoAccess(true);
        return;
      }
      if (document.visibilityState === "hidden" && checks > 0) {
        setChecks((c) => c + 1);
        return;
      }
      try {
        const res = await fetch(`/api/gifts/${slug}`, { headers: { "x-owner-token": token }, cache: "no-store" });
        if (res.status === 404) setNoAccess(true);
        else if (res.ok) setStatus((await res.json()) as Status);
      } catch {
        // offline for a moment: try again on the next tick
      }
      setChecks((c) => c + 1);
    }, delay);
    return () => clearTimeout(id);
  }, [slug, checks, status?.status]);

  const message = `I made something just for you 🎁 Open it with sound on 🔊\n${url}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link", url);
    }
  };
  const share = async () => {
    if (navigator.share) await navigator.share({ text: message }).catch(() => {});
    else void copy();
  };

  if (status?.status === "draft") {
    const slow = checks > 40;
    return (
      <section className="mx-auto max-w-xl px-5 pt-10 text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-ink/10 border-t-coral" />
        <h1 className="mt-6 font-display text-3xl font-semibold">Confirming your payment…</h1>
        <p className="mt-3 text-ink-soft">This usually takes a few seconds. Please keep this page open.</p>
        {slow && (
          <p className="mt-6 rounded-2xl bg-sun/20 px-4 py-3 text-sm">
            Taking longer than usual. If money left your account, don&apos;t pay again: email{" "}
            <a className="underline" href={`mailto:${site.supportEmail}`}>
              {site.supportEmail}
            </a>{" "}
            with your UPI reference and we&apos;ll send your link.
          </p>
        )}
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-xl px-5 pb-20 pt-4">
      <div className="text-center">
        <div className="text-6xl">🎉</div>
        <h1 className="mt-4 font-display text-4xl font-semibold">It&apos;s ready!</h1>
        <p className="mt-2 text-ink-soft">
          {status ? `Here's the link for ${status.toName}.` : "Here's your link."} Send it however you like.
        </p>
      </div>

      <div className="mt-8 rounded-[2rem] border border-line bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 rounded-2xl bg-cream px-4 py-3">
          <span className="flex-1 truncate font-mono text-sm">{url}</span>
          <button type="button" onClick={copy} className="shrink-0 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">
            {copied ? "Copied ✓" : "Copy"}
          </button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(message)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-[#25D366] py-3.5 text-center font-semibold text-white"
          >
            Send on WhatsApp
          </a>
          <button type="button" onClick={share} className="rounded-full border border-line py-3.5 font-semibold">
            Share another way
          </button>
        </div>
        <a href={url} target="_blank" rel="noopener noreferrer" className="mt-4 block text-center text-sm font-medium text-coral">
          Open it yourself (your own visits aren&apos;t counted) ↗
        </a>
      </div>

      {status && (
        <div className="mt-6 rounded-[2rem] border border-line bg-white p-6">
          <h2 className="font-semibold">Has {status.toName} opened it?</h2>
          <ul className="mt-4 grid gap-3 text-sm">
            <li className="flex items-center gap-3">
              <span className="text-xl">{status.views > 0 ? "👀" : "⏳"}</span>
              {status.views > 0
                ? `Opened ${status.views} time${status.views === 1 ? "" : "s"}. First on ${when(status.firstOpenedAt)}`
                : "Not opened yet. This page updates by itself."}
            </li>
            {status.completedAt && (
              <li className="flex items-center gap-3">
                <span className="text-xl">✅</span>Watched it to the end on {when(status.completedAt)}
              </li>
            )}
            {status.answeredYesAt && (
              <li className="flex items-center gap-3 font-semibold text-coral">
                <span className="text-xl">💌</span>
                {getTemplate(status.template)?.yesLabel ?? "They said yes!"} ({when(status.answeredYesAt)})
              </li>
            )}
            {status.expiresAt && (
              <li className="flex items-center gap-3 text-ink-soft">
                <span className="text-xl">🗓️</span>Live until {when(status.expiresAt)}
              </li>
            )}
          </ul>
        </div>
      )}

      {noAccess && (
        <p className="mt-6 rounded-2xl bg-sun/20 px-4 py-3 text-sm">
          To see when they open it, view this page on the phone or browser you used to make the gift.
        </p>
      )}

      <p className="mt-8 text-center text-sm text-ink-soft">
        Bookmark this page to check back later. <Link href="/" className="font-semibold text-ink underline">Make another</Link>
      </p>
    </section>
  );
}
