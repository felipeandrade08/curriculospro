"use client";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth/client";
import { ACCESS_PRICE_LABEL, formatAccessUntil } from "@/lib/billing";
import { RESUME_LIBRARY_KEY, ResumeDocument, cloneResume, isResumeDocument } from "@/lib/resume";
const REVISIONS = "curriculospro.cloudRevisions.v1";
export const PENDING_DELETIONS = "curriculospro.pendingCloudDeletes.v1";
export const LAST_CLOUD_USER = "curriculospro.lastCloudUser.v1";
type CloudResume = { document: ResumeDocument; revision: number; updatedAt: string };
type Conflict = { local: ResumeDocument; remote: CloudResume };

function readLocal() {
  try {
    const raw = JSON.parse(localStorage.getItem(RESUME_LIBRARY_KEY) || "[]");
    return Array.isArray(raw) ? raw.filter(isResumeDocument) : [];
  } catch {
    return [];
  }
}
function writeLocal(items: ResumeDocument[]) {
  localStorage.setItem(RESUME_LIBRARY_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("curriculospro:library-changed"));
}

export function CloudSync() {
  const session = authClient.useSession(),
    [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false),
    [conflicts, setConflicts] = useState<Conflict[]>([]),
    [plan, setPlan] = useState<{ active: boolean; accessUntil: string | null } | null>(null);
  const userId = session.data?.user.id || session.data?.user.email || "anonymous",
    key = REVISIONS + ":" + userId,
    pendingKey = PENDING_DELETIONS + ":" + userId;
  useEffect(() => {
    try {
      if (session.data) localStorage.setItem(LAST_CLOUD_USER, userId);
      else if (!session.isPending) localStorage.removeItem(LAST_CLOUD_USER);
    } catch {}
  }, [session.data, session.isPending, userId]);
  useEffect(() => {
    let active = true;
    if (!session.data) {
      setPlan(null);
      return () => {
        active = false;
      };
    }
    fetch("/api/account", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (active)
          setPlan({ active: !!data.account?.active, accessUntil: data.account?.accessUntil || null });
      })
      .catch(() => {
        if (active) setPlan(null);
      });
    return () => {
      active = false;
    };
  }, [session.data]);
  // Ao abrir Meus currículos com a conta conectada, baixa sozinho o que existe na conta e ainda não está
  // neste aparelho (ex.: currículo entregue pela equipe no "Fazemos para você"). Não envia nada.
  useEffect(() => {
    if (!session.data) return;
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/resumes", { cache: "no-store" });
        if (!res.ok || !active) return;
        const data = (await res.json()) as { resumes?: CloudResume[]; deleted?: { id: string }[] };
        const local = readLocal();
        const localIds = new Set(local.map((x) => x.id));
        const pending: string[] = JSON.parse(localStorage.getItem(pendingKey) || "[]");
        const blocked = new Set([...pending, ...(data.deleted || []).map((x) => x.id)]);
        const fresh = (data.resumes || []).filter(
          (x) => isResumeDocument(x.document) && !localIds.has(x.document.id) && !blocked.has(x.document.id),
        );
        if (!fresh.length || !active) return;
        writeLocal([...fresh.map((x) => x.document), ...local]);
        const revisions: Record<string, number> = JSON.parse(localStorage.getItem(key) || "{}");
        for (const x of fresh) revisions[x.document.id] = x.revision;
        localStorage.setItem(key, JSON.stringify(revisions));
        setStatus(
          fresh.length === 1
            ? "1 currículo da sua conta foi trazido para este aparelho."
            : fresh.length + " currículos da sua conta foram trazidos para este aparelho.",
        );
      } catch {}
    })();
    return () => {
      active = false;
    };
  }, [session.data, key, pendingKey]);

  const resolve = (conflict: Conflict, choice: "local-copy" | "remote") => {
    const items = readLocal();
    if (choice === "remote")
      writeLocal(items.map((x) => (x.id === conflict.local.id ? conflict.remote.document : x)));
    else
      writeLocal([
        cloneResume(conflict.local, conflict.local.title + " — versão local"),
        ...items.map((x) => (x.id === conflict.local.id ? conflict.remote.document : x)),
      ]);
    const revisions: Record<string, number> = JSON.parse(localStorage.getItem(key) || "{}");
    revisions[conflict.remote.document.id] = conflict.remote.revision;
    localStorage.setItem(key, JSON.stringify(revisions));
    setConflicts((list) => list.filter((x) => x.local.id !== conflict.local.id));
    setStatus(
      choice === "remote" ? "Versão da nuvem aplicada." : "As duas versões foram preservadas na biblioteca.",
    );
  };
  const sync = async () => {
    setBusy(true);
    setStatus("Comparando dispositivo e nuvem…");
    setConflicts([]);
    try {
      let local = readLocal();
      const revisions: Record<string, number> = JSON.parse(localStorage.getItem(key) || "{}");
      const pending: string[] = JSON.parse(localStorage.getItem(pendingKey) || "[]");
      let deletedSent = 0;
      for (const id of pending) {
        const res = await fetch("/api/resumes/" + encodeURIComponent(id), { method: "DELETE" });
        if (!res.ok && res.status !== 404) throw new Error("delete");
        delete revisions[id];
        deletedSent++;
      }
      if (pending.length) localStorage.setItem(pendingKey, "[]");
      const cloudRes = await fetch("/api/resumes", { cache: "no-store" });
      if (!cloudRes.ok) throw new Error("cloud");
      const cloudData = (await cloudRes.json()) as {
          resumes?: CloudResume[];
          deleted?: { id: string; revision: number }[];
        },
        remote = (cloudData.resumes || []).filter((x) => isResumeDocument(x.document)),
        tombstones = cloudData.deleted || [];
      const knownDeleted = new Set(
        tombstones.filter((x) => Number(revisions[x.id] || 0) > 0).map((x) => x.id),
      );
      if (knownDeleted.size) {
        local = local.filter((x) => !knownDeleted.has(x.id));
        writeLocal(local);
        for (const id of knownDeleted) delete revisions[id];
      }
      const blockedDeleted = new Set([...pending, ...tombstones.map((x) => x.id)]);
      const localIds = new Set(local.map((x) => x.id)),
        downloaded = remote.filter((x) => !localIds.has(x.document.id) && !blockedDeleted.has(x.document.id)),
        downloadedIds = new Set(downloaded.map((x) => x.document.id));
      if (downloaded.length) {
        local = [...downloaded.map((x) => x.document), ...local];
        writeLocal(local);
        for (const x of downloaded) revisions[x.document.id] = x.revision;
      }
      const remoteById = new Map(remote.map((x) => [x.document.id, x])),
        found: Conflict[] = [];
      let saved = 0;
      for (const doc of local) {
        if (downloadedIds.has(doc.id) || blockedDeleted.has(doc.id)) continue;
        const known = Number(revisions[doc.id] || 0),
          cloud = remoteById.get(doc.id);
        if (cloud && known && cloud.revision !== known) {
          found.push({ local: doc, remote: cloud });
          continue;
        }
        const res = await fetch("/api/resumes/" + encodeURIComponent(doc.id), {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ ...doc, revision: known }),
        });
        if (res.status === 409) {
          const data = await res.json();
          if (data.remote) found.push({ local: doc, remote: data.remote });
          continue;
        }
        if (!res.ok) throw new Error("sync");
        const data = await res.json();
        revisions[doc.id] = data.revision;
        saved++;
      }
      localStorage.setItem(key, JSON.stringify(revisions));
      setConflicts(found);
      setStatus(
        found.length
          ? downloaded.length +
              " baixado(s) · " +
              saved +
              " sincronizado(s) · " +
              deletedSent +
              " exclusão(ões) confirmada(s) · " +
              found.length +
              " conflito(s) aguardando decisão"
          : downloaded.length +
              " baixado(s) · " +
              saved +
              " sincronizado(s) · " +
              deletedSent +
              " exclusão(ões) confirmada(s) · tudo atualizado",
      );
    } catch {
      setStatus("Não foi possível sincronizar agora. Seus currículos locais foram preservados.");
    } finally {
      setBusy(false);
    }
  };
  if (session.isPending)
    return (
      <div className="accountCard accountLoading">
        <span className="statusDot" />
        Verificando sua conta…
      </div>
    );
  if (!session.data)
    return (
      <div className="accountCard signedOut">
        <div className="accountIcon">☁</div>
        <div>
          <small>NUVEM OPCIONAL</small>
          <strong>Salve também na sua conta</strong>
          <p>Entre para sincronizar seus currículos sem perder as cópias deste dispositivo.</p>
        </div>
        <a className="cloudLogin" href="/auth/sign-in">
          Entrar na conta →
        </a>
      </div>
    );
  const user = session.data.user,
    initials = (user.name || user.email || "CP")
      .split(/\s+/)
      .map((x) => x[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  return (
    <div className="accountCard signedIn">
      <div className="accountIdentity">
        <span className="accountAvatar">{initials}</span>
        <div>
          <small>CONTA CONECTADA</small>
          <strong>{user.name || "Sua conta CurriculosPRO"}</strong>
          <p>{user.email}</p>
        </div>
      </div>
      <div className="accountPlan">
        <small>DOWNLOAD EM PDF</small>
        <b>{!plan ? "—" : plan.active ? "Liberado" : "Não liberado"}</b>
        <span>
          {!plan ? (
            "Consultando conta"
          ) : plan.active ? (
            plan.accessUntil ? (
              "Até " + formatAccessUntil(plan.accessUntil)
            ) : (
              "Acesso permanente"
            )
          ) : (
            <a href="/precos">Liberar por {ACCESS_PRICE_LABEL}</a>
          )}
        </span>
      </div>
      <div className="accountCloud">
        <small>SINCRONIZAÇÃO</small>
        <b>
          <i className={busy ? "syncDot busy" : "syncDot"} />
          {busy ? "Sincronizando…" : "Nuvem disponível"}
        </b>
        <span>Local + conta</span>
      </div>
      <div className="accountActions">
        <button disabled={busy} onClick={sync}>
          {busy ? "Sincronizando…" : "Sincronizar agora"}
        </button>
        <button
          className="cloudSignout"
          onClick={async () => {
            setStatus("");
            setConflicts([]);
            await authClient.signOut();
            location.href = "/curriculos";
          }}
        >
          Sair
        </button>
      </div>
      {status && (
        <div className="syncMessage" role="status">
          {status}
        </div>
      )}
      {conflicts.length > 0 && (
        <div className="conflictCenter">
          <div className="conflictIntro">
            <b>Conflitos encontrados</b>
            <span>Nada foi sobrescrito. Escolha o que fazer com cada currículo.</span>
          </div>
          {conflicts.map((c) => (
            <div className="conflictItem" key={c.local.id}>
              <div>
                <strong>{c.local.title}</strong>
                <small>
                  Local: {new Date(c.local.updatedAt).toLocaleString("pt-BR")} · Nuvem:{" "}
                  {new Date(c.remote.updatedAt).toLocaleString("pt-BR")}
                </small>
              </div>
              <div>
                <button onClick={() => resolve(c, "local-copy")}>Preservar as duas</button>
                <button className="conflictRemote" onClick={() => resolve(c, "remote")}>
                  Usar versão da nuvem
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
