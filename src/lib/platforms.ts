// Guia por plataforma de vagas (/plataformas/[slug]) e links de busca pronta.
export type Platform = {
  slug: string;
  name: string;
  /** "no" ou "na", para frases como "no LinkedIn" e "na Gupy". */
  em: "no" | "na";
  short: string;
  intro: string;
  steps: string[];
  tips: string[];
  /** Busca de vagas com cargo e cidade já preenchidos. */
  search: (role: string, city: string) => string;
  home: string;
};

const enc = encodeURIComponent;
const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const PLATFORMS: Platform[] = [
  {
    slug: "gupy",
    name: "Gupy",
    em: "na",
    short: "Usada por muitas grandes empresas. Tem triagem automática.",
    intro:
      "Muitas empresas usam a Gupy para receber candidaturas. Antes de um recrutador ver seu perfil, a plataforma compara principalmente os campos de Experiência e Habilidades com a descrição da vaga. Por isso, esses dois campos precisam estar completos e com as mesmas palavras que as vagas usam.",
    steps: [
      "Crie sua conta no portal de vagas da Gupy (portal.gupy.io).",
      "Envie seu currículo em PDF para preencher os campos automaticamente. Depois, confira campo por campo: a leitura automática pode errar ou deixar coisas de fora.",
      "Em Experiência, cole as atividades de cada emprego (abaixo, prontas para copiar).",
      "Em Habilidades, adicione uma por uma as competências do seu currículo e as que a vaga pede e você tem.",
      "Ao se candidatar, use o campo “Apresente-se” (até 1.500 caracteres) com um texto voltado para aquela vaga.",
      "Faça os testes da vaga com calma, em um lugar tranquilo e com internet boa.",
    ],
    tips: [
      "Currículo em uma coluna, sem tabelas e sem texto dentro de imagens, é lido com mais facilidade.",
      "Alterações no seu perfil valem para todas as candidaturas ativas: mantenha-o sempre atualizado.",
      "Use o nome do cargo como aparece nas vagas (ex.: “Auxiliar Administrativo”, não “Aux. Adm.”).",
    ],
    search: (role) => "https://portal.gupy.io/job-search/term=" + enc(role),
    home: "https://portal.gupy.io/",
  },
  {
    slug: "linkedin",
    name: "LinkedIn",
    em: "no",
    short: "Rede profissional onde recrutadores procuram candidatos.",
    intro:
      "No LinkedIn, além de se candidatar, você é encontrado: recrutadores pesquisam perfis por cargo, habilidade e cidade. Título, Sobre, experiências e competências bem preenchidos fazem seu perfil aparecer nessas buscas.",
    steps: [
      "Use nosso gerador de perfil para copiar o título, o Sobre e as experiências.",
      "Adicione foto de rosto e cidade corretas.",
      "Ative “Tenho interesse” com os cargos que você procura.",
      "Candidate-se pelas vagas com “Candidatura simplificada” e também pelo site da empresa quando houver.",
    ],
    tips: [
      "Siga as empresas onde você quer trabalhar: as vagas delas aparecem para você primeiro.",
      "Depois de se candidatar, mande uma mensagem curta para o recrutador da vaga.",
    ],
    search: (role, city) =>
      "https://www.linkedin.com/jobs/search/?keywords=" + enc(role) + (city ? "&location=" + enc(city) : ""),
    home: "https://www.linkedin.com/jobs/",
  },
  {
    slug: "indeed",
    name: "Indeed",
    em: "no",
    short: "Buscador que reúne vagas de muitos sites e empresas.",
    intro:
      "O Indeed reúne vagas publicadas por empresas e de vários outros sites. Muitas vagas pedem que você envie o currículo em arquivo ou preencha um perfil do Indeed, que também pode ser encontrado por empresas.",
    steps: [
      "Crie sua conta e envie seu currículo em PDF.",
      "Confira os dados lidos e complete Experiência, Formação e Competências.",
      "Ative a opção para seu currículo ficar visível para empresas, se quiser ser encontrado.",
      "Crie um alerta de vagas com seu cargo e cidade para receber novidades por e-mail.",
    ],
    tips: [
      "Muitas vagas trazem perguntas extras na candidatura: use as respostas prontas abaixo.",
      "Pesquise o salário médio do cargo na própria plataforma antes de informar a pretensão.",
    ],
    search: (role, city) => "https://br.indeed.com/empregos?q=" + enc(role) + (city ? "&l=" + enc(city) : ""),
    home: "https://br.indeed.com/",
  },
  {
    slug: "infojobs",
    name: "Infojobs",
    em: "no",
    short: "Site de vagas com muitas oportunidades operacionais e administrativas.",
    intro:
      "No Infojobs você monta um currículo dentro da plataforma, preenchendo campos de objetivo, experiências, formação e idiomas. As empresas filtram candidatos por esses campos, então vale preencher tudo.",
    steps: [
      "Crie sua conta e preencha seus dados de contato e cidade.",
      "No objetivo profissional, cole o seu resumo (abaixo).",
      "Cadastre cada experiência com empresa, cargo, período e atividades.",
      "Complete formação, cursos e idiomas.",
      "Candidate-se e acompanhe o status de cada vaga pela própria plataforma.",
    ],
    tips: [
      "Currículo completo aparece melhor nas buscas das empresas.",
      "Revise a pretensão salarial cadastrada: ela pode tirar você de vagas.",
    ],
    search: (role) => "https://www.infojobs.com.br/empregos.aspx?palabra=" + enc(role),
    home: "https://www.infojobs.com.br/",
  },
  {
    slug: "catho",
    name: "Catho",
    em: "na",
    short: "Site de vagas tradicional, com cadastro de currículo completo.",
    intro:
      "Na Catho você cadastra o currículo em campos e se candidata às vagas. As empresas pesquisam candidatos por cargo, cidade e experiência, por isso o objetivo e as experiências precisam usar o nome do cargo que você procura.",
    steps: [
      "Crie sua conta e informe cargo desejado e cidade.",
      "Cole seu resumo no campo de objetivo.",
      "Cadastre as experiências com as atividades de cada uma.",
      "Complete formação, cursos e idiomas.",
    ],
    tips: [
      "Informe mais de um cargo de interesse, se você topa vagas parecidas.",
      "Confira se telefone e e-mail estão corretos: é por ali que as empresas chamam.",
    ],
    search: (role) => "https://www.catho.com.br/vagas/" + slugify(role) + "/",
    home: "https://www.catho.com.br/",
  },
  {
    slug: "vagas-com-br",
    name: "Vagas.com",
    em: "no",
    short: "Muitas empresas usam para receber candidaturas pelo próprio site.",
    intro:
      "Muitas empresas anunciam vagas no Vagas.com ou usam o sistema dele na área de “Trabalhe conosco” do próprio site. O currículo é preenchido uma vez e usado em todas essas candidaturas.",
    steps: [
      "Crie sua conta e preencha o currículo completo.",
      "Cole o resumo e as experiências prontas abaixo.",
      "Responda às perguntas extras de cada vaga com calma.",
    ],
    tips: [
      "Se a empresa tem “Trabalhe conosco” no site, confira se ela usa o Vagas.com: seu cadastro já serve.",
    ],
    search: (role) => "https://www.vagas.com.br/vagas-de-" + slugify(role),
    home: "https://www.vagas.com.br/",
  },
  {
    slug: "sine",
    name: "Sine e Carteira de Trabalho Digital",
    em: "no",
    short: "Vagas públicas e gratuitas, inclusive de primeiro emprego.",
    intro:
      "O Sine divulga vagas de emprego de forma gratuita. Você pode consultar as vagas pelo app Carteira de Trabalho Digital, com sua conta gov.br, ou ir a um posto do Sine na sua cidade levando documentos e o currículo impresso.",
    steps: [
      "Baixe o app Carteira de Trabalho Digital e entre com sua conta gov.br.",
      "Procure a área de vagas e veja as oportunidades da sua região.",
      "Se preferir atendimento presencial, leve documento com foto, CPF, carteira de trabalho e o currículo impresso ao Sine.",
    ],
    tips: [
      "Leve algumas cópias impressas do currículo: o atendente pode encaminhar você para mais de uma vaga.",
      "Pergunte também sobre cursos de qualificação gratuitos.",
    ],
    search: () => "https://www.gov.br/pt-br/servicos/obter-a-carteira-de-trabalho",
    home: "https://www.gov.br/pt-br/servicos/obter-a-carteira-de-trabalho",
  },
];

export const platformBySlug = (slug: string) => PLATFORMS.find((p) => p.slug === slug);

/** Busca no Google Vagas (reúne anúncios de vários sites). */
export const googleJobs = (role: string, city: string) =>
  "https://www.google.com/search?q=" + enc("vagas " + role + (city ? " " + city : "")) + "&ibp=htl;jobs";
