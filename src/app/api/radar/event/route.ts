// ═══════════════════════════════════════════════════════════════════
// 📊 API: EVENTOS DE ANALYTICS DOS RADARES — ISSUE-109
// ═══════════════════════════════════════════════════════════════════
// POST /api/radar/event — grava em radar_events (schema criado na ISSUE-106).
// Chamada via sendBeacon/fetch pelo helper src/lib/analytics.ts.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { RADAR_EVENT_NAMES } from '@/lib/radar-events'

// Client de service_role: radar_events só concede acesso a service_role (RLS travada).
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Máximo de eventos pelo mesmo IP na janela abaixo antes de bloquear (anti-bot simples,
// mesmo padrão de api/radar/session e api/radar/lead). Mais generoso que os outros dois
// porque um único fluxo de radar dispara vários eventos legítimos.
const RATE_LIMIT_MAX_EVENTS = 120
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hora

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

function isValidUuid(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventName, sessionId, pageUrl, payload } = body ?? {}

    // Nomes literais do doc operacional §21 (mesma lista usada pelo client) — evita
    // eventos "quase iguais" poluindo a análise (risco registrado na própria issue).
    if (!RADAR_EVENT_NAMES.includes(eventName)) {
      return NextResponse.json({ error: 'eventName inválido' }, { status: 400 })
    }

    const ip = getClientIp(request)
    const userAgent = request.headers.get('user-agent') || 'unknown'

    if (ip !== 'unknown') {
      const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString()
      const { count } = await supabaseAdmin
        .from('radar_events')
        .select('id', { count: 'exact', head: true })
        .eq('ip_address', ip)
        .gte('created_at', since)

      if ((count ?? 0) >= RATE_LIMIT_MAX_EVENTS) {
        // Evento descartado silenciosamente — nunca expõe rate limit ao usuário final,
        // analytics não pode virar mensagem de erro na tela.
        return NextResponse.json({ success: true })
      }
    }

    await supabaseAdmin.from('radar_events').insert({
      session_id: isValidUuid(sessionId) ? sessionId : null,
      event_name: eventName,
      page_url: typeof pageUrl === 'string' ? pageUrl.slice(0, 500) : null,
      payload: payload && typeof payload === 'object' ? payload : null,
      ip_address: ip !== 'unknown' ? ip : null,
      user_agent: userAgent,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro na API radar/event:', error)
    // Analytics nunca deve quebrar o fluxo do usuário — responde 200 mesmo em erro interno.
    return NextResponse.json({ success: true })
  }
}
