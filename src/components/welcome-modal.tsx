"use client";
import Link from "next/link";
import {useEffect,useRef,useState} from "react";

const WELCOME_KEY="curriculospro.welcome.v1";
const WHATSAPP_URL="https://wa.me/5516997434009?text="+encodeURIComponent("Olá! Estou usando o CurriculosPRO e preciso de ajuda para criar meu currículo.");
export function WelcomeModal(){
 const [open,setOpen]=useState(false);
 const closeButton=useRef<HTMLButtonElement>(null);
 useEffect(()=>{try{if(localStorage.getItem(WELCOME_KEY)!=="seen")setOpen(true)}catch{setOpen(true)}},[]);
 useEffect(()=>{if(!open)return;closeButton.current?.focus();const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape")dismiss()};document.addEventListener("keydown",onKey);return()=>document.removeEventListener("keydown",onKey)},[open]);
 function dismiss(){try{localStorage.setItem(WELCOME_KEY,"seen")}catch{}setOpen(false)}
 if(!open)return null;
 return <div className="welcomeBackdrop" onMouseDown={event=>{if(event.target===event.currentTarget)dismiss()}}>
  <section role="dialog" aria-modal="true" aria-labelledby="welcomeTitle" aria-describedby="welcomeDescription" className="welcomeDialog">
   <button ref={closeButton} className="welcomeClose" type="button" aria-label="Fechar boas-vindas" onClick={dismiss}>×</button>
   <span className="welcomeEyebrow">✦ UM PROJETO PARA AJUDAR PESSOAS</span>
   <div className="welcomeFree">100% GRATUITO</div>
   <h2 id="welcomeTitle">Boas-vindas ao CurriculosPRO!</h2>
   <p id="welcomeDescription">Este projeto nasceu com um propósito: ajudar quem precisa de um currículo profissional, sem cobrar por isso. Crie, personalize e prepare seu PDF gratuitamente, no seu ritmo.</p>
   <div className="welcomeHighlights"><span>✓ Sem cartão</span><span>✓ Modelos profissionais</span><span>✓ PDF gratuito</span></div>
   <div className="welcomeActions">
    <Link href="/editor?new=blank" onClick={dismiss} className="welcomeStart">Começar meu currículo →</Link>
    <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="welcomeWhatsapp" onClick={dismiss}>Preciso de ajuda · WhatsApp</a>
   </div>
   <p className="welcomeCredit">Idealizado e desenvolvido por <strong>Felipe Andrade Dev</strong></p>
  </section>
 </div>;
}
