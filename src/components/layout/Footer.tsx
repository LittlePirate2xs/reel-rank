/* ============================================================================
   Footer — the last word.

   Server component. Nothing here needs to run on the client, so nothing does.
   The wordmark is set at display scale and takes a restrained scale on hover
   (gated behind a fine pointer). A scroll-bound wordmark was tempting; it
   would have cost a client component and bought nothing a visitor asks for.
   ========================================================================= */

import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { Button } from "@/components/primitives/Button";
import { footerNav, site } from "@/content/site";
import { cn } from "@/lib/cn";

/** One line, not the full marketing paragraph. Trimmed at the first sentence stop. */
function oneLine(description: string): string {
  const flat = description.replace(/\s+/g, " ").trim();
  const stop = flat.indexOf(". ");
  if (stop === -1) return flat;
  return flat.slice(0, stop + 1);
}

export function Footer(): React.JSX.Element {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-[var(--section-y)] border-t border-[var(--line)] bg-ink-950">
      <Container className="pt-14 pb-8 sm:pt-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Wordmark ------------------------------------------------------ */}
          <div className="lg:col-span-6">
            <p
              className={cn(
                "u-display origin-left text-display-3 text-paper",
                "transition-[color,transform] duration-[var(--dur-ui)] ease-swift",
                "motion-safe:hoverable:hover:scale-[1.012] hoverable:hover:text-flare",
              )}
            >
              {site.wordmark}
            </p>
            <p className="mt-6 max-w-[46ch] text-[0.9375rem] leading-relaxed text-paper/80">
              {oneLine(site.description)}
            </p>
          </div>

          {/* Studio -------------------------------------------------------- */}
          <div className="lg:col-span-3">
            <h2 className="font-mono text-micro uppercase tracking-widest text-ash">
              Studio
            </h2>
            <address className="mt-4 not-italic text-[0.9375rem] leading-relaxed text-paper/80">
              {site.location.label}
            </address>
            <a
              href={`mailto:${site.email}`}
              className="mt-3 inline-block text-[0.9375rem] text-paper transition-colors duration-[var(--dur-fast)] ease-soft underline decoration-[var(--line-strong)] underline-offset-4 hoverable:hover:decoration-flare"
            >
              {site.email}
            </a>
          </div>

          {/* Navigation ---------------------------------------------------- */}
          <nav aria-label="Footer" className="lg:col-span-3">
            <h2 className="font-mono text-micro uppercase tracking-widest text-ash">
              Pages
            </h2>
            <ul className="mt-4 space-y-2.5">
              {footerNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[0.9375rem] text-paper/80 transition-colors duration-[var(--dur-fast)] ease-soft hoverable:hover:text-paper"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Provenance — stated plainly, not buried. ------------------------ */}
        <p className="mt-16 max-w-[62ch] border-t border-[var(--line)] pt-6 font-mono text-micro uppercase leading-[1.8] text-ash">
          {`The featured work is ${site.founderBrand} — the founder's own brand, run by ${site.foundedBy}. Nothing here is a client we cannot name.`}
        </p>

        <div className="mt-8 flex flex-col gap-4 border-t border-[var(--line)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-micro uppercase text-ash">
            {`© ${year} ${site.name} — ${site.location.label}`}
          </p>
          <a
            href="#main"
            className="self-start font-mono text-micro uppercase text-ash transition-colors duration-[var(--dur-fast)] ease-soft hoverable:hover:text-paper sm:self-auto"
          >
            Back to top
          </a>
        </div>
      </Container>

      <Container className="pt-0 pb-14">
        <Button href="/contact" variant="outline" size="md" arrow>
          Start a brief
        </Button>
      </Container>
    </footer>
  );
}
