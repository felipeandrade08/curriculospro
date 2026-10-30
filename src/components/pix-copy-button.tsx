"use client";

import {useState} from "react";

export function PixCopyButton({value}:{value:string}) {
  const [copied,setCopied]=useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(()=>setCopied(false),1800);
    } catch {
      setCopied(false);
    }
  }
  return <button type="button" onClick={copy} style={{marginTop:14,border:0,borderRadius:11,padding:"13px 18px",background:"#087cf0",color:"#fff",fontWeight:800,cursor:"pointer"}}>{copied?"Chave copiada!":"Copiar chave Pix"}</button>;
}
