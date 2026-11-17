// Guias curtos e práticos (/guias/[slug]) para quem procura emprego.
export type GuideSection = { h: string; p?: string[]; list?: string[] };
export type Guide = {
  slug: string;
  title: string;
  description: string;
  intro: string;
  sections: GuideSection[];
  cta: { label: string; href: string };
};

export const GUIDES: Guide[] = [
  {
    slug: "curriculo-sem-experiencia",
    title: "Como fazer currículo sem experiência",
    description:
      "Passo a passo para montar um currículo sem experiência profissional: o que colocar no lugar, exemplo de objetivo e erros que eliminam candidatos.",
    intro:
      "Todo mundo começa sem experiência. O recrutador sabe disso. O que ele procura em um primeiro currículo é sinal de responsabilidade, vontade de aprender e capacidade de se comunicar, e tudo isso dá para mostrar mesmo sem carteira assinada.",
    sections: [
      {
        h: "O que colocar no lugar da experiência",
        p: ["Qualquer atividade em que você assumiu um compromisso conta. Escreva como se fosse um emprego: nome da atividade, onde, quando e o que você fazia."],
        list: [
          "Trabalho voluntário (igreja, ONG, campanhas do bairro)",
          "Projetos da escola ou faculdade, como feira de ciências, grêmio ou TCC",
          "Ajuda no negócio da família, como atendimento, caixa ou entregas",
          "Bicos e trabalhos informais, como vendas, festas ou aulas particulares",
          "Cursos livres, inclusive os online e gratuitos",
        ],
      },
      {
        h: "Escreva um objetivo que diga o que você oferece",
        p: [
          "Evite frases genéricas como “busco crescimento profissional”. Diga a área que procura e duas ou três qualidades que você consegue provar.",
          "Exemplo: “Estudante do ensino médio em busca da primeira oportunidade em atendimento ou administrativo. Pontual, organizado e com facilidade para aprender sistemas e lidar com o público.”",
        ],
      },
      {
        h: "Dê destaque à escolaridade e aos cursos",
        p: ["Sem experiência, a formação sobe para o topo. Informe a escola, a série ou o semestre, o turno e a previsão de conclusão. Depois liste os cursos, começando pelos ligados à vaga."],
      },
      {
        h: "Erros que eliminam na triagem",
        list: [
          "E-mail com apelido: crie um com seu nome",
          "Telefone errado ou sem DDD",
          "Erros de português: peça para alguém revisar",
          "Foto informal ou de festa: na dúvida, não coloque foto",
          "Currículo com mais de uma página",
        ],
      },
    ],
    cta: { label: "Montar meu primeiro currículo", href: "/curriculo/primeiro-emprego" },
  },
  {
    slug: "curriculo-jovem-aprendiz",
    title: "Currículo de Jovem Aprendiz: modelo e dicas",
    description:
      "Como montar o currículo para o programa Jovem Aprendiz: dados obrigatórios, objetivo, o que colocar sem experiência e como se candidatar.",
    intro:
      "O programa Jovem Aprendiz é para quem tem de 14 a 24 anos e está estudando ou já concluiu o ensino médio. A empresa sabe que você está começando, então o currículo precisa mostrar principalmente compromisso e disponibilidade.",
    sections: [
      {
        h: "Dados que não podem faltar",
        list: [
          "Nome completo, idade, cidade e bairro",
          "Telefone com WhatsApp e e-mail",
          "Escola, série e turno em que você estuda",
          "Horário disponível para trabalhar (manhã ou tarde)",
        ],
      },
      {
        h: "Objetivo pronto para adaptar",
        p: ["“Estudante do 2º ano do ensino médio (manhã) em busca de vaga como Jovem Aprendiz. Responsável, pontual e com vontade de aprender, com facilidade para trabalhar em equipe.”"],
      },
      {
        h: "O que colocar em atividades",
        p: ["Projetos da escola, voluntariado, ajuda em casa ou no comércio da família e cursos. Para cada um, escreva uma linha com o que você fazia. Exemplo: “Organização da campanha do agasalho da escola, arrecadando mais de 200 peças”."],
      },
      {
        h: "Onde se candidatar",
        p: ["Além das empresas, procure as instituições que fazem a ponte com as vagas, como CIEE, Espro, Renapsi e o Senac e Senai da sua cidade. Cadastre o currículo em todas e mantenha o telefone atualizado."],
      },
    ],
    cta: { label: "Usar o modelo de Jovem Aprendiz", href: "/curriculo/jovem-aprendiz" },
  },
  {
    slug: "objetivo-do-curriculo",
    title: "Objetivo do currículo: como escrever e 10 exemplos",
    description:
      "O que escrever no objetivo ou resumo profissional do currículo, com exemplos prontos para várias áreas e o que evitar.",
    intro:
      "O objetivo (ou resumo) é a primeira coisa que o recrutador lê. Em duas ou três linhas, ele precisa entender qual vaga você quer e por que vale a pena continuar lendo.",
    sections: [
      {
        h: "A fórmula simples",
        p: ["Cargo que você busca + experiência ou formação + duas qualidades ou ferramentas que você domina. Só isso. Nada de “busco uma empresa que me dê oportunidade de crescimento”."],
      },
      {
        h: "Exemplos por área",
        list: [
          "Administrativo: “Auxiliar administrativo com 2 anos de experiência em rotinas de escritório e notas fiscais. Organizado, com Excel intermediário.”",
          "Vendas: “Vendedora com experiência em loja de calçados e histórico de metas batidas. Comunicativa e focada em fidelizar clientes.”",
          "Caixa: “Operadora de caixa com 3 anos em supermercado, sem diferenças de caixa e com disponibilidade para escala.”",
          "Logística: “Auxiliar de logística com experiência em conferência e separação de pedidos. Curso de empilhadeira (NR-11).”",
          "Saúde: “Técnica de enfermagem com COREN ativo e experiência em pronto atendimento. Atenciosa e ágil.”",
          "Primeiro emprego: “Estudante em busca da primeira oportunidade em atendimento. Pontual, organizado e com facilidade de aprendizado.”",
          "Motorista: “Motorista com CNH D, 5 anos em entregas urbanas e sem acidentes no período.”",
          "TI: “Analista de suporte com experiência em help desk, Windows e redes. Didático e focado em resolver no primeiro contato.”",
          "Cozinha: “Cozinheiro com experiência em restaurante à la carte e curso de boas práticas de manipulação.”",
          "RH: “Auxiliar de RH com experiência em recrutamento e admissão, discreta e organizada.”",
        ],
      },
      {
        h: "Adapte para cada vaga",
        p: ["Use o nome do cargo exatamente como está no anúncio. Se a vaga é para “Assistente de Atendimento”, escreva isso no objetivo. Muitas empresas filtram currículos por palavras-chave."],
      },
    ],
    cta: { label: "Comparar meu currículo com uma vaga", href: "/adaptar-vaga" },
  },
  {
    slug: "como-enviar-curriculo",
    title: "Como enviar currículo por e-mail e WhatsApp",
    description:
      "Modelos de mensagem para enviar o currículo por e-mail e WhatsApp, o que escrever no assunto e erros que fazem o recrutador ignorar.",
    intro:
      "Um bom currículo enviado de qualquer jeito perde força. A mensagem que vai junto é a primeira impressão: curta, educada e com o arquivo certo.",
    sections: [
      {
        h: "Por e-mail",
        list: [
          "Assunto: “Currículo — [nome da vaga] — [seu nome]”",
          "Corpo: cumprimento, a vaga que você viu, uma frase sobre você e agradecimento",
          "Anexo em PDF, com nome de arquivo claro: “Curriculo-Maria-Silva.pdf”",
          "Envie do e-mail com seu nome, nunca de um e-mail com apelido",
        ],
      },
      {
        h: "Por WhatsApp",
        p: [
          "Mande a mensagem primeiro e o PDF logo em seguida. Não mande só o arquivo sem explicação, nem áudio.",
          "Exemplo: “Bom dia! Meu nome é Maria Silva e vi a vaga de Auxiliar Administrativo. Tenho experiência com rotinas de escritório e Excel. Segue meu currículo. Fico à disposição, obrigada!”",
        ],
      },
      {
        h: "Erros comuns",
        list: [
          "Enviar foto do currículo impresso em vez do PDF",
          "Mandar o mesmo texto para todas as vagas, sem citar o cargo",
          "Enviar em Word quando a vaga não pede (prefira PDF)",
          "Ligar ou mandar mensagem várias vezes no mesmo dia cobrando resposta",
        ],
      },
    ],
    cta: { label: "Pegar mensagens prontas para enviar", href: "/enviar-curriculo" },
  },
  {
    slug: "perguntas-de-entrevista",
    title: "Perguntas de entrevista de emprego e como responder",
    description:
      "As perguntas mais comuns em entrevistas de emprego, como responder cada uma e o que evitar, com exemplos práticos.",
    intro:
      "As entrevistas se repetem mais do que parece. Treinar as respostas para as perguntas clássicas tira o nervosismo e faz você falar com segurança.",
    sections: [
      {
        h: "“Fale um pouco sobre você”",
        p: ["Não conte a vida toda. Em um minuto: formação, experiência mais ligada à vaga e por que você se interessou por ela."],
      },
      {
        h: "“Por que você quer trabalhar aqui?”",
        p: ["Mostre que pesquisou a empresa: o que ela faz, algo que você admira e como você pode contribuir."],
      },
      {
        h: "“Qual o seu maior defeito?”",
        p: ["Escolha algo real, que não seja essencial para a vaga, e diga o que você faz para melhorar. Evite respostas prontas como “sou perfeccionista”."],
      },
      {
        h: "“Conte uma situação difícil que você resolveu”",
        p: ["Use o roteiro situação, ação e resultado: o que aconteceu, o que você fez e como terminou. Prepare duas histórias antes da entrevista."],
      },
      {
        h: "“Qual sua pretensão salarial?”",
        p: ["Pesquise a média do cargo na sua cidade e dê uma faixa. Se a vaga já informa o salário, diga que está de acordo."],
      },
    ],
    cta: { label: "Treinar com perguntas da minha profissão", href: "/entrevista" },
  },
  {
    slug: "curriculo-pdf-ou-word",
    title: "Currículo em PDF ou Word: qual enviar?",
    description:
      "Quando enviar o currículo em PDF e quando usar Word (.docx), e como deixar o arquivo pronto para sites de vagas e recrutadores.",
    intro:
      "Na maioria dos casos, o PDF é a melhor escolha: abre igual em qualquer celular ou computador e ninguém consegue alterar sem querer. O Word só vale quando a empresa pede.",
    sections: [
      {
        h: "Use PDF quando",
        list: [
          "For enviar por e-mail ou WhatsApp",
          "A vaga não disser o formato",
          "Quiser garantir que o visual fique igual ao que você montou",
        ],
      },
      {
        h: "Use Word quando",
        list: [
          "O anúncio pedir “.doc” ou “.docx”",
          "Um site de vagas ou agência pedir para editar o seu currículo",
          "O recrutador pedir para fazer ajustes no arquivo",
        ],
      },
      {
        h: "Dicas para o arquivo",
        p: ["Dê um nome claro (Curriculo-Seu-Nome.pdf), mantenha o arquivo leve e confira se os links e o telefone estão corretos antes de enviar. No CurriculosPRO o acesso libera os dois formatos."],
      },
    ],
    cta: { label: "Criar meu currículo", href: "/comecar" },
  },
];

export const guideBySlug = (slug: string) => GUIDES.find((g) => g.slug === slug);
