import type { Metadata } from "next";
import { PdfRender } from "./render";

// Página usada só pelo gerador de PDF no servidor (navegador sem tela). Não aparece no site.
export const metadata: Metadata = { title: "PDF", robots: { index: false, follow: false } };

export default function Page() {
  return <PdfRender />;
}
