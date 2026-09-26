import type { ReactNode } from "react";

// Focus layout for cooking mode: no header, no footer, no distractions.
// The (focus) folder is a route group -- it doesn't appear in the URL.
export default function FocusLayout({ children }: { children: ReactNode }) {
  return <div className="flex min-h-dvh flex-1 flex-col bg-base-100">{children}</div>;
}
