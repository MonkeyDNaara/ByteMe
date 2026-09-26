"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/lib/auth/server";

// email/name are echoed back so the form can refill them after a failed
// attempt (React clears uncontrolled fields once an action finishes).
export type AuthState = { error: string; email?: string; name?: string } | null;

const signInSchema = z.object({
  email: z.string().trim().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const signUpSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const requestPasswordResetSchema = z.object({
  email: z.string().trim().email("Please enter a valid email"),
});

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  token: z.string().min(1, "This reset link is invalid or has expired"),
});

// Neon Auth needs an absolute URL to build the link it emails, so we derive
// the site's own origin from the incoming request rather than hardcoding it
// -- this way the same code works against localhost in dev and the real
// domain once deployed, with no env var to keep in sync.
async function getOrigin(): Promise<string> {
  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  return `${protocol}://${host}`;
}

export async function signIn(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "");
  const parsed = signInSchema.safeParse({
    email,
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input", email };
  }

  const { error } = await auth.signIn.email(parsed.data);
  if (error) return { error: error.message ?? "Could not sign in", email };

  redirect("/");
}

export async function signUp(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const name = String(formData.get("name") ?? "");
  const email = String(formData.get("email") ?? "");
  const parsed = signUpSchema.safeParse({
    name,
    email,
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid input",
      name,
      email,
    };
  }

  const { error } = await auth.signUp.email(parsed.data);
  if (error) {
    return { error: error.message ?? "Could not create account", name, email };
  }

  redirect("/");
}

export async function signOut(): Promise<void> {
  await auth.signOut();
  redirect("/");
}

// email is echoed back so the form can refill it after a failed attempt, the
// same reasoning as AuthState above.
export type RequestPasswordResetState = { error?: string; success?: boolean; email?: string } | null;

export async function requestPasswordReset(
  _prevState: RequestPasswordResetState,
  formData: FormData,
): Promise<RequestPasswordResetState> {
  const email = String(formData.get("email") ?? "");
  const parsed = requestPasswordResetSchema.safeParse({ email });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input", email };
  }

  const origin = await getOrigin();
  await auth.requestPasswordReset({
    email: parsed.data.email,
    redirectTo: `${origin}/auth/reset-password`,
  });

  // Always report success, whether or not that email actually has an
  // account -- otherwise this form could be used to check who's registered.
  return { success: true, email: parsed.data.email };
}

export type ResetPasswordState = { error: string } | null;

export async function resetPassword(
  _prevState: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    token: formData.get("token"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { error } = await auth.resetPassword({
    newPassword: parsed.data.password,
    token: parsed.data.token,
  });
  if (error) {
    return { error: error.message ?? "Could not reset your password" };
  }

  redirect("/auth/sign-in?reset=success");
}
