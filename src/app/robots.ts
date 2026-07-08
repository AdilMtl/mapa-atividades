import type { MetadataRoute } from 'next'

import { SITE_URL } from '@/lib/site-config'

// Bloqueia a plataforma logada e as rotas de API; deixa o resto público
// crawleável (ISSUE-110). /pre-diagnostico fica de fora da lista por decisão —
// segue ativo para campanhas pagas, mas ninguém mexe no código/config dele.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/dashboard',
        '/diagnostico',
        '/plano-acao',
        '/painel-semanal',
        '/relatorios',
        '/perfil',
        '/configuracoes',
        '/privacidade',
        '/reset-password',
        '/admin',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
