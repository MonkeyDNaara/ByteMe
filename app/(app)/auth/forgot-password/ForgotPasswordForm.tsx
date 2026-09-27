"use client";

import Link from "next/link";
import { useActionState } from "react";

import { requestPasswordReset } from "@/lib/auth/actions";

export default function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    requestPasswordReset,
    null,
  );

  return (
    <div className="mx-auto flex max-w-md flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Reset your password
        </h1>
        <p className="text-sm text-base-content/70">
          Enter your account&apos;s email and we&apos;ll send you a link to
          reset your password.
        </p>
      </header>

      {state?.success ? (
        <div className="card flex flex-col gap-3 bg-base-200 p-6 shadow-md sm:p-8">
          <p className="text-sm text-base-content">
            If an account exists for <strong>{state.email}</strong>,
            we&apos;ve sent a password reset link to it. Check your inbox
            (and spam folder).
          </p>
          <Link href="/auth/sign-in" className="link link-primary text-sm">
            Back to sign in
          </Link>
        </div>
      ) : (
        <form
          action={formAction}
          className="card flex flex-col gap-5 bg-base-200 p-6 shadow-md sm:p-8"
        >
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-semibold">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={state?.email}
              required
              className="input input-bordered w-full"
            />
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
            {isPending ? "Sending…" : "Send reset link"}
          </button>

          <p className="text-center text-sm text-base-content/70">
            <Link href="/auth/sign-in" className="link link-primary">
              Back to sign in
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}
