import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Enviar feedback",
  description: "Conte o que achou do CurriculosPRO.",
  robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
