"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";

import { MakeANoiseModal } from "@/components/noises/MakeANoiseModal";
import { Button } from "@/components/primitives/Button";
import { Marquee } from "@/components/primitives/Marquee";
import { Reveal } from "@/components/primitives/Reveal";
import { SplitText } from "@/components/primitives/SplitText";
import { footerNav, marquee, nav, site } from "@/content/site";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { EASE, stagger } from "@/lib/motion";

/* ============================================================================
   Hero — the signature moment.

   Motion here is scroll-linked only (Motion + rAF). Everything predetermined is
   handed to <SplitText /> and <Reveal />, which run as CSS transitions off the
   main thread. Film grain is the global overlay; this section adds none.
   ========================================================================= */

/**
 * The word the accent lands on. Both spellings are offered so the match works
 * whether SplitText compares raw tokens or strips punctuation first.
 */
const ACCENT_WORDS = ["noise", "noise."];

export function Hero() {
  const [modalOpen, setModalOpen] = useState(false);
  const heroRef = useRef<HTMLElement | null>(null);
  const reduced = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  /* The settle: the headline recedes and its tracking opens as the fold lifts.
     Deliberately tiny ranges — this is a settle, not an animation. */
  const settleScale = useTransform(scrollYProgress, [0, 1], [1, 0.96]);
  const settleTracking = useTransform(
    scrollYProgress,
    [0, 0.6, 1],
    ["-0.035em", "0em", "0em"],
  );
  const settleOpacity = useTransform(scrollYProgress, [0, 0.9], [1, 0.58]);

  /* CTA copy is navigation copy, so it comes from the nav content. */
  const briefCta = footerNav.find((item) => item.href === "/contact");
  const workCta = nav.find((item) => item.href === "/work");

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-svh flex-col overflow-x-clip"
    >
      <div className="shell flex flex-1 flex-col pt-24 pb-8 sm:pt-28 sm:pb-10 lg:pt-32">
        {/* Location and size — plain mono, never a badge. */}
        <Reveal as="p" className="u-eyebrow" y={8}>
          {site.location.label} · {site.size}
        </Reveal>

        {/*
          The one oversized headline on the site. It is capped by the fluid
          clamp in `text-display-1` and the supporting block below it, so at
          360x640 the two CTAs still sit inside the first 80svh.
        */}
        <motion.h1
          /* SplitText hides its word spans from assistive tech, so the heading
             carries the sentence itself as its accessible name. */
          aria-label={site.headline}
          className="u-display mt-6 origin-left text-display-1 text-paper sm:mt-8"
          style={
            reduced
              ? undefined
              : {
                  scale: settleScale,
                  letterSpacing: settleTracking,
                  opacity: settleOpacity,
                }
          }
        >
          <SplitText
            text={site.headline}
            delay={stagger(1)}
            immediate
            accentWords={ACCENT_WORDS}
          />
        </motion.h1>

        {/* Responsive 12-column grid beneath motion.h1 */}
        <div className="mt-8 grid gap-10 lg:mt-12 lg:grid-cols-12 lg:items-end lg:gap-12">
          {/* Left 7 columns: Retain existing tagline, promise, and primary CTA buttons */}
          <div className="flex flex-col lg:col-span-7">
            <Reveal
              className="flex max-w-[46ch] flex-col gap-3"
              delay={stagger(3)}
            >
              <p className="text-lead text-paper">{site.tagline}</p>
              <p className="flex items-start gap-3 text-base text-ash">
                <span aria-hidden className="mt-3 h-px w-5 shrink-0 bg-flare" />
                <span>{site.promise}</span>
              </p>
            </Reveal>

            <Reveal
              className="mt-7 flex flex-wrap items-center gap-3 sm:mt-10 sm:gap-4"
              delay={stagger(4)}
            >
              <Button href="/contact" size="lg" arrow>
                {briefCta?.label}
              </Button>
              <Button href="/work" size="lg" variant="outline">
                {workCta?.label}
              </Button>
            </Reveal>
          </div>

          {/* Right 5 columns: Make a Noise callout card */}
          <Reveal
            className="w-full max-w-md lg:col-span-5 lg:ml-auto"
            delay={stagger(4)}
          >
            <div className="rounded-md border border-[color:var(--line)] bg-ink-900/60 p-5 backdrop-blur-xs transition-colors duration-200 hoverable:hover:border-ink-600 sm:p-6">
              <div className="flex items-center gap-2">
                <span aria-hidden className="size-1.5 rounded-full bg-flare animate-pulse" />
                <p className="u-eyebrow text-ash">Noise Lab · Community</p>
              </div>
              <h2 className="font-display mt-2 text-xl font-bold text-paper sm:text-2xl">
                Want to make a noise?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ash">
                Want to make a noise? Leave your email and idea in 300 words — we will deliver it and feature it in the gallery.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <Button
                  variant="solid"
                  size="md"
                  arrow
                  className="u-press"
                  onClick={() => setModalOpen(true)}
                >
                  Make a Noise
                </Button>
                <Link
                  href="/noises"
                  className="u-eyebrow text-ash transition-colors duration-160 ease-swift hoverable:hover:text-flare"
                >
                  Explore gallery →
                </Link>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal className="mt-auto pt-12" delay={stagger(5)}>
          <a
            href="#work"
            className="u-eyebrow inline-flex items-center gap-4 transition-colors duration-200 ease-swift hoverable:hover:text-paper"
          >
            <span>Scroll</span>
            <motion.span
              aria-hidden
              className="block h-px w-16 origin-left bg-ink-500"
              animate={
                reduced
                  ? { scaleX: 1, opacity: 1 }
                  : { scaleX: [0.12, 1, 0.12], opacity: [0.35, 1, 0.35] }
              }
              transition={
                reduced
                  ? { duration: 0 }
                  : { duration: 2.6, ease: EASE.glide, repeat: Infinity }
              }
            />
          </a>
        </Reveal>
      </div>

      {/* What we make, as one pausable band. Stops on hover and off-screen. */}
      <Marquee
        items={[...marquee]}
        speed={52}
        ariaLabel={site.tagline}
        className="border-t border-ink-800 py-4"
        itemClassName="u-eyebrow"
        separator={
          <span aria-hidden className="text-flare">
            ·
          </span>
        }
      />

      {/* "Make a Noise" fluid modal submission dialog */}
      <MakeANoiseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </section>
  );
}
