'use client'

// =============================================================================
// PÁGINA DO PROJETO — BLOCO 4: "MÃO NA MASSA" (ISSUE-314)
// O guia âncora do tipo + o primeiro prompt, prontos pra copiar. Resposta
// direta ao "e como eu faço isso na prática?" — sem depender da biblioteca
// (316), que ainda não existe: o conteúdo mora aqui (spec §3, Bloco 4).
// =============================================================================

import * as React from 'react'
import { Check, Copy } from 'lucide-react'

import { Button, Card } from '@/components/ds2'
import type { Guia } from '@/lib/lab/materiais'
import { cn } from '@/lib/utils'

export function BlocoMaoNaMassa({ guia, prompt }: { guia: Guia; prompt: string }) {
  const [copiado, setCopiado] = React.useState(false)

  const copiar = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2200)
    } catch {
      // Sem permissão de clipboard (raro): a pessoa ainda consegue selecionar
      // o texto manualmente — o <pre> abaixo já mostra o prompt inteiro.
    }
  }, [prompt])

  return (
    <section className="space-y-4" aria-label="Mão na massa">
      <p className="text-base text-ds2-text-secondary">
        Plano bom é plano que sai do papel. Então eu já deixei teu primeiro passo pronto.
      </p>

      <Card className="max-w-3xl space-y-3">
        <h2 className="font-ds2-serif text-xl font-medium text-ds2-text-primary">{guia.titulo}</h2>
        {guia.paragrafos.map((p, i) => (
          <p key={i} className="text-sm leading-relaxed text-ds2-text-secondary">
            {p}
          </p>
        ))}
      </Card>

      <Card className="max-w-3xl space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="font-ds2-mono text-[11px] tracking-[0.13em] text-ds2-amber-soft uppercase">
            Teu primeiro prompt
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
                <Copy className="h-4 w-4" /> copiar prompt
              </>
            )}
          </Button>
        </div>
        <pre className="max-h-96 overflow-y-auto rounded-[14px] border border-ds2-border-subtle bg-black/20 p-4 text-sm leading-relaxed whitespace-pre-wrap text-ds2-text-secondary">
          {prompt}
        </pre>
        <p className="text-xs text-ds2-text-muted">
          Cola isso na tua IA — {' '}
          {/* a ferramenta já está resolvida DENTRO do texto do prompt quando faz sentido (ex.: dashboard) */}
          e volta aqui pra marcar a etapa quando terminar.
        </p>
      </Card>
    </section>
  )
}
