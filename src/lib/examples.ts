// Currículos prontos por profissão. Nomes e contatos são fictícios: servem de ponto de
// partida para a pessoa substituir pelas próprias informações.
import type { TemplateId } from "@/lib/templates";

export type ExampleItem = { title: string; subtitle: string; period: string; description: string };
export type ExampleData = {
  name: string;
  role: string;
  email: string;
  phone: string;
  city: string;
  summary: string;
  experiences: ExampleItem[];
  education: ExampleItem[];
  courses: string[];
  skills: string[];
  languages: string[];
};
export type ExampleCategory =
  | "Primeiro emprego"
  | "Administrativo"
  | "Comércio e atendimento"
  | "Logística e serviços"
  | "Saúde e educação"
  | "Tecnologia"
  | "Marketing e criação"
  | "Gestão e finanças";

export type ResumeExample = {
  id: string;
  title: string;
  category: ExampleCategory;
  template: TemplateId;
  accent: string;
  data: ExampleData;
};

export const EXAMPLE_CATEGORIES: ExampleCategory[] = [
  "Primeiro emprego",
  "Administrativo",
  "Comércio e atendimento",
  "Logística e serviços",
  "Saúde e educação",
  "Tecnologia",
  "Marketing e criação",
  "Gestão e finanças",
];

const edu = (title: string, subtitle: string, period: string, description = ""): ExampleItem => ({
  title,
  subtitle,
  period,
  description,
});

export const RESUME_EXAMPLES: ResumeExample[] = [
  {
    id: "first-job",
    title: "Jovem Aprendiz",
    category: "Primeiro emprego",
    template: "essential",
    accent: "#0b6bcb",
    data: {
      name: "Lucas Henrique Souza",
      role: "Jovem Aprendiz",
      email: "lucas.souza@email.com",
      phone: "(11) 98765-4321",
      city: "Guarulhos, SP",
      summary:
        "Estudante do ensino médio em busca da primeira oportunidade como jovem aprendiz. Sou organizado, pontual e aprendo rápido. Quero contribuir com a equipe enquanto desenvolvo experiência nas rotinas administrativas e de atendimento.",
      experiences: [
        {
          title: "Voluntário",
          subtitle: "Campanha do Agasalho — Associação de Moradores",
          period: "2024 — 2025",
          description:
            "• Recebi, separei e organizei doações por tamanho e tipo\n• Atendi moradores e registrei entregas em planilha\n• Ajudei a divulgar a campanha nas redes sociais do bairro",
        },
        {
          title: "Projeto escolar — Feira de Ciências",
          subtitle: "E.E. Professora Maria Aparecida",
          period: "2024",
          description:
            "• Liderei um grupo de 5 alunos no planejamento e na apresentação do projeto\n• Projeto premiado com 2º lugar entre 40 trabalhos",
        },
      ],
      education: [edu("Ensino Médio", "E.E. Professora Maria Aparecida", "2023 — 2025 (cursando)")],
      courses: [
        "SENAI — Informática Básica — 40h",
        "Fundação Bradesco — Excel Básico — 20h",
        "Sebrae — Atendimento ao Cliente — 12h",
      ],
      skills: [
        "Pacote Office",
        "Organização",
        "Comunicação",
        "Trabalho em equipe",
        "Pontualidade",
        "Facilidade de aprendizado",
      ],
      languages: ["Português — Nativo", "Inglês — Básico"],
    },
  },
  {
    id: "intern",
    title: "Estágio em Administração",
    category: "Primeiro emprego",
    template: "minimal",
    accent: "#0f766e",
    data: {
      name: "Beatriz Almeida Lima",
      role: "Estudante de Administração",
      email: "beatriz.lima@email.com",
      phone: "(31) 99812-3344",
      city: "Belo Horizonte, MG",
      summary:
        "Estudante do 4º período de Administração buscando estágio nas áreas administrativa ou financeira. Tenho facilidade com planilhas, organização de processos e comunicação, e quero aplicar na prática o que aprendo na faculdade.",
      experiences: [
        {
          title: "Membro de Empresa Júnior",
          subtitle: "Consultoria Júnior — PUC Minas",
          period: "2024 — Atual",
          description:
            "• Apoio em projetos de organização financeira para pequenos negócios\n• Elaboração de planilhas de fluxo de caixa e relatórios para clientes\n• Participação em reuniões de diagnóstico com empreendedores",
        },
        {
          title: "Atendente (meio período)",
          subtitle: "Livraria Leitura",
          period: "2023 — 2024",
          description:
            "• Atendimento ao público, vendas e organização de estoque\n• Operação de caixa e fechamento diário",
        },
      ],
      education: [edu("Bacharelado em Administração", "PUC Minas", "2023 — 2027 (cursando)")],
      courses: ["Fundação Bradesco — Excel Intermediário — 30h", "FGV — Introdução às Finanças — 15h"],
      skills: [
        "Excel intermediário",
        "Fluxo de caixa",
        "Organização de documentos",
        "Atendimento",
        "Comunicação escrita",
        "Proatividade",
      ],
      languages: ["Português — Nativo", "Inglês — Intermediário", "Espanhol — Básico"],
    },
  },
  {
    id: "administrative",
    title: "Auxiliar Administrativo",
    category: "Administrativo",
    template: "minimal",
    accent: "#0f766e",
    data: {
      name: "Mariana Costa Ribeiro",
      role: "Auxiliar Administrativa",
      email: "mariana.ribeiro@email.com",
      phone: "(11) 97654-3210",
      city: "São Paulo, SP",
      summary:
        "Profissional administrativa com 4 anos de experiência em rotinas de escritório, controle de documentos e apoio financeiro. Organizada e atenta aos detalhes, busco contribuir para processos mais ágeis e confiáveis.",
      experiences: [
        {
          title: "Auxiliar Administrativa",
          subtitle: "Grupo Horizonte Contabilidade",
          period: "2022 — Atual",
          description:
            "• Controle de contas a pagar e a receber e conciliação bancária\n• Emissão de notas fiscais e organização de documentos de 60 clientes\n• Implantação de planilha de controle que reduziu atrasos de pagamento",
        },
        {
          title: "Recepcionista",
          subtitle: "Clínica Bem Viver",
          period: "2020 — 2022",
          description:
            "• Agendamento de consultas e atendimento telefônico\n• Cadastro de pacientes e controle de convênios",
        },
      ],
      education: [edu("Técnico em Administração", "ETEC Getúlio Vargas", "2019 — 2020")],
      courses: ["SENAC — Rotinas de Departamento Pessoal — 60h", "Fundação Bradesco — Excel Avançado — 30h"],
      skills: [
        "Excel avançado",
        "Contas a pagar e receber",
        "Emissão de notas fiscais",
        "Arquivo e documentação",
        "Atendimento",
        "Organização",
      ],
      languages: ["Português — Nativo", "Inglês — Básico"],
    },
  },
  {
    id: "receptionist",
    title: "Recepcionista",
    category: "Administrativo",
    template: "modern",
    accent: "#1d4ed8",
    data: {
      name: "Camila Ferreira Santos",
      role: "Recepcionista",
      email: "camila.santos@email.com",
      phone: "(21) 98123-4567",
      city: "Rio de Janeiro, RJ",
      summary:
        "Recepcionista com 5 anos de experiência em clínicas e escritórios. Atendimento cordial, agenda organizada e boa comunicação com clientes e equipe. Busco uma vaga onde possa garantir uma ótima primeira impressão.",
      experiences: [
        {
          title: "Recepcionista",
          subtitle: "Centro Médico Atlântico",
          period: "2021 — Atual",
          description:
            "• Atendimento presencial e telefônico de cerca de 80 pacientes por dia\n• Gestão de agenda de 6 médicos e confirmação de consultas\n• Autorização de procedimentos junto a convênios",
        },
        {
          title: "Recepcionista",
          subtitle: "Escritório Martins Advogados",
          period: "2019 — 2021",
          description: "• Recepção de clientes, controle de correspondências e reserva de salas",
        },
      ],
      education: [edu("Ensino Médio Completo", "Colégio Estadual Visconde de Cairu", "2018")],
      courses: ["SENAC — Recepção e Atendimento — 40h", "SENAC — Excelência no Atendimento — 20h"],
      skills: [
        "Atendimento ao cliente",
        "Gestão de agenda",
        "Sistemas de clínica",
        "Pacote Office",
        "Comunicação",
        "Cordialidade",
      ],
      languages: ["Português — Nativo", "Inglês — Intermediário"],
    },
  },
  {
    id: "retail",
    title: "Vendedor(a) de Loja",
    category: "Comércio e atendimento",
    template: "modern",
    accent: "#be123c",
    data: {
      name: "Rafael Oliveira Pinto",
      role: "Vendedor",
      email: "rafael.pinto@email.com",
      phone: "(41) 99234-5678",
      city: "Curitiba, PR",
      summary:
        "Vendedor com 6 anos de experiência no varejo de moda e calçados. Foco em atendimento consultivo, metas e fidelização de clientes. Fui o vendedor com maior faturamento da loja em 2024.",
      experiences: [
        {
          title: "Vendedor",
          subtitle: "Loja Passo Certo Calçados",
          period: "2021 — Atual",
          description:
            "• Atendimento consultivo e venda de produtos com ticket médio 20% acima da média da loja\n• Maior faturamento individual da unidade em 2024\n• Organização de vitrines e reposição de estoque",
        },
        {
          title: "Vendedor",
          subtitle: "Renner — Shopping Estação",
          period: "2018 — 2021",
          description: "• Vendas, abertura de cartões da loja e atendimento no provador",
        },
      ],
      education: [edu("Ensino Médio Completo", "Colégio Estadual do Paraná", "2017")],
      courses: ["Sebrae — Técnicas de Vendas — 20h", "SENAC — Visual Merchandising — 30h"],
      skills: [
        "Vendas consultivas",
        "Cumprimento de metas",
        "Fidelização de clientes",
        "Visual merchandising",
        "Operação de caixa",
        "Negociação",
      ],
      languages: ["Português — Nativo"],
    },
  },
  {
    id: "cashier",
    title: "Operador(a) de Caixa",
    category: "Comércio e atendimento",
    template: "essential",
    accent: "#0b6bcb",
    data: {
      name: "Juliana Mendes da Silva",
      role: "Operadora de Caixa",
      email: "juliana.mendes@email.com",
      phone: "(71) 98877-6655",
      city: "Salvador, BA",
      summary:
        "Operadora de caixa com 3 anos de experiência em supermercado. Agilidade, atenção no manuseio de valores e atendimento cordial. Nunca tive diferença de caixa no fechamento.",
      experiences: [
        {
          title: "Operadora de Caixa",
          subtitle: "Supermercado Bom Preço",
          period: "2022 — Atual",
          description:
            "• Registro de compras, recebimento em dinheiro, cartão e Pix\n• Fechamento de caixa diário sem diferenças\n• Apoio na reposição e precificação em horários de menor movimento",
        },
        {
          title: "Atendente",
          subtitle: "Padaria Pão Dourado",
          period: "2021 — 2022",
          description: "• Atendimento no balcão, caixa e organização do salão",
        },
      ],
      education: [edu("Ensino Médio Completo", "Colégio Estadual Severino Vieira", "2020")],
      courses: ["SENAC — Operador de Caixa — 40h"],
      skills: [
        "Operação de caixa",
        "Manuseio de valores",
        "Atendimento",
        "Agilidade",
        "Atenção aos detalhes",
        "Trabalho em equipe",
      ],
      languages: ["Português — Nativo"],
    },
  },
  {
    id: "customer-service",
    title: "Atendimento ao Cliente (SAC)",
    category: "Comércio e atendimento",
    template: "professional",
    accent: "#0b6bcb",
    data: {
      name: "Thiago Rocha Martins",
      role: "Analista de Atendimento ao Cliente",
      email: "thiago.martins@email.com",
      phone: "(81) 99654-3322",
      city: "Recife, PE",
      summary:
        "Profissional de atendimento com 4 anos de experiência em SAC multicanal (telefone, chat e e-mail). Foco em resolver no primeiro contato e manter alta satisfação dos clientes.",
      experiences: [
        {
          title: "Analista de Atendimento",
          subtitle: "Conecta Telecom",
          period: "2023 — Atual",
          description:
            "• Atendimento de cerca de 60 clientes por dia por telefone, chat e e-mail\n• Nota média de satisfação 4,8/5 nos últimos 12 meses\n• Treinamento de novos atendentes no sistema e nos scripts",
        },
        {
          title: "Operador de Telemarketing",
          subtitle: "Contax",
          period: "2021 — 2023",
          description: "• Atendimento receptivo, registro de solicitações e retenção de clientes",
        },
      ],
      education: [edu("Tecnólogo em Gestão Comercial", "UNINASSAU", "2021 — 2023")],
      courses: ["Zendesk — Atendimento Omnichannel — 10h", "SENAC — Comunicação Assertiva — 20h"],
      skills: [
        "Atendimento multicanal",
        "Resolução de problemas",
        "Zendesk",
        "Retenção de clientes",
        "Empatia",
        "Comunicação clara",
      ],
      languages: ["Português — Nativo", "Inglês — Básico"],
    },
  },
  {
    id: "logistics",
    title: "Auxiliar de Logística",
    category: "Logística e serviços",
    template: "corporate",
    accent: "#0f2a4a",
    data: {
      name: "Carlos Eduardo Nunes",
      role: "Auxiliar de Logística",
      email: "carlos.nunes@email.com",
      phone: "(19) 99123-8899",
      city: "Campinas, SP",
      summary:
        "Auxiliar de logística com 5 anos de experiência em centro de distribuição. Experiência em recebimento, separação, conferência e expedição, com foco em agilidade e precisão.",
      experiences: [
        {
          title: "Auxiliar de Logística",
          subtitle: "Distribuidora Rota Sul",
          period: "2021 — Atual",
          description:
            "• Separação e conferência de pedidos com índice de acerto de 99,6%\n• Recebimento de mercadorias e lançamento no sistema WMS\n• Operação de empilhadeira e organização do armazém",
        },
        {
          title: "Estoquista",
          subtitle: "Atacadão Campinas",
          period: "2019 — 2021",
          description: "• Controle de estoque, inventário mensal e reposição de gôndolas",
        },
      ],
      education: [edu("Técnico em Logística", "ETEC Bento Quirino", "2018 — 2019")],
      courses: ["SENAI — Operador de Empilhadeira (NR-11) — 40h", "SENAI — Gestão de Estoques — 30h"],
      skills: [
        "Separação e conferência",
        "Sistema WMS",
        "Empilhadeira (NR-11)",
        "Inventário",
        "Organização",
        "Segurança no trabalho",
      ],
      languages: ["Português — Nativo"],
    },
  },
  {
    id: "driver",
    title: "Motorista Entregador",
    category: "Logística e serviços",
    template: "essential",
    accent: "#b45309",
    data: {
      name: "José Antônio Pereira",
      role: "Motorista Entregador — CNH D",
      email: "jose.pereira@email.com",
      phone: "(62) 99345-1122",
      city: "Goiânia, GO",
      summary:
        "Motorista com 8 anos de experiência em entregas urbanas e regionais. CNH categoria D e curso de direção defensiva. Pontual, cuidadoso com a carga e sem infrações nos últimos 5 anos.",
      experiences: [
        {
          title: "Motorista Entregador",
          subtitle: "Transportadora Cerrado",
          period: "2019 — Atual",
          description:
            "• Entregas em Goiânia e região com média de 35 paradas por dia\n• Conferência de notas e canhotos e prestação de contas\n• Cuidados preventivos com o veículo e checklist diário",
        },
        {
          title: "Motorista",
          subtitle: "Distribuidora de Bebidas Goiás",
          period: "2016 — 2019",
          description: "• Entregas para bares e mercados e apoio no descarregamento",
        },
      ],
      education: [edu("Ensino Médio Completo", "Colégio Estadual Lyceu de Goiânia", "2014")],
      courses: ["SEST SENAT — Direção Defensiva — 20h", "SEST SENAT — Transporte de Cargas — 50h"],
      skills: [
        "CNH categoria D",
        "Roteirização",
        "Direção defensiva",
        "Conferência de carga",
        "Pontualidade",
        "Atendimento",
      ],
      languages: ["Português — Nativo"],
    },
  },
  {
    id: "industry",
    title: "Auxiliar de Produção",
    category: "Logística e serviços",
    template: "compact",
    accent: "#334155",
    data: {
      name: "Anderson Luiz Carvalho",
      role: "Auxiliar de Produção",
      email: "anderson.carvalho@email.com",
      phone: "(47) 98456-7788",
      city: "Joinville, SC",
      summary:
        "Auxiliar de produção com 6 anos de experiência em indústria metalúrgica e de alimentos. Conhecimento em operação de máquinas, controle de qualidade e normas de segurança.",
      experiences: [
        {
          title: "Auxiliar de Produção",
          subtitle: "Metalúrgica Vale Norte",
          period: "2021 — Atual",
          description:
            "• Operação de prensas e máquinas de corte conforme ordem de produção\n• Inspeção visual de peças e registro de não conformidades\n• Participação em programa 5S que reduziu o tempo de setup",
        },
        {
          title: "Auxiliar de Produção",
          subtitle: "Alimentos Bom Sabor",
          period: "2018 — 2021",
          description: "• Embalagem, rotulagem e controle de lotes na linha de produção",
        },
      ],
      education: [edu("Ensino Médio Completo", "E.E.B. Governador Celso Ramos", "2017")],
      courses: ["SENAI — NR-12 Segurança em Máquinas — 8h", "SENAI — Programa 5S — 16h"],
      skills: [
        "Operação de máquinas",
        "Controle de qualidade",
        "NR-12",
        "5S",
        "Trabalho em turnos",
        "Trabalho em equipe",
      ],
      languages: ["Português — Nativo"],
    },
  },
  {
    id: "nursing-tech",
    title: "Técnico(a) de Enfermagem",
    category: "Saúde e educação",
    template: "elegant",
    accent: "#0f766e",
    data: {
      name: "Patrícia Gomes Barbosa",
      role: "Técnica de Enfermagem — COREN-SP 123456",
      email: "patricia.barbosa@email.com",
      phone: "(11) 99567-1234",
      city: "Santo André, SP",
      summary:
        "Técnica de enfermagem com 7 anos de experiência em clínica médica e pronto atendimento. Cuidado humanizado, segurança do paciente e trabalho integrado com a equipe multiprofissional.",
      experiences: [
        {
          title: "Técnica de Enfermagem",
          subtitle: "Hospital Estadual Mário Covas",
          period: "2020 — Atual",
          description:
            "• Administração de medicamentos, curativos e sinais vitais em clínica médica\n• Registro de evolução no prontuário eletrônico\n• Apoio em procedimentos e preparo de pacientes para exames",
        },
        {
          title: "Técnica de Enfermagem",
          subtitle: "UPA Vila Luzita",
          period: "2017 — 2020",
          description: "• Acolhimento, classificação de risco e atendimento em sala de emergência",
        },
      ],
      education: [edu("Técnico em Enfermagem", "Escola Técnica Santa Casa", "2015 — 2016")],
      courses: ["AHA — Suporte Básico de Vida (BLS) — 8h", "Coren-SP — Segurança do Paciente — 20h"],
      skills: [
        "Administração de medicamentos",
        "Curativos",
        "Sinais vitais",
        "Prontuário eletrônico",
        "Atendimento humanizado",
        "Trabalho em equipe",
      ],
      languages: ["Português — Nativo"],
    },
  },
  {
    id: "teacher",
    title: "Professor(a)",
    category: "Saúde e educação",
    template: "elegant",
    accent: "#9a3412",
    data: {
      name: "Ana Paula Moreira",
      role: "Professora de Ensino Fundamental",
      email: "anapaula.moreira@email.com",
      phone: "(85) 99876-5432",
      city: "Fortaleza, CE",
      summary:
        "Professora licenciada em Pedagogia com 9 anos de experiência nos anos iniciais. Planejamento de aulas ativas, alfabetização e acompanhamento próximo das famílias.",
      experiences: [
        {
          title: "Professora — 1º ao 3º ano",
          subtitle: "Colégio Monte Sião",
          period: "2019 — Atual",
          description:
            "• Regência de turmas com até 28 alunos e foco em alfabetização\n• Criação de projeto de leitura que elevou o índice de fluência da turma\n• Reuniões bimestrais com famílias e relatórios de desenvolvimento",
        },
        {
          title: "Professora Auxiliar",
          subtitle: "Escola Municipal Rachel de Queiroz",
          period: "2016 — 2019",
          description: "• Apoio pedagógico em sala e acompanhamento de alunos com dificuldades",
        },
      ],
      education: [
        edu("Licenciatura em Pedagogia", "Universidade Estadual do Ceará", "2012 — 2016"),
        edu("Pós-graduação em Alfabetização e Letramento", "UNIFOR", "2018 — 2019"),
      ],
      courses: ["MEC — Educação Inclusiva — 60h"],
      skills: [
        "Alfabetização",
        "Planejamento de aulas",
        "Metodologias ativas",
        "Educação inclusiva",
        "Comunicação com famílias",
        "Google Sala de Aula",
      ],
      languages: ["Português — Nativo", "Inglês — Intermediário"],
    },
  },
  {
    id: "technology",
    title: "Desenvolvedor(a) Front-end",
    category: "Tecnologia",
    template: "tech",
    accent: "#059669",
    data: {
      name: "Gabriel Tavares Lopes",
      role: "Desenvolvedor Front-end",
      email: "gabriel.lopes@email.com",
      phone: "(48) 99111-2233",
      city: "Florianópolis, SC · Remoto",
      summary:
        "Desenvolvedor front-end com 4 anos de experiência em React e TypeScript. Interfaces rápidas, acessíveis e bem testadas, com foco em resultado para o negócio.",
      experiences: [
        {
          title: "Desenvolvedor Front-end Pleno",
          subtitle: "Fintech Kora",
          period: "2023 — Atual",
          description:
            "• Desenvolvimento do app web de pagamentos em React, TypeScript e Next.js\n• Redução de 40% no tempo de carregamento com otimizações de bundle e cache\n• Criação de biblioteca de componentes usada por 4 squads",
        },
        {
          title: "Desenvolvedor Front-end Júnior",
          subtitle: "Agência Pixel",
          period: "2021 — 2023",
          description: "• Sites e landing pages para clientes de varejo com foco em SEO e acessibilidade",
        },
      ],
      education: [edu("Análise e Desenvolvimento de Sistemas", "IFSC", "2019 — 2021")],
      courses: ["Alura — Testes com Jest e Testing Library — 16h", "AWS — Cloud Practitioner"],
      skills: [
        "React",
        "TypeScript",
        "Next.js",
        "HTML e CSS",
        "Testes automatizados",
        "Acessibilidade",
        "Git",
        "APIs REST",
      ],
      languages: ["Português — Nativo", "Inglês — Avançado"],
    },
  },
  {
    id: "it-support",
    title: "Suporte Técnico de TI",
    category: "Tecnologia",
    template: "tech",
    accent: "#0b6bcb",
    data: {
      name: "Felipe Augusto Ramos",
      role: "Analista de Suporte Técnico",
      email: "felipe.ramos@email.com",
      phone: "(51) 99234-1100",
      city: "Porto Alegre, RS",
      summary:
        "Analista de suporte com 5 anos de experiência em service desk, redes e manutenção de computadores. Atendimento claro para usuários e foco em resolver rápido.",
      experiences: [
        {
          title: "Analista de Suporte N2",
          subtitle: "Grupo Pampa Serviços",
          period: "2022 — Atual",
          description:
            "• Atendimento a 400 usuários em 3 unidades, com SLA cumprido em 97% dos chamados\n• Administração de Active Directory, Microsoft 365 e impressoras de rede\n• Documentação de procedimentos na base de conhecimento",
        },
        {
          title: "Técnico de Informática",
          subtitle: "InfoTech Assistência",
          period: "2019 — 2022",
          description: "• Montagem, formatação e manutenção de computadores e notebooks",
        },
      ],
      education: [edu("Tecnólogo em Redes de Computadores", "SENAC RS", "2018 — 2020")],
      courses: ["Microsoft — Modern Desktop Administrator", "Cisco — CCNA Introduction to Networks"],
      skills: [
        "Service desk",
        "Windows e Microsoft 365",
        "Active Directory",
        "Redes TCP/IP",
        "Hardware",
        "GLPI",
      ],
      languages: ["Português — Nativo", "Inglês — Intermediário"],
    },
  },
  {
    id: "marketing",
    title: "Analista de Marketing Digital",
    category: "Marketing e criação",
    template: "creative",
    accent: "#7c3aed",
    data: {
      name: "Larissa Teixeira Campos",
      role: "Analista de Marketing Digital",
      email: "larissa.campos@email.com",
      phone: "(11) 98111-4455",
      city: "São Paulo, SP",
      summary:
        "Analista de marketing com 5 anos de experiência em mídia paga, conteúdo e análise de dados. Campanhas orientadas por métricas e foco em geração de vendas.",
      experiences: [
        {
          title: "Analista de Marketing Digital",
          subtitle: "Loja Online Casa&Cia",
          period: "2022 — Atual",
          description:
            "• Gestão de campanhas no Google Ads e Meta Ads com verba mensal de R$ 80 mil\n• Aumento de 35% nas vendas online com otimização de funil e testes A/B\n• Relatórios semanais no Looker Studio para a diretoria",
        },
        {
          title: "Assistente de Marketing",
          subtitle: "Agência Conecta",
          period: "2020 — 2022",
          description: "• Produção de conteúdo e calendário editorial para 8 clientes",
        },
      ],
      education: [edu("Publicidade e Propaganda", "Universidade Mackenzie", "2016 — 2020")],
      courses: ["Google — Certificação Google Ads", "RD Station — Inbound Marketing"],
      skills: ["Google Ads", "Meta Ads", "SEO", "Google Analytics", "Copywriting", "Looker Studio"],
      languages: ["Português — Nativo", "Inglês — Avançado"],
    },
  },
  {
    id: "designer",
    title: "Designer Gráfico",
    category: "Marketing e criação",
    template: "creative",
    accent: "#be123c",
    data: {
      name: "Bruno Cardoso Freitas",
      role: "Designer Gráfico",
      email: "bruno.freitas@email.com",
      phone: "(27) 99887-1212",
      city: "Vitória, ES",
      summary:
        "Designer gráfico com 6 anos de experiência em identidade visual, peças digitais e materiais impressos. Soluções criativas alinhadas aos objetivos de cada marca.",
      experiences: [
        {
          title: "Designer Gráfico",
          subtitle: "Estúdio Maré Criativo",
          period: "2021 — Atual",
          description:
            "• Criação de identidades visuais para mais de 30 marcas locais\n• Peças para redes sociais, embalagens e materiais de ponto de venda\n• Apresentação de propostas e ajustes diretamente com clientes",
        },
        {
          title: "Designer Júnior",
          subtitle: "Gráfica Capixaba",
          period: "2018 — 2021",
          description: "• Diagramação e preparação de arquivos para impressão",
        },
      ],
      education: [edu("Design Gráfico", "UFES", "2014 — 2018")],
      courses: ["Domestika — Branding Estratégico", "Adobe — Illustrator Avançado"],
      skills: [
        "Identidade visual",
        "Adobe Illustrator",
        "Adobe Photoshop",
        "Figma",
        "Tipografia",
        "Pré-impressão",
      ],
      languages: ["Português — Nativo", "Inglês — Intermediário"],
    },
  },
  {
    id: "finance",
    title: "Analista Financeiro",
    category: "Gestão e finanças",
    template: "minimal",
    accent: "#0f2a4a",
    data: {
      name: "Renata Duarte Vieira",
      role: "Analista Financeira",
      email: "renata.vieira@email.com",
      phone: "(31) 99701-2020",
      city: "Belo Horizonte, MG",
      summary:
        "Analista financeira com 6 anos de experiência em fluxo de caixa, conciliação e relatórios gerenciais. Precisão nos números e visão de negócio para apoiar decisões.",
      experiences: [
        {
          title: "Analista Financeira",
          subtitle: "Construtora Serra Azul",
          period: "2021 — Atual",
          description:
            "• Gestão do fluxo de caixa de 12 obras e projeções mensais\n• Conciliação bancária e fechamento mensal em até 3 dias úteis\n• Renegociação com fornecedores que gerou economia de R$ 250 mil ao ano",
        },
        {
          title: "Assistente Financeira",
          subtitle: "Rede Farma Minas",
          period: "2018 — 2021",
          description: "• Contas a pagar e receber e controle de inadimplência",
        },
      ],
      education: [edu("Ciências Contábeis", "UFMG", "2014 — 2018")],
      courses: ["FGV — Análise de Demonstrações Financeiras — 30h", "Excel Avançado e Power BI — 40h"],
      skills: [
        "Fluxo de caixa",
        "Conciliação bancária",
        "Relatórios gerenciais",
        "Excel avançado",
        "Power BI",
        "SAP",
      ],
      languages: ["Português — Nativo", "Inglês — Avançado"],
    },
  },
  {
    id: "hr",
    title: "Analista de RH",
    category: "Gestão e finanças",
    template: "professional",
    accent: "#be123c",
    data: {
      name: "Fernanda Lima Correia",
      role: "Analista de Recursos Humanos",
      email: "fernanda.correia@email.com",
      phone: "(41) 99555-8787",
      city: "Curitiba, PR",
      summary:
        "Analista de RH com 5 anos de experiência em recrutamento e seleção, integração e clima organizacional. Processos humanizados e alinhados à estratégia da empresa.",
      experiences: [
        {
          title: "Analista de RH",
          subtitle: "Grupo Sul Varejo",
          period: "2022 — Atual",
          description:
            "• Condução de cerca de 40 processos seletivos por mês para lojas e escritório\n• Redução de 25% no tempo de contratação com nova triagem de currículos\n• Programa de integração para novos colaboradores",
        },
        {
          title: "Assistente de RH",
          subtitle: "Indústria Paraná Têxtil",
          period: "2019 — 2022",
          description: "• Admissões, controle de ponto e apoio na folha de pagamento",
        },
      ],
      education: [edu("Psicologia", "PUCPR", "2014 — 2019")],
      courses: ["SENAC — Departamento Pessoal Completo — 60h", "Gupy — Recrutamento Estratégico"],
      skills: [
        "Recrutamento e seleção",
        "Entrevistas por competência",
        "Integração",
        "Clima organizacional",
        "Departamento pessoal",
        "Comunicação",
      ],
      languages: ["Português — Nativo", "Inglês — Intermediário"],
    },
  },
  {
    id: "store-manager",
    title: "Gerente de Loja",
    category: "Gestão e finanças",
    template: "executive",
    accent: "#1f2937",
    data: {
      name: "Marcelo Antunes Ribeiro",
      role: "Gerente de Loja",
      email: "marcelo.ribeiro@email.com",
      phone: "(11) 99444-6060",
      city: "Osasco, SP",
      summary:
        "Gerente de loja com 10 anos no varejo, sendo 5 em gestão. Liderança de equipes, metas, indicadores e experiência do cliente. Loja entre as 3 melhores da rede em 2024.",
      experiences: [
        {
          title: "Gerente de Loja",
          subtitle: "Rede Super Lar Utilidades",
          period: "2020 — Atual",
          description:
            "• Gestão de equipe de 22 colaboradores e escala de trabalho\n• Crescimento de 18% no faturamento em 2024 e loja no top 3 da rede\n• Controle de estoque, quebras e indicadores de venda",
        },
        {
          title: "Subgerente",
          subtitle: "Rede Super Lar Utilidades",
          period: "2017 — 2020",
          description: "• Abertura e fechamento da loja, treinamento de vendedores e caixa",
        },
      ],
      education: [edu("Gestão Comercial", "Universidade Anhembi Morumbi", "2015 — 2017")],
      courses: ["FGV — Liderança e Gestão de Pessoas — 40h", "Sebrae — Gestão de Varejo — 20h"],
      skills: [
        "Liderança de equipes",
        "Gestão de metas",
        "Indicadores de vendas",
        "Controle de estoque",
        "Experiência do cliente",
        "Resolução de conflitos",
      ],
      languages: ["Português — Nativo", "Espanhol — Intermediário"],
    },
  },
  {
    id: "cook",
    title: "Cozinheiro(a)",
    category: "Logística e serviços",
    template: "compact",
    accent: "#b45309",
    data: {
      name: "Roberto Carlos Andrade",
      role: "Cozinheiro",
      email: "roberto.andrade@email.com",
      phone: "(48) 99812-7070",
      city: "Florianópolis, SC",
      summary:
        "Cozinheiro com 7 anos de experiência em restaurantes à la carte e buffet. Organização da praça, padrão de pratos e boas práticas de higiene alimentar.",
      experiences: [
        {
          title: "Cozinheiro",
          subtitle: "Restaurante Mar Aberto",
          period: "2021 — Atual",
          description:
            "• Preparo de pratos à la carte para até 200 refeições por serviço\n• Controle de mise en place, validade e armazenamento de insumos\n• Treinamento de auxiliares de cozinha",
        },
        {
          title: "Auxiliar de Cozinha",
          subtitle: "Buffet Sabor da Ilha",
          period: "2018 — 2021",
          description: "• Pré-preparo, montagem de buffet e higienização da cozinha",
        },
      ],
      education: [edu("Ensino Médio Completo", "E.E.B. Getúlio Vargas", "2016")],
      courses: ["SENAC — Cozinheiro — 160h", "SENAC — Boas Práticas de Manipulação de Alimentos — 16h"],
      skills: [
        "Cozinha à la carte",
        "Mise en place",
        "Boas práticas de higiene",
        "Controle de estoque",
        "Agilidade",
        "Trabalho sob pressão",
      ],
      languages: ["Português — Nativo"],
    },
  },
];

/** IDs antigos continuam funcionando em links já compartilhados. */
const ALIASES: Record<string, string> = {};

export const exampleById = (id: string | null | undefined) =>
  RESUME_EXAMPLES.find((x) => x.id === (id ? ALIASES[id] || id : "")) || null;
