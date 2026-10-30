"use client";

import Link from "next/link";
import {useEffect,useState} from "react";
import {usePathname} from "next/navigation";

const DISMISSED_KEY="curriculospro.support-invite.dismissed-until";

export function SupportInvite() {
  const pathname=usePathname();
  const [visible,setVisible]=useState(false);

  useEffect(()=>{
    if(pathname==="/apoie" || pathname==="/feedback" || pathname.startsWith("/auth") || pathname==="/admin" || pathname.startsWith("/editor")) return;
    let timer:number|undefined;
    try {
      const dismissedUntil=Number(localStorage.getItem(DISMISSED_KEY)||"0");
      if(dismissedUntil>Date.now()) return;
    } catch {}
    timer=window.setTimeout(()=>setVisible(true),12000);
    return ()=>{if(timer)window.clearTimeout(timer)};
  },[pathname]);

  function dismiss(){
    try{localStorage.setItem(DISMISSED_KEY,String(Date.now()+7*24*60*60*1000));}catch{}
    setVisible(false);
  }

  if(!visible)return null;
  return <aside className="supportInvite" aria-label="Apoie o Currículos PRO e envie feedback">
    <button className="supportInviteClose" type="button" onClick={dismiss} aria-label="Fechar convite">×</button>
    <span className="supportInviteEyebrow">💙 O PROJETO CONTINUA GRATUITO</span>
    <strong>Gostou do Currículos PRO?</strong>
    <p>Sua opinião ajuda a melhorar. Se quiser, você também pode apoiar o projeto.</p>
    <div className="supportInviteActions">
      <Link href="/feedback" onClick={()=>setVisible(false)}>Deixar opinião</Link>
      <Link href="/apoie" onClick={()=>setVisible(false)}>Apoiar projeto</Link>
    </div>
  </aside>;
}
