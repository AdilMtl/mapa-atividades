'use client'

// =============================================================================
// BLOCO "PRA COPIAR" (ISSUE-316, Fatia B)
// As caixas de copiar são o que faz a pessoa LEVAR o conteúdo pra rotina dela
// (pedido explícito do dono: "coloca um copy paste, alguma coisa pra ela levar").
// Sem botão de copiar de verdade, isso vira decoração — então o botão existe.
// Zero dependência nova: navigator.clipboard + fallback silencioso.
// =============================================================================

import * as React from 'react'
import { Check, Copy } from 'lucide-react'

import { cn } from '@/lib/utils'

export function BlocoCopiar({ texto, nota }: { texto: string; nota?: string }) {
  const [copiado, setCopiado] = React.useState(false)

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(true)
      window.setTimeout(() => setCopiado(false), 2000)
    } catch {
      // Clipboard bloqueado (http, permissão negada): o texto está visível na
      // tela e é selecionável — a pessoa copia na mão. Nada quebra.
    }
  }

  return (
    <div className="space-y-2">
      <div className="relative overflow-hidden rounded-ds2-card border border-ds2-border-medium bg-ds2-surface-glass">
        <div className="flex items-center justify-between gap-3 border-b border-ds2-border-subtle px-4 py-2">
          <span className="font-ds2-mono text-[10px] tracking-[0.1em] text-ds2-text-muted uppercase">
            pra copiar
          </span>
          <button
            type="button"
            onClick={copiar}
            className={cn(
              'inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 font-ds2-mono text-[11px] tracking-[0.06em] transition-colors',
              copiado
                ? 'text-ds2-orange'
                : 'text-ds2-text-secondary hover:text-ds2-text-primary',
            )}
            aria-live="polite"
          >
            {copiado ? (
              <>
                <Check className="h-3.5 w-3.5" /> copiado
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" /> copiar
              </>
            )}
          </button>
        </div>
        <pre className="overflow-x-auto px-4 py-3 font-ds2-mono text-[12px] leading-relaxed whitespace-pre-wrap text-ds2-text-secondary">
          {texto}
        </pre>
      </div>
      {nota && <p className="text-[13px] leading-relaxed text-ds2-text-muted italic">{nota}</p>}
    </div>
  )
}
