"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export interface InlineSelectOption {
  value: string;
  label: string;
  /** Tailwind classes for the pill background + text (badge style). */
  className?: string;
}

interface InlineSelectProps {
  value: string;
  options: InlineSelectOption[];
  /**
   * Called with the new value. Should perform the persistence and
   * throw on failure so the component can roll back and toast.
   */
  onChange: (next: string) => Promise<void>;
  /** If false, renders as a read-only pill. Defaults to true. */
  editable?: boolean;
  /** Accessible label for screen readers. */
  ariaLabel?: string;
}

/**
 * A badge that double-tasks as an inline editor. Click to reveal a
 * select, choose a new value, and the change is persisted via the
 * supplied onChange. Used in list tables where we want to flip a
 * status without opening the full edit modal.
 */
export function InlineSelect({
  value,
  options,
  onChange,
  editable = true,
  ariaLabel,
}: InlineSelectProps) {
  const [saving, setSaving] = useState(false);
  const current = options.find((o) => o.value === value);
  const label = current?.label ?? value;
  const pillClass =
    current?.className ??
    "bg-gray-100 text-gray-700 border border-gray-200";

  if (!editable) {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${pillClass}`}
      >
        {label}
      </span>
    );
  }

  return (
    <span className="relative inline-flex items-center">
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium pointer-events-none ${pillClass} ${
          saving ? "opacity-50" : ""
        }`}
      >
        {saving ? "Saving…" : label}
      </span>
      <select
        aria-label={ariaLabel}
        value={value}
        disabled={saving}
        onClick={(e) => e.stopPropagation()}
        onChange={async (e) => {
          e.stopPropagation();
          const next = e.target.value;
          if (next === value) return;
          setSaving(true);
          try {
            await onChange(next);
          } catch (err) {
            toast.error(
              err instanceof Error ? err.message : "Failed to update"
            );
          } finally {
            setSaving(false);
          }
        }}
        className="absolute inset-0 opacity-0 cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </span>
  );
}
