// ═══════════════════════════════════════════════════════════════════
// 📁 API: ATIVAR VERSÃO DE TEMPLATE — ISSUE-601D
// ═══════════════════════════════════════════════════════════════════
// POST /api/admin/templates/ativar → { slug, versao }
// Marca a versão dada como `ativo` (é a que uma futura 601C vai usar pra
// disparar) e arquiva a que estava ativa antes, se houver. O índice único
// parcial em `(slug) where status='ativo'` garante no banco que nunca
// existem duas ativas ao mesmo tempo, mesmo se as duas UPDATEs abaixo
// corressem em paralelo com outra requisição.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

import { exigirAdminSessao } from '@/lib/admin'
import { SLUGS_GERENCIADOS } from '@/lib/marketing/templates'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
)

export async function POST(request: NextRequest) {
  const admin = await exigirAdminSessao()
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  try {
    const body = (await request.json()) as { slug?: string; versao?: number }
    const slug = body.slug?.trim() ?? ''
    const versao = body.versao

    if (!SLUGS_GERENCIADOS.includes(slug) || !versao) {
      return NextResponse.json({ error: 'slug e versão são obrigatórios' }, { status: 400 })
    }

    const alvoRes = await supabaseAdmin
      .from('marketing_templates')
      .select('id, assunto, corpo')
      .eq('slug', slug)
      .eq('versao', versao)
      .maybeSingle()

    if (alvoRes.error || !alvoRes.data) {
      return NextResponse.json({ error: 'Versão não encontrada' }, { status: 404 })
    }
    if (!alvoRes.data.assunto.trim() || !alvoRes.data.corpo.trim()) {
      return NextResponse.json(
        { error: 'Não dá pra ativar uma versão com assunto ou corpo vazio.' },
        { status: 400 },
      )
    }

    // Arquiva a que estava ativa (se houver) antes de ativar a nova — nesta ordem,
    // pra nunca sobrar duas ativas mesmo que a segunda UPDATE falhe no meio.
    const arquivarRes = await supabaseAdmin
      .from('marketing_templates')
      .update({ status: 'arquivado' })
      .eq('slug', slug)
      .eq('status', 'ativo')

    if (arquivarRes.error) {
      console.error('Erro ao arquivar versão anterior:', arquivarRes.error)
      return NextResponse.json({ error: 'Não consegui ativar a versão' }, { status: 500 })
    }

    const ativarRes = await supabaseAdmin
      .from('marketing_templates')
      .update({ status: 'ativo' })
      .eq('id', alvoRes.data.id)
      .select('*')
      .single()

    if (ativarRes.error) {
      console.error('Erro ao ativar versão:', ativarRes.error)
      return NextResponse.json({ error: 'Não consegui ativar a versão' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro no POST admin/templates/ativar:', error)
    return NextResponse.json({ error: 'Erro ao ativar a versão' }, { status: 500 })
  }
}
