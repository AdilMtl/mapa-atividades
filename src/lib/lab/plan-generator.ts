// =============================================================================
// LAB — GERADOR DE PLANO (ISSUE-312)
// Templates por tipo × área × fluência — regras simples, ZERO IA na 1A (doc 13
// §6). O texto é metodologia/marca: semeado pelo `radar/content.ts` (ISSUE-105,
// aprovado pelo dono) e escrito na voz da newsletter — método e julgamento,
// nunca promessa de app pronto. Composição, não combinatória: 1 template-base
// por tipo (9), personalizado por área (exemplos do content.ts) e fluência
// (cruzamento de maturidade), com etapas extras por flag (diligência) e por
// fluência alta ("um nível acima"). Puro e determinístico.
// =============================================================================

import {
  BLOCO_DILIGENCIA,
  CONTEUDO_OPORTUNIDADES,
  CRUZAMENTO_MATURIDADE,
} from '../radar/content'
import type { MaturityLevelId, SolutionTypeId } from '../radar/types'
import type { AmbienteId, LabDiagnosis, LabPlan, LabPlanEtapa, PlanoOpcoes } from './types'

/** Versão do gerador — gravada em `plan.generator_version` (mesma regra do engine). */
export const GENERATOR_VERSION = 'lab-plan-1.1.0'

// ----------------------------------------------------------------------------
// Registro canônico de materiais (slugs de `lab_assets`)
// A ISSUE-316 semeia a biblioteca A PARTIR desta lista — é o contrato que
// garante "zero slug quebrado nos planos" (critério de aceite da 316).
// ----------------------------------------------------------------------------

export const SLUG_DILIGENCIA = 'cuidado-com-dados-sensiveis'

export const SLUGS_POR_TIPO: Record<SolutionTypeId, string[]> = {
  prompt: ['prompt-de-quatro-partes'],
  template: ['template-de-campos-fixos'],
  workflow: ['fluxo-em-etapas'],
  automacao: ['regra-quando-x-faca-y'],
  dashboard: ['painel-das-tres-perguntas'],
  app_offline: ['descricao-de-uma-pagina'],
  app_tabela: ['descricao-de-uma-pagina', 'tabela-de-dez-registros'],
  orquestrado: ['recorte-do-fluxo-principal', 'descricao-de-uma-pagina'],
  agentico: ['recorte-do-fluxo-principal', 'consulta-a-base-antes-do-agente'],
}

/** Todos os slugs que a biblioteca precisa cobrir (dedupe da tabela acima + diligência). */
export const SLUGS_CANONICOS: string[] = [
  ...new Set([...Object.values(SLUGS_POR_TIPO).flat(), SLUG_DILIGENCIA]),
]

// ----------------------------------------------------------------------------
// Templates-base por tipo (resumo, etapas, artefato)
// ----------------------------------------------------------------------------

interface TemplatePlano {
  resumo: string
  etapas: LabPlanEtapa[]
  artefato: string
}

const TEMPLATES: Record<SolutionTypeId, TemplatePlano> = {
  prompt: {
    resumo:
      'Seu projeto aponta para um prompt estruturado: a tarefa é textual, tem dono claro e ' +
      'depende mais de um bom pedido do que de ferramenta nova. O plano abaixo transforma ' +
      'esse pedido em padrão que funciona de primeira.',
    etapas: [
      {
        id: 'prompt_1',
        titulo: 'Descreva a tarefa real',
        descricao:
          'Anote quem recebe a entrega, o que precisa sair e como você avalia se ficou bom. ' +
          'Sem isso, qualquer prompt é chute — o problema nunca foi o prompt, foi o que você ' +
          'não disse nele.',
      },
      {
        id: 'prompt_2',
        titulo: 'Monte o prompt de quatro partes',
        descricao:
          'Contexto (quem você é, para quem é a entrega), objetivo, formato de saída e ' +
          'critérios de revisão — num bloco de notas, não na memória.',
      },
      {
        id: 'prompt_3',
        titulo: 'Teste na entrega desta semana',
        descricao:
          'O teste só vale com trabalho de verdade em jogo: rode na tarefa real e compare ' +
          'com a sua versão manual.',
      },
      {
        id: 'prompt_4',
        titulo: 'Ajuste até sair bom de primeira',
        descricao:
          'O que você corrigiu na mão vira instrução nova no prompt. Duas execuções boas ' +
          'seguidas = padrão.',
      },
      {
        id: 'prompt_5',
        titulo: 'Salve como padrão',
        descricao:
          'Guarde a versão que funciona. É ela que amanhã vira template ou Gem/GPT ' +
          'personalizado — sem nunca mais explicar tudo do zero.',
      },
    ],
    artefato: 'Prompt de quatro partes salvo e testado na tarefa real',
  },

  template: {
    resumo:
      'Seu projeto aponta para um template reutilizável: a tarefa se repete e sempre sai ' +
      'parecida — o desperdício não está em fazer, está em refazer o molde toda vez. O plano ' +
      'abaixo congela o padrão e deixa a IA preencher o resto.',
    etapas: [
      {
        id: 'template_1',
        titulo: 'Compare as três últimas versões',
        descricao:
          'Pegue as três últimas entregas dessa tarefa e marque o que sempre se repete e o ' +
          'que muda a cada caso.',
      },
      {
        id: 'template_2',
        titulo: 'Desenhe o esqueleto',
        descricao:
          'O que se repete vira estrutura fixa; o que muda vira campo entre colchetes ' +
          '([nome], [situação], [prazo]).',
      },
      {
        id: 'template_3',
        titulo: 'Peça para a IA preencher',
        descricao:
          'Dê o modelo + o caso concreto e avalie o resultado contra a última versão que ' +
          'você fez na mão. Acerte a estrutura antes de congelar — template de processo ruim ' +
          'só produz erro mais rápido.',
      },
      {
        id: 'template_4',
        titulo: 'Use por uma semana',
        descricao:
          'Toda entrega dessa tarefa passa pelo template. O que travar vira ajuste no molde, ' +
          'não gambiarra no dia.',
      },
      {
        id: 'template_5',
        titulo: 'Congele o padrão',
        descricao:
          'Template estável é ativo: salve, dê nome e considere empacotar num Gem/GPT para o ' +
          'time usar sem nem ver o molde.',
      },
    ],
    artefato: 'Documento-modelo com campos fixos que a IA preenche',
  },

  workflow: {
    resumo:
      'Seu projeto aponta para um workflow assistido: o que você descreveu não é uma tarefa, ' +
      'é uma sequência. O plano abaixo quebra o fluxo em etapas simples e auditáveis, com ' +
      'você no controle entre uma e outra.',
    etapas: [
      {
        id: 'workflow_1',
        titulo: 'Desenhe o fluxo em 4–6 passos',
        descricao:
          'Numere as etapas: o que entra e o que sai em cada uma. Se não cabe em seis ' +
          'passos, o recorte está grande demais.',
      },
      {
        id: 'workflow_2',
        titulo: 'Rode uma execução assistida',
        descricao:
          'Faça o fluxo inteiro uma vez com a IA em cada etapa, validando entre uma e outra. ' +
          'Sem passos claros vira conversa infinita — e você não confia no resultado.',
      },
      {
        id: 'workflow_3',
        titulo: 'Padronize o prompt de cada passo',
        descricao:
          'Onde funcionou, congele o pedido. Cada etapa com prompt fixo é uma etapa que sai ' +
          'igual toda vez.',
      },
      {
        id: 'workflow_4',
        titulo: 'Meça contra o manual',
        descricao:
          'Compare tempo e qualidade com a versão de antes. O fluxo precisa ganhar nos dois ' +
          'para merecer existir.',
      },
      {
        id: 'workflow_5',
        titulo: 'Documente a sequência',
        descricao:
          'Passos numerados + prompts salvos num documento. É esse desenho que amanhã vira ' +
          'automação.',
      },
    ],
    artefato: 'Desenho do fluxo em etapas com os prompts de cada passo',
  },

  automacao: {
    resumo:
      'Seu projeto aponta para uma automação: alta frequência, regra previsível, baixo ' +
      'julgamento por execução. O plano abaixo desenha a regra uma vez e tira a tarefa da ' +
      'sua atenção — você vira supervisor, não operador.',
    etapas: [
      {
        id: 'automacao_1',
        titulo: 'Escreva a regra numa frase',
        descricao:
          '"Quando X acontecer, faça Y." Se a frase não sai, o processo ainda não está ' +
          'pronto para automatizar — volte um passo e padronize antes.',
      },
      {
        id: 'automacao_2',
        titulo: 'Escolha o gatilho e a primeira ação',
        descricao:
          'Só o primeiro passo do processo: o evento que dispara e a ação que responde. O ' +
          'resto fica para depois — automação amplifica o que existe, inclusive o erro.',
      },
      {
        id: 'automacao_3',
        titulo: 'Monte o fluxo mínimo',
        descricao:
          'n8n, Make ou Zapier no plano gratuito. Não pedem código — pedem clareza sobre a ' +
          'regra.',
      },
      {
        id: 'automacao_4',
        titulo: 'Rode em paralelo por uma semana',
        descricao:
          'Automação nova trabalha em dupla com o manual até provar que não erra. Confiança ' +
          'se constrói com amostra.',
      },
      {
        id: 'automacao_5',
        titulo: 'Expanda por etapas aprovadas',
        descricao:
          'Cada nova etapa automatizada passa pelo mesmo ritual: regra numa frase, teste em ' +
          'paralelo, aí assume.',
      },
    ],
    artefato: 'Regra "quando X, faça Y" + primeiro fluxo rodando no n8n/Make',
  },

  dashboard: {
    resumo:
      'Seu projeto aponta para um dashboard: dado estruturado de um lado, gente decidindo do ' +
      'outro — e você consolidando na mão no meio. O plano abaixo monta o painel que ' +
      'responde às perguntas da semana sem você refazer relatório.',
    etapas: [
      {
        id: 'dashboard_1',
        titulo: 'Liste as 3 perguntas da semana',
        descricao:
          'O que a liderança (ou você) pergunta toda semana sobre esse dado? O painel nasce ' +
          'para responder essas 3 — o resto é tentação a resistir.',
      },
      {
        id: 'dashboard_2',
        titulo: 'Arrume a planilha-fonte',
        descricao:
          'A planilha que você já atualiza, com colunas limpas e nomes claros. Painel bom ' +
          'nasce de fonte arrumada.',
      },
      {
        id: 'dashboard_3',
        titulo: 'Gere a primeira versão',
        descricao:
          'Peça à IA o painel das 3 perguntas (Gemini conectado à planilha, ou Looker Studio ' +
          'grátis). Feio e útil ganha de bonito e parado.',
      },
      {
        id: 'dashboard_4',
        titulo: 'Valide com quem decide',
        descricao:
          'Mostre para quem faz as perguntas: alguma decisão mudou? Painel que não muda ' +
          'comportamento é decoração.',
      },
      {
        id: 'dashboard_5',
        titulo: 'Estabeleça a rotina do dado',
        descricao:
          'Defina quando e como a fonte atualiza. O próximo nível é conectar direto no ' +
          'sistema — aí ninguém mais pergunta se o número está atualizado.',
      },
    ],
    artefato: 'Painel v1 respondendo às 3 perguntas da semana',
  },

  app_offline: {
    resumo:
      'Seu projeto aponta para um app simples, sem backend: uma interface sua, rodando no ' +
      'navegador, sem TI e sem pedir permissão a ninguém. O plano abaixo vai da descrição de ' +
      'uma página à primeira versão utilizável.',
    etapas: [
      {
        id: 'app_offline_1',
        titulo: 'Escreva a descrição de uma página',
        descricao:
          'Usuário, dor, dados de entrada, resultado esperado e a primeira tela. A clareza ' +
          'do problema importa mais que o código — que a IA escreve para você.',
      },
      {
        id: 'app_offline_2',
        titulo: 'Gere a primeira versão',
        descricao:
          'Cole a descrição no Claude (artefatos) ou no Google AI Studio. A primeira sai ' +
          'torta — a segunda já vai te surpreender.',
      },
      {
        id: 'app_offline_3',
        titulo: 'Itere em cima do que saiu',
        descricao:
          'Corrija pelo uso: o que confundiu vira ajuste na descrição, não desculpa para ' +
          'desistir.',
      },
      {
        id: 'app_offline_4',
        titulo: 'Use na tarefa real',
        descricao:
          'Rode o app na próxima ocorrência de verdade da tarefa. Ferramenta que não entra ' +
          'na rotina é demo.',
      },
      {
        id: 'app_offline_5',
        titulo: 'Mostre para uma pessoa',
        descricao:
          'Se outra pessoa usa sem você explicar, você construiu certo. O que ela pedir a ' +
          'mais é o seu roadmap.',
      },
    ],
    artefato: 'Descrição de uma página + app v1 rodando no navegador',
  },

  app_tabela: {
    resumo:
      'Seu projeto aponta para um app com base em tabela: tarefa recorrente, informação ' +
      'estruturada e potencial de outras pessoas usarem. O plano abaixo valida com planilha ' +
      'antes de qualquer interface — a tabela limita o escopo, e isso é uma vantagem.',
    etapas: [
      {
        id: 'app_tabela_1',
        titulo: 'Monte a tabela com 10 registros reais',
        descricao:
          'Google Sheets ou Airtable, dados de verdade. Nada de interface ainda — o risco é ' +
          'construir demais antes de validar o uso real.',
      },
      {
        id: 'app_tabela_2',
        titulo: 'Valide com a planilha pura por uma semana',
        descricao:
          'O que as pessoas pedirem que a planilha não dá conta — ISSO é a primeira tela do ' +
          'app.',
      },
      {
        id: 'app_tabela_3',
        titulo: 'Escreva a descrição de uma página',
        descricao:
          'Usuário, dor, o que entra, o que sai e a primeira tela — agora com a tabela real ' +
          'como base.',
      },
      {
        id: 'app_tabela_4',
        titulo: 'Gere o app em cima da tabela',
        descricao:
          'Lovable, v0 ou um Apps Script gerado por IA em cima do seu Sheets — dias, não ' +
          'meses.',
      },
      {
        id: 'app_tabela_5',
        titulo: 'Coloque na rotina do time',
        descricao:
          'O app vive se a tabela vive: defina quem registra o quê. Duas semanas de uso real ' +
          'antes de qualquer feature nova.',
      },
    ],
    artefato: 'Tabela com registros reais + primeira tela do app em cima dela',
  },

  orquestrado: {
    resumo:
      'Seu projeto tem cara de sistema de verdade: gente de fora usando, dados de outros ' +
      'sistemas, regras que não cabem numa planilha. O plano abaixo constrói por partes — ' +
      'cada pedaço provando valor antes do próximo entrar, porque sistema que nasce completo ' +
      'nasce atrasado.',
    etapas: [
      {
        id: 'orquestrado_1',
        titulo: 'Recorte o fluxo mais doloroso',
        descricao:
          'Não o sistema inteiro: UMA tela, UM perfil de usuário, UMA integração. O resto ' +
          'espera a primeira parte provar valor.',
      },
      {
        id: 'orquestrado_2',
        titulo: 'Escreva o fluxo principal em 5 frases',
        descricao:
          'Quem entra, o que faz, o que sai. Se precisa de mais que cinco frases, o recorte ' +
          'ainda está grande.',
      },
      {
        id: 'orquestrado_3',
        titulo: 'Gere o protótipo',
        descricao:
          'Ferramentas de vibe coding como Lovable ou v0 levantam a primeira versão — com ' +
          'login e banco — num fim de semana.',
      },
      {
        id: 'orquestrado_4',
        titulo: 'Mostre para 3 pessoas que usariam',
        descricao:
          'Antes da segunda tela. O feedback delas decide o que entra — não a sua ' +
          'empolgação.',
      },
      {
        id: 'orquestrado_5',
        titulo: 'Prove valor antes de expandir',
        descricao:
          'Cada parte nova só entra depois que a anterior rodou de verdade. A versão de ' +
          'teste feia que resolve UM fluxo vale mais que a arquitetura perfeita no papel.',
      },
    ],
    artefato: 'Protótipo do fluxo principal (uma tela, um perfil, uma integração)',
  },

  agentico: {
    resumo:
      'Seu projeto aponta para o topo da escada: um sistema que consulta informação, decide ' +
      'e age. Ambição não é o inimigo — o inimigo é a primeira versão gigante. O plano ' +
      'abaixo começa pelo pedaço que mais dói e só adiciona autonomia quando o básico provar ' +
      'que funciona.',
    etapas: [
      {
        id: 'agentico_1',
        titulo: 'Quebre a solução em pedaços',
        descricao:
          'Liste as etapas que o agente faria e marque a que mais dói hoje — geralmente a ' +
          'busca/consulta na base de conhecimento.',
      },
      {
        id: 'agentico_2',
        titulo: 'Monte só a consulta primeiro',
        descricao:
          'Um fluxo simples que responde a partir da sua base, com dados controlados. Sem ' +
          'ação, sem autonomia — ainda.',
      },
      {
        id: 'agentico_3',
        titulo: 'Meça a qualidade das respostas',
        descricao:
          'Amostra real: as respostas prestam? Autonomia em cima de resposta ruim é erro em ' +
          'escala.',
      },
      {
        id: 'agentico_4',
        titulo: 'Adicione decisão em camadas',
        descricao:
          'Classificação de intenção, roteamento, ação — uma camada por vez, cada uma ' +
          'auditada antes da próxima entrar.',
      },
      {
        id: 'agentico_5',
        titulo: 'Defina onde o humano aprova',
        descricao:
          'Mesmo os melhores times do mundo põem gente nos pontos críticos. Supervisão não é ' +
          'falta de ambição — é engenharia.',
      },
    ],
    artefato: 'Fluxo de consulta à base validado (antes de qualquer autonomia)',
  },
}

// ----------------------------------------------------------------------------
// Personalização por fluência
// ----------------------------------------------------------------------------

/** Fluências (reais) que destravam a etapa "um nível acima" no plano. */
const FLUENCIA_ALTA: MaturityLevelId[] = ['builder', 'referencia']

/** Estimativas (via conforto) equivalentes a fluência alta. */
const ESTIMATIVA_ALTA = ['operador_builder', 'builder_referencia']

function temFluenciaAlta(diagnostico: LabDiagnosis, fluencia?: MaturityLevelId | null): boolean {
  if (fluencia) return FLUENCIA_ALTA.includes(fluencia)
  return ESTIMATIVA_ALTA.includes(diagnostico.estimativa_maturidade)
}

/** Linha de fluência do resumo: nível real quando existe, estimativa quando não. */
function linhaFluencia(diagnostico: LabDiagnosis, fluencia?: MaturityLevelId | null): string {
  if (fluencia) return CRUZAMENTO_MATURIDADE.comNivelReal[fluencia]
  return CRUZAMENTO_MATURIDADE.comEstimativa[diagnostico.estimativa_maturidade]
}

// ----------------------------------------------------------------------------
// Personalização por arsenal (wizard v2 — spec ISSUE-313 v2.1 §7.3)
// A base universal é o caminho do workshop: IA de janela + arquivo local + CSV
// (o público SEMPRE tem alguma IA de janela — decisão do dono, pergunta 15).
// O arsenal só muda a linha de AMPLIAÇÃO — uma por plano, por prioridade.
// ----------------------------------------------------------------------------

const LINHA_ARSENAL_BASE =
  'Tudo aqui começa com o que você já tem: uma IA de janela e um arquivo no navegador — ' +
  'ninguém precisa autorizar nada pra versão de corredor sair do papel.'

/** Linha de ampliação por arsenal — prioridade: Workspace > Copilot > premium > base. */
const LINHA_ARSENAL: Array<{ id: AmbienteId; linha: string }> = [
  {
    id: 'amb_workspace',
    linha:
      'Com o Google Workspace à mão, a ampliação natural é o AppScript em cima do Sheets: ' +
      'quando a versão de corredor provar valor, ela vira ferramenta viva sem sair do ' +
      'ecossistema que a firma já usa.',
  },
  {
    id: 'amb_copilot',
    linha:
      'Com Copilot na firma, o caminho de ampliação é levar o padrão pra dentro do Office — ' +
      'a IA oficial trabalhando nos teus arquivos, sem dado saindo de casa.',
  },
  {
    id: 'amb_ia_premium',
    linha:
      'Tua IA premium segura o caminho inteiro: contexto maior, menos retrabalho — a ' +
      'ampliação aqui é sofisticar o uso, não trocar de ferramenta.',
  },
]

function linhaArsenal(ambiente: AmbienteId[]): string {
  const especifica = LINHA_ARSENAL.find((l) => ambiente.includes(l.id))
  return especifica?.linha ?? LINHA_ARSENAL_BASE
}

/** Reforço da diligência quando a pessoa usa IA por conta própria (shadow). */
const DILIGENCIA_SHADOW =
  ' E como você usa IA por conta própria: dado real da firma não sobe pra conta pessoal — ' +
  'a IA trabalha com a estrutura e com exemplo fictício; o dado de verdade fica onde está.'

// ----------------------------------------------------------------------------
// Geração do plano
// ----------------------------------------------------------------------------

/**
 * Gera o plano do projeto a partir do diagnóstico. Determinístico: mesmo
 * diagnóstico + mesmas opções → mesmo plano (o checklist nasce todo done=false;
 * quem muta `done` é a UI da 314, nunca este módulo).
 */
export function gerarPlano(diagnostico: LabDiagnosis, opcoes: PlanoOpcoes = {}): LabPlan {
  const template = TEMPLATES[diagnostico.tipo]
  const conteudo = CONTEUDO_OPORTUNIDADES[diagnostico.tipo]

  // Resumo composto: manchete quantificada (wizard v2, quando houver) + base do
  // tipo + exemplo da área (quando existe) + fluência + linha de arsenal (v2).
  const partesResumo: string[] = []
  if (opcoes.horasSemana && opcoes.horasSemana > 0) {
    partesResumo.push(
      `Em jogo: ~${opcoes.horasSemana}h da tua semana, toda semana — é isso que este ` +
        'projeto compra de volta.',
    )
  }
  partesResumo.push(template.resumo)
  const exemploArea = opcoes.area ? conteudo.exemploPorArea?.[opcoes.area] : undefined
  if (exemploArea) partesResumo.push(exemploArea)
  partesResumo.push(linhaFluencia(diagnostico, opcoes.fluencia))
  // `ambiente` ausente = chamada v1 (saída idêntica à 1.0.0); presente (mesmo
  // vazio) = wizard v2, que sempre ancora a viabilidade no arsenal.
  if (opcoes.ambiente) partesResumo.push(linhaArsenal(opcoes.ambiente))
  const resumo = partesResumo.join('\n\n')

  // Etapas: diligência entra ANTES de tudo (dado sensível muda o jogo);
  // fluência alta ganha a etapa "um nível acima" no fim.
  const etapas: LabPlanEtapa[] = [...template.etapas]
  if (diagnostico.flags.diligencia) {
    const usaShadow = opcoes.ambiente?.includes('amb_shadow') ?? false
    etapas.unshift({
      id: 'diligencia',
      titulo: 'Antes de tudo: combine o cuidado com os dados',
      descricao:
        'Essa tarefa envolve dado sensível. A regra prática: a IA trabalha na ESTRUTURA ' +
        '(modelos, padrões, rascunhos), os dados reais ficam onde já estão. E na dúvida, ' +
        'fale com quem cuida disso na sua empresa antes de subir qualquer coisa — existir ' +
        'essa conversa já te coloca na frente da maioria.' +
        (usaShadow ? DILIGENCIA_SHADOW : ''),
    })
  }
  if (temFluenciaAlta(diagnostico, opcoes.fluencia)) {
    etapas.push({
      id: 'um_nivel_acima',
      titulo: 'Um nível acima',
      descricao: conteudo.naPratica.umNivelAcima,
    })
  }

  const materiais = [...SLUGS_POR_TIPO[diagnostico.tipo]]
  if (diagnostico.flags.diligencia) materiais.push(SLUG_DILIGENCIA)

  return {
    resumo,
    etapas,
    checklist: etapas.map((etapa) => ({ id: etapa.id, label: etapa.titulo, done: false })),
    artefato_sugerido: template.artefato,
    materiais_slugs: materiais,
    generator_version: GENERATOR_VERSION,
  }
}

// Nota BLOCO_DILIGENCIA: o texto da etapa de diligência acima é a versão curta
// do bloco oficial — a página do projeto (ISSUE-314) exibe o bloco completo.
export { BLOCO_DILIGENCIA }
