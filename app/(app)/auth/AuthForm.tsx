"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signIn, signUp } from "@/lib/auth/actions";
import { withNext } from "@/lib/auth/safeNext";

import AuthShell from "./AuthShell";
import { authButtonClass, authInputClass, authLabelClass, friendlyAuthError } from "./authStyles";
import FormMessage from "./FormMessage";
import PasswordField from "./PasswordField";

type AuthFormProps = {
  mode: "sign-in" | "sign-up";
  /** Success notice, e.g. after a password reset. */
  notice?: string;
  /** Validated return path ("/" = none), sent along as a hidden field. */
  next?: string;
};

export default function AuthForm({ mode, notice, next = "/" }: AuthFormProps) {
  const isSignUp = mode === "sign-up";
  const [state, formAction, isPending] = useActionState(isSignUp ? signUp : signIn, null);

  return (
    <AuthShell
      panelTitle={
        isSignUp ? (
          <>
            Join YOUR
            <br />
            new kitchen!
          </>
        ) : (
          <>
            Welcome back to
            <br />
            YOUR kitchen!
          </>
        )
      }
    >
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-extrabold tracking-tight">{isSignUp ? "Create account 🎉" : "Sign in"}</h1>
        <p className="text-[15px] text-base-content/70">
          {isSignUp ? "Already cooking with us? " : "No account yet? "}
          <Link
            href={withNext(isSignUp ? "/auth/sign-in" : "/auth/sign-up", next)}
            className="font-semibold text-link hover:underline"
          >
            {isSignUp ? "Sign in" : "Create one — it's free"}
          </Link>
        </p>
      </div>

      {notice && (
        <FormMessage kind="success" emoji="🔑">
          {notice}
        </FormMessage>
      )}

      <form action={formAction} className="flex flex-col gap-4">
        {/* Where to go after success. The server action re-validates it. */}
        <input type="hidden" name="next" value={next} />
        {isSignUp && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className={authLabelClass}>
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              defaultValue={state?.name}
              required
              className={authInputClass}
            />
          </div>
        )}

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

        <PasswordField
          label="Password"
          autoComplete={isSignUp ? "new-password" : "current-password"}
          showStrength={isSignUp}
          labelAside={
            !isSignUp && (
              <Link href="/auth/forgot-password" className="hit-area relative text-[13px] font-semibold text-link hover:underline">
                Forgot password?
              </Link>
            )
          }
        />

        {state?.error && <FormMessage kind="error">{friendlyAuthError(state.error)}</FormMessage>}

        <button type="submit" disabled={isPending} className={`${authButtonClass} mt-1`}>
          {isPending && <span className="loading loading-spinner loading-sm" aria-hidden="true" />}
          {isPending ? (isSignUp ? "Creating account…" : "Signing in…") : isSignUp ? "Create account" : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}
