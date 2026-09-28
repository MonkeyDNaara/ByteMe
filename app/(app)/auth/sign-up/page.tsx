import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AuthForm from "../AuthForm";
import { getSafeNext } from "@/lib/auth/safeNext";
import { auth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create account",
};

type SignUpPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const next = getSafeNext((await searchParams).next);

  const { data: session } = await auth.getSession();
  if (session?.user) redirect(next);

  return <AuthForm mode="sign-up" next={next} />;
}
