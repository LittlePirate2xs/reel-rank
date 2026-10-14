import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/primitives/Button";
import { nav } from "@/content/site";

export const metadata: Metadata = {
  title: "Page not found",
  description: "That page does not exist. Here is where to go next.",
};

export default function NotFound() {
  return (
    <section className="relative flex min-h-[80svh] items-center overflow-hidden">
      <div className="shell w-full py-24">
        <p className="u-eyebrow mb-6 text-flare">Error 404</p>

        <h1 className="u-display text-display-1 leading-[0.84]">
          Nothing
          <br />
          <span className="text-flare">cut here.</span>
        </h1>

        <p className="u-measure mt-8 text-lead text-ash">
          The page you asked for is not on the timeline. It may have been moved,
          renamed, or never existed in the first place.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Button href="/" arrow>
            Back to the studio
          </Button>
          <Button href="/work" variant="outline">
            See the work
          </Button>
        </div>

        <nav aria-label="Site" className="mt-16 border-t border-ink-700 pt-8">
          <ul className="flex flex-wrap gap-x-8 gap-y-3">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="font-mono text-micro uppercase tracking-[0.16em] text-ash transition-colors duration-200 ease-swift hoverable:hover:text-paper"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
