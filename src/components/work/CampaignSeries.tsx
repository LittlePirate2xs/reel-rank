"use client";

import { useCallback, useMemo, useState } from "react";

import { FilmPlayer } from "@/components/work/FilmPlayer";
import { MediaFrame } from "@/components/primitives/MediaFrame";
import { Tag } from "@/components/primitives/Tag";
import { Reveal } from "@/components/primitives/Reveal";
import { cn, pad, timecode } from "@/lib/cn";
import { workKinds } from "@/content/work";
import type { Film, WorkItem } from "@/types";

/* ============================================================================
   CampaignSeries — the campaign detail composition.

   Order of reading: the claim (title, hook), then the facts (kind, year,
   credit), then the work (films, stills), then what was done (services).

   The founder-owned credit is rendered here at full size rather than tucked
   into a metadata list. That is the honest reading of this work: RamanRasa is
   the founder's own brand and the creative is AI-assisted. It is presented as
   what it is, which is also why it needs no disclaimer language.

   Media only ever renders through MediaFrame, so an unwired film or still
   reads as a designed slate rather than a broken image.
   ========================================================================= */

export type CampaignSeriesProps = {
  item: WorkItem;
};

/** The same label the filter tabs use, so one kind never reads two ways. */
function kindLabel(kind: WorkItem["kind"]): string {
  const match = workKinds.find((entry) => entry.id === kind);
  return match ? match.label : kind;
}

function labelOf(film: Film): string {
  return film.label.length > 0 ? film.label : film.id;
}

export function CampaignSeries({ item }: CampaignSeriesProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  /* `workTitle` is what the shared player shows above the film label. */
  const films = useMemo(
    () => item.films.map((film) => ({ ...film, workTitle: item.title })),
    [item.films, item.title],
  );

  const hasFilms = films.length > 0;

  const selectFilm = useCallback((next: number) => {
    setActive(next);
    setOpen(true);
  }, []);

  const closePlayer = useCallback(() => {
    setOpen(false);
  }, []);

  const totalRuntime = useMemo(() => {
    const known = item.films
      .map((film) => film.duration)
      .filter((duration): duration is number => duration !== null);
    if (known.length === 0) return null;
    return known.reduce((sum, duration) => sum + duration, 0);
  }, [item.films]);

  return (
    <div className="flex flex-col gap-16">
      {/* --- Statement ------------------------------------------------------ */}
      <header className="flex flex-col gap-6">
        {/* `ash` at 14px: metadata below that size does not clear 4.5:1. */}
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2 font-mono text-sm tabular-nums text-ash">
          <span>{kindLabel(item.kind)}</span>
          <span aria-hidden className="text-ash-dim">
            ·
          </span>
          <span>{item.year}</span>
          <span aria-hidden className="text-ash-dim">
            ·
          </span>
          <span>{item.client}</span>
          {totalRuntime === null ? null : (
            <>
              <span aria-hidden className="text-ash-dim">
                ·
              </span>
              {/* A timecode, not a claim. */}
              <span>{timecode(totalRuntime)}</span>
            </>
          )}
        </div>

        <h2 className="text-display-3 font-display">{item.title}</h2>

        <p className="u-measure text-lead text-paper">{item.hook}</p>

        <p className="u-measure text-base text-ash">{item.summary}</p>

        {/* Provenance, at the size it deserves. */}
        <p className="flex items-start gap-3 border-t border-[color:var(--line)] pt-6">
          <span
            aria-hidden
            className="mt-[0.45em] block size-1.5 shrink-0 rounded-pill bg-flare"
          />
          <span className="text-sm text-ash">{item.credit}</span>
        </p>
      </header>

      {/* --- Films ---------------------------------------------------------- */}
      {hasFilms ? (
        <section aria-label={`${item.title} films`} className="flex flex-col gap-6">
          {/* A count, not an invented heading. */}
          <h3 className="font-mono text-micro uppercase tracking-[0.16em] tabular-nums text-ash">
            {pad(item.films.length)} {item.films.length === 1 ? "film" : "films"}
          </h3>

          <ul className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {item.films.map((film, index) => {
              const current = index === active && open;
              return (
                <li key={film.id} className="min-w-0">
                  <Reveal delay={index * 40}>
                    <button
                      type="button"
                      onClick={() => selectFilm(index)}
                      aria-label={`Play ${labelOf(film)}${film.duration === null ? "" : `, ${timecode(film.duration)}`}`}
                      data-cursor="hover"
                      className={cn(
                        "block w-full overflow-hidden rounded-sm bg-ink-900 p-0 text-left",
                        /* Named properties, and the press scale is written here
                           rather than layered with `.u-press`, so no two rules
                           contest the same transform. */
                        "transition-[transform,border-color] duration-[120ms] ease-swift",
                        "active:scale-[0.97]",
                        "hoverable:hover:-translate-y-1 hoverable:hover:[border-color:var(--color-flare)]",
                        current
                          ? "[border:1px_solid_var(--color-flare)]"
                          : "[border:1px_solid_var(--line)]",
                      )}
                    >
                      <MediaFrame asset={film.media} sizes="(min-width: 1024px) 30vw, 90vw" />
                      <span className="flex items-baseline justify-between gap-4 p-4">
                        <span className="font-mono text-micro uppercase tracking-[0.12em] text-paper">
                          <span aria-hidden className="text-ash-dim">
                            {pad(index + 1)}
                            {"  "}
                          </span>
                          {labelOf(film)}
                        </span>
                        <span className="shrink-0 font-mono text-micro tabular-nums text-ash">
                          {timecode(film.duration)}
                        </span>
                      </span>
                    </button>
                  </Reveal>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {/* --- Stills --------------------------------------------------------- */}
      {item.gallery.length > 0 ? (
        <section aria-label={`${item.title} stills`} className="flex flex-col gap-6">
          <h3 className="font-mono text-micro uppercase tracking-[0.16em] tabular-nums text-ash">
            {pad(item.gallery.length)}{" "}
            {item.gallery.length === 1 ? "still" : "stills"}
          </h3>

          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {item.gallery.map((still, index) => (
              <li key={still.id} className="min-w-0">
                <Reveal delay={index * 40}>
                  <MediaFrame asset={still} sizes="(min-width: 1024px) 45vw, 90vw" />
                </Reveal>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* --- What it involved ----------------------------------------------- */}
      {item.services.length > 0 ? (
        <section aria-label={`${item.title} services`} className="flex flex-col gap-5">
          <h3 className="font-mono text-micro uppercase tracking-[0.16em] tabular-nums text-ash">
            {pad(item.services.length)} {item.services.length === 1 ? "service" : "services"}
          </h3>
          <ul className="flex flex-wrap gap-2">
            {item.services.map((service) => (
              <li key={service}>
                <Tag tone="outline">{service}</Tag>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* --- Player --------------------------------------------------------- */}
      {hasFilms ? (
        <FilmPlayer
          films={films}
          index={active}
          open={open}
          onClose={closePlayer}
          onIndexChange={setActive}
        />
      ) : null}
    </div>
  );
}
