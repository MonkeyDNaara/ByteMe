import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AuthForm from "../AuthForm";
import { auth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in",
};

type SignInPageProps = {
  searchParams: Promise<{ reset?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { data: session } = await auth.getSession();
  if (session?.user) redirect("/");

  const { reset } = await searchParams;
  const notice =
    reset === "success"
      ? "Your password has been updated. Sign in with your new password."
      : undefined;

  return <AuthForm mode="sign-in" notice={notice} />;
}
