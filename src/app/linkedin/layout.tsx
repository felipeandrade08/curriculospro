import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Perfil do LinkedIn a partir do currículo: título e Sobre prontos",
  description:
    "Gere o título, o texto do Sobre e as experiências do seu LinkedIn a partir do seu currículo. Copie e cole, com checklist para um perfil completo.",
  alternates: { canonical: "/linkedin" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
