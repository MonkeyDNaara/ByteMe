"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";

/**
 * The frame around an intercepted route: a native <dialog> opened with
 * showModal() (focus trap, ESC, top layer and an inert background for free).
 * Closing = router.back(), so the URL goes back to the list underneath and
 * the browser's Back/Forward buttons close/reopen the modal.
 * Lives in a layout, so it stays mounted while loading.tsx swaps to page.tsx.
 */
export default function ModalShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      // Next.js 16 may keep this route alive in the background (hidden);
      // the cleanup makes sure a hidden dialog never blocks the page.
      dialog?.close();
      document.body.style.overflow = overflow;
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-label="Recipe"
      // ESC: prevent the native close and go back instead, so the URL updates.
      onCancel={(event) => {
        event.preventDefault();
        router.back();
      }}
      // A click on the dialog itself (not the panel) = a click on the backdrop.
      onClick={(event) => {
        if (event.target === event.currentTarget) router.back();
      }}
      className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none items-center justify-center bg-transparent p-0 text-base-content backdrop:bg-black/50 backdrop:backdrop-blur-sm open:flex sm:p-6"
    >
      {/* Phone: full screen. From sm: centered panel. */}
      <div className="flex h-full w-full flex-col overflow-hidden bg-base-100 shadow-2xl sm:h-auto sm:max-h-[90dvh] sm:max-w-3xl sm:rounded-[2rem] sm:border sm:border-base-300">
        {children}
      </div>
    </dialog>
  );
}
