import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ToastProvider } from "./components/toast/ToastProvider";

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

// The ROOT layout is shared by every page, so it only holds what truly all
// pages need: <html>, fonts, toasts and the @modal slot. The header/footer
// live in app/(app)/layout.tsx, so cooking mode in app/(focus) can go without
// them -- route groups "(name)" organize folders without changing the URL.
//
// `modal` is the @modal parallel route slot (app/@modal): it renders next to
// the page, which is how a recipe can open as a modal on top of a list.
export default function RootLayout({ children, modal }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col overflow-x-hidden">
        {/* A Client Component provider can wrap Server Components: they're
            passed in as already-rendered `children`. */}
        <ToastProvider>
          {children}
          {modal}
        </ToastProvider>
      </body>
    </html>
  );
}
