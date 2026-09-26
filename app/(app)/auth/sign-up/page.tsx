import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AuthForm from "../AuthForm";
import { auth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create account",
};

export default async function SignUpPage() {
  const { data: session } = await auth.getSession();
  if (session?.user) redirect("/");

  return <AuthForm mode="sign-up" />;
}
