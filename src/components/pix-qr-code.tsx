"use client";

import {useMemo, useState} from "react";
import {QRCodeSVG} from "qrcode.react";

function tlv(id: string, value: string): string {
  return id + String(value.length).padStart(2, "0") + value;
}

function crc16Ccitt(value: string): string {
  let crc = 0xffff;
  for (let i = 0; i < value.length; i++) {
    crc ^= value.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = (crc & 0x8000) !== 0 ? ((crc << 1) ^ 0x1021) : (crc << 1);
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function buildPixPayload(pixKey: string, pixName: string, pixCity: string): string {
  const merchantAccount = tlv("00", "br.gov.bcb.pix") + tlv("01", pixKey.trim());
  const name = pixName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().slice(0, 25);
  const city = pixCity.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().slice(0, 15);
  const payload =
    tlv("00", "01") +
    tlv("01", "11") +
    tlv("26", merchantAccount) +
    tlv("52", "0000") +
    tlv("53", "986") +
    tlv("58", "BR") +
    tlv("59", name) +
    tlv("60", city) +
    tlv("62", tlv("05", "***")) +
    "6304";
  return payload + crc16Ccitt(payload);
}

export function PixQrCode({pixKey, pixName, pixCity}: {pixKey: string; pixName: string; pixCity: string}) {
  const [copied, setCopied] = useState(false);
  const payload = useMemo(() => buildPixPayload(pixKey, pixName, pixCity), [pixKey, pixName, pixCity]);

  async function copyPayload() {
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return <div style={{width:"100%",maxWidth:224,margin:"0 auto",minWidth:0}}>
    <div style={{width:"100%",aspectRatio:"1 / 1",display:"grid",placeItems:"center",overflow:"hidden"}}><QRCodeSVG value={payload} size={224} level="M" marginSize={2} title="QR Code Pix para apoio voluntário" style={{display:"block",width:"100%",height:"auto",maxWidth:224}}/></div>
    <button type="button" onClick={copyPayload} style={{display:"block",width:"100%",marginTop:14,border:"1px solid #087cf0",borderRadius:11,padding:"12px 14px",background:"#fff",color:"#087cf0",fontWeight:800,cursor:"pointer"}}>
      {copied ? "Pix copia e cola copiado!" : "Copiar Pix copia e cola"}
    </button>
  </div>;
}
