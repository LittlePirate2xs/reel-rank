"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react";

import { Dialog } from "@/components/primitives/Dialog";
import { Button } from "@/components/primitives/Button";
import { MediaFrame, PlaceholderFrame } from "@/components/primitives/MediaFrame";
import { ScrubBar } from "@/components/primitives/ScrubBar";
import { cn, pad, timecode } from "@/lib/cn";
import { usePersistentAudio } from "@/lib/audio";
import { APPLE_SPRINGS } from "@/lib/motion";
import type { Film } from "@/types";

/* ============================================================================
   FilmPlayer — the shared queue player.

   Notes that matter:

   - Chrome refuses to autoplay an unmuted video, so the element starts muted
     and the toggle is visible from the first frame. `muted` is also written to
     the DOM node directly: React does not serialise the attribute, and a
     missed attribute is exactly how autoplay silently fails.
   - Transport controls are real <button>s with names. Icons are aria-hidden.
   - Every media render goes through MediaFrame / PlaceholderFrame, so an
     unwired film reads as a finished slate plus the same notice the rest of
     the site already uses ("File not wired yet.").
   - Arrow keys change the queue, Escape belongs to Dialog.
   - The Dialog is mounted from this component, so children may be absent while
     it is closed. The play effect therefore re-arms on `open` and tolerates a
     null ref rather than assuming a node exists.
   ========================================================================= */

export type FilmPlayerProps = {
  films: readonly (Film & { workTitle?: string })[];
  index: number;
  open: boolean;
  onClose: () => void;
  onIndexChange: (next: number) => void;
};

/** Wrap a queue index in both directions. */
function wrap(value: number, length: number): number {
  if (length <= 0) return 0;
  return ((value % length) + length) % length;
}

function labelOf(film: Film & { workTitle?: string }): string {
  return film.label.length > 0 ? film.label : film.id;
}

export function FilmPlayer({
  films,
  index,
  open,
  onClose,
  onIndexChange,
}: FilmPlayerProps) {
  const count = films.length;
  const safeIndex = wrap(index, count);
  const film = count > 0 ? films[safeIndex] : undefined;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { muted, toggleMute, setMuted } = usePersistentAudio();
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(film?.duration ?? 60);

  const step = useCallback(
    (delta: number) => {
      if (count <= 0) return;
      onIndexChange(wrap(safeIndex + delta, count));
    },
    [count, onIndexChange, safeIndex],
  );

  /* --- Timeline & Media Listeners --------------------------------------- */

  useEffect(() => {
    setCurrentTime(0);
    setDuration(film?.duration ?? 60);
  }, [film?.id, film?.duration]);

  useEffect(() => {
    const node = videoRef.current;
    if (!node) return;

    const onTimeUpdate = () => setCurrentTime(node.currentTime);
    const onLoadedMetadata = () => {
      if (node.duration && !Number.isNaN(node.duration)) {
        setDuration(node.duration);
      }
    };

    node.addEventListener("timeupdate", onTimeUpdate);
    node.addEventListener("loadedmetadata", onLoadedMetadata);

    return () => {
      node.removeEventListener("timeupdate", onTimeUpdate);
      node.removeEventListener("loadedmetadata", onLoadedMetadata);
    };
  }, [open, film?.id]);

  /* --- Playback with Autoplay Policy Graceful Handling ----------------- */

  useEffect(() => {
    if (!open) return;
    const node = videoRef.current;
    if (node === null) return;

    node.muted = muted;
    const started = node.play();
    if (started !== undefined) {
      started.catch((_err: unknown) => {
        // If unmuted playback is rejected by browser autoplay policy, fall back to muted
        if (!node.muted) {
          node.muted = true;
          setMuted(true);
          void node.play().catch(() => undefined);
        }
      });
    }

    return () => {
      node.pause();
    };
  }, [open, film?.id, muted, setMuted]);

  const handleToggleMute = useCallback(() => {
    const node = videoRef.current;
    const next = !muted;
    toggleMute();
    if (node !== null) node.muted = next;
  }, [muted, toggleMute]);

  const handleScrub = useCallback((newTime: number) => {
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  }, []);

  const handleScrubEnd = useCallback((newTime: number, _velocity: number) => {
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  }, []);

  /* --- Keyboard Seeking & Queue Navigation ------------------------------ */

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        if (event.shiftKey) {
          step(-1);
        } else {
          // Seek back 5s or step queue if at start
          if (currentTime > 0) {
            handleScrub(Math.max(0, currentTime - 5));
          } else {
            step(-1);
          }
        }
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        if (event.shiftKey) {
          step(1);
        } else {
          // Seek forward 5s or step queue if at end
          if (currentTime < duration - 1) {
            handleScrub(Math.min(duration, currentTime + 5));
          } else {
            step(1);
          }
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [count, currentTime, duration, handleScrub, open, step]);

  /* --- Layout ----------------------------------------------------------- */

  const asset = film?.media;
  const aspect = useMemo(() => {
    if (asset === undefined || asset.width <= 0 || asset.height <= 0) return "16 / 9";
    return `${asset.width} / ${asset.height}`;
  }, [asset]);

  const dialogTitle = film === undefined ? "" : `Film ${labelOf(film)}`;

  return (
    <Dialog
      open={open && film !== undefined}
      onClose={onClose}
      title={dialogTitle}
      hideTitle
      size="max-w-5xl"
      className="p-4 sm:p-6"
    >
      {film === undefined || asset === undefined ? null : (
        <div className="flex flex-col gap-6">
          {/* --- Slate header ------------------------------------------- */}
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <div className="min-w-0">
              <p className="font-mono text-micro uppercase tracking-[0.16em] text-ash">
                {film.workTitle ?? ""}
              </p>
              <h2 className="mt-1 truncate font-display text-display-4">
                {labelOf(film)}
              </h2>
            </div>
            <p className="shrink-0 font-mono text-sm tabular-nums text-paper">
              {timecode(film.duration)}
              <span aria-hidden className="px-2 text-ash-dim">
                /
              </span>
              <span className="text-ash">
                {pad(safeIndex + 1)} of {pad(count)}
              </span>
            </p>
          </div>

          {/* --- Picture ------------------------------------------------ */}
          {/* The frame below is intentionally not animated: a colour change on
              the way in would fight the poster's own first frame. */}
          <div
            className="relative w-full overflow-hidden rounded-sm bg-ink-950"
            style={{ aspectRatio: aspect }}
          >
            {!asset.playable ? (
              /* No video file yet: show the poster still if there is one, so
                 the player is still worth looking at, and only fall back to the
                 slate when there is genuinely nothing to draw. */
              asset.placeholder ? (
                <PlaceholderFrame asset={asset} className="h-full w-full" />
              ) : (
                <MediaFrame asset={asset} className="h-full w-full" fit="contain" />
              )
            ) : (
              <video
                key={film.id}
                ref={videoRef}
                controls
                playsInline
                preload="metadata"
                muted={muted}
                poster={asset.poster.length > 0 ? asset.poster : asset.src}
                aria-label={`${labelOf(film)}${film.workTitle === undefined ? "" : `, ${film.workTitle}`}`}
                className="h-full w-full bg-ink-950 object-contain"
              />
            )}

            {/* Visible from the first frame — autoplay starts muted, so the
                way out of silence has to be on screen. */}
            {!asset.playable ? null : (
              <button
                type="button"
                onClick={handleToggleMute}
                aria-pressed={muted}
                aria-label={muted ? "Unmute film" : "Mute film"}
                className={cn(
                  "absolute right-3 top-3 z-10 inline-flex items-center gap-2 rounded-sm",
                  "bg-ink-950/80 px-3 py-2 font-mono text-micro uppercase tracking-[0.12em] text-paper",
                  "[border:1px_solid_var(--line)]",
                  /* Colour and background only — the press scale lives in
                     `.u-press`, so one rule owns transform. */
                  "u-press transition-[color,background-color] duration-[120ms] ease-swift",
                  "hoverable:hover:bg-ink-800 hoverable:hover:text-flare",
                )}
              >
                {muted ? (
                  <VolumeX aria-hidden className="size-4" />
                ) : (
                  <Volume2 aria-hidden className="size-4" />
                )}
                {muted ? "Muted" : "Sound on"}
              </button>
            )}
          </div>

          {/* --- Direct-Manipulation Timeline ScrubBar ----------------- */}
          <div className="flex flex-col gap-1.5 px-0.5">
            <div className="flex items-center justify-between font-mono text-micro uppercase tracking-wider text-ash tabular-nums">
              <span>{timecode(currentTime)}</span>
              <span>{timecode(duration)}</span>
            </div>
            <ScrubBar
              value={currentTime}
              min={0}
              max={duration > 0 ? duration : 60}
              step={0.1}
              onChange={handleScrub}
              onChangeEnd={handleScrubEnd}
              ariaLabel={`Seek timeline for ${labelOf(film)}`}
            />
          </div>

          {/* --- Unwired notice ----------------------------------------- */}
          {asset.playable ? null : (
            <p className="u-measure-tight text-sm text-ash">
              <span className="text-paper">{labelOf(film)}</span> is queued here
              and its film file is not wired yet.
              {asset.placeholder
                ? " The slate above holds the frame, the queue and the timecode until the file lands."
                : " The still above stands in for the poster frame until the file lands."}
            </p>
          )}

          {/* --- Transport ---------------------------------------------- */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Button
              variant="outline"
              size="md"
              onClick={() => step(-1)}
              aria-label="Previous film in the queue"
              icon={<ChevronLeft aria-hidden className="size-4" />}
            >
              Previous film
            </Button>

            <Button
              variant="ghost"
              size="md"
              onClick={onClose}
              className="font-mono text-micro uppercase tracking-[0.14em]"
            >
              Close player
            </Button>

            <Button
              variant="outline"
              size="md"
              onClick={() => step(1)}
              arrow
              aria-label="Next film in the queue"
            >
              Next film
            </Button>
          </div>

          {/* --- Queue -------------------------------------------------- */}
          {count > 1 ? (
            <div className="border-t border-[color:var(--line)] pt-5">
              <ol className="flex flex-wrap gap-x-2 gap-y-2">
                {films.map((queued, queueIndex) => {
                  const current = queueIndex === safeIndex;
                  return (
                    <li key={queued.id}>
                      <button
                        type="button"
                        onClick={() => onIndexChange(queueIndex)}
                        aria-current={current ? true : undefined}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-sm px-3 py-2",
                          "font-mono text-micro uppercase tracking-[0.12em] tabular-nums",
                          "u-press transition-[color,border-color,background-color] duration-[120ms] ease-swift",
                          "[border:1px_solid_var(--line)]",
                          current
                            ? "bg-ink-800 text-paper [border-color:var(--color-flare)]"
                            : "text-ash hoverable:hover:text-paper hoverable:hover:[border-color:var(--line-strong)]",
                        )}
                      >
                        <span aria-hidden className="text-ash-dim">
                          {pad(queueIndex + 1)}
                        </span>
                        <span>{labelOf(queued)}</span>
                        <span className="text-ash-dim">{timecode(queued.duration)}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          ) : null}
        </div>
      )}
    </Dialog>
  );
}
