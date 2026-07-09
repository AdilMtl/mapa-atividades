// ═══════════════════════════════════════════════════════════════════
// 📧 API: CAPTURA DE LEAD DOS RADARES — ISSUE-106
// ═══════════════════════════════════════════════════════════════════
// POST /api/radar/lead
// kind e triggerConversion vêm da sessão no banco (fonte da verdade),
// nunca do que o cliente manda — evita forjar disparo de conversão.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

import { CONTEUDO_MATURIDADE, CONTEUDO_OPORTUNIDADES } from '@/lib/radar/content';
import { calcularMaturidade } from '@/lib/radar/maturidade';
import { decidirOportunidade } from '@/lib/radar/oportunidades';
import type { RadarAnswers } from '@/lib/radar/types';

import { gerarAssuntoEmailRadar, gerarTemplateEmailRadar } from '../email-template';

// Client de service_role: radar_leads só concede acesso a service_role (RLS travada).
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Escada de captura (doc 10): oportunidades é o evento de conversão real do funil novo;
// maturidade é captura suave e não dispara a conversão principal do Google Ads.
const TRIGGER_CONVERSION_BY_KIND: Record<string, boolean> = {
  oportunidades: true,
  maturidade: false,
};

// Máximo de leads pelo mesmo IP na janela abaixo antes de bloquear (anti-bot simples).
const RATE_LIMIT_MAX_LEADS = 5;
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

function isValidEmail(email: string): boolean {
  // Teto de 255 = VARCHAR(255) da coluna — mais longo estouraria o INSERT (22001 → 500).
  return email.length <= 255 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarEntrada(body: unknown): { valido: boolean; erro?: string } {
  const { sessionId, name, email } = (body ?? {}) as Record<string, unknown>;

  if (!isValidUuid(sessionId)) {
    return { valido: false, erro: 'sessionId inválido' };
  }
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return { valido: false, erro: 'Nome é obrigatório (mínimo 2 caracteres)' };
  }
  if (!email || typeof email !== 'string' || !isValidEmail(email)) {
    return { valido: false, erro: 'Formato de email inválido' };
  }
  return { valido: true };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Honeypot: campo escondido no form que humano nunca preenche. Se veio preenchido,
    // finge sucesso sem gravar nada — não avisa o bot que foi detectado.
    if (typeof body?.website === 'string' && body.website.trim().length > 0) {
      return NextResponse.json({ success: true, leadId: null, triggerConversion: false });
    }

    const validacao = validarEntrada(body);
    if (!validacao.valido) {
      return NextResponse.json({ error: validacao.erro }, { status: 400 });
    }

    const { sessionId, name, email, newsletterOptin, labInterest } = body;
    const ip = getClientIp(request);

    if (ip !== 'unknown') {
      const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
      const { count } = await supabaseAdmin
        .from('radar_leads')
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

    // kind vem da sessão (fonte da verdade), não do body — impede forjar triggerConversion.
    // answers vem junto para recompor o resultado (mesmo motor puro do RadarFlow) e montar
    // o e-mail de trilha (ISSUE-113) sem duplicar lógica de scoring aqui.
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('radar_sessions')
      .select('kind, answers')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 404 });
    }

    const kind = session.kind as string;

    const { data: lead, error: leadError } = await supabaseAdmin
      .from('radar_leads')
      .insert({
        session_id: sessionId,
        kind,
        // name é VARCHAR(100) — trunca em vez de estourar o INSERT (22001 → 500).
        name: name.trim().slice(0, 100),
        email: email.toLowerCase().trim(),
        newsletter_optin: newsletterOptin ?? true,
        lab_interest: labInterest ?? false,
        ip_address: ip !== 'unknown' ? ip : null,
      })
      .select('id')
      .single();

    if (leadError || !lead) {
      console.error('Erro ao salvar lead de radar:', leadError);
      return NextResponse.json({ error: 'Não foi possível salvar o email' }, { status: 500 });
    }

    // E-mail de trilha (ISSUE-113): best-effort — falha aqui NUNCA derruba o lead já salvo
    // acima; o resultado completo já está na tela independente do e-mail chegar ou não.
    let emailSent = false;
    try {
      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey) {
        console.warn('RESEND_API_KEY não configurada — e-mail de trilha do radar não enviado');
      } else if (session.answers && typeof session.answers === 'object') {
        const respostas = session.answers as RadarAnswers;
        const firstName = name.trim().split(' ')[0];
        const emailData = kind === 'maturidade'
          ? {
              kind: 'maturidade' as const,
              firstName,
              conteudo: CONTEUDO_MATURIDADE[calcularMaturidade(respostas).nivel],
            }
          : {
              kind: 'oportunidades' as const,
              firstName,
              conteudo: CONTEUDO_OPORTUNIDADES[decidirOportunidade(respostas).tipo],
            };

        const resend = new Resend(apiKey);
        await resend.emails.send({
          from: process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev',
          to: email.toLowerCase().trim(),
          subject: gerarAssuntoEmailRadar(emailData),
          html: gerarTemplateEmailRadar(emailData),
        });
        emailSent = true;
      }
    } catch (emailError) {
      console.error('Erro ao enviar e-mail de trilha do radar:', emailError);
    }

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      triggerConversion: TRIGGER_CONVERSION_BY_KIND[kind] ?? false,
      emailSent,
    });
  } catch (error) {
    console.error('Erro na API radar/lead:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
