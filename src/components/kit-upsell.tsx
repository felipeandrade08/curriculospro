"use client";
import { useKitGate } from "@/components/kit-gate";
import { useTeam } from "@/components/team-flag";
import { KIT_NAME, UPGRADE_PRICE_LABEL, formatAccessUntil } from "@/lib/billing";

/** Em Meus currículos: convida quem tem o Currículo a completar para o Kit, ou mostra até quando o Kit vale. */
export function KitUpsell() {
  const gate = useKitGate("/curriculos");
  const { access } = gate;
  const team = useTeam();
  if (team || access.loading || !access.signedIn) return null;
  if (access.kit)
    return (
      <p className="ku-on">
        <b>{KIT_NAME} ativo</b>
        {access.kitUntil ? ` até ${formatAccessUntil(access.kitUntil)}` : ""}. Todas as ferramentas abaixo estão
        liberadas.
      </p>
    );
  if (!access.active) return null;
  return (
    <section className="ku">
      <div>
        <b>Complete com o {KIT_NAME} por mais {UPGRADE_PRICE_LABEL}</b>
        <p>
          LinkedIn pronto, respostas para a candidatura, dados prontos para Gupy, Indeed e Infojobs, dicas para
          cada vaga e correção das respostas da entrevista. O acesso passa a completar 30 dias.
        </p>
      </div>
      <button type="button" className="btn btn-primary" onClick={gate.ask}>
        Liberar por {UPGRADE_PRICE_LABEL}
      </button>
      {gate.modal}
    </section>
  );
}
