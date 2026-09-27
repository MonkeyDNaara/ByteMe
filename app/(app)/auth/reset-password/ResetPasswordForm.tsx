"use client";

import Link from "next/link";
import { useActionState } from "react";

import { resetPassword } from "@/lib/auth/actions";

import { AuthCard } from "../AuthShell";
import { authButtonClass, friendlyAuthError } from "../authStyles";
import FormMessage from "../FormMessage";
import PasswordField from "../PasswordField";

type ResetPasswordFormProps = {
  token: string;
};

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [state, formAction, isPending] = useActionState(resetPassword, null);

  return (
    <AuthCard emoji="🔐">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Choose a new password</h1>
        <p className="text-[15px] leading-relaxed text-base-content/70">Almost done — pick something you&apos;ll remember.</p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="token" value={token} />
        <PasswordField label="New password" autoComplete="new-password" showStrength />

        {state?.error && (
          <FormMessage kind="error">
            {friendlyAuthError(state.error)}{" "}
            <Link href="/auth/forgot-password" className="font-semibold text-link hover:underline">
              Request a new link
            </Link>
          </FormMessage>
        )}

        <button type="submit" disabled={isPending} className={authButtonClass}>
          {isPending && <span className="loading loading-spinner loading-sm" aria-hidden="true" />}
          {isPending ? "Saving…" : "Save new password"}
        </button>
      </form>

      <Link href="/auth/sign-in" className="text-center text-sm font-semibold text-link hover:underline">
        ← Back to sign in
      </Link>
    </AuthCard>
  );
}
