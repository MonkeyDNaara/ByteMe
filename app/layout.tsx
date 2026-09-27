import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Header from "./components/Header";
import Footer from "./components/Footer";
import { auth } from "@/lib/auth/server";
import { canCreateRecipes } from "@/dbQueries";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "byteMe",
    template: "%s | byteMe",
  },
  description: "Discover, save and share recipes",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { data: session } = await auth.getSession();
  const user = session?.user ? { name: session.user.name } : null;
  const canCreate = session?.user
    ? await canCreateRecipes(session.user.id)
    : false;

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      {/* overflow-x-hidden guards against full-bleed sections that break out
          of their container with a `100vw` width trick (e.g. the homepage's
          welcome banner) -- viewport-width vs. scrollbar-width mismatches on
          some browsers can otherwise introduce a page-wide horizontal
          scrollbar. */}
      <body className="flex min-h-full flex-col overflow-x-hidden">
        <Header user={user} canCreateRecipes={canCreate} />

        <div className="relative flex flex-1 flex-col">
          <main className="flex-1">{children}</main>

          <Footer user={user} canCreateRecipes={canCreate} />
        </div>
      </body>
    </html>
  );
}
