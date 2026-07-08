'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { GridSection } from '@/components/ds2'
import { CONTEUDO_MATURIDADE } from '@/lib/radar/content'
import { calcularMaturidade, PERGUNTAS_MATURIDADE } from '@/lib/radar/maturidade'
import { decidirOportunidade, PERGUNTAS_OPORTUNIDADES } from '@/lib/radar/oportunidades'
import type {
  MaturityResult,
  OpportunityResult,
  RadarAnswers,
  RadarKind,
  RadarQuestion,
} from '@/lib/radar/types'
import { salvarMaturidadeReal } from '@/lib/radar-storage'

import { MaturidadeResultado } from './MaturidadeResultado'
import { OportunidadesResultado } from './OportunidadesResultado'
import { QuestionCard } from './QuestionCard'

interface RadarFlowProps {
  kind: RadarKind
}

const PERGUNTAS_POR_KIND: Record<RadarKind, RadarQuestion[]> = {
  maturidade: PERGUNTAS_MATURIDADE,
  oportunidades: PERGUNTAS_OPORTUNIDADES,
}

export function RadarFlow({ kind }: RadarFlowProps) {
  const perguntas = PERGUNTAS_POR_KIND[kind]

  const [indice, setIndice] = useState(0)
  const [respostas, setRespostas] = useState<RadarAnswers>({})
  const [resultado, setResultado] = useState<MaturityResult | OpportunityResult | null>(null)

  const mountedRef = useRef(true)
  const sessionIdRef = useRef<string | null>(null)
  const sessionPromiseRef = useRef<Promise<string | null> | null>(null)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const ensureSessionId = useCallback(async (): Promise<string | null> => {
    if (sessionIdRef.current) return sessionIdRef.current
    if (!sessionPromiseRef.current) {
      sessionPromiseRef.current = fetch('/api/radar/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind }),
      })
        .then((res) => res.json())
        .then((data) => {
          const id = typeof data?.sessionId === 'string' ? data.sessionId : null
          sessionIdRef.current = id
          return id
        })
        .catch(() => null)
        .finally(() => {
          sessionPromiseRef.current = null
        })
    }
    return sessionPromiseRef.current
  }, [kind])

  // Cria a sessão assim que o fluxo monta — não bloqueia a primeira pergunta.
  useEffect(() => {
    void ensureSessionId()
  }, [ensureSessionId])

  const persistirResultado = useCallback(
    async (respostasFinais: RadarAnswers, resultKey: string) => {
      const sessionId = await ensureSessionId()
      if (!sessionId) return
      try {
        await fetch('/api/radar/session', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, answers: respostasFinais, resultKey }),
        })
      } catch {
        // Falha ao persistir não impede o resultado de aparecer na tela.
      }
    },
    [ensureSessionId]
  )

  const finalizar = useCallback(
    (respostasFinais: RadarAnswers) => {
      if (kind === 'maturidade') {
        const resultadoMaturidade = calcularMaturidade(respostasFinais)
        salvarMaturidadeReal(resultadoMaturidade.nivel, resultadoMaturidade.score)
        setResultado(resultadoMaturidade)
        void persistirResultado(respostasFinais, resultadoMaturidade.nivel)
      } else {
        const resultadoOportunidade = decidirOportunidade(respostasFinais)
        setResultado(resultadoOportunidade)
        void persistirResultado(respostasFinais, resultadoOportunidade.tipo)
      }
    },
    [kind, persistirResultado]
  )

  function avancar(respostasAtuais: RadarAnswers) {
    if (indice + 1 < perguntas.length) {
      setIndice((i) => i + 1)
    } else {
      finalizar(respostasAtuais)
    }
  }

  function selecionarOpcao(perguntaId: string, opcaoId: string) {
    const novasRespostas = { ...respostas, [perguntaId]: opcaoId }
    setRespostas(novasRespostas)

    window.setTimeout(() => {
      if (!mountedRef.current) return
      avancar(novasRespostas)
    }, 320)
  }

  function voltar() {
    setIndice((i) => Math.max(0, i - 1))
  }

  if (resultado?.kind === 'maturidade') {
    return (
      <GridSection className="rounded-ds2-hero border border-ds2-border-subtle p-6 md:p-10">
        <MaturidadeResultado
          resultado={resultado}
          conteudo={CONTEUDO_MATURIDADE[resultado.nivel]}
          ensureSessionId={ensureSessionId}
        />
      </GridSection>
    )
  }

  if (resultado?.kind === 'oportunidades') {
    return (
      <GridSection className="rounded-ds2-hero border border-ds2-border-subtle p-6 md:p-10">
        <OportunidadesResultado resultado={resultado} ensureSessionId={ensureSessionId} />
      </GridSection>
    )
  }

  const perguntaAtual = perguntas[indice]

  return (
    <GridSection className="rounded-ds2-hero border border-ds2-border-subtle p-6 md:p-10">
      <QuestionCard
        kind={kind}
        question={perguntaAtual}
        questionNumber={indice + 1}
        totalQuestions={perguntas.length}
        selectedOptionId={respostas[perguntaAtual.id] ?? null}
        onSelect={(opcaoId) => selecionarOpcao(perguntaAtual.id, opcaoId)}
        onBack={voltar}
        onContinue={() => avancar(respostas)}
        canGoBack={indice > 0}
      />
    </GridSection>
  )
}
