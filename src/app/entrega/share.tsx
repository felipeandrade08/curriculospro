"use client";
import { useState } from "react";
import { ShareNetwork, WhatsappLogo } from "@phosphor-icons/react";

/**
 * "Enviar para uma empresa": no celular, compartilha o próprio arquivo PDF (abre o WhatsApp com o anexo);
 * sem esse recurso, abre o WhatsApp com o link da página.
 */
export function DeliveryShare({ pdfUrl, fileName, name }: { pdfUrl: string; fileName: string; name: string }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const text = `Olá! Segue meu currículo${name ? " (" + name.trim() + ")" : ""}. Fico à disposição para uma entrevista.`;

  const share = async () => {
    setBusy(true);
    setMsg("");
    try {
      const blob = await fetch(pdfUrl).then((r) => {
        if (!r.ok) throw new Error("pdf");
        return r.blob();
      });
      const file = new File([blob], fileName, { type: "application/pdf" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text });
        return;
      }
      // Computador: baixa o PDF e abre o WhatsApp Web com a mensagem para anexar.
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = fileName;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank", "noopener");
      setMsg("Baixamos o PDF. No WhatsApp, escolha a conversa e anexe o arquivo.");
    } catch (error) {
      if ((error as Error)?.name !== "AbortError") setMsg("Não deu para preparar o arquivo. Baixe o PDF e envie.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="dl-share">
      <button type="button" className="btn btn-wa btn-lg" onClick={share} disabled={busy}>
        <WhatsappLogo size={22} weight="fill" aria-hidden="true" />
        {busy ? "Preparando…" : "Enviar o PDF pelo WhatsApp"}
      </button>
      {msg && <small role="status">{msg}</small>}
      <span className="dl-share-hint" aria-hidden="true">
        <ShareNetwork size={14} /> também funciona para e-mail e outros apps
      </span>
    </div>
  );
}
