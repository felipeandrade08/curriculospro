import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Treino de entrevista de emprego: perguntas e como responder",
  description:
    "Treine as perguntas mais comuns de entrevista de emprego, com dicas de resposta por área e uma apresentação pessoal montada a partir do seu currículo.",
  alternates: { canonical: "/entrevista" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
