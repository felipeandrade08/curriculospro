import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Perfil Profissional",
  description: "Registre sua trajetória uma vez e reutilize em vários currículos.",
  alternates: { canonical: "/perfil-profissional" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
