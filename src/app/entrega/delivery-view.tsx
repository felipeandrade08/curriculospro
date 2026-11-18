import type { Metadata } from "next";
import Link from "next/link";
import { WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ResumeThumb } from "@/components/resume-view";
import { SERVICE_SUPPORT_DAYS } from "@/lib/billing";
import { defaultOrder } from "@/lib/resume";
import { loadDelivery, verifyDeliveryToken, DELIVERY_LINK_DAYS } from "@/lib/server/delivery";
import { COMPANY, SUPPORT_WHATSAPP_URL } from "@/lib/site";
import { DeliveryShare } from "./share";

const supportNumber = "55" + COMPANY.phone.replace(/\D/g, "");

/** Título e prévia do link quando ele é colado no WhatsApp. */
export async function deliveryMetadata(token: string): Promise<Metadata> {
  const check = verifyDeliveryToken(token);
  const delivery = "id" in check ? await loadDelivery(check.id).catch(() => null) : null;
  const first = delivery?.name.trim().split(/\s+/)[0] || "";
  const title = first ? `${first}, seu currículo está pronto ✅` : "Seu currículo está pronto ✅";
  const description = "Toque para ver e baixar em PDF ou Word. Feito pela equipe CurriculosPRO.";
  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: { title, description, type: "website", siteName: "CurriculosPRO", locale: "pt_BR" },
    twitter: { card: "summary_large_image", title, description },
  };
}

/** Página de entrega do "Fazemos para você": baixar, enviar para empresas e pedir ajuste, sem login. */
export async function DeliveryView({ token }: { token: string }) {
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
              ? `Os links de entrega valem ${DELIVERY_LINK_DAYS} dias. Fale com a gente que enviamos de novo.`
              : "Confira se o link foi copiado inteiro, ou fale com a gente que enviamos de novo."}
          </p>
          <a className="btn btn-primary btn-wa" href={SUPPORT_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
            <WhatsappLogo size={20} weight="fill" aria-hidden="true" /> Falar no WhatsApp
          </a>
          <Link className="btn btn-ghost" href="/curriculos">
            Entrar em Meus currículos
          </Link>
        </section>
        <SiteFooter />
      </main>
    );

  const r = delivery.resume;
  const first = delivery.name.trim().split(/\s+/)[0];
  const supportUntil = new Date(new Date(delivery.deliveredAt).getTime() + SERVICE_SUPPORT_DAYS * 86_400_000);
  const supportOpen = supportUntil.getTime() > Date.now();
  const until = supportUntil.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "America/Sao_Paulo" });
  const adjustUrl =
    "https://wa.me/" +
    supportNumber +
    "?text=" +
    encodeURIComponent(
      `Olá! Sou ${delivery.name || "cliente"} (pedido #${delivery.requestId}) e quero um ajuste no meu currículo: `,
    );
  const fileName = "Curriculo-" + (delivery.name || r.cv.name || "CurriculosPRO").trim().replace(/\s+/g, "-") + ".pdf";

  return (
    <main className="lp">
      <SiteHeader />
      <section className="wrap dl">
        <div className="dl-info">
          <span className="dl-badge">✓ Feito pela equipe CurriculosPRO</span>
          <h1>{first ? `${first}, seu currículo está pronto!` : "Seu currículo está pronto!"}</h1>
          {delivery.note && (
            <p className="dl-note">
              <b>Recado da equipe:</b> {delivery.note}
            </p>
          )}

          <ol className="dl-steps">
            <li>
              <b>Baixe o seu currículo</b>
              <div className="dl-actions">
                <a className="btn btn-primary btn-lg" href={`/api/entrega/${token}/pdf`}>
                  Baixar em PDF
                </a>
                <a className="btn btn-ghost btn-lg" href={`/api/entrega/${token}/docx`}>
                  Baixar em Word
                </a>
              </div>
              <small>O PDF é o melhor para enviar. O Word serve para sites que pedem esse formato.</small>
            </li>
            <li>
              <b>Envie para as empresas</b>
              <DeliveryShare pdfUrl={`/api/entrega/${token}/pdf`} fileName={fileName} name={delivery.name} />
              <small>
                No celular, o botão abre o WhatsApp com o arquivo do currículo pronto para mandar ao recrutador.
              </small>
            </li>
            <li>
              <b>Quer mudar alguma coisa?</b>
              {supportOpen ? (
                <>
                  <a className="btn btn-wa" href={adjustUrl} target="_blank" rel="noopener noreferrer">
                    <WhatsappLogo size={20} weight="fill" aria-hidden="true" /> Pedir ajuste no WhatsApp
                  </a>
                  <small>
                    Você tem suporte para ajustes até <b>{until}</b>. É só dizer o que quer mudar.
                  </small>
                </>
              ) : (
                <>
                  <a className="btn btn-ghost" href={SUPPORT_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                    <WhatsappLogo size={20} weight="fill" aria-hidden="true" /> Falar com a gente
                  </a>
                  {delivery.inAccount && (
                    <small>
                      Ou edite você mesmo em <Link href="/curriculos">Meus currículos</Link>.
                    </small>
                  )}
                </>
              )}
            </li>
          </ol>

          <div className="dl-next">
            <b>Próximo passo</b>
            <p>
              Antes de enviar, <Link href="/adaptar-vaga">compare com a vaga</Link> e pegue a{" "}
              <Link href="/enviar-curriculo">mensagem pronta para mandar junto</Link>.
            </p>
          </div>
        </div>
        {[
          { width: 520, cls: "dl-paper dl-paper-wide" },
          { width: 340, cls: "dl-paper dl-paper-narrow" },
        ].map((v) => (
          <div key={v.width} className={v.cls} aria-label="Prévia do currículo">
            <ResumeThumb
              width={v.width}
              cv={r.cv}
              template={r.template}
              accent={r.accent}
              density={r.density}
              sections={(r.sectionOrder.length ? r.sectionOrder : defaultOrder).filter((x) => !r.hidden.includes(x))}
            />
          </div>
        ))}
      </section>
      <SiteFooter />
    </main>
  );
}
