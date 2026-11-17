import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seu currículo combina com a vaga? Compare grátis",
  description:
    "Cole o anúncio da vaga e veja na hora o que ela pede, o que já está no seu currículo e o que melhorar antes de enviar.",
  alternates: { canonical: "/adaptar-vaga" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
