import Link from "next/link";

import { Button } from "@/components/primitives/Button";
import { Magnetic } from "@/components/primitives/Magnetic";
import { Reveal } from "@/components/primitives/Reveal";
import { SplitText } from "@/components/primitives/SplitText";
import { footerNav, nav, site } from "@/content/site";
import { cn } from "@/lib/cn";

/* ============================================================================
   The close. A distinct surface — ink-900 against the page's ink-950, opened by
   a single hairline — so the page reads as finished rather than merely stopped.
   No glow, no halo, no gradient: the band itself does the work.

   Every visible string comes from `@/content/site`. The two link labels are
   read out of the navigation content rather than invented, and a link is simply
   not rendered if its entry ever leaves `nav` / `footerNav`.
   ========================================================================= */

const briefItem = footerNav.find((item) => item.href === "/contact") ?? null;
const offersItem = nav.find((item) => item.href === "/offers") ?? null;

/** "Make a little noise." — the last word is the punch, so it accents. */
const headlineWords = site.headline.split(" ");
const accentWords =
  headlineWords.length > 1 ? [headlineWords[headlineWords.length - 1]] : [];

/** Shared treatment for the secondary text links in this band. */
const textLink = cn(
  "text-paper underline decoration-ink-600 underline-offset-4",
  "transition-colors duration-200 ease-swift",
  "hoverable:hover:text-flare hoverable:hover:decoration-flare",
);

export function ContactCta() {
  return (
    <section
      aria-labelledby="contact-cta-heading"
      className="section-y border-t border-ink-700 bg-ink-900"
    >
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-16">
          <div className="min-w-0">
            <h2 id="contact-cta-heading" className="text-display-3 text-paper">
              <SplitText text={site.headline} accentWords={accentWords} />
            </h2>

            <p className="u-measure mt-6 text-lead text-paper/80">
              {site.promise}
            </p>
          </div>

          <Reveal className="flex flex-wrap items-center gap-x-8 gap-y-5 lg:justify-end">
            {briefItem ? (
              <Magnetic strength={0.2} max={8} className="inline-flex">
                <Button href={briefItem.href} size="lg" arrow>
                  {briefItem.label}
                </Button>
              </Magnetic>
            ) : null}

            {offersItem ? (
              <Link
                href={offersItem.href}
                className={cn(
                  textLink,
                  "group inline-flex items-center gap-2 text-sm",
                )}
              >
                {offersItem.label}
                <span
                  aria-hidden
                  className="inline-flex transition-transform duration-200 ease-swift motion-safe:hoverable:group-hover:translate-x-1"
                >
                  &rarr;
                </span>
              </Link>
            ) : null}
          </Reveal>
        </div>

        <div className="mt-16 flex flex-wrap items-center gap-x-10 gap-y-3 border-t border-ink-700 pt-8">
          <p className="u-eyebrow">{site.location.label}</p>

          <a
            href={`mailto:${site.email}`}
            className={cn(textLink, "font-mono text-xs")}
          >
            {site.email}
          </a>
        </div>
      </div>
    </section>
  );
}
