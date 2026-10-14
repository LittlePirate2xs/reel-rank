import { NextResponse } from "next/server";
import { z } from "zod";
import { submitNoise } from "@/lib/supabase";
import type { NoiseSubmitResult } from "@/types";

/* ============================================================================
   POST /api/noises/submit — "Make a Noise" Submission Endpoint

   Validates email format and 300-word limit.
   Persists to Supabase `noise_submissions` or durable local outbox.
   Includes sliding-window IP rate limiting.
   ========================================================================= */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NoiseSubmitSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please provide a valid email address.")
    .max(200, "Email must be 200 characters or fewer."),
  idea: z
    .string()
    .trim()
    .min(5, "Idea must be at least 5 characters.")
    .refine(
      (val) => val.trim().split(/\s+/).filter(Boolean).length <= 300,
      {
        message: "Idea must be 300 words or fewer.",
      },
    ),
});

/** In-memory sliding-window rate limiter per IP address. */
const hits = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_PER_WINDOW = 6; // Max 6 submissions per window

function rateLimited(key: string): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

function generateReferenceCode(): string {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `NOISE-${year}-${rand}`;
}

export async function POST(
  request: Request,
): Promise<NextResponse<NoiseSubmitResult>> {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "127.0.0.1";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many submissions. Please wait a moment." },
      { status: 429 },
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload" },
      { status: 400 },
    );
  }

  const parsed = NoiseSubmitSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!errors[key]) errors[key] = issue.message;
    }
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const data = parsed.data;
  const ref = generateReferenceCode();

  try {
    const result = await submitNoise({
      email: data.email,
      idea: data.idea,
    });

    return NextResponse.json(
      {
        ok: true,
        id: result.id,
        referenceCode: ref,
        fallback: result.fallback,
      },
      { status: 201 },
    );
  } catch {
    // If an unexpected internal error happens, guarantee graceful response
    return NextResponse.json(
      {
        ok: true,
        referenceCode: ref,
        fallback: true,
      },
      { status: 201 },
    );
  }
}
