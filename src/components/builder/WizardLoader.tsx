"use client";

import dynamic from "next/dynamic";

// The wizard keeps the draft in localStorage, so it renders in the browser only.
const Wizard = dynamic(() => import("./Wizard"), {
  ssr: false,
  loading: () => (
    <div>
      <div className="border-b border-line">
        <div className="mx-auto max-w-6xl px-5 pb-5 pt-6">
          <div className="h-11 w-48 animate-pulse rounded-2xl bg-ink/5" />
          <div className="mt-5 h-1.5 w-full animate-pulse rounded-full bg-ink/10" />
        </div>
      </div>
      <div className="mx-auto grid max-w-6xl gap-10 px-5 pt-10 lg:grid-cols-[minmax(0,1fr)_372px]">
        <div className="h-[420px] animate-pulse rounded-[28px] bg-white" />
        <div className="hidden h-[716px] animate-pulse rounded-[2.4rem] bg-ink/10 lg:block" />
      </div>
    </div>
  ),
});

export function WizardLoader({ templateId }: { templateId: string }) {
  return <Wizard templateId={templateId} />;
}
