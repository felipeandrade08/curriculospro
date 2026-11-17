"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { uid } from "@/lib/resume";
import { readActiveResume } from "@/lib/active-resume";
import { followUpMessage } from "@/lib/send-messages";
import { trackUsage } from "@/lib/analytics";

type Status = "enviado" | "entrevista" | "aguardando" | "aprovado" | "recusado";
type Application = {
  id: string;
  role: string;
  company: string;
  channel: string;
  contact: string;
  sentAt: string;
  status: Status;
  notes: string;
  updatedAt: string;
};

const KEY = "curriculospro.applications.v1";
const STATUS: Record<Status, string> = {
  enviado: "Currículo enviado",
  entrevista: "Entrevista marcada",
  aguardando: "Aguardando resposta",
  aprovado: "Aprovado",
  recusado: "Não seguiu",
};
const today = () => new Date().toISOString().slice(0, 10);
const daysSince = (date: string) => Math.floor((Date.now() - new Date(date + "T12:00:00").getTime()) / 86_400_000);
const fmt = (date: string) => new Date(date + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

const blank = () => ({ role: "", company: "", channel: "WhatsApp", contact: "", sentAt: today(), notes: "" });

export default function ApplicationsPage() {
  const [items, setItems] = useState<Application[]>([]);
  const [ready, setReady] = useState(false);
  const [form, setForm] = useState(blank());
  const [filter, setFilter] = useState<"todas" | "ativas" | Status>("ativas");
  const [name, setName] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "[]");
      if (Array.isArray(saved)) setItems(saved);
    } catch {}
    setName(readActiveResume()?.name || "");
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, ready]);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.role.trim() && !form.company.trim()) return;
    const now = new Date().toISOString();
    setItems((list) => [{ id: uid(), ...form, status: "enviado", updatedAt: now }, ...list]);
    setForm(blank());
    if (!items.length) trackUsage("applications_used");
  };
  const update = (id: string, patch: Partial<Application>) =>
    setItems((list) => list.map((x) => (x.id === id ? { ...x, ...patch, updatedAt: new Date().toISOString() } : x)));
  const remove = (id: string) => setItems((list) => list.filter((x) => x.id !== id));

  const counts = useMemo(() => {
    const c: Record<string, number> = { todas: items.length, ativas: 0 };
    for (const x of items) {
      c[x.status] = (c[x.status] || 0) + 1;
      if (x.status !== "aprovado" && x.status !== "recusado") c.ativas++;
    }
    return c;
  }, [items]);
  const shown = items
    .filter((x) =>
      filter === "todas" ? true : filter === "ativas" ? x.status !== "aprovado" && x.status !== "recusado" : x.status === filter,
    )
    .sort((a, b) => b.sentAt.localeCompare(a.sentAt));
  const followUps = items.filter((x) => (x.status === "enviado" || x.status === "aguardando") && daysSince(x.sentAt) >= 7);

  const copyFollow = async (x: Application) => {
    try {
      await navigator.clipboard.writeText(followUpMessage({ name, role: x.role, company: x.company, recruiter: "", pitch: "" }));
      setCopied(x.id);
      window.setTimeout(() => setCopied(""), 2000);
    } catch {}
  };

  return (
    <main className="ap">
      <SiteHeader />
      <section className="ap-head shell">
        <h1>Minhas candidaturas</h1>
        <p>
          Anote cada vaga em que você se candidatou e acompanhe o andamento. Depois de uma semana sem
          resposta, avisamos que é hora de cobrar.
        </p>
      </section>
      <section className="ap-grid shell">
        <form className="ap-form" onSubmit={add}>
          <h2>Nova candidatura</h2>
          <label>
            <span>Cargo</span>
            <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Auxiliar Administrativo" />
          </label>
          <label>
            <span>Empresa</span>
            <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Empresa XYZ" />
          </label>
          <div className="ap-two">
            <label>
              <span>Enviado por</span>
              <select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
                {["WhatsApp", "E-mail", "Site da empresa", "LinkedIn", "Indeed", "Catho", "Infojobs", "Pessoalmente", "Indicação", "Outro"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Data</span>
              <input type="date" value={form.sentAt} max={today()} onChange={(e) => setForm({ ...form, sentAt: e.target.value })} />
            </label>
          </div>
          <label>
            <span>Contato (opcional)</span>
            <input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="Telefone, e-mail ou link da vaga" />
          </label>
          <button type="submit" className="btn btn-primary" disabled={!form.role.trim() && !form.company.trim()}>
            Adicionar
          </button>
          <p className="ap-note">Fica salvo neste aparelho.</p>
        </form>

        <div className="ap-list">
          {followUps.length > 0 && (
            <div className="ap-follow">
              <b>Hora de cobrar retorno</b>
              <p>
                {followUps.length === 1 ? "1 candidatura está" : followUps.length + " candidaturas estão"} há mais de
                7 dias sem resposta. Uma mensagem curta e educada mostra interesse.
              </p>
            </div>
          )}
          <div className="ap-filters" role="tablist">
            {(
              [
                ["ativas", "Em andamento"],
                ["entrevista", "Entrevistas"],
                ["aprovado", "Aprovado"],
                ["todas", "Todas"],
              ] as const
            ).map(([id, label]) => (
              <button key={id} type="button" role="tab" aria-selected={filter === id} onClick={() => setFilter(id)}>
                {label} <span>{counts[id] || 0}</span>
              </button>
            ))}
          </div>
          {!ready ? null : !shown.length ? (
            <div className="ap-empty">
              {items.length ? (
                <p>Nenhuma candidatura neste filtro.</p>
              ) : (
                <>
                  <b>Nenhuma candidatura anotada ainda</b>
                  <p>
                    Enviou currículo para alguma vaga? Anote ao lado. Precisa da mensagem para enviar?{" "}
                    <Link href="/enviar-curriculo">Gere aqui</Link>.
                  </p>
                </>
              )}
            </div>
          ) : (
            shown.map((x) => {
              const late = (x.status === "enviado" || x.status === "aguardando") && daysSince(x.sentAt) >= 7;
              return (
                <article key={x.id} className={"ap-item st-" + x.status}>
                  <div className="ap-top">
                    <div>
                      <b>{x.role || "Vaga"}</b>
                      <span>
                        {x.company || "Empresa não informada"} · {x.channel} · {fmt(x.sentAt)}
                        {daysSince(x.sentAt) > 0 ? ` (há ${daysSince(x.sentAt)} dia${daysSince(x.sentAt) > 1 ? "s" : ""})` : " (hoje)"}
                      </span>
                      {x.contact && <small>{x.contact}</small>}
                    </div>
                    <select
                      aria-label="Situação"
                      value={x.status}
                      onChange={(e) => update(x.id, { status: e.target.value as Status })}
                    >
                      {(Object.keys(STATUS) as Status[]).map((s) => (
                        <option key={s} value={s}>
                          {STATUS[s]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    rows={2}
                    value={x.notes}
                    onChange={(e) => update(x.id, { notes: e.target.value })}
                    placeholder="Anotações: data da entrevista, nome do recrutador, salário…"
                  />
                  <div className="ap-actions">
                    {late && (
                      <button type="button" onClick={() => copyFollow(x)}>
                        {copied === x.id ? "Mensagem copiada ✓" : "Copiar mensagem para cobrar retorno"}
                      </button>
                    )}
                    {x.status === "entrevista" && <Link href="/entrevista">Treinar para a entrevista</Link>}
                    <button type="button" className="ap-del" onClick={() => remove(x.id)}>
                      Excluir
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
