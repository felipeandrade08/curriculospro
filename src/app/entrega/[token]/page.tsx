import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ResumeThumb } from "@/components/resume-view";
import { defaultOrder } from "@/lib/resume";
import { loadDelivery, verifyDeliveryToken, DELIVERY_LINK_DAYS } from "@/lib/server/delivery";
import { SUPPORT_WHATSAPP_URL } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Seu currículo está pronto", robots: { index: false, follow: false } };

/** Página de entrega do "Fazemos para você": baixar sem precisar entrar na conta. */
export default async function DeliveryPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const check = verifyDeliveryToken(token);
  const delivery = "id" in check ? await loadDelivery(check.id).catch(() => null) : null;

  if (!delivery)
    return (
      <main className="lp">
        <SiteHeader />
        <section className="pay-card shell">
          <h1>{"error" in check && check.error === "expired" ? "Este link expirou" : "Link não encontrado"}</h1>
          <p>
            {"error" in check && check.error === "expired"
              ? `Os links de entrega valem ${DELIVERY_LINK_DAYS} dias. Seu currículo continua salvo na sua conta.`
              : "Confira se o link foi copiado inteiro. Seu currículo também fica salvo na sua conta."}
          </p>
          <Link className="btn btn-primary" href="/curriculos">
            Entrar em Meus currículos
          </Link>
          <a className="btn btn-ghost" href={SUPPORT_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
            Falar no WhatsApp
          </a>
        </section>
        <SiteFooter />
      </main>
    );

  const r = delivery.resume;
  const first = delivery.name.trim().split(/\s+/)[0];
  return (
    <main className="lp">
      <SiteHeader />
      <section className="wrap dl">
        <div className="dl-info">
          <span className="dl-badge">Feito pela equipe CurriculosPRO</span>
          <h1>{first ? `${first}, seu currículo está pronto!` : "Seu currículo está pronto!"}</h1>
          {delivery.note && (
            <p className="dl-note">
              <b>Recado da equipe:</b> {delivery.note}
            </p>
          )}
          <div className="dl-actions">
            {delivery.pdf && (
              <a className="btn btn-primary btn-lg" href={`/api/entrega/${token}/pdf`}>
                Baixar em PDF
              </a>
            )}
            <a className={"btn btn-lg " + (delivery.pdf ? "btn-ghost" : "btn-primary")} href={`/api/entrega/${token}/docx`}>
              Baixar em Word
            </a>
          </div>
          <p className="dl-small">
            O PDF é o melhor para enviar às empresas. O Word serve para sites de vagas que pedem esse formato.
          </p>
          <div className="dl-next">
            <b>Quer mudar alguma coisa?</b>
            <p>
              O currículo também está salvo em <Link href="/curriculos">Meus currículos</Link>. Entre com a conta
              que você usou no pedido para editar e baixar de novo.
            </p>
            <b>Próximo passo</b>
            <p>
              Antes de enviar, <Link href="/adaptar-vaga">compare com a vaga</Link> e pegue a{" "}
              <Link href="/enviar-curriculo">mensagem pronta para enviar</Link>.
            </p>
          </div>
        </div>
        <div className="dl-paper" aria-label="Prévia do currículo">
          <ResumeThumb
            width={520}
            cv={r.cv}
            template={r.template}
            accent={r.accent}
            density={r.density}
            sections={(r.sectionOrder.length ? r.sectionOrder : defaultOrder).filter((s) => !r.hidden.includes(s))}
          />
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
