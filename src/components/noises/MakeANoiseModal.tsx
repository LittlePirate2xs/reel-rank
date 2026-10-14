"use client";

import { useCallback, useId, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, CircleAlert, Loader2, X } from "lucide-react";

import { Button } from "@/components/primitives/Button";
import { Dialog } from "@/components/primitives/Dialog";
import { cn } from "@/lib/cn";
import { APPLE_SPRINGS } from "@/lib/motion";
import type { NoiseSubmitResult } from "@/types";

/* ============================================================================
   MakeANoiseModal — Apple-Grade Fluid Modal Submission Flow

   Composes `Dialog.tsx` with:
   - size="max-w-lg"
   - APPLE_SPRINGS.criticallyDamped spring transitions
   - bg-ink-950/80 backdrop-blur-md material depth
   - 300-word counter algorithm: val.trim().split(/\s+/).filter(Boolean).length
   - Tabular-nums display and 3-tier visual feedback (ash -> ember -> flare)
   - 2px progress bar below textarea
   - RFC email validation with aria-invalid and aria-describedby
   - State machine: idle -> submitting (disabled, aria-busy) -> success / error
   - Full keyboard accessibility: ESC to dismiss, Tab focus trap and restoration
   ========================================================================= */

const RFC_EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export const MAX_WORDS = 300;
export const MIN_CHARS = 5;
export const MAX_EMAIL_CHARS = 200;

/** Robust whitespace-splitting word counter algorithm. */
export function countWords(text: string): number {
  if (!text || typeof text !== "string") return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** 3-tier visual feedback: <=250 ash, 251-299 ember, >=300 flare. */
export function getWordCountTier(count: number): "ash" | "ember" | "flare" {
  if (count <= 250) return "ash";
  if (count <= 299) return "ember";
  return "flare";
}

/** RFC compliant email format validation under 200 characters. */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const trimmed = email.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_EMAIL_CHARS) return false;
  return RFC_EMAIL_REGEX.test(trimmed);
}

export type ModalStatus = "idle" | "submitting" | "success" | "error";

export type MakeANoiseModalProps = {
  open: boolean;
  onClose: () => void;
};

export function MakeANoiseModal({ open, onClose }: MakeANoiseModalProps) {
  const [email, setEmail] = useState("");
  const [idea, setIdea] = useState("");
  const [status, setStatus] = useState<ModalStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [ideaError, setIdeaError] = useState<string | null>(null);
  const [referenceCode, setReferenceCode] = useState<string | null>(null);

  const lastSubmitTimeRef = useRef<number>(0);
  const emailId = useId();
  const ideaId = useId();

  const wordCount = countWords(idea);
  const tier = getWordCountTier(wordCount);
  const isOverLimit = wordCount > MAX_WORDS;
  const progressPercent = Math.min(100, Math.max(0, (wordCount / MAX_WORDS) * 100));

  const handleReset = useCallback(() => {
    setEmail("");
    setIdea("");
    setStatus("idle");
    setErrorMessage(null);
    setEmailError(null);
    setIdeaError(null);
    setReferenceCode(null);
  }, []);

  const handleClose = useCallback(() => {
    onClose();
    // Reset state after exit transition completes
    setTimeout(() => {
      handleReset();
    }, 250);
  }, [onClose, handleReset]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // 50ms debounce lock against rapid double-clicks
    const now = Date.now();
    if (now - lastSubmitTimeRef.current < 50) return;
    lastSubmitTimeRef.current = now;

    if (status === "submitting") return;

    // Reset inline errors
    setEmailError(null);
    setIdeaError(null);
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    const trimmedIdea = idea.trim();

    let hasClientError = false;

    if (!validateEmail(trimmedEmail)) {
      setEmailError("Please provide a valid email address (max 200 characters).");
      hasClientError = true;
    }

    if (trimmedIdea.length < MIN_CHARS) {
      setIdeaError("Please provide at least 5 characters for your concept.");
      hasClientError = true;
    } else if (isOverLimit) {
      setIdeaError(`Idea must be 300 words or fewer (${wordCount - MAX_WORDS} words over limit).`);
      hasClientError = true;
    }

    if (hasClientError) {
      setStatus("error");
      return;
    }

    setStatus("submitting");

    try {
      const response = await fetch("/api/noises/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, idea: trimmedIdea }),
      });

      const data: NoiseSubmitResult = await response.json();

      if (response.status === 201 && data.ok) {
        setReferenceCode(data.referenceCode);
        setStatus("success");
      } else if (response.status === 422 && !data.ok && data.errors) {
        if (data.errors.email) setEmailError(data.errors.email);
        if (data.errors.idea) setIdeaError(data.errors.idea);
        setErrorMessage(data.errors.form ?? "Please review the highlighted fields.");
        setStatus("error");
      } else if (response.status === 429 && !data.ok) {
        setErrorMessage(data.error ?? "Too many submissions. Please wait a moment.");
        setStatus("error");
      } else {
        setErrorMessage(
          (!data.ok && data.error) ? data.error : "Submission could not be completed. Please try again.",
        );
        setStatus("error");
      }
    } catch {
      // In case of complete network disruption, gracefully display error
      setErrorMessage("Network error connecting to submission server. Please try again.");
      setStatus("error");
    }
  };

  const tierColorClass =
    tier === "flare"
      ? "text-flare font-bold"
      : tier === "ember"
        ? "text-ember"
        : "text-ash";

  const progressBgClass =
    tier === "flare"
      ? "bg-flare"
      : tier === "ember"
        ? "bg-ember"
        : "bg-ash";

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Make a Noise"
      hideTitle
      size="max-w-lg"
    >
      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="u-eyebrow text-ash">COMMUNITY INITIATIVE · NOISE LAB</p>
            <h2 className="u-display mt-1 text-2xl text-paper sm:text-3xl">
              Make a Noise.
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close modal"
            className="u-press -mr-1 -mt-1 inline-flex size-9 items-center justify-center rounded-sm text-ash transition-colors duration-160 hoverable:hover:bg-ink-800 hoverable:hover:text-paper"
          >
            <X className="size-5" />
          </button>
        </div>

        {status === "success" ? (
          /* Confirmation Success Card */
          <div className="mt-5 flex flex-col gap-5">
            <div className="rounded-md border border-[color:var(--line)] bg-ink-950 p-5">
              <div className="flex items-center gap-2 text-flare">
                <CheckCircle2 className="size-4" />
                <span className="u-eyebrow font-mono text-flare">Noise Logged</span>
              </div>
              <h3 className="font-display mt-2 text-xl font-bold text-paper sm:text-2xl">
                You made a noise.
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ash">
                We have received your concept. Our studio will review your idea, deliver the initial motion graphics piece, and feature it in the gallery.
              </p>
              {referenceCode ? (
                <div className="mt-4 rounded-sm border border-[color:var(--line)] bg-ink-900/80 p-3">
                  <p className="font-mono text-micro uppercase tracking-wider text-ash">
                    Reference Code
                  </p>
                  <p className="font-mono text-lg font-bold tracking-wider text-flare">
                    {referenceCode}
                  </p>
                </div>
              ) : null}
              <p className="mt-3 text-xs text-ash-dim">
                Tracking confirmation associated with <span className="text-paper">{email}</span>.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button href="/noises" onClick={handleClose} variant="solid" arrow>
                View the Gallery
              </Button>
              <Button variant="outline" onClick={handleReset}>
                Submit another idea
              </Button>
            </div>
          </div>
        ) : (
          /* Form State (idle / submitting / error) */
          <form
            onSubmit={handleSubmit}
            noValidate
            aria-busy={status === "submitting"}
            className="mt-4 flex flex-col gap-4"
          >
            <p className="text-sm leading-relaxed text-ash">
              Want to make a noise? Leave your email and idea in 300 words — we will deliver it and feature it in the gallery.
            </p>

            {/* Error Alert */}
            {status === "error" && errorMessage ? (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-sm border border-flare/40 bg-flare/10 p-3 text-sm text-paper"
              >
                <CircleAlert className="mt-0.5 size-4 shrink-0 text-flare" />
                <div className="flex-1">
                  <p className="font-medium text-paper">Submission Notice</p>
                  <p className="mt-0.5 text-xs text-ash-dim">{errorMessage}</p>
                </div>
              </div>
            ) : null}

            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={emailId}
                className="font-mono text-xs uppercase tracking-[0.14em] text-paper"
              >
                Your Email <span aria-hidden className="text-flare">*</span>
              </label>
              <input
                id={emailId}
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                maxLength={MAX_EMAIL_CHARS}
                disabled={status === "submitting"}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                placeholder="name@studio.com"
                aria-invalid={Boolean(emailError)}
                aria-describedby={
                  emailError ? `${emailId}-error` : `${emailId}-hint`
                }
                className={cn(
                  "block w-full rounded-sm border border-[color:var(--line-strong)] bg-ink-950 px-3.5 py-2.5 text-base text-paper placeholder:text-ash-dim transition-[border-color,background-color] duration-160 ease-swift hoverable:hover:border-ink-500 disabled:cursor-not-allowed disabled:opacity-60",
                  emailError && "border-flare hoverable:hover:border-flare",
                )}
              />
              {emailError ? (
                <p
                  id={`${emailId}-error`}
                  role="alert"
                  className="flex items-center gap-1.5 text-xs text-flare-soft"
                >
                  <CircleAlert className="size-3.5 text-flare" />
                  <span>{emailError}</span>
                </p>
              ) : (
                <p id={`${emailId}-hint`} className="text-micro text-ash-dim">
                  We will notify you when your noise piece is rendered and live.
                </p>
              )}
            </div>

            {/* Idea Field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor={ideaId}
                  className="font-mono text-xs uppercase tracking-[0.14em] text-paper"
                >
                  Your Idea <span aria-hidden className="text-flare">*</span>
                </label>
                {/* Tabular-nums word counter badge with 3-tier feedback */}
                <div
                  id={`${ideaId}-counter`}
                  aria-live="polite"
                  className="flex items-center gap-2 font-mono text-micro uppercase tracking-wider"
                >
                  <span className={cn("tabular-nums transition-colors duration-160", tierColorClass)}>
                    {wordCount} / {MAX_WORDS} words
                  </span>
                  {isOverLimit ? (
                    <span className="text-flare font-bold">
                      ({wordCount - MAX_WORDS} over limit)
                    </span>
                  ) : null}
                </div>
              </div>

              <textarea
                id={ideaId}
                name="idea"
                rows={5}
                required
                disabled={status === "submitting"}
                value={idea}
                onChange={(e) => {
                  setIdea(e.target.value);
                  if (ideaError) setIdeaError(null);
                }}
                placeholder="Describe your film or motion concept in 300 words or fewer..."
                aria-invalid={Boolean(ideaError || isOverLimit)}
                aria-describedby={`${ideaId}-counter ${ideaId}-bar ${
                  ideaError ? `${ideaId}-error` : ""
                }`}
                className={cn(
                  "block w-full resize-y rounded-sm border border-[color:var(--line-strong)] bg-ink-950 px-3.5 py-2.5 text-base leading-relaxed text-paper placeholder:text-ash-dim transition-[border-color,background-color] duration-160 ease-swift hoverable:hover:border-ink-500 disabled:cursor-not-allowed disabled:opacity-60",
                  (ideaError || isOverLimit) && "border-flare hoverable:hover:border-flare",
                )}
              />

              {/* 2px hairline progress bar below textarea */}
              <div
                id={`${ideaId}-bar`}
                className="relative mt-1 h-[2px] w-full overflow-hidden rounded-pill bg-ink-800"
              >
                <div
                  className={cn(
                    "h-full transition-[width,background-color] duration-160 ease-swift",
                    progressBgClass,
                  )}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {ideaError ? (
                <p
                  id={`${ideaId}-error`}
                  role="alert"
                  className="flex items-center gap-1.5 text-xs text-flare-soft"
                >
                  <CircleAlert className="size-3.5 text-flare" />
                  <span>{ideaError}</span>
                </p>
              ) : (
                <div className="flex items-center justify-between text-micro text-ash-dim">
                  <span>Keep it under 300 words. Concrete visual hooks work best.</span>
                  <span>{Math.max(0, MAX_WORDS - wordCount)} words remaining</span>
                </div>
              )}
            </div>

            {/* Submission Actions */}
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
              <Button
                type="submit"
                variant="solid"
                size="md"
                arrow
                disabled={status === "submitting" || isOverLimit || wordCount === 0}
                className="u-press"
              >
                {status === "submitting" ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="size-3.5 animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  "Make a Noise"
                )}
              </Button>
              <Link
                href="/noises"
                onClick={handleClose}
                className="u-eyebrow text-ash transition-colors duration-160 ease-swift hoverable:hover:text-flare"
              >
                Explore community gallery →
              </Link>
            </div>
          </form>
        )}
      </div>
    </Dialog>
  );
}
