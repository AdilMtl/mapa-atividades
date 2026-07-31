import { FeedbackWidget } from '@/components/feedback/FeedbackWidget'

// Layout do grupo (publico) criado na ISSUE-318D só para montar o widget de
// feedback nas páginas públicas. O grupo não tinha layout até aqui — é por isso
// que ele existe: o layout RAIZ carrega o GTM e não pode ser tocado
// (docs/revamp/07_mapa_tracking_ads.md). Sem metadata própria de propósito:
// cada página segue definindo a sua.

export default function PublicoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <FeedbackWidget />
    </>
  )
}
