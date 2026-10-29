import Link from "next/link";
import {SiteHeader} from "@/components/site-header";
import {SiteFooter} from "@/components/site-footer";

export default function SupportPage() {
  const pixKey = process.env.NEXT_PUBLIC_PIX_KEY || "";
  const pixName = process.env.NEXT_PUBLIC_PIX_NAME || "";
  const pixCity = process.env.NEXT_PUBLIC_PIX_CITY || "";
  return <main><SiteHeader/><section className="shell" style={{maxWidth:850,paddingTop:72,paddingBottom:90}}>
    <Link href="/" style={{color:"#087cf0",fontWeight:700,textDecoration:"none"}}>← Voltar ao início</Link>
    <div style={{marginTop:24,background:"#eaf5ff",color:"#087cf0",display:"inline-block",padding:"8px 12px",borderRadius:999,fontSize:12,fontWeight:800}}>APOIO VOLUNTÁRIO</div>
    <h1 style={{fontSize:"clamp(38px,6vw,58px)",letterSpacing:"-2px",lineHeight:1.05,margin:"18px 0"}}>Gratuito para você. Feito com dedicação.</h1>
    <p style={{fontSize:18,lineHeight:1.8,color:"#687386",maxWidth:680}}>O Currículos PRO nasceu para ajudar pessoas a apresentarem sua trajetória profissional sem pagar para criar um currículo. Se a ferramenta ajudou você e quiser contribuir, qualquer apoio é bem-vindo — mas nunca é obrigatório.</p>
    <div style={{marginTop:32,display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:18}}>
      <div style={{background:"#fff",border:"1px solid #e8ebf0",borderRadius:18,padding:24}}><div style={{fontSize:28}}>💙</div><h2 style={{margin:"12px 0 8px"}}>Por que apoiar?</h2><p style={{color:"#687386",lineHeight:1.7}}>Sua contribuição ajuda com hospedagem, manutenção, segurança e novas melhorias. O site continua gratuito para todos.</p></div>
      <div style={{background:"#fff",border:"1px solid #e8ebf0",borderRadius:18,padding:24}}><div style={{fontSize:28}}>🔒</div><h2 style={{margin:"12px 0 8px"}}>Sem pressão</h2><p style={{color:"#687386",lineHeight:1.7}}>Não existe assinatura, cobrança ou recurso bloqueado. Use a ferramenta e baixe seu PDF mesmo que não contribua.</p></div>
    </div>
    <div style={{marginTop:24,border:"1px solid #dbeafe",background:"#f8fbff",borderRadius:20,padding:28}}>
      <h2 style={{marginTop:0}}>Contribuir via Pix</h2>
      {pixKey ? <><p style={{color:"#687386",lineHeight:1.7}}>Use a chave abaixo no aplicativo do seu banco. O QR Code de pagamento será disponibilizado assim que os dados do recebedor forem configurados.</p><div style={{background:"#fff",border:"1px solid #dce1e9",borderRadius:12,padding:16,overflowWrap:"anywhere"}}><small style={{display:"block",color:"#7b8494",marginBottom:6}}>CHAVE PIX</small><strong>{pixKey}</strong>{pixName&&<p style={{marginBottom:0,color:"#687386"}}>Recebedor: {pixName}</p>}{pixCity&&<p style={{marginBottom:0,color:"#687386"}}>Cidade: {pixCity}</p>}</div><button onClick={undefined} style={{marginTop:14,border:0,borderRadius:11,padding:"13px 18px",background:"#087cf0",color:"#fff",fontWeight:800}}>Copiar chave Pix</button></> : <><p style={{color:"#687386",lineHeight:1.7}}>Estamos preparando esta opção. A chave Pix e o QR Code serão adicionados assim que os dados de recebimento forem configurados.</p><div style={{border:"1px dashed #b9cde5",borderRadius:14,padding:28,textAlign:"center",color:"#687386"}}><div style={{fontSize:36}}>▦</div><strong>QR Code Pix</strong><p style={{marginBottom:0,fontSize:13}}>Em configuração</p></div></>}
    </div>
    <p style={{marginTop:24,textAlign:"center",color:"#687386"}}>Obrigado por fazer parte do projeto, seja usando, compartilhando ou apoiando. 💙</p>
  </section><SiteFooter/></main>;
}
