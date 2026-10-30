import Link from "next/link";
import {redirect} from "next/navigation";
import {SiteHeader} from "@/components/site-header";
import {SiteFooter} from "@/components/site-footer";
import {getServerSession} from "@/lib/server/session";
import {db} from "@/lib/server/db";

export const dynamic = "force-dynamic";

const labels:Record<string,string> = {
  site_visit:"Visitas ao site",
  resume_started:"Editor iniciado",
  pdf_print_requested:"PDF preparados",
  feedback_sent:"Feedbacks enviados",
  donation_page_view:"Visitas à página de apoio"
};
const descriptions:Record<string,string> = {
  site_visit:"Acessos registrados na página inicial",
  resume_started:"Aberturas do editor de currículos",
  pdf_print_requested:"Solicitações de preparação do PDF",
  feedback_sent:"Envios realizados pelo formulário",
  donation_page_view:"Pessoas que abriram a página de apoio"
};

export default async function AdminPage() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail) {
    return <main><SiteHeader/><section className="shell adminNotice"><h1>Admin ainda não configurado</h1><p>Configure ADMIN_EMAIL no ambiente Production da Vercel e publique um novo deployment.</p></section><SiteFooter/></main>;
  }
  const session = await getServerSession();
  if (!session) redirect("/auth/sign-in?callbackURL=%2Fadmin");
  if (session.email.trim().toLowerCase() !== adminEmail) {
    return <main><SiteHeader/><section className="shell adminNotice"><span className="adminEyebrow">ACESSO RESTRITO</span><h1>Esta conta não é administradora</h1><p>A sessão atual não corresponde ao e-mail autorizado em ADMIN_EMAIL.</p><Link href="/auth/sign-in?callbackURL=%2Fadmin">Entrar com outra conta →</Link></section><SiteFooter/></main>;
  }

  let metrics:{event_name:string;total:string}[]=[];
  let feedback:{id:string;rating:number;category:string;message:string;created_at:string}[]=[];
  let daily:{day:string;event_name:string;total:string}[]=[];
  try {
    const sql=db();
    metrics=await sql`SELECT event_name,count(*)::text AS total FROM usage_events WHERE created_at >= now()-interval '30 days' GROUP BY event_name` as typeof metrics;
    feedback=await sql`SELECT id::text,rating,category,message,created_at::text FROM user_feedback ORDER BY created_at DESC LIMIT 30` as typeof feedback;
    daily=await sql`SELECT to_char((created_at AT TIME ZONE 'America/Sao_Paulo')::date,'YYYY-MM-DD') AS day,event_name,count(*)::text AS total FROM usage_events WHERE created_at >= now()-interval '7 days' GROUP BY 1,2 ORDER BY 1` as typeof daily;
  } catch {
    return <main><SiteHeader/><section className="shell adminNotice"><h1>Painel temporariamente indisponível</h1><p>Não foi possível consultar as métricas. Confira a conexão e as migrações do banco de dados.</p></section><SiteFooter/></main>;
  }

  const totals=new Map(metrics.map(item=>[item.event_name,Number(item.total)]));
  const days=Array.from({length:7},(_,index)=>{const date=new Date();date.setDate(date.getDate()-(6-index));const key=new Intl.DateTimeFormat("en-CA",{timeZone:"America/Sao_Paulo",year:"numeric",month:"2-digit",day:"2-digit"}).format(date);const row=daily.filter(item=>item.day===key);return {key,label:new Intl.DateTimeFormat("pt-BR",{timeZone:"America/Sao_Paulo",weekday:"short",day:"2-digit",month:"2-digit"}).format(date),site:row.filter(x=>x.event_name==="site_visit").reduce((n,x)=>n+Number(x.total),0),support:row.filter(x=>x.event_name==="donation_page_view").reduce((n,x)=>n+Number(x.total),0)}});
  const maxDaily=Math.max(1,...days.map(x=>x.site));
  const totalEvents=metrics.reduce((sum,item)=>sum+Number(item.total),0);

  return <main className="adminPage"><SiteHeader/><section className="shell adminShell">
    <div className="adminHeading"><div><span className="adminEyebrow">CENTRAL DE CONTROLE</span><h1>Painel administrativo</h1><p>Acompanhe a utilização do CurrículosPRO e as mensagens enviadas pelos usuários.</p></div><div className="adminPeriod"><span className="adminLiveDot"/> Dados atualizados a cada acesso <small>Últimos 30 dias</small></div></div>
    <div className="adminStats">
      {Object.entries(labels).map(([key,label])=><article className={key==="donation_page_view"?"adminStat supportStat":"adminStat"} key={key}><span>{label}</span><strong>{totals.get(key)||0}</strong><small>{descriptions[key]}</small></article>)}
    </div>
    <div className="adminGrid">
      <section className="adminPanel adminActivity"><div className="adminPanelHead"><div><h2>Movimento do site</h2><p>Visitas registradas nos últimos 7 dias</p></div><span className="adminTag">7 DIAS</span></div>
        <div className="adminChart">{days.map(day=><div className="adminChartRow" key={day.key}><span>{day.label}</span><div className="adminBarTrack"><i style={{width:(day.site/maxDaily*100)+"%"}}/></div><b>{day.site}</b><small title="Visitas à página de apoio">♡ {day.support}</small></div>)}</div>
        <div className="adminLegend"><span><i/> Visitas ao site</span><span>♡ Visitas à página de apoio</span></div>
      </section>
      <section className="adminPanel adminSummary"><div className="adminPanelHead"><div><h2>Resumo do período</h2><p>Atividade agregada</p></div></div><div className="adminSummaryValue"><strong>{totalEvents}</strong><span>eventos registrados</span></div><div className="adminSummaryLine"><span>Visitas à página de apoio</span><b>{totals.get("donation_page_view")||0}</b></div><div className="adminSummaryLine"><span>PDF preparados</span><b>{totals.get("pdf_print_requested")||0}</b></div><div className="adminSummaryLine"><span>Editor iniciado</span><b>{totals.get("resume_started")||0}</b></div><p className="adminDisclaimer">Visitas à página de apoio não significam doações confirmadas. O Pix atual não fornece confirmação automática de pagamento.</p></section>
    </div>
    <section className="adminPanel adminFeedback"><div className="adminPanelHead"><div><h2>Feedback dos usuários</h2><p>Mensagens mais recentes recebidas pelo projeto</p></div><span className="adminTag">{feedback.length} REGISTROS</span></div>
      {feedback.length===0?<div className="adminEmpty">Ainda não há feedbacks por aqui.</div>:<div className="adminFeedbackList">{feedback.map(item=><article className="adminFeedbackItem" key={item.id}><div className="adminFeedbackMeta"><strong>{"★".repeat(Math.max(0,Math.min(5,item.rating)))}</strong><span className={"adminCategory "+item.category}>{item.category==="problem"?"Problema":item.category==="praise"?"Elogio":"Sugestão"}</span><time>{new Date(item.created_at).toLocaleString("pt-BR",{dateStyle:"short",timeStyle:"short",timeZone:"America/Sao_Paulo"})}</time></div><p>{item.message}</p></article>)}</div>}
      <Link className="adminTextLink" href="/feedback">Abrir página de feedback →</Link>
    </section>
    <footer className="adminFoot"><span>CurrículosPRO · Administração</span><span>{totalEvents} eventos agregados · sem dados pessoais nas métricas</span></footer>
  </section><SiteFooter/></main>;
}
