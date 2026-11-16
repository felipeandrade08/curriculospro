import type { Metadata } from "next";
import Link from "next/link";
import "./admin.css";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { checkAdmin } from "@/lib/server/admin";
import { db } from "@/lib/server/db";
import { CustomersTab, FeedbackTab, OverviewTab, SalesTab } from "./sections";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Administração", robots: { index: false, follow: false } };

const TABS = [
  { id: "geral", label: "Visão geral" },
  { id: "vendas", label: "Vendas" },
  { id: "avaliacoes", label: "Avaliações" },
  { id: "clientes", label: "Clientes" },
] as const;
type TabId = (typeof TABS)[number]["id"];
const PERIODS = [7, 30, 90] as const;

type Search = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminPage({ searchParams }: { searchParams: Search }) {
  const params = await searchParams;
  const one = (k: string) => (typeof params[k] === "string" ? (params[k] as string) : "");
  const check = await checkAdmin();
  if (!check.ok) {
    if (check.reason === "signed-out") redirect("/auth/sign-in?callbackURL=%2Fadmin");
    return (
      <main className="ad">
        <SiteHeader />
        <section className="ad-notice">
          <h1>
            {check.reason === "not-configured"
              ? "Admin ainda não configurado"
              : "Esta conta não é administradora"}
          </h1>
          <p>
            {check.reason === "not-configured"
              ? "Configure ADMIN_EMAIL no ambiente Production da Vercel e publique um novo deployment."
              : "A sessão atual não corresponde ao e-mail autorizado em ADMIN_EMAIL."}
          </p>
          {check.reason === "forbidden" && (
            <Link href="/auth/sign-in?callbackURL=%2Fadmin">Entrar com outra conta</Link>
          )}
        </section>
      </main>
    );
  }

  const tab: TabId = (TABS.find((t) => t.id === one("aba"))?.id as TabId) || "geral";
  const days = PERIODS.find((p) => String(p) === one("dias")) || 30;
  let newFeedback = 0;
  let dbError = false;
  try {
    const [row] = await db()`SELECT count(*)::int AS n FROM user_feedback WHERE status = 'new'`;
    newFeedback = Number(row?.n || 0);
  } catch (error) {
    // Coluna "status" ainda não existe: falta rodar a migração nova.
    dbError = (error as { code?: string }).code === "42703";
    if (!dbError) newFeedback = 0;
  }
  const href = (patch: Record<string, string>) => {
    const next = new URLSearchParams({ aba: tab, dias: String(days), ...patch });
    if (next.get("dias") === "30") next.delete("dias");
    if (next.get("aba") === "geral") next.delete("aba");
    const qs = next.toString();
    return "/admin" + (qs ? "?" + qs : "");
  };

  return (
    <main className="ad">
      <SiteHeader />
      <div className="ad-top">
        <div className="wrap ad-top-inner">
          <div>
            <h1>Administração</h1>
            <p>
              Atualizado agora ·{" "}
              {new Date().toLocaleString("pt-BR", {
                timeZone: "America/Sao_Paulo",
                dateStyle: "short",
                timeStyle: "short",
              })}
            </p>
          </div>
          <nav className="ad-period" aria-label="Período">
            {PERIODS.map((p) => (
              <Link key={p} href={href({ dias: String(p) })} aria-current={p === days ? "true" : undefined}>
                {p} dias
              </Link>
            ))}
          </nav>
        </div>
        <nav className="wrap ad-tabs" aria-label="Seções">
          {TABS.map((t) => (
            <Link key={t.id} href={href({ aba: t.id })} aria-current={t.id === tab ? "page" : undefined}>
              {t.label}
              {t.id === "avaliacoes" && newFeedback > 0 && <span className="ad-badge">{newFeedback}</span>}
            </Link>
          ))}
        </nav>
      </div>
      <div className="wrap ad-body">
        {dbError && (
          <div className="ad-alert">
            Falta atualizar o banco de dados: rode <code>npm run db:migrate</code> com a DATABASE_URL de
            produção para ativar depoimentos e liberação manual de acesso.
          </div>
        )}
        {tab === "geral" && <OverviewTab days={days} href={href} />}
        {tab === "vendas" && <SalesTab days={days} q={one("q")} status={one("status")} href={href} />}
        {tab === "avaliacoes" && <FeedbackTab filter={one("filtro") || "novas"} href={href} />}
        {tab === "clientes" && <CustomersTab q={one("q")} msg={one("msg")} />}
      </div>
    </main>
  );
}
