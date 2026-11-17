import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mensagem para enviar currículo por WhatsApp e e-mail",
  description:
    "Gere na hora a mensagem certa para enviar seu currículo por WhatsApp, e-mail ou LinkedIn, além de mensagens de acompanhamento e agradecimento.",
  alternates: { canonical: "/enviar-curriculo" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
