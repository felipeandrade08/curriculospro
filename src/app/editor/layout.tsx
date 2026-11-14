import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editor de currículo",
  description: "Monte seu currículo com editor guiado e prévia em tempo real.",
  robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
