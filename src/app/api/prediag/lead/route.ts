// ═══════════════════════════════════════════════════════════════════
// 📧 API: CAPTURA DE LEADS - PRÉ-DIAGNÓSTICO - FIXED 
// ═══════════════════════════════════════════════════════════════════
// Arquivo: src/app/api/prediag/lead/route.ts
// POST /api/prediag/lead

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { gerarRecomendacoes, RecomendacaoEmail } from '../recommendations';

// Client de service_role: esta rota grava em roi_leads/roi_prediag_sessions,
// que só concedem acesso a service_role (RLS travada para public/anon).
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 🔧 FIX: Remover inicialização global do Resend
// ❌ ANTES: const resend = new Resend(process.env.RESEND_API_KEY);
// ✅ AGORA: Inicializar apenas quando usar (dentro da função POST)

// ═══════════════════════════════════════════════════════════════════
// 🛡️ VALIDAÇÃO DE EMAIL
// ═══════════════════════════════════════════════════════════════════

function validarEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validarEntrada(body: any): { valido: boolean; erro?: string } {
  const { name, email, sessionId } = body;
  
  // Nome é obrigatório
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return { valido: false, erro: 'Nome é obrigatório (mínimo 2 caracteres)' };
  }
  
  // Email é obrigatório
  if (!email || typeof email !== 'string') {
    return { valido: false, erro: 'Email é obrigatório' };
  }
  
  // Validar formato do email
  if (!validarEmail(email)) {
    return { valido: false, erro: 'Formato de email inválido' };
  }
  
  // SessionId é opcional, mas se fornecido deve ser UUID válido ou null
if (sessionId && sessionId !== null && typeof sessionId === 'string') {
  // Validar formato UUID se não for null
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(sessionId)) {
    return { valido: false, erro: 'SessionId deve ser um UUID válido ou null' };
  }
}
  
  return { valido: true };
}

// ═══════════════════════════════════════════════════════════════════
// 💾 SALVAR LEAD NO BANCO
// ═══════════════════════════════════════════════════════════════════

async function salvarLead(
  name: string,
  email: string, 
  sessionId?: string,
  metadados: {
    ip?: string;
    userAgent?: string;
  } = {}
) {
  try {
    // 1️⃣ Buscar dados da sessão se sessionId foi fornecido
    let profileSegment = null;
    let painSegment = null;
    
    if (sessionId) {
      const { data: sessao } = await supabaseAdmin
        .from('roi_prediag_sessions')
        .select('profile, pain')
        .eq('id', sessionId)
        .single();
      
      if (sessao) {
        profileSegment = sessao.profile;
        painSegment = sessao.pain;
      }
    }
    
    // 2️⃣ Inserir ou atualizar lead
    const { data, error } = await supabaseAdmin
  .from('roi_leads')
  .upsert({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    source: 'prediagnostico',
        last_session_id: sessionId || null,
        profile_segment: profileSegment,
        pain_segment: painSegment,
        // created_at será preenchido automaticamente na primeira inserção
      }, {
        onConflict: 'email',
        ignoreDuplicates: false // Atualizar se já existir
      })
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao salvar lead:', error);
      return { sucesso: false, erro: error.message };
    }
    
    return { 
  sucesso: true, 
  leadId: data?.id,
  profileSegment,
  painSegment
};
    
  } catch (error) {
    console.error('Erro na função salvarLead:', error);
    return { sucesso: false, erro: 'Erro interno' };
  }
}

// ═══════════════════════════════════════════════════════════════════
// 📊 REGISTRAR EVENTO DE CONVERSÃO
// ═══════════════════════════════════════════════════════════════════

async function registrarEventoLead(sessionId: string, email: string) {
  try {
    if (!sessionId) return;
    
    await supabaseAdmin
      .from('roi_events')
      .insert({
        session_id: sessionId,
        event_name: 'email_submitted',
        payload: {
          email_hash: Buffer.from(email).toString('base64'), // Hash simples para analytics
          source: 'prediag_gate'
        },
        page_url: '/pre-diagnostico'
      });
  } catch (error) {
    console.error('Erro ao registrar evento de lead:', error);
  }
}

// ═══════════════════════════════════════════════════════════════════
// 🔧 HANDLER DA API - POST
// ═══════════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    // 1️⃣ Obter dados da requisição
    const body = await request.json();
    const { name, email, sessionId } = body;
    
    // 2️⃣ Validar entrada
    const validacao = validarEntrada(body);
    if (!validacao.valido) {
      return NextResponse.json(
        { error: validacao.erro },
        { status: 400 }
      );
    }
    
    // 3️⃣ Obter metadados
    const ip = request.headers.get('x-forwarded-for') ||
               'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // 4️⃣ Salvar lead
    const resultado = await salvarLead(name, email, sessionId, { ip, userAgent });
    const { profileSegment, painSegment } = resultado;

    if (!resultado.sucesso) {
      return NextResponse.json(
        { error: 'Não foi possível salvar o email', details: resultado.erro },
        { status: 500 }
      );
    }
    
    // 5️⃣ Registrar evento de conversão
    if (sessionId) {
      await registrarEventoLead(sessionId, email);
    }

    // 🎯 GOOGLE ADS CONVERSÃO - Flag para frontend
const shouldTriggerConversion = true;

    // 6️⃣ Enviar email profissional
    try {
      // 🔧 FIX: Inicializar Resend apenas aqui, dentro do try/catch
      const apiKey = process.env.RESEND_API_KEY;
      
      if (!apiKey) {
        console.warn('⚠️ RESEND_API_KEY não configurada - email não será enviado');
      } else {
        const resend = new Resend(apiKey); // ✅ Inicialização segura
        
        const { gerarTemplateEmail, gerarAssuntoEmail } = await import('../email-template');
        
        let recomendacoes: RecomendacaoEmail[] = [];
        let sessionData: {
          diagnostico?: {
            essencial: number;
            estrategica: number;
            tatica: number;
            distracao: number;
          } | null;
        } | undefined = undefined;
        
        if (sessionId) {
          const { data: sessao } = await supabaseAdmin
            .from('roi_prediag_sessions')
            .select('*') //.select('profile, agenda, pain, top_activity, goal, results')
            .eq('id', sessionId)
            .single();
            
          if (sessao) {
            recomendacoes = gerarRecomendacoes(
              sessao.profile,
              sessao.agenda,
              sessao.pain,
              sessao.top_activity,
              sessao.goal
            );

            sessionData = {
  diagnostico: {
    essencial: sessao.mix_essencial,
    estrategica: sessao.mix_estrategico, 
    tatica: sessao.mix_tatico,
    distracao: sessao.mix_distracao
  }
};
          }
        }

        await resend.emails.send({
          from: process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev',
          to: email,
          subject: gerarAssuntoEmail(profileSegment || 'profissional'),
          html: gerarTemplateEmail({
            profileSegment: profileSegment || 'profissional',
            recomendacoes,
            firstName: name.split(' ')[0],
            sessionData
          })
        });
        
        console.log('✅ Email profissional enviado para:', email);
      }
    } catch (emailError) {
      console.error('❌ Erro Resend:', emailError);
      // Não retornar erro - email é opcional
    }

    // 7️⃣ Retornar sucesso
   return NextResponse.json({
  success: true,
  message: 'Email salvo com sucesso!',
  leadId: resultado.leadId,
  triggerConversion: shouldTriggerConversion
});
    
  } catch (error) {
    console.error('Erro na API lead:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: 'Não foi possível processar sua solicitação.'
      },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════════════
// 🔍 HANDLER DA API - GET (stats públicas)
// ═══════════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    // Estatísticas básicas (sem dados sensíveis)
    const { data: stats } = await supabaseAdmin
      .from('roi_leads')
      .select('profile_segment, pain_segment, created_at')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Últimos 30 dias
    
    if (!stats) {
      return NextResponse.json({ leads_30d: 0, segments: {} });
    }
    
    // Agregações simples
    const totalLeads = stats.length;
    const segments = stats.reduce((acc: any, lead) => {
      const profile = lead.profile_segment || 'unknown';
      acc[profile] = (acc[profile] || 0) + 1;
      return acc;
    }, {});
    
    return NextResponse.json({
      leads_30d: totalLeads,
      segments,
      last_updated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Erro ao buscar stats:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}