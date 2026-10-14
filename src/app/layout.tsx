import type { Metadata, Viewport } from "next";
import { Archivo, Instrument_Sans, Azeret_Mono } from "next/font/google";
import "./globals.css";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/primitives/SmoothScroll";
import { ScrollProgress } from "@/components/primitives/ScrollProgress";
import { Cursor } from "@/components/primitives/Cursor";
import { GrainOverlay } from "@/components/primitives/GrainOverlay";

import { site } from "@/content/site";
import { baseUrl, unifiedGraphJsonLd } from "@/lib/seo";

/* ---------------------------------------------------------------------------
   Type system.
   Archivo carries the `wdth` axis, which is what lets headlines sit expanded
   and heavy. Instrument Sans does the reading. Azeret Mono carries timecodes,
   reel numbers and prices — real information for a video studio.
   ------------------------------------------------------------------------ */

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
  fallback: ["Arial Black", "Helvetica Neue", "sans-serif"],
});

const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

const azeret = Azeret_Mono({
  subsets: ["latin"],
  variable: "--font-azeret",
  display: "swap",
  fallback: ["ui-monospace", "monospace"],
});

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.foundedBy }],
  creator: site.foundedBy,
  keywords: [
    "motion graphics Houston",
    "video ads Houston",
    "selling campaigns",
    "SEO GEO AEO",
    "answer engine optimization",
    "generative engine optimization",
    "Houston creative studio",
  ],
  formatDetection: { telephone: false, address: false, email: false },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#050814",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  // Never block zoom — an accessibility requirement.
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${instrument.variable} ${azeret.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-ink-950 text-paper antialiased">
        {/*
          Marks the document as JavaScript-capable before the first paint, so
          the entrance styles in globals.css know they are allowed to hide
          content and animate it in. Synchronous and inlined on purpose: if
          this never runs, the page simply renders fully visible and static
          rather than invisible. See the "Entrance primitives" block in
          globals.css.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.setAttribute("data-js","on")`,
          }}
        />

        <script
          type="application/ld+json"
          // Structured data is generated from typed content, not user input.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(unifiedGraphJsonLd()),
          }}
        />

        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-sm focus:bg-flare focus:px-4 focus:py-2 focus:font-mono focus:text-micro focus:uppercase focus:tracking-widest focus:text-ink-950"
        >
          Skip to content
        </a>

        <SmoothScroll>
          <ScrollProgress />
          <Header />
          <main id="main" className="relative">
            {children}
          </main>
          <Footer />
          <Cursor />
          <GrainOverlay />
        </SmoothScroll>
      </body>
    </html>
  );
}
