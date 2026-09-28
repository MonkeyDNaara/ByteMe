import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AuthForm from "../AuthForm";
import { getSafeNext } from "@/lib/auth/safeNext";
import { auth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in",
};

type SignInPageProps = {
  searchParams: Promise<{ reset?: string; next?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { reset, next: rawNext } = await searchParams;
  const next = getSafeNext(rawNext);

  const { data: session } = await auth.getSession();
  if (session?.user) redirect(next);

  const notice =
    reset === "success"
      ? "Your password has been updated. Sign in with your new one."
      : undefined;

  return <AuthForm mode="sign-in" notice={notice} next={next} />;
}
