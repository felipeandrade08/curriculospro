"use client";

import Link from "next/link";
import {useState} from "react";
import {SiteHeader} from "@/components/site-header";
import {SiteFooter} from "@/components/site-footer";
import {trackUsage} from "@/lib/analytics";

const inputStyle = {width:"100%", padding:"13px 14px", border:"1px solid #dce1e9", borderRadius:12, font:"inherit", background:"#fff", color:"#172033"} as const;

export default function FeedbackPage() {
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState("suggestion");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle"|"sending"|"success"|"error">("idle");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const response = await fetch("/api/feedback", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({rating, category, message, website})
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível enviar seu feedback.");
      trackUsage("feedback_sent");
      setStatus("success");
      setMessage("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Tente novamente em instantes.");
      setStatus("error");
    }
  }

  return <main><SiteHeader/><section className="shell" style={{maxWidth:760,paddingTop:72,paddingBottom:80}}>
    <Link href="/" style={{color:"#087cf0",fontWeight:700,textDecoration:"none"}}>← Voltar ao início</Link>
    <div style={{marginTop:24,background:"#eaf5ff",color:"#087cf0",display:"inline-block",padding:"8px 12px",borderRadius:999,fontSize:12,fontWeight:800}}>SUA OPINIÃO AJUDA A EVOLUIR</div>
    <h1 style={{fontSize:"clamp(36px,6vw,54px)",letterSpacing:"-2px",lineHeight:1.08,margin:"18px 0"}}>Conte como foi sua experiência.</h1>
    <p style={{fontSize:17,lineHeight:1.7,color:"#687386",maxWidth:620}}>O Currículos PRO é gratuito e queremos melhorá-lo com a ajuda de quem usa. Você não precisa criar conta nem informar seu nome ou e-mail.</p>
    {status === "success" ? <div role="status" style={{marginTop:28,padding:24,borderRadius:16,background:"#ecfdf5",color:"#166534"}}><h2 style={{marginTop:0}}>Obrigado pelo feedback! 💙</h2><p>Sua mensagem foi recebida e vai nos ajudar a priorizar melhorias.</p><button onClick={()=>setStatus("idle")} style={{border:0,borderRadius:10,padding:"12px 16px",background:"#166534",color:"#fff",fontWeight:700,cursor:"pointer"}}>Enviar outro feedback</button></div> :
    <form onSubmit={submit} style={{marginTop:28,background:"#fff",border:"1px solid #e8ebf0",borderRadius:20,padding:24,boxShadow:"0 16px 45px #25335b0c",display:"grid",gap:22}}>
      <fieldset style={{border:0,padding:0,margin:0}}><legend style={{fontWeight:800,marginBottom:12}}>Que nota você dá para sua experiência?</legend><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{[1,2,3,4,5].map(n=><button key={n} type="button" aria-pressed={rating===n} onClick={()=>setRating(n)} style={{width:52,height:48,borderRadius:12,border:rating===n?"2px solid #087cf0":"1px solid #dce1e9",background:rating===n?"#eaf5ff":"#fff",color:rating===n?"#087cf0":"#526075",fontSize:20,cursor:"pointer"}}>★<span style={{display:"block",fontSize:10}}>{n}</span></button>)}</div></fieldset>
      <label style={{display:"grid",gap:8,fontWeight:800}}>Sobre o que você quer falar?
        <select value={category} onChange={e=>setCategory(e.target.value)} style={inputStyle}><option value="suggestion">Sugestão de melhoria</option><option value="problem">Encontrei um problema</option><option value="praise">Elogio</option></select>
      </label>
      <label style={{display:"grid",gap:8,fontWeight:800}}>Sua mensagem
        <textarea required minLength={3} maxLength={2000} rows={6} value={message} onChange={e=>setMessage(e.target.value)} placeholder="O que funcionou bem? O que poderíamos melhorar?" style={{...inputStyle,resize:"vertical"}}/>
        <span style={{fontSize:12,fontWeight:400,color:"#7b8494",textAlign:"right"}}>{message.length}/2000</span>
      </label>
      <label aria-hidden="true" style={{position:"absolute",left:"-10000px",width:1,height:1,overflow:"hidden"}}>Deixe este campo vazio<input tabIndex={-1} autoComplete="off" value={website} onChange={e=>setWebsite(e.target.value)}/></label>
      {error && <p role="alert" style={{margin:0,color:"#b42318"}}>{error}</p>}
      <button type="submit" disabled={status==="sending"} style={{border:0,borderRadius:12,padding:"15px 20px",background:"#087cf0",color:"#fff",fontWeight:800,fontSize:15,cursor:status==="sending"?"wait":"pointer",opacity:status==="sending"?.7:1}}>{status==="sending"?"Enviando…":"Enviar feedback grátis →"}</button>
      <p style={{fontSize:12,lineHeight:1.6,color:"#7b8494",margin:0}}>Não pedimos dados pessoais. Sua mensagem e nota serão armazenadas para que possamos analisar opiniões e melhorar o serviço. Evite incluir informações pessoais no texto.</p>
    </form>}
  </section><SiteFooter/></main>;
}
