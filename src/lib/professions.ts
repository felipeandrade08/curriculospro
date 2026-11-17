// Páginas "Currículo para <profissão>" (/curriculo/[slug]): conteúdo original por cargo,
// pensado para quem pesquisa no Google como montar o currículo da sua área.
export type Profession = {
  slug: string;
  name: string;
  area: string;
  /** Exemplo usado como prévia visual e base do botão "Começar". */
  example: string;
  objective: string;
  activities: string[];
  skills: string[];
  courses: string[];
  tips: string[];
};

const P = (p: Profession) => p;

export const PROFESSIONS: Profession[] = [
  P({
    slug: "auxiliar-administrativo",
    name: "Auxiliar Administrativo",
    area: "Administrativo",
    example: "administrative",
    objective:
      "Auxiliar administrativo com experiência em rotinas de escritório, controle de documentos e atendimento a clientes e fornecedores. Organizado, com domínio de Excel e facilidade para aprender novos sistemas.",
    activities: [
      "Organização e arquivamento de documentos físicos e digitais",
      "Lançamento de notas fiscais e controle de contas a pagar e receber",
      "Atendimento telefônico e por e-mail a clientes e fornecedores",
      "Elaboração de planilhas e relatórios no Excel",
      "Apoio ao departamento pessoal no controle de ponto e benefícios",
    ],
    skills: ["Pacote Office", "Excel", "Rotinas administrativas", "Atendimento ao cliente", "Organização", "Emissão de notas fiscais", "Comunicação", "Proatividade"],
    courses: ["Excel Intermediário", "Assistente Administrativo", "Rotinas de Departamento Pessoal"],
    tips: [
      "Cite os sistemas que você usou (ERP, emissor de notas, sistema de ponto): isso pesa muito na triagem.",
      "Mostre volume: quantos documentos, clientes ou notas você controlava por mês.",
      "Revise duas vezes. Erro de digitação em currículo administrativo é eliminatório.",
    ],
  }),
  P({
    slug: "jovem-aprendiz",
    name: "Jovem Aprendiz",
    area: "Primeiro emprego",
    example: "first-job",
    objective:
      "Estudante em busca da primeira oportunidade como jovem aprendiz. Pontual, responsável e com vontade de aprender, com facilidade para trabalhar em equipe e lidar com o público.",
    activities: [
      "Participação em projetos da escola, como feira de ciências e grêmio estudantil",
      "Trabalho voluntário em campanhas da comunidade",
      "Ajuda no comércio da família, no atendimento e na organização do estoque",
      "Organização de eventos e atividades na igreja ou associação do bairro",
    ],
    skills: ["Pontualidade", "Vontade de aprender", "Trabalho em equipe", "Comunicação", "Organização", "Informática básica", "Responsabilidade"],
    courses: ["Informática Básica", "Excel Básico", "Atendimento ao Cliente"],
    tips: [
      "Sem experiência formal, valem projetos escolares, voluntariado e cursos online gratuitos.",
      "Informe a série, a escola e o turno em que estuda: o horário do programa depende disso.",
      "Use um e-mail com seu nome. Apelidos passam uma imagem pouco profissional.",
    ],
  }),
  P({
    slug: "primeiro-emprego",
    name: "Primeiro Emprego",
    area: "Primeiro emprego",
    example: "first-job",
    objective:
      "Em busca da primeira oportunidade de trabalho, com disponibilidade de horário e interesse em crescer na empresa. Comunicativo, organizado e com facilidade de aprendizado.",
    activities: [
      "Atendimento ao público em evento ou trabalho voluntário",
      "Apoio na organização de materiais e eventos da escola",
      "Pequenos trabalhos informais, como vendas ou entregas",
      "Cursos livres concluídos online",
    ],
    skills: ["Disponibilidade de horário", "Comunicação", "Organização", "Trabalho em equipe", "Informática básica", "Pontualidade"],
    courses: ["Informática Básica", "Atendimento ao Cliente", "Excel Básico"],
    tips: [
      "Comece pelo resumo: diga o tipo de vaga que procura e o que você já sabe fazer.",
      "Coloque a escolaridade logo no início, já que ainda não há experiência para destacar.",
      "Um currículo de uma página, limpo e sem erros, já coloca você à frente de muita gente.",
    ],
  }),
  P({
    slug: "recepcionista",
    name: "Recepcionista",
    area: "Administrativo",
    example: "receptionist",
    objective:
      "Recepcionista com experiência em atendimento presencial e telefônico, agendamento e organização da recepção. Cordial, organizada e acostumada a lidar com alto fluxo de pessoas.",
    activities: [
      "Recepção de clientes e visitantes, com cadastro e encaminhamento",
      "Agendamento e confirmação de consultas e reuniões",
      "Atendimento telefônico, WhatsApp e e-mail",
      "Controle de caixa da recepção e recebimento de pagamentos",
      "Organização de documentos e da agenda dos profissionais",
    ],
    skills: ["Atendimento ao cliente", "Agendamento", "Atendimento telefônico", "Pacote Office", "Cordialidade", "Organização", "WhatsApp Business"],
    courses: ["Recepcionista", "Atendimento ao Cliente", "Excel Básico"],
    tips: [
      "Diga o tipo de ambiente em que trabalhou (clínica, hotel, escritório, condomínio).",
      "Cite o sistema de agendamento usado. Clínicas valorizam quem já conhece o fluxo.",
      "Postura e comunicação são avaliadas desde o primeiro contato: capriche no texto do resumo.",
    ],
  }),
  P({
    slug: "vendedor",
    name: "Vendedor(a)",
    area: "Comércio e atendimento",
    example: "retail",
    objective:
      "Vendedor com experiência em loja, atendimento consultivo e cumprimento de metas. Comunicativo, persuasivo e focado em fidelizar clientes.",
    activities: [
      "Atendimento e venda consultiva, entendendo a necessidade de cada cliente",
      "Cumprimento de metas mensais de vendas e de produtos adicionais",
      "Organização da vitrine e exposição dos produtos",
      "Pós-venda e relacionamento com clientes pelo WhatsApp",
      "Fechamento de vendas e operação do caixa quando necessário",
    ],
    skills: ["Vendas", "Negociação", "Atendimento ao cliente", "Pós-venda", "Metas de vendas", "Comunicação", "WhatsApp Business", "Merchandising"],
    courses: ["Técnicas de Vendas", "Atendimento ao Cliente", "Vendas pelo WhatsApp"],
    tips: [
      "Números vendem: diga quanto bateu da meta, prêmios ou posição no ranking da loja.",
      "Mostre que sabe vender pelo WhatsApp e redes sociais, cada vez mais pedido.",
      "Informe disponibilidade para escala, fins de semana e feriados.",
    ],
  }),
  P({
    slug: "operador-de-caixa",
    name: "Operador(a) de Caixa",
    area: "Comércio e atendimento",
    example: "cashier",
    objective:
      "Operadora de caixa com experiência em supermercado, atenção aos valores e agilidade no atendimento. Responsável, cordial e com disponibilidade para escala.",
    activities: [
      "Registro de produtos e recebimento em dinheiro, cartão e Pix",
      "Abertura e fechamento de caixa, com conferência de valores",
      "Atendimento cordial e resolução de dúvidas dos clientes",
      "Conferência de preços e apoio na reposição em horários de menor movimento",
    ],
    skills: ["Operação de caixa", "Atendimento ao cliente", "Atenção aos detalhes", "Agilidade", "Responsabilidade", "Matemática básica"],
    courses: ["Operador de Caixa", "Atendimento ao Cliente", "Matemática Financeira Básica"],
    tips: [
      "Diga que não teve diferença de caixa ou que tinha baixo índice de erros, se for o caso.",
      "Cite os sistemas de PDV e as formas de pagamento com que já trabalhou.",
      "Disponibilidade para escala 6x1 e feriados é um diferencial importante.",
    ],
  }),
  P({
    slug: "atendente",
    name: "Atendente",
    area: "Comércio e atendimento",
    example: "customer-service",
    objective:
      "Atendente com experiência em atendimento presencial e por telefone, resolução de dúvidas e reclamações. Paciente, comunicativo e com foco na satisfação do cliente.",
    activities: [
      "Atendimento ao cliente presencial, por telefone, chat e WhatsApp",
      "Registro de pedidos, reclamações e solicitações no sistema",
      "Resolução de problemas no primeiro contato sempre que possível",
      "Acompanhamento de casos até a solução final",
    ],
    skills: ["Atendimento ao cliente", "Comunicação", "Empatia", "Resolução de problemas", "Atendimento telefônico", "Informática básica", "Paciência"],
    courses: ["Atendimento ao Cliente", "Comunicação Assertiva", "Informática Básica"],
    tips: [
      "Mostre indicadores: nota de satisfação, tempo médio de atendimento, volume diário.",
      "Diga quais canais você atendeu: telefone, chat, WhatsApp, e-mail ou balcão.",
      "Escreva de forma clara e educada. O próprio currículo mostra como você se comunica.",
    ],
  }),
  P({
    slug: "operador-de-telemarketing",
    name: "Operador(a) de Telemarketing",
    area: "Comércio e atendimento",
    example: "customer-service",
    objective:
      "Operador de telemarketing com experiência em atendimento receptivo e ativo, seguindo roteiros e metas de qualidade. Boa dicção, paciência e agilidade no sistema.",
    activities: [
      "Atendimento receptivo de clientes com dúvidas e solicitações",
      "Ligações ativas de venda, cobrança ou pesquisa",
      "Registro de atendimentos no CRM e encaminhamento de casos",
      "Cumprimento de metas de tempo médio e qualidade",
    ],
    skills: ["Atendimento telefônico", "Comunicação", "Digitação", "Negociação", "Resiliência", "Foco em resultados", "CRM"],
    courses: ["Telemarketing", "Técnicas de Negociação", "Digitação"],
    tips: [
      "Cite as metas que atingia: TMA, nota de qualidade, conversão em vendas.",
      "Mencione se trabalhou com receptivo, ativo, SAC, cobrança ou retenção.",
      "Digitação rápida é muito valorizada. Se fez curso, coloque.",
    ],
  }),
  P({
    slug: "repositor",
    name: "Repositor(a)",
    area: "Comércio e atendimento",
    example: "cashier",
    objective:
      "Repositor com experiência em supermercado, organização de gôndolas e controle de validade. Ágil, organizado e acostumado a trabalhar em equipe.",
    activities: [
      "Reposição de mercadorias nas gôndolas seguindo o padrão da loja",
      "Controle de validade e retirada de produtos vencidos ou avariados",
      "Precificação e conferência de etiquetas",
      "Organização do depósito e recebimento de mercadorias",
    ],
    skills: ["Reposição de mercadorias", "Organização", "Controle de estoque", "Agilidade", "Trabalho em equipe", "Atenção aos detalhes"],
    courses: ["Repositor de Mercadorias", "Atendimento ao Cliente", "Boas Práticas no Varejo"],
    tips: [
      "Diga em quais setores trabalhou: mercearia, perecíveis, hortifruti, bebidas.",
      "Mostre cuidado com validade e organização: é o que o encarregado mais avalia.",
      "Disponibilidade de horário e para escala é um diferencial.",
    ],
  }),
  P({
    slug: "auxiliar-de-logistica",
    name: "Auxiliar de Logística",
    area: "Logística e serviços",
    example: "logistics",
    objective:
      "Auxiliar de logística com experiência em recebimento, conferência e separação de mercadorias. Organizado, atento aos detalhes e com conhecimento de controle de estoque.",
    activities: [
      "Recebimento e conferência de mercadorias com a nota fiscal",
      "Separação e embalagem de pedidos para expedição",
      "Controle de estoque e participação em inventários",
      "Lançamentos de entrada e saída no sistema",
    ],
    skills: ["Controle de estoque", "Recebimento e conferência", "Separação de pedidos", "Logística", "Organização", "Atenção aos detalhes", "ERP"],
    courses: ["Logística e Almoxarifado", "Operador de Empilhadeira (NR-11)", "Excel Básico"],
    tips: [
      "Cite o volume que movimentava (pedidos por dia, itens conferidos).",
      "Curso de empilhadeira ou NR-11 abre muitas portas na área: coloque em destaque.",
      "Mencione se já usou coletor de dados ou sistema WMS.",
    ],
  }),
  P({
    slug: "estoquista",
    name: "Estoquista",
    area: "Logística e serviços",
    example: "logistics",
    objective:
      "Estoquista com experiência em organização de estoque, inventários e controle de entrada e saída de mercadorias. Responsável e cuidadoso com a conferência.",
    activities: [
      "Organização física do estoque por categoria e giro",
      "Controle de entrada e saída de produtos no sistema",
      "Realização de inventários periódicos",
      "Separação de mercadorias para a loja e para entregas",
    ],
    skills: ["Controle de estoque", "Organização", "Recebimento e conferência", "Inventário", "Informática básica", "Responsabilidade"],
    courses: ["Almoxarifado", "Controle de Estoque", "Excel Básico"],
    tips: [
      "Mostre resultado: redução de perdas, acerto no inventário, organização implantada.",
      "Diga o tipo de produto com que trabalhou (alimentos, roupas, peças, medicamentos).",
      "Cite o sistema de estoque que usou.",
    ],
  }),
  P({
    slug: "motorista",
    name: "Motorista",
    area: "Logística e serviços",
    example: "driver",
    objective:
      "Motorista com CNH categoria D e experiência em entregas urbanas e viagens. Responsável, pontual e com histórico de direção segura.",
    activities: [
      "Entregas e coletas seguindo rota planejada",
      "Conferência da carga e dos documentos antes da saída",
      "Cuidados com a manutenção preventiva do veículo",
      "Atendimento cordial a clientes no momento da entrega",
    ],
    skills: ["Direção defensiva", "Entregas", "Pontualidade", "Responsabilidade", "Conhecimento de rotas", "Atendimento ao cliente"],
    courses: ["Direção Defensiva", "MOPP", "Primeiros Socorros"],
    tips: [
      "Coloque a categoria da CNH logo no topo, junto aos contatos.",
      "Informe se tem curso MOPP, transporte coletivo ou de cargas indivisíveis.",
      "Tempo sem acidentes e sem multas é um ótimo argumento.",
    ],
  }),
  P({
    slug: "motoboy",
    name: "Motoboy / Entregador",
    area: "Logística e serviços",
    example: "driver",
    objective:
      "Entregador com moto própria e CNH categoria A, experiência em entregas rápidas e conhecimento da região. Pontual, cuidadoso com as mercadorias e com bom atendimento.",
    activities: [
      "Entregas de pedidos e documentos dentro do prazo",
      "Recebimento de pagamentos na entrega",
      "Planejamento de rotas para reduzir tempo e custo",
      "Cuidado com a mercadoria e com a manutenção da moto",
    ],
    skills: ["Entregas", "Conhecimento de rotas", "Pontualidade", "Responsabilidade", "Atendimento ao cliente", "Direção defensiva"],
    courses: ["Motofrete (curso obrigatório)", "Direção Defensiva", "Primeiros Socorros"],
    tips: [
      "Diga se tem moto própria, baú e o curso de motofretista.",
      "Cite as regiões e cidades que conhece bem.",
      "Experiência com aplicativos de entrega também conta.",
    ],
  }),
  P({
    slug: "auxiliar-de-producao",
    name: "Auxiliar de Produção",
    area: "Logística e serviços",
    example: "industry",
    objective:
      "Auxiliar de produção com experiência em linha de produção, operação de máquinas e controle de qualidade. Atento às normas de segurança e com disponibilidade para turnos.",
    activities: [
      "Abastecimento e operação de máquinas da linha de produção",
      "Inspeção visual das peças e separação de itens fora do padrão",
      "Embalagem e identificação dos produtos acabados",
      "Organização e limpeza do posto de trabalho (5S)",
    ],
    skills: ["Produção", "Operação de máquinas", "Controle de qualidade", "Segurança do trabalho", "5S", "Trabalho em equipe", "Agilidade"],
    courses: ["NR-12 Segurança em Máquinas", "5S e Qualidade", "Leitura de Desenho Técnico"],
    tips: [
      "Informe disponibilidade para turnos (1º, 2º, 3º ou revezamento).",
      "Cite as NRs e cursos de segurança que você tem.",
      "Mostre que segue padrão: qualidade e segurança são o que a fábrica mais avalia.",
    ],
  }),
  P({
    slug: "auxiliar-de-limpeza",
    name: "Auxiliar de Limpeza",
    area: "Logística e serviços",
    example: "industry",
    objective:
      "Auxiliar de limpeza com experiência em limpeza e conservação de escritórios, condomínios e áreas comuns. Caprichosa, discreta e responsável com horários.",
    activities: [
      "Limpeza e higienização de salas, banheiros e áreas comuns",
      "Uso correto e controle de produtos e materiais de limpeza",
      "Coleta e separação de lixo reciclável",
      "Apoio na organização da copa e reposição de itens",
    ],
    skills: ["Limpeza", "Organização", "Responsabilidade", "Pontualidade", "Discrição", "Uso de EPI"],
    courses: ["Limpeza Profissional", "Uso de Produtos Químicos e EPI (NR-06)", "Higienização Hospitalar"],
    tips: [
      "Diga os tipos de ambiente em que trabalhou: hospital, escola, condomínio, indústria.",
      "Cite cuidados com produtos químicos e uso de EPI.",
      "Referências de antigos empregadores ajudam muito nessa área.",
    ],
  }),
  P({
    slug: "porteiro",
    name: "Porteiro(a)",
    area: "Logística e serviços",
    example: "receptionist",
    objective:
      "Porteiro com experiência em condomínios residenciais e comerciais, controle de acesso e atendimento a moradores e visitantes. Atento, educado e responsável.",
    activities: [
      "Controle de entrada e saída de moradores, visitantes e prestadores",
      "Recebimento e registro de encomendas e correspondências",
      "Monitoramento das câmeras e rondas pelo condomínio",
      "Registro de ocorrências no livro ou sistema",
    ],
    skills: ["Portaria", "Controle de acesso", "Atendimento ao público", "Atenção", "Responsabilidade", "Discrição"],
    courses: ["Porteiro e Controlador de Acesso", "Primeiros Socorros", "Brigada de Incêndio"],
    tips: [
      "Diga se trabalhou em portaria remota, residencial ou comercial.",
      "Cursos de brigada e primeiros socorros fazem diferença na seleção.",
      "Disponibilidade para escala 12x36 noturna é muito procurada.",
    ],
  }),
  P({
    slug: "cozinheiro",
    name: "Cozinheiro(a)",
    area: "Logística e serviços",
    example: "cook",
    objective:
      "Cozinheiro com experiência em restaurante à la carte e self-service, preparo de pratos quentes e organização da praça. Ágil, caprichoso e atento às normas de higiene.",
    activities: [
      "Preparo de pratos quentes, guarnições e molhos do cardápio",
      "Pré-preparo e organização da praça antes do serviço",
      "Controle de estoque, validade e pedidos de insumos",
      "Aplicação das boas práticas de manipulação de alimentos",
    ],
    skills: ["Cozinha", "Boas práticas de manipulação de alimentos", "Organização", "Agilidade", "Trabalho em equipe", "Controle de estoque"],
    courses: ["Boas Práticas de Manipulação de Alimentos", "Cozinheiro Profissional", "Gestão de Cozinha"],
    tips: [
      "Diga os tipos de cozinha que domina: brasileira, italiana, japonesa, confeitaria.",
      "Mencione volume: quantas refeições por dia ou couverts por noite.",
      "Curso de boas práticas é quase obrigatório. Coloque em destaque.",
    ],
  }),
  P({
    slug: "auxiliar-de-cozinha",
    name: "Auxiliar de Cozinha",
    area: "Logística e serviços",
    example: "cook",
    objective:
      "Auxiliar de cozinha com experiência em pré-preparo, higienização e apoio ao cozinheiro em restaurante de alto movimento. Organizado, rápido e cuidadoso com a higiene.",
    activities: [
      "Pré-preparo de legumes, carnes e saladas",
      "Higienização de utensílios, equipamentos e da cozinha",
      "Apoio na montagem dos pratos durante o serviço",
      "Recebimento e armazenamento correto dos insumos",
    ],
    skills: ["Cozinha", "Boas práticas de manipulação de alimentos", "Limpeza", "Agilidade", "Trabalho em equipe", "Organização"],
    courses: ["Boas Práticas de Manipulação de Alimentos", "Auxiliar de Cozinha", "Higiene e Segurança Alimentar"],
    tips: [
      "Mostre que conhece as regras de higiene e armazenamento.",
      "Diga em que tipo de cozinha trabalhou: restaurante, hotel, hospital, indústria.",
      "Disponibilidade para noites e fins de semana é diferencial.",
    ],
  }),
  P({
    slug: "garcom",
    name: "Garçom / Garçonete",
    area: "Comércio e atendimento",
    example: "cook",
    objective:
      "Garçom com experiência em restaurantes e eventos, atendimento cordial e conhecimento do cardápio. Ágil, atento aos detalhes e com boa comunicação.",
    activities: [
      "Atendimento às mesas, anotação de pedidos e sugestões do cardápio",
      "Serviço de bebidas e pratos seguindo o padrão da casa",
      "Montagem e organização do salão",
      "Fechamento de contas e recebimento",
    ],
    skills: ["Atendimento de mesas", "Atendimento ao cliente", "Agilidade", "Comunicação", "Trabalho em equipe", "Simpatia"],
    courses: ["Garçom Profissional", "Atendimento ao Cliente", "Noções de Vinhos e Bebidas"],
    tips: [
      "Diga o tipo de casa: bar, restaurante, buffet, hotel, eventos.",
      "Inglês básico é um diferencial forte em cidades turísticas.",
      "Mencione se sabe usar comanda eletrônica ou sistema de pedidos.",
    ],
  }),
  P({
    slug: "tecnico-de-enfermagem",
    name: "Técnico(a) de Enfermagem",
    area: "Saúde e educação",
    example: "nursing-tech",
    objective:
      "Técnica de enfermagem com COREN ativo e experiência em clínica médica e pronto atendimento. Atenciosa, ágil e comprometida com a segurança do paciente.",
    activities: [
      "Aferição de sinais vitais e registro no prontuário",
      "Administração de medicamentos conforme prescrição",
      "Curativos, coleta de exames e preparo de pacientes",
      "Apoio à equipe de enfermagem nos cuidados diários",
    ],
    skills: ["Sinais vitais", "Administração de medicamentos", "Curativos", "Atendimento humanizado", "Trabalho em equipe", "Atenção aos detalhes"],
    courses: ["Urgência e Emergência", "Suporte Básico de Vida", "Curativos e Feridas"],
    tips: [
      "Coloque o número do COREN logo abaixo do nome.",
      "Diga os setores em que atuou: UTI, pronto-socorro, clínica, home care.",
      "Cursos de atualização (BLS, urgência) contam muito na seleção.",
    ],
  }),
  P({
    slug: "cuidador-de-idosos",
    name: "Cuidador(a) de Idosos",
    area: "Saúde e educação",
    example: "nursing-tech",
    objective:
      "Cuidadora de idosos com experiência em cuidados diários, administração de medicamentos e acompanhamento em consultas. Paciente, carinhosa e de confiança.",
    activities: [
      "Auxílio na higiene pessoal, alimentação e locomoção",
      "Controle dos horários de medicamentos conforme orientação médica",
      "Acompanhamento em consultas, exames e passeios",
      "Estímulo a atividades de memória e convívio",
    ],
    skills: ["Cuidado de idosos", "Administração de medicamentos", "Empatia", "Paciência", "Primeiros socorros", "Responsabilidade"],
    courses: ["Cuidador de Idosos", "Primeiros Socorros", "Cuidados com Alzheimer e Demências"],
    tips: [
      "Referências de famílias atendidas fazem muita diferença.",
      "Diga se tem experiência com acamados, Alzheimer ou pós-cirúrgico.",
      "Informe disponibilidade para dormir no emprego ou escala 12x36.",
    ],
  }),
  P({
    slug: "professor",
    name: "Professor(a)",
    area: "Saúde e educação",
    example: "teacher",
    objective:
      "Professora com licenciatura e experiência em ensino fundamental, planejamento de aulas e acompanhamento individual dos alunos. Criativa, paciente e comprometida com o aprendizado.",
    activities: [
      "Planejamento e aplicação de aulas alinhadas à BNCC",
      "Elaboração e correção de avaliações",
      "Acompanhamento individual de alunos com dificuldade",
      "Reuniões com famílias e coordenação pedagógica",
    ],
    skills: ["Planejamento de aulas", "Didática", "Educação inclusiva", "Comunicação", "Criatividade", "Tecnologia em sala de aula"],
    courses: ["Educação Inclusiva", "Metodologias Ativas", "Alfabetização e Letramento"],
    tips: [
      "Informe as séries e disciplinas que já lecionou.",
      "Mostre projetos que você desenvolveu com as turmas.",
      "Pós-graduação e cursos de formação continuada valem pontos em processos seletivos.",
    ],
  }),
  P({
    slug: "auxiliar-de-sala",
    name: "Auxiliar de Sala / Educação Infantil",
    area: "Saúde e educação",
    example: "teacher",
    objective:
      "Auxiliar de educação infantil com experiência em cuidado e acompanhamento de crianças de 1 a 5 anos. Carinhosa, paciente e atenta à segurança dos pequenos.",
    activities: [
      "Apoio à professora nas atividades pedagógicas e recreativas",
      "Cuidados com alimentação, higiene e descanso das crianças",
      "Organização da sala e dos materiais",
      "Acompanhamento na entrada e saída e comunicação com as famílias",
    ],
    skills: ["Cuidado infantil", "Paciência", "Recreação", "Organização", "Comunicação", "Trabalho em equipe"],
    courses: ["Auxiliar de Educação Infantil", "Primeiros Socorros Pediátricos", "Contação de Histórias"],
    tips: [
      "Diga as faixas etárias com que já trabalhou.",
      "Primeiros socorros pediátricos é um diferencial muito valorizado.",
      "Se está cursando pedagogia, coloque o semestre atual.",
    ],
  }),
  P({
    slug: "suporte-tecnico",
    name: "Suporte Técnico / Help Desk",
    area: "Tecnologia",
    example: "it-support",
    objective:
      "Analista de suporte técnico com experiência em atendimento a usuários, manutenção de computadores e redes. Didático, organizado e focado em resolver no primeiro contato.",
    activities: [
      "Atendimento a chamados de usuários por telefone, chat e presencial",
      "Instalação e configuração de computadores, impressoras e softwares",
      "Gerenciamento de contas de usuários no Active Directory",
      "Diagnóstico de problemas de rede e conectividade",
    ],
    skills: ["Suporte técnico", "Windows", "Redes", "Manutenção de computadores", "Active Directory", "Atendimento ao cliente", "Office 365"],
    courses: ["ITIL Foundation", "Redes de Computadores", "Manutenção de Computadores"],
    tips: [
      "Mostre volume e prazo: chamados por dia e percentual resolvido no SLA.",
      "Cite as ferramentas de chamados que usou (GLPI, Jira, ServiceNow).",
      "Certificações, mesmo as gratuitas, ajudam muito no início da carreira.",
    ],
  }),
  P({
    slug: "desenvolvedor",
    name: "Desenvolvedor(a)",
    area: "Tecnologia",
    example: "technology",
    objective:
      "Desenvolvedor web com experiência em JavaScript, React e Node.js, criação de APIs e integração com bancos de dados. Gosto de código limpo, testes e trabalho em equipe.",
    activities: [
      "Desenvolvimento de funcionalidades front-end com React e TypeScript",
      "Criação e manutenção de APIs REST em Node.js",
      "Modelagem e consultas em bancos SQL",
      "Revisão de código e testes automatizados",
    ],
    skills: ["JavaScript", "TypeScript", "React", "Node.js", "SQL", "Git", "APIs REST", "Testes automatizados"],
    courses: ["Bootcamp Full Stack", "AWS Cloud Practitioner", "Inglês Técnico"],
    tips: [
      "Coloque o link do GitHub e de um portfólio com projetos que funcionem.",
      "Descreva o impacto: tempo de carregamento reduzido, bugs resolvidos, usuários atendidos.",
      "Liste as tecnologias que você realmente usa no dia a dia, não tudo o que já viu.",
    ],
  }),
  P({
    slug: "assistente-financeiro",
    name: "Assistente Financeiro",
    area: "Gestão e finanças",
    example: "finance",
    objective:
      "Assistente financeiro com experiência em contas a pagar e receber, conciliação bancária e fluxo de caixa. Analítico, organizado e com Excel avançado.",
    activities: [
      "Lançamento e controle de contas a pagar e receber",
      "Conciliação bancária diária",
      "Atualização do fluxo de caixa e relatórios gerenciais",
      "Emissão de boletos, notas fiscais e cobrança de clientes",
    ],
    skills: ["Contas a pagar e receber", "Conciliação bancária", "Fluxo de caixa", "Excel avançado", "ERP", "Organização", "Atenção aos detalhes"],
    courses: ["Excel Avançado e Power BI", "Rotinas Financeiras", "Matemática Financeira"],
    tips: [
      "Cite o ERP usado e o volume de lançamentos por mês.",
      "Excel avançado (PROCV, tabela dinâmica) é cobrado em teste prático: só coloque se souber.",
      "Mostre melhorias: redução de inadimplência, fechamento mais rápido.",
    ],
  }),
  P({
    slug: "auxiliar-de-rh",
    name: "Auxiliar de RH / Departamento Pessoal",
    area: "Gestão e finanças",
    example: "hr",
    objective:
      "Auxiliar de recursos humanos com experiência em recrutamento, admissão e rotinas de departamento pessoal. Discreta, organizada e com boa comunicação.",
    activities: [
      "Divulgação de vagas, triagem de currículos e agendamento de entrevistas",
      "Processos de admissão e demissão, com conferência de documentos",
      "Controle de ponto, férias e benefícios",
      "Envio de informações ao eSocial e apoio na folha de pagamento",
    ],
    skills: ["Recrutamento e seleção", "Departamento pessoal", "Folha de pagamento", "eSocial", "Excel", "Discrição", "Comunicação"],
    courses: ["Departamento Pessoal Completo", "Recrutamento e Seleção", "Legislação Trabalhista"],
    tips: [
      "Diga o número de funcionários da empresa em que trabalhou.",
      "Cite os sistemas de folha e ponto que usou.",
      "Confidencialidade é essencial: deixe claro que lidava com dados sensíveis.",
    ],
  }),
  P({
    slug: "social-media",
    name: "Social Media",
    area: "Marketing e criação",
    example: "marketing",
    objective:
      "Social media com experiência em planejamento de conteúdo, criação de posts e análise de métricas para pequenas empresas. Criativa, organizada e atualizada com as tendências.",
    activities: [
      "Planejamento do calendário de conteúdo para Instagram, Facebook e TikTok",
      "Criação de posts e reels no Canva e CapCut",
      "Respostas a comentários e mensagens",
      "Relatórios mensais de alcance, engajamento e seguidores",
    ],
    skills: ["Redes sociais", "Produção de conteúdo", "Canva", "Edição de vídeo", "Copywriting", "Análise de métricas", "Meta Ads"],
    courses: ["Marketing Digital", "Meta Blueprint", "Copywriting para Redes Sociais"],
    tips: [
      "Mostre resultados com números: crescimento de seguidores, alcance, vendas.",
      "Coloque o link de um portfólio ou perfis que você gerencia.",
      "Tráfego pago (Meta Ads, Google Ads) é um grande diferencial.",
    ],
  }),
  P({
    slug: "gerente-de-loja",
    name: "Gerente de Loja",
    area: "Gestão e finanças",
    example: "store-manager",
    objective:
      "Gerente de loja com experiência em liderança de equipes, metas de vendas e gestão de estoque no varejo. Focado em resultado, desenvolvimento de pessoas e experiência do cliente.",
    activities: [
      "Liderança e desenvolvimento de equipe de vendedores e caixas",
      "Acompanhamento de metas, indicadores e campanhas",
      "Gestão de estoque, inventário e pedidos",
      "Controle de escala, abertura e fechamento da loja",
    ],
    skills: ["Liderança", "Gestão de equipe", "Vendas", "Controle de estoque", "Análise de indicadores", "Negociação", "Foco em resultados"],
    courses: ["Gestão de Varejo", "Liderança de Equipes", "Excel Intermediário"],
    tips: [
      "Mostre resultados da loja: crescimento de vendas, redução de perdas, turnover.",
      "Diga o tamanho da equipe que liderava.",
      "Promoções internas mostram que você cresce onde trabalha.",
    ],
  }),
  P({
    slug: "estagio",
    name: "Estágio",
    area: "Primeiro emprego",
    example: "intern",
    objective:
      "Estudante de Administração em busca de estágio na área administrativa ou financeira. Organizado, com Excel intermediário e vontade de aplicar na prática o que aprende na faculdade.",
    activities: [
      "Projetos acadêmicos com análise de empresas reais",
      "Participação em empresa júnior ou atlética",
      "Trabalhos de meio período em atendimento ou vendas",
      "Cursos complementares online",
    ],
    skills: ["Excel", "Pacote Office", "Comunicação", "Organização", "Vontade de aprender", "Trabalho em equipe"],
    courses: ["Excel Intermediário", "Inglês", "Power BI"],
    tips: [
      "Informe curso, instituição, semestre atual e previsão de formatura.",
      "Projetos da faculdade e empresa júnior contam como experiência.",
      "Diga o horário disponível para estagiar (manhã, tarde, 6 horas).",
    ],
  }),
];

export const professionBySlug = (slug: string) => PROFESSIONS.find((p) => p.slug === slug);
