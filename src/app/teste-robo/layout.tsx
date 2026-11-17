import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teste grátis: o robô de seleção consegue ler seu currículo?",
  description:
    "Envie seu currículo em PDF ou Word e veja o que uma leitura automática, parecida com a dos sistemas de triagem, consegue extrair. Grátis, e o arquivo não sai do seu aparelho.",
  alternates: { canonical: "/teste-robo" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
