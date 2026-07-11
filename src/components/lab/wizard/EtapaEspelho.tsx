'use client'

// =============================================================================
// WIZARD DO LAB — ESPELHO COMPLETO (ISSUE-313, spec 4.1)
// "Deixa eu ver se entendi teu caso": manchete quantificada + prosa do caso.
// "Quase — deixa eu ajustar" volta SÓ à dimensão errada (spec) — as demais
// respostas nunca se perdem (critério de aceite).
// =============================================================================

import * as React from 'react'
import { motion } from 'framer-motion'

import { Button, Eyebrow } from '@/components/ds2'
import type { CamposClassificacao } from '@/lib/lab/types'
import {
  cenaParaArea,
  FLUENCIA_COMPORTAMENTAL,
  LABEL_OPCAO,
  mancheteBeneficio,
  montarEspelho,
} from '@/lib/lab/wizard-flow'
import { cn } from '@/lib/utils'

import type { RespostasParciais } from './dados'
import { descreverArsenal } from './dados'

interface EtapaEspelhoProps {
  respostas: RespostasParciais
  onConfirmar: () => void
  /** Pula pra etapa que captura o campo — e a conversa volta pra cá depois. */
  onAjustar: (campo: string) => void
}

export function EtapaEspelho({ respostas, onConfirmar, onAjustar }: EtapaEspelhoProps) {
  const [ajustando, setAjustando] = React.useState(false)

  // Nesta altura da conversa os campos de classificação existem por construção.
  const completo =
    respostas.entrega &&
    respostas.perda &&
    respostas.frequencia &&
    respostas.publico &&
    respostas.dado &&
    respostas.desejo &&
    respostas.conforto
  if (!completo) return null

  const espelho = montarEspelho({
    ...(respostas as CamposClassificacao),
    horas_semana: respostas.horas_semana,
    ambiente: respostas.ambiente,
  })

  const dimensoes: { campo: string; label: string; valor: string }[] = [
    ...(respostas.area
      ? [{ campo: 'area', label: 'área', valor: LABEL_OPCAO[respostas.area] }]
      : []),
    { campo: 'desejo', label: 'o ganho', valor: mancheteBeneficio(respostas.desejo!) },
    {
      campo: 'perda',
      label: 'a cena',
      valor: cenaParaArea(respostas.area ?? null, respostas.perda!),
    },
    { campo: 'entrega', label: 'o que sai', valor: LABEL_OPCAO[respostas.entrega!] },
    { campo: 'frequencia', label: 'frequência', valor: LABEL_OPCAO[respostas.frequencia!] },
    {
      campo: 'horas',
      label: 'horas/semana',
      valor: respostas.horas_semana ? `~${respostas.horas_semana}h` : 'não chutou',
    },
    { campo: 'dado', label: 'insumo', valor: LABEL_OPCAO[respostas.dado!] },
    { campo: 'publico', label: 'quem usa', valor: LABEL_OPCAO[respostas.publico!] },
    { campo: 'ambiente', label: 'arsenal', valor: descreverArsenal(respostas.ambiente) },
    {
      campo: 'conforto',
      label: 'teu momento com IA',
      valor: FLUENCIA_COMPORTAMENTAL[respostas.conforto!],
    },
  ]

  return (
    <div className="flex flex-col gap-5">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="rounded-ds2-panel border border-ds2-border-subtle bg-[rgba(46,104,96,0.13)] p-5"
      >
        <p className="font-ds2-serif text-2xl leading-snug font-medium tracking-[-0.02em] text-ds2-text-primary">
          {espelho.manchete}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ds2-text-secondary">{espelho.corpo}</p>
        <p className="mt-2 text-sm text-ds2-text-secondary">
          E tens à mão: <span className="text-ds2-text-primary">{descreverArsenal(respostas.ambiente)}</span>.
        </p>
      </motion.div>

      {!ajustando ? (
        <div className="flex flex-wrap gap-2.5">
          <Button onClick={onConfirmar}>É exatamente isso</Button>
          <Button variant="secondary" onClick={() => setAjustando(true)}>
            Quase — deixa eu ajustar
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <Eyebrow>toca no que saiu errado — o resto fica guardado</Eyebrow>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {dimensoes.map((dim) => (
              <button
                key={dim.campo}
                type="button"
                onClick={() => onAjustar(dim.campo)}
                className={cn(
                  'flex min-h-11 flex-col items-start rounded-ds2-card border border-ds2-border-subtle',
                  'bg-ds2-surface-glass px-4 py-2.5 text-left transition-colors hover:bg-ds2-surface-glass-hover',
                )}
              >
                <span className="font-ds2-mono text-[10px] tracking-[0.1em] text-ds2-text-muted uppercase">
                  {dim.label}
                </span>
                <span className="mt-0.5 line-clamp-1 text-sm text-ds2-text-secondary">
                  {dim.valor}
                </span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setAjustando(false)}
            className="min-h-11 self-start font-ds2-mono text-xs text-ds2-text-muted transition-colors hover:text-ds2-text-secondary"
          >
            ← na real, tava certo
          </button>
        </div>
      )}
    </div>
  )
}
