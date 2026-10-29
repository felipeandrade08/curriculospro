import Link from "next/link";
import {SiteHeader} from "@/components/site-header";
import {SiteFooter} from "@/components/site-footer";
import {PixCopyButton} from "@/components/pix-copy-button";
import {PixQrCode} from "@/components/pix-qr-code";
import {UsageBeacon} from "@/components/usage-beacon";

export default function SupportPage() {
  // Defaults keep the donation flow ready on deployment; environment variables can override them.
  const pixKey = process.env.NEXT_PUBLIC_PIX_KEY || "47443655827";
  const pixName = process.env.NEXT_PUBLIC_PIX_NAME || "Felipe Silva Andrade";
  const pixCity = process.env.NEXT_PUBLIC_PIX_CITY || "Dobrada";

  return <main>
    <UsageBeacon event="donation_page_view"/>
    <SiteHeader/>
    <section className="shell" style={{maxWidth:850,paddingTop:72,paddingBottom:90}}>
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
        <p style={{color:"#687386",lineHeight:1.7}}>Escaneie o QR Code com o aplicativo do seu banco ou copie o código Pix. Você escolhe o valor do apoio; nenhum valor está fixado.</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",alignItems:"center",gap:24}}>
          <div style={{background:"#fff",border:"1px solid #dce1e9",borderRadius:16,padding:18,textAlign:"center"}}>
            <PixQrCode pixKey={pixKey} pixName={pixName} pixCity={pixCity}/>
            <p style={{fontSize:12,color:"#687386",margin:"12px 0 0"}}>Pix • valor livre</p>
          </div>
          <div>
            <div style={{background:"#fff",border:"1px solid #dce1e9",borderRadius:12,padding:16,overflowWrap:"anywhere"}}>
              <small style={{display:"block",color:"#7b8494",marginBottom:6}}>CHAVE PIX (CPF)</small>
              <strong>{pixKey}</strong>
              <p style={{marginBottom:0,color:"#687386"}}>Recebedor: {pixName}</p>
              <p style={{marginBottom:0,color:"#687386"}}>Cidade: {pixCity}</p>
            </div>
            <PixCopyButton value={pixKey}/>
          </div>
        </div>
      </div>
      <p style={{marginTop:24,textAlign:"center",color:"#687386"}}>Obrigado por fazer parte do projeto, seja usando, compartilhando ou apoiando. 💙</p>
    </section>
    <SiteFooter/>
  </main>;
}
