import "@neondatabase/auth-ui/css";
import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/lora";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource-variable/bricolage-grotesque";
import "./globals.css";
import "./resume.css";
import "./site.css";
import "./start.css";
import "./community.css";
import { SITE_URL } from "@/lib/site";
import { Providers } from "./providers";
import { UsageBeacon } from "@/components/usage-beacon";
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "CurriculosPRO — Seu currículo profissional", template: "%s | CurriculosPRO" },
  description:
    "Crie seu currículo profissional online com modelos modernos e editor guiado. Edite grátis e baixe em PDF por R$ 9,90 com 7 dias de acesso.",
  applicationName: "CurriculosPRO",
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "CurriculosPRO",
    title: "CurriculosPRO — Seu currículo profissional",
    description: "Crie, organize e exporte currículos profissionais com modelos modernos.",
    url: "/",
  },
  robots: { index: true, follow: true },
  icons: { icon: "/brand/icon.png", shortcut: "/brand/icon.png", apple: "/brand/icon.png" },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <UsageBeacon />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
