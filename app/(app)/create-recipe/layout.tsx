import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Recipe",
};

export default function CreateRecipeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
