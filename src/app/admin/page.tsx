import Link from "next/link";
import {redirect} from "next/navigation";
import {SiteHeader} from "@/components/site-header";
import {SiteFooter} from "@/components/site-footer";
import {getServerSession} from "@/lib/server/session";
import {db} from "@/lib/server/db";

export const dynamic = "force-dynamic";

const labels:Record<string,string> = {
  site_visit:"Acessos ao site",
  resume_started:"Editor de currículo aberto",
  pdf_print_requested:"Preparações de PDF",
  feedback_sent:"Feedbacks enviados",
  donation_page_view:"Visitas à página de apoio"
};

export default async function AdminPage() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail) {
    return <main><SiteHeader/><section className="shell" style={{paddingTop:60,paddingBottom:80}}><h1>Admin ainda não configurado</h1><p>Configure a variável ADMIN_EMAIL no ambiente Production da Vercel e publique um novo deployment.</p></section><SiteFooter/></main>;
  }
  const session = await getServerSession();
  if (!session) redirect("/auth/sign-in?callbackURL=%2Fadmin");
  const normalizedSessionEmail = session.email.trim().toLowerCase();
  if (normalizedSessionEmail !== adminEmail) {
    return <main><SiteHeader/><section className="shell" style={{paddingTop:60,paddingBottom:80}}>
      <span style={{color:"#087cf0",fontWeight:800,fontSize:12}}>ACESSO RESTRITO</span>
      <h1>Esta conta não é administradora</h1>
      <p>O site reconheceu sua sessão como <strong>{session.email}</strong>, mas esse e-mail não corresponde ao ADMIN_EMAIL configurado na Vercel.</p>
      <p>Entre com a conta administradora ou ajuste ADMIN_EMAIL para corresponder exatamente ao e-mail desta conta. Depois, faça um novo deployment em Production.</p>
      <Link href="/auth/sign-in?callbackURL=%2Fadmin" style={{color:"#087cf0",fontWeight:700}}>Entrar com outra conta →</Link>
    </section><SiteFooter/></main>;
  }

  let metrics:{event_name:string;total:string}[]=[];
  let feedback:{id:string;rating:number;category:string;message:string;created_at:string}[]=[];
  try {
    const sql = db();
    metrics = await sql`SELECT event_name, count(*)::text AS total FROM usage_events WHERE created_at >= now() - interval '30 days' GROUP BY event_name` as typeof metrics;
    feedback = await sql`SELECT id::text, rating, category, message, created_at::text FROM user_feedback ORDER BY created_at DESC LIMIT 50` as typeof feedback;
  } catch {
    return <main><SiteHeader/><section className="shell" style={{paddingTop:60,paddingBottom:80}}><h1>Painel em configuração</h1><p>Execute as migrações do banco de dados para ativar métricas e feedbacks.</p></section><SiteFooter/></main>;
  }

  const totals = new Map(metrics.map(item=>[item.event_name,Number(item.total)]));
  return <main><SiteHeader/><section className="shell" style={{paddingTop:52,paddingBottom:80}}>
    <span style={{color:"#087cf0",fontWeight:800,fontSize:12}}>ÁREA ADMINISTRATIVA</span>
    <h1 style={{fontSize:"clamp(34px,5vw,48px)",letterSpacing:"-1.5px",marginBottom:8}}>Visão geral do Currículos PRO</h1>
    <p style={{color:"#687386",lineHeight:1.7}}>Eventos agregados dos últimos 30 dias. Nenhum nome, e-mail, conteúdo de currículo ou identificador de visitante é registrado nas métricas.</p>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:14,marginTop:28}}>
      {Object.entries(labels).map(([key,label])=><div key={key} style={{background:"#fff",border:"1px solid #e8ebf0",borderRadius:16,padding:20}}><div style={{fontSize:13,color:"#687386"}}>{label}</div><strong style={{display:"block",fontSize:34,marginTop:8}}>{totals.get(key)||0}</strong></div>)}
    </div>
    <h2 style={{marginTop:44}}>Feedbacks recentes ({feedback.length})</h2>
    {feedback.length===0 ? <p style={{color:"#687386"}}>Ainda não há feedbacks.</p> : <div style={{display:"grid",gap:12}}>{feedback.map(item=><article key={item.id} style={{background:"#fff",border:"1px solid #e8ebf0",borderRadius:14,padding:20}}><div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}><strong>{"★".repeat(Math.max(0,Math.min(5,item.rating)))}</strong><span style={{fontSize:12,background:"#eef5ff",color:"#245bb4",padding:"5px 8px",borderRadius:999}}>{item.category==="problem"?"Problema":item.category==="praise"?"Elogio":"Sugestão"}</span><time style={{fontSize:12,color:"#687386"}}>{new Date(item.created_at).toLocaleString("pt-BR",{dateStyle:"short",timeStyle:"short",timeZone:"America/Sao_Paulo"})}</time></div><p style={{whiteSpace:"pre-wrap",lineHeight:1.7,marginBottom:0}}>{item.message}</p></article>)}</div>}
    <p style={{marginTop:36}}><Link href="/feedback" style={{color:"#087cf0",fontWeight:700}}>Abrir página de feedback →</Link></p>
  </section><SiteFooter/></main>;
}
