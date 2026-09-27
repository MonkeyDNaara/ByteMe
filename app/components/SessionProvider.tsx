"use client";

import { createContext, useContext, type ReactNode } from "react";

// The signed-in user's id, as the SERVER sees it (from the session cookie).
//
// Why not `authClient.useSession()`? That hook keeps its own client-side copy
// of the session and only refreshes it on a full page load. Our sign-in /
// sign-out run as server actions, so the cookie changed but that copy didn't:
// hearts, 🛒 and the nav badge showed the OLD user until F5.
// The root layout re-renders on the server after every sign-in/out, so this
// value is always current -- one source of truth.
const SessionContext = createContext<string | null>(null);

export function SessionProvider({ userId, children }: { userId: string | null; children: ReactNode }) {
  return <SessionContext value={userId}>{children}</SessionContext>;
}

/** The signed-in user's id, or `null` when signed out. */
export function useSessionUserId(): string | null {
  return useContext(SessionContext);
}
