'use client'

// =============================================================================
// PÁGINA DO PROJETO — BLOCO 4: "O RESULTADO" (ISSUE-314D)
// O check-up da conclusão. Quando todas as fases da Caminhada fecham, este
// bloco assume o lugar do antigo botão seco "Concluir projeto":
//   perguntando → 3 perguntas de clique (mini-diagnóstico de resultado) +
//                 "Concluir projeto" (habilita com as 3 respondidas) +
//                 "fechar sem responder" (o check-up nunca trava a conclusão).
//   resultado   → a devolutiva personalizada + o resumo compartilhável.
// Todo o texto vem PRONTO do módulo puro `resultado.ts` (servidor recompõe a
// devolutiva na leitura). A UI só renderiza e coleta os cliques.
// ⚠️ COPY (enunciados/labels) pendente de veto do dono.
// =============================================================================

import * as React from 'react'
import { Check, Copy } from 'lucide-react'

import { Button, Card } from '@/components/ds2'
import { PERGUNTAS_RESULTADO } from '@/lib/lab/resultado'
import type { DevolutivaResultado } from '@/lib/lab/resultado'
import type { ResultadoRespostas } from '@/lib/lab/types'
import { cn } from '@/lib/utils'

interface BlocoResultadoProps {
  modo: 'perguntando' | 'resultado'
  /** perguntando: envia as 3 respostas e conclui. */
  onConcluir: (respostas: ResultadoRespostas) => void
  /** perguntando: conclui sem check-up (o gate nunca é obrigatório). */
  onPular: () => void
  concluindo: boolean
  /** resultado: devolutiva já composta + texto copiável. */
  devolutiva: DevolutivaResultado | null
  compartilhavel: string | null
}

/** Botão de opção — 1 toque, alvo ≥44px, seleção visível (padrão do wizard). */
function OpcaoBotao({
  label,
  selecionado,
  onEscolher,
}: {
  label: string
  selecionado: boolean
  onEscolher: () => void
}) {
  return (
    <button
      type="button"
      onClick={onEscolher}
      aria-pressed={selecionado}
      className={cn(
        'flex min-h-11 w-full items-center rounded-ds2-card border px-4 py-3 text-left text-sm transition-colors',
        selecionado
          ? 'border-ds2-orange/50 bg-[rgba(217,119,6,0.12)] font-medium text-ds2-text-primary'
          : 'border-ds2-border-subtle bg-ds2-surface-glass text-ds2-text-secondary hover:bg-ds2-surface-glass-hover',
      )}
    >
      {label}
    </button>
  )
}

/** O resumo copiável — mesmo padrão de "copiar prompt" da Caminhada. */
function BotaoCompartilhar({ texto }: { texto: string }) {
  const [copiado, setCopiado] = React.useState(false)

  const copiar = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2200)
    } catch {
      // Sem permissão de clipboard: o <pre> abaixo mostra o texto pra seleção manual.
    }
  }, [texto])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="font-ds2-mono text-[11px] tracking-[0.13em] text-ds2-amber-soft uppercase">
          Pra compartilhar
        </p>
        <Button
          type="button"
          variant="secondary"
          onClick={copiar}
          className={cn('py-2.5 text-xs', copiado && 'border-ds2-orange/50')}
        >
          {copiado ? (
            <>
              <Check className="h-4 w-4" /> copiado
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" /> copiar resumo
            </>
          )}
        </Button>
      </div>
      <pre className="max-h-72 overflow-y-auto rounded-[14px] border border-ds2-border-subtle bg-black/20 p-4 text-sm leading-relaxed whitespace-pre-wrap text-ds2-text-secondary">
        {texto}
      </pre>
    </div>
  )
}

export function BlocoResultado({
  modo,
  onConcluir,
  onPular,
  concluindo,
  devolutiva,
  compartilhavel,
}: BlocoResultadoProps) {
  const [respostas, setRespostas] = React.useState<Partial<ResultadoRespostas>>({})

  const escolher = React.useCallback((campo: keyof ResultadoRespostas, id: string) => {
    setRespostas((atual) => ({ ...atual, [campo]: id }))
  }, [])

  const completo =
    respostas.chegou !== undefined &&
    respostas.comparado !== undefined &&
    respostas.proximo !== undefined

  // ---- Modo resultado: a devolutiva personalizada + compartilhar ----
  if (modo === 'resultado') {
    if (!devolutiva) return null
    return (
      <section className="space-y-4" aria-label="O resultado">
        <p className="text-base text-ds2-text-secondary">O que ficou desse projeto.</p>
        <Card className="max-w-3xl space-y-3 border-ds2-orange/25">
          <h3 className="font-ds2-serif text-xl font-medium text-ds2-text-primary">
            {devolutiva.headline}
          </h3>
          <p className="text-sm leading-relaxed text-ds2-text-secondary">{devolutiva.nuance}</p>
          <p className="text-sm leading-relaxed text-ds2-amber-soft">{devolutiva.proximoPasso}</p>
        </Card>
        {compartilhavel && <BotaoCompartilhar texto={compartilhavel} />}
      </section>
    )
  }

  // ---- Modo perguntando: o mini-diagnóstico antes de fechar ----
  return (
    <section className="space-y-4" aria-label="Antes de concluir">
      <div className="max-w-3xl space-y-2">
        <p className="text-base text-ds2-text-secondary">
          Você fechou todas as fases. Antes de eu guardar esse projeto como concluído — me conta
          rapidinho como foi. É o que transforma o plano num resultado de verdade.
        </p>
      </div>

      <Card className="max-w-3xl space-y-6">
        {PERGUNTAS_RESULTADO.map((pergunta) => (
          <fieldset key={pergunta.campo} className="space-y-2">
            <legend className="mb-1 text-sm font-medium text-ds2-text-primary">
              {pergunta.enunciado}
            </legend>
            <div className="space-y-2">
              {pergunta.opcoes.map((opcao) => (
                <OpcaoBotao
                  key={opcao.id}
                  label={opcao.label}
                  selecionado={respostas[pergunta.campo] === opcao.id}
                  onEscolher={() => escolher(pergunta.campo, opcao.id)}
                />
              ))}
            </div>
          </fieldset>
        ))}

        <div className="flex flex-wrap items-center gap-4">
          <Button
            type="button"
            onClick={() => completo && onConcluir(respostas as ResultadoRespostas)}
            disabled={!completo || concluindo}
          >
            {concluindo ? 'Concluindo…' : 'Concluir projeto'}
          </Button>
          <button
            type="button"
            onClick={onPular}
            disabled={concluindo}
            className="min-h-11 text-sm text-ds2-text-muted underline underline-offset-2 hover:text-ds2-text-secondary"
          >
            fechar sem responder
          </button>
        </div>
      </Card>
    </section>
  )
}
