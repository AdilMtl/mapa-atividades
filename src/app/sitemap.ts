import type { MetadataRoute } from 'next'

import { SITE_URL } from '@/lib/site-config'

// Rotas públicas indexáveis (ISSUE-110). Fora daqui, de propósito:
// /auth (transacional, não é conteúdo), /obrigado (pós-conversão, robots noindex),
// /pre-diagnostico (backstage — ninguém toca no código dele, decisão registrada em
// docs/revamp/00b_open_questions.md pergunta 6) e tudo do grupo (app) (privado).
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return [
    { url: SITE_URL, lastModified, changeFrequency: 'weekly', priority: 1 },
    {
      url: `${SITE_URL}/radar/maturidade`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/radar/oportunidades`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    { url: `${SITE_URL}/newsletter`, lastModified, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/lab`, lastModified, changeFrequency: 'monthly', priority: 0.5 },
  ]
}
