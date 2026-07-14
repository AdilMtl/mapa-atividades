// =============================================================================
// A ESTANTE (ISSUE-316, Fatia B)
// Pedido do dono: "caprichar na UX/UI, dar esse aspecto de livros mesmo, deixar
// evidente que aquilo adiciona valor pro usuário".
//
// A trilha responde "pra onde eu vou". A estante responde "o que eu JÁ GANHEI" —
// e é ela que torna o valor evidente: cada tipo desbloqueado vira um volume de
// Construção, e o ramo de valor daquele projeto vira um segundo volume ao lado.
// Estante vazia não aparece (não se mostra prateleira vazia pra quem não tem
// livro — mostrar isso seria só lembrar a pessoa do que ela não tem).
//
// Visual dentro do DS2 (nada de emoji como ícone, nada de neon, raios da §4):
// lombada colorida à esquerda, numeração mono no topo, título em Fraunces, e
// uma linha de prateleira embaixo da fileira.
// =============================================================================

import Link from 'next/link'
import { ArrowUpRight, BookOpen, Sprout } from 'lucide-react'

import type { NoTrilha } from '@/lib/lab/trilha'
import { cn } from '@/lib/utils'

interface Volume {
  slug: string
  eyebrow: string
  titulo: string
  legenda: string
  tom: 'construcao' | 'valor'
}

export function Estante({ nos }: { nos: NoTrilha[] }) {
  const desbloqueados = nos.filter((no) => no.temRamoValor)
  if (desbloqueados.length === 0) return null

  const volumes: Volume[] = desbloqueados.flatMap((no, i) => [
    {
      slug: no.slug,
      eyebrow: `${String(i + 1).padStart(2, '0')} / construção`,
      titulo: no.nome,
      legenda: 'o guia de como construir',
      tom: 'construcao' as const,
    },
    {
      slug: no.slugRamo,
      eyebrow: `${String(i + 1).padStart(2, '0')} / valor`,
      titulo: `${no.nome}: colher o retorno`,
      legenda: 'o que fazer depois de entregar',
      tom: 'valor' as const,
    },
  ])

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="flex items-center gap-2 font-ds2-mono text-xs tracking-[0.13em] text-ds2-amber-soft uppercase">
          <BookOpen className="h-3.5 w-3.5" /> a tua estante
        </p>
        <p className="font-ds2-mono text-[11px] tracking-[0.06em] text-ds2-text-muted">
          {volumes.length} {volumes.length === 1 ? 'volume aberto' : 'volumes abertos'}
        </p>
      </div>

      <div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {volumes.map((volume) => (
            <Livro key={volume.slug} volume={volume} />
          ))}
        </div>
        {/* A prateleira: a linha que sustenta os livros */}
        <div className="mt-0 h-[3px] rounded-full bg-[linear-gradient(90deg,rgba(255,255,255,0.14),rgba(255,255,255,0.04))]" />
      </div>
    </section>
  )
}

function Livro({ volume }: { volume: Volume }) {
  const ehValor = volume.tom === 'valor'

  return (
    <Link
      href={`/lab/biblioteca/${volume.slug}`}
      className={cn(
        'group relative flex min-h-[168px] flex-col justify-between overflow-hidden rounded-ds2-card border p-4 pl-5 transition-colors',
        ehValor
          ? 'border-ds2-magenta/25 bg-[linear-gradient(145deg,rgba(211,76,117,0.10),rgba(255,255,255,0.04))] hover:border-ds2-magenta/40'
          : 'border-ds2-border-subtle bg-ds2-surface-glass hover:border-ds2-border-medium hover:bg-ds2-surface-glass-hover',
      )}
    >
      {/* A lombada do livro */}
      <span
        aria-hidden
        className={cn(
          'absolute inset-y-0 left-0 w-[6px]',
          ehValor ? 'bg-ds2-magenta/70' : 'bg-ds2-orange/70',
        )}
      />

      <div>
        <p className="font-ds2-mono text-[10px] tracking-[0.1em] text-ds2-text-muted uppercase">
          {volume.eyebrow}
        </p>
        <h3 className="mt-3 font-ds2-serif text-lg leading-tight font-medium tracking-[-0.03em] text-ds2-text-primary">
          {volume.titulo}
        </h3>
      </div>

      <div className="flex items-end justify-between gap-2">
        <p className="text-[12px] leading-snug text-ds2-text-muted">{volume.legenda}</p>
        {ehValor ? (
          <Sprout className="h-4 w-4 shrink-0 text-ds2-magenta" />
        ) : (
          <ArrowUpRight className="h-4 w-4 shrink-0 text-ds2-text-muted transition-colors group-hover:text-ds2-text-primary" />
        )}
      </div>
    </Link>
  )
}
