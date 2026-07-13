// =============================================================================
// LAB — MINI-DIAGNÓSTICO DE RESULTADO (ISSUE-314D)
// O check-up da conclusão: quando a pessoa fecha todas as fases da Caminhada,
// em vez de só carimbar "concluído", ela responde 3 perguntas de clique (igual
// à abertura do wizard — vocabulário fechado, texto livre nunca classifica) e
// recebe uma devolutiva de resultado + um resumo compartilhável.
//
// Determinístico e puro (mesma regra do plan-generator/continuidade): compõe
// texto por composição (headline por "chegou" + nuance por "comparado" +
// próximo passo por "proximo"), não por combinatória 3×4×4. A UI só renderiza;
// o servidor recompõe na leitura (só as respostas fechadas são persistidas).
//
// COSTURA PRA IA (ISSUE-320/321): o contrato de entrada (`ResultadoRespostas`)
// e saída (`DevolutivaResultado`) fica isolado aqui. Quando a infra de IA
// existir, `montarDevolutivaResultado` pode ganhar uma variante que lê texto
// livre + as respostas e devolve o mesmo shape — sem tocar UI nem persistência.
//
// ⚠️ COPY PENDENTE DE VETO DO DONO (norma da casa pra toda copy nova de produto).
// =============================================================================

import type {
  LabResultado,
  ResultadoChegouId,
  ResultadoComparadoId,
  ResultadoProximoId,
  ResultadoRespostas,
} from './types'

/** Versão da heurística — gravada em `plan.resultado.versao`. */
export const RESULTADO_VERSION = 'resultado-1.0.0'

// ----------------------------------------------------------------------------
// As 3 perguntas (dado — a UI renderiza a partir daqui, nada hardcoded no JSX)
// ----------------------------------------------------------------------------

export interface OpcaoResultado {
  id: string
  label: string
}

export interface PerguntaResultado {
  /** Chave da resposta em `ResultadoRespostas`. */
  campo: keyof ResultadoRespostas
  enunciado: string
  opcoes: OpcaoResultado[]
}

export const PERGUNTAS_RESULTADO: PerguntaResultado[] = [
  {
    campo: 'chegou',
    enunciado: 'Antes de fechar: você chegou a colocar isso pra rodar?',
    opcoes: [
      { id: 'chegou_usei', label: 'Já usei numa tarefa real' },
      { id: 'chegou_montei', label: 'Montei, mas ainda não usei pra valer' },
      { id: 'chegou_meio', label: 'Ainda tô construindo' },
    ],
  },
  {
    campo: 'comparado',
    enunciado: 'E comparado com o jeito que você fazia na mão?',
    opcoes: [
      { id: 'comp_melhor', label: 'Ficou melhor e mais rápido' },
      { id: 'comp_consistente', label: 'Parecido, mas saindo mais consistente' },
      { id: 'comp_ainda_nao', label: 'Ainda não ganhou do manual' },
      { id: 'comp_sem_base', label: 'Cedo pra comparar' },
    ],
  },
  {
    campo: 'proximo',
    enunciado: 'E agora, qual é o próximo movimento?',
    opcoes: [
      { id: 'prox_rotina', label: 'Deixar rodando na rotina' },
      { id: 'prox_ajustar', label: 'Ajustar até ficar redondo' },
      { id: 'prox_mostrar', label: 'Mostrar pra alguém do trabalho' },
      { id: 'prox_proximo', label: 'Subir um nível' },
    ],
  },
]

// ----------------------------------------------------------------------------
// Composição da devolutiva (por eixo — não combinatória)
// ----------------------------------------------------------------------------

const HEADLINE_POR_CHEGOU: Record<ResultadoChegouId, string> = {
  chegou_usei:
    'Você não parou no plano — colocou pra rodar no teu trabalho de verdade. É esse o ponto ' +
    'que a maioria não alcança: da ideia sobre IA pra uma coisa feita com ela.',
  chegou_montei:
    'Você construiu a coisa. Falta só o passo que separa quem monta de quem colhe: rodar numa ' +
    'tarefa real e deixar o uso te mostrar o que ajustar.',
  chegou_meio:
    'Você tá no meio da construção — e isso já é mais do que a maioria faz. O projeto fica ' +
    'guardado aqui, do jeito que você deixou, pra você retomar quando der.',
}

const NUANCE_POR_COMPARADO: Record<ResultadoComparadoId, string> = {
  comp_melhor:
    'Melhor e mais rápido que o manual é exatamente o sinal que a gente procura: ganho que dá ' +
    'pra medir, não só sensação.',
  comp_consistente:
    'Mais consistente já é ganho de verdade — o erro que some é tempo que não volta pra você ' +
    'apagar incêndio depois.',
  comp_ainda_nao:
    'Ainda não ganhou do manual, e tudo bem: primeira versão raramente ganha. O que você ' +
    'aprendeu montando é o ajuste da próxima rodada.',
  comp_sem_base:
    'Cedo pra comparar é uma resposta honesta — dá tempo ao uso real antes de cravar se valeu.',
}

const PROXIMO_PASSO_POR_PROXIMO: Record<ResultadoProximoId, string> = {
  prox_rotina:
    'Próximo passo: fincar isso na rotina. Uma vez que vira hábito, para de depender da tua ' +
    'memória — e é aí que o ganho se paga toda semana.',
  prox_ajustar:
    'Próximo passo: mais uma rodada de ajuste. Cada correção que você faz na mão hoje vira ' +
    'melhoria permanente amanhã.',
  prox_mostrar:
    'Próximo passo: mostrar pra uma pessoa do trabalho. Se ela usa sem você explicar, você ' +
    'construiu certo — e o que ela pedir a mais é o teu roadmap.',
  prox_proximo:
    'Próximo passo: subir um nível. Você já tem repertório pra pegar um problema um pouco ' +
    'maior — e o Lab continua aqui pra desenhar o próximo contigo.',
}

export interface DevolutivaResultado {
  headline: string
  nuance: string
  proximoPasso: string
}

/**
 * Compõe a devolutiva de resultado a partir das 3 respostas fechadas.
 * Determinístico: mesmas respostas → mesmo texto. (A variante com IA da
 * ISSUE-320/321 devolve este mesmo shape — a UI não muda.)
 */
export function montarDevolutivaResultado(respostas: ResultadoRespostas): DevolutivaResultado {
  return {
    headline: HEADLINE_POR_CHEGOU[respostas.chegou],
    nuance: NUANCE_POR_COMPARADO[respostas.comparado],
    proximoPasso: PROXIMO_PASSO_POR_PROXIMO[respostas.proximo],
  }
}

// ----------------------------------------------------------------------------
// Resumo compartilhável (texto puro copiável — sem link, sem dependência externa)
// ----------------------------------------------------------------------------

/**
 * Monta o texto que a pessoa copia pra compartilhar o que construiu. Sem links
 * nem tracking (cross-origin não é rastreável mesmo — decisão registrada na
 * home/newsletter). É a pessoa contando o que fez, na voz dela.
 */
export function montarCompartilhavel(params: {
  titulo: string
  artefato: string
  devolutiva: DevolutivaResultado
}): string {
  const { titulo, artefato, devolutiva } = params
  return [
    `Meu projeto no Lab do Conversas no Corredor: "${titulo}"`,
    '',
    `O que construí: ${artefato}`,
    '',
    `Resultado: ${devolutiva.headline}`,
    devolutiva.nuance,
    devolutiva.proximoPasso,
  ].join('\n')
}

// ----------------------------------------------------------------------------
// Validação (guarda de entrada da rota — vocabulário fechado, como a 313/314)
// ----------------------------------------------------------------------------

const VOCAB_CHEGOU = new Set<string>(
  PERGUNTAS_RESULTADO.find((p) => p.campo === 'chegou')!.opcoes.map((o) => o.id),
)
const VOCAB_COMPARADO = new Set<string>(
  PERGUNTAS_RESULTADO.find((p) => p.campo === 'comparado')!.opcoes.map((o) => o.id),
)
const VOCAB_PROXIMO = new Set<string>(
  PERGUNTAS_RESULTADO.find((p) => p.campo === 'proximo')!.opcoes.map((o) => o.id),
)

/**
 * Valida o payload do check-up. Estrito: as 3 respostas presentes e com id do
 * vocabulário fechado. Nunca confia no cliente (mesma postura da validacao.ts).
 * `null` = inválido → o servidor conclui SEM resultado (a pessoa pulou).
 */
export function validarResultado(payload: unknown): LabResultado | null {
  if (typeof payload !== 'object' || payload === null) return null
  const v = payload as Record<string, unknown>
  const chegou = typeof v.chegou === 'string' && VOCAB_CHEGOU.has(v.chegou) ? v.chegou : null
  const comparado =
    typeof v.comparado === 'string' && VOCAB_COMPARADO.has(v.comparado) ? v.comparado : null
  const proximo =
    typeof v.proximo === 'string' && VOCAB_PROXIMO.has(v.proximo) ? v.proximo : null
  if (!chegou || !comparado || !proximo) return null
  return {
    respostas: {
      chegou: chegou as ResultadoChegouId,
      comparado: comparado as ResultadoComparadoId,
      proximo: proximo as ResultadoProximoId,
    },
    versao: RESULTADO_VERSION,
  }
}
