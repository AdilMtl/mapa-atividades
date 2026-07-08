// =============================================================================
// ANALYTICS DO FUNIL NOVO — ISSUE-109
// Duplo trilho (doc 00b, premissa 8; `02_technical_spec.md` §3.7): todo evento
// vira (1) dataLayer.push (GTM → GA4, tags criadas pelo dono na UI do GTM) e
// (2) POST /api/radar/event (grava em radar_events, schema da ISSUE-106).
// Nomes de evento e propriedades são LITERAIS do doc operacional §21 — não
// "quase iguais". Não toca no disparo de conversão do EmailGate (07_mapa_tracking_ads.md).
// =============================================================================

'use client'

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[]
  }
}

import { RADAR_EVENT_NAMES, type RadarEventName } from './radar-events'

export { RADAR_EVENT_NAMES }
export type { RadarEventName }

export type RadarEventProps = Record<string, string | number | boolean | null | undefined>

const UTM_STORAGE_KEY = 'conversaas.utm'
const UTM_PARAM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const

type UtmParams = Partial<Record<(typeof UTM_PARAM_KEYS)[number], string>>

/**
 * Captura UTMs da URL no primeiro pageview e guarda em sessionStorage (doc `02` §3.7).
 * Chamar uma vez ao montar uma página pública nova. Idempotente: se não há UTM na URL,
 * não sobrescreve o que já estava guardado (preserva a origem da sessão).
 */
export function capturarUtm(): void {
  if (typeof window === 'undefined') return
  try {
    const params = new URLSearchParams(window.location.search)
    const encontrados: UtmParams = {}
    for (const key of UTM_PARAM_KEYS) {
      const valor = params.get(key)
      if (valor) encontrados[key] = valor
    }
    if (Object.keys(encontrados).length > 0) {
      window.sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(encontrados))
    }
  } catch {
    // sessionStorage indisponível (modo privado etc.) — eventos seguem sem UTM.
  }
}

export function lerUtm(): UtmParams {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.sessionStorage.getItem(UTM_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as UtmParams) : {}
  } catch {
    return {}
  }
}

/**
 * Dispara um evento nos dois trilhos. Nunca bloqueia navegação: falhas de rede
 * são engolidas silenciosamente (analytics não pode derrubar o fluxo do usuário).
 * `session_id` é reservado: só viaja no trilho Supabase (coluna própria em radar_events),
 * nunca vira dimensão do dataLayer/GA4.
 */
export function track(event: RadarEventName, props: RadarEventProps = {}): void {
  if (typeof window === 'undefined') return

  const { session_id, ...resto } = props as RadarEventProps & { session_id?: string | null }
  const payload: RadarEventProps = {
    ...lerUtm(),
    entry_path: window.location.pathname,
    ...resto,
  }
  const sessionId = typeof session_id === 'string' ? session_id : null

  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ event, ...payload })

  enviarParaSupabase(event, payload, sessionId)
}

function enviarParaSupabase(event: RadarEventName, payload: RadarEventProps, sessionId: string | null): void {
  try {
    const body = JSON.stringify({
      eventName: event,
      sessionId,
      pageUrl: window.location.pathname,
      payload,
    })

    if (typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([body], { type: 'application/json' })
      const enviado = navigator.sendBeacon('/api/radar/event', blob)
      if (enviado) return
    }

    void fetch('/api/radar/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {})
  } catch {
    // Analytics nunca impede o fluxo do usuário.
  }
}
