"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AREA_QUESTIONS, GENERAL_QUESTIONS, guessArea, type InterviewQuestion } from "@/lib/interview";
import { plainRole, readActiveResume } from "@/lib/active-resume";
import type { ResumeData } from "@/lib/resume";
import { trackUsage } from "@/lib/analytics";
import { reviewAnswer } from "@/lib/interview-feedback";
import { KitBlur, KitTag, useKitGate } from "@/components/kit-gate";

const ANSWERS_KEY = "curriculospro.interview.v1";

function pitch(cv: ResumeData | null) {
  if (!cv || (!cv.role && !cv.experiences.length)) return null;
  const role = plainRole(cv.role || cv.experiences[0]?.title || "");
  const exp = cv.experiences.find((x) => x.title);
  const edu = cv.education.find((x) => x.title);
  const skills = cv.skills.slice(0, 3);
  const parts = [
    role ? `Sou ${role.toLowerCase()}` + (cv.city ? `, moro em ${cv.city.split(",")[0]}` : "") + "." : "",
    exp
      ? `Minha experiência mais recente foi como ${plainRole(exp.title).toLowerCase()}${exp.subtitle ? " na " + exp.subtitle.split("—")[0].trim() : ""}${exp.period ? " (" + exp.period + ")" : ""}.`
      : edu
        ? `Estou estudando ${edu.title}${edu.subtitle ? " na " + edu.subtitle : ""}.`
        : "",
    skills.length ? `Tenho facilidade com ${skills.join(", ").replace(/, ([^,]*)$/, " e $1")}.` : "",
    "Me interessei por esta vaga porque [diga o que te atraiu na empresa ou na função] e acredito que posso contribuir com [o que você faz de melhor].",
  ];
  return parts.filter(Boolean).join(" ");
}

function speak(text: string) {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "pt-BR";
    u.rate = 0.95;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  } catch {}
}

export default function InterviewPage() {
  const gate = useKitGate("/entrevista");
  const [cv, setCv] = useState<ResumeData | null>(null);
  const [area, setArea] = useState("administrativo");
  const [open, setOpen] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [canSpeak, setCanSpeak] = useState(false);

  useEffect(() => {
    const r = readActiveResume();
    setCv(r);
    if (r?.role) setArea(guessArea(r.role));
    try {
      setAnswers(JSON.parse(localStorage.getItem(ANSWERS_KEY) || "{}"));
    } catch {}
    setCanSpeak(typeof window !== "undefined" && "speechSynthesis" in window);
    trackUsage("interview_view");
  }, []);

  const save = (q: string, text: string) => {
    const next = { ...answers, [q]: text };
    setAnswers(next);
    try {
      localStorage.setItem(ANSWERS_KEY, JSON.stringify(next));
    } catch {}
  };

  const list: InterviewQuestion[] = useMemo(
    () => [...GENERAL_QUESTIONS, ...(AREA_QUESTIONS.find((a) => a.id === area)?.questions || [])],
    [area],
  );
  const done = list.filter((q) => (answers[q.q] || "").trim().length > 20).length;
  const myPitch = pitch(cv);

  return (
    <main className="iv">
      <SiteHeader />
      <section className="iv-head shell">
        <h1>Treine para a entrevista</h1>
        <p>
          As perguntas que mais caem, com dicas de como responder. Escreva suas respostas aqui e leia em voz
          alta antes da entrevista.
        </p>
        <label className="iv-area">
          <span>Sua área</span>
          <select value={area} onChange={(e) => setArea(e.target.value)}>
            {AREA_QUESTIONS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="iv-body shell">
        {myPitch && (
          <div className="iv-pitch">
            <h2>Sua apresentação em 30 segundos</h2>
            <p>Montada a partir do seu currículo. Complete os trechos entre colchetes e treine em voz alta.</p>
            <KitBlur
              kit={gate.kit}
              loading={gate.loading}
              onUnlock={gate.ask}
              cta={gate.cta}
              title="Sua apresentação pronta"
              text="O texto para “Fale sobre você”, montado com a sua experiência, para treinar em voz alta."
              height={90}
            >
            <blockquote>{myPitch}</blockquote>
            <div className="iv-actions">
              <button type="button" onClick={() => save(GENERAL_QUESTIONS[0].q, myPitch)}>
                Usar como resposta de “Fale sobre você”
              </button>
              {canSpeak && (
                <button type="button" className="ghost" onClick={() => speak(myPitch)}>
                  Ouvir
                </button>
              )}
            </div>
            </KitBlur>
          </div>
        )}

        <div className="iv-progress" aria-live="polite">
          <b>
            {done} de {list.length}
          </b>{" "}
          perguntas com resposta escrita
          <span className="iv-bar" aria-hidden>
            <i style={{ width: (done / list.length) * 100 + "%" }} />
          </span>
        </div>

        <ol className="iv-list">
          {list.map((item, index) => {
            const isOpen = open === item.q;
            const free = gate.kit || index < 3;
            const feedback = gate.kit ? reviewAnswer(item.q, answers[item.q] || "") : [];
            const answered = (answers[item.q] || "").trim().length > 20;
            return (
              <li key={item.q} className={isOpen ? "open" : ""}>
                <button type="button" className="iv-q" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : item.q)}>
                  <span>{item.q}</span>
                  {answered && <em>respondida</em>}
                </button>
                {isOpen && (
                  <div className="iv-a">
                    {free ? (
                      <>
                        <p className="iv-tip">
                          <b>Como responder:</b> {item.tip}
                        </p>
                        {item.avoid && (
                          <p className="iv-avoid">
                            <b>Evite:</b> {item.avoid}
                          </p>
                        )}
                      </>
                    ) : (
                      <KitBlur
                        kit={false}
                        loading={gate.loading}
                        onUnlock={gate.ask}
                        cta={gate.cta}
                        title="Dica de como responder"
                        text="As dicas de todas as perguntas e a correção automática das suas respostas estão no Kit Emprego."
                        height={60}
                      >
                        <p className="iv-tip">
                          <b>Como responder:</b> {item.tip}
                        </p>
                      </KitBlur>
                    )}
                    <label>
                      <span>Sua resposta</span>
                      <textarea
                        rows={4}
                        value={answers[item.q] || ""}
                        onChange={(e) => save(item.q, e.target.value)}
                        placeholder="Escreva como você falaria. Fica salvo só neste aparelho."
                      />
                    </label>
                    {feedback.length > 0 && (
                      <ul className="iv-feedback" aria-live="polite">
                        {feedback.map((f) => (
                          <li key={f.text} className={f.ok ? "ok" : "fix"}>
                            <span aria-hidden>{f.ok ? "✓" : "!"}</span>
                            {f.text}
                          </li>
                        ))}
                      </ul>
                    )}
                    {!gate.kit && (answers[item.q] || "").trim().length > 20 && (
                      <button type="button" className="iv-fbcta" onClick={gate.ask}>
                        Corrigir minha resposta <KitTag />
                      </button>
                    )}
                    {canSpeak && (
                      <div className="iv-actions">
                        <button type="button" className="ghost" onClick={() => speak(item.q)}>
                          Ouvir a pergunta
                        </button>
                        {(answers[item.q] || "").trim() && (
                          <button type="button" className="ghost" onClick={() => speak(answers[item.q])}>
                            Ouvir minha resposta
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ol>

        <aside className="iv-side">
          <h2>No dia da entrevista</h2>
          <ul>
            <li>Chegue 10 minutos antes ou entre na chamada 5 minutos antes.</li>
            <li>Leve o currículo impresso ou aberto no celular.</li>
            <li>Releia o anúncio da vaga e o site da empresa.</li>
            <li>Tenha uma pergunta pronta para fazer no final.</li>
            <li>No dia seguinte, mande uma mensagem curta agradecendo.</li>
          </ul>
          <Link href="/guias/perguntas-de-entrevista">Leia o guia completo</Link>
          <Link href="/candidaturas">Anotar esta entrevista nas candidaturas</Link>
        </aside>
      </section>
      {gate.modal}
      <SiteFooter />
    </main>
  );
}
