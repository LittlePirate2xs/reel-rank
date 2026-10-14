import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Noise, NoiseSubmission } from "@/types";
import { SEEDED_NOISES } from "@/content/noises";

/* ============================================================================
   Supabase Client & Resilient Data Access Layer

   Connects to the self-hosted Supabase instance on Tailscale node `blackpearl`
   (http://100.95.3.72:8000).

   Guarantees:
     - 2.5s network timeout on read queries with automatic fallback to
       SEEDED_NOISES so static site generation (SSG) and dynamic routes
       never hang or fail if the Tailscale node or network fluctuates.
     - Resilient submitNoise helper that attempts database insert and falls back
       to append-only local storage in `.inquiry-outbox/noise_submissions.jsonl`.
   ========================================================================= */

export type Database = {
  public: {
    Tables: {
      noises: {
        Row: Noise;
        Insert: Omit<Noise, "id" | "created_at" | "views"> & {
          id?: string;
          created_at?: string;
          views?: number;
        };
        Update: Partial<Noise>;
        Relationships: [];
      };
      noise_submissions: {
        Row: NoiseSubmission;
        Insert: {
          id?: string;
          email: string;
          idea: string;
          status?: string;
          created_at?: string;
        };
        Update: Partial<NoiseSubmission>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};

export interface SubmitNoiseResult {
  success: boolean;
  id: string;
  fallback: boolean;
  error?: string;
}

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "http://100.95.3.72:8000";

const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

const DEFAULT_TIMEOUT_MS = 2500;

/**
 * Creates a typed Supabase client with anon key credentials.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return null;
  }
  try {
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });
  } catch {
    return null;
  }
}

/**
 * Creates a typed Supabase client with service role credentials for privileged server actions.
 */
export function getSupabaseServiceClient(): SupabaseClient | null {
  const key = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
  if (!SUPABASE_URL || !key) {
    return null;
  }
  try {
    return createClient(SUPABASE_URL, key, {
      auth: { persistSession: false },
    });
  } catch {
    return null;
  }
}

export const supabase = getSupabaseClient();

/**
 * Race a promise against a timeout deadline.
 */
function withTimeout<T>(promise: PromiseLike<T>, ms = DEFAULT_TIMEOUT_MS): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Operation timed out after ${ms}ms`));
    }, ms);

    Promise.resolve(promise)
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

/**
 * Fallback outbox storage for noise submissions when the database is unreachable.
 */
async function appendToNoiseOutbox(record: unknown): Promise<void> {
  if (typeof window !== "undefined") return;
  try {
    const { promises: fs } = await import("node:fs");
    const path = await import("node:path");
    const dir = path.join(process.cwd(), ".inquiry-outbox");
    await fs.mkdir(dir, { recursive: true });
    const file = path.join(dir, "noise_submissions.jsonl");
    await fs.appendFile(file, `${JSON.stringify(record)}\n`, "utf8");
  } catch {
    // Swallowed on purpose: filesystem write failures must never crash caller
  }
}

/**
 * Fetch all published noises from Supabase with 2.5s timeout.
 * Falls back to SEEDED_NOISES if Supabase is unreachable, unauthenticated, or empty.
 */
export async function getNoises(): Promise<Noise[]> {
  const client = getSupabaseClient();
  if (!client) {
    return SEEDED_NOISES;
  }

  try {
    const query = client
      .from("noises")
      .select("id, slug, title, idea_summary, video_url, poster_url, views, created_at, author")
      .order("created_at", { ascending: false });

    const { data, error } = await withTimeout(query, DEFAULT_TIMEOUT_MS);

    if (error || !data || data.length === 0) {
      return SEEDED_NOISES;
    }

    return data as Noise[];
  } catch {
    return SEEDED_NOISES;
  }
}

/**
 * Fetch a single noise by slug from Supabase with 2.5s timeout.
 * Falls back to SEEDED_NOISES if Supabase is unreachable or unauthenticated.
 */
export async function getNoiseBySlug(slug: string): Promise<Noise | null> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const query = client
        .from("noises")
        .select("id, slug, title, idea_summary, video_url, poster_url, views, created_at, author")
        .eq("slug", slug)
        .maybeSingle();

      const { data, error } = await withTimeout(query, DEFAULT_TIMEOUT_MS);

      if (!error && data) {
        return data as Noise;
      }
    } catch {
      // Fall through to seeded fallback
    }
  }

  const seeded = SEEDED_NOISES.find((n) => n.slug === slug);
  return seeded ?? null;
}

/**
 * Submit a visitor's noise idea.
 * Attempts insertion into Supabase `noise_submissions`.
 * If Supabase is unreachable or fails, writes to `.inquiry-outbox/noise_submissions.jsonl`
 * and returns { success: true, id, fallback: true }.
 */
export async function submitNoise(payload: {
  email: string;
  idea: string;
}): Promise<SubmitNoiseResult> {
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const submissionRecord = {
    id,
    email: payload.email,
    idea: payload.idea,
    status: "pending",
    created_at: new Date().toISOString(),
  };

  const client = getSupabaseServiceClient() || getSupabaseClient();

  if (client) {
    try {
      const query = client
        .from("noise_submissions")
        .insert([submissionRecord])
        .select("id")
        .single();

      const { data, error } = await withTimeout(query, 3000);

      if (!error && data) {
        return {
          success: true,
          id: data.id ?? id,
          fallback: false,
        };
      }
    } catch {
      // Supabase insertion failed or timed out; fall back to local outbox below
    }
  }

  // Fallback: write to durable local outbox
  await appendToNoiseOutbox({ ...submissionRecord, fallback: true });

  return {
    success: true,
    id,
    fallback: true,
  };
}
