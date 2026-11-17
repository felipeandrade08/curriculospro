import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Minhas candidaturas",
  description: "Anote as vagas para as quais você enviou currículo, acompanhe o status e saiba quando cobrar retorno.",
  alternates: { canonical: "/candidaturas" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
