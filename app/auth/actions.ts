"use server";

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
