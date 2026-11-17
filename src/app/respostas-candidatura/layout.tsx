import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Respostas para perguntas de candidatura: Gupy, Indeed e formulários",
  description:
    "Monte respostas para “Fale sobre você”, “Por que você quer trabalhar aqui?”, pretensão salarial e outras perguntas dos formulários de vagas, a partir do seu currículo.",
  alternates: { canonical: "/respostas-candidatura" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
