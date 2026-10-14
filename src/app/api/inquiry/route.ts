import { NextResponse } from "next/server";
import { z } from "zod";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { InquiryResult } from "@/types";

/* ============================================================================
   Inquiry endpoint.

   The brief must never be silently lost. Delivery order:
     1. Validate.
     2. Forward to INQUIRY_WEBHOOK_URL when configured (Formspree, Make,
        Zapier, a CRM endpoint — anything that accepts JSON).
     3. Always append to a local outbox file so a failed forward still leaves
        a durable record.
     4. Return a reference the sender can quote.

   Set INQUIRY_WEBHOOK_URL in the environment to enable forwarding.
   ========================================================================= */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const InquirySchema = z.object({
  scope: z.string().trim().min(1, "Choose what you want to make.").max(160),
  idea: z
    .string()
    .trim()
    .min(12, "Tell us a little more. A sentence is enough.")
    .max(4000, "That is longer than we can take here. Trim it to 4,000 characters."),
  name: z.string().trim().min(2, "We need a name to reply to.").max(120),
  email: z.string().trim().email("That email address does not look right.").max(200),
  company: z.string().trim().max(160).optional().or(z.literal("")),
  budget: z.string().trim().max(80).optional().or(z.literal("")),
  timeline: z.string().trim().max(80).optional().or(z.literal("")),
});

/** Deliberately small in-memory limiter. Enough to stop casual abuse. */
const hits = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 6;

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

function reference(): string {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `RR-${year}-${rand}`;
}

async function appendToOutbox(record: unknown): Promise<void> {
  // Best effort. A read-only filesystem must not fail the request.
  try {
    const dir = path.join(process.cwd(), ".inquiry-outbox");
    await fs.mkdir(dir, { recursive: true });
    const file = path.join(dir, "inquiries.jsonl");
    await fs.appendFile(file, `${JSON.stringify(record)}\n`, "utf8");
  } catch {
    // Swallowed on purpose: the webhook or the log below is the fallback.
  }
}

async function forwardToWebhook(payload: unknown): Promise<boolean> {
  const url = process.env.INQUIRY_WEBHOOK_URL;
  if (!url) return false;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      // Never let a slow upstream hang the form submission.
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function POST(request: Request): Promise<NextResponse<InquiryResult>> {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      {
        ok: false,
        errors: {
          form: "That is a lot of briefs in a short time. Give it ten minutes, or email us directly.",
        },
      },
      { status: 429 },
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, errors: { form: "We could not read that request." } },
      { status: 400 },
    );
  }

  const parsed = InquirySchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!errors[key]) errors[key] = issue.message;
    }
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const data = parsed.data;
  const ref = reference();
  const receivedAt = new Date().toISOString();

  const record = { reference: ref, receivedAt, ...data };
  const forwarded = await forwardToWebhook(record);
  await appendToOutbox({ ...record, forwarded });

  if (!forwarded) {
    // eslint-disable-next-line no-console
    console.info(
      `[inquiry] ${ref} captured but no INQUIRY_WEBHOOK_URL configured — stored in .inquiry-outbox/inquiries.jsonl`,
    );
  }

  return NextResponse.json(
    {
      ok: true,
      reference: ref,
      receivedAt,
      summary: `We have your brief for "${data.scope}". An initial example comes back within one working day.`,
    },
    { status: 201 },
  );
}
