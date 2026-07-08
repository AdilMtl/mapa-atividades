import type { Metadata } from 'next'

import { PageContainer } from '@/components/ds2'
import {
  AutorSection,
  ComoFuncionaSection,
  DiferenciacaoSection,
  FechamentoSection,
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
import { SITE_NAME, SITE_URL } from '@/lib/site-config'

export const metadata: Metadata = {
  title: '+ConverSaaS — Descubra o que você poderia construir com IA no seu trabalho',
  description:
    'IA aplicada ao trabalho real, sem hype. Dois radares gratuitos com resultado na hora: descubra seu nível de fluência em IA e onde ela pode virar prompt, automação, dashboard ou app na sua rotina.',
}

// JSON-LD WebSite (ISSUE-110) — schema básico, sem SearchAction (o site não tem busca interna).
const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  alternateName: 'Conversas no Corredor',
  url: SITE_URL,
  description:
    'O ecossistema virtual da newsletter Conversas no Corredor: radares de maturidade e oportunidades em IA, para profissionais que querem descobrir onde aplicar IA no trabalho real.',
}

// Home reposicionada (ISSUE-107) — substitui a landing de produtividade, spec
// pixel-a-pixel em docs/revamp/mockups/landing-preview-final.html.
export default function HomePage() {
  return (
    <div className="ds2-bg-ambient min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <PublicHeader />
      <PageContainer className="space-y-12 pb-16 pt-4">
        {/* Ordem ISSUE-111.1: Newsletter sobe (oferta cedo p/ quem não vai testar agora),
            Demo desce, Fechamento novo encerra a página pedindo ação. */}
        <HeroSection />
        <ProblemaSection />
        <ReframeSection />
        <PortasSection />
        <ComoFuncionaSection />
        <NewsletterSection />
        <PlataformaDemoSection />
        <DiferenciacaoSection />
        <PricingSection />
        <LabSection />
        <AutorSection />
        <FechamentoSection />
      </PageContainer>
      <PublicFooter />
      <PWAInstallBanner />
    </div>
  )
}
