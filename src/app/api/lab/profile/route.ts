// =============================================================================
// API DO LAB — /api/lab/profile (ISSUE-317)
// POST: upsert de `lab_profiles` (1 linha por usuário). Mesmas camadas de
// segurança das rotas de projeto: sessão via cookie + gate de autorização +
// RLS `auth.uid() = user_id` (o INSERT/UPDATE roda com o cliente DA SESSÃO,
// nunca service role). `origin` só é gravado na CRIAÇÃO — edições
// subsequentes nunca sobrescrevem o caminho de chegada original.
// =============================================================================

import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

import { sanitizarPerfil } from '@/lib/lab/perfil'
import {
  criarClienteServidor,
  obterUsuarioSessao,
  verificarAutorizacao,
} from '@/lib/supabase-server'

export async function POST(request: Request) {
  const user = await obterUsuarioSessao()
  if (!user?.email) {
    return NextResponse.json({ error: 'não autenticado' }, { status: 401 })
  }
  const acesso = await verificarAutorizacao(user.email)
  if (!acesso.autorizado) {
    return NextResponse.json({ error: 'sem acesso ao Lab' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const perfil = sanitizarPerfil(body)
  const supabase = await criarClienteServidor()

  const { data: existente } = await supabase
    .from('lab_profiles')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  const campos = {
    role_area: perfil.role_area,
    seniority: perfil.seniority,
    ai_fluency_level: perfil.ai_fluency_level,
    main_goal: perfil.main_goal,
    biggest_bottleneck: perfil.biggest_bottleneck,
    tools_used: perfil.tools_used,
  }

  const { error } = existente
    ? await supabase.from('lab_profiles').update(campos).eq('user_id', user.id)
    : await supabase
        .from('lab_profiles')
        .insert({ user_id: user.id, origin: perfil.origin, ...campos })

  if (error) {
    console.error('[lab/profile POST]', error.message)
    return NextResponse.json({ error: 'não consegui salvar o perfil' }, { status: 500 })
  }

  // O wizard (/lab/novo-projeto) usa área/fluência do perfil como sugestão —
  // sem revalidar, uma visita anterior ao wizard fica com o cache de
  // navegação do Next desatualizado (mesma razão da revalidação em lab/projects).
  revalidatePath('/lab/novo-projeto')
  return NextResponse.json({ ok: true })
}
