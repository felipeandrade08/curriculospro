import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meus currículos",
  description: "Organize, duplique e sincronize seus currículos.",
  robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
