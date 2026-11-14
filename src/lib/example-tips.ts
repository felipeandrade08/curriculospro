import type { ExampleCategory } from "@/lib/examples";

/** Dicas curtas e práticas por área, exibidas nas páginas de exemplo. */
export const CATEGORY_TIPS: Record<ExampleCategory, string[]> = {
  "Primeiro emprego": [
    "Sem experiência formal, mostre trabalhos voluntários, projetos da escola e cursos: tudo isso conta.",
    "No objetivo, diga a área que procura e o que você oferece: pontualidade, vontade de aprender, organização.",
    "Coloque a previsão de conclusão dos estudos e o turno em que estuda, se isso afetar seus horários.",
  ],
  Administrativo: [
    "Cite os sistemas e ferramentas que você domina, como Excel, ERP e emissão de notas.",
    "Mostre volume e resultado: quantos clientes atendia, quantos documentos controlava, o que melhorou.",
    "Organização é a principal competência da área: deixe o currículo limpo e sem erros de digitação.",
  ],
  "Comércio e atendimento": [
    "Números vendem: metas batidas, ticket médio, avaliação dos clientes ou prêmios internos.",
    "Inclua os sistemas de caixa e as formas de pagamento com que já trabalhou.",
    "Mencione disponibilidade para escala, fins de semana e feriados, se for o seu caso.",
  ],
  "Logística e serviços": [
    "Coloque CNH, cursos de NR e certificados de operação logo no início, pois são critérios de triagem.",
    "Mostre precisão e segurança: índice de acerto, ausência de acidentes, cuidado com a carga.",
    "Informe o bairro ou a região onde mora quando a vaga exigir proximidade.",
  ],
  "Saúde e educação": [
    "Inclua o número do registro profissional (COREN, CRM, CREF) junto ao cargo.",
    "Mostre o público com que trabalhou e o tipo de cuidado ou de ensino que oferece.",
    "Cursos de atualização contam muito: liste os mais recentes primeiro.",
  ],
  Tecnologia: [
    "Liste as tecnologias que você usa de verdade, das principais para as secundárias.",
    "Mostre impacto técnico com números: tempo de carregamento, chamados resolvidos, SLA.",
    "Inclua o link do seu portfólio, GitHub ou LinkedIn junto aos seus contatos.",
  ],
  "Marketing e criação": [
    "Resultados de campanha são seu melhor argumento: crescimento, conversão, alcance.",
    "Cite as ferramentas e plataformas que domina, como Google Ads, Meta Ads e Figma.",
    "Coloque o link do portfólio, mesmo que seja um perfil do Behance ou do Instagram.",
  ],
  "Gestão e finanças": [
    "Mostre o tamanho do que você gerenciou: equipes, orçamento, número de lojas ou obras.",
    "Destaque resultados financeiros com valores ou porcentagens.",
    "Liste formação e certificações relevantes, como MBA, CPA ou cursos da FGV.",
  ],
};
