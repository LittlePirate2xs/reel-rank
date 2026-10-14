import { CircleAlert } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";

/* ============================================================================
   Field — label + control + hint + error, wired for accessibility.

   Contract (docs/CONTRACTS.md §3 + the Field addition):
   - the label renders with `htmlFor={name}`
   - the hint renders with `id="{name}-hint"`
   - the error renders with `id="{name}-error"` and `role="alert"`
   Consumers put `id={name}` on the control and point `aria-describedby` at
   those ids themselves, so Field never rewrites its children.

   Server component: no hooks, no events. Inputs are native controls only.
   ========================================================================= */

export type FieldProps = {
  label: string;
  name: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
};

export type InputProps = ComponentPropsWithoutRef<"input">;
export type TextareaProps = ComponentPropsWithoutRef<"textarea">;
export type SelectProps = ComponentPropsWithoutRef<"select"> & {
  options: { value: string; label: string }[];
  placeholder?: string;
};

/**
 * Ink surface, hairline border. `text-base` (16px) is deliberate: anything
 * smaller makes iOS Safari zoom the whole page when the field takes focus.
 * The vermilion focus ring comes from the global `:focus-visible` rule — it is
 * not duplicated here.
 */
const CONTROL = [
  "block w-full rounded-sm border border-[color:var(--line-strong)] bg-ink-900",
  "px-3.5 py-3 text-base text-paper placeholder:text-ash-dim",
  "transition-[border-color,background-color] duration-[160ms] ease-swift",
  "hoverable:hover:border-ink-500",
  "disabled:cursor-not-allowed disabled:opacity-60",
].join(" ");

/** Invalid controls get a flare border; the message below carries the meaning. */
const CONTROL_INVALID = "border-flare hoverable:hover:border-flare";

function isInvalid(value: unknown): boolean {
  return value === true || value === "true";
}

export function Input({ className, type = "text", ...props }: InputProps) {
  return (
    <input
      {...props}
      type={type}
      className={cn(CONTROL, isInvalid(props["aria-invalid"]) && CONTROL_INVALID, className)}
    />
  );
}

export function Textarea({ className, rows = 5, ...props }: TextareaProps) {
  return (
    <textarea
      {...props}
      rows={rows}
      className={cn(
        CONTROL,
        "min-h-32 resize-y leading-relaxed",
        isInvalid(props["aria-invalid"]) && CONTROL_INVALID,
        className,
      )}
    />
  );
}

export function Select({ className, options, placeholder, ...props }: SelectProps) {
  return (
    <select
      {...props}
      className={cn(CONTROL, "pr-9", isInvalid(props["aria-invalid"]) && CONTROL_INVALID, className)}
    >
      {placeholder ? (
        <option value="" disabled>
          {placeholder}
        </option>
      ) : null}
      {options.map((option) => (
        <option key={option.value} value={option.value} className="bg-ink-900 text-paper">
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function Field({ label, name, hint, error, required = false, children, className }: FieldProps) {
  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <label htmlFor={name} className="font-mono text-xs uppercase tracking-[0.14em] text-paper">
        {label}
        {required ? (
          <span aria-hidden className="ml-1 text-flare">
            *
          </span>
        ) : null}
      </label>

      {children}

      {hint ? (
        <p id={`${name}-hint`} className="text-sm text-ash">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={`${name}-error`} role="alert" className="flex items-start gap-1.5 text-sm text-flare-soft">
          <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-flare" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}
