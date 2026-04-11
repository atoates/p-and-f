"use client";

import { useEffect, useRef } from "react";

// Selectors for everything the WAI-ARIA dialog pattern considers
// focusable. Kept in sync with the same list in components/ui/modal.tsx.
const FOCUSABLE_SELECTORS = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "iframe",
  "object",
  "embed",
  "[contenteditable]",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

/**
 * Wires up the keyboard and focus behaviour every modal needs:
 *   - Escape closes
 *   - Tab / Shift+Tab are trapped inside the dialog
 *   - The first focusable element receives focus when the dialog opens
 *   - Whatever was focused before the dialog opened gets focus back on close
 *   - Body scroll is locked while the dialog is open
 *
 * Pair it with `role="dialog"`, `aria-modal="true"` and a labelled-by
 * title id on the dialog root to complete the pattern.
 */
export function useModalA11y(
  isOpen: boolean,
  onClose: () => void
): {
  dialogRef: React.RefObject<HTMLDivElement>;
} {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedRef.current =
      (document.activeElement as HTMLElement | null) ?? null;

    const focusInitial = () => {
      const root = dialogRef.current;
      if (!root) return;
      const firstFocusable = root.querySelector<HTMLElement>(FOCUSABLE_SELECTORS);
      (firstFocusable ?? root).focus();
    };
    const raf = requestAnimationFrame(focusInitial);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const root = dialogRef.current;
      if (!root) return;
      const focusables = Array.from(
        root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
      ).filter((el) => !el.hasAttribute("disabled"));
      if (focusables.length === 0) {
        event.preventDefault();
        root.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (event.shiftKey) {
        if (active === first || !root.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocusedRef.current?.focus?.();
    };
  }, [isOpen, onClose]);

  return { dialogRef };
}
