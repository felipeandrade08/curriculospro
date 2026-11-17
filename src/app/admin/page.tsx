import type { Metadata } from "next";
import Link from "next/link";
import "./admin.css";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { checkAdmin } from "@/lib/server/admin";
import { db } from "@/lib/server/db";
import { TeamFlag } from "@/components/team-flag";
import Image from "next/image";
import { CouponsTab, CustomersTab, FeedbackTab, OrdersTab, OverviewTab, SalesTab } from "./sections";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
export const metadata: Metadata = { title: "Administração", robots: { index: false, follow: false } };

const TABS = [
  { id: "geral", label: "Visão geral" },
  { id: "vendas", label: "Vendas" },
  { id: "pedidos", label: "Pedidos" },
  { id: "avaliacoes", label: "Avaliações" },
  { id: "clientes", label: "Clientes" },
  { id: "cupons", label: "Cupons" },
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
      <main className="cpa">
        <SiteHeader />
        <section className="cpa-notice">
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
  let openOrders = 0;
  try {
    const [o] =
      await db()`SELECT count(*)::int AS n FROM service_requests WHERE status IN ('new', 'in_progress')`;
    openOrders = Number(o?.n || 0);
  } catch {}
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

  let pixPending = 0;
  let oldestHours = 0;
  try {
    const [p] = await db()`SELECT count(*)::int AS n FROM payments WHERE status IN ('pending', 'in_process') AND expires_at > now()`;
    pixPending = Number(p?.n || 0);
    const [o] = await db()`SELECT EXTRACT(EPOCH FROM (now() - min(created_at))) / 3600 AS h
      FROM service_requests WHERE status IN ('new', 'in_progress')`;
    oldestHours = Math.floor(Number(o?.h || 0));
  } catch {}

  return (
    <main className="cpa">
      <TeamFlag />
      <header className="cpa-head">
        <div className="wrap cpa-head-inner">
          <Link href="/" className="cpa-logo" aria-label="Ver o site">
            <Image src="/brand/logo-transparent.png" alt="CurriculosPRO" width={120} height={46} priority />
          </Link>
          <span className="cpa-head-title">Painel da equipe</span>
          <nav className="cpa-quick" aria-label="Atalhos da equipe">
            <Link href="/comecar">+ Novo currículo</Link>
            <Link href="/editor">Editor</Link>
            <Link href="/curriculos">Currículos da equipe</Link>
            <Link href="/">Ver o site</Link>
          </nav>
          <span className="cpa-who">{check.session.email}</span>
        </div>
      </header>
      <div className="cpa-top">
        <div className="wrap cpa-top-inner">
          <div>
            <h1>{TABS.find((t) => t.id === tab)?.label}</h1>
            <p>
              Atualizado agora ·{" "}
              {new Date().toLocaleString("pt-BR", {
                timeZone: "America/Sao_Paulo",
                dateStyle: "short",
                timeStyle: "short",
              })}
            </p>
          </div>
          <nav className="cpa-period" aria-label="Período">
            {PERIODS.map((p) => (
              <Link key={p} href={href({ dias: String(p) })} aria-current={p === days ? "true" : undefined}>
                {p} dias
              </Link>
            ))}
          </nav>
        </div>
        <nav className="wrap cpa-tabs" aria-label="Seções">
          {TABS.map((t) => (
            <Link key={t.id} href={href({ aba: t.id })} aria-current={t.id === tab ? "page" : undefined}>
              {t.label}
              {t.id === "avaliacoes" && newFeedback > 0 && <span className="cpa-badge">{newFeedback}</span>}
              {t.id === "pedidos" && openOrders > 0 && <span className="cpa-badge">{openOrders}</span>}
            </Link>
          ))}
        </nav>
      </div>
      {(openOrders > 0 || newFeedback > 0 || pixPending > 0) && (
        <div className="wrap cpa-todo" role="status">
          <b>Pendências:</b>
          {openOrders > 0 && (
            <Link href={href({ aba: "pedidos" })} className={oldestHours >= 20 ? "late" : ""}>
              {openOrders} pedido{openOrders > 1 ? "s" : ""} para fazer
              {oldestHours > 0 ? ` (o mais antigo há ${oldestHours}h)` : ""}
            </Link>
          )}
          {newFeedback > 0 && (
            <Link href={href({ aba: "avaliacoes" })}>
              {newFeedback} avaliaç{newFeedback > 1 ? "ões" : "ão"} para moderar
            </Link>
          )}
          {pixPending > 0 && (
            <Link href={href({ aba: "vendas", status: "pending" })}>
              {pixPending} Pix aguardando pagamento
            </Link>
          )}
        </div>
      )}
      <div className="wrap cpa-body">
        {dbError && (
          <div className="cpa-alert">
            Falta atualizar o banco de dados: rode <code>npm run db:migrate</code> com a DATABASE_URL de
            produção para ativar depoimentos e liberação manual de acesso.
          </div>
        )}
        {tab === "geral" && <OverviewTab days={days} href={href} />}
        {tab === "vendas" && <SalesTab days={days} q={one("q")} status={one("status")} href={href} />}
        {tab === "pedidos" && (
          <OrdersTab
            adminUserId={check.session.userId}
            filter={one("filtro") || "abertos"}
            msg={one("msg")}
            href={href}
          />
        )}
        {tab === "avaliacoes" && <FeedbackTab filter={one("filtro") || "novas"} href={href} />}
        {tab === "clientes" && <CustomersTab q={one("q")} msg={one("msg")} />}
        {tab === "cupons" && <CouponsTab msg={one("msg")} />}
      </div>
    </main>
  );
}
