import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getServerSession } from "@/lib/server/session";
import { db } from "@/lib/server/db";
import { formatBRL } from "@/lib/billing";

export const dynamic = "force-dynamic";

const labels: Record<string, string> = {
  site_visit: "Visitas ao site",
  resume_started: "Editor iniciado",
  paywall_view: "Viram a oferta",
  checkout_started: "Pix gerados",
  pdf_print_requested: "PDFs baixados",
};
const descriptions: Record<string, string> = {
  site_visit: "Acessos registrados na página inicial",
  resume_started: "Aberturas do editor de currículos",
  paywall_view: "Aberturas da janela de pagamento",
  checkout_started: "Códigos Pix solicitados",
  pdf_print_requested: "Downloads feitos com acesso ativo",
};

const statusLabel: Record<string, string> = {
  approved: "Pago",
  pending: "Aguardando",
  in_process: "Em análise",
  rejected: "Recusado",
  cancelled: "Cancelado/expirado",
  refunded: "Estornado",
  charged_back: "Contestado",
};

const dateTime = (value: string | null) =>
  value
    ? new Date(value).toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
        timeZone: "America/Sao_Paulo",
      })
    : "—";

export default async function AdminPage() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail) {
    return (
      <main>
        <SiteHeader />
        <section className="shell adminNotice">
          <h1>Admin ainda não configurado</h1>
          <p>Configure ADMIN_EMAIL no ambiente Production da Vercel e publique um novo deployment.</p>
        </section>
        <SiteFooter />
      </main>
    );
  }
  const session = await getServerSession();
  if (!session) redirect("/auth/sign-in?callbackURL=%2Fadmin");
  if (session.email.trim().toLowerCase() !== adminEmail) {
    return (
      <main>
        <SiteHeader />
        <section className="shell adminNotice">
          <span className="adminEyebrow">ACESSO RESTRITO</span>
          <h1>Esta conta não é administradora</h1>
          <p>A sessão atual não corresponde ao e-mail autorizado em ADMIN_EMAIL.</p>
          <Link href="/auth/sign-in?callbackURL=%2Fadmin">Entrar com outra conta →</Link>
        </section>
        <SiteFooter />
      </main>
    );
  }

  let metrics: { event_name: string; total: string }[] = [];
  let feedback: { id: string; rating: number; category: string; message: string; created_at: string }[] = [];
  let daily: { day: string; event_name: string; total: string }[] = [];
  let sales = { approved: 0, revenue: 0, refunded: 0, activeAccess: 0 };
  let salesDaily: { day: string; total: string }[] = [];
  let recentPayments: {
    id: string;
    email: string;
    amount_cents: number;
    status: string;
    created_at: string;
    approved_at: string | null;
    revoked_at: string | null;
    access_until: string | null;
  }[] = [];
  let paymentsReady = true;
  try {
    const sql = db();
    const [summary] = await sql`SELECT
        count(*) FILTER (WHERE granted_at IS NOT NULL AND revoked_at IS NULL)::int AS approved,
        COALESCE(sum(amount_cents) FILTER (WHERE granted_at IS NOT NULL AND revoked_at IS NULL), 0)::int AS revenue,
        count(*) FILTER (WHERE revoked_at IS NOT NULL)::int AS refunded
      FROM payments WHERE created_at >= now() - interval '30 days'`;
    const [active] = await sql`SELECT count(*)::int AS total FROM app_users WHERE access_until > now()`;
    sales = {
      approved: Number(summary?.approved || 0),
      revenue: Number(summary?.revenue || 0),
      refunded: Number(summary?.refunded || 0),
      activeAccess: Number(active?.total || 0),
    };
    salesDaily =
      (await sql`SELECT to_char((approved_at AT TIME ZONE 'America/Sao_Paulo')::date,'YYYY-MM-DD') AS day, count(*)::text AS total
      FROM payments WHERE granted_at IS NOT NULL AND revoked_at IS NULL AND approved_at >= now() - interval '7 days' GROUP BY 1`) as typeof salesDaily;
    recentPayments =
      (await sql`SELECT p.id, u.email, p.amount_cents, p.status, p.created_at::text, p.approved_at::text,
        p.revoked_at::text, u.access_until::text
      FROM payments p JOIN app_users u ON u.id = p.user_id
      ORDER BY p.created_at DESC LIMIT 25`) as typeof recentPayments;
  } catch {
    paymentsReady = false;
  }
  try {
    const sql = db();
    metrics =
      (await sql`SELECT event_name,count(*)::text AS total FROM usage_events WHERE created_at >= now()-interval '30 days' GROUP BY event_name`) as typeof metrics;
    feedback =
      (await sql`SELECT id::text,rating,category,message,created_at::text FROM user_feedback ORDER BY created_at DESC LIMIT 30`) as typeof feedback;
    daily =
      (await sql`SELECT to_char((created_at AT TIME ZONE 'America/Sao_Paulo')::date,'YYYY-MM-DD') AS day,event_name,count(*)::text AS total FROM usage_events WHERE created_at >= now()-interval '7 days' GROUP BY 1,2 ORDER BY 1`) as typeof daily;
  } catch {
    return (
      <main>
        <SiteHeader />
        <section className="shell adminNotice">
          <h1>Painel temporariamente indisponível</h1>
          <p>Não foi possível consultar as métricas. Confira a conexão e as migrações do banco de dados.</p>
        </section>
        <SiteFooter />
      </main>
    );
  }

  const totals = new Map(metrics.map((item) => [item.event_name, Number(item.total)]));
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
    const row = daily.filter((item) => item.day === key);
    return {
      key,
      label: new Intl.DateTimeFormat("pt-BR", {
        timeZone: "America/Sao_Paulo",
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
      }).format(date),
      site: row.filter((x) => x.event_name === "site_visit").reduce((n, x) => n + Number(x.total), 0),
      sales: Number(salesDaily.find((x) => x.day === key)?.total || 0),
    };
  });
  const maxDaily = Math.max(1, ...days.map((x) => x.site));
  const totalEvents = metrics.reduce((sum, item) => sum + Number(item.total), 0);
  const offers = totals.get("paywall_view") || 0;
  const conversion = offers ? Math.round((sales.approved / offers) * 1000) / 10 : 0;

  return (
    <main className="adminPage">
      <SiteHeader />
      <section className="shell adminShell">
        <div className="adminHeading">
          <div>
            <span className="adminEyebrow">CENTRAL DE CONTROLE</span>
            <h1>Painel administrativo</h1>
            <p>Acompanhe vendas, utilização do CurriculosPRO e as mensagens enviadas pelos usuários.</p>
          </div>
          <div className="adminPeriod">
            <span className="adminLiveDot" /> Dados atualizados a cada acesso <small>Últimos 30 dias</small>
          </div>
        </div>
        {!paymentsReady && (
          <div className="adminWarning">
            Não foi possível ler as vendas. Rode <code>npm run db:migrate</code> com a DATABASE_URL de
            produção.
          </div>
        )}
        <div className="adminStats adminSalesStats">
          <article className="adminStat supportStat">
            <span>Faturamento</span>
            <strong>{formatBRL(sales.revenue)}</strong>
            <small>Pagamentos aprovados nos últimos 30 dias</small>
          </article>
          <article className="adminStat">
            <span>Vendas</span>
            <strong>{sales.approved}</strong>
            <small>
              {sales.refunded ? sales.refunded + " estorno(s) no período" : "Nenhum estorno no período"}
            </small>
          </article>
          <article className="adminStat">
            <span>Conversão</span>
            <strong>{conversion.toLocaleString("pt-BR")}%</strong>
            <small>Vendas ÷ pessoas que viram a oferta</small>
          </article>
          <article className="adminStat">
            <span>Acessos ativos</span>
            <strong>{sales.activeAccess}</strong>
            <small>Contas com download liberado agora</small>
          </article>
        </div>
        <div className="adminStats">
          {Object.entries(labels).map(([key, label]) => (
            <article className="adminStat" key={key}>
              <span>{label}</span>
              <strong>{totals.get(key) || 0}</strong>
              <small>{descriptions[key]}</small>
            </article>
          ))}
        </div>
        <div className="adminGrid">
          <section className="adminPanel adminActivity">
            <div className="adminPanelHead">
              <div>
                <h2>Movimento do site</h2>
                <p>Visitas registradas nos últimos 7 dias</p>
              </div>
              <span className="adminTag">7 DIAS</span>
            </div>
            <div className="adminChart">
              {days.map((day) => (
                <div className="adminChartRow" key={day.key}>
                  <span>{day.label}</span>
                  <div className="adminBarTrack">
                    <i style={{ width: (day.site / maxDaily) * 100 + "%" }} />
                  </div>
                  <b>{day.site}</b>
                  <small title="Vendas aprovadas no dia">$ {day.sales}</small>
                </div>
              ))}
            </div>
            <div className="adminLegend">
              <span>
                <i /> Visitas ao site
              </span>
              <span>$ Vendas aprovadas</span>
            </div>
          </section>
          <section className="adminPanel adminSummary">
            <div className="adminPanelHead">
              <div>
                <h2>Funil de vendas</h2>
                <p>Últimos 30 dias</p>
              </div>
            </div>
            <div className="adminSummaryValue">
              <strong>{sales.approved}</strong>
              <span>vendas confirmadas</span>
            </div>
            <div className="adminSummaryLine">
              <span>1. Editor iniciado</span>
              <b>{totals.get("resume_started") || 0}</b>
            </div>
            <div className="adminSummaryLine">
              <span>2. Viram a oferta</span>
              <b>{offers}</b>
            </div>
            <div className="adminSummaryLine">
              <span>3. Geraram Pix</span>
              <b>{totals.get("checkout_started") || 0}</b>
            </div>
            <div className="adminSummaryLine">
              <span>4. Pagaram</span>
              <b>{sales.approved}</b>
            </div>
            <p className="adminDisclaimer">
              Vendas vêm da confirmação do Mercado Pago. As demais etapas são contagens aproximadas por
              sessão.
            </p>
          </section>
        </div>
        <section className="adminPanel adminPayments">
          <div className="adminPanelHead">
            <div>
              <h2>Pagamentos recentes</h2>
              <p>
                Últimos 25 Pix gerados. Estornos são feitos no painel do Mercado Pago e removem o acesso
                automaticamente.
              </p>
            </div>
            <span className="adminTag">{recentPayments.length} REGISTROS</span>
          </div>
          {recentPayments.length === 0 ? (
            <div className="adminEmpty">Nenhum pagamento ainda.</div>
          ) : (
            <div className="adminTableWrap">
              <table className="adminTable">
                <thead>
                  <tr>
                    <th>Criado em</th>
                    <th>Conta</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th>Acesso até</th>
                    <th>ID Mercado Pago</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.map((payment) => {
                    const status = payment.revoked_at ? "refunded" : payment.status;
                    return (
                      <tr key={payment.id}>
                        <td>{dateTime(payment.created_at)}</td>
                        <td>{payment.email}</td>
                        <td>{formatBRL(Number(payment.amount_cents))}</td>
                        <td>
                          <span className={"adminPayStatus " + status}>{statusLabel[status] || status}</span>
                        </td>
                        <td>{status === "approved" ? dateTime(payment.access_until) : "—"}</td>
                        <td>
                          <code>{payment.id}</code>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
        <section className="adminPanel adminFeedback">
          <div className="adminPanelHead">
            <div>
              <h2>Feedback dos usuários</h2>
              <p>Mensagens mais recentes recebidas pelo projeto</p>
            </div>
            <span className="adminTag">{feedback.length} REGISTROS</span>
          </div>
          {feedback.length === 0 ? (
            <div className="adminEmpty">Ainda não há feedbacks por aqui.</div>
          ) : (
            <div className="adminFeedbackList">
              {feedback.map((item) => (
                <article className="adminFeedbackItem" key={item.id}>
                  <div className="adminFeedbackMeta">
                    <strong>{"★".repeat(Math.max(0, Math.min(5, item.rating)))}</strong>
                    <span className={"adminCategory " + item.category}>
                      {item.category === "problem"
                        ? "Problema"
                        : item.category === "praise"
                          ? "Elogio"
                          : "Sugestão"}
                    </span>
                    <time>
                      {new Date(item.created_at).toLocaleString("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                        timeZone: "America/Sao_Paulo",
                      })}
                    </time>
                  </div>
                  <p>{item.message}</p>
                </article>
              ))}
            </div>
          )}
          <Link className="adminTextLink" href="/feedback">
            Abrir página de feedback →
          </Link>
        </section>
        <footer className="adminFoot">
          <span>CurriculosPRO · Administração</span>
          <span>{totalEvents} eventos agregados nos últimos 30 dias</span>
        </footer>
      </section>
      <SiteFooter />
    </main>
  );
}
