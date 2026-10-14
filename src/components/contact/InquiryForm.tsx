"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { Field, Input, Select, Textarea } from "@/components/primitives/Field";
import { Button } from "@/components/primitives/Button";
import { Reveal } from "@/components/primitives/Reveal";
import { offers, careerTiers } from "@/content/offers";
import { site } from "@/content/site";
import { cn } from "@/lib/cn";
import type { InquiryResult } from "@/types";

export type InquiryFormProps = {
  initialScope?: string;
  initialBudget?: string;
  initialIdea?: string;
};

/* ============================================================================
   The inquiry form. This is the conversion path, so it is a real form with a
   real endpoint, real validation and a real reference number. Nothing here is
   a mock.
   ========================================================================= */

const scopeOptions = [
  ...offers.map((o) => ({ value: o.name, label: `${o.name} - ${o.price}` })),
  ...careerTiers.map((t) => ({
    value: `Career services: ${t.name}`,
    label: `Career services: ${t.name} - ${t.price}`,
  })),
  { value: "Something custom", label: "Something custom" },
];

const budgetOptions = [
  { value: "Under $500", label: "Under $500" },
  { value: "$500 to $1,000", label: "$500 to $1,000" },
  { value: "$1,000 to $2,000", label: "$1,000 to $2,000" },
  { value: "$2,000 to $5,000", label: "$2,000 to $5,000" },
  { value: "Above $5,000", label: "Above $5,000" },
  { value: "Not sure yet", label: "Not sure yet" },
];

const timelineOptions = [
  { value: "This week", label: "This week" },
  { value: "This month", label: "This month" },
  { value: "This quarter", label: "This quarter" },
  { value: "No fixed date", label: "No fixed date" },
];

type Status = "idle" | "sending" | "sent" | "error";

export function InquiryForm({
  initialScope,
  initialBudget,
  initialIdea,
}: InquiryFormProps = {}) {
  const searchParams = useSearchParams();
  const scopeParam = searchParams.get("scope") ?? initialScope ?? "";
  const budgetParam = searchParams.get("budget") ?? initialBudget ?? "";
  const ideaParam = searchParams.get("idea") ?? initialIdea ?? "";

  const scopeValue = scopeParam;
  const effectiveScopeOptions =
    scopeValue && !scopeOptions.some((o) => o.value === scopeValue)
      ? [{ value: scopeValue, label: scopeValue }, ...scopeOptions]
      : scopeOptions;

  const effectiveBudgetOptions =
    budgetParam && !budgetOptions.some((o) => o.value === budgetParam)
      ? [{ value: budgetParam, label: budgetParam }, ...budgetOptions]
      : budgetOptions;

  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<
    Extract<InquiryResult, { ok: true }> | null
  >(null);
  const [pending, startTransition] = useTransition();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || status === "sending") return;

    const form = event.currentTarget;
    const data = new FormData(form);

    const payload = {
      scope: String(data.get("scope") ?? ""),
      idea: String(data.get("idea") ?? ""),
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      company: String(data.get("company") ?? ""),
      budget: String(data.get("budget") ?? ""),
      timeline: String(data.get("timeline") ?? ""),
    };

    setStatus("sending");
    setErrors({});

    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = (await res.json()) as InquiryResult;

      if (!res.ok || !json.ok) {
        const nextErrors = json.ok
          ? { form: "Something went wrong on our side. Try again in a moment." }
          : json.errors;
        setErrors(nextErrors);
        setStatus("error");
        return;
      }

      startTransition(() => {
        setResult(json);
        setStatus("sent");
      });
      form.reset();
    } catch {
      setErrors({
        form: `We could not reach the server. Check your connection, or email ${site.email}.`,
      });
      setStatus("error");
    }
  }

  /* ---- Sent state ------------------------------------------------------ */

  if (status === "sent" && result) {
    return (
      <Reveal>
        <div
          className="rounded-lg border border-flare/40 bg-ink-900 p-8 sm:p-12"
          role="status"
          aria-live="polite"
        >
          <p className="u-eyebrow text-flare">Brief received</p>

          <h3 className="u-display mt-4 text-display-4">
            That is in.
            <br />
            We will come back with an example.
          </h3>

          <p className="u-measure mt-6 text-ash">{result.summary}</p>

          <dl className="mt-8 grid gap-x-8 gap-y-4 border-t border-ink-700 pt-6 sm:grid-cols-2">
            <div>
              <dt className="u-eyebrow">Reference</dt>
              <dd className="mt-1 font-mono text-lg tabular-nums text-paper">
                {result.reference}
              </dd>
            </div>
            <div>
              <dt className="u-eyebrow">Received</dt>
              <dd className="mt-1 font-mono text-lg tabular-nums text-paper">
                {new Date(result.receivedAt).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </dd>
            </div>
          </dl>

          <p className="mt-8 text-sm text-ash-dim">
            Keep that reference. If you need to add anything, reply to the email
            we send and quote it.
          </p>
        </div>
      </Reveal>
    );
  }

  /* ---- Form ------------------------------------------------------------ */

  const busy = status === "sending" || pending;

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6">
      {errors.form ? (
        <div
          className="rounded-md border border-flare/50 bg-flare/10 px-4 py-3 text-sm text-paper"
          role="alert"
        >
          {errors.form}
        </div>
      ) : null}

      <Field
        label="What are we making?"
        name="scope"
        required
        error={errors.scope}
        hint="Pick the closest starting point. It is easy to change later."
      >
        <Select
          id="scope"
          name="scope"
          required
          options={effectiveScopeOptions}
          defaultValue={scopeValue || undefined}
          placeholder="Choose a starting point"
          aria-invalid={errors.scope ? true : undefined}
          aria-describedby={errors.scope ? "scope-error" : "scope-hint"}
        />
      </Field>

      <Field
        label="Your idea"
        name="idea"
        required
        error={errors.idea}
        hint="A rough thought is fine. What is it, who is it for, and where will it run?"
      >
        <Textarea
          id="idea"
          name="idea"
          required
          rows={7}
          maxLength={4000}
          defaultValue={ideaParam || undefined}
          placeholder="The idea, in your own words."
          aria-invalid={errors.idea ? true : undefined}
          aria-describedby={errors.idea ? "idea-error" : "idea-hint"}
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Your name" name="name" required error={errors.name}>
          <Input
            id="name"
            name="name"
            required
            autoComplete="name"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
        </Field>

        <Field label="Email" name="email" required error={errors.email}>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
        </Field>

        <Field label="Company" name="company" error={errors.company}>
          <Input id="company" name="company" autoComplete="organization" />
        </Field>

        <Field label="Budget range" name="budget" error={errors.budget}>
          <Select
            id="budget"
            name="budget"
            options={effectiveBudgetOptions}
            defaultValue={budgetParam || undefined}
            placeholder="Optional"
          />
        </Field>

        <Field label="Timing" name="timeline" error={errors.timeline}>
          <Select
            id="timeline"
            name="timeline"
            options={timelineOptions}
            placeholder="Optional"
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-ink-700 pt-6">
        <Button
          type="submit"
          size="lg"
          disabled={busy}
          className={cn(busy && "opacity-60")}
        >
          {busy ? "Sending..." : "Send the brief"}
        </Button>

        <p className="text-sm text-ash">
          Or email{" "}
          <a
            href={`mailto:${site.email}`}
            className="text-paper underline decoration-ink-600 underline-offset-4 transition-colors duration-200 ease-swift hoverable:hover:decoration-flare"
          >
            {site.email}
          </a>
        </p>
      </div>

      <p aria-live="polite" className="sr-only">
        {busy ? "Sending your brief" : ""}
      </p>
    </form>
  );
}
