// Lista canônica dos eventos de analytics do funil de radares: os 15 do doc operacional §21
// (ISSUE-109) + os 4 da otimização de conversão da home (ISSUE-111.1). Módulo neutro (sem
// 'use client') de propósito: é importado tanto pelo helper client-side (src/lib/analytics.ts)
// quanto pela rota de API server-side (src/app/api/radar/event/route.ts) — importar um array
// de um módulo 'use client' dentro de uma rota vira uma referência de client component no
// bundle do servidor, não o valor real.

export const RADAR_EVENT_NAMES = [
  'hero_cta_opportunities_clicked',
  'hero_cta_maturity_clicked',
  'newsletter_cta_clicked',
  'maturity_assessment_started',
  'maturity_assessment_completed',
  'opportunity_radar_started',
  'opportunity_radar_completed',
  'email_capture_viewed',
  'email_submitted',
  'result_preview_viewed',
  'result_full_requested',
  'recommended_article_clicked',
  'premium_interest_clicked',
  'premium_waitlist_submitted',
  'thank_you_page_viewed',
  // ISSUE-111.1 — seção de fechamento da home + embed do Substack. Eventos novos exigem
  // tag/trigger correspondente no GTM (operação do dono — ver spec no CURRENT-STATUS).
  'closing_cta_opportunities_clicked',
  'closing_cta_maturity_clicked',
  'closing_newsletter_clicked',
  'newsletter_embed_viewed',
] as const

export type RadarEventName = (typeof RADAR_EVENT_NAMES)[number]
