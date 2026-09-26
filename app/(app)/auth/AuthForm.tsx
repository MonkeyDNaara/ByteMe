"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signIn, signUp } from "@/lib/auth/actions";

type AuthFormProps = {
  mode: "sign-in" | "sign-up";
  notice?: string;
};

export default function AuthForm({ mode, notice }: AuthFormProps) {
  const isSignUp = mode === "sign-up";
  const [state, formAction, isPending] = useActionState(
    isSignUp ? signUp : signIn,
    null,
  );

  return (
    <div className="mx-auto flex max-w-md flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {isSignUp ? "Create account" : "Sign in"}
        </h1>
        <p className="text-sm text-base-content/70">
          {isSignUp
            ? "Sign up to create your own recipes."
            : "Sign in to create your own recipes."}
        </p>
      </header>

      {notice && (
        <p role="status" className="text-sm text-success">
          {notice}
        </p>
      )}

      <form
        action={formAction}
        className="card flex flex-col gap-5 bg-base-200 p-6 shadow-md sm:p-8"
      >
        {isSignUp && (
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-sm font-semibold">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              defaultValue={state?.name}
              required
              className="input input-bordered w-full"
            />
          </div>
        )}

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

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-semibold">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isSignUp ? "new-password" : "current-password"}
            minLength={isSignUp ? 8 : undefined}
            required
            className="input input-bordered w-full"
          />
          {isSignUp ? (
            <p className="text-xs text-base-content/60">
              At least 8 characters.
            </p>
          ) : (
            <Link
              href="/auth/forgot-password"
              className="link link-primary self-end text-xs"
            >
              Forgot password?
            </Link>
          )}
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
          {isPending
            ? isSignUp
              ? "Creating account..."
              : "Signing in..."
            : isSignUp
              ? "Create account"
              : "Sign in"}
        </button>

        <p className="text-center text-sm text-base-content/70">
          {isSignUp ? "Already have an account? " : "No account yet? "}
          <Link
            href={isSignUp ? "/auth/sign-in" : "/auth/sign-up"}
            className="link link-primary"
          >
            {isSignUp ? "Sign in" : "Create one"}
          </Link>
        </p>
      </form>
    </div>
  );
}
