"use client";
import { WhatsappLogo } from "@phosphor-icons/react";
import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CheckoutModal } from "@/components/checkout-modal";
import { useAccess } from "@/lib/use-access";
import { trackUsage } from "@/lib/analytics";
import { ACCESS_DAYS, ACCESS_PRICE_LABEL, SERVICE_SUPPORT_DAYS, formatAccessUntil } from "@/lib/billing";
import { ACTIVE_RESUME_KEY, RESUME_LIBRARY_KEY, type ResumeDocument } from "@/lib/resume";
import { readLibrary } from "@/lib/start";
import { readResumeFile } from "@/lib/import/read-file";
import { COMPANY, SUPPORT_WHATSAPP_URL } from "@/lib/site";

const MAX_FILES = 3;
const MAX_BYTES = 4 * 1024 * 1024;

/** Reduz fotos do celular (que costumam ter 5 a 10 MB) para um JPEG legível de até ~2000 px. */
async function shrinkImage(file: File): Promise<File> {
  if (file.size < 1_200_000) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/jpeg", 0.85));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.[a-z0-9]+$/i, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}

type Req = {
  id: string;
  status: "new" | "in_progress" | "delivered" | "cancelled";
  data: { role: string; name: string };
  createdAt: string;
  deliveredAt: string | null;
  adminNote: string | null;
  downloadUrl: string | null;
};

const STATUS: Record<Req["status"], string> = {
  new: "Recebido — na fila da equipe",
  in_progress: "Em produção",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

const dateTime = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  });

export default function DoneForYouPage() {
  const { access, unlock } = useAccess();
  const [requests, setRequests] = useState<Req[]>([]);
  const [library, setLibrary] = useState<ResumeDocument[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    whatsapp: "",
    role: "",
    city: "",
    notes: "",
    sourceText: "",
    resumeId: "",
    delivery: "email" as "email" | "whatsapp",
  });
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [extracted, setExtracted] = useState("");
  const [fileMsg, setFileMsg] = useState("");
  const [warning, setWarning] = useState("");

  const load = useCallback(async () => {
    const r = await fetch("/api/servico", { cache: "no-store" }).catch(() => null);
    if (r?.ok) setRequests((await r.json()).requests || []);
  }, []);

  useEffect(() => {
    const docs = readLibrary();
    setLibrary(docs);
    const first = docs[0]?.cv;
    if (first)
      setForm((f) => ({
        ...f,
        name: f.name || first.name,
        role: f.role || first.role,
        city: f.city || first.city,
        whatsapp: f.whatsapp || first.phone,
        resumeId: docs[0].id,
      }));
  }, []);

  useEffect(() => {
    if (access.signedIn) void load();
  }, [access.signedIn, load]);

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm({ ...form, [k]: e.target.value });

  const pickFiles = async (list: FileList | null) => {
    setFileMsg("");
    if (!list?.length) return;
    const next = [...files];
    for (const raw of Array.from(list)) {
      if (next.length >= MAX_FILES) {
        setFileMsg(`Envie no máximo ${MAX_FILES} arquivos.`);
        break;
      }
      const isImage = raw.type.startsWith("image/");
      const isDoc = /\.(pdf|docx)$/i.test(raw.name);
      if (!isImage && !isDoc) {
        setFileMsg("Envie PDF, Word (.docx) ou foto do currículo.");
        continue;
      }
      const file = isImage ? await shrinkImage(raw) : raw;
      if (file.size > MAX_BYTES) {
        setFileMsg(`“${raw.name}” passa de 4 MB. Tente exportar de novo ou mande por WhatsApp.`);
        continue;
      }
      next.push(file);
      // Lê o texto do PDF ou Word aqui mesmo, para a equipe já começar com os dados organizados.
      if (isDoc && !extracted)
        readResumeFile(raw)
          .then((lines) => setExtracted(lines.map((l) => l.text).join("\n").slice(0, 12000)))
          .catch(() => {});
    }
    setFiles(next);
  };

  const uploadFiles = async (requestId: string) => {
    let failed = 0;
    for (const f of files) {
      const r = await fetch("/api/servico/" + requestId + "/arquivo", {
        method: "POST",
        headers: { "content-type": f.type || "application/octet-stream", "x-file-name": encodeURIComponent(f.name) },
        body: f,
      }).catch(() => null);
      if (!r?.ok) failed++;
    }
    return failed;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setWarning("");
    setState("sending");
    try {
      const resume = library.find((d) => d.id === form.resumeId) || null;
      const r = await fetch("/api/servico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          sourceText: form.sourceText.trim() || extracted,
          resume,
          hasFiles: files.length > 0,
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (r.status === 402) {
        setCheckoutOpen(true);
        setState("idle");
        return;
      }
      if (!r.ok) throw new Error(data.message || "Não foi possível enviar agora.");
      if (files.length && data.request?.id) {
        const failed = await uploadFiles(String(data.request.id));
        if (failed)
          setWarning(
            "Seu pedido foi enviado, mas " +
              (failed === 1 ? "um arquivo não foi" : failed + " arquivos não foram") +
              " junto. Mande pelo WhatsApp que a gente anexa.",
          );
      }
      setFiles([]);
      trackUsage("service_requested");
      setState("sent");
      await load();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível enviar agora.");
      setState("idle");
    }
  };

  const openDelivered = async (id: string) => {
    const r = await fetch("/api/servico/" + id, { cache: "no-store" });
    if (!r.ok) return alert("Não foi possível abrir agora. Tente de novo em instantes.");
    const { resume } = (await r.json()) as { resume: ResumeDocument };
    const docs = readLibrary().filter((d) => d.id !== resume.id);
    localStorage.setItem(RESUME_LIBRARY_KEY, JSON.stringify([resume, ...docs]));
    localStorage.setItem(ACTIVE_RESUME_KEY, resume.id);
    location.href = "/editor";
  };

  const open = requests.find((r) => r.status === "new" || r.status === "in_progress");

  return (
    <main className="lp fy">
      <SiteHeader active="feito" />
      <section className="wrap fy-hero">
        <div>
          <h1>Prefere que a gente faça o seu currículo?</h1>
          <p>
            Envie suas informações e nossa equipe monta um currículo profissional para você em{" "}
            <b>até 24 horas</b>, por {ACCESS_PRICE_LABEL}, com <b>{SERVICE_SUPPORT_DAYS} dias de suporte</b> para ajustes.
          </p>
          <ul className="fy-trust">
            <li>Atendimento feito por pessoas, pelo WhatsApp</li>
            <li>Empresa registrada — CNPJ {COMPANY.cnpj}</li>
            <li>Pagamento seguro pelo Mercado Pago</li>
            <li>{SERVICE_SUPPORT_DAYS} dias para pedir ajustes à equipe</li>
            <li>Você revisa e muda o que quiser depois</li>
          </ul>
        </div>
        <ol className="fy-steps" aria-label="Como funciona">
          <li>
            <b>Você conta sua história</b>
            <span>Cole o currículo antigo ou escreva onde trabalhou, o que fazia e o que estudou.</span>
          </li>
          <li>
            <b>A equipe monta</b>
            <span>Escrevemos objetivo e atividades, escolhemos o modelo e deixamos tudo em 1 página.</span>
          </li>
          <li>
            <b>Você recebe pronto</b>
            <span>Aviso por e-mail; o currículo aparece aqui para baixar em PDF ou Word.</span>
          </li>
        </ol>
      </section>

      <section className="wrap fy-body">
        {requests.length > 0 && (
          <div className="fy-card">
            <h2>Seus pedidos</h2>
            {state === "sent" && (
              <p className="fy-ok" role="status">
                Pedido enviado! Prazo: até 24 horas. Se precisarmos de algo, chamamos no seu WhatsApp.
              </p>
            )}
            {warning && (
              <p className="fy-err" role="alert">
                {warning}
              </p>
            )}
            <ul className="fy-reqs">
              {requests.map((r) => (
                <li key={r.id} className={"st-" + r.status}>
                  <div>
                    <b>{r.data.role}</b>
                    <span>
                      Pedido em {dateTime(r.createdAt)} · <em>{STATUS[r.status]}</em>
                    </span>
                    {r.adminNote && <small>Recado da equipe: {r.adminNote}</small>}
                  </div>
                  {r.status === "delivered" && (
                    <div className="fy-reqactions">
                      {r.downloadUrl && (
                        <a className="btn btn-primary" href={r.downloadUrl}>
                          Baixar PDF ou Word
                        </a>
                      )}
                      <button type="button" className="btn btn-ghost" onClick={() => openDelivered(r.id)}>
                        Abrir no editor
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {access.loading ? null : !access.signedIn ? (
          <div className="fy-card fy-cta">
            <h2>Comece criando sua conta</h2>
            <p>A conta guarda seu pedido e é por ela que você recebe o currículo pronto.</p>
            <Link className="btn btn-primary btn-lg" href="/auth/sign-up?callbackURL=%2Ffeito-para-voce">
              Criar conta e continuar
            </Link>
            <p className="fy-small">
              Já tem conta? <Link href="/auth/sign-in?callbackURL=%2Ffeito-para-voce">Entrar</Link>
            </p>
          </div>
        ) : !access.active ? (
          <div className="fy-card fy-cta">
            <h2>Libere o acesso e faça seu pedido</h2>
            <p>
              Com um Pix de {ACCESS_PRICE_LABEL} você ganha {ACCESS_DAYS} dias de downloads e um currículo
              feito pela nossa equipe.
            </p>
            <button type="button" className="btn btn-primary btn-lg" onClick={() => setCheckoutOpen(true)}>
              Pagar {ACCESS_PRICE_LABEL} com Pix
            </button>
          </div>
        ) : open ? null : (
          <form className="fy-card fy-form" onSubmit={submit}>
            <h2>Seu pedido</h2>
            <p className="fy-small">
              Acesso ativo até {access.accessUntil ? formatAccessUntil(access.accessUntil) : "—"}. Um
              currículo feito pela equipe a cada acesso de {ACCESS_DAYS} dias.
            </p>
            <div className="fy-grid">
              <label>
                <span>Nome completo</span>
                <input required value={form.name} onChange={set("name")} maxLength={80} />
              </label>
              <label>
                <span>WhatsApp com DDD</span>
                <input
                  required
                  value={form.whatsapp}
                  onChange={set("whatsapp")}
                  inputMode="tel"
                  placeholder="(16) 99999-9999"
                />
              </label>
              <label>
                <span>Vaga ou cargo que procura</span>
                <input
                  required
                  value={form.role}
                  onChange={set("role")}
                  maxLength={80}
                  placeholder="Ex.: Recepcionista"
                />
              </label>
              <label>
                <span>Cidade</span>
                <input
                  value={form.city}
                  onChange={set("city")}
                  maxLength={80}
                  placeholder="Ex.: Ribeirão Preto, SP"
                />
              </label>
            </div>
            {library.length > 0 && (
              <label>
                <span>Usar como base um currículo deste aparelho</span>
                <select value={form.resumeId} onChange={set("resumeId")}>
                  <option value="">Nenhum — vou escrever abaixo</option>
                  {library.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <div className="fy-files">
              <span className="fy-files-title">Anexe seu currículo antigo (opcional)</span>
              <p className="fy-small">PDF, Word ou foto do currículo impresso. Até {MAX_FILES} arquivos de 4 MB.</p>
              <label className="fy-drop">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
                  onChange={(e) => {
                    void pickFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
                <b>Escolher arquivo ou tirar foto</b>
              </label>
              {files.length > 0 && (
                <ul>
                  {files.map((f, i) => (
                    <li key={f.name + i}>
                      <span>
                        {f.name} <small>({Math.max(1, Math.round(f.size / 1024))} KB)</small>
                      </span>
                      <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))}>
                        Remover
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {fileMsg && <p className="fy-err">{fileMsg}</p>}
            </div>
            <label>
              <span>Ou cole o texto do currículo antigo (opcional)</span>
              <textarea rows={5} value={form.sourceText} onChange={set("sourceText")} maxLength={12000} />
            </label>
            <label>
              <span>Conte sua experiência e o que quer destacar</span>
              <textarea
                rows={6}
                value={form.notes}
                onChange={set("notes")}
                maxLength={4000}
                placeholder={
                  "Ex.: Trabalhei 3 anos como vendedora na Loja X (2021–2024), atendia clientes, abria e fechava o caixa. Estudei até o ensino médio. Fiz curso de Excel no SENAC."
                }
              />
            </label>
            <fieldset className="fy-delivery">
              <legend>Como você quer receber o currículo pronto?</legend>
              <label className={form.delivery === "email" ? "on" : ""}>
                <input
                  type="radio"
                  name="delivery"
                  value="email"
                  checked={form.delivery === "email"}
                  onChange={() => setForm({ ...form, delivery: "email" })}
                />
                <span>
                  <b>Por e-mail</b>
                  <small>PDF e Word anexados{access.email ? ", em " + access.email : ""}</small>
                </span>
              </label>
              <label className={form.delivery === "whatsapp" ? "on" : ""}>
                <input
                  type="radio"
                  name="delivery"
                  value="whatsapp"
                  checked={form.delivery === "whatsapp"}
                  onChange={() => setForm({ ...form, delivery: "whatsapp" })}
                />
                <span>
                  <b>Pelo WhatsApp</b>
                  <small>Link para baixar, no número informado acima</small>
                </span>
              </label>
              <p className="fy-small">Nos dois casos ele também fica salvo em Meus currículos, para você editar.</p>
            </fieldset>
            {error && (
              <p className="fy-err" role="alert">
                {error}
              </p>
            )}
            <button type="submit" className="btn btn-primary btn-lg" disabled={state === "sending"}>
              {state === "sending" ? "Enviando…" : "Enviar pedido"}
            </button>
            <p className="fy-small">
              Prazo de até 24 horas a partir do envio. Usamos seus dados só para montar o currículo.
            </p>
          </form>
        )}

        <aside className="fy-card fy-help">
          <h2>Tem dúvida? Fale com a gente</h2>
          <p>
            Atendimento humano pelo WhatsApp {COMPANY.phone}, sem robô. Ajudamos a pagar, preencher ou ajustar
            o currículo.
          </p>
          <a className="btn btn-ghost" href={SUPPORT_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
            <WhatsappLogo size={18} weight="fill" aria-hidden="true" /> Chamar no WhatsApp
          </a>
        </aside>
      </section>

      <CheckoutModal
        open={checkoutOpen}
        access={access}
        returnTo="/feito-para-voce"
        onClose={() => setCheckoutOpen(false)}
        onUnlocked={(until) => unlock(until)}
        onDownload={() => setCheckoutOpen(false)}
      />
      <SiteFooter />
    </main>
  );
}
