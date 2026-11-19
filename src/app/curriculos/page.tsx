"use client";
import { useEffect, useState } from "react";
import { CloudSync, LAST_CLOUD_USER, PENDING_DELETIONS } from "./cloud-sync";
import { ProfessionalProfileCard } from "./professional-profile-card";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ReferralCard } from "@/components/referral-card";
import { JobTools } from "@/components/job-tools";
import { KitUpsell } from "@/components/kit-upsell";
import { CustomerOnly } from "@/components/team-flag";
import { templateMeta } from "@/lib/templates";
import { ResumeThumb } from "@/components/resume-view";
import {
  ACTIVE_RESUME_KEY,
  LEGACY_RESUME_KEY,
  RESUME_LIBRARY_KEY,
  ResumeDocument,
  createResume,
  parseBackup,
  readRecovery,
  storeRecovery,
  cloneResume,
  defaultOrder,
  migrateLegacyResume,
} from "@/lib/resume";

export default function ResumesPage() {
  const [items, setItems] = useState<ResumeDocument[]>([]),
    [recoveryDate, setRecoveryDate] = useState("");
  useEffect(() => {
    const refresh = () => {
      try {
        let list: ResumeDocument[] = JSON.parse(localStorage.getItem(RESUME_LIBRARY_KEY) || "[]");
        if (!list.length) {
          const legacy = localStorage.getItem(LEGACY_RESUME_KEY);
          if (legacy) {
            const doc = migrateLegacyResume(legacy);
            list = [doc];
            localStorage.setItem(RESUME_LIBRARY_KEY, JSON.stringify(list));
          }
        }
        setItems(list);
        const recovery = readRecovery();
        if (recovery) setRecoveryDate(recovery.createdAt);
      } catch {}
    };
    refresh();
    window.addEventListener("curriculospro:library-changed", refresh);
    return () => window.removeEventListener("curriculospro:library-changed", refresh);
  }, []);
  // Fecha o menu "Mais" ao clicar fora dele ou escolher uma opção.
  useEffect(() => {
    const close = (event: MouseEvent) => {
      document.querySelectorAll<HTMLDetailsElement>("details.ml-more[open]").forEach((menu) => {
        const target = event.target as Node;
        if (!menu.contains(target) || (target as HTMLElement).closest?.(".ml-more > div button")) menu.open = false;
      });
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);
  const save = (list: ResumeDocument[]) => {
    setItems(list);
    localStorage.setItem(RESUME_LIBRARY_KEY, JSON.stringify(list));
  };
  const open = (id: string) => {
    localStorage.setItem(ACTIVE_RESUME_KEY, id);
    location.href = "/editor";
  };
  const add = (mode: "blank" | "example") => {
    const doc = createResume(mode);
    save([doc, ...items]);
    open(doc.id);
  };
  const rename = (doc: ResumeDocument) => {
    const title = prompt("Nome deste currículo:", doc.title)?.trim();
    if (title)
      save(items.map((x) => (x.id === doc.id ? { ...x, title, updatedAt: new Date().toISOString() } : x)));
  };
  const duplicate = (doc: ResumeDocument) => save([cloneResume(doc), ...items]);
  const remove = (id: string) => {
    if (confirm("Excluir este currículo? Você poderá restaurar a última recuperação.")) {
      storeRecovery(items, "delete");
      setRecoveryDate(new Date().toISOString());
      try {
        const userId = localStorage.getItem(LAST_CLOUD_USER);
        if (userId) {
          const revisions: Record<string, number> = JSON.parse(
            localStorage.getItem("curriculospro.cloudRevisions.v1:" + userId) || "{}",
          );
          if (Number(revisions[id] || 0) > 0) {
            const key = PENDING_DELETIONS + ":" + userId,
              pending: string[] = JSON.parse(localStorage.getItem(key) || "[]");
            if (!pending.includes(id)) localStorage.setItem(key, JSON.stringify([...pending, id]));
          }
        }
      } catch {}
      save(items.filter((x) => x.id !== id));
    }
  };
  const restore = () => {
    const recovery = readRecovery();
    if (recovery && confirm("Restaurar a biblioteca para o estado salvo antes da última alteração?")) {
      try {
        const userId = localStorage.getItem(LAST_CLOUD_USER);
        if (userId) {
          const key = PENDING_DELETIONS + ":" + userId,
            pending: string[] = JSON.parse(localStorage.getItem(key) || "[]"),
            restoredIds = new Set(recovery.resumes.map((x) => x.id));
          localStorage.setItem(key, JSON.stringify(pending.filter((id) => !restoredIds.has(id))));
        }
      } catch {}
      save(recovery.resumes);
    }
  };
  const exportAll = () => {
    const blob = new Blob(
        [
          JSON.stringify(
            { product: "CurriculosPRO", version: 3, exportedAt: new Date().toISOString(), resumes: items },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      ),
      a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "curriculospro-backup.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const importFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const incoming = parseBackup(String(reader.result));
        storeRecovery(items, "import");
        setRecoveryDate(new Date().toISOString());
        save([...incoming.map((x: ResumeDocument) => cloneResume(x, x.title)), ...items]);
      } catch {
        alert("Arquivo de backup inválido.");
      }
    };
    reader.readAsText(file);
  };
  const sectionsOf = (doc: ResumeDocument) =>
    (doc.sectionOrder.length ? doc.sectionOrder : defaultOrder).filter((x) => !doc.hidden.includes(x));
  const updated = (iso: string) => {
    const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
    if (days <= 0) return "hoje";
    if (days === 1) return "ontem";
    if (days < 7) return `há ${days} dias`;
    return new Date(iso).toLocaleDateString("pt-BR");
  };

  return (
    <main className="libraryPage ml">
      <SiteHeader active="curriculos" />

      <section className="ml-head shell">
        <div>
          <h1>Meus currículos</h1>
          <p>Crie uma versão para cada tipo de vaga. Tudo fica salvo aqui e na sua conta.</p>
        </div>
        <div className="ml-head-actions">
          <button className="primary" onClick={() => add("blank")}>
            ＋ Novo currículo
          </button>
          <a className="secondary" href="/modelos">
            Escolher modelo
          </a>
        </div>
      </section>

      <section className="ml-library shell" aria-labelledby="ml-lib-title">
        <div className="ml-section-head">
          <h2 id="ml-lib-title">
            Seus currículos <span>{items.length}</span>
          </h2>
          {recoveryDate && (
            <button className="ml-link" onClick={restore}>
              ↶ Desfazer última exclusão
            </button>
          )}
        </div>
        {items.length ? (
          <div className="ml-grid">
            {items.map((doc) => (
              <article className="ml-card" key={doc.id}>
                <button className="ml-thumb" onClick={() => open(doc.id)} aria-label={"Abrir " + doc.title}>
                  <ResumeThumb
                    width={196}
                    cv={doc.cv}
                    template={doc.template}
                    accent={doc.accent}
                    density={doc.density}
                    sections={sectionsOf(doc)}
                  />
                </button>
                <div className="ml-card-body">
                  <h3 title={doc.title}>{doc.title}</h3>
                  <p>{doc.cv.role || "Sem cargo definido"}</p>
                  <small>
                    {templateMeta(doc.template).name} · editado {updated(doc.updatedAt)}
                  </small>
                  <div className="ml-card-actions">
                    <button className="cardPrimary" onClick={() => open(doc.id)}>
                      Editar e baixar
                    </button>
                    <details className="ml-more">
                      <summary aria-label={"Mais opções de " + doc.title}>Mais</summary>
                      <div>
                        <button
                          onClick={() => {
                            localStorage.setItem(ACTIVE_RESUME_KEY, doc.id);
                            location.href = "/carta";
                          }}
                        >
                          Carta de apresentação
                        </button>
                        <button onClick={() => rename(doc)}>Renomear</button>
                        <button onClick={() => duplicate(doc)}>Duplicar</button>
                        <button className="dangerText" onClick={() => remove(doc.id)}>
                          Excluir
                        </button>
                      </div>
                    </details>
                  </div>
                </div>
              </article>
            ))}
            <button className="ml-new" onClick={() => add("blank")}>
              <span aria-hidden="true">＋</span>
              <b>Novo currículo</b>
              <small>Em branco, ou escolha um modelo</small>
            </button>
          </div>
        ) : (
          <div className="emptyLibrary">
            <span className="emptyIcon">CV</span>
            <b>Você ainda não tem currículos aqui.</b>
            <p>Crie o primeiro, use um exemplo pronto ou peça para a nossa equipe fazer o seu.</p>
            <div>
              <button className="primary" onClick={() => add("blank")}>
                Criar meu currículo
              </button>
              <button className="secondary" onClick={() => add("example")}>
                Começar com um exemplo
              </button>
              <a className="secondary" href="/feito-para-voce">
                Quero que façam o meu
              </a>
            </div>
          </div>
        )}
      </section>

      <section className="ml-block shell">
        <KitUpsell />
        <JobTools />
      </section>

      <section className="ml-block shell" aria-labelledby="ml-profile-title">
        <div className="ml-section-head">
          <h2 id="ml-profile-title">Seu perfil profissional</h2>
        </div>
        <ProfessionalProfileCard resumes={items} />
      </section>

      <CustomerOnly>
        <section className="ml-block shell">
          <ReferralCard />
        </section>
      </CustomerOnly>

      <section className="ml-block shell" aria-labelledby="ml-account-title">
        <div className="ml-section-head">
          <h2 id="ml-account-title">Conta e backup</h2>
        </div>
        <CloudSync />
        <div className="ml-backup">
          <p>
            Seus currículos ficam salvos neste navegador e, com a conta conectada, também na nuvem. Para
            garantir, guarde uma cópia. <a href="/privacidade">Como tratamos seus dados</a>
          </p>
          <div>
            <button className="secondary" disabled={!items.length} onClick={exportAll}>
              Baixar cópia (backup)
            </button>
            <label className="secondary importButton">
              Restaurar de um backup
              <input
                type="file"
                accept=".json,application/json"
                onChange={(e) => importFile(e.target.files?.[0])}
              />
            </label>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
