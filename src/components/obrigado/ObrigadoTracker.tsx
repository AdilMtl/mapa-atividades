'use client'

import { useEffect } from 'react'

import { track } from '@/lib/analytics'

// Dispara o único evento pendente da ISSUE-109 que dependia desta página existir
// (ver docs/revamp/04_issue_backlog.md, ISSUE-109). Sem sessão de radar associada —
// esta página é standalone, não há redirecionamento automático dos radares até uma
// issue futura decidir essa ligação.
export function ObrigadoTracker() {
  useEffect(() => {
    track('thank_you_page_viewed')
  }, [])

  return null
}
