// ═══════════════════════════════════════════════════════════════════
// 📧 API: INTERESSE NA LISTA DO LAB — ISSUE-108
// ═══════════════════════════════════════════════════════════════════
// POST /api/lab/interest
// Captura solta (sem radar): quem já respondeu um radar e marcou "quero
// entrar no Lab" grava em radar_leads.lab_interest (ISSUE-106) — esta rota
// é só para visita direta à página /lab, sem sessão de radar.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const RATE_LIMIT_MAX_LEADS = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hora

function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
}

function isValidEmail(email: string): boolean {
  // Teto de 255 = VARCHAR(255) da coluna — mais longo estouraria o INSERT (22001 → 500).
  return email.length <= 255 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function utmField(value: unknown): string | null {
  // Teto de 100 = VARCHAR(100) das colunas utm_* — trunca em vez de estourar o INSERT.
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, 100) : null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Honeypot: campo escondido no form que humano nunca preenche. Se veio preenchido,
    // finge sucesso sem gravar nada — não avisa o bot que foi detectado.
    if (typeof body?.website === 'string' && body.website.trim().length > 0) {
      return NextResponse.json({ success: true });
    }

    const { email, utm_source, utm_medium, utm_campaign, utm_content, utm_term } = body ?? {};

    if (!email || typeof email !== 'string' || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Formato de email inválido' }, { status: 400 });
    }

    const ip = getClientIp(request);

    if (ip !== 'unknown') {
      const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
      const { count } = await supabaseAdmin
        .from('lab_leads')
        .select('id', { count: 'exact', head: true })
        .eq('ip_address', ip)
        .gte('created_at', since);

      if ((count ?? 0) >= RATE_LIMIT_MAX_LEADS) {
        return NextResponse.json(
          { error: 'Muitos envios recentes. Tente novamente mais tarde.' },
          { status: 429 }
        );
      }
    }

    const { error } = await supabaseAdmin.from('lab_leads').insert({
      email: email.toLowerCase().trim(),
      utm_source: utmField(utm_source),
      utm_medium: utmField(utm_medium),
      utm_campaign: utmField(utm_campaign),
      utm_content: utmField(utm_content),
      utm_term: utmField(utm_term),
      ip_address: ip !== 'unknown' ? ip : null,
    });

    if (error) {
      console.error('Erro ao salvar interesse no Lab:', error);
      return NextResponse.json({ error: 'Não foi possível salvar seu e-mail' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro na API lab/interest:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
