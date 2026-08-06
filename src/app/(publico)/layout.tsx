import { CapturaUtm } from '@/components/analytics/CapturaUtm'
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget'

// Layout do grupo (publico) criado na ISSUE-318D só para montar o widget de
// feedback nas páginas públicas. O grupo não tinha layout até aqui — é por isso
// que ele existe: o layout RAIZ carrega o GTM e não pode ser tocado
// (docs/revamp/07_mapa_tracking_ads.md). Sem metadata própria de propósito:
// cada página segue definindo a sua.
//
// O CapturaUtm entrou aqui em 2026-08-06 pelo mesmo motivo estrutural: é o único
// ponto que cobre TODA entrada pública (home inclusive), e a UTM do anúncio chega
// na home, não na página do radar. Detalhes no próprio componente.

export default function PublicoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CapturaUtm />
      {children}
      <FeedbackWidget />
    </>
  )
}
