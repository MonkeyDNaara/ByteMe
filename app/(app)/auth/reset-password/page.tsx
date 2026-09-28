import type { Metadata } from "next";

import Link from "next/link";

import { AuthCard } from "../AuthShell";
import ResetPasswordForm from "./ResetPasswordForm";

export const metadata: Metadata = {
  title: "Choose a new password",
};

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <AuthCard emoji="🧐">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">This link doesn&apos;t work</h1>
        <p className="text-[15px] leading-relaxed text-base-content/70">
          The password reset link is missing its token or has already been used. No problem — just request a new one.
        </p>
        <Link href="/auth/forgot-password" className="btn btn-primary h-13 w-full rounded-full text-base font-bold">
          Request a new link
        </Link>
        <Link href="/auth/sign-in" className="text-center text-sm font-semibold text-link hover:underline">
          ← Back to sign in
        </Link>
      </AuthCard>
    );
  }

  return <ResetPasswordForm token={token} />;
}
