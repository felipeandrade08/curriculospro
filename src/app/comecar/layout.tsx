import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Criar currículo",
  description:
    "Importe seu currículo antigo, use um exemplo pronto da sua profissão ou comece do zero com ajuda passo a passo.",
  alternates: { canonical: "/comecar" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
