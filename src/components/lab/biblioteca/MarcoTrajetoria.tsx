// =============================================================================
// MARCO DE TRAJETÓRIA (ISSUE-316, Fatia B)
// Abre com 3 projetos TERMINADOS — não com 3 tipos, e nunca pelo wizard
// (anti-Goodhart: o prêmio exige entrega real). Fica ACIMA da trilha, não no
// fim dela: o dono rejeitou a lógica de "cume" porque a trilha não fecha linear
// e prêmio no fim daria sensação errada com os vãos em branco (§6.8).
// Trancado, mostra a contagem real — a pessoa sabe o que falta, e o que falta
// não é farmável. Visual: card premium do DS2 (magenta), receita §3.2.
// =============================================================================

import Link from 'next/link'
import { ArrowRight, Lock, Trophy } from 'lucide-react'

import type { MarcoView } from '@/lib/lab/valor'

export function MarcoTrajetoria({ marco }: { marco: MarcoView }) {
  return (
    <section className="relative overflow-hidden rounded-ds2-panel border border-ds2-magenta/25 bg-[linear-gradient(145deg,rgba(211,76,117,0.10),rgba(255,255,255,0.04))] p-6 md:p-8">
      <p className="flex items-center gap-2 font-ds2-mono text-xs tracking-[0.13em] text-ds2-magenta uppercase">
        <Trophy className="h-3.5 w-3.5" /> marco de trajetória
      </p>

      <h2 className="mt-3 font-ds2-serif text-2xl font-medium tracking-[-0.03em] text-ds2-text-primary md:text-3xl">
        {marco.titulo}
      </h2>

      {marco.aberto ? (
        <>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ds2-text-secondary">
            Três projetos terminados. Com três isso já virou um hábito — e é hora de falar do que
            você faz com o que já construiu.
          </p>
          <Link
            href="/lab/biblioteca/marco-trajetoria"
            className="mt-5 inline-flex min-h-11 items-center gap-1.5 rounded-full bg-ds2-orange px-4 py-2 font-ds2-sans text-sm font-bold text-[#1E1005] transition-colors hover:bg-[linear-gradient(90deg,#D97706,#D34C75)]"
          >
            Abrir o marco <ArrowRight className="h-4 w-4" />
          </Link>
        </>
      ) : (
        <>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ds2-text-secondary">
            Um projeto pode ser sorte. O marco abre quando terminar o terceiro — porque aí deixou de
            ser aquela vez em que você sentou num sábado e fez uma parada, e virou o teu jeito de
            resolver problema.
          </p>
          <p className="mt-4 flex items-center gap-2 font-ds2-mono text-[11px] tracking-[0.08em] text-ds2-text-subtle uppercase">
            <Lock className="h-3 w-3" />
            {marco.terminados} de 3 terminados · faltam {marco.faltam}
          </p>
        </>
      )}
    </section>
  )
}
