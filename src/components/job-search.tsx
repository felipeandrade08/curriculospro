"use client";
import { useEffect, useState } from "react";
import { readActiveResume } from "@/lib/active-resume";
import { PLATFORMS, googleJobs } from "@/lib/platforms";

const SITES = ["indeed", "linkedin", "gupy", "infojobs", "catho", "vagas-com-br"];

/** Botões que abrem a busca de vagas já com cargo e cidade em cada site. */
export function JobSearch({ role, title }: { role: string; title?: string }) {
  const [city, setCity] = useState("");
  useEffect(() => {
    const c = readActiveResume()?.city || "";
    if (c) setCity(c.split(",")[0].trim());
  }, []);
  const r = role.replace(/\s*\/.*$/, "").replace(/\(a\)/g, "").trim();
  return (
    <div className="js">
      <b>{title || `Vagas de ${r.toLowerCase()} abertas agora`}</b>
      <label>
        <span>Sua cidade</span>
        <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ex.: Belo Horizonte" />
      </label>
      <div className="js-links">
        <a href={googleJobs(r, city)} target="_blank" rel="noopener noreferrer">
          Google Vagas
        </a>
        {SITES.map((slug) => {
          const p = PLATFORMS.find((x) => x.slug === slug)!;
          return (
            <a key={slug} href={p.search(r, city)} target="_blank" rel="noopener noreferrer">
              {p.name}
            </a>
          );
        })}
      </div>
      <small>Abre a busca no site escolhido. O CurriculosPRO não tem ligação com esses sites.</small>
    </div>
  );
}
