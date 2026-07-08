import type { Metadata } from 'next'

import { PageContainer } from '@/components/ds2'
import {
  AutorSection,
  ComoFuncionaSection,
  DiferenciacaoSection,
  HeroSection,
  LabSection,
  NewsletterSection,
  PlataformaDemoSection,
  PortasSection,
  PricingSection,
  ProblemaSection,
  ReframeSection,
} from '@/components/home'
import { PublicFooter, PublicHeader, PWAInstallBanner } from '@/components/shared'

export const metadata: Metadata = {
  title: '+ConverSaaS — Descubra o que você poderia construir com IA no seu trabalho',
  description:
    'IA aplicada ao trabalho real, sem hype. Dois radares gratuitos com resultado na hora: descubra seu nível de fluência em IA e onde ela pode virar prompt, automação, dashboard ou app na sua rotina.',
}

// Home reposicionada (ISSUE-107) — substitui a landing de produtividade, spec
// pixel-a-pixel em docs/revamp/mockups/landing-preview-final.html.
export default function HomePage() {
  return (
    <div className="ds2-bg-ambient min-h-screen">
      <PublicHeader />
      <PageContainer className="space-y-12 pb-16 pt-4">
        <HeroSection />
        <ProblemaSection />
        <ReframeSection />
        <PortasSection />
        <ComoFuncionaSection />
        <PlataformaDemoSection />
        <NewsletterSection />
        <DiferenciacaoSection />
        <PricingSection />
        <LabSection />
        <AutorSection />
      </PageContainer>
      <PublicFooter />
      <PWAInstallBanner />
    </div>
  )
}
