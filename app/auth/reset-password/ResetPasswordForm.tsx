"use client";

import Link from "next/link";
import { useActionState } from "react";

import { resetPassword } from "@/app/auth/actions";

type ResetPasswordFormProps = {
  token: string;
};

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [state, formAction, isPending] = useActionState(resetPassword, null);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Choose a new password
        </h1>
      </header>

      <form
        action={formAction}
        className="card flex flex-col gap-5 bg-base-200 p-6 shadow-md sm:p-8"
      >
        <input type="hidden" name="token" value={token} />

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-semibold">
            New password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            className="input input-bordered w-full"
          />
          <p className="text-xs text-base-content/60">At least 8 characters.</p>
        </div>

        {state?.error && (
          <p role="alert" className="text-sm text-error">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="btn btn-primary w-full"
        >
          {isPending ? "Saving…" : "Save new password"}
        </button>

        <p className="text-center text-sm text-base-content/70">
          <Link href="/auth/sign-in" className="link link-primary">
            Back to sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
