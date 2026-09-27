"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

/** A toast can offer one action: a link ("View list →") or a callback ("Undo"). */
export type ToastAction = { label: string; href: string } | { label: string; onClick: () => void };

export type ToastOptions = {
  message: string;
  action?: ToastAction;
};

type Toast = ToastOptions & { id: number };

const DURATION_MS = 4000;

// The context only holds the `showToast` function -- components that show a
// toast don't re-render when the toast itself changes.
const ToastContext = createContext<((toast: ToastOptions) => void) | null>(null);

/**
 * Wrap the app once (app/layout.tsx). Any client component below can then
 * call `useToast()` to show a short message at the bottom of the screen.
 * Only one toast at a time: a new one replaces the old one, so fast clicks
 * don't pile up a stack of messages.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextIdRef = useRef(0);

  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(null);
  }, []);

  const showToast = useCallback((options: ToastOptions) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    nextIdRef.current += 1;
    setToast({ ...options, id: nextIdRef.current });
    timerRef.current = setTimeout(() => setToast(null), DURATION_MS);
  }, []);

  // Don't leave a timer running after the provider unmounts.
  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const action = toast?.action;
  const actionClass =
    "shrink-0 rounded-full bg-base-100/15 px-3.5 py-1.5 font-semibold transition-colors hover:bg-base-100/25";

  return (
    <ToastContext.Provider value={showToast}>
      {children}

      {/* The live region is always in the DOM, so screen readers notice when
          a message appears inside it (role="status" = aria-live="polite"). */}
      <div
        role="status"
        className="toast toast-center toast-bottom pointer-events-none z-[60] mb-[env(safe-area-inset-bottom)] p-4"
      >
        {toast && (
          <div
            // A new id = a new element, so the enter animation replays for every toast.
            key={toast.id}
            className={`pointer-events-auto flex max-w-[calc(100vw-2rem)] items-center gap-3 whitespace-normal rounded-full bg-base-content py-2 text-sm text-base-100 shadow-xl motion-safe:animate-toast-in ${
              action ? "pl-5 pr-2" : "px-5 py-2.5"
            }`}
          >
            <span>{toast.message}</span>
            {action &&
              ("href" in action ? (
                <Link href={action.href} onClick={dismiss} className={actionClass}>
                  {action.label} →
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    action.onClick();
                    dismiss();
                  }}
                  className={actionClass}
                >
                  {action.label}
                </button>
              ))}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const showToast = useContext(ToastContext);
  if (!showToast) throw new Error("useToast() must be used inside <ToastProvider>");
  return showToast;
}
