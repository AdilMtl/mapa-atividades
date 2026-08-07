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
import { LAB_EVENT_NAMES, type LabEventName } from './lab-events'

export { RADAR_EVENT_NAMES, LAB_EVENT_NAMES }
export type { RadarEventName, LabEventName }

// ISSUE-318: o helper atende os dois vocabulários — funil público (radar_*) e Lab (lab_*).
// Eventos lab_* nunca passam session_id (FK de radar_events aponta pra radar_sessions);
// o project_id viaja como propriedade comum do payload.
export type TrackedEventName = RadarEventName | LabEventName

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
export function track(event: TrackedEventName, props: RadarEventProps = {}): void {
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

const PAGEVIEW_STORAGE_PREFIX = 'conversaas.pv.'

/**
 * Pageview in-house das rotas de ENTRADA do funil (ISSUE-318C).
 *
 * Trilho ÚNICO (Supabase), de propósito — exceção declarada ao duplo trilho: o
 * GA4 já conta pageview nativamente via GTM, e empurrar um segundo sinal de
 * pageview no dataLayer do container que carrega a conversão do Ads é risco sem
 * benefício (07_mapa_tracking_ads.md). Nenhuma operação no GTM decorre daqui.
 *
 * Dedupe por rota por sessão de navegador (sessionStorage): é contagem de
 * visita, não de hit — recarregar a página não infla o topo do funil. Se o
 * sessionStorage estiver indisponível (modo privado), registra sem dedupe:
 * melhor contar a mais ali do que perder o topo inteiro.
 */
export function registrarPageview(): void {
  if (typeof window === 'undefined') return
  // Idempotente — garante a UTM no payload mesmo se este efeito rodar antes do
  // CapturaUtm do layout (ordem de efeitos entre componentes não é contratual).
  capturarUtm()
  const path = window.location.pathname
  try {
    const chave = PAGEVIEW_STORAGE_PREFIX + path
    if (window.sessionStorage.getItem(chave)) return
    window.sessionStorage.setItem(chave, '1')
  } catch {
    // segue sem dedupe
  }
  enviarParaSupabase('page_viewed', { ...lerUtm(), entry_path: path }, null)
}

function enviarParaSupabase(event: TrackedEventName, payload: RadarEventProps, sessionId: string | null): void {
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
