'use client'

import { useEffect } from 'react'

import { track, type LabEventName } from '@/lib/analytics'

// Tracker de montagem pra páginas Server Component do Lab (ISSUE-318) — mesmo
// padrão do ObrigadoTracker. Dispara UMA vez por montagem; as props viajam no
// payload dos dois trilhos (dataLayer/GTM + radar_events via /api/radar/event).
// Nunca passar session_id aqui — a FK de radar_events aponta pra radar_sessions
// e um UUID do Lab nessa coluna perderia o evento em silêncio (ver lab-events.ts).
export function LabEventTracker({
  evento,
  props,
}: {
  evento: LabEventName
  props?: Record<string, string | number | boolean | null | undefined>
}) {
  useEffect(() => {
    track(evento, props)
    // Dispara só na montagem — mudar props em revisita da mesma página não é um evento novo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
