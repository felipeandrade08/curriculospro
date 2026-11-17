import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fazemos seu currículo para você",
  description:
    "Envie suas informações e nossa equipe monta um currículo profissional em até 24 horas. Incluído no acesso de R$ 9,90.",
  alternates: { canonical: "/feito-para-voce" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
