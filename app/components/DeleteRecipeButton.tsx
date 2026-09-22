"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";

import { deleteRecipe } from "@/dbQueries";

type DeleteRecipeButtonProps = {
  recipeId: number;
  /** Where to navigate after a successful delete. Set this from a Server Component parent (a plain string survives that boundary; a callback doesn't). */
  redirectTo?: string;
  /** Called after a successful delete, before any redirect. Only usable from a Client Component parent (e.g. the card modal, to close itself and refresh the grid). */
  onDeleted?: () => void;
  className?: string;
};

export default function DeleteRecipeButton({
  recipeId,
  redirectTo,
  onDeleted,
  className = "",
}: DeleteRecipeButtonProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, formAction, isPending] = useActionState(
    deleteRecipe.bind(null, recipeId),
    null,
  );

  useEffect(() => {
    if (state?.success) {
      dialogRef.current?.close();
      onDeleted?.();
      if (redirectTo) router.push(redirectTo);
    }
  }, [state, onDeleted, redirectTo, router]);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className={`btn btn-error btn-outline btn-sm ${className}`}
      >
        Delete
      </button>

      <dialog ref={dialogRef} className="modal">
        <div className="modal-box">
          <h3 className="text-lg font-bold">Delete this recipe?</h3>
          <p className="py-4 text-sm text-base-content/70">
            This can&apos;t be undone.
          </p>

          {state && !state.success && state.message && (
            <div role="alert" className="alert alert-error mb-4">
              <span>{state.message}</span>
            </div>
          )}

          <div className="modal-action">
            <form method="dialog">
              <button type="submit" className="btn btn-ghost">
                Cancel
              </button>
            </form>
            <form action={formAction}>
              <button
                type="submit"
                disabled={isPending}
                className="btn btn-error"
              >
                {isPending ? "Deleting…" : "Delete"}
              </button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button type="submit">close</button>
        </form>
      </dialog>
    </>
  );
}
