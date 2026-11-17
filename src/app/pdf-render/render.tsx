"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { A4_HEIGHT, ResumeView } from "@/components/resume-view";
import type { ResumeDocument, ResumeSection } from "@/lib/resume";

type Job = { doc: ResumeDocument; sections: ResumeSection[]; scale: number | "auto" };
declare global {
  interface Window {
    __PDF_JOB__?: Job;
    __PDF_READY__?: boolean;
  }
}

/** Mesmo ajuste do editor: reduz o texto (até 78%) quando passa pouco de uma página. */
function autoScale(el: HTMLElement) {
  const limit = A4_HEIGHT - 5;
  const heightAt = (s: number) => {
    el.style.setProperty("--s", String(s));
    return el.scrollHeight;
  };
  let scale = 1;
  if (heightAt(1) > limit && heightAt(0.78) <= limit) {
    let lo = 0.78,
      hi = 1;
    for (let i = 0; i < 9; i++) {
      const mid = (lo + hi) / 2;
      if (heightAt(mid) <= limit) lo = mid;
      else hi = mid;
    }
    scale = Math.floor(lo * 100) / 100;
  }
  el.style.removeProperty("--s");
  return scale;
}

export function PdfRender() {
  const [job, setJob] = useState<Job | null>(null);
  const [scale, setScale] = useState<number | null>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // O gerador injeta o currículo antes da página carregar.
    const value = window.__PDF_JOB__;
    if (value?.doc) setJob(value);
  }, []);

  useLayoutEffect(() => {
    if (!job || scale !== null) return;
    const run = async () => {
      try {
        await document.fonts?.ready;
      } catch {}
      if (typeof job.scale === "number") setScale(job.scale);
      else {
        const el = measureRef.current?.querySelector<HTMLElement>(".cv");
        setScale(el ? autoScale(el) : 1);
      }
    };
    void run();
  }, [job, scale]);

  useEffect(() => {
    if (scale === null) return;
    const imgs = Array.from(document.querySelectorAll<HTMLImageElement>(".pdfRender img"));
    Promise.all(
      imgs.map((img) => (img.complete ? null : new Promise((r) => img.addEventListener("load", r, { once: true })))),
    ).then(() => requestAnimationFrame(() => (window.__PDF_READY__ = true)));
  }, [scale]);

  if (!job) return null;
  const props = {
    cv: job.doc.cv,
    template: job.doc.template,
    accent: job.doc.accent,
    density: job.doc.density,
    sections: job.sections,
  };
  return (
    <div className="pdfRender" id="pdf-root">
      {scale === null ? (
        <div ref={measureRef} className="pdfMeasure">
          <ResumeView {...props} />
        </div>
      ) : (
        <ResumeView {...props} scale={scale} />
      )}
    </div>
  );
}
