'use client'

// =============================================================================
// WIZARD DO LAB — DESEMPATE + NOME + PROPOSTA ASSISTIDA (ISSUE-313, spec 4.3/4.4)
// O clímax da conversa: (1) desempate condicional TRANSPARENTE quando o motor
// está genuinamente indeciso (máx. 1×); (2) nome sugerido, nunca campo vazio;
// (3) proposta + alternativas no formato consultor — o que é · por que serve
// pro TEU caso · versão de corredor · pode evoluir para. A pessoa ESCOLHE
// (proposta escolhida, não veredito) e o projeto nasce.
// O motor roda aqui só como PREVIEW — a autoridade é o servidor (PATCH).
// =============================================================================

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

import { Button, Eyebrow } from '@/components/ds2'
import {
  aplicarDesempate,
  perguntaDesempate,
  precisaDesempate,
  type PerguntaDesempate,
} from '@/lib/lab/desempate'
import { diagnosticarV2 } from '@/lib/lab/engine'
import type { DesempateRegistro, WizardAnswersV2 } from '@/lib/lab/types'
import { WIZARD_SCHEMA_VERSION_V2 } from '@/lib/lab/types'
import { mancheteBeneficio, sugerirTitulo } from '@/lib/lab/wizard-flow'
import type { SolutionTypeId } from '@/lib/radar/types'
import { cn } from '@/lib/utils'

import type { RespostasParciais } from './dados'
import { cardsProposta, NOME_TIPO } from './dados'
import { CheckDesenhado, LapisAnotando, PontinhosPensando } from './IconesAnimados'

export interface DadosFinalizacao {
  titulo: string
  escolha_tipo: SolutionTypeId
  desempate?: DesempateRegistro
}

interface EtapaPropostaProps {
  respostas: RespostasParciais
  finalizando: boolean
  erro: string | null
  onFinalizar: (dados: DadosFinalizacao) => void
}

export function EtapaProposta({
  respostas,
  finalizando,
  erro,
  onFinalizar,
}: EtapaPropostaProps) {
  const semMovimento = useReducedMotion()

  // Preview do motor (a autoridade é o servidor no finalizar).
  const diagnostico = React.useMemo(() => {
    try {
      return diagnosticarV2({
        ...(respostas as WizardAnswersV2),
        schema_version: WIZARD_SCHEMA_VERSION_V2,
        titulo: 'preview',
        area: respostas.area ?? null,
        ambiente: respostas.ambiente ?? [],
      })
    } catch {
      return null
    }
  }, [respostas])

  const pergunta = React.useMemo<PerguntaDesempate | null>(() => {
    if (!diagnostico) return null
    const par = precisaDesempate(diagnostico.pontuacao)
    if (!par) return null
    const jaEscolhidas = [
      respostas.area,
      respostas.entrega,
      respostas.perda,
      respostas.frequencia,
      respostas.publico,
      respostas.dado,
      respostas.desejo,
      respostas.conforto,
    ].filter((v): v is string => Boolean(v))
    return perguntaDesempate(par, jaEscolhidas)
  }, [diagnostico, respostas])

  const [respostaDesempate, setRespostaDesempate] = React.useState<string | null>(null)
  const [titulo, setTitulo] = React.useState(() =>
    sugerirTitulo({
      porta: respostas.porta ?? 'dor',
      arquetipo: respostas.arquetipo,
      area: respostas.area,
      perda: respostas.perda,
    }),
  )
  const [escolha, setEscolha] = React.useState<SolutionTypeId | null>(null)

  // Beat de "analisando teu caso…" ANTES de revelar a proposta (feedback do
  // dono: o final estava frio, faltava o momento em que o consultor apresenta a
  // leitura). Toca UMA vez ao entrar na fase 2 (não em cada render); pulado em
  // prefers-reduced-motion. É o único beat "deliberado" do fluxo — no clímax,
  // vale os ~700ms.
  const emFase2 = !(pergunta && !respostaDesempate)
  const [analisando, setAnalisando] = React.useState(false)
  React.useEffect(() => {
    if (!emFase2 || semMovimento) {
      setAnalisando(false)
      return
    }
    setAnalisando(true)
    const t = setTimeout(() => setAnalisando(false), 700)
    return () => clearTimeout(t)
  }, [emFase2, semMovimento])

  if (!diagnostico) return null

  const lider: SolutionTypeId =
    pergunta && respostaDesempate
      ? aplicarDesempate(pergunta, respostaDesempate)
      : diagnostico.tipo

  // --- Fase 1: desempate condicional (transparente, máx. 1) -----------------
  if (pergunta && !respostaDesempate) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-ds2-panel border border-ds2-border-subtle bg-ds2-surface-glass p-5">
          <Eyebrow>última pergunta — prometo</Eyebrow>
          <p className="mt-2 font-ds2-serif text-xl leading-snug font-medium text-ds2-text-primary">
            Teu caso tá entre <strong>{NOME_TIPO[pergunta.par[0]].toLowerCase()}</strong> e{' '}
            <strong>{NOME_TIPO[pergunta.par[1]].toLowerCase()}</strong> — me responde mais
            uma.
          </p>
          <p className="mt-2 text-sm text-ds2-text-secondary">
            Se tivesse que escolher UMA das duas frases como a mais tua:
          </p>
        </div>
        <div className="flex flex-col gap-2.5">
          {[pergunta.opcaoA, pergunta.opcaoB].map((opcao) => (
            <button
              key={opcao.opcao}
              type="button"
              onClick={() => setRespostaDesempate(opcao.opcao)}
              className="flex min-h-11 w-full items-center gap-3 rounded-ds2-card border border-ds2-border-subtle bg-ds2-surface-glass px-4 py-3 text-left text-sm text-ds2-text-secondary transition-colors hover:bg-ds2-surface-glass-hover"
            >
              “{opcao.label}”
            </button>
          ))}
        </div>
      </div>
    )
  }

  // --- Beat de análise (uma vez, no clímax) ---------------------------------
  if (analisando) {
    return (
      <div className="flex min-h-[180px] flex-col items-start justify-center gap-3">
        <span className="flex items-center gap-2.5 font-ds2-mono text-xs tracking-[0.13em] text-ds2-amber-soft uppercase">
          <LapisAnotando ativo className="text-ds2-amber-soft" />
          analisando teu caso
          <PontinhosPensando className="text-ds2-amber-soft" />
        </span>
        <p className="font-ds2-serif text-xl text-ds2-text-secondary">
          Cruzando o que você me contou com os caminhos que fazem sentido…
        </p>
      </div>
    )
  }

  // --- Fase 2: leitura do consultor + nome + proposta com alternativas -------
  const cards = cardsProposta(lider, diagnostico.pontuacao)
  const selecionado = escolha ?? lider
  const manchete = mancheteBeneficio(respostas.desejo ?? '', respostas.horas_semana)

  return (
    <div className="flex flex-col gap-6">
      {/* Moldura do consultor: apresenta a leitura e CONVIDA a ler os 3 (feedback do dono) */}
      <motion.div
        initial={semMovimento ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        className="rounded-ds2-panel border border-ds2-border-subtle bg-[rgba(46,104,96,0.13)] p-5"
      >
        <Eyebrow>minha leitura do teu caso</Eyebrow>
        <p className="mt-2 font-ds2-serif text-xl leading-snug font-medium tracking-[-0.02em] text-ds2-text-primary">
          Analisei o que você me trouxe. Pra{' '}
          <span className="text-ds2-amber-soft">{manchete}</span>, o caminho que eu
          recomendo é <strong>{NOME_TIPO[lider].toLowerCase()}</strong>.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ds2-text-secondary">
          Mas deixei ao lado dois vizinhos que também resolvem o teu caso, cada um puxando
          por um ângulo diferente. Lê os três com calma e escolhe o que mais conversa com a
          tua realidade — não tem resposta errada, tem a que cabe em você. O que você marcar
          vira o teu projeto.
        </p>
      </motion.div>

      <div>
        <label
          htmlFor="titulo-projeto"
          className="font-ds2-mono text-[11px] tracking-[0.13em] text-ds2-amber-soft uppercase"
        >
          batiza teu projeto (pode trocar depois)
        </label>
        <input
          id="titulo-projeto"
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          maxLength={120}
          className="mt-2 min-h-11 w-full rounded-ds2-card border border-ds2-border-medium bg-transparent px-4 py-3 font-ds2-serif text-xl text-ds2-text-primary focus:border-ds2-orange/60 focus:outline-none"
        />
      </div>

      <div>
        <Eyebrow>toca no caminho que é o teu</Eyebrow>
        <div className="mt-3 flex flex-col gap-3">
          {cards.map((card, idx) => {
            const ativo = selecionado === card.tipo
            return (
              <motion.button
                key={card.tipo}
                type="button"
                onClick={() => setEscolha(card.tipo)}
                initial={semMovimento ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: semMovimento ? 0 : idx * 0.12 }}
                aria-pressed={ativo}
                className={cn(
                  'w-full rounded-ds2-card border p-5 text-left transition-colors',
                  ativo
                    ? 'border-ds2-orange/50 bg-[rgba(217,119,6,0.10)]'
                    : 'border-ds2-border-subtle bg-ds2-surface-glass hover:bg-ds2-surface-glass-hover',
                  idx === 0 && !ativo && 'bg-[rgba(46,104,96,0.13)]',
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-ds2-mono text-[10px] tracking-[0.1em] text-ds2-text-muted uppercase">
                    {idx === 0 ? 'proposta do consultor' : `alternativa ${idx}`} ·{' '}
                    {card.familiaLabel}
                  </span>
                  {ativo && <CheckDesenhado className="shrink-0 text-ds2-orange" />}
                </div>
                <h3 className="mt-2 font-ds2-sans text-lg font-semibold tracking-[-0.03em] text-ds2-text-primary">
                  {card.nome}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ds2-text-secondary">
                  {card.porque}
                </p>
                <div className="mt-3 border-t border-ds2-border-subtle pt-3">
                  <p className="text-sm leading-relaxed text-ds2-text-secondary">
                    <span className="font-ds2-mono text-[10px] tracking-[0.1em] text-ds2-amber-soft uppercase">
                      pra começar hoje ·{' '}
                    </span>
                    {card.corredor}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-ds2-text-muted">
                    <span className="font-ds2-mono text-[10px] tracking-[0.1em] uppercase">
                      pode evoluir pra ·{' '}
                    </span>
                    {card.evoluiPara}
                  </p>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      {erro && (
        <p className="rounded-ds2-card border border-ds2-magenta/30 bg-[rgba(211,76,117,0.08)] p-3 text-sm text-ds2-text-secondary">
          {erro}
        </p>
      )}

      <Button
        disabled={finalizando || titulo.trim().length === 0}
        onClick={() =>
          onFinalizar({
            titulo: titulo.trim(),
            escolha_tipo: selecionado,
            ...(pergunta && respostaDesempate
              ? { desempate: { par: pergunta.par, resposta: respostaDesempate } }
              : {}),
          })
        }
        className="self-start"
      >
        {finalizando ? (
          <>
            <LapisAnotando ativo className="text-[#1E1005]" /> montando teu plano…
          </>
        ) : (
          'Criar meu projeto'
        )}
      </Button>
    </div>
  )
}
