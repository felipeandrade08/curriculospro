// Perguntas de entrevista por área, com dica de como responder. Conteúdo original.
export type InterviewQuestion = { q: string; tip: string; avoid?: string };
export type InterviewArea = { id: string; label: string; questions: InterviewQuestion[] };

export const GENERAL_QUESTIONS: InterviewQuestion[] = [
  {
    q: "Fale um pouco sobre você.",
    tip: "Em até um minuto: formação, a experiência mais ligada à vaga e por que ela te interessa. Termine falando da vaga, não da sua vida pessoal.",
    avoid: "Contar a história da infância ou falar de problemas pessoais.",
  },
  {
    q: "Por que você quer trabalhar nesta empresa?",
    tip: "Cite algo concreto que você pesquisou: o que a empresa faz, um produto, a reputação, a localização. Ligue isso ao que você pode oferecer.",
    avoid: "“Preciso de emprego” ou “qualquer vaga serve”.",
  },
  {
    q: "Por que devemos contratar você?",
    tip: "Junte dois ou três requisitos do anúncio com provas da sua trajetória. Exemplo: “A vaga pede organização e Excel. No meu último trabalho eu controlava 300 notas por mês em planilha.”",
  },
  {
    q: "Quais são seus pontos fortes?",
    tip: "Escolha dois que a vaga valoriza e conte um exemplo rápido de cada. Qualidade sem exemplo não convence.",
  },
  {
    q: "Qual é o seu maior ponto a melhorar?",
    tip: "Algo real, que não seja essencial para a vaga, e o que você já faz para melhorar. Exemplo: “Falar em público me deixava nervoso, então passei a me oferecer para apresentar os trabalhos.”",
    avoid: "“Sou perfeccionista” ou “não tenho defeitos”.",
  },
  {
    q: "Conte uma situação difícil no trabalho e como você resolveu.",
    tip: "Use situação, ação e resultado: o que aconteceu, o que você fez e como terminou. Prepare essa história antes.",
    avoid: "Culpar colegas ou o antigo chefe.",
  },
  {
    q: "Por que você saiu (ou quer sair) do último emprego?",
    tip: "Seja honesto e positivo: fim de contrato, busca de crescimento, mudança de cidade, horário. Fale do futuro, não das brigas.",
    avoid: "Falar mal da empresa anterior.",
  },
  {
    q: "Onde você se vê daqui a alguns anos?",
    tip: "Mostre que quer crescer na área da vaga: aprender, assumir mais responsabilidade, fazer um curso. Evite planos que não tenham a ver com a empresa.",
  },
  {
    q: "Qual é sua pretensão salarial?",
    tip: "Pesquise a média do cargo na sua cidade e responda com uma faixa. Se o anúncio informa o salário, diga que está de acordo.",
  },
  {
    q: "Você tem alguma pergunta para nós?",
    tip: "Tenha sempre uma ou duas: como é um dia normal na função, como a equipe é avaliada, quais os próximos passos do processo.",
    avoid: "Dizer “não, nenhuma” ou perguntar só sobre folgas e benefícios.",
  },
];

export const AREA_QUESTIONS: InterviewArea[] = [
  {
    id: "primeiro-emprego",
    label: "Primeiro emprego e estágio",
    questions: [
      {
        q: "Você não tem experiência. Por que deveríamos te dar uma chance?",
        tip: "Fale de responsabilidades que você já assumiu (escola, voluntariado, casa) e mostre vontade de aprender com um exemplo de algo que aprendeu sozinho.",
      },
      {
        q: "Como você concilia os estudos com o trabalho?",
        tip: "Diga seu horário de aula e como você se organiza. Mostre que já pensou na rotina.",
      },
      {
        q: "Conte um trabalho em grupo em que você se destacou.",
        tip: "Escolha um projeto da escola ou faculdade e diga qual foi o seu papel e o resultado.",
      },
    ],
  },
  {
    id: "administrativo",
    label: "Administrativo e recepção",
    questions: [
      {
        q: "Como você organiza suas tarefas quando tudo é urgente?",
        tip: "Explique um método simples: lista do dia, prioridade pelo prazo e impacto, avisar o gestor quando algo vai atrasar.",
      },
      {
        q: "Quais sistemas e ferramentas você já usou?",
        tip: "Cite nomes: Excel (o que sabe fazer), ERP, emissor de nota, sistema de ponto, agenda. Seja honesto sobre o nível.",
      },
      {
        q: "Como você lida com um cliente irritado no telefone ou no balcão?",
        tip: "Escutar sem interromper, mostrar que entendeu, dizer o que você pode fazer e em quanto tempo, e cumprir.",
      },
      {
        q: "Você já encontrou um erro em um documento ou lançamento? O que fez?",
        tip: "Mostre atenção e responsabilidade: corrigiu, avisou quem precisava e criou um jeito de evitar que se repetisse.",
      },
    ],
  },
  {
    id: "comercio",
    label: "Vendas, caixa e atendimento",
    questions: [
      {
        q: "Me venda esta caneta.",
        tip: "Não comece pelo produto. Pergunte primeiro como a pessoa usa caneta, o que é importante para ela, e só então mostre como a caneta resolve isso.",
      },
      {
        q: "Como você bate meta em um mês fraco?",
        tip: "Fale de ações concretas: ligar para clientes antigos, oferecer produto adicional, aproveitar cada cliente que entra.",
      },
      {
        q: "O que você faz se o caixa fechar com diferença?",
        tip: "Reconferir, comunicar o responsável imediatamente e seguir o procedimento da loja. Mostre transparência.",
      },
      {
        q: "Qual foi o melhor atendimento que você já deu?",
        tip: "Conte uma história curta em que você foi além do básico e o cliente voltou ou elogiou.",
      },
    ],
  },
  {
    id: "logistica",
    label: "Logística, produção e serviços",
    questions: [
      {
        q: "Como você garante que não vai errar na separação ou conferência?",
        tip: "Fale do seu método: conferir pela nota ou coletor, revisar antes de liberar, manter o local organizado.",
      },
      {
        q: "Você tem disponibilidade para turnos, escala e horas extras?",
        tip: "Seja claro sobre o que pode e o que não pode. Disponibilidade é um critério forte na área.",
      },
      {
        q: "Qual a importância dos EPIs e das normas de segurança?",
        tip: "Mostre que leva a sério: cite as NRs e cursos que tem e diga que segurança vem antes da pressa.",
      },
      {
        q: "Conte uma vez em que você ajudou a equipe a bater a produção.",
        tip: "Fale de colaboração: cobriu um posto, sugeriu uma melhoria, ensinou um colega novo.",
      },
    ],
  },
  {
    id: "saude-educacao",
    label: "Saúde, cuidado e educação",
    questions: [
      {
        q: "Como você lida com um paciente, idoso ou aluno que não quer colaborar?",
        tip: "Paciência, escuta e explicação simples. Mostre um exemplo em que você conquistou a confiança da pessoa.",
      },
      {
        q: "O que você faz se perceber um erro de medicação ou de rotina?",
        tip: "Comunicar imediatamente o responsável e registrar. Segurança e transparência em primeiro lugar.",
      },
      {
        q: "Como você lida com situações de estresse e emergência?",
        tip: "Fale do seu treinamento, de manter a calma e seguir o protocolo. Dê um exemplo real se tiver.",
      },
    ],
  },
  {
    id: "tecnologia",
    label: "Tecnologia",
    questions: [
      {
        q: "Explique um projeto técnico de que você se orgulha.",
        tip: "Problema, sua solução, tecnologias usadas e o resultado. Fale de forma que alguém não técnico entenda.",
      },
      {
        q: "Como você resolve um problema que nunca viu?",
        tip: "Mostre seu método: reproduzir, isolar a causa, pesquisar na documentação, testar e registrar a solução.",
      },
      {
        q: "Como você explica um problema técnico para um usuário leigo?",
        tip: "Sem jargão, com comparação do dia a dia e foco no que a pessoa precisa fazer.",
      },
    ],
  },
  {
    id: "gestao",
    label: "Gestão, finanças e RH",
    questions: [
      {
        q: "Como você lida com um colaborador com baixo desempenho?",
        tip: "Conversa individual, entender a causa, combinar metas claras e acompanhar. Mostre equilíbrio entre firmeza e apoio.",
      },
      {
        q: "Conte um resultado que você melhorou com números.",
        tip: "Escolha um indicador (vendas, prazo, inadimplência, turnover) e diga como estava, o que você fez e como ficou.",
      },
      {
        q: "Como você lida com informações confidenciais?",
        tip: "Discrição total, acesso só a quem precisa e cuidado com arquivos e conversas. Dê exemplo do seu dia a dia.",
      },
    ],
  },
  {
    id: "marketing",
    label: "Marketing e criação",
    questions: [
      {
        q: "Mostre um trabalho seu e explique o resultado.",
        tip: "Leve o portfólio aberto no celular. Fale do objetivo, da ideia e dos números (alcance, cliques, vendas).",
      },
      {
        q: "Como você decide o que postar?",
        tip: "Público, objetivo, calendário e análise do que funcionou antes. Mostre que você mede, não só cria.",
      },
      {
        q: "Como você recebe críticas ao seu trabalho?",
        tip: "Mostre abertura: ouvir, entender o objetivo do cliente e ajustar sem levar para o lado pessoal.",
      },
    ],
  },
];

/** Escolhe a área pelas palavras do cargo. */
export function guessArea(role: string): string {
  const r = role
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  const rules: [RegExp, string][] = [
    [/aprendiz|estagi|primeiro emprego|estudante/, "primeiro-emprego"],
    [/administ|recep|secret|escritorio|assistente adm/, "administrativo"],
    [/vend|caixa|atend|telemarketing|sac|repositor|garc|loja|comercial/, "comercio"],
    [/logist|estoqu|motor|entreg|produc|operador de maq|limpeza|portei|cozinh|almox|conferente/, "logistica"],
    [/enferm|cuidador|saude|professor|educa|pedag|auxiliar de sala/, "saude-educacao"],
    [/desenvolv|program|suporte|ti\b|dados|analista de sistemas|help desk/, "tecnologia"],
    [/gerent|financ|contab|rh|recursos humanos|departamento pessoal|supervisor|coordenador/, "gestao"],
    [/marketing|social media|design|conteudo|criac/, "marketing"],
  ];
  return rules.find(([re]) => re.test(r))?.[1] || "administrativo";
}
