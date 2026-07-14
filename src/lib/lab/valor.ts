// =============================================================================
// LAB — MOTOR DOS RAMOS DE VALOR & CARREIRA (ISSUE-316, Fatia B)
// Puro — sem rede, sem DOM, sem Supabase (mesma regra de trilha.ts/hub.ts).
//
// A tese-espinha (do dono): você fez a entrega, agora precisa COLETAR os
// benefícios dela. Construir é metade do trabalho; a outra metade é o retorno
// chegar até você.
//
// O ramo brota de cada nó DESBLOQUEADO (projeto terminado) — é o que sustenta a
// anti-manipulação: o prêmio só vem de entregar de verdade, nunca do wizard
// (Lei de Goodhart evitada estruturalmente, §6.3 do preparatório).
//
// Conteúdo = kit transversal (5 blocos) CONTEXTUALIZADO com os dados reais
// daquele projeto (horas_semana / publico / entrega / titulo) + 1 toque
// específico do tipo. O marco de trajetória abre com 3 projetos terminados.
//
// Fonte editorial (copy aprovada pelo dono em 2026-07-14):
//   docs/revamp/ISSUE-316-copy-para-aprovacao.md §5 e §6
// Fontes citadas (verificadas, nunca inventadas — spec §5 + memória
// `feedback-verificar-plataformas-terceiros`):
//   - Leslie K. John (HBS), "Savvy Self-Promotion", HBR mai–jun/2021
//   - Julia Evans, "brag document" (2019)
//   - Harvey Coleman, "Empowering Yourself" (1996) — P.I.E. (os % são CHUTE do
//     autor, e o texto diz isso na cara; nunca vender como estudo)
//   - Sylvia Ann Hewlett, "Forget a Mentor, Find a Sponsor" (HBR Press, 2013)
//   - Cal Newport, "So Good They Can't Ignore You" (2012) — capital de carreira
// Máximo 3 fontes por texto (regra do CONTEXTO_EDITORIAL): 2 no ramo, 3 no marco.
// =============================================================================

// ⚠️ Não importa de `trilha.ts`: é a trilha que depende deste módulo (o nó
// desbloqueado carrega o slug do ramo). Validar o tipo pelo radar evita ciclo.
import { COMPLEXIDADE } from '../radar/oportunidades'
import type { SolutionTypeId } from '../radar/types'
import type { WizardAnswersV2 } from './types'
import { LABEL_OPCAO } from './wizard-flow'

/** Versão do motor — mesma convenção de rastreabilidade dos outros módulos. */
export const VALOR_VERSION = 'lab-valor-1.0.0'

/** Projetos terminados que abrem o marco de trajetória. Três: onde deixa de ser
 *  "aquela vez que eu sentei num sábado" e vira jeito de trabalhar. */
export const MARCO_MIN_PROJETOS = 3

/** Prefixo dos slugs de ramo — a rota [slug] resolve `valor-*` antes dos guias. */
export const PREFIXO_SLUG_VALOR = 'valor-'

export function slugRamo(tipo: SolutionTypeId): string {
  return `${PREFIXO_SLUG_VALOR}${tipo}`
}

/** `valor-automacao` → `automacao` (ou null se não for slug de ramo). */
export function tipoDoSlugRamo(slug: string): SolutionTypeId | null {
  if (!slug.startsWith(PREFIXO_SLUG_VALOR)) return null
  const tipo = slug.slice(PREFIXO_SLUG_VALOR.length) as SolutionTypeId
  return tipo in COMPLEXIDADE ? tipo : null
}

// ----------------------------------------------------------------------------
// Contratos
// ----------------------------------------------------------------------------

export interface BlocoValor {
  titulo: string
  paragrafos: string[]
  /** Bloco de texto que a pessoa leva pra rotina (a UI dá um botão de copiar). */
  paraCopiar?: string
  /** Comentário curto embaixo da caixa de copiar. */
  notaCopiar?: string
}

export interface RamoValor {
  slug: string
  titulo: string
  abertura: string[]
  blocos: BlocoValor[]
  /** O fecho com prazo — "escolhe uma, faz até sexta, volta aqui pra me contar". */
  combinado: string[]
}

/** Dados reais do projeto que preenchem o ramo (o oposto de um chat genérico). */
export interface DadosValor {
  titulo?: string | null
  horasSemana?: number | null
  publico?: string | null
  entrega?: string | null
}

export interface MarcoView {
  aberto: boolean
  terminados: number
  /** Quantos faltam pra abrir (0 quando aberto). */
  faltam: number
  titulo: string
  /** Só quando aberto — o conteúdo do marco. */
  paragrafos: string[]
  /** Só quando aberto — os 3 movimentos (junta / escolhe / pede). */
  movimentos: { titulo: string; texto: string }[]
  /** Só quando aberto — a provocação final. */
  fechamento: string | null
}

// ----------------------------------------------------------------------------
// Adaptador: lab_projects → DadosValor (mesmo padrão de paraFonteDevolutiva)
// ----------------------------------------------------------------------------

/** Rótulo de entrega em minúsculas — reusa o vocabulário fechado do wizard
 *  (mesmo padrão de `labelEntrega` em materiais.ts). Sem o id, cai num genérico
 *  que ainda faz a frase funcionar. */
function labelEntrega(entrega: string | null | undefined): string {
  const label = entrega ? LABEL_OPCAO[entrega] : undefined
  return label ? label.toLowerCase() : 'aquela entrega'
}

const LABEL_PUBLICO_VALOR: Record<string, string> = {
  pub_so_eu:
    'Você me disse que o resultado é só teu. Esse é o caso mais difícil da conversa toda, e não adianta eu fingir o contrário: ferramenta que só você usa não gera exposição nenhuma sozinha. Mas o que você aprendeu construindo, sim. A jogada aqui é mostrar o método, não o app.',
  pub_time:
    'O resultado vai pro teu time — a plateia já existe, então metade do trabalho tá feito. Falta ela saber que aquilo tem dono, que deu trabalho, e que dá pra pedir mais.',
  pub_outra_area:
    'Isso atravessa a fronteira do teu time. Trabalho que atravessa fronteira é o que mais rende reputação, justamente porque a outra área não tem obrigação nenhuma de gostar de você.',
  pub_lideranca:
    'O resultado vai direto pra tua liderança. Você tem de graça a exposição que a maioria passa o ano tentando arrumar — não joga isso fora mandando o resultado sem contar a história de como ele apareceu.',
  pub_externo:
    'Isso chega em cliente, gente de fora. É o tipo de coisa que a empresa adora contar em reunião — e você quer ser o nome citado quando ela contar.',
}

const PUBLICO_FALLBACK =
  'Alguém precisa ver isso além de você. Trabalho que ninguém sabe que existe não conta na hora que importa — e essa é a parte que não acontece sozinha.'

/**
 * Adapta `wizard_answers` (v1 ou v2, JSONB cru) + `title` pro contrato do ramo.
 * v1 não tem `horas_semana` — cai nas variantes sem número (degradação graciosa).
 */
export function paraDadosValor(wizardAnswers: unknown, titulo?: string | null): DadosValor {
  const w = (wizardAnswers ?? {}) as Partial<WizardAnswersV2> & { publico?: string; entrega?: string }
  return {
    titulo: titulo ?? null,
    horasSemana: w.schema_version === 2 ? (w.horas_semana ?? null) : null,
    publico: w.publico ?? null,
    entrega: w.entrega ?? null,
  }
}

// ----------------------------------------------------------------------------
// Os toques específicos por tipo (o que muda de ramo pra ramo)
// ----------------------------------------------------------------------------

const TOQUE_POR_TIPO: Record<SolutionTypeId, string> = {
  prompt:
    'Teu ativo aqui é o prompt salvo, e o teste dele é cruel: manda pro colega do lado e não explica nada. Se funciona na mão dele, você não economizou o teu tempo — você pegou o teu jeito de julgar a coisa e transformou em algo que outra pessoa usa. É isso que você conta, não "eu uso IA".',
  template:
    'Molde é a única coisa dessa trilha cujo valor multiplica por gente: uma pessoa usando economiza uma vez, cinco pessoas economizam cinco. Então a tua medida não é a tua hora — é quanta gente passou a usar e quanto retrabalho sumiu do time. Esse é o número que vira conversa de escopo.',
  workflow:
    'Você não fez uma ferramenta, você tirou da tua cabeça um processo que só existia lá dentro. E tem um teste que resolve: o processo sobrevive às tuas férias? Se sobrevive, você deixou de ser gargalo — e gargalo que se resolve sozinho é a coisa que chefe mais lembra na hora de decidir promoção.',
  automacao:
    'É a mais fácil de traduzir em número (horas × frequência) e a mais fácil de contar errado. Repara na diferença: "isso economiza gente" assusta o time inteiro; "isso me libera pra fazer o que ninguém tá fazendo" abre porta. Mesmo fato, recepção oposta. Conta a segunda — e depois entrega alguma coisa com o tempo que sobrou, senão a frase vira mentira.',
  dashboard:
    'O valor de um painel nunca foi o painel: é a decisão que mudou por causa dele. Antes de falar com qualquer pessoa, acha uma — alguém decidiu algo diferente depois de olhar aquilo? Se sim, essa história vale mais que qualquer gráfico. E tem o bônus: painel bom é visto toda semana, por várias pessoas, sem você pedir nada.',
  app_offline:
    'Você tem uma ferramenta com dono, e o teste é alguém usar sem você por perto. Um cuidado que vira ponto a teu favor: ferramenta que aparece do nada na área acende a luz amarela da TI. Chegar antes e contar o que você fez transforma "risco" em "caso exemplar" — e te dá aliado no lugar de fiscal.',
  app_tabela:
    'O ativo aqui não é o app, é o dado. Quem organiza o dado de um processo vira, sem alarde nenhum, a pessoa que responde as perguntas sobre aquele processo. É uma das formas mais silenciosas de virar referência: um dia começam a te chamar antes de decidir, e você nem percebe quando isso passou a acontecer.',
  orquestrado:
    'A habilidade rara que você exercitou não foi construir — foi recortar. Dizer não pra nove ideias e entregar uma. Fala isso com todas as letras, porque é raríssimo, e traduz do jeito que liderança escuta: você entregou valor na primeira fatia em vez de prometer o sistema completo pra daqui a um ano.',
  agentico:
    'Você fez a coisa difícil pelo caminho seguro: provou a consulta antes de dar autonomia. E o teu ponto mais forte não é o que o agente faz — é o que você não deixou ele fazer. Mostrar onde você pôs gente pra aprovar é o que separa "brincou com IA" de "trata isso como engenharia". É isso que faz alguém sênior te levar a sério.',
}

// ----------------------------------------------------------------------------
// Montagem do ramo
// ----------------------------------------------------------------------------

const PARAGRAFO_LESLIE_JOHN =
  'E evidência muda tudo na hora de contar. A Leslie John, professora de Harvard, estudou por que auto-promoção costuma dar errado, e o que ela achou é meio desconfortável: o que irrita não é você falar do teu trabalho — é falar sem prova. Inclusive aquela versão disfarçada, o "nossa, tô exausto de tanto projeto dando certo", que ela mostra que funciona pior do que se gabar direto. Número medido não soa como vaidade. Soa como alguém que sabe o que fez.'

function blocoNumero(dados: DadosValor): BlocoValor {
  const horas = dados.horasSemana
  const entrega = labelEntrega(dados.entrega)

  const paragrafos =
    horas && horas > 0
      ? [
          `Quando você começou, me contou que ${entrega} comia umas ${horas}h da tua semana. Se o que você construiu funciona como devia, boa parte dessas horas voltou pro teu bolso — e ninguém vai perceber. Hora economizada é a coisa mais invisível que existe no trabalho: trabalho que sumiu não aparece em relatório nenhum, e a fila só anda mais rápido.`,
          `Então anota o antes e o depois. Quanto levava, quanto leva agora, medido numa semana de verdade e não no chute. ${horas}h por semana viram umas ${horas * 4}h por mês — com data e com o método do lado, isso deixa de ser impressão tua e vira evidência.`,
          PARAGRAFO_LESLIE_JOHN,
        ]
      : [
          'Falta o número. E sem número, o que você fez vai ser lembrado como "aquilo que o fulano fez ali" — que é basicamente o mesmo que não ser lembrado.',
          'Escolhe uma medida que você consiga defender numa conversa: o tempo que a tarefa levava e leva agora, o erro que sumiu, quanto tempo o time ficava esperando. Mede numa semana real. Uma medida simples e honesta ganha de três estimativas bonitas.',
          PARAGRAFO_LESLIE_JOHN,
        ]

  return {
    titulo: 'O número que você não anotou',
    paragrafos,
    paraCopiar: [
      'ANTES: [tarefa] levava ~[X]h por semana.',
      'DEPOIS: leva ~[Y]h.',
      'COMO MEDI: [o que você cronometrou], entre [data] e [data].',
    ].join('\n'),
  }
}

const BLOCO_CADERNINHO: BlocoValor = {
  titulo: 'O caderninho que salva tua avaliação',
  paragrafos: [
    'Chega a avaliação de fim de ano e você trava tentando lembrar o que fez em março. Isso não é falha da tua memória — é como o trabalho funciona: cada entrega apaga a anterior, e o que sobra na cabeça é a semana passada. Aí a gente escreve a autoavaliação com três coisas que lembrou e esquece as outras nove.',
    'A Julia Evans, que é engenheira, popularizou um remédio bem simples pra isso: um documento onde você anota o que fez na hora em que faz. Ela chama de brag document — algo como um "caderninho de gabolice", e o nome já entrega o desconforto que a gente sente em fazer. Mas o ponto dela não é se gabar: é que ninguém, nem você, lembra do que você fez seis meses depois.',
    'Três linhas por projeto resolvem. E escreve hoje, enquanto tá fresco — em dezembro você vai me agradecer.',
  ],
  paraCopiar: [
    '[mês/ano] — [nome do projeto]',
    'O problema: [o que doía antes]',
    'O que eu fiz: [a solução, em uma linha]',
    'O que mudou: [o número do bloco anterior]',
    'Quem viu: [nome de quem usou / aprovou]',
  ].join('\n'),
}

function blocoExposicao(dados: DadosValor): BlocoValor {
  const abertura = (dados.publico && LABEL_PUBLICO_VALOR[dados.publico]) || PUBLICO_FALLBACK

  return {
    titulo: 'Quem precisa ver isso',
    paragrafos: [
      abertura,
      'Tem um modelo de carreira dos anos 90, do Harvey Coleman, que continua incomodando: ele diz que o teu desempenho pesa uns 10% na tua carreira, a tua imagem uns 30%, e o quanto as pessoas certas sabem o que você faz, uns 60%. Já te aviso: esses números são chute dele, não estudo. Mas quem já viu gente excelente ser esquecida numa promoção sabe que a direção tá certa — entregar bem é a entrada, não o prêmio.',
      'E aí tem uma distinção que a Sylvia Ann Hewlett faz e que muda o jogo: mentor e patrocinador não são a mesma coisa. O mentor te paga um café e te dá uma opinião. O patrocinador fala o teu nome numa sala onde você não tá — e é isso que mexe em projeto bom, em promoção, em aumento. A gente coleciona mentor e não pensa em quem tem interesse real em te ver crescer.',
      'Então escreve um nome. Um só. E manda a mensagem hoje.',
    ],
    paraCopiar: [
      'Oi [nome], montei uma coisa aqui que resolveu [o problema].',
      'Levava ~[X]h por semana, agora leva ~[Y].',
      'Você tem 10 minutos essa semana pra eu te mostrar? Acho que',
      'serve pra mais gente além de mim.',
    ].join('\n'),
    notaCopiar:
      'Dez minutos. Sem apresentação de doze slides — apresentação de doze slides é o jeito favorito da gente de adiar a conversa.',
  }
}

const BLOCO_ESCOPO: BlocoValor = {
  titulo: 'A conversa que vira escopo',
  paragrafos: [
    'O Cal Newport tem um conceito que fecha essa história: capital de carreira. A ideia é que habilidade rara e valiosa funciona como uma moeda — você junta fazendo coisa que pouca gente do teu andar sabe fazer, e depois troca essa moeda por autonomia, por escopo, por condição de trabalho. Repara na palavra rara: não é raro saber usar IA, todo mundo diz que sabe. Raro é resolver um problema de verdade com ela e levar até o fim.',
    'Só que a troca não acontece sozinha, por mérito. Ninguém vai chegar em você e dizer "reparei no que você fez, tomei a liberdade de aumentar teu escopo". Quem marca essa conversa é você.',
    'E não precisa ser o pedido de aumento — que quase nunca é a primeira conversa certa. A pergunta que abre porta é outra, e cabe numa reunião de rotina.',
  ],
  paraCopiar: [
    '"Construí [X], deu [resultado]. Quero fazer mais disso.',
    'O que precisa acontecer pra isso virar parte do meu trabalho,',
    'e não uma coisa que eu faço nas beiradas?"',
  ].join('\n'),
  notaCopiar:
    'Você não tá pedindo favor. Tá propondo que a empresa use melhor uma coisa que ela já tem — que é você.',
}

const COMBINADO = [
  'Agora, o combinado. Não faz as quatro coisas — quem tenta fazer as quatro não faz nenhuma, e a gente sabe disso.',
  'Escolhe uma. Faz até sexta. Se a tua semana tem uma reunião de rotina com quem decide, é ali — não precisa marcar nada especial, e reunião marcada especialmente pra falar de você é exatamente o que trava a coragem.',
  'E volta aqui pra me contar. Porque o projeto seguinte é mais fácil de aprovar quando o anterior virou história que alguém repete.',
]

/** Monta o ramo de valor de um tipo, preenchido com os dados reais do projeto. */
export function montarRamoValor(tipo: SolutionTypeId, dados: DadosValor): RamoValor {
  const titulo = dados.titulo?.trim()

  return {
    slug: slugRamo(tipo),
    titulo: 'Você construiu. Agora vem a parte que ninguém te ensina.',
    abertura: [
      titulo
        ? `Você terminou ${titulo}. Já te coloca num grupo pequeno — a maioria das ideias boas morre naquela fase de "semana que vem eu sento e faço".`
        : 'Você terminou teu projeto. Já te coloca num grupo pequeno — a maioria das ideias boas morre naquela fase de "semana que vem eu sento e faço".',
      'Só que agora vem a parte que quase todo mundo pula. Aquele projeto que você fez e ninguém ficou sabendo? Ele não existe. Não do jeito que conta na hora da promoção, pelo menos.',
      'Então bora fazer ele existir. São quatro conversas, e nenhuma delas leva mais que meia hora.',
    ],
    blocos: [
      blocoNumero(dados),
      BLOCO_CADERNINHO,
      blocoExposicao(dados),
      BLOCO_ESCOPO,
      {
        titulo: 'E no teu caso, especificamente',
        paragrafos: [TOQUE_POR_TIPO[tipo]],
      },
    ],
    combinado: COMBINADO,
  }
}

// ----------------------------------------------------------------------------
// O marco de trajetória (capital de carreira) — abre com 3 projetos terminados
// ----------------------------------------------------------------------------

const MARCO_TITULO = 'De projetos soltos a capital de carreira'

const MARCO_PARAGRAFOS = [
  'Três projetos terminados. Olha, com três isso já virou um hábito — deixou de ser aquela vez em que você sentou num sábado e fez uma parada. Virou o teu jeito de resolver problema.',
  'E aqui a conversa muda. Porque o que você tem agora não são três ferramentas: é uma coisa que o Cal Newport chama de capital de carreira — habilidade rara e valiosa, que funciona como moeda e que você troca por autonomia, por escopo, por condição de trabalho. A palavra que importa ali é rara. Não é raro saber usar IA; é raro a pessoa da área de negócio que pega um problema real, escolhe o tipo certo de solução, constrói e leva até o fim. Olha a tua trilha: é literalmente isso que ela mostra.',
  'Só que capital que ninguém sabe que existe não compra nada. E é aqui que trava a maior parte da gente boa — não por incompetência, mas por acreditar que trabalho bom se anuncia sozinho. Não se anuncia. O Harvey Coleman já provocava com isso lá nos anos 90: o teu desempenho pesaria uns 10% na carreira, e o quanto as pessoas certas sabem o que você faz, uns 60%. São números chutados por ele, não estudo — mas quem já viu o crédito de um trabalho ser recebido em reunião por outra pessoa sabe que a provocação tem fundo.',
  'Então a conversa aqui não é sobre construir mais. É sobre o que você faz com o que já construiu — e são três movimentos.',
]

const MARCO_MOVIMENTOS = [
  {
    titulo: 'Junta',
    texto:
      'Os três projetos numa página só: o problema que existia, o que você fez, o número que sobrou. Isso não é currículo. É a matéria-prima de toda conversa de carreira que você vai ter nos próximos dois anos, inclusive as que você ainda não sabe que vai ter.',
  },
  {
    titulo: 'Escolhe a pessoa certa',
    texto:
      'E aqui tem a distinção da Sylvia Ann Hewlett, que é a mais útil dessa página inteira: mentor não é patrocinador. O mentor te aconselha. O patrocinador age — fala o teu nome na sala em que você não tá, e é isso que mexe em promoção, aumento e projeto bom. Pensa em quem, na tua empresa, ganha alguma coisa com você crescendo. É essa pessoa que precisa ver a página.',
  },
  {
    titulo: 'Pede a coisa certa',
    texto:
      'Não é "quero aumento porque fiz três projetos" — pedido de aumento é o fim da conversa, não o começo dela. O que abre porta é: "esse tipo de trabalho tem dado resultado, e eu quero que ele seja parte do meu escopo, não uma coisa que eu faço nas beiradas. Como a gente faz isso acontecer?" Escopo reconhecido é o que vira promoção seis meses depois. Aumento sem escopo novo é bônus, e bônus a gente gasta e esquece.',
  },
]

const MARCO_FECHAMENTO =
  'E vou te dar a régua honesta, porque prometer promoção seria sacanagem da minha parte: isso pode não render nada onde você tá hoje. Empresa engessada existe. Chefe que recebe o crédito e não repassa existe, e você provavelmente já trabalhou pra um. Mas o capital não é da empresa — é teu, e vai com você pra próxima. Quem construiu três soluções e sabe contar o que elas mudaram tem uma conversa completamente diferente numa entrevista de quem "tem interesse em IA". Agora me conta: das três coisas aí em cima, qual é a que você tá evitando? Porque quase sempre é a do meio — a de escolher a pessoa e mandar a mensagem. Todo mundo prefere fazer mais um projeto a mandar uma mensagem de três linhas, e é justamente a mensagem que muda alguma coisa.'

/**
 * Deriva o marco a partir da contagem de projetos TERMINADOS (nunca do wizard —
 * anti-Goodhart). Trancado, ele mostra a contagem real: a pessoa sabe
 * exatamente o que falta, e o que falta não é farmável.
 */
export function montarMarcoTrajetoria(terminados: number): MarcoView {
  const aberto = terminados >= MARCO_MIN_PROJETOS

  return {
    aberto,
    terminados,
    faltam: aberto ? 0 : MARCO_MIN_PROJETOS - terminados,
    titulo: MARCO_TITULO,
    paragrafos: aberto ? MARCO_PARAGRAFOS : [],
    movimentos: aberto ? MARCO_MOVIMENTOS : [],
    fechamento: aberto ? MARCO_FECHAMENTO : null,
  }
}
