// =============================================================================
// RADAR — CONTEÚDO DOS RESULTADOS (ISSUE-105)
// 5 níveis de maturidade (grátis, inteiros na tela) + 9 tipos de oportunidade
// (teaser grátis + diagnóstico completo atrás do e-mail) + cruzamento + famílias.
// Fontes: doc operacional §10.7 e §11.5–11.9 (textos-base, quase literais nos 3
// exemplos prontos) · doc 11 §3.1/§7/§8 (famílias, corte teaser×completo,
// "Na prática", paleta de ferramentas) · contexto editorial §7/§12 (voz).
// Regra de voz: conversa de corredor corporativo — sem "domine", "revolucione",
// "desbloqueie", "10x", promessa de guru. CTAs verbalizam intenção, não função.
// URLs verificadas no doc de contexto editorial §14 — não inventar links.
// =============================================================================

import type {
  FamilyId,
  MaturityContent,
  MaturityCrossContent,
  MaturityLevelId,
  OpportunityContent,
  OpportunityTeaserContent,
  Reading,
  SolutionTypeId,
} from './types'

// ----------------------------------------------------------------------------
// Leituras da newsletter (URLs reais — conferidas na fonte)
// ----------------------------------------------------------------------------

// Exportado para reuso fora do radar (ISSUE-108: /newsletter e /obrigado) — mesmas
// URLs verificadas, nunca reinventar link.
export const LEITURAS = {
  fluencia: {
    titulo: 'Fluência em IA',
    url: 'https://conversasnocorredor.substack.com/p/fluencia-em-ia',
  },
  iaQueCabe: {
    titulo: 'A diferença entre a IA que você vê por aí e a que cabe dentro da sua empresa',
    url: 'https://conversasnocorredor.substack.com/p/a-diferenca-entre-ia-que-voce-ve-e-a-ia-corporativa',
  },
  descricao: {
    titulo: 'O problema nunca foi o prompt, foi o que você não disse nele',
    url: 'https://conversasnocorredor.substack.com/p/description-ai-fluency',
  },
  promptConversa: {
    titulo: 'Prompt não é só um comando, é uma conversa',
    url: 'https://conversasnocorredor.substack.com/p/ai-fluency-prompt-nao-e-so-um-comando-6',
  },
  delegacao: {
    titulo: 'A parte mais importante de usar IA acontece antes de abrir o chat',
    url: 'https://conversasnocorredor.substack.com/p/delegation-ai-fluency',
  },
  discernimento: {
    titulo: 'A IA te entrega tudo pronto, mas é aí que entra a sua parte do trabalho',
    url: 'https://conversasnocorredor.substack.com/p/discernement-ai-fluency-4',
  },
  cicloEstrategico: {
    titulo: 'O problema não é usar IA pra tudo, é nunca parar pra decidir onde vale a pena usar',
    url: 'https://conversasnocorredor.substack.com/p/ai-fluency-ciclo-estrategico-7',
  },
  esporro: {
    titulo: 'A IA produz, mas quem leva esporro é você',
    url: 'https://conversasnocorredor.substack.com/p/diligence-ai-fluency-5',
  },
  receio: {
    titulo: 'O receio de falar que usou IA está prejudicando seus resultados',
    url: 'https://conversasnocorredor.substack.com/p/o-receio-de-falar-que-usou-ia-esta',
  },
  hic: {
    titulo: 'HI-C: O profissional de alto impacto do futuro que não tem time',
    url: 'https://conversasnocorredor.substack.com/p/hi-c-o-profissional-de-alto-impacto',
  },
  quemAprende: {
    titulo: 'Se a IA faz o trabalho por você, quem aprende?',
    url: 'https://conversasnocorredor.substack.com/p/se-a-ia-faz-o-trabalho-por-voce-quem',
  },
} satisfies Record<string, Reading>

// ----------------------------------------------------------------------------
// Bloco de Diligência (entra quando flags.diligencia = true — doc 11 §5.1)
// ----------------------------------------------------------------------------

export const BLOCO_DILIGENCIA: { titulo: string; corpo: string; leitura: Reading } = {
  titulo: 'Um aviso antes de qualquer ferramenta: seus dados são sensíveis',
  corpo:
    'Você marcou que essa tarefa envolve dados sensíveis — informação de pessoas, cliente, ' +
    'coisa que não pode vazar. Isso muda o jogo: a recomendação aqui já veio rebaixada de ' +
    'propósito, porque subir esse tipo de dado para ferramenta externa sem critério é o tipo ' +
    'de atalho que custa caro. A regra prática: a IA trabalha na ESTRUTURA (modelos, padrões, ' +
    'rascunhos), os dados reais ficam onde já estão. E na dúvida, pergunte para quem cuida ' +
    'disso na sua empresa — existir essa conversa já te coloca na frente da maioria.',
  leitura: LEITURAS.esporro,
}

// ----------------------------------------------------------------------------
// Famílias de oportunidade (camada de apresentação — doc 11 §3.1)
// ----------------------------------------------------------------------------

export interface FamilyContent {
  familia: FamilyId
  label: string
  fraseMae: string
  nivel1Label: string
  nivel2Label: string
  oQueDestravaNivel2: string
}

export const CONTEUDO_FAMILIAS: Record<FamilyId, FamilyContent> = {
  conversacao: {
    familia: 'conversacao',
    label: 'Conversação estruturada',
    fraseMae: 'resolver com linguagem bem estruturada',
    nivel1Label: 'prompt estruturado',
    nivel2Label: 'template reutilizável ou Gem/GPT personalizado',
    oQueDestravaNivel2:
      'Transformar o pedido que funciona em padrão salvo — configurado uma vez, reutilizado sempre, sem explicar do zero.',
  },
  fluxo: {
    familia: 'fluxo',
    label: 'Fluxo e automação',
    fraseMae: 'resolver com processo que se repete sem você',
    nivel1Label: 'workflow assistido',
    nivel2Label: 'automação que roda sozinha',
    oQueDestravaNivel2:
      'Tirar você do meio das etapas: o fluxo roda por gatilho e só te chama para aprovar o que importa.',
  },
  visualizacao: {
    familia: 'visualizacao',
    label: 'Visualização e decisão',
    fraseMae: 'resolver tornando o dado visível para decidir',
    nivel1Label: 'dashboard gerado da sua planilha',
    nivel2Label: 'dashboard vivo, conectado, que atualiza sozinho',
    oQueDestravaNivel2:
      'Conectar o painel direto na fonte do dado — ninguém mais pergunta "esse número está atualizado?".',
  },
  construcao: {
    familia: 'construcao',
    label: 'Construção de ferramenta',
    fraseMae: 'resolver criando uma ferramenta sua',
    nivel1Label: 'app pessoal (offline ou com tabela)',
    nivel2Label: 'sistema de verdade (orquestrado ou agêntico)',
    oQueDestravaNivel2:
      'Login, banco de dados, integrações — quando o app pessoal prova valor e outras pessoas precisam entrar.',
  },
}

// ----------------------------------------------------------------------------
// Radar de Maturidade — 5 resultados (conteúdo GRÁTIS, inteiro na tela)
// Base literal: doc operacional §10.7. Risco e fronteira escritos na voz.
// ----------------------------------------------------------------------------

/** Personalização pela P8 ("qual é sua maior dificuldade hoje?") — id da opção → passo. */
const PASSOS_POR_FRONTEIRA: Record<string, string> = {
  mat_fronteira_comecar:
    'Sua alavanca é escolher UMA tarefa da semana e passar ela pela IA até o resultado sair ' +
    'melhor que a sua versão manual. Uma. O resto vem depois.',
  mat_fronteira_consistencia:
    'O que destrava seu próximo nível é transformar uso pontual em ritual: escolha duas tarefas recorrentes e ' +
    'faça com IA toda vez, sem exceção, por duas semanas. Consistência vem antes de sofisticação.',
  mat_fronteira_tarefas_reais:
    'Pare de testar com exemplo de mentira. Pegue a entrega que você deve ESTA semana e faça ' +
    'com IA junto — o teste só vale com trabalho de verdade em jogo.',
  mat_fronteira_solucoes:
    'Você já domina o uso; o salto agora é empacotar: pegue um fluxo seu e transforme em ' +
    'template, dashboard ou app simples que outra pessoa consiga usar sem você do lado.',
  mat_fronteira_escalar:
    'Seu próximo movimento é tirar o método da sua cabeça: documente os critérios, monte o ' +
    'padrão do time e ensine. É a governança que transforma prática boa em escala.',
}

export const CONTEUDO_MATURIDADE: Record<MaturityLevelId, MaturityContent> = {
  curioso: {
    nivel: 'curioso',
    nome: 'Curioso',
    titulo: 'Você está no estágio Curioso.',
    corpo:
      'Você já percebeu que IA importa, mas ainda está explorando de forma pontual. Nada de ' +
      'errado nisso — todo mundo que hoje constrói com IA começou exatamente aí. Seu próximo ' +
      'passo não é acompanhar todas as ferramentas que aparecem no feed. É entender onde IA ' +
      'pode realmente ajudar no SEU trabalho — porque fluência não vem de assistir, vem de usar ' +
      'no problema real.',
    risco:
      'O risco de ficar aqui é virar espectador profissional: cada mês que passa, a conversa ' +
      'avança, o FOMO cresce e o repertório continua o mesmo. A distância entre quem testa e ' +
      'quem aplica só aumenta — e ela não se fecha sozinha.',
    proximoSalto:
      'Faça o Radar de Oportunidades para identificar uma aplicação simples na sua rotina. ' +
      'Uma tarefa concreta vale mais que dez tutoriais.',
    leituras: [LEITURAS.fluencia, LEITURAS.iaQueCabe],
    ctaPonte: 'Ver oportunidades no meu trabalho',
    ctaEmailSuave: 'Quero receber minha interpretação por e-mail',
    proximoPassoPorFronteira: PASSOS_POR_FRONTEIRA,
  },
  usuario: {
    nivel: 'usuario',
    nome: 'Usuário',
    titulo: 'Você está no estágio Usuário.',
    corpo:
      'Você já usa IA para ganhar tempo em textos, ideias, resumos ou análises simples. Já ' +
      'percebe o valor — e é aqui que a maioria estaciona. O próximo salto é sair dos prompts ' +
      'soltos e começar a criar fluxos reutilizáveis: menos "pedir de novo do zero", mais ' +
      'padrão que funciona de primeira.',
    risco:
      'O risco deste estágio é o teto invisível: você economiza minutos todo dia, mas continua ' +
      'refazendo o mesmo pedido de formas diferentes. Prompt solto não acumula — vira retrabalho ' +
      'com cara de produtividade.',
    proximoSalto:
      'Escolha uma tarefa recorrente e veja se ela deveria virar template, workflow, automação ' +
      'ou app simples. O Radar de Oportunidades faz exatamente esse mapa.',
    leituras: [LEITURAS.descricao, LEITURAS.promptConversa],
    ctaPonte: 'Descobrir o que essa rotina deveria virar',
    ctaEmailSuave: 'Quero receber minha trilha de evolução por e-mail',
    proximoPassoPorFronteira: PASSOS_POR_FRONTEIRA,
  },
  operador: {
    nivel: 'operador',
    nome: 'Operador',
    titulo: 'Você está no estágio Operador.',
    corpo:
      'Você já incorpora IA em tarefas recorrentes e começa a criar formas melhores de ' +
      'trabalhar. Isso já te coloca na frente de muita gente dentro da firma. O próximo salto é ' +
      'transformar esses fluxos em ativos mais estruturados: dashboards, apps simples ou ' +
      'ferramentas internas — coisas que existem fora da sua cabeça e trabalham por você.',
    risco:
      'O risco do Operador é a eficiência que não deixa rastro: os fluxos funcionam, mas vivem ' +
      'só na sua cabeça. Se você sai de férias, o método sai junto. Eficiência pessoal sem ativo ' +
      'é valor que evapora.',
    proximoSalto:
      'Mapeie uma oportunidade e entenda qual formato de solução faz mais sentido — nem toda ' +
      'rotina merece virar ferramenta, e saber a diferença é o que separa construção de hobby.',
    leituras: [LEITURAS.delegacao, LEITURAS.cicloEstrategico],
    ctaPonte: 'Mapear uma oportunidade de solução',
    ctaEmailSuave: 'Quero receber minha interpretação por e-mail',
    proximoPassoPorFronteira: PASSOS_POR_FRONTEIRA,
  },
  builder: {
    nivel: 'builder',
    nome: 'Builder',
    titulo: 'Você está no estágio Builder.',
    corpo:
      'Você já transforma problemas em soluções digitais — e provavelmente já sentiu que isso ' +
      'muda a forma como te enxergam no trabalho. Seu desafio agora é outro: aumentar a ' +
      'qualidade, reduzir complexidade, estruturar melhor o escopo e pensar em uso real por ' +
      'outras pessoas. Construir é fácil de começar; construir o que vale a pena é o jogo.',
    risco:
      'O risco do Builder é se apaixonar pela construção: empilhar features que ninguém pediu, ' +
      'complexidade que ninguém mantém — ou construir em silêncio e deixar de narrar o valor. ' +
      'Ferramenta boa que ninguém conhece é esforço invisível.',
    proximoSalto:
      'Rode o Radar de Oportunidades no seu próximo problema — com repertório de builder, o ' +
      'valor está em escolher o formato MÍNIMO que resolve. E entre na lista do Lab para ' +
      'acompanhar o que vem: Wizard de Solução, Builder Canvas e PRD Kit.',
    leituras: [LEITURAS.promptConversa, LEITURAS.receio],
    ctaPonte: 'Mapear minha próxima construção',
    ctaEmailSuave: 'Quero entrar na lista do Lab',
    proximoPassoPorFronteira: PASSOS_POR_FRONTEIRA,
  },
  referencia: {
    nivel: 'referencia',
    nome: 'Referência',
    titulo: 'Você está no estágio Referência.',
    corpo:
      'Você não apenas usa IA: você influencia a forma como outras pessoas trabalham com ela. ' +
      'Pouca gente chega aqui — e é exatamente por isso que o seu próximo desafio muda de ' +
      'natureza: transformar conhecimento em método, governança e escala. O que está na sua ' +
      'cabeça precisa virar padrão que funciona sem você na sala.',
    risco:
      'O risco da Referência é virar gargalo do próprio sucesso: tudo passa por você, nada anda ' +
      'sem você — e no meio disso, você para de aprender porque só responde. Escalar método é ' +
      'também proteger o seu tempo de evoluir.',
    proximoSalto:
      'Acompanhe a newsletter e entre na lista de interesse para conteúdos avançados sobre ' +
      'adoção, governança e construção de sistemas. E rode o Radar de Oportunidades pensando no ' +
      'seu TIME: qual é a oportunidade que você destrava para os outros?',
    leituras: [LEITURAS.hic, LEITURAS.quemAprende],
    ctaPonte: 'Mapear uma oportunidade para o meu time',
    ctaEmailSuave: 'Quero receber conteúdos avançados',
    proximoPassoPorFronteira: PASSOS_POR_FRONTEIRA,
  },
}

// ----------------------------------------------------------------------------
// Radar de Oportunidades — 9 TEASERS (grátis na tela, tom de exploração)
// Nunca veredito ("aqui está seu plano") — sempre direção ("aponta para").
// ----------------------------------------------------------------------------

const PROMESSA_PADRAO =
  'O diagnóstico completo mostra o que dá para montar com ferramenta gratuita, o primeiro ' +
  'passo concreto — e o passo a passo chega no seu e-mail.'

export const TEASERS_OPORTUNIDADES: Record<SolutionTypeId, OpportunityTeaserContent> = {
  prompt: {
    tipo: 'prompt',
    familiaLabel: CONTEUDO_FAMILIAS.conversacao.label,
    nivelNaFamiliaLabel: 'você entra pelo nível 1: prompt estruturado',
    fraseDirecao:
      'Seu trabalho aponta para resolver com linguagem bem estruturada: a tarefa que você ' +
      'descreveu é textual, tem dono claro e depende mais de um bom pedido do que de uma ' +
      'ferramenta nova.',
    promessaCompleto: PROMESSA_PADRAO,
  },
  template: {
    tipo: 'template',
    familiaLabel: CONTEUDO_FAMILIAS.conversacao.label,
    nivelNaFamiliaLabel: 'você entra pelo nível 2: template reutilizável',
    fraseDirecao:
      'Seu trabalho aponta para resolver com linguagem bem estruturada — mas com um detalhe: a ' +
      'tarefa se repete tanto que pedir de novo toda vez é desperdício. Isso tem cara de padrão ' +
      'salvo, não de pedido avulso.',
    promessaCompleto: PROMESSA_PADRAO,
  },
  workflow: {
    tipo: 'workflow',
    familiaLabel: CONTEUDO_FAMILIAS.fluxo.label,
    nivelNaFamiliaLabel: 'você entra pelo nível 1: workflow assistido',
    fraseDirecao:
      'Seu trabalho aponta para um processo que se repete em etapas: coletar, resumir, ' +
      'organizar, revisar. Não é um pedido único para a IA — é uma sequência onde ela ajuda em ' +
      'cada passo e você mantém o controle.',
    promessaCompleto: PROMESSA_PADRAO,
  },
  automacao: {
    tipo: 'automacao',
    familiaLabel: CONTEUDO_FAMILIAS.fluxo.label,
    nivelNaFamiliaLabel: 'você entra pelo nível 2: automação que roda sozinha',
    fraseDirecao:
      'Seu trabalho aponta para processo que se repete SEM você: alta frequência, regras claras, ' +
      'operação previsível. É o tipo de tarefa que não precisa da sua atenção — precisa de um ' +
      'gatilho.',
    promessaCompleto: PROMESSA_PADRAO,
  },
  dashboard: {
    tipo: 'dashboard',
    familiaLabel: CONTEUDO_FAMILIAS.visualizacao.label,
    nivelNaFamiliaLabel: 'você entra pelo nível 1: dashboard gerado da sua planilha',
    fraseDirecao:
      'Seu trabalho aponta para tornar o dado visível: informação estruturada de um lado, gente ' +
      'esperando decisão do outro — e você no meio, consolidando na mão. Isso tem cara de painel, ' +
      'não de relatório refeito toda semana.',
    promessaCompleto: PROMESSA_PADRAO,
  },
  app_offline: {
    tipo: 'app_offline',
    familiaLabel: CONTEUDO_FAMILIAS.construcao.label,
    nivelNaFamiliaLabel: 'você entra pelo nível 1: app pessoal, sem backend',
    fraseDirecao:
      'Seu trabalho aponta para criar uma ferramenta sua: uma interface simples — calculadora, ' +
      'simulador, matriz de decisão — que rode no navegador, sem sistema, sem TI, sem pedir ' +
      'permissão para ninguém.',
    promessaCompleto: PROMESSA_PADRAO,
  },
  app_tabela: {
    tipo: 'app_tabela',
    familiaLabel: CONTEUDO_FAMILIAS.construcao.label,
    nivelNaFamiliaLabel: 'você entra pelo nível 1: app pessoal conectado a uma tabela',
    fraseDirecao:
      'Seu trabalho aponta para criar uma ferramenta sua — e ela precisa de memória: registrar, ' +
      'acompanhar, consultar. Um app simples em cima de uma planilha resolve isso sem virar ' +
      'projeto de TI.',
    promessaCompleto: PROMESSA_PADRAO,
  },
  orquestrado: {
    tipo: 'orquestrado',
    familiaLabel: CONTEUDO_FAMILIAS.construcao.label,
    nivelNaFamiliaLabel: 'você entra pelo nível 2: sistema de verdade',
    fraseDirecao:
      'Seu trabalho aponta para criar uma ferramenta sua — e das grandes: gente de fora usando, ' +
      'dados de sistemas, integrações. É construção de sistema mesmo. A boa notícia: dá para ' +
      'começar bem menor do que parece.',
    promessaCompleto: PROMESSA_PADRAO,
  },
  agentico: {
    tipo: 'agentico',
    familiaLabel: CONTEUDO_FAMILIAS.construcao.label,
    nivelNaFamiliaLabel: 'você entra pelo nível 2: sistema com agentes',
    fraseDirecao:
      'Seu trabalho aponta para o topo da escada: um sistema que consulta informação, decide e ' +
      'age. É a ideia mais ambiciosa que esse teste mapeia — e justamente por isso, a que mais ' +
      'precisa de um começo esperto.',
    promessaCompleto: PROMESSA_PADRAO,
  },
}

// ----------------------------------------------------------------------------
// Radar de Oportunidades — 9 DIAGNÓSTICOS COMPLETOS (atrás do e-mail)
// 8 blocos do doc §11.6 + 9º bloco "Na prática" (doc 11 §8.1).
// §11.7 (app_tabela), §11.8 (prompt) e §11.9 (agêntico) quase literais.
// ----------------------------------------------------------------------------

const CTA_NEWSLETTER = 'Quero receber as próximas conversas'
const CTA_LAB = 'Entrar na lista do Lab'

export const CONTEUDO_OPORTUNIDADES: Record<SolutionTypeId, OpportunityContent> = {
  prompt: {
    tipo: 'prompt',
    titulo: 'Sua oportunidade parece pedir um prompt estruturado, não um app.',
    porque:
      'A tarefa que você descreveu parece textual, pontual e com baixo volume de dados. Antes ' +
      'de criar uma ferramenta, o melhor caminho é estruturar melhor a entrada, o contexto e o ' +
      'critério de qualidade da resposta. Parece simples — e é justamente por isso que quase ' +
      'ninguém faz direito.',
    complexidade: 'Baixa. Você resolve com o que já tem: um chat de IA e clareza sobre o pedido.',
    risco:
      'O risco é transformar em ferramenta algo que ainda pode ser resolvido com um bom ' +
      'processo. Construir é sedutor; resolver é melhor.',
    primeiroPasso:
      'Crie um prompt reutilizável com quatro partes: contexto (quem você é, para quem é a ' +
      'entrega), objetivo, formato de saída e critérios de revisão. Teste na tarefa real desta ' +
      'semana e ajuste até sair bom de primeira.',
    leituras: [LEITURAS.descricao, LEITURAS.promptConversa],
    ctaNewsletter: CTA_NEWSLETTER,
    ctaLab: CTA_LAB,
    naPratica: {
      gancho:
        'Sabia que dá para criar um Gem (Gemini) ou GPT personalizado que já sabe seu contexto, ' +
        'seu tom e seu formato — de graça, e sem nunca mais explicar tudo do zero?',
      comeceAssim:
        'No seu nível, comece assim: escreva o prompt das quatro partes num bloco de notas e use ' +
        'na próxima entrega real. Quando ele funcionar duas vezes seguidas, você tem um padrão.',
      umNivelAcima:
        'Um nível acima, isso vira um template reutilizável ou um Gem/GPT personalizado: o mesmo ' +
        'pedido, salvo e configurado, que o seu time inteiro pode usar sem você do lado.',
      comoFazerNoEmail:
        'O passo a passo — com o prompt de quatro partes pronto para adaptar — chega no seu e-mail.',
    },
    exemploPorArea: {
      area_estudante:
        'Para estudante: jogue os PDFs da aula no NotebookLM e saia com resumos, mapas e ' +
        'simulados — de graça. Prompt estruturado é o que transforma material solto em estudo.',
      area_empreendedor:
        'Para quem toca o próprio negócio: um prompt padrão de orçamento/proposta que já sai no ' +
        'seu tom, com suas condições — responder rápido sem parecer robô.',
      area_marketing:
        'Em marketing: um prompt de revisão que aplica o tom da marca em qualquer texto antes de ' +
        'publicar — o revisor que nunca tira férias.',
    },
  },

  template: {
    tipo: 'template',
    titulo: 'Sua oportunidade parece pedir um template reutilizável.',
    porque:
      'A tarefa se repete, tem estrutura reconhecível e sempre sai parecida — briefing, análise, ' +
      'relatório, resposta. Quando é assim, o desperdício não está em fazer, está em REFAZER o ' +
      'molde toda vez. Um modelo de entrada e saída que a IA preenche resolve a repetição sem ' +
      'precisar de ferramenta nova.',
    complexidade:
      'Baixa. É um documento bem pensado + um prompt que o preenche. O trabalho está em definir ' +
      'o padrão, não em tecnologia.',
    risco:
      'O risco é padronizar o que ainda não está bom: template de processo ruim só produz erro ' +
      'mais rápido. Acerte a estrutura na mão primeiro, depois congele no modelo.',
    primeiroPasso:
      'Pegue as três últimas versões dessa entrega, marque o que sempre se repete e o que muda. ' +
      'O que se repete vira o esqueleto do template; o que muda vira campo que a IA preenche.',
    leituras: [LEITURAS.descricao, LEITURAS.cicloEstrategico],
    ctaNewsletter: CTA_NEWSLETTER,
    ctaLab: CTA_LAB,
    naPratica: {
      gancho:
        'Sabia que dá para montar uma base de respostas-padrão que a IA preenche — sem nunca ' +
        'colar dado pessoal de ninguém — usando só ChatGPT ou Gemini grátis?',
      comeceAssim:
        'No seu nível, comece assim: monte UM modelo com campos fixos ([nome], [situação], ' +
        '[prazo]) e peça para a IA preencher a partir do caso. Use uma semana, ajuste o que travar.',
      umNivelAcima:
        'Um nível acima, isso vira um Gem/GPT personalizado com o template embutido: a pessoa do ' +
        'time descreve o caso e recebe a entrega no padrão — sem nem ver o molde.',
      comoFazerNoEmail:
        'O mini-guia com a estrutura do template e as regras do que pode e não pode chega no seu e-mail.',
    },
    exemploPorArea: {
      area_estudante:
        'Para estudante: um modelo de fichamento que a IA preenche a cada PDF novo — leitura ' +
        'vira acervo, não pilha.',
      area_empreendedor:
        'Para quem toca o próprio negócio: proposta e follow-up padronizados em que você só ' +
        'ajusta nome e preço — profissional sem esforço repetido.',
      area_rh:
        'Em RH: respostas-padrão para as dúvidas que chegam toda semana, preenchidas pela IA ' +
        'sem expor dado de ninguém.',
    },
  },

  workflow: {
    tipo: 'workflow',
    titulo: 'Sua oportunidade parece pedir um workflow assistido.',
    porque:
      'O que você descreveu não é UMA tarefa — é uma sequência: coletar, consolidar, resumir, ' +
      'revisar, entregar. Tentar resolver isso com um prompt só é pedir para a IA adivinhar ' +
      'demais. Quebrando em etapas, cada passo fica simples, auditável e melhor que o anterior.',
    complexidade:
      'Média-baixa. Nenhuma ferramenta nova obrigatória — é método: o mesmo chat de IA, usado ' +
      'em etapas definidas, com você validando entre uma e outra.',
    risco:
      'O risco é pular a definição das etapas e virar "conversa infinita com a IA": sem passos ' +
      'claros, cada execução sai diferente e você não confia no resultado.',
    primeiroPasso:
      'Desenhe o fluxo em 4–6 passos numerados (o que entra, o que sai em cada um). Rode uma ' +
      'vez manualmente com IA em cada etapa. Onde funcionar, padronize o prompt do passo.',
    leituras: [LEITURAS.delegacao, LEITURAS.cicloEstrategico],
    ctaNewsletter: CTA_NEWSLETTER,
    ctaLab: CTA_LAB,
    naPratica: {
      gancho:
        'Sabia que dá para montar um fluxo em que a IA coleta, resume e formata — e você só ' +
        'revisa no final? Com ChatGPT ou Gemini grátis, hoje.',
      comeceAssim:
        'No seu nível, comece assim: escolha a sequência que mais dói, escreva os passos num ' +
        'papel e rode a primeira execução assistida ainda esta semana.',
      umNivelAcima:
        'Um nível acima, isso vira automação que roda sozinha: as etapas que você já validou ' +
        'passam a rodar por gatilho (n8n, Make, Zapier) e só te chamam para aprovar.',
      comoFazerNoEmail:
        'O desenho do fluxo em etapas + os prompts de cada passo chegam no seu e-mail.',
    },
    exemploPorArea: {
      area_estudante:
        'Para estudante: o fluxo do TCC — coletar fontes, resumir, organizar citações, revisar ' +
        '— cada etapa com IA, você no controle.',
      area_empreendedor:
        'Para quem toca o próprio negócio: do pedido que chega no WhatsApp ao orçamento pronto ' +
        '— coleta, calcula, formata, em etapas que não dependem da sua memória.',
      area_operacoes:
        'Em operações: consolidar informação de três fontes num resumo executivo — sempre nos ' +
        'mesmos passos, sempre no mesmo padrão.',
    },
  },

  automacao: {
    tipo: 'automacao',
    titulo: 'Sua oportunidade parece pedir uma automação simples.',
    porque:
      'Alta frequência, regras previsíveis, baixo julgamento por execução: atualizar status, ' +
      'mover dado, gerar lembrete, organizar resposta. Isso é exatamente o tipo de tarefa que ' +
      'NÃO deveria consumir a sua atenção — o valor não está em você fazer, está em você ' +
      'desenhar a regra uma vez e sair do caminho.',
    complexidade:
      'Média. As ferramentas de automação atuais (n8n, Make, Zapier) têm plano gratuito e não ' +
      'pedem código — pedem clareza sobre a regra.',
    risco:
      'O risco é automatizar processo bagunçado: automação amplifica o que existe, inclusive o ' +
      'erro. Regra confusa na mão vira erro em escala na máquina.',
    primeiroPasso:
      'Escreva a regra em uma frase: "quando X acontecer, faça Y". Se você não consegue ' +
      'escrever essa frase, o processo ainda não está pronto para automatizar — volte um passo ' +
      'e padronize antes.',
    leituras: [LEITURAS.delegacao, LEITURAS.esporro],
    ctaNewsletter: CTA_NEWSLETTER,
    ctaLab: CTA_LAB,
    naPratica: {
      gancho:
        'Sabia que esse fluxo dá para montar no n8n ou no Make no plano gratuito, com alguns ' +
        'prompts prontos — sem escrever uma linha de código?',
      comeceAssim:
        'No seu nível, comece assim: automatize só o primeiro passo do processo (o gatilho e a ' +
        'primeira ação). Rode uma semana em paralelo com o manual antes de confiar.',
      umNivelAcima:
        'Um nível acima, ele roda sozinho com aprovações: a automação executa tudo e só te chama ' +
        'nos pontos de decisão — você vira supervisor, não operador.',
      comoFazerNoEmail:
        'O passo a passo do primeiro fluxo no n8n/Make chega no seu e-mail, com os prompts prontos.',
    },
    exemploPorArea: {
      area_estudante:
        'Para estudante: prazos, lembretes e organização de entregas acadêmicas rodando ' +
        'sozinhos — sua energia vai para estudar, não para lembrar.',
      area_empreendedor:
        'Para quem toca o próprio negócio: respostas automáticas com IA no WhatsApp Business e ' +
        'no e-mail — atendimento que não dorme, sem contratar ninguém.',
      area_vendas:
        'Em vendas: status do funil atualizado e follow-up agendado sozinho toda vez que um ' +
        'negócio muda de etapa.',
    },
  },

  dashboard: {
    tipo: 'dashboard',
    titulo: 'Sua oportunidade parece pedir um dashboard.',
    porque:
      'Tem dado estruturado de um lado, gente precisando decidir do outro — e você no meio, ' +
      'consolidando na mão toda semana. Quando o valor está em ACOMPANHAR e COMPARAR, relatório ' +
      'estático é desperdício: a mesma informação, visível o tempo todo, decide mais rápido que ' +
      'o documento mais caprichado.',
    complexidade:
      'Média. Mais estruturado que prompt e template, mas longe de projeto de TI: as ferramentas ' +
      'gratuitas de hoje geram o painel a partir da planilha que você já tem.',
    risco:
      'O risco é o painel-enfeite: cheio de gráfico, vazio de decisão. Dashboard bom responde ' +
      'perguntas específicas — se ninguém muda de comportamento olhando para ele, é decoração.',
    primeiroPasso:
      'Liste as 3 perguntas que a liderança (ou você) faz toda semana sobre esse dado. O painel ' +
      'nasce para responder essas 3 — o resto é tentação a resistir.',
    leituras: [LEITURAS.cicloEstrategico, LEITURAS.iaQueCabe],
    ctaNewsletter: CTA_NEWSLETTER,
    ctaLab: CTA_LAB,
    naPratica: {
      gancho:
        'Sabia que você consegue montar um dashboard no Gemini conectado às suas planilhas — ou ' +
        'no Looker Studio, de graça — sem depender de TI?',
      comeceAssim:
        'No seu nível, comece assim: pegue a planilha que você já atualiza e peça à IA a ' +
        'primeira versão do painel com as 3 perguntas da semana. Feio e útil ganha de bonito e ' +
        'parado.',
      umNivelAcima:
        'Um nível acima, isso vira um dashboard vivo: conectado direto na fonte, atualizando ' +
        'sozinho — ninguém mais pergunta "esse número está atualizado?".',
      comoFazerNoEmail:
        'O manual de como gerar e manter o painel (Gemini/Looker Studio grátis) chega no seu e-mail.',
    },
    exemploPorArea: {
      area_estudante:
        'Para estudante: painel de notas e progresso de estudo puxando da sua planilha — onde ' +
        'você está forte, onde precisa investir.',
      area_empreendedor:
        'Para quem toca o próprio negócio: o painel de vendas do mês em cima da planilha do ' +
        'caixa — decisão de dono com dado de verdade.',
      area_vendas:
        'Em vendas: funil e carteira visíveis para a liderança sem você refazer o relatório ' +
        'toda segunda-feira.',
    },
  },

  app_offline: {
    tipo: 'app_offline',
    titulo: 'Sua oportunidade parece pedir um app simples, sem backend.',
    porque:
      'Você precisa de uma interface — calculadora, simulador, matriz de decisão, checklist ' +
      'interativo — mas não precisa de servidor, login nem banco de dados. Essa é a categoria ' +
      'mais subestimada do momento: com IA, um app desses sai numa tarde e roda no navegador, ' +
      'sem pedir permissão para ninguém.',
    complexidade:
      'Média. Não exige saber programar — exige saber descrever: quem usa, o que entra, o que ' +
      'sai, como decide.',
    risco:
      'O risco é subestimar o desenho: app confuso não é usado nem por quem fez. A clareza do ' +
      'problema importa mais que o código — que a IA escreve para você.',
    primeiroPasso:
      'Descreva numa página: o usuário, a dor, os dados de entrada, o resultado esperado e a ' +
      'primeira tela. Com isso pronto, peça o app à IA e itere em cima do que ela gerar.',
    leituras: [LEITURAS.promptConversa, LEITURAS.receio],
    ctaNewsletter: CTA_NEWSLETTER,
    ctaLab: CTA_LAB,
    naPratica: {
      gancho:
        'Sabia que o Claude (nos artefatos) ou o Google AI Studio geram um app funcionando a ' +
        'partir de uma descrição bem feita — de graça, rodando direto no navegador?',
      comeceAssim:
        'No seu nível, comece assim: escreva a descrição de uma página e cole na ferramenta. A ' +
        'primeira versão vai sair torta — a segunda já vai te surpreender.',
      umNivelAcima:
        'Um nível acima, seu app ganha memória (uma planilha por trás) e vira ferramenta do ' +
        'time; mais adiante, um sistema de verdade, com login e integrações.',
      comoFazerNoEmail:
        'O roteiro da descrição de uma página + o fluxo de iteração chegam no seu e-mail.',
    },
    exemploPorArea: {
      area_estudante:
        'Para estudante: um simulado interativo da sua matéria, rodando no navegador, sem ' +
        'instalar nada.',
      area_empreendedor:
        'Para quem toca o próprio negócio: uma calculadora de precificação com as SUAS margens ' +
        '— responde na hora, sem abrir planilha.',
      area_estrategia:
        'Em estratégia: uma matriz de priorização interativa para usar em reunião — critério ' +
        'visível, discussão mais curta.',
    },
  },

  app_tabela: {
    tipo: 'app_tabela',
    titulo: 'Sua oportunidade parece pedir um app simples com base em tabela.',
    porque:
      'Pelo que você descreveu, existe uma tarefa recorrente, com informação estruturada e ' +
      'potencial de ser usada por outras pessoas. Isso provavelmente não exige um sistema ' +
      'complexo no início. Um app simples conectado a uma tabela — Google Sheets, Airtable — ' +
      'pode ser suficiente para testar a ideia, organizar dados e mostrar valor rapidamente.',
    complexidade:
      'Média. Mais simples que um sistema orquestrado, mas mais estruturado que um prompt ou ' +
      'template.',
    risco:
      'O principal risco é tentar construir demais antes de validar o uso real. A tabela é sua ' +
      'amiga justamente porque limita o escopo.',
    primeiroPasso:
      'Descreva o usuário, a dor, os dados de entrada, o resultado esperado e a primeira tela ' +
      'da solução. Monte a tabela com 10 registros reais antes de qualquer interface.',
    leituras: [LEITURAS.promptConversa, LEITURAS.cicloEstrategico],
    ctaNewsletter: CTA_NEWSLETTER,
    ctaLab: CTA_LAB,
    naPratica: {
      gancho:
        'Sabia que ferramentas de vibe coding como Lovable e v0 — ou um Apps Script gerado por ' +
        'IA em cima do seu Google Sheets — montam esse app para você descrever e testar em dias, ' +
        'não meses?',
      comeceAssim:
        'No seu nível, comece assim: valide com a planilha pura por uma semana. O que as pessoas ' +
        'pedirem que a planilha não dá conta — ISSO é a primeira tela do app.',
      umNivelAcima:
        'Um nível acima, isso vira um sistema orquestrado: login, permissões, dados de verdade — ' +
        'quando o uso provar que merece.',
      comoFazerNoEmail:
        'A trilha para estruturar essa ideia (do registro na tabela à primeira tela) chega no seu e-mail.',
    },
    exemploPorArea: {
      area_estudante:
        'Para estudante: um banco de questões que cresce a cada prova, guardado numa planilha — ' +
        'seu simulado pessoal, sempre atualizado.',
      area_empreendedor:
        'Para quem toca o próprio negócio: controle de pedidos e clientes num app simples em ' +
        'cima do Sheets — sai do caderno sem virar sistema caro.',
      area_operacoes:
        'Em operações: registro de demandas com status, responsável e prazo — visível para o ' +
        'time, sem planilha quebrada por edição simultânea.',
    },
  },

  orquestrado: {
    tipo: 'orquestrado',
    titulo: 'Sua oportunidade parece pedir um sistema orquestrado — construído em etapas.',
    porque:
      'O que você descreveu tem cara de sistema de verdade: gente de fora usando, dados vindo ' +
      'de outros sistemas, regras que não cabem numa planilha. É a categoria mais poderosa da ' +
      'escada — e a que mais pune quem começa grande. O caminho é orquestrar por partes: cada ' +
      'pedaço provando valor antes do próximo entrar.',
    complexidade:
      'Alta. Autenticação, banco de dados, integrações — é construção de produto, mesmo que ' +
      'interno. Com as ferramentas atuais dá para ir MUITO mais longe sem time do que há dois ' +
      'anos, mas o escopo precisa de respeito.',
    risco:
      'O risco é o clássico: seis meses construindo, zero validação. Sistema que nasce completo ' +
      'nasce atrasado — a versão de teste feia que resolve UM fluxo vale mais que a arquitetura ' +
      'perfeita no papel.',
    primeiroPasso:
      'Recorte o fluxo mais doloroso e monte só ele: uma tela, um perfil de usuário, uma ' +
      'integração. Prove valor com isso antes de qualquer outra parte.',
    leituras: [LEITURAS.hic, LEITURAS.iaQueCabe],
    ctaNewsletter: CTA_NEWSLETTER,
    ctaLab: CTA_LAB,
    naPratica: {
      gancho:
        'Sabia que dá para levantar o primeiro protótipo — com login e banco — num fim de ' +
        'semana, usando ferramentas de vibe coding como Lovable ou v0?',
      comeceAssim:
        'No seu nível, comece assim: escreva o fluxo principal em 5 frases e gere o protótipo ' +
        'dele. Mostre para 3 pessoas que usariam de verdade antes de escrever a segunda tela.',
      umNivelAcima:
        'Um nível acima, o sistema ganha inteligência: agentes consultando seus dados via MCP, ' +
        'decidindo próximos passos — mas isso só faz sentido depois que o fluxo básico roda.',
      comoFazerNoEmail:
        'O roteiro do protótipo em etapas (do recorte à primeira demo) chega no seu e-mail.',
    },
    exemploPorArea: {
      area_estudante:
        'Para estudante: o sistema de inscrições do centro acadêmico — login, vagas, confirmação ' +
        '— começando por UM evento.',
      area_empreendedor:
        'Para quem toca o próprio negócio: um portal do cliente com pedidos, status e histórico ' +
        '— começando pela consulta de status, que é o que mais gera mensagem no WhatsApp.',
      area_cx:
        'Em CX: a base de atendimento integrada ao sistema da empresa — começando por um único ' +
        'tipo de solicitação, o mais frequente.',
    },
  },

  agentico: {
    tipo: 'agentico',
    titulo: 'Sua ideia é das grandes — e é exatamente por isso que ela não deveria começar grande.',
    porque:
      'O que você descreveu envolve múltiplas etapas, consulta a informações, tomada de decisão ' +
      'e integração com sistemas — um sistema agêntico de verdade. Seu repertório e seu contexto ' +
      'sustentam a ambição (é raro esse resultado aparecer aqui). Mas mesmo os melhores times do ' +
      'mundo constroem agentes assim: começando pelo pedaço mais simples que já entrega valor, e ' +
      'só adicionando autonomia quando o básico prova que funciona.',
    complexidade:
      'Alta — a mais alta da escada. Agentes, memória, decisão automatizada: cada camada dessas ' +
      'multiplica o que pode dar errado em silêncio.',
    risco:
      'O risco é confundir potencial com escopo inicial: tentar construir o agente completo ' +
      'antes de validar o problema. Ambição não é o inimigo — o inimigo é a primeira versão ' +
      'gigante.',
    primeiroPasso:
      'Quebre a solução e comece pelo pedaço que dói mais — geralmente a busca/consulta na base. ' +
      'Um fluxo, um dashboard ou um protótipo com dados controlados que resolva SÓ isso. O ' +
      'agente vem depois, por cima do que já funciona.',
    leituras: [LEITURAS.hic, LEITURAS.quemAprende],
    ctaNewsletter: CTA_NEWSLETTER,
    ctaLab: CTA_LAB,
    naPratica: {
      gancho:
        'Sabia que as ferramentas que constroem isso já estão acessíveis? Claude Code, Cursor e ' +
        'Google Antigravity para construir com IA do seu lado; n8n para orquestrar fluxos ' +
        'multi-etapas; MCP para conectar a IA aos seus sistemas.',
      comeceAssim:
        'No seu nível, comece assim: monte primeiro a consulta à base de conhecimento (o pedaço ' +
        'que mais dói) num fluxo simples — e meça se as respostas prestam antes de dar autonomia ' +
        'a qualquer coisa.',
      umNivelAcima:
        'Com o básico rodando, aí sim: classificação de intenção, roteamento, ação — o agente ' +
        'completo, montado em camadas que você audita uma a uma.',
      comoFazerNoEmail:
        'O caminho do primeiro protótipo em etapas — da consulta simples ao agente — chega no seu e-mail.',
    },
    exemploPorArea: {
      area_estudante:
        'Para estudante: o assistente que consulta seu material e monta plano de estudo — ' +
        'comece pela consulta ao material, que já resolve 80%.',
      area_empreendedor:
        'Para quem toca o próprio negócio: o atendente virtual que consulta seu catálogo e ' +
        'responde clientes — comece pela pergunta mais repetida da semana.',
      area_cx:
        'Em CX: o agente que classifica intenção e aciona ferramentas — comece pela busca na ' +
        'base, medindo qualidade de resposta antes de automatizar a ação.',
    },
  },
}

// ----------------------------------------------------------------------------
// Cruzamento de maturidade (dentro do diagnóstico completo — doc 11 §8)
// ----------------------------------------------------------------------------

export const CRUZAMENTO_MATURIDADE: MaturityCrossContent = {
  comNivelReal: {
    curioso:
      'No seu Radar de Maturidade você ficou em Curioso — então ignore por enquanto o degrau ' +
      'de evolução e foque no primeiro passo: uma execução simples que funcione já te muda de ' +
      'estágio.',
    usuario:
      'No seu Radar de Maturidade você ficou em Usuário — você já tem o hábito, falta o padrão. ' +
      'Essa oportunidade é o lugar perfeito para sair do prompt solto e criar seu primeiro ativo ' +
      'reutilizável.',
    operador:
      'No seu Radar de Maturidade você ficou em Operador — então essa oportunidade não é só ' +
      'para resolver a tarefa: é a chance de transformar um fluxo seu em algo que existe fora ' +
      'da sua cabeça.',
    builder:
      'No seu Radar de Maturidade você ficou em Builder — você já constrói; aqui o jogo é ' +
      'disciplina de escopo. Comece pelo formato mínimo e resista à tentação de sofisticar antes ' +
      'de validar.',
    referencia:
      'No seu Radar de Maturidade você ficou em Referência — considere fazer dessa oportunidade ' +
      'um caso exemplar: resolva, documente o método e use para ensinar o time. Impacto em dobro.',
  },
  comEstimativa: {
    curioso_usuario:
      'Pelo seu conforto com ferramentas e pelos sinais do teste, você parece estar entre ' +
      'Curioso e Usuário na escada de maturidade — comece pela versão mais simples do primeiro ' +
      'passo, sem pressa de sofisticar.',
    usuario_operador:
      'Pelos sinais do teste, você parece estar entre Usuário e Operador na escada de ' +
      'maturidade — você já tem base para executar o primeiro passo inteiro esta semana.',
    operador:
      'Pelos sinais do teste, você parece estar por volta de Operador na escada de maturidade — ' +
      'o primeiro passo vai sair rápido; o valor está em transformá-lo em padrão.',
    operador_builder:
      'Pelos sinais do teste, você parece estar entre Operador e Builder na escada de ' +
      'maturidade — considere ir direto para a versão estruturada do primeiro passo.',
    builder_referencia:
      'Pelos sinais do teste, você parece estar entre Builder e Referência na escada de ' +
      'maturidade — o "um nível acima" descrito aqui provavelmente é o SEU ponto de partida.',
    },
}

// Dica: quer saber seu nível de verdade, não uma estimativa? O convite existe nos dois
// sentidos da escada — a UI (ISSUE-103) oferece o Radar de Maturidade a quem chegou aqui
// direto, usando o texto abaixo.
export const CONVITE_MATURIDADE =
  'Essa é uma estimativa — em 2 minutos você descobre seu nível de verdade no Radar de ' +
  'Maturidade (grátis, sem e-mail).'
