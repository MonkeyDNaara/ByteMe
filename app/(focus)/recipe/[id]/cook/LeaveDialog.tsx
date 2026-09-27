"use client";

import { useEffect, useRef } from "react";

type LeaveDialogProps = {
  open: boolean;
  activeTimerCount: number;
  onStay: () => void;
  onLeave: () => void;
};

/** "You still have timers running" -- asked before leaving cooking mode stops them. */
export default function LeaveDialog({ open, activeTimerCount, onStay, onLeave }: LeaveDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Keep the native dialog in sync with the `open` prop.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="modal modal-bottom sm:modal-middle"
      aria-labelledby="leave-title"
      // ESC = "keep cooking" (the safe choice)
      onCancel={(event) => {
        event.preventDefault();
        onStay();
      }}
    >
      <div className="modal-box flex flex-col gap-3 rounded-t-[2rem] bg-base-200 sm:rounded-[2rem]">
        <span aria-hidden="true" className="text-4xl">
          ⏱
        </span>
        <h2 id="leave-title" className="text-xl font-bold">
          {activeTimerCount === 1 ? "A timer is still running" : `${activeTimerCount} timers are still running`}
        </h2>
        <p className="text-base-content/70">
          If you leave cooking mode now, {activeTimerCount === 1 ? "it will" : "they will"} be stopped and won&apos;t
          ring anymore.
        </p>
        <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onLeave} className="btn btn-ghost h-12 rounded-full text-error">
            Stop timers &amp; leave
          </button>
          <button type="button" onClick={onStay} className="btn btn-primary h-12 rounded-full px-6" autoFocus>
            Keep cooking
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={onStay}>
          close
        </button>
      </form>
    </dialog>
  );
}
