'use client'

// =============================================================================
// PÁGINA DO PROJETO — ECO MANUSCRITO (ISSUE-314)
// O manuscrito (Caveat) é COADJUVANTE aqui — diferente do wizard (313), onde é
// protagonista. No máximo 3 aparições na página inteira (spec §3, Bloco 1):
// uma citação do relato ou a frase das horas. Documento em volta é DS2 limpo.
// =============================================================================

import { CheckDesenhado } from '@/components/lab/wizard/IconesAnimados'
import { cn } from '@/lib/utils'

export function ManuscritoEco({ texto, className }: { texto: string; className?: string }) {
  return (
    <p
      className={cn(
        'flex items-start gap-2 text-[19px] leading-snug text-ds2-amber-soft',
        className,
      )}
      style={{ fontFamily: 'var(--font-nota), cursive' }}
    >
      <CheckDesenhado className="mt-1.5 h-3.5 w-3.5 shrink-0 text-ds2-orange/80" />
      <span>{texto}</span>
    </p>
  )
}
