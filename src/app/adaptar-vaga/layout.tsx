import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Adaptar para uma vaga",
  description: "Compare seu perfil com a descrição da vaga sem inventar informações.",
  robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
