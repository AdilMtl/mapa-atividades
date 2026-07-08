// ═══════════════════════════════════════════════════════════════════
// 📊 API: SESSÃO DE RADAR (maturidade / oportunidades) — ISSUE-106
// ═══════════════════════════════════════════════════════════════════
// POST  /api/radar/session — cria a sessão no início do fluxo
// PATCH /api/radar/session — salva respostas + resultado ao final

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { RadarKind } from '@/lib/radar/types';

// Client de service_role: radar_sessions só concede acesso a service_role (RLS travada).
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const RADAR_KINDS: RadarKind[] = ['maturidade', 'oportunidades'];

// Máximo de sessões criadas pelo mesmo IP na janela abaixo antes de bloquear (anti-bot simples).
const RATE_LIMIT_MAX_SESSIONS = 20;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hora

function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
}

function isValidUuid(value: unknown): value is string {
  return typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

// ═══════════════════════════════════════════════════════════════════
// POST — cria a sessão (chamado no início do fluxo, ISSUE-103)
// ═══════════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { kind, utm } = body ?? {};

    if (!RADAR_KINDS.includes(kind)) {
      return NextResponse.json(
        { error: 'kind deve ser "maturidade" ou "oportunidades"' },
        { status: 400 }
      );
    }

    const ip = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';

    if (ip !== 'unknown') {
      const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
      const { count } = await supabaseAdmin
        .from('radar_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('ip_address', ip)
        .gte('created_at', since);

      if ((count ?? 0) >= RATE_LIMIT_MAX_SESSIONS) {
        return NextResponse.json(
          { error: 'Muitas sessões criadas recentemente. Tente novamente mais tarde.' },
          { status: 429 }
        );
      }
    }

    const { data, error } = await supabaseAdmin
      .from('radar_sessions')
      .insert({
        kind,
        utm_source: utm?.source ?? null,
        utm_medium: utm?.medium ?? null,
        utm_campaign: utm?.campaign ?? null,
        utm_content: utm?.content ?? null,
        utm_term: utm?.term ?? null,
        ip_address: ip !== 'unknown' ? ip : null,
        user_agent: userAgent,
      })
      .select('id')
      .single();

    if (error || !data) {
      console.error('Erro ao criar sessão de radar:', error);
      return NextResponse.json({ error: 'Não foi possível criar a sessão' }, { status: 500 });
    }

    return NextResponse.json({ success: true, sessionId: data.id });
  } catch (error) {
    console.error('Erro na API radar/session (POST):', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// ═══════════════════════════════════════════════════════════════════
// PATCH — salva respostas + resultado (chamado ao final do fluxo)
// ═══════════════════════════════════════════════════════════════════

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, answers, resultKey } = body ?? {};

    if (!isValidUuid(sessionId)) {
      return NextResponse.json({ error: 'sessionId inválido' }, { status: 400 });
    }

    if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
      return NextResponse.json({ error: 'answers deve ser um objeto' }, { status: 400 });
    }

    if (typeof resultKey !== 'string' || resultKey.trim().length === 0) {
      return NextResponse.json({ error: 'resultKey é obrigatório' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('radar_sessions')
      .update({
        answers,
        result_key: resultKey,
        completed_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .select('id')
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro na API radar/session (PATCH):', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
