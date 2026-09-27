import type { ReactNode } from "react";

import ModalShell from "@/app/components/recipe-details/ModalShell";

// The dialog lives in the layout, so it stays open (no flicker) while
// loading.tsx is replaced by page.tsx.
export default function RecipeModalLayout({ children }: { children: ReactNode }) {
  return <ModalShell>{children}</ModalShell>;
}
