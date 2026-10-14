"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

import { MediaFrame, PlaceholderFrame } from "@/components/primitives/MediaFrame";
import { ShareButton } from "@/components/noises/ShareButton";
import { usePersistentAudio } from "@/lib/audio";
import { cn } from "@/lib/cn";
import type { MediaAsset, Noise } from "@/types";

/* ============================================================================
   NoiseCard — Community Noise Gallery Card.

   Adheres strictly to the WorkCard design system:
   - midnight dark blue token: bg-ink-900
   - .u-press micro-interaction (40ms pointer-down scale)
   - Hairline border warming to flare on hover
   - Provenance flare indicator: .size-1.5 rounded-pill bg-flare
   - Views pill with tabular numbers
   - Semantic Link navigation and isolated one-click ShareButton
   ========================================================================= */

export type NoiseCardProps = {
  noise: Noise;
  priority?: boolean;
  className?: string;
};

/** Convert a Noise entity into a compliant MediaAsset for MediaFrame. */
export function noiseToMediaAsset(noise: Noise): MediaAsset {
  const hasPoster = Boolean(noise.poster_url && noise.poster_url.trim().length > 0);
  const hasVideo = Boolean(noise.video_url && noise.video_url.trim().length > 0);

  return {
    id: noise.id,
    kind: "video",
    src: noise.video_url || "",
    poster: noise.poster_url || "",
    alt: `${noise.title} — community noise thumbnail`,
    width: 1920,
    height: 1080,
    placeholder: !hasPoster,
    playable: hasVideo,
  };
}

export function NoiseCard({ noise, priority = false, className }: NoiseCardProps) {
  const asset = noiseToMediaAsset(noise);
  const authorName = noise.author && noise.author.trim().length > 0 ? noise.author : "Community Creator";

  return (
    <article
      className={cn(
        "group flex flex-col justify-between overflow-hidden rounded-md bg-ink-900",
        "u-press [border:1px_solid_var(--line)]",
        "transition-[transform,border-color] duration-200 ease-swift",
        "hoverable:hover:-translate-y-1 hoverable:hover:[border-color:var(--color-flare)]",
        className,
      )}
    >
      <div>
        {/* Media Frame Header */}
        <Link
          href={`/noises/${noise.slug}`}
          data-cursor="hover"
          aria-label={`View ${noise.title} by ${authorName}`}
          className="block relative overflow-hidden focus:outline-none"
        >
          <MediaFrame
            asset={asset}
            priority={priority}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="transition-transform duration-300 ease-swift group-hover:scale-[1.02]"
          />
        </Link>

        {/* Card Body */}
        <div className="flex flex-col gap-3 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-display-4">
              <Link
                href={`/noises/${noise.slug}`}
                className="transition-colors duration-160 ease-soft hoverable:hover:text-flare"
              >
                {noise.title}
              </Link>
            </h3>

            {/* Views Pill */}
            <span className="mt-0.5 shrink-0 rounded-pill border border-[color:var(--line)] bg-ink-850 px-2 py-0.5 font-mono text-micro uppercase tabular-nums text-ash/90">
              {noise.views ? noise.views.toLocaleString() : "0"} views
            </span>
          </div>

          {/* Idea Snippet */}
          <p className="u-measure-tight text-sm text-ash line-clamp-3 leading-relaxed">
            {noise.idea_summary}
          </p>
        </div>
      </div>

      {/* Card Footer: Submitter Credit & Share Action */}
      <div className="flex items-center justify-between border-t border-[color:var(--line)] px-5 py-4 sm:px-6">
        <div className="flex items-center gap-2 min-w-0 pr-3">
          <span
            aria-hidden="true"
            className="size-1.5 rounded-pill bg-flare shrink-0"
          />
          <span className="truncate font-mono text-micro uppercase tracking-wider text-ash">
            {authorName}
          </span>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <ShareButton
            url={`/noises/${noise.slug}`}
            title={noise.title}
            text={noise.idea_summary}
            compact
          />
        </div>
      </div>
    </article>
  );
}

/* ============================================================================
   NoisePlayer — Dedicated video player with persistent audio synchronization.

   Features:
   - Integrates usePersistentAudio() to preserve global audio preferences.
   - Live timecode display (00:00:00:00 film style).
   - Direct transport controls (Play/Pause, Mute/Unmute).
   - Graceful fallback to PlaceholderFrame film slate if video is missing or errors.
   ========================================================================= */

function formatTimecode(seconds: number): string {
  if (!seconds || Number.isNaN(seconds) || seconds < 0) return "00:00:00:00";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const frames = Math.floor((seconds % 1) * 24);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}:${pad(frames)}`;
}

export type NoisePlayerProps = {
  noise: Noise;
  className?: string;
};

export function NoisePlayer({ noise, className }: NoisePlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { muted, toggleMute } = usePersistentAudio();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const [hasError, setHasError] = useState(false);

  const asset = noiseToMediaAsset(noise);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // React does not always serialize muted attribute to the DOM node;
    // explicit property write ensures autoplay policy compliance.
    video.muted = muted;
  }, [muted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onLoadedMetadata = () => {
      if (video.duration && !Number.isNaN(video.duration)) {
        setDuration(video.duration);
      }
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onError = () => setHasError(true);

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("error", onError);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("error", onError);
    };
  }, []);

  const handleTogglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  if (hasError || !asset.playable) {
    return (
      <div className={cn("relative w-full overflow-hidden rounded-md border border-[color:var(--line)] bg-ink-950", className)}>
        <PlaceholderFrame
          asset={asset}
          notice="Film slate: video asset currently rendering."
          className="aspect-video w-full"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative w-full overflow-hidden rounded-md border border-[color:var(--line)] bg-ink-950",
        className,
      )}
    >
      <video
        ref={videoRef}
        src={noise.video_url}
        poster={noise.poster_url}
        playsInline
        preload="metadata"
        autoPlay
        muted={muted}
        loop
        className="aspect-video w-full object-cover"
        onClick={handleTogglePlay}
      />

      {/* Control Overlay Bar */}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-ink-950/90 via-ink-950/60 to-transparent p-4 sm:p-5">
        <div className="flex items-center gap-3">
          {/* Play/Pause Button */}
          <button
            type="button"
            onClick={handleTogglePlay}
            aria-label={isPlaying ? "Pause noise playback" : "Start noise playback"}
            className="u-press flex size-9 items-center justify-center rounded-sm border border-[color:var(--line-strong)] bg-ink-900/90 text-paper hoverable:hover:border-flare hoverable:hover:text-flare"
          >
            {isPlaying ? (
              <Pause aria-hidden className="size-4" />
            ) : (
              <Play aria-hidden className="size-4 ml-0.5" />
            )}
          </button>

          {/* Persistent Audio Toggle Button */}
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? "Unmute audio" : "Mute audio"}
            className="u-press flex size-9 items-center justify-center rounded-sm border border-[color:var(--line-strong)] bg-ink-900/90 text-paper hoverable:hover:border-flare hoverable:hover:text-flare"
          >
            {muted ? (
              <VolumeX aria-hidden className="size-4 text-ash" />
            ) : (
              <Volume2 aria-hidden className="size-4 text-flare" />
            )}
          </button>
        </div>

        {/* Technical Timecode */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-micro uppercase tracking-wider text-ash/80">TC:</span>
          <span className="font-mono text-micro tabular-nums text-paper bg-ink-900/80 px-2 py-1 rounded border border-[color:var(--line)]">
            {formatTimecode(currentTime)}
          </span>
        </div>
      </div>
    </div>
  );
}
