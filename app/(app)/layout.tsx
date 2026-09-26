import type { ReactNode } from "react";

import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import { canCreateRecipes } from "@/dbQueries";
import { auth } from "@/lib/auth/server";

// Layout for every "normal" page: header on top, footer at the bottom.
// The (app) folder is a route group -- it doesn't appear in the URL.
export default async function AppLayout({ children }: { children: ReactNode }) {
  const { data: session } = await auth.getSession();
  const user = session?.user ? { name: session.user.name } : null;
  const canCreate = session?.user ? await canCreateRecipes(session.user.id) : false;

  return (
    <>
      <Header user={user} canCreateRecipes={canCreate} />

      <div className="relative flex flex-1 flex-col">
        <main className="flex-1">{children}</main>

        <Footer user={user} canCreateRecipes={canCreate} />
      </div>
    </>
  );
}
