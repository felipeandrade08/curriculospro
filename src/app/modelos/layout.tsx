import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Modelos de currículo",
  description: "Modelos de currículo profissionais e modernos para preencher online.",
  alternates: { canonical: "/modelos" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
