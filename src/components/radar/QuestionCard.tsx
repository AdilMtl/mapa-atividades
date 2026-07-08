'use client'

import { AnimatePresence, motion } from 'framer-motion'

import { Eyebrow, ModuleHead, Progress } from '@/components/ds2'
import type { RadarKind, RadarQuestion } from '@/lib/radar/types'

import { OptionButton } from './OptionButton'

interface QuestionCardProps {
  kind: RadarKind
  question: RadarQuestion
  questionNumber: number
  totalQuestions: number
  selectedOptionId: string | null
  onSelect: (optionId: string) => void
  onBack: () => void
  onContinue: () => void
  canGoBack: boolean
}

const TITULO_RADAR: Record<RadarKind, string> = {
  maturidade: 'Radar de Maturidade',
  oportunidades: 'Radar de Oportunidades',
}

export function QuestionCard({
  kind,
  question,
  questionNumber,
  totalQuestions,
  selectedOptionId,
  onSelect,
  onBack,
  onContinue,
  canGoBack,
}: QuestionCardProps) {
  const progresso = (questionNumber / totalQuestions) * 100
  const minutosRestantes = Math.max(1, Math.ceil(((totalQuestions - questionNumber + 1) * 15) / 60))

  return (
    <div>
      <ModuleHead>
        <span>{TITULO_RADAR[kind]}</span>
        <span>
          {questionNumber}/{totalQuestions}
        </span>
      </ModuleHead>

      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          <Eyebrow>
            Pergunta {questionNumber} de {totalQuestions}
          </Eyebrow>
          <h1 className="mt-2.5 mb-4 font-ds2-serif text-[21px] leading-[1.25] font-medium tracking-[-0.02em] text-ds2-text-primary">
            {question.text}
          </h1>

          <div className="flex flex-col gap-2">
            {question.options.map((option) => (
              <OptionButton
                key={option.id}
                label={option.label}
                selected={selectedOptionId === option.id}
                onSelect={() => onSelect(option.id)}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-5 flex items-center justify-between gap-3.5">
        <Progress value={progresso} className="flex-1" />
        <span className="font-ds2-mono text-xs whitespace-nowrap text-ds2-text-muted">
          ~{minutosRestantes} min
        </span>
      </div>

      <div className="mt-3 flex items-center gap-4">
        {canGoBack && (
          <button
            type="button"
            onClick={onBack}
            className="font-ds2-mono text-xs text-ds2-text-muted transition-colors hover:text-ds2-text-secondary"
          >
            ← Voltar
          </button>
        )}
        {selectedOptionId && (
          <button
            type="button"
            onClick={onContinue}
            className="font-ds2-mono text-xs text-ds2-amber-soft transition-colors hover:text-ds2-text-primary"
          >
            Continuar →
          </button>
        )}
      </div>
    </div>
  )
}
