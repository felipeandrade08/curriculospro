import Link from "next/link";
import { db } from "@/lib/server/db";
import { formatBRL } from "@/lib/billing";
import {
  deliverService,
  setServiceStatus,
  deleteFeedback,
  grantAccess,
  markAllFeedbackRead,
  replyFeedback,
  revokeAccess,
  setFeedbackStatus,
} from "./actions";
import { ConfirmButton } from "./confirm-button";
import { BuildInEditor } from "./build-in-editor";

type Href = (patch: Record<string, string>) => string;
const TZ = "America/Sao_Paulo";

const dateTime = (v: unknown) =>
  v
    ? new Date(String(v)).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: TZ })
    : "—";
const shortDate = (v: unknown) =>
  v
    ? new Date(String(v)).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", timeZone: TZ })
    : "—";
const n = (v: unknown) => Number(v || 0);
const pct = (a: number, b: number) => (b ? Math.round((a / b) * 1000) / 10 : 0);

function Delta({ now, before }: { now: number; before: number }) {
  if (!before && !now) return <small className="ad-delta">sem movimento</small>;
  if (!before) return <small className="ad-delta up">novo no período</small>;
  const d = Math.round(((now - before) / before) * 100);
  return (
    <small className={"ad-delta " + (d > 0 ? "up" : d < 0 ? "down" : "")}>
      {d > 0 ? "▲ " : d < 0 ? "▼ " : ""}
      {Math.abs(d)}% vs. período anterior
    </small>
  );
}

function Failed({ what }: { what: string }) {
  return (
    <div className="ad-alert">Não foi possível carregar {what}. Confira a conexão com o banco de dados.</div>
  );
}

const PAY_STATUS: Record<string, string> = {
  approved: "Pago",
  pending: "Aguardando",
  in_process: "Em análise",
  rejected: "Recusado",
  cancelled: "Expirado",
  refunded: "Estornado",
  charged_back: "Contestado",
};

/* ───────────── Visão geral ───────────── */

export async function OverviewTab({ days, href }: { days: number; href: Href }) {
  const sql = db();
  let data;
  try {
    const [sales] = await sql`SELECT
        count(*) FILTER (WHERE approved_at >= now() - make_interval(days => ${days}))::int AS sales,
        COALESCE(sum(amount_cents) FILTER (WHERE approved_at >= now() - make_interval(days => ${days})), 0)::int AS revenue,
        count(*) FILTER (WHERE approved_at < now() - make_interval(days => ${days}) AND approved_at >= now() - make_interval(days => ${days * 2}))::int AS prev_sales,
        COALESCE(sum(amount_cents) FILTER (WHERE approved_at < now() - make_interval(days => ${days}) AND approved_at >= now() - make_interval(days => ${days * 2})), 0)::int AS prev_revenue,
        COALESCE(sum(amount_cents) FILTER (WHERE (approved_at AT TIME ZONE 'America/Sao_Paulo')::date = (now() AT TIME ZONE 'America/Sao_Paulo')::date), 0)::int AS today
      FROM payments WHERE granted_at IS NOT NULL AND revoked_at IS NULL`;
    const [users] = await sql`SELECT
        count(*) FILTER (WHERE access_until > now())::int AS active,
        count(*) FILTER (WHERE created_at >= now() - make_interval(days => ${days}))::int AS signups,
        count(*) FILTER (WHERE created_at < now() - make_interval(days => ${days}) AND created_at >= now() - make_interval(days => ${days * 2}))::int AS prev_signups
      FROM app_users`;
    const events = await sql`SELECT event_name, count(*)::int AS total FROM usage_events
      WHERE created_at >= now() - make_interval(days => ${days}) GROUP BY 1`;
    const prevEvents = await sql`SELECT event_name, count(*)::int AS total FROM usage_events
      WHERE created_at < now() - make_interval(days => ${days}) AND created_at >= now() - make_interval(days => ${days * 2}) GROUP BY 1`;
    const daily =
      await sql`SELECT to_char((created_at AT TIME ZONE 'America/Sao_Paulo')::date, 'YYYY-MM-DD') AS day, count(*)::int AS total
      FROM usage_events WHERE event_name = 'site_visit' AND created_at >= now() - make_interval(days => ${days}) GROUP BY 1`;
    const dailySales =
      await sql`SELECT to_char((approved_at AT TIME ZONE 'America/Sao_Paulo')::date, 'YYYY-MM-DD') AS day, count(*)::int AS total
      FROM payments WHERE granted_at IS NOT NULL AND revoked_at IS NULL AND approved_at >= now() - make_interval(days => ${days}) GROUP BY 1`;
    const recentSales =
      await sql`SELECT u.email, p.amount_cents, p.approved_at FROM payments p JOIN app_users u ON u.id = p.user_id
      WHERE p.granted_at IS NOT NULL AND p.revoked_at IS NULL ORDER BY p.approved_at DESC LIMIT 6`;
    let rating = { avg: 0, total: 0 };
    let latestFeedback: Record<string, unknown>[] = [];
    try {
      const [r] =
        await sql`SELECT COALESCE(avg(rating), 0)::float AS avg, count(*)::int AS total FROM user_feedback
        WHERE created_at >= now() - make_interval(days => ${days})`;
      rating = { avg: n(r?.avg), total: n(r?.total) };
      latestFeedback =
        await sql`SELECT rating, category, message, created_at FROM user_feedback ORDER BY created_at DESC LIMIT 3`;
    } catch {}
    data = { sales, users, events, prevEvents, daily, dailySales, recentSales, rating, latestFeedback };
  } catch {
    return <Failed what="os indicadores" />;
  }
  const ev = new Map(data.events.map((r) => [String(r.event_name), n(r.total)]));
  const prevEv = new Map(data.prevEvents.map((r) => [String(r.event_name), n(r.total)]));
  const sales = n(data.sales?.sales);
  const offers = ev.get("paywall_view") || 0;

  const dayKeys = Array.from({ length: days }, (_, i) => {
    const d = new Date(Date.now() - (days - 1 - i) * 86_400_000);
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  });
  const visitsBy = new Map(data.daily.map((r) => [String(r.day), n(r.total)]));
  const salesBy = new Map(data.dailySales.map((r) => [String(r.day), n(r.total)]));
  const series = dayKeys.map((k) => ({ k, visits: visitsBy.get(k) || 0, sales: salesBy.get(k) || 0 }));

  const funnel = [
    { label: "Visitaram o site", value: ev.get("site_visit") || 0 },
    { label: "Abriram “Começar”", value: ev.get("start_page_view") || 0 },
    { label: "Abriram o editor", value: ev.get("resume_started") || 0 },
    { label: "Viram a oferta", value: offers },
    { label: "Geraram Pix", value: ev.get("checkout_started") || 0 },
    { label: "Pagaram", value: sales },
  ];
  const top = Math.max(1, ...funnel.map((f) => f.value));

  return (
    <>
      <div className="ad-kpis">
        <article className="ad-kpi main">
          <span>Faturamento</span>
          <strong>{formatBRL(n(data.sales?.revenue))}</strong>
          <Delta now={n(data.sales?.revenue)} before={n(data.sales?.prev_revenue)} />
        </article>
        <article className="ad-kpi">
          <span>Vendas</span>
          <strong>{sales}</strong>
          <Delta now={sales} before={n(data.sales?.prev_sales)} />
        </article>
        <article className="ad-kpi">
          <span>Hoje</span>
          <strong>{formatBRL(n(data.sales?.today))}</strong>
          <small className="ad-delta">vendas aprovadas hoje</small>
        </article>
        <article className="ad-kpi">
          <span>Conversão</span>
          <strong>{pct(sales, offers).toLocaleString("pt-BR")}%</strong>
          <small className="ad-delta">pagaram ÷ viram a oferta</small>
        </article>
        <article className="ad-kpi">
          <span>Visitas</span>
          <strong>{(ev.get("site_visit") || 0).toLocaleString("pt-BR")}</strong>
          <Delta now={ev.get("site_visit") || 0} before={prevEv.get("site_visit") || 0} />
        </article>
        <article className="ad-kpi">
          <span>Novas contas</span>
          <strong>{n(data.users?.signups)}</strong>
          <Delta now={n(data.users?.signups)} before={n(data.users?.prev_signups)} />
        </article>
        <article className="ad-kpi">
          <span>Acessos ativos</span>
          <strong>{n(data.users?.active)}</strong>
          <small className="ad-delta">com download liberado agora</small>
        </article>
        <article className="ad-kpi">
          <span>Nota média</span>
          <strong>
            {data.rating.total
              ? data.rating.avg.toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + " ★"
              : "—"}
          </strong>
          <small className="ad-delta">{data.rating.total} avaliação(ões) no período</small>
        </article>
      </div>

      <div className="ad-grid">
        <section className="ad-panel">
          <header>
            <h2>Visitas e vendas por dia</h2>
            <span className="ad-legend">
              <i className="v" /> visitas <i className="s" /> vendas
            </span>
          </header>
          <Chart series={series} />
        </section>
        <section className="ad-panel">
          <header>
            <h2>Funil</h2>
            <span className="ad-muted">últimos {days} dias</span>
          </header>
          <ol className="ad-funnel">
            {funnel.map((f, i) => (
              <li key={f.label}>
                <div>
                  <span>{f.label}</span>
                  <b>{f.value.toLocaleString("pt-BR")}</b>
                </div>
                <i style={{ width: Math.max(2, (f.value / top) * 100) + "%" }} />
                {i > 0 && f.value <= funnel[i - 1].value && funnel[i - 1].value > 0 && (
                  <small>
                    {pct(f.value, funnel[i - 1].value).toLocaleString("pt-BR")}% da etapa anterior
                  </small>
                )}
              </li>
            ))}
          </ol>
          <dl className="ad-mini">
            <div>
              <dt>Importaram currículo</dt>
              <dd>{ev.get("resume_imported") || 0}</dd>
            </div>
            <div>
              <dt>Usaram exemplo</dt>
              <dd>{ev.get("example_used") || 0}</dd>
            </div>
            <div>
              <dt>PDFs baixados</dt>
              <dd>{ev.get("pdf_print_requested") || 0}</dd>
            </div>
          </dl>
          <p className="ad-muted">
            Etapas contadas uma vez por sessão; vendas confirmadas pelo Mercado Pago.
          </p>
        </section>
      </div>

      <div className="ad-grid two">
        <section className="ad-panel">
          <header>
            <h2>Últimas vendas</h2>
            <Link href={href({ aba: "vendas" })}>Ver todas</Link>
          </header>
          {data.recentSales.length ? (
            <ul className="ad-list">
              {data.recentSales.map((r, i) => (
                <li key={i}>
                  <span>{String(r.email).replace(/#substituido:.*/, "")}</span>
                  <b>{formatBRL(n(r.amount_cents))}</b>
                  <time>{dateTime(r.approved_at)}</time>
                </li>
              ))}
            </ul>
          ) : (
            <p className="ad-empty">Nenhuma venda ainda.</p>
          )}
        </section>
        <section className="ad-panel">
          <header>
            <h2>Avaliações recentes</h2>
            <Link href={href({ aba: "avaliacoes" })}>Moderar</Link>
          </header>
          {data.latestFeedback.length ? (
            <ul className="ad-list fb">
              {data.latestFeedback.map((r, i) => (
                <li key={i}>
                  <span className="ad-stars">{"★".repeat(n(r.rating))}</span>
                  <p>{String(r.message)}</p>
                  <time>{dateTime(r.created_at)}</time>
                </li>
              ))}
            </ul>
          ) : (
            <p className="ad-empty">Nenhuma avaliação ainda.</p>
          )}
        </section>
      </div>
    </>
  );
}

function Chart({ series }: { series: { k: string; visits: number; sales: number }[] }) {
  const W = 720,
    H = 220,
    pad = 26;
  const maxV = Math.max(1, ...series.map((s) => s.visits));
  const maxS = Math.max(1, ...series.map((s) => s.sales));
  const step = (W - pad) / series.length;
  const bw = Math.max(2, step * 0.62);
  const labelEvery = series.length > 31 ? 14 : series.length > 7 ? 5 : 1;
  return (
    <svg className="ad-chart" viewBox={`0 0 ${W} ${H + 24}`} role="img" aria-label="Visitas e vendas por dia">
      {[0.5, 1].map((t) => (
        <line key={t} x1={pad} x2={W} y1={H - (H - 10) * t} y2={H - (H - 10) * t} className="grid" />
      ))}
      <text x={0} y={18} className="axis">
        {maxV}
      </text>
      {series.map((s, i) => {
        const x = pad + i * step + (step - bw) / 2;
        const h = (s.visits / maxV) * (H - 10);
        const sy = H - (s.sales / maxS) * (H - 40) - 6;
        return (
          <g key={s.k}>
            {/* <title> montado como HTML: o React 19 trata <title> como metadado da página. */}
            <g
              dangerouslySetInnerHTML={{
                __html: `<title>${s.k.split("-").reverse().join("/")}: ${s.visits} visita(s), ${s.sales} venda(s)</title><rect x="${x}" y="${H - h}" width="${bw}" height="${h}" rx="2" class="v"></rect>`,
              }}
            />
            {s.sales > 0 && <circle cx={x + bw / 2} cy={sy} r={Math.min(6, bw / 2 + 2)} className="s" />}
            {s.sales > 0 && series.length <= 31 && (
              <text x={x + bw / 2} y={sy - 9} className="sl" textAnchor="middle">
                {s.sales}
              </text>
            )}
            {i % labelEvery === 0 && (
              <text x={x + bw / 2} y={H + 17} className="axis" textAnchor="middle">
                {s.k.slice(8, 10) + "/" + s.k.slice(5, 7)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ───────────── Vendas ───────────── */

export async function SalesTab({
  days,
  q,
  status,
  href,
}: {
  days: number;
  q: string;
  status: string;
  href: Href;
}) {
  const sql = db();
  const like = "%" + q.trim().toLowerCase() + "%";
  let rows: Record<string, unknown>[], sum: Record<string, unknown> | undefined;
  try {
    [sum] = await sql`SELECT
        count(*) FILTER (WHERE granted_at IS NOT NULL AND revoked_at IS NULL)::int AS paid,
        COALESCE(sum(amount_cents) FILTER (WHERE granted_at IS NOT NULL AND revoked_at IS NULL), 0)::int AS revenue,
        count(*) FILTER (WHERE status IN ('pending', 'in_process'))::int AS pending,
        count(*) FILTER (WHERE status IN ('cancelled', 'rejected'))::int AS lost,
        count(*) FILTER (WHERE revoked_at IS NOT NULL)::int AS refunded,
        count(*)::int AS total
      FROM payments WHERE created_at >= now() - make_interval(days => ${days})`;
    rows =
      await sql`SELECT p.id, u.email, p.amount_cents, p.status, p.created_at, p.approved_at, p.revoked_at, u.access_until
      FROM payments p JOIN app_users u ON u.id = p.user_id
      WHERE p.created_at >= now() - make_interval(days => ${days})
        AND (${q.trim()} = '' OR lower(u.email) LIKE ${like} OR p.id = ${q.trim()})
        AND (${status} = '' OR (${status} = 'refunded' AND p.revoked_at IS NOT NULL)
             OR (${status} <> 'refunded' AND p.status = ${status} AND p.revoked_at IS NULL))
      ORDER BY p.created_at DESC LIMIT 200`;
  } catch {
    return <Failed what="as vendas" />;
  }
  return (
    <>
      <div className="ad-kpis">
        <article className="ad-kpi main">
          <span>Faturamento</span>
          <strong>{formatBRL(n(sum?.revenue))}</strong>
          <small className="ad-delta">{n(sum?.paid)} pagamento(s) aprovado(s)</small>
        </article>
        <article className="ad-kpi">
          <span>Pix gerados</span>
          <strong>{n(sum?.total)}</strong>
          <small className="ad-delta">
            {pct(n(sum?.paid), n(sum?.total)).toLocaleString("pt-BR")}% foram pagos
          </small>
        </article>
        <article className="ad-kpi">
          <span>Aguardando</span>
          <strong>{n(sum?.pending)}</strong>
          <small className="ad-delta">{n(sum?.lost)} expirado(s) ou recusado(s)</small>
        </article>
        <article className="ad-kpi">
          <span>Estornos</span>
          <strong>{n(sum?.refunded)}</strong>
          <small className="ad-delta">acesso removido automaticamente</small>
        </article>
      </div>
      <section className="ad-panel">
        <header>
          <h2>Pagamentos dos últimos {days} dias</h2>
          <a className="ad-btn ghost" href={"/api/admin/pagamentos?dias=" + days}>
            Baixar planilha (CSV)
          </a>
        </header>
        <form className="ad-filters" action="/admin">
          <input type="hidden" name="aba" value="vendas" />
          <input type="hidden" name="dias" value={days} />
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar por e-mail ou ID do Mercado Pago"
            aria-label="Buscar"
          />
          <select name="status" defaultValue={status} aria-label="Status">
            <option value="">Todos os status</option>
            <option value="approved">Pagos</option>
            <option value="pending">Aguardando</option>
            <option value="cancelled">Expirados</option>
            <option value="rejected">Recusados</option>
            <option value="refunded">Estornados</option>
          </select>
          <button className="ad-btn" type="submit">
            Filtrar
          </button>
          {(q || status) && <Link href={href({ q: "", status: "" })}>Limpar</Link>}
        </form>
        {rows.length ? (
          <div className="ad-table-wrap">
            <table className="ad-table">
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
                {rows.map((p) => {
                  const st = p.revoked_at ? "refunded" : String(p.status);
                  return (
                    <tr key={String(p.id)}>
                      <td>{dateTime(p.created_at)}</td>
                      <td>
                        <Link href={"/admin?aba=clientes&q=" + encodeURIComponent(String(p.email))}>
                          {String(p.email)}
                        </Link>
                      </td>
                      <td>{formatBRL(n(p.amount_cents))}</td>
                      <td>
                        <span className={"ad-pill " + st}>{PAY_STATUS[st] || st}</span>
                      </td>
                      <td>{st === "approved" ? dateTime(p.access_until) : "—"}</td>
                      <td>
                        <code>{String(p.id)}</code>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="ad-empty">Nenhum pagamento encontrado.</p>
        )}
        <p className="ad-muted">
          Estornos são feitos no painel do Mercado Pago; o acesso da pessoa é removido sozinho quando o
          estorno é confirmado.
        </p>
      </section>
    </>
  );
}

/* ───────────── Avaliações ───────────── */

const CAT: Record<string, string> = { praise: "Elogio", suggestion: "Sugestão", problem: "Problema" };
const FB_STATUS: Record<string, string> = {
  new: "Nova",
  read: "Lida",
  published: "Publicada",
  hidden: "Oculta",
};
const FILTERS = [
  { id: "novas", label: "Novas" },
  { id: "aprovar", label: "Podem ser publicadas" },
  { id: "publicadas", label: "Publicadas" },
  { id: "problemas", label: "Problemas" },
  { id: "ocultas", label: "Ocultas" },
  { id: "todas", label: "Todas" },
];

export async function FeedbackTab({ filter, href }: { filter: string; href: Href }) {
  const sql = db();
  let rows: Record<string, unknown>[], dist: Record<string, unknown>[];
  try {
    rows =
      await sql`SELECT id::text, rating, category, message, author_name, author_role, allow_public, status,
        admin_reply, created_at FROM user_feedback
      WHERE CASE ${filter}
        WHEN 'novas' THEN status = 'new'
        WHEN 'aprovar' THEN allow_public AND author_name IS NOT NULL AND status IN ('new', 'read')
        WHEN 'publicadas' THEN status = 'published'
        WHEN 'ocultas' THEN status = 'hidden'
        WHEN 'problemas' THEN category = 'problem'
        ELSE true END
      ORDER BY created_at DESC LIMIT 100`;
    dist = await sql`SELECT rating, count(*)::int AS total FROM user_feedback GROUP BY rating`;
  } catch {
    return <Failed what="as avaliações (rode a migração do banco)" />;
  }
  const total = dist.reduce((s, r) => s + n(r.total), 0);
  const avg = total ? dist.reduce((s, r) => s + n(r.rating) * n(r.total), 0) / total : 0;
  return (
    <div className="ad-fb">
      <aside className="ad-panel ad-fb-side">
        <strong className="ad-avg">
          {avg.toLocaleString("pt-BR", { maximumFractionDigits: 1, minimumFractionDigits: 1 })}
        </strong>
        <span className="ad-stars">
          {"★".repeat(Math.round(avg))}
          <em>{"★".repeat(5 - Math.round(avg))}</em>
        </span>
        <p className="ad-muted">{total} avaliação(ões) no total</p>
        <ul className="ad-dist">
          {[5, 4, 3, 2, 1].map((r) => {
            const c = n(dist.find((d) => n(d.rating) === r)?.total);
            return (
              <li key={r}>
                <span>{r} ★</span>
                <i>
                  <b style={{ width: pct(c, total) + "%" }} />
                </i>
                <small>{c}</small>
              </li>
            );
          })}
        </ul>
        <p className="ad-muted">
          Só aparecem no site as avaliações que a pessoa autorizou e que você publicar. Elas surgem em
          /depoimentos e na página inicial em até 5 minutos.
        </p>
        <Link href="/depoimentos" className="ad-link">
          Ver página pública
        </Link>
      </aside>
      <section>
        <div className="ad-chips">
          {FILTERS.map((f) => (
            <Link
              key={f.id}
              href={href({ filtro: f.id })}
              aria-current={f.id === filter ? "true" : undefined}
            >
              {f.label}
            </Link>
          ))}
          {filter === "novas" && rows.length > 0 && (
            <form action={markAllFeedbackRead}>
              <button className="ad-btn ghost small" type="submit">
                Marcar todas como lidas
              </button>
            </form>
          )}
        </div>
        {rows.length === 0 && <p className="ad-empty">Nada por aqui neste filtro.</p>}
        <div className="ad-fb-list">
          {rows.map((r) => {
            const canPublish = !!r.allow_public && !!r.author_name;
            const st = String(r.status);
            return (
              <article key={String(r.id)} className={"ad-fb-item " + st}>
                <div className="ad-fb-meta">
                  <span className="ad-stars">
                    {"★".repeat(n(r.rating))}
                    <em>{"★".repeat(5 - n(r.rating))}</em>
                  </span>
                  <span className={"ad-pill " + String(r.category)}>{CAT[String(r.category)] || "—"}</span>
                  <span className={"ad-pill st-" + st}>{FB_STATUS[st] || st}</span>
                  <time>{dateTime(r.created_at)}</time>
                </div>
                <p>{String(r.message)}</p>
                <div className="ad-fb-who">
                  {canPublish ? (
                    <>
                      <b>{String(r.author_name)}</b>
                      {r.author_role ? " · " + String(r.author_role) : ""} · autorizou publicação
                    </>
                  ) : (
                    "Anônimo · não autorizou publicação"
                  )}
                </div>
                <form action={replyFeedback} className="ad-reply">
                  <input type="hidden" name="id" value={String(r.id)} />
                  <textarea
                    name="reply"
                    rows={2}
                    maxLength={1000}
                    defaultValue={r.admin_reply ? String(r.admin_reply) : ""}
                    placeholder={
                      canPublish ? "Resposta pública (aparece junto do depoimento)" : "Anotação interna"
                    }
                  />
                  <button className="ad-btn ghost small" type="submit">
                    {r.admin_reply ? "Atualizar resposta" : "Salvar resposta"}
                  </button>
                </form>
                <div className="ad-fb-actions">
                  {canPublish && st !== "published" && (
                    <StatusButton id={String(r.id)} status="published" label="Publicar no site" primary />
                  )}
                  {st === "published" && (
                    <StatusButton id={String(r.id)} status="hidden" label="Tirar do site" />
                  )}
                  {st === "new" && <StatusButton id={String(r.id)} status="read" label="Marcar como lida" />}
                  {st !== "hidden" && st !== "published" && (
                    <StatusButton id={String(r.id)} status="hidden" label="Ocultar" />
                  )}
                  {st === "hidden" && <StatusButton id={String(r.id)} status="read" label="Restaurar" />}
                  <form action={deleteFeedback}>
                    <input type="hidden" name="id" value={String(r.id)} />
                    <ConfirmButton
                      className="ad-btn danger small"
                      message="Excluir esta avaliação para sempre?"
                    >
                      Excluir
                    </ConfirmButton>
                  </form>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function StatusButton({
  id,
  status,
  label,
  primary,
}: {
  id: string;
  status: string;
  label: string;
  primary?: boolean;
}) {
  return (
    <form action={setFeedbackStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button className={"ad-btn small" + (primary ? "" : " ghost")} type="submit">
        {label}
      </button>
    </form>
  );
}

/* ───────────── Clientes ───────────── */

export async function CustomersTab({ q, msg }: { q: string; msg: string }) {
  const sql = db();
  const term = q.trim().toLowerCase();
  let users: Record<string, unknown>[];
  let grants: Record<string, unknown>[] = [];
  try {
    users = await sql`SELECT u.id, u.email, u.display_name, u.created_at, u.access_until,
        count(p.id) FILTER (WHERE p.granted_at IS NOT NULL AND p.revoked_at IS NULL)::int AS paid,
        COALESCE(sum(p.amount_cents) FILTER (WHERE p.granted_at IS NOT NULL AND p.revoked_at IS NULL), 0)::int AS spent,
        max(p.approved_at) AS last_paid
      FROM app_users u LEFT JOIN payments p ON p.user_id = u.id
      WHERE u.email NOT LIKE '%#substituido:%' AND (${term} = '' OR lower(u.email) LIKE ${"%" + term + "%"})
      GROUP BY u.id ORDER BY u.created_at DESC LIMIT 60`;
    try {
      grants =
        await sql`SELECT g.days, g.reason, g.created_at, u.email FROM access_grants g JOIN app_users u ON u.id = g.user_id
        ORDER BY g.created_at DESC LIMIT 8`;
    } catch {}
  } catch {
    return <Failed what="os clientes" />;
  }
  const now = Date.now();
  return (
    <div className="ad-cust">
      <section className="ad-panel">
        <header>
          <h2>Liberar acesso manualmente</h2>
        </header>
        <p className="ad-muted">
          Para quem pagou e não recebeu, cortesias ou parcerias. Soma os dias ao acesso atual da pessoa.
        </p>
        {msg && (
          <p className="ad-msg" role="status">
            {msg}
          </p>
        )}
        <form action={grantAccess} className="ad-grant">
          <label>
            <span>E-mail da conta</span>
            <input name="email" type="email" required defaultValue={term} placeholder="pessoa@email.com" />
          </label>
          <label>
            <span>Dias</span>
            <select name="days" defaultValue="7">
              <option value="1">1 dia</option>
              <option value="3">3 dias</option>
              <option value="7">7 dias</option>
              <option value="15">15 dias</option>
              <option value="30">30 dias</option>
            </select>
          </label>
          <label className="wide">
            <span>Motivo (opcional)</span>
            <input name="reason" maxLength={200} placeholder="Ex.: Pix pago sem liberação" />
          </label>
          <button className="ad-btn" type="submit">
            Liberar acesso
          </button>
        </form>
        {grants.length > 0 && (
          <>
            <h3>Últimas liberações</h3>
            <ul className="ad-list">
              {grants.map((g, i) => (
                <li key={i}>
                  <span>{String(g.email)}</span>
                  <b>+{n(g.days)} dias</b>
                  <time>
                    {shortDate(g.created_at)}
                    {g.reason ? " · " + String(g.reason) : ""}
                  </time>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
      <section className="ad-panel">
        <header>
          <h2>{term ? "Resultado da busca" : "Contas mais recentes"}</h2>
        </header>
        <form className="ad-filters" action="/admin">
          <input type="hidden" name="aba" value="clientes" />
          <input name="q" defaultValue={q} placeholder="Buscar por e-mail" aria-label="Buscar por e-mail" />
          <button className="ad-btn" type="submit">
            Buscar
          </button>
          {q && <Link href="/admin?aba=clientes">Limpar</Link>}
        </form>
        {users.length ? (
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>Conta</th>
                  <th>Criada em</th>
                  <th>Acesso</th>
                  <th>Compras</th>
                  <th>Total pago</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const active = !!u.access_until && new Date(String(u.access_until)).getTime() > now;
                  return (
                    <tr key={String(u.id)}>
                      <td>
                        <b>{String(u.email)}</b>
                        {u.display_name ? <small>{String(u.display_name)}</small> : null}
                      </td>
                      <td>{shortDate(u.created_at)}</td>
                      <td>
                        {active ? (
                          <span className="ad-pill approved">até {dateTime(u.access_until)}</span>
                        ) : (
                          <span className="ad-pill">sem acesso</span>
                        )}
                      </td>
                      <td>{n(u.paid)}</td>
                      <td>{formatBRL(n(u.spent))}</td>
                      <td>
                        {active && (
                          <form action={revokeAccess}>
                            <input type="hidden" name="userId" value={String(u.id)} />
                            <input type="hidden" name="q" value={q} />
                            <ConfirmButton
                              className="ad-btn danger small"
                              message={"Encerrar o acesso de " + String(u.email) + " agora?"}
                            >
                              Encerrar acesso
                            </ConfirmButton>
                          </form>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="ad-empty">Nenhuma conta encontrada.</p>
        )}
      </section>
    </div>
  );
}

/* ───────────── Pedidos "Fazemos para você" ───────────── */

const ORDER_STATUS: Record<string, string> = {
  new: "Novo",
  in_progress: "Em produção",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

export async function OrdersTab({
  adminUserId,
  filter,
  msg,
  href,
}: {
  adminUserId: string;
  filter: string;
  msg: string;
  href: Href;
}) {
  const sql = db();
  let rows: Record<string, unknown>[], mine: Record<string, unknown>[];
  try {
    rows = await sql`SELECT s.id::text, s.status, s.data, s.created_at, s.delivered_at, s.admin_note, u.email
      FROM service_requests s JOIN app_users u ON u.id = s.user_id
      WHERE CASE ${filter} WHEN 'abertos' THEN s.status IN ('new', 'in_progress') WHEN 'entregues' THEN s.status = 'delivered' ELSE true END
      ORDER BY (s.status = 'new') DESC, s.created_at ASC LIMIT 100`;
    mine =
      await sql`SELECT id, title, updated_at FROM resumes WHERE user_id = ${adminUserId} AND deleted_at IS NULL ORDER BY updated_at DESC LIMIT 40`;
  } catch {
    return <Failed what="os pedidos (rode a migração do banco)" />;
  }
  const now = Date.now();
  return (
    <>
      <section className="ad-panel">
        <header>
          <h2>Como entregar um pedido</h2>
        </header>
        <ol className="ad-howto">
          <li>
            Clique em <b>Montar no editor</b>: o currículo abre já com os dados do cliente.
          </li>
          <li>
            Ajuste o texto e o modelo. Depois vá em <b>Meus currículos → Sincronizar</b> para salvar na sua
            conta.
          </li>
          <li>
            Volte aqui, escolha o currículo em <b>Entregar</b> e confirme. O cliente recebe na conta dele e
            por e-mail.
          </li>
        </ol>
        {msg && (
          <p className="ad-msg" role="status">
            {msg}
          </p>
        )}
      </section>
      <div className="ad-chips">
        {[
          ["abertos", "Em aberto"],
          ["entregues", "Entregues"],
          ["todos", "Todos"],
        ].map(([id, label]) => (
          <Link
            key={id}
            href={href({ filtro: id, msg: "" })}
            aria-current={id === filter ? "true" : undefined}
          >
            {label}
          </Link>
        ))}
      </div>
      {rows.length === 0 && <p className="ad-empty">Nenhum pedido neste filtro.</p>}
      <div className="ad-fb-list">
        {rows.map((r) => {
          const d = r.data as {
            name: string;
            whatsapp: string;
            role: string;
            city: string;
            notes: string;
            sourceText: string;
            resume: import("@/lib/resume").ResumeDocument | null;
          };
          const st = String(r.status);
          const hours = (now - new Date(String(r.created_at)).getTime()) / 3_600_000;
          const late = (st === "new" || st === "in_progress") && hours > 20;
          const wa =
            "https://wa.me/55" +
            d.whatsapp.replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "") +
            "?text=" +
            encodeURIComponent(
              "Olá, " +
                d.name.split(" ")[0] +
                "! Aqui é da equipe CurriculosPRO, sobre o seu currículo para " +
                d.role +
                ".",
            );
          return (
            <article key={String(r.id)} className={"ad-fb-item " + (st === "new" ? "new" : "")}>
              <div className="ad-fb-meta">
                <b>
                  #{String(r.id)} · {d.name}
                </b>
                <span
                  className={
                    "ad-pill " +
                    (st === "delivered" ? "approved" : st === "cancelled" ? "refunded" : "pending")
                  }
                >
                  {ORDER_STATUS[st] || st}
                </span>
                {late && <span className="ad-pill refunded">Prazo de 24h perto do fim</span>}
                <time>
                  {dateTime(r.created_at)} · há {Math.round(hours)}h
                </time>
              </div>
              <p>
                <b>Vaga:</b> {d.role}
                {d.city ? " · " + d.city : ""} · <b>Conta:</b> {String(r.email)} · <b>WhatsApp:</b>{" "}
                <a href={wa} target="_blank" rel="noopener noreferrer">
                  {d.whatsapp}
                </a>
              </p>
              {d.notes && (
                <details>
                  <summary>Experiência contada pelo cliente</summary>
                  <p className="ad-pre">{d.notes}</p>
                </details>
              )}
              {d.sourceText && (
                <details>
                  <summary>Currículo antigo colado</summary>
                  <p className="ad-pre">{d.sourceText}</p>
                </details>
              )}
              {d.resume && (
                <p className="ad-muted">Enviou um currículo do aparelho como base: “{d.resume.title}”.</p>
              )}
              {(st === "new" || st === "in_progress") && (
                <div className="ad-fb-actions">
                  <BuildInEditor id={String(r.id)} data={d} />
                  {st === "new" && (
                    <form action={setServiceStatus}>
                      <input type="hidden" name="id" value={String(r.id)} />
                      <input type="hidden" name="status" value="in_progress" />
                      <button className="ad-btn ghost small" type="submit">
                        Marcar em produção
                      </button>
                    </form>
                  )}
                  <form action={setServiceStatus}>
                    <input type="hidden" name="id" value={String(r.id)} />
                    <input type="hidden" name="status" value="cancelled" />
                    <ConfirmButton className="ad-btn danger small" message="Cancelar este pedido?">
                      Cancelar
                    </ConfirmButton>
                  </form>
                </div>
              )}
              {(st === "new" || st === "in_progress") && (
                <form action={deliverService} className="ad-deliver">
                  <input type="hidden" name="id" value={String(r.id)} />
                  <label>
                    <span>Currículo pronto (da sua conta)</span>
                    <select name="resumeId" required defaultValue="">
                      <option value="" disabled>
                        {mine.length ? "Escolha…" : "Nenhum currículo sincronizado na sua conta"}
                      </option>
                      {mine.map((m) => (
                        <option key={String(m.id)} value={String(m.id)}>
                          {String(m.title)} — {shortDate(m.updated_at)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="wide">
                    <span>Recado para o cliente (opcional)</span>
                    <input
                      name="note"
                      maxLength={500}
                      placeholder="Ex.: Destacamos seu atendimento e os cursos do SENAC."
                    />
                  </label>
                  <button className="ad-btn small" type="submit">
                    Entregar
                  </button>
                </form>
              )}
              {st === "delivered" && <p className="ad-muted">Entregue em {dateTime(r.delivered_at)}.</p>}
            </article>
          );
        })}
      </div>
    </>
  );
}
