import Link from "next/link";

const TOOLS = [
  { href: "/adaptar-vaga", title: "Comparar com uma vaga", text: "Veja o que a vaga pede e o que falta no seu currículo." },
  { href: "/enviar-curriculo", title: "Mensagem para enviar", text: "Texto pronto para WhatsApp, e-mail e LinkedIn." },
  { href: "/candidaturas", title: "Minhas candidaturas", text: "Anote onde enviou e saiba quando cobrar retorno." },
  { href: "/entrevista", title: "Treino de entrevista", text: "Perguntas da sua área e como responder." },
  { href: "/linkedin", title: "Perfil do LinkedIn", text: "Título e Sobre prontos a partir do currículo." },
];

/** Atalhos para as ferramentas de busca de emprego. */
export function JobTools({ title = "Próximos passos para conseguir a vaga" }: { title?: string }) {
  return (
    <section className="jt" aria-labelledby="jt-title">
      <h2 id="jt-title">{title}</h2>
      <div className="jt-grid">
        {TOOLS.map((t) => (
          <Link key={t.href} href={t.href}>
            <b>{t.title}</b>
            <span>{t.text}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
