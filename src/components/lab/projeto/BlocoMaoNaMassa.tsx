'use client'

// =============================================================================
// PÁGINA DO PROJETO — BLOCO 4: "MÃO NA MASSA" (ISSUE-314 + 314B)
// O guia âncora do tipo + o primeiro prompt, prontos pra copiar. A 314B fecha
// o ciclo que o dono sentiu aberto no teste: a pessoa copia o prompt, executa
// "do outro lado" (na IA dela) e volta — e agora marca a etapa AQUI MESMO,
// sem rolar de volta pro checklist. Marcar daqui dispara o mesmo onToggle do
// plano (estado único, otimista) e o orquestrador rola até a próxima etapa.
// =============================================================================

import * as React from 'react'
import { Check, Copy } from 'lucide-react'

import { Button, Card } from '@/components/ds2'
import type { EtapaAtualInfo } from '@/lib/lab/continuidade'
import type { Guia } from '@/lib/lab/materiais'
import { cn } from '@/lib/utils'

interface BlocoMaoNaMassaProps {
  guia: Guia
  prompt: string
  /** Etapa em que a pessoa está (null = tudo marcado ou plano vazio). */
  etapaAtual: EtapaAtualInfo | null
  /** Marca a etapa atual como feita a partir daqui (ISSUE-314B). */
  onMarcarEtapa: (id: string) => void
  marcando: boolean
  /** Tudo marcado mas ainda não concluído → aponta pro botão lá em cima. */
  aguardandoConclusao: boolean
}

export function BlocoMaoNaMassa({
  guia,
  prompt,
  etapaAtual,
  onMarcarEtapa,
  marcando,
  aguardandoConclusao,
}: BlocoMaoNaMassaProps) {
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
          Cola isso na tua IA — e volta aqui pra marcar a etapa quando terminar.
        </p>
      </Card>

      {/* O fecho do ciclo (ISSUE-314B): executou do outro lado, marca daqui. */}
      {etapaAtual && (
        <Card className="max-w-3xl space-y-3 border-ds2-orange/25">
          <p className="text-sm leading-relaxed text-ds2-text-secondary">
            Executou aí do outro lado? Então marca aqui mesmo, sem caçar o checklist lá em cima:
          </p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-ds2-sans text-sm font-semibold text-ds2-text-primary">
              <span className="font-ds2-mono text-xs font-normal text-ds2-text-muted">
                {String(etapaAtual.indice + 1).padStart(2, '0')}
              </span>{' '}
              {etapaAtual.titulo}
            </p>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onMarcarEtapa(etapaAtual.id)}
              disabled={marcando}
              className="py-2.5 text-xs"
            >
              <Check className="h-4 w-4" /> {marcando ? 'salvando…' : 'fiz essa etapa'}
            </Button>
          </div>
        </Card>
      )}

      {aguardandoConclusao && (
        <p className="max-w-3xl text-sm leading-relaxed text-ds2-text-secondary">
          Tudo marcado por aqui — falta só o &quot;Concluir projeto&quot;, ali em cima no plano.
        </p>
      )}
    </section>
  )
}
