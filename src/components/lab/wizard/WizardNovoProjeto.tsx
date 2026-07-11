'use client'

// =============================================================================
// WIZARD DO LAB — ORQUESTRADOR (ISSUE-313)
// A "Conversa de Consultor" inteira: roteiro do wizard-flow, split-screen no
// desktop (pergunta à esquerda, NOTAS DO CONSULTOR à direita — protagonista),
// coluna única no mobile (notas compactas no topo), progresso POR BLOCO,
// rascunho salvo a cada virada de bloco, retomada no ponto certo e finalização
// via API (motor roda no servidor). Ritmo ágil: transições de 0.18–0.28s.
// =============================================================================

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

import { Eyebrow } from '@/components/ds2'
import type { PortaEntrada } from '@/lib/lab/types'
import { WIZARD_SCHEMA_VERSION_V2 } from '@/lib/lab/types'
import type { EtapaWizard } from '@/lib/lab/wizard-flow'
import { NOME_BLOCO, roteiro } from '@/lib/lab/wizard-flow'
import { cn } from '@/lib/utils'

import type { RespostasParciais } from './dados'
import { notasDoCaso } from './dados'
import { EtapaEspelho } from './EtapaEspelho'
import type { Avanco } from './EtapaPergunta'
import { EtapaPergunta } from './EtapaPergunta'
import type { DadosFinalizacao } from './EtapaProposta'
import { EtapaProposta } from './EtapaProposta'
import { NotasConsultor } from './NotasConsultor'

interface WizardNovoProjetoProps {
  /** Rascunho aberto (retomada) — null = conversa nova. */
  rascunhoInicial: { id: string; respostas: RespostasParciais } | null
  /** Pré-preenchimento da fluência (perfil/radar) — sempre editável. */
  sugestaoConforto: string | null
}

/** Trilha que o roteiro segue: `arq_outro` desvia pro caminho DOR (spec 2.I1). */
function trilhaEfetiva(r: RespostasParciais): PortaEntrada | null {
  if (!r.porta) return null
  if (r.porta === 'ideia' && r.arquetipo === 'arq_outro') return 'dor'
  return r.porta
}

function etapasDaConversa(r: RespostasParciais): EtapaWizard[] {
  const trilha = trilhaEfetiva(r)
  return trilha ? roteiro(trilha) : roteiro('dor').slice(0, 3)
}

/** A etapa já tem resposta? (espelho/proposta nunca contam — são o fechamento). */
function respondida(etapa: EtapaWizard, r: RespostasParciais): boolean {
  if (etapa.id === 'espelho' || etapa.id === 'titulo_proposta') return false
  return etapa.grava.every((campo) => r[campo as keyof RespostasParciais] !== undefined)
}

/** Retomada: primeira etapa NÃO-opcional sem resposta (rascunho salvo por bloco). */
function etapaInicial(r: RespostasParciais): number {
  const etapas = etapasDaConversa(r)
  const idx = etapas.findIndex((e) => !e.opcional && !respondida(e, r))
  return idx === -1 ? etapas.length - 1 : idx
}

/** Ajuste vindo do espelho: campo → id da etapa que o captura. */
function etapaDoCampo(campo: string, r: RespostasParciais): string {
  const ideiaPura = trilhaEfetiva(r) === 'ideia'
  const mapa: Record<string, string> = {
    conforto: 'fluencia',
    area: 'area',
    desejo: 'beneficio',
    perda: ideiaPura ? 'confirmacao_rotina' : 'cena',
    entrega: ideiaPura ? 'confirmacao_rotina' : 'entrega',
    frequencia: 'frequencia',
    horas: 'horas',
    dado: 'dado',
    publico: 'publico',
    ambiente: 'arsenal',
  }
  return mapa[campo] ?? 'espelho'
}

type StatusRascunho = 'novo' | 'salvando' | 'salvo' | 'erro'

export function WizardNovoProjeto({
  rascunhoInicial,
  sugestaoConforto,
}: WizardNovoProjetoProps) {
  const router = useRouter()
  const semMovimento = useReducedMotion()

  const [respostas, setRespostas] = React.useState<RespostasParciais>(() => {
    if (rascunhoInicial) return rascunhoInicial.respostas
    return sugestaoConforto ? { conforto: sugestaoConforto } : {}
  })
  const [etapaIdx, setEtapaIdx] = React.useState(() =>
    rascunhoInicial ? etapaInicial(rascunhoInicial.respostas) : 0,
  )
  const [projetoId, setProjetoId] = React.useState<string | null>(
    rascunhoInicial?.id ?? null,
  )
  const [statusRascunho, setStatusRascunho] = React.useState<StatusRascunho>(
    rascunhoInicial ? 'salvo' : 'novo',
  )
  const [retornoEspelho, setRetornoEspelho] = React.useState(false)
  const [finalizando, setFinalizando] = React.useState(false)
  const [erroFinal, setErroFinal] = React.useState<string | null>(null)

  const etapas = etapasDaConversa(respostas)
  const etapa = etapas[Math.min(etapaIdx, etapas.length - 1)]
  const linhas = React.useMemo(() => notasDoCaso(respostas), [respostas])

  // Evita salvar de novo com as mesmas respostas (voltar/avançar de bloco).
  const ultimoSalvo = React.useRef<string>('')

  const salvarRascunho = React.useCallback(
    async (r: RespostasParciais) => {
      const corpo = JSON.stringify({ rascunho: r })
      if (corpo === ultimoSalvo.current) return
      ultimoSalvo.current = corpo
      setStatusRascunho('salvando')
      try {
        if (!projetoId) {
          const res = await fetch('/api/lab/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: corpo,
          })
          if (!res.ok) throw new Error(String(res.status))
          const { id } = (await res.json()) as { id: string }
          setProjetoId(id)
        } else {
          const res = await fetch(`/api/lab/projects/${projetoId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: corpo,
          })
          if (!res.ok) throw new Error(String(res.status))
        }
        setStatusRascunho('salvo')
      } catch {
        // Rascunho é rede de segurança, não trava a conversa.
        setStatusRascunho('erro')
      }
    },
    [projetoId],
  )

  const onResponder = React.useCallback(
    (patch: Partial<RespostasParciais>, avanco: Avanco) => {
      const novas = { ...respostas, ...patch }
      setRespostas(novas)
      if (avanco === 'ficar') return

      const novasEtapas = etapasDaConversa(novas)
      let proximoIdx = avanco === 'mesma' ? etapaIdx : etapaIdx + 1

      // Ajuste vindo do espelho: respondeu a dimensão → volta direto pro espelho.
      if (retornoEspelho && avanco === 'proxima' && etapa.bloco < 4) {
        proximoIdx = novasEtapas.findIndex((e) => e.id === 'espelho')
        setRetornoEspelho(false)
      }

      proximoIdx = Math.min(proximoIdx, novasEtapas.length - 1)

      // Virou de bloco → salva o rascunho (critério: abandono preserva por bloco).
      if (novasEtapas[proximoIdx].bloco > etapa.bloco) {
        void salvarRascunho(novas)
      }
      setEtapaIdx(proximoIdx)
    },
    [respostas, etapaIdx, etapa, retornoEspelho, salvarRascunho],
  )

  const onAjustar = React.useCallback(
    (campo: string) => {
      const alvo = etapaDoCampo(campo, respostas)
      const idx = etapas.findIndex((e) => e.id === alvo)
      if (idx >= 0) {
        setRetornoEspelho(true)
        setEtapaIdx(idx)
      }
    },
    [respostas, etapas],
  )

  const onConfirmarEspelho = React.useCallback(() => {
    onResponder({ hipoteses_confirmadas: respostas.hipoteses_confirmadas ?? [] }, 'proxima')
  }, [onResponder, respostas.hipoteses_confirmadas])

  const onFinalizar = React.useCallback(
    async (dados: DadosFinalizacao) => {
      setFinalizando(true)
      setErroFinal(null)
      const completo = {
        ...respostas,
        ...dados,
        schema_version: WIZARD_SCHEMA_VERSION_V2,
        area: respostas.area ?? null,
        ambiente: respostas.ambiente ?? [],
      }
      try {
        let id = projetoId
        if (!id) {
          const res = await fetch('/api/lab/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rascunho: completo }),
          })
          if (!res.ok) throw new Error('criar')
          id = ((await res.json()) as { id: string }).id
          setProjetoId(id)
        }
        const res = await fetch(`/api/lab/projects/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ finalizar: completo }),
        })
        if (!res.ok) throw new Error('finalizar')
        router.push(`/lab/projeto/${id}`)
      } catch {
        setErroFinal(
          'Não consegui criar o projeto agora — tuas respostas continuam aqui, tenta de novo.',
        )
        setFinalizando(false)
      }
    },
    [respostas, projetoId, router],
  )

  // Progresso por bloco (spec §4): 4 segmentos nomeados, nunca "pergunta 7 de 14".
  const blocos = [1, 2, 3, 4] as const
  const progressoBloco = (b: number): number => {
    const doBloco = etapas.filter((e) => e.bloco === b)
    if (doBloco.length === 0) return 0
    const feitas = etapas.filter((e, i) => e.bloco === b && i < etapaIdx).length
    return Math.round((feitas / doBloco.length) * 100)
  }

  return (
    <div>
      {/* Cabeçalho: contexto + estado do rascunho */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Eyebrow>novo projeto · conversa de consultor</Eyebrow>
        <span className="font-ds2-mono text-[10px] text-ds2-text-subtle">
          {statusRascunho === 'salvando' && 'salvando rascunho…'}
          {statusRascunho === 'salvo' && 'rascunho guardado'}
          {statusRascunho === 'erro' && 'rascunho não salvou — sigo mesmo assim'}
        </span>
      </div>

      {/* Progresso por bloco */}
      <div className="mt-4 grid grid-cols-4 gap-2">
        {blocos.map((b) => (
          <div key={b}>
            <p
              className={cn(
                'mb-1.5 truncate font-ds2-mono text-[10px] tracking-[0.08em] uppercase',
                etapa.bloco === b
                  ? 'text-ds2-amber-soft'
                  : etapa.bloco > b
                    ? 'text-ds2-text-muted'
                    : 'text-ds2-text-subtle',
              )}
            >
              {NOME_BLOCO[b]}
            </p>
            <div className="h-1 overflow-hidden rounded-ds2-pill bg-white/[0.11]">
              <div
                className="h-full bg-ds2-gradient-primary transition-[width] duration-300"
                style={{ width: `${etapa.bloco > b ? 100 : etapa.bloco === b ? Math.max(progressoBloco(b), 8) : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Palco: pergunta + notas (split no desktop, notas no topo no mobile) */}
      <div className="mt-6 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-8">
        <div className="mb-5 lg:order-2 lg:mb-0">
          <div className="lg:sticky lg:top-6">
            <NotasConsultor linhas={linhas} />
          </div>
        </div>

        <div className="lg:order-1">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${etapa.id}-${trilhaEfetiva(respostas) ?? 'inicio'}`}
              initial={semMovimento ? false : { opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={semMovimento ? undefined : { opacity: 0, x: -14 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <h1 className="font-ds2-serif text-[22px] leading-[1.25] font-medium tracking-[-0.02em] text-ds2-text-primary">
                {etapa.pergunta}
              </h1>
              {etapa.apoio && (
                <p className="mt-1.5 text-sm text-ds2-text-muted">{etapa.apoio}</p>
              )}

              <div className="mt-5">
                {etapa.id === 'espelho' ? (
                  <EtapaEspelho
                    respostas={respostas}
                    onConfirmar={onConfirmarEspelho}
                    onAjustar={onAjustar}
                  />
                ) : etapa.id === 'titulo_proposta' ? (
                  <EtapaProposta
                    respostas={respostas}
                    finalizando={finalizando}
                    erro={erroFinal}
                    onFinalizar={onFinalizar}
                  />
                ) : (
                  <EtapaPergunta
                    etapa={etapa}
                    respostas={respostas}
                    onResponder={onResponder}
                  />
                )}
              </div>

              {etapaIdx > 0 && !finalizando && (
                <button
                  type="button"
                  onClick={() => setEtapaIdx((i) => Math.max(0, i - 1))}
                  className="mt-5 min-h-11 font-ds2-mono text-xs text-ds2-text-muted transition-colors hover:text-ds2-text-secondary"
                >
                  ← voltar
                </button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
