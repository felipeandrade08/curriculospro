"use client";
import { WhatsappLogo } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { plainRole, readActiveResume } from "@/lib/active-resume";
import { JOB_TARGET_KEY } from "@/lib/resume";
import {
  emailBody,
  emailSubject,
  followUpMessage,
  linkedinMessage,
  thanksMessage,
  whatsappMessage,
  type SendInput,
} from "@/lib/send-messages";
import { trackUsage } from "@/lib/analytics";

type Tab = "whatsapp" | "email" | "linkedin" | "acompanhar" | "agradecer";
const TABS: [Tab, string][] = [
  ["whatsapp", "WhatsApp"],
  ["email", "E-mail"],
  ["linkedin", "LinkedIn"],
  ["acompanhar", "Cobrar retorno"],
  ["agradecer", "Agradecer entrevista"],
];

export default function SendPage() {
  const [input, setInput] = useState<SendInput>({ name: "", role: "", company: "", recruiter: "", pitch: "" });
  const [tab, setTab] = useState<Tab>("whatsapp");
  const [phone, setPhone] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    const cv = readActiveResume();
    let role = "",
      company = "";
    try {
      const job = JSON.parse(localStorage.getItem(JOB_TARGET_KEY) || "null");
      role = job?.title || "";
      company = job?.company || "";
    } catch {}
    const skills = cv?.skills.slice(0, 2) || [];
    const exp = cv?.experiences.find((x) => x.title);
    const pitch = exp
      ? `Tenho experiência como ${plainRole(exp.title).toLowerCase()}` +
        (skills.length ? ` e facilidade com ${skills.join(" e ")}.` : ".")
      : skills.length
        ? `Tenho facilidade com ${skills.join(" e ")} e muita vontade de aprender.`
        : "";
    setInput({ name: cv?.name || "", role: role || plainRole(cv?.role || ""), company, recruiter: "", pitch });
  }, []);

  const set = (k: keyof SendInput, v: string) => setInput((x) => ({ ...x, [k]: v }));
  const text =
    tab === "whatsapp"
      ? whatsappMessage(input)
      : tab === "email"
        ? emailBody(input)
        : tab === "linkedin"
          ? linkedinMessage(input)
          : tab === "acompanhar"
            ? followUpMessage(input)
            : thanksMessage(input);

  const copy = async (value: string, what: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(what);
      trackUsage("send_message_copied");
      window.setTimeout(() => setCopied(""), 2000);
    } catch {}
  };
  const digits = phone.replace(/\D/g, "");
  const waNumber = digits ? (digits.length <= 11 ? "55" + digits : digits) : "";
  const waHref = "https://wa.me/" + waNumber + "?text=" + encodeURIComponent(text);
  const mailHref =
    "mailto:?subject=" + encodeURIComponent(emailSubject(input)) + "&body=" + encodeURIComponent(emailBody(input));

  return (
    <main className="ms">
      <SiteHeader />
      <section className="ms-head shell">
        <h1>Mensagem pronta para enviar seu currículo</h1>
        <p>Preencha a vaga e copie a mensagem certa para cada canal. Depois é só anexar o PDF.</p>
      </section>
      <section className="ms-grid shell">
        <form className="ms-form" onSubmit={(e) => e.preventDefault()}>
          <label>
            <span>Seu nome</span>
            <input value={input.name} onChange={(e) => set("name", e.target.value)} placeholder="Maria Silva" />
          </label>
          <label>
            <span>Cargo da vaga</span>
            <input value={input.role} onChange={(e) => set("role", e.target.value)} placeholder="Auxiliar Administrativo" />
          </label>
          <label>
            <span>Empresa (opcional)</span>
            <input value={input.company} onChange={(e) => set("company", e.target.value)} placeholder="Empresa XYZ" />
          </label>
          <label>
            <span>Nome do recrutador (opcional)</span>
            <input value={input.recruiter} onChange={(e) => set("recruiter", e.target.value)} placeholder="Ana" />
          </label>
          <label>
            <span>Uma frase sobre você</span>
            <textarea
              rows={3}
              value={input.pitch}
              onChange={(e) => set("pitch", e.target.value)}
              placeholder="Tenho 2 anos de experiência com rotinas de escritório e Excel."
            />
          </label>
        </form>
        <div className="ms-out">
          <div className="ms-tabs" role="tablist" aria-label="Tipo de mensagem">
            {TABS.map(([id, label]) => (
              <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}>
                {label}
              </button>
            ))}
          </div>
          {tab === "email" && (
            <div className="ms-subject">
              <span>Assunto</span>
              <b>{emailSubject(input)}</b>
              <button type="button" onClick={() => copy(emailSubject(input), "subject")}>
                {copied === "subject" ? "Copiado ✓" : "Copiar assunto"}
              </button>
            </div>
          )}
          <pre className="ms-text">{text}</pre>
          <div className="ms-actions">
            <button type="button" className="btn btn-primary" onClick={() => copy(text, "text")}>
              {copied === "text" ? "Copiado ✓" : "Copiar mensagem"}
            </button>
            {(tab === "whatsapp" || tab === "acompanhar" || tab === "agradecer") && (
              <>
                <input
                  className="ms-phone"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="WhatsApp da vaga (opcional)"
                  aria-label="Número de WhatsApp da vaga"
                />
                <a className="btn btn-ghost" href={waHref} target="_blank" rel="noopener noreferrer">
                  <WhatsappLogo size={18} weight="fill" aria-hidden="true" /> Abrir no WhatsApp
                </a>
              </>
            )}
            {tab === "email" && (
              <a className="btn btn-ghost" href={mailHref}>
                Abrir no e-mail
              </a>
            )}
          </div>
          <p className="ms-note">
            No WhatsApp, mande a mensagem primeiro e o PDF logo depois. No e-mail, anexe o PDF com o nome
            “Curriculo-{(input.name || "Seu-Nome").trim().split(/\s+/).slice(0, 2).join("-")}.pdf”.
          </p>
          <p className="ms-note">
            Enviou? <Link href="/candidaturas">Anote nas suas candidaturas</Link> para lembrar de cobrar o
            retorno.
          </p>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
