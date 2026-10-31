import type { Metadata, Viewport } from "next";
import { Caveat, Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { site } from "@/config/site";
import "./globals.css";

const display = Fraunces({ variable: "--nf-display", subsets: ["latin"], axes: ["SOFT", "opsz"] });
const body = Plus_Jakarta_Sans({ variable: "--nf-body", subsets: ["latin"] });
const hand = Caveat({ variable: "--nf-hand", subsets: ["latin"], weight: ["500", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: `${site.name}: ${site.tagline}`, template: `%s · ${site.name}` },
  description: site.description,
};

export const viewport: Viewport = {
  themeColor: "#fff8f0",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${hand.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
