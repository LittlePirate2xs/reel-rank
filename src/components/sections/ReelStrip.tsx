"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";

import { Button } from "@/components/primitives/Button";
import { MediaFrame } from "@/components/primitives/MediaFrame";
import { SectionHeading } from "@/components/primitives/SectionHeading";
import { ScrubBar } from "@/components/primitives/ScrubBar";
import { FilmPlayer } from "@/components/work/FilmPlayer";
import { nav } from "@/content/site";
import { allFilms } from "@/content/work";
import { cn, timecode } from "@/lib/cn";
import { useIsPointerFine, usePrefersReducedMotion } from "@/lib/hooks";
import { APPLE_SPRINGS, projectMomentum, rubberband } from "@/lib/motion";

/* ============================================================================
   ReelStrip — every film in the studio, in the open.

   Fine pointer, no reduced motion: the section is 300vh tall with a pinned
   100svh viewport, and vertical scroll drives the horizontal translation of the
   card track. Everywhere else — reduced motion, touch, coarse pointers — the
   section collapses to auto height and becomes a normal scrollable rail with
   real end gutters.
   ========================================================================= */

type ReelFilm = (typeof allFilms)[number];

/**
 * The outer container is 300vh tall and the pinned viewport is 100svh, so the
 * pin lasts for two thirds of the progress measured by
 * `offset: ["start start", "end start"]`. Mapping the track across exactly that
 * span is what makes the rail finish as the pin releases, rather than coasting
 * away off-screen. Keep in step with the `h-[300vh]` class below.
 */
const PINNED_TRAVEL = (300 - 100) / 300;

/** One card, sized in the same units the track is measured in. */
const CARD_CLASS = "rail-item w-[72vw] shrink-0 sm:w-[52vw] lg:w-[34vw]";

const CARD_SIZES = "(min-width: 1024px) 34vw, (min-width: 640px) 52vw, 72vw";

const workNav = nav.find((item) => item.href === "/work");

type ReelCardProps = {
  film: ReelFilm;
  index: number;
  onOpen: (index: number) => void;
};

function ReelCard({ film, index, onOpen }: ReelCardProps) {
  return (
    <li className={CARD_CLASS}>
      {/*
        The whole card is the target, but `<button>` only accepts phrasing
        content and <MediaFrame /> renders a block surface — so the control is a
        stretched overlay instead, and the card's own lift and press scale ride
        on :hover / :active, which reach the ancestor while the button is
        activated. The overlay carries the accessible name.
      */}
      <div
        className={cn(
          "group relative",
          "transition-transform duration-300 ease-swift",
          "active:scale-[0.98] hoverable:hover:-translate-y-1",
        )}
      >
        <MediaFrame
          asset={film.media}
          ratio="16 / 9"
          sizes={CARD_SIZES}
          className="rounded-md"
        />

        <div className="mt-4 flex items-baseline justify-between gap-4">
          <span className="u-eyebrow">{film.label}</span>
          {/* `ash`, not `ash-dim`: only `ash` clears 4.5:1 on ink-950. */}
          <span className="font-mono text-micro tabular-nums text-ash">
            {timecode(film.duration)}
          </span>
        </div>

        {/* 20px at weight 800 is large text, so vermilion is legible here. */}
        <p className="mt-2 font-display text-xl leading-snug font-extrabold text-paper transition-colors duration-200 ease-swift hoverable:group-hover:text-flare">
          {film.workTitle}
        </p>

        <button
          type="button"
          data-cursor="hover"
          onClick={() => onOpen(index)}
          aria-label={`${film.label}, ${film.workTitle}`}
          className="absolute inset-0 rounded-md"
        />
      </div>
    </li>
  );
}

export function ReelStrip() {
  const reduced = usePrefersReducedMotion();
  const pointerFine = useIsPointerFine();
  /** The pinned, scrubbed rail is the enhancement — never the baseline. */
  const scrubbed = !reduced && pointerFine;

  const sectionRef = useRef<HTMLElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLUListElement | null>(null);
  const [distance, setDistance] = useState(0);

  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const x = useTransform(scrollYProgress, [0, PINNED_TRAVEL], [0, -distance]);
  /* The same span, so the progress rule and the rail always agree. */
  const railProgress = useTransform(
    scrollYProgress,
    [0, PINNED_TRAVEL],
    [0, 1],
  );

  const [scrubPercent, setScrubPercent] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);

  useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      const p = Math.min(Math.max(latest / PINNED_TRAVEL, 0), 1) * 100;
      setScrubPercent(p);
    });
  }, [scrollYProgress]);

  const handleScrub = useCallback(
    (val: number) => {
      setScrubPercent(val);
      setDragOffset(-(val / 100) * distance);
    },
    [distance],
  );

  const handleScrubEnd = useCallback(
    (val: number, velocity: number) => {
      // Exponential momentum velocity projection
      const projected = projectMomentum(val, velocity / 10);
      const clamped = Math.max(0, Math.min(100, projected));
      setScrubPercent(clamped);
      setDragOffset(-(clamped / 100) * distance);
    },
    [distance],
  );

  /* How far the track travels: its own width, less the pinned viewport. */
  useEffect(() => {
    if (!scrubbed) {
      setDistance(0);
      return;
    }

    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!track || !viewport) return;

    const measure = () => {
      setDistance(Math.max(0, track.offsetWidth - viewport.clientWidth));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [scrubbed]);

  const openFilm = useCallback((next: number) => {
    setIndex(next);
    setOpen(true);
  }, []);

  const cards = allFilms.map((film, i) => (
    <ReelCard key={film.id} film={film} index={i} onOpen={openFilm} />
  ));

  return (
    <section
      ref={sectionRef}
      id="work"
      className={cn("relative", scrubbed && "h-[300vh]")}
    >
      <div
        ref={viewportRef}
        className={cn(
          "flex flex-col",
          scrubbed
            ? "sticky top-0 h-svh justify-between overflow-hidden pt-24 pb-8 sm:pt-28 sm:pb-10"
            : "section-y",
        )}
      >
        <div className="shell">
          <SectionHeading
            eyebrow="The work"
            title={workNav?.hint}
            action={
              <Button href="/work" variant="outline" arrow>
                {workNav?.label}
              </Button>
            }
          />
        </div>

        {scrubbed ? (
          <motion.ul
            ref={trackRef}
            drag="x"
            dragConstraints={{ left: -distance, right: 0 }}
            dragElastic={0.12}
            onDragEnd={(_e, info) => {
              // Apply momentum carry on release with velocity projection
              const projected = projectMomentum(info.velocity.x);
              setDragOffset((prev) => {
                const target = prev + projected;
                return Math.max(-distance, Math.min(0, target));
              });
            }}
            style={{ x }}
            className="flex w-max cursor-grab active:cursor-grabbing gap-4 pl-[var(--shell-pad)] pr-[var(--shell-pad)] will-change-transform sm:gap-6"
          >
            {cards}
          </motion.ul>
        ) : (
          <div role="region" aria-label={workNav?.hint} className="mt-12">
            {/* `.rail` supplies the matching end gutters and x-snap. */}
            <ul className="rail">{cards}</ul>
          </div>
        )}

        {scrubbed ? (
          <div className="shell flex items-center justify-between gap-6">
            {/* Direct manipulation ScrubBar with momentum handoff */}
            <div className="w-full max-w-[22rem]">
              <ScrubBar
                value={scrubPercent}
                min={0}
                max={100}
                step={0.5}
                onChange={handleScrub}
                onChangeEnd={handleScrubEnd}
                ariaLabel="Timeline scrub through featured films"
              />
            </div>
            <span className="font-mono text-micro uppercase tracking-wider text-ash tabular-nums">
              {Math.round(scrubPercent)}%
            </span>
          </div>
        ) : null}
      </div>

      <FilmPlayer
        films={allFilms}
        index={index}
        open={open}
        onClose={() => setOpen(false)}
        onIndexChange={setIndex}
      />
    </section>
  );
}
