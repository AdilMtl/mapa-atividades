// ═══════════════════════════════════════════════════════════════════
// 🧠 API: PROCESSAR DIAGNÓSTICO - PRÉ-DIAGNÓSTICO
// ═══════════════════════════════════════════════════════════════════
// Arquivo: src/app/api/prediag/diagnose/route.ts
// POST /api/prediag/diagnose

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { processarPreDiagnostico, type PreDiagRespostas } from '@/lib/prediag-heuristics';

// Client de service_role: esta rota grava em roi_prediag_sessions,
// que só concede acesso a service_role (RLS travada para public/anon).
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ═══════════════════════════════════════════════════════════════════
// 🛡️ VALIDAÇÃO DE ENTRADA
// ═══════════════════════════════════════════════════════════════════

function validarRespostas(body: any): { valido: boolean; erro?: string; dados?: PreDiagRespostas } {
  const { profile, agenda, pain, topActivity, goal } = body;
  
  // Validar campos obrigatórios
  if (!profile || !agenda || !pain || !topActivity || !goal) {
    return {
      valido: false,
      erro: 'Todos os campos são obrigatórios: profile, agenda, pain, topActivity, goal'
    };
  }
  
  // Validar tipos
  if (typeof profile !== 'string' || typeof agenda !== 'string' || 
      typeof pain !== 'string' || typeof topActivity !== 'string' || 
      typeof goal !== 'string') {
    return {
      valido: false,
      erro: 'Todos os campos devem ser strings'
    };
  }
  
  return {
    valido: true,
    dados: { profile, agenda, pain, topActivity, goal }
  };
}

// ═══════════════════════════════════════════════════════════════════
// 🎯 FUNÇÃO PARA SALVAR NO SUPABASE
// ═══════════════════════════════════════════════════════════════════

async function salvarSessao(
  respostas: PreDiagRespostas, 
  resultado: any,
  metadados: {
    ip?: string;
    userAgent?: string;
    duracao?: number;
  }
) {
  try {
    const { data, error } = await supabaseAdmin
      .from('roi_prediag_sessions')
      .insert({
        profile: respostas.profile,
        agenda: respostas.agenda,
        pain: respostas.pain,
        top_activity: respostas.topActivity,
        goal: respostas.goal,
        mix_essencial: resultado.mix.essencial,
        mix_estrategico: resultado.mix.estrategico,
        mix_tatico: resultado.mix.tatico,
        mix_distracao: resultado.mix.distracao,
        insight_hash: resultado.insight.substring(0, 100), // Primeiros 100 chars
        ip_address: metadados.ip,
        user_agent: metadados.userAgent,
        completed_at: new Date().toISOString(),
        duration_seconds: metadados.duracao
      })
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao salvar sessão:', error);
      return null;
    }
    
    return data?.id;
  } catch (error) {
    console.error('Erro na função salvarSessao:', error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════
// 🎯 FUNÇÃO PARA REGISTRAR EVENTO
// ═══════════════════════════════════════════════════════════════════

async function registrarEvento(
  sessionId: string, 
  eventName: string, 
  payload: any = {}
) {
  try {
    await supabaseAdmin
      .from('roi_events')
      .insert({
        session_id: sessionId,
        event_name: eventName,
        payload,
        page_url: '/pre-diagnostico',
      });
  } catch (error) {
    console.error('Erro ao registrar evento:', error);
  }
}

// ═══════════════════════════════════════════════════════════════════
// 🔧 HANDLER DA API - POST
// ═══════════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // 1️⃣ Obter dados da requisição
    const body = await request.json();
    
    // 2️⃣ Validar entrada
    const validacao = validarRespostas(body);
    if (!validacao.valido) {
      return NextResponse.json(
        { error: validacao.erro },
        { status: 400 }
      );
    }
    
    const respostas = validacao.dados!;
    
    // 3️⃣ Processar diagnóstico usando nossa heurística
    const resultado = processarPreDiagnostico(respostas);
    
    // 4️⃣ Obter metadados da requisição
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';
    
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const duracao = Math.round((Date.now() - startTime) / 1000);
    
    // 5️⃣ Salvar no banco (não bloquear se falhar)
    const sessionId = await salvarSessao(respostas, resultado, {
      ip, userAgent, duracao
    });
    
    // 6️⃣ Registrar evento de conclusão (se sessão foi salva)
    if (sessionId) {
      await registrarEvento(sessionId, 'prediag_completed', {
        cenario: resultado.cenario,
        mix: resultado.mix,
        profile: respostas.profile,
        pain: respostas.pain
      });
    }
    
    // 7️⃣ Retornar resultado para o frontend
    return NextResponse.json({
      success: true,
      sessionId, // null se não conseguiu salvar (mas não falha)
      resultado: {
        mix: resultado.mix,
        insight: resultado.insight,
        sugestao: resultado.sugestao,
        cenario: resultado.cenario
      },
      meta: {
        processedIn: duracao + 's',
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Erro na API diagnose:', error);
    
    // Log de erro estruturado
    console.error({
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      endpoint: '/api/prediag/diagnose'
    });
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: 'Não foi possível processar o diagnóstico. Tente novamente.'
      },
      { status: 500 }
    );
  }
}