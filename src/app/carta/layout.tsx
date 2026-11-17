import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Carta de apresentação",
  description: "Monte sua carta de apresentação a partir do currículo, escolha o tom e baixe em PDF.",
  alternates: { canonical: "/carta" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
