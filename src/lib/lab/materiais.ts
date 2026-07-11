// =============================================================================
// LAB — MATERIAIS DA PÁGINA DO PROJETO (ISSUE-314)
// Conteúdo determinístico do bloco "Mão na massa" + devolutiva + linha de
// evolução. Fonte editorial: docs/revamp/ISSUE-314-materiais-conteudo.md
// (Fable 5, aprovado pelo dono em 2026-07-11). Puro — sem rede, sem DOM, sem
// IA em runtime (regra da 1A). A 316 (biblioteca completa) reaproveita os
// guias daqui pelos mesmos slugs de `SLUGS_POR_TIPO`.
// =============================================================================

import { COMPLEXIDADE } from '../radar/oportunidades'
import type { ArquetipoId, PortaEntrada, WizardAnswersV2 } from './types'
import type { AmbienteId, LabDiagnosis } from './types'
import { LABEL_OPCAO } from './wizard-flow'
import { SLUG_DILIGENCIA, SLUGS_POR_TIPO } from './plan-generator'
import type { SolutionTypeId } from '../radar/types'

/** Versão deste módulo — nenhum consumidor grava isto hoje, mas mantém o
 * mesmo padrão de rastreabilidade dos outros módulos do Lab. */
export const MATERIAIS_VERSION = 'lab-materiais-1.0.0'

// ----------------------------------------------------------------------------
// 1. Guias dos materiais (10 slugs — §4 do doc de conteúdo)
// ----------------------------------------------------------------------------

export interface Guia {
  slug: string
  titulo: string
  /** Parágrafos já quebrados — a UI decide a renderização (nunca uma string com \n\n crua). */
  paragrafos: string[]
}

const GUIAS: Record<string, Guia> = {
  'prompt-de-quatro-partes': {
    slug: 'prompt-de-quatro-partes',
    titulo: 'O prompt de quatro partes',
    paragrafos: [
      'O problema nunca foi o prompt — foi o que você não disse nele. A IA não conhece tua empresa, teu chefe, teu padrão de qualidade; quando a resposta vem genérica, é porque o pedido foi genérico. As quatro partes resolvem isso: contexto (quem você é, pra quem é a entrega), objetivo (o que precisa sair), formato (como precisa sair) e critérios (como você decide se ficou bom).',
      'A quarta parte é a que separa amador de profissional — e é a que todo mundo pula. Critério de revisão é você dizendo pra IA o que você corrigiria na mão: "sem jargão", "números sempre com fonte", "máximo uma página". Cada correção que você fizer numa resposta vira critério novo no prompt. Em duas ou três rodadas, ele sai bom de primeira.',
      'Guarda o prompt num bloco de notas, não na memória. Prompt que funciona duas vezes seguidas é padrão — e padrão salvo é o primeiro ativo digital teu nessa história.',
    ],
  },
  'template-de-campos-fixos': {
    slug: 'template-de-campos-fixos',
    titulo: 'O template de campos fixos',
    paragrafos: [
      'Olha as três últimas versões dessa tua entrega, lado a lado. O que aparece nas três é estrutura; o que muda é campo. Template é só isso: congelar a estrutura e marcar os campos — [nome], [situação], [prazo] — pra IA preencher a partir do caso concreto.',
      'A ordem importa: acerta a estrutura NA MÃO primeiro, depois congela. Template de processo ruim só produz erro mais rápido — padronizar bagunça é multiplicar bagunça. Se a última versão da entrega ainda te incomoda, arruma ela antes de virar molde.',
      'Usa por uma semana, em entrega real. O que travar é ajuste no molde, não gambiarra no dia. E quando o molde estabilizar, ele deixa de ser "um documento teu" e vira ferramenta de time — dá até pra embutir num Gem ou GPT personalizado depois, e aí ninguém mais precisa nem ver o esqueleto.',
    ],
  },
  'fluxo-em-etapas': {
    slug: 'fluxo-em-etapas',
    titulo: 'O fluxo em etapas',
    paragrafos: [
      'O que você descreveu não é uma tarefa — é uma sequência disfarçada de tarefa: coletar, consolidar, resumir, revisar e entregar. Jogar isso inteiro num prompt só é pedir pra IA adivinhar demais; o resultado sai diferente a cada vez, e você para de confiar.',
      'Desenha o fluxo em 4 a 6 passos numerados, com duas perguntas por passo: o que eu preciso ter em mãos pra fazer essa parte, e o que ela deixa pronto pra próxima? Se não cabe em seis, o recorte tá grande — corta. Depois roda a sequência uma vez inteira, com a IA em cada etapa e você validando no meio. Onde funcionar, congela o prompt do passo.',
      'E tem um ganho escondido aí: quando cada passo tem o seu material, o seu resultado e o seu prompt fixo, você sabe exatamente ONDE a coisa desandou quando desandar. Esse desenho de passos numerados é, literalmente, a planta da automação que isso pode virar um dia.',
    ],
  },
  'regra-quando-x-faca-y': {
    slug: 'regra-quando-x-faca-y',
    titulo: 'A regra "quando X, faça Y"',
    paragrafos: [
      'Automação não começa em ferramenta — começa numa frase. "Quando chegar e-mail com anexo do fornecedor, salva na pasta e me avisa." Se você não consegue escrever a tua nessa forma, o processo ainda não está pronto pra automatizar: volta um passo, padroniza, tenta de novo. A frase é o teste.',
      'Com a frase escrita, escolhe só o gatilho e a PRIMEIRA ação — não o processo inteiro. n8n, Make ou Zapier no plano gratuito montam isso sem código; o que eles pedem não é técnica, é clareza. E automação nova trabalha em dupla com o manual por uma semana: você confere se ela acerta antes de entregar a chave.',
      'A regra de ouro: automação amplifica o que existe — inclusive o erro. Regra confusa na mão vira erro em escala na máquina. Por isso cada etapa nova passa pelo mesmo ritual: frase, teste em paralelo, aí assume. Você vira supervisor, não operador — e é essa a graça toda.',
    ],
  },
  'painel-das-tres-perguntas': {
    slug: 'painel-das-tres-perguntas',
    titulo: 'O painel das três perguntas',
    paragrafos: [
      'Todo painel que presta nasce de uma lista curta: as três perguntas que alguém faz TODA SEMANA sobre esse dado. "Como estamos contra a meta?" "O que travou?" "O que mudou desde ontem?" O painel existe pra responder essas três — o resto é tentação, e cada gráfico a mais é um lugar pro olhar se perder.',
      'Antes do painel, a fonte: a planilha que você já atualiza, com colunas limpas e nomes que qualquer pessoa entende. Painel bom em cima de fonte bagunçada é fachada. Com a fonte arrumada, a primeira versão sai em uma sentada — Gemini conectado na planilha, ou Looker Studio grátis — e feio-e-útil ganha de bonito-e-parado, sempre.',
      'O teste final não é estética: mostra pra quem faz as perguntas e observa se alguma DECISÃO mudou. Painel que não muda comportamento é decoração. E combina desde já quando a fonte atualiza — porque a pergunta "esse número tá atualizado?" é a primeira coisa que mata um painel.',
    ],
  },
  'descricao-de-uma-pagina': {
    slug: 'descricao-de-uma-pagina',
    titulo: 'A descrição de uma página',
    paragrafos: [
      'Antes de qualquer código — que a IA escreve por você — vem o documento que separa projeto de devaneio: uma página, cinco blocos. Quem usa (de verdade, com nome se possível), a dor (o que acontece hoje sem a ferramenta), o que a pessoa informa (os dados que ela coloca), o que ela recebe de volta (o resultado que resolve a dor) e a primeira tela (o que ela vê quando abre).',
      'Uma página é o tamanho certo por design: se não cabe, a ambição tá maior que o recorte — e recorte grande é onde projeto de gente ocupada vai morrer. Corta até caber. A versão que cabe numa página é a que sai do papel num fim de semana.',
      'Com a descrição pronta, cola no Claude, no Google AI Studio ou na ferramenta de construção que tiver à mão, e pede a primeira versão. Ela vem torta — a segunda te surpreende. E cada coisa que te confundir no uso vira ajuste na DESCRIÇÃO, não desculpa pra desistir: o documento é a fonte da verdade, o código é consequência.',
    ],
  },
  'tabela-de-dez-registros': {
    slug: 'tabela-de-dez-registros',
    titulo: 'A tabela de dez registros',
    paragrafos: [
      'A tentação é começar pela interface. Resiste: começa pela tabela — Google Sheets ou Airtable — com DEZ registros reais, de verdade, do teu trabalho. Dado inventado valida ferramenta inventada; dez linhas reais te contam na hora quais colunas faltam, quais sobram e qual nome de campo ninguém entende.',
      'Roda uma semana só com a planilha, sem app nenhum. O que as pessoas pedirem que a planilha não dá conta — ISSO é a primeira tela do teu app, definida por demanda real e não por achismo. É o jeito mais barato que existe de descobrir o que construir.',
      'E quando o app nascer em cima dela, lembra: o app vive se a tabela vive. Combina quem registra o quê, e segura duas semanas de uso real antes de qualquer feature nova. Ferramenta com dado morto é cemitério com login.',
    ],
  },
  'recorte-do-fluxo-principal': {
    slug: 'recorte-do-fluxo-principal',
    titulo: 'O recorte do fluxo principal',
    paragrafos: [
      'Sistema de verdade se constrói por recorte, não por escopo completo — porque sistema que nasce completo nasce atrasado. O exercício: descreve o fluxo principal em CINCO frases — quem usa, o que a pessoa faz e o que ela leva pronto no final. Precisou da sexta frase? O recorte ainda tá grande. Corta de novo.',
      'O recorte certo tem uma tela, um perfil de usuário, uma integração. Só. A segunda tela, o segundo perfil e a segunda integração esperam a primeira rodada provar valor — e quem decide o que entra depois não é tua empolgação, são as três pessoas que usaram a primeira versão.',
      'Essa disciplina de recorte é o que diferencia quem CONSTRÓI de quem desenha arquitetura no papel pra sempre. A versão de teste feia que resolve UM fluxo real vale mais que o diagrama perfeito do sistema inteiro — porque ela existe.',
    ],
  },
  'consulta-a-base-antes-do-agente': {
    slug: 'consulta-a-base-antes-do-agente',
    titulo: 'A consulta à base — antes do agente',
    paragrafos: [
      'Todo projeto agêntico esconde uma pergunta anterior: as respostas que saem da tua base de conhecimento PRESTAM? Porque autonomia em cima de resposta ruim não é inteligência — é erro em escala, com a tua assinatura. Por isso a ordem é inegociável: primeiro consulta, depois decisão, por último ação.',
      'Monta só o primeiro elo: um fluxo que responde perguntas a partir da tua base, com dados controlados, sem agir sobre nada. Roda uma amostra real e mede — as respostas estão certas? Completas? Na voz certa? Enquanto a resposta for "mais ou menos", o agente espera.',
      'Quando a consulta provar qualidade, as camadas entram uma por vez: classificar intenção, rotear, agir — cada uma auditada antes da próxima. E define desde o desenho onde o humano aprova: mesmo os melhores times do mundo põem gente nos pontos críticos. Supervisão não é falta de ambição — é engenharia.',
    ],
  },
  [SLUG_DILIGENCIA]: {
    slug: SLUG_DILIGENCIA,
    titulo: 'Cuidado com dados sensíveis',
    paragrafos: [
      'Dado sensível não proíbe o projeto — muda a ordem dele. A regra prática que resolve 90% dos casos: a IA trabalha na estrutura (modelos, padrões, esqueletos, rascunhos com exemplo fictício), os dados reais ficam onde já estão. Você constrói o molde com a IA e preenche com dado de verdade do lado de cá.',
      'O teste rápido antes de colar qualquer coisa numa IA: "se esse conteúdo vazasse com meu nome junto, seria um problema?" Nome de cliente, salário, dado de saúde, informação estratégica — tudo isso responde sim. Anonimiza, troca por placeholder, ou simplesmente não sobe.',
      'E a jogada que quase ninguém faz: pergunta pra quem cuida disso na tua empresa. Existir essa conversa já te coloca na frente da maioria — e transforma teu projeto de "risco em potencial" em "caso exemplar de uso responsável". No fim das contas, essa conversa te diferencia — não te atrasa.',
    ],
  },
}

/** Guia do slug âncora do tipo (primeiro de `SLUGS_POR_TIPO`). Lança se o registro sumir — falha alto, é contrato interno. */
export function guiaAncora(tipo: SolutionTypeId): Guia {
  const slug = SLUGS_POR_TIPO[tipo][0]
  const guia = GUIAS[slug]
  if (!guia) throw new Error(`guia ausente para o slug âncora "${slug}" (tipo ${tipo})`)
  return guia
}

export function guiaPorSlug(slug: string): Guia | undefined {
  return GUIAS[slug]
}

// ----------------------------------------------------------------------------
// 2. Personalização — {{ferramenta}}, {{area}}, {{entrega}} (§7 do doc)
// ----------------------------------------------------------------------------

const FERRAMENTA_POR_AMBIENTE: { id: AmbienteId; ferramenta: string }[] = [
  { id: 'amb_workspace', ferramenta: 'o Gemini do Google Workspace da empresa' },
  { id: 'amb_copilot', ferramenta: 'o Microsoft Copilot da empresa' },
  { id: 'amb_ia_premium', ferramenta: 'a minha IA paga (ChatGPT, Claude ou Gemini)' },
]
const FERRAMENTA_BASE = 'uma IA gratuita (ChatGPT, Gemini ou Claude)'

/** Prioridade: Workspace > Copilot > premium > base (mesma ordem do plan-generator). */
export function resolverFerramenta(ambiente: AmbienteId[] | undefined | null): string {
  const lista = ambiente ?? []
  const achada = FERRAMENTA_POR_AMBIENTE.find((f) => lista.includes(f.id))
  return achada?.ferramenta ?? FERRAMENTA_BASE
}

/** Forma curta da área pra caber na cláusula "Trabalho com X e…" dos prompts. */
const AREA_CURTA: Record<string, string> = {
  area_vendas: 'vendas',
  area_operacoes: 'operações',
  area_cx: 'atendimento ao cliente',
  area_marketing: 'marketing',
  area_produto: 'produto',
  area_estrategia: 'estratégia',
  area_rh: 'RH',
  area_financas: 'finanças',
  area_juridico: 'jurídico',
  area_estudante: 'estudos',
  area_empreendedor: 'meu próprio negócio',
  area_outra: 'uma área bem específica',
}

/** Cláusula de abertura dos prompts — resolve o fallback "No meu trabalho" (§7). */
function clausulaArea(area: string | null | undefined): string {
  const curta = area ? AREA_CURTA[area] : undefined
  return curta ? `Trabalho com ${curta}` : 'No meu trabalho'
}

/** Label de entrega em minúsculas — mesmo padrão já usado em `wizard-flow.ts` (montarEspelho). */
function labelEntrega(entrega: string | null | undefined): string {
  const label = entrega ? LABEL_OPCAO[entrega] : undefined
  return label ? label.toLowerCase() : 'uma entrega recorrente do meu trabalho'
}

// ----------------------------------------------------------------------------
// 3. Primeiros prompts (9 — §5 do doc). Templates com {{clausula}}/{{entrega}}/
//    {{ferramenta}} — resolvidos por `montarPrimeiroPrompt`, nunca vazam pro usuário.
// ----------------------------------------------------------------------------

const TEMPLATE_PROMPT: Record<SolutionTypeId, (p: { clausula: string; entrega: string; ferramenta: string }) => string> = {
  prompt: ({ clausula, entrega }) => `Você vai me ajudar a construir um prompt reutilizável de quatro partes para uma tarefa real do meu trabalho. ${clausula} e a tarefa é produzir ${entrega}.

Antes de escrever qualquer coisa, me entreviste: faça até 5 perguntas, uma de cada vez, para entender (1) quem recebe essa entrega, (2) o que ela precisa conter, (3) o formato em que ela precisa sair e (4) como eu avalio se ficou boa — o que eu corrigiria na mão se viesse errado.

Depois das respostas, monte o prompt final com quatro partes rotuladas: CONTEXTO, OBJETIVO, FORMATO e CRITÉRIOS DE REVISÃO. O prompt deve ser autossuficiente: qualquer IA que o receber deve produzir a entrega sem me fazer perguntas de novo.

Regra: não invente informações sobre meu trabalho — o que você não souber, pergunte.`,

  template: ({ clausula, entrega }) => `Você vai me ajudar a transformar uma entrega repetitiva em um template de campos fixos. ${clausula} e a entrega que se repete é ${entrega}.

Vou te colar 2 ou 3 versões recentes dessa entrega (com dados sensíveis trocados por exemplos fictícios). Sua tarefa, nesta ordem:
1. Compare as versões e liste: o que se repete em todas (estrutura) e o que muda (campos).
2. Me mostre a lista e pergunte se concordo antes de continuar.
3. Monte o template: a estrutura fixa com os campos variáveis entre colchetes, tipo [nome], [situação], [prazo].
4. Escreva o prompt de preenchimento: a instrução que eu vou usar no dia a dia para você preencher o template a partir de um caso novo.

Critério de qualidade: se eu usar o template numa entrega real esta semana e precisar reescrever mais de 20% do resultado, o molde falhou — nesse caso, quero ajustar o template, não o texto.`,

  workflow: ({ clausula, entrega }) => `Você vai me ajudar a desenhar um fluxo de trabalho em etapas para uma sequência que hoje eu faço na mão. ${clausula} e o resultado final é ${entrega}.

Primeiro, me entreviste: faça até 4 perguntas, uma de cada vez, para mapear a sequência completa — de onde a informação vem, o que eu faço com ela em cada passo e onde ela termina.

Depois, desenhe o fluxo em 4 a 6 etapas numeradas. Para cada etapa: um nome curto, o que eu preciso ter em mãos, o que ela deixa pronto pra seguinte, e um prompt para eu usar com IA naquele passo. Se a sequência não couber em 6 etapas, me proponha um recorte menor em vez de espremer.

No final, me diga qual etapa você recomenda que eu rode primeiro como teste — a que tem mais ganho com menos risco — e por quê.`,

  automacao: ({ clausula, entrega }) => `Você vai me ajudar a preparar uma automação simples, começando pela regra — não pela ferramenta. ${clausula} e a tarefa repetitiva envolve ${entrega}.

Primeiro, me ajude a escrever a regra na forma "QUANDO X acontecer, FAÇA Y": me faça até 4 perguntas, uma de cada vez, sobre o que dispara a tarefa hoje, o que eu faço em resposta e com que frequência. Se a regra não fechar numa frase clara, me diga o que ainda está confuso no processo — isso significa que ele precisa ser padronizado antes de automatizar.

Com a regra fechada, monte o passo a passo do PRIMEIRO fluxo (só o gatilho e a primeira ação) numa ferramenta de automação sem código com plano gratuito, como n8n ou Make: quais blocos usar, em que ordem, e o que configurar em cada um.

Feche com o protocolo de teste: como eu rodo essa automação em paralelo com o processo manual por uma semana antes de confiar nela.`,

  dashboard: ({ clausula, entrega, ferramenta }) => `Você vai me ajudar a montar a primeira versão de um painel (dashboard) para dados que hoje eu consolido na mão. ${clausula} e o painel serve para ${entrega}.

Primeiro, as três perguntas: me entreviste (até 4 perguntas, uma de cada vez) até a gente definir as TRÊS perguntas que alguém faz toda semana sobre esse dado — o painel existe para responder essas três, e mais nada na v1.

Depois, o diagnóstico da fonte: vou te descrever as colunas da minha planilha atual. Me diga o que renomear, separar ou limpar para ela virar uma fonte confiável.

Por último, o desenho do painel: para cada uma das três perguntas, qual visualização responde melhor (número, gráfico, tabela) e por quê. Formato final: uma tela, três blocos. Vou montar em ${ferramenta} ou no Looker Studio — me dê o passo a passo do que criar.`,

  app_offline: ({ clausula, entrega }) => `Você vai me ajudar a escrever a "descrição de uma página" de um app simples, que roda no navegador, sem servidor e sem depender de TI. ${clausula} e o app resolve uma tarefa ligada a ${entrega}.

Me entreviste primeiro: até 5 perguntas, uma de cada vez, cobrindo (1) quem vai usar, (2) o que acontece hoje sem a ferramenta, (3) o que a pessoa informa ao app, (4) o que o app devolve e (5) o que aparece na primeira tela.

Depois, escreva a descrição em UMA página, com esses cinco blocos rotulados. Se a minha ambição não couber numa página, proponha o recorte menor — a versão que cabe é a que sai do papel.

Quando eu aprovar a descrição, gere a primeira versão do app: um único arquivo HTML com CSS e JavaScript embutidos, que eu salvo no computador e abro no navegador. Interface em português, simples e com botões grandes. A primeira versão pode ser feia; ela só precisa funcionar na tarefa real.`,

  app_tabela: ({ clausula, entrega }) => `Você vai me ajudar a começar um app que nasce de uma tabela — validando com planilha ANTES de qualquer interface. ${clausula} e a informação é sobre ${entrega}.

Primeira missão, a tabela: me entreviste (até 4 perguntas, uma de cada vez) para definir as colunas — o que precisa ser registrado, por quem e com que frequência. Depois me proponha a estrutura: nome de cada coluna, tipo de dado e um exemplo de linha preenchida. Vou montar no Google Sheets com DEZ registros reais.

Segunda missão, o teste: me dê um roteiro de uma semana usando SÓ a planilha — o que observar, o que perguntar a quem usa, e como reconhecer o sinal de que a planilha não dá conta (é esse sinal que define a primeira tela do app).

Não gere nenhuma interface ainda. O app vem depois que a tabela provar que o dado vive.`,

  orquestrado: ({ clausula, entrega }) => `Você vai me ajudar a recortar um sistema grande até ele caber numa primeira versão construível. ${clausula} e o sistema envolve ${entrega}.

Primeiro, o fluxo principal em 5 frases: me entreviste (até 5 perguntas, uma de cada vez) sobre quem usa, o que a pessoa faz e o que ela leva pronto no final. Depois, escreva o fluxo principal em NO MÁXIMO cinco frases. Se precisar de mais, me proponha um recorte menor — repete até caber.

Com o fluxo fechado, defina a v1 com exatamente: UMA tela, UM perfil de usuário, UMA integração (ou entrada manual de dados, se a integração puder esperar). Liste explicitamente o que fica de FORA da v1 — essa lista é tão importante quanto o que fica dentro.

Feche com a descrição de uma página dessa v1 (quem usa, dor, o que a pessoa informa, o que ela recebe de volta, primeira tela), pronta pra eu colar numa ferramenta de construção como Lovable ou v0 — ou te pedir a primeira versão aqui mesmo.`,

  agentico: ({ clausula, entrega }) => `Você vai me ajudar a começar um projeto de agente de IA pelo único lugar seguro: a qualidade das respostas — antes de qualquer autonomia. ${clausula} e o agente atuaria sobre ${entrega}.

Primeiro, o inventário: me entreviste (até 4 perguntas, uma de cada vez) sobre onde vive hoje o conhecimento que o agente usaria (documentos, planilhas, histórico, cabeça de alguém) e que tipo de pergunta ele precisaria responder.

Depois, o teste de consulta: me ajude a montar uma rodada de 10 perguntas reais contra esse conhecimento — perguntas que usuários fariam de verdade. Para cada uma, vou avaliar a resposta em três critérios: está certa? está completa? está na voz certa?

Com o resultado, me diga com franqueza: a base está pronta para sustentar um agente, ou precisa ser organizada primeiro? Se precisar, o plano de arrumação vem antes de qualquer camada de decisão ou ação. Autonomia em cima de resposta ruim é erro em escala.`,
}

export interface DadosPersonalizacao {
  area?: string | null
  entrega?: string | null
  ambiente?: AmbienteId[] | null
}

/** Monta o primeiro prompt do tipo, totalmente resolvido — nunca contém `{{`. */
export function montarPrimeiroPrompt(tipo: SolutionTypeId, dados: DadosPersonalizacao): string {
  return TEMPLATE_PROMPT[tipo]({
    clausula: clausulaArea(dados.area),
    entrega: labelEntrega(dados.entrega),
    ferramenta: resolverFerramenta(dados.ambiente),
  })
}

// ----------------------------------------------------------------------------
// 4. Linhas de evolução (Bloco 5 — §6 do doc)
// ----------------------------------------------------------------------------

const LINHA_EVOLUCAO: Partial<Record<SolutionTypeId, string>> = {
  template:
    'Com esse padrão rodando, teu caso tem cara de template: o mesmo pedido, congelado num molde que o time usa sem você do lado. É o próximo degrau natural.',
  workflow:
    'Resolvida essa parte, o teu caso aponta pra um fluxo em etapas — a mesma clareza, aplicada na sequência inteira. É o próximo degrau natural.',
  automacao:
    'Com isso estável, teu caso tem cara de automação: a regra que você já domina, rodando sozinha por gatilho. É o próximo degrau natural.',
  dashboard:
    'Dando certo aqui, teu caso aponta pra um painel: o dado que você já organiza, respondendo perguntas sem você no meio. É o próximo degrau natural.',
  app_offline:
    'Com essa base provada, teu caso tem cara de app simples: uma interface tua, no navegador, sem pedir permissão a ninguém. É o próximo degrau natural.',
  app_tabela:
    'Provado o valor, teu caso aponta pra um app com base em tabela — a planilha que você validou virando ferramenta com tela. É o próximo degrau natural.',
  orquestrado:
    'Esse projeto rodando bem, teu caso tem cara de sistema de verdade — mais gente usando, dado integrado. Um recorte de cada vez, mas o caminho existe.',
  agentico:
    'Lá na frente, isso tem cara de agente: um sistema que consulta, decide e age. Longe? Menos do que parece — cada etapa deste plano já é um tijolo desse caminho.',
}

/**
 * Linha de evolução pro fechamento — só quando o vencedor bruto difere do
 * tipo atual E está estritamente acima na escada de complexidade (spec §3,
 * Bloco 5). `null` quando não há degrau a apontar (inclui vencedor_bruto
 * igual ou abaixo do tipo atual, e o caso `prompt`, que nunca tem linha).
 */
export function linhaEvolucao(diagnostico: Pick<LabDiagnosis, 'tipo' | 'vencedor_bruto'>): string | null {
  const { tipo, vencedor_bruto } = diagnostico
  if (vencedor_bruto === tipo) return null
  if (COMPLEXIDADE[vencedor_bruto] <= COMPLEXIDADE[tipo]) return null
  return LINHA_EVOLUCAO[vencedor_bruto] ?? null
}

// ----------------------------------------------------------------------------
// 5. Devolutiva (Bloco 1 — §3 do doc)
// ----------------------------------------------------------------------------

const CHEGADA_POR_ARQUETIPO: Record<ArquetipoId, string> = {
  arq_painel: 'Você chegou aqui com uma ideia clara: um painel pra parar de montar o mesmo relatório na mão.',
  arq_organizador:
    'Você chegou com uma ideia debaixo do braço: um organizador pra tirar o controle da tua cabeça (e das quinze abas).',
  arq_input:
    'Você chegou com uma ideia específica: uma tela de entrada pra informação parar de chegar de qualquer jeito.',
  arq_consolidador:
    'Você chegou sabendo o que quer: um consolidador pra juntar o que hoje vive espalhado em três lugares.',
  arq_assistente:
    'Você chegou com uma ideia ambiciosa — um assistente que responde pelas coisas que hoje só você sabe responder.',
  arq_automatizador:
    'Você chegou com a ideia certa pra quem tá cansado de tarefa repetida: fazer isso rodar sozinho.',
  arq_outro: 'Você chegou com uma ideia própria — e ideia própria é o melhor jeito de chegar.',
}

const CHEGADA_FALLBACK = CHEGADA_POR_ARQUETIPO.arq_outro

const CHEGADA_POR_PORTA: Record<Exclude<PortaEntrada, 'ideia'>, string> = {
  dor: 'Você não chegou com uma ferramenta na cabeça — chegou com uma dor de verdade, dessas que comem a semana. É o melhor ponto de partida que existe.',
  difusa:
    'Você chegou meio sem saber por onde começar — e isso é mais comum do que parece. A boa notícia: a conversa que a gente teve já resolveu essa parte.',
}

const LABEL_PUBLICO: Record<string, string> = {
  pub_so_eu: 'você mesmo — o que só aumenta a tentação de deixar pra depois',
  pub_time: 'o teu time',
  pub_outra_area: 'outra área, gente que não é do teu time direto',
  pub_lideranca: 'tua liderança',
  pub_externo: 'cliente, gente de fora',
}

function fraseChegada(porta: PortaEntrada | undefined, arquetipo: ArquetipoId | undefined | null): string {
  if (!porta) return CHEGADA_FALLBACK
  if (porta === 'ideia') return (arquetipo && CHEGADA_POR_ARQUETIPO[arquetipo]) || CHEGADA_FALLBACK
  return CHEGADA_POR_PORTA[porta]
}

function fraseHoras(horasSemana: number | undefined | null): string | null {
  if (!horasSemana || horasSemana <= 0) return null
  const base = `Me contou que isso come ~${horasSemana}h da tua semana — toda semana.`
  return horasSemana >= 8 ? `${base} Isso é mais de um dia inteiro de trabalho.` : base
}

function frasePublico(publico: string | undefined | null): string | null {
  const frase = publico ? LABEL_PUBLICO[publico] : undefined
  return frase ? `E o resultado disso vai direto pra ${frase}.` : null
}

const MAX_RELATO_DEVOLUTIVA = 140

function truncarRelato(relato: string): string {
  if (relato.length <= MAX_RELATO_DEVOLUTIVA) return relato
  const corte = relato.slice(0, MAX_RELATO_DEVOLUTIVA)
  const ultimoEspaco = corte.lastIndexOf(' ')
  return `${(ultimoEspaco > 0 ? corte.slice(0, ultimoEspaco) : corte).trim()}…`
}

export interface FonteDevolutiva {
  porta?: PortaEntrada
  arquetipo?: ArquetipoId | null
  horasSemana?: number | null
  publico?: string | null
  relato?: string | null
}

export interface Devolutiva {
  /** Frases do corpo do bloco 1, na ordem: chegada → horas → público. */
  frases: string[]
  /** 0 a 1 linha manuscrita (a citação do relato OU a frase das horas — nunca as duas). */
  manuscrito: string | null
}

/**
 * Monta a devolutiva do Bloco 1. Cada fragmento só entra se o dado existe —
 * com só a chegada (nenhum outro campo), o bloco ainda funciona (spec §3,
 * degradação graciosa pra projetos v1/dados ausentes).
 */
export function montarDevolutiva(fonte: FonteDevolutiva): Devolutiva {
  const frases = [fraseChegada(fonte.porta, fonte.arquetipo)]

  const horas = fraseHoras(fonte.horasSemana)
  if (horas) frases.push(horas)

  const publico = frasePublico(fonte.publico)
  if (publico) frases.push(publico)

  const relato = fonte.relato?.trim()
  const manuscrito = relato
    ? `Nas tuas palavras: "${truncarRelato(relato)}". Eu anotei.`
    : (horas ?? null)

  return { frases, manuscrito }
}

/** Adapta `wizard_answers` (v1 ou v2, formato bruto do JSONB) pra `FonteDevolutiva`. v1 não tem porta/arquétipo/horas/relato — vira fallback de chegada, com público quando presente. */
export function paraFonteDevolutiva(wizardAnswers: unknown): FonteDevolutiva {
  const w = (wizardAnswers ?? {}) as Partial<WizardAnswersV2> & { publico?: string }
  if (w.schema_version === 2) {
    return {
      porta: w.porta,
      arquetipo: w.arquetipo,
      horasSemana: w.horas_semana,
      publico: w.publico,
      relato: w.relato,
    }
  }
  // v1 (ou ausente): mesmos campos de classificação, sem porta/arquétipo/relato/horas.
  return { publico: w.publico }
}
