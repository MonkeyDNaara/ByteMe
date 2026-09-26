import type { Metadata } from "next";

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
      <div className="mx-auto flex max-w-md flex-col gap-2 px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Invalid reset link
        </h1>
        <p className="text-sm text-base-content/70">
          This password reset link is missing its token, or has already been
          used. Request a new one from the sign-in page.
        </p>
      </div>
    );
  }

  return <ResetPasswordForm token={token} />;
}
