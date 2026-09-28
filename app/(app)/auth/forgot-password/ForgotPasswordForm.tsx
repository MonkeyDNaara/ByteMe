"use client";

import Link from "next/link";
import { useActionState } from "react";

import { requestPasswordReset } from "@/lib/auth/actions";

import { AuthCard } from "../AuthShell";
import { authButtonClass, authInputClass, authLabelClass, friendlyAuthError } from "../authStyles";
import FormMessage from "../FormMessage";

export default function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(requestPasswordReset, null);

  if (state?.success) {
    return (
      <AuthCard emoji="📬">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Check your inbox!</h1>
        <FormMessage kind="success" emoji="✉️">
          If an account exists for <strong>{state.email}</strong>, a reset link is on its way. Don&apos;t forget to
          check your spam folder.
        </FormMessage>
        <Link href="/auth/sign-in" className="text-center text-sm font-semibold text-link hover:underline">
          ← Back to sign in
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard emoji="🔑">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Forgot your password?</h1>
        <p className="text-[15px] leading-relaxed text-base-content/70">
          No stress — enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className={authLabelClass}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            defaultValue={state?.email}
            required
            className={authInputClass}
          />
        </div>

        {state?.error && <FormMessage kind="error">{friendlyAuthError(state.error)}</FormMessage>}

        <button type="submit" disabled={isPending} className={authButtonClass}>
          {isPending && <span className="loading loading-spinner loading-sm" aria-hidden="true" />}
          {isPending ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <Link href="/auth/sign-in" className="text-center text-sm font-semibold text-link hover:underline">
        ← Back to sign in
      </Link>
    </AuthCard>
  );
}
