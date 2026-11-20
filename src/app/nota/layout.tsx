import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nota do currículo para a vaga: cole a vaga e veja sua nota grátis",
  description:
    "Cole o anúncio da vaga, envie seu currículo e veja uma nota de 0 a 10 com o motivo de cada ponto perdido. Grátis, sem cadastro, e o arquivo não sai do seu aparelho.",
  alternates: { canonical: "/nota" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
