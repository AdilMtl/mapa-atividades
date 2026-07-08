import type { Metadata } from 'next'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { RadarFlow } from '@/components/radar'
import { PageContainer } from '@/components/ds2'

export const metadata: Metadata = {
  title: 'Radar de Maturidade em IA — +ConverSaaS',
  description:
    'Descubra em poucos minutos seu nível de fluência em IA no trabalho — de Curioso a Referência. Grátis, sem e-mail.',
}

export default function RadarMaturidadePage() {
  return (
    <div className="ds2-bg-ambient min-h-screen py-8 md:py-10">
      <PageContainer className="pb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-ds2-mono text-xs text-ds2-text-secondary transition-colors hover:text-ds2-text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> +ConverSaaS
        </Link>
      </PageContainer>
      <PageContainer>
        <RadarFlow kind="maturidade" />
      </PageContainer>
    </div>
  )
}
