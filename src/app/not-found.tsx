import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh bg-cream flex-col items-center justify-center px-6 text-center">
      <div className="text-6xl">🎈</div>
      <h1 className="mt-6 font-display text-4xl font-semibold">Nothing here</h1>
      <p className="mt-3 max-w-sm text-ink-soft">
        This link doesn&apos;t lead to a gift. It may have a typo, or it hasn&apos;t been paid for yet.
      </p>
      <Link href="/" className="mt-8 rounded-full bg-ink px-7 py-4 font-semibold text-white">
        Go home
      </Link>
    </main>
  );
}
