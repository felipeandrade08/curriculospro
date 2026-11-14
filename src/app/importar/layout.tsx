import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Importar currículo",
  description: "Traga seu currículo antigo e continue editando sem começar do zero.",
  alternates: { canonical: "/importar" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
