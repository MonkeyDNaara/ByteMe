"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";

import { withNext } from "@/lib/auth/safeNext";

type AuthLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  page: "/auth/sign-in" | "/auth/sign-up";
};

/** Sign-in / sign-up link that brings the user back to the current page afterwards. */
export default function AuthLink({ page, ...props }: AuthLinkProps) {
  const pathname = usePathname();
  return <Link href={withNext(page, pathname)} {...props} />;
}
