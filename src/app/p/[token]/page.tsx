import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { loadPayPage } from "@/lib/server/pay-page";
import { payToken, verifyPayToken } from "@/lib/server/pay-link";
import { PayView } from "./pay-view";
import "../pay.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pagamento por Pix",
  description: "Copie o código Pix e pague no app do seu banco.",
  robots: { index: false, follow: false },
};

/** Página de pagamento das cobranças do painel: copiar o Pix com um toque e ver a confirmação sozinha. */
export default async function PayPage({ params }: { params: Promise<{ token: string }> }) {
  const token = (await params).token;
  const id = verifyPayToken(token);
  if (!id) notFound();
  const page = await loadPayPage(id);
  if (!page) notFound();
  // Pix vencido e renovado no painel: leva direto para o código novo.
  if (page.replacedBy && page.status !== "approved") redirect("/p/" + payToken(page.replacedBy));
  return <PayView token={token} page={page} />;
}
