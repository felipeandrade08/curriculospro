import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Importar currículo antigo",
  description:
    "Envie seu currículo em PDF ou Word e nós separamos nome, experiências, formação e cursos para você só conferir e atualizar.",
  alternates: { canonical: "/importar" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
