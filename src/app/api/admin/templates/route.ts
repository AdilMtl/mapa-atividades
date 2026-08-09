// ═══════════════════════════════════════════════════════════════════
// 📁 API: PASTA DE TEMPLATES — ISSUE-601D
// ═══════════════════════════════════════════════════════════════════
// GET  /api/admin/templates            → todos os slugs geridos, com todas as versões de cada um.
// POST /api/admin/templates            → { slug, assunto, corpo } cria a PRÓXIMA versão (rascunho).
//
// 🔒 Gate: sessão validada no servidor (exigirAdminSessao) — nunca header do cliente.
// Esta rota nunca dispara e-mail (isso é a 601C) e nunca sobrescreve uma versão —
// salvar é sempre um INSERT de versão nova (§6.1 da spec).

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

import { exigirAdminSessao } from '@/lib/admin'
import {
  SLUGS_GERENCIADOS,
  type VersaoTemplate,
  proximaVersao,
  segmentoDoTemplate,
  validarTemplate,
} from '@/lib/marketing/templates'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
)

interface MarketingTemplateRow {
  id: string
  slug: string
  versao: number
  assunto: string
  corpo: string
  segmento: string | null
  status: 'rascunho' | 'ativo' | 'arquivado'
  criado_em: string
  criado_por: string
}

function mapRow(row: MarketingTemplateRow): VersaoTemplate {
  return {
    id: row.id,
    slug: row.slug,
    versao: row.versao,
    assunto: row.assunto,
    corpo: row.corpo,
    segmento: row.segmento,
    status: row.status,
    criadoEm: row.criado_em,
    criadoPor: row.criado_por,
  }
}

export async function GET() {
  const admin = await exigirAdminSessao()
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  try {
    const [templatesRes, enviosRes] = await Promise.all([
      supabaseAdmin
        .from('marketing_templates')
        .select('*')
        .order('slug', { ascending: true })
        .order('versao', { ascending: false }),
      supabaseAdmin.from('marketing_sends').select('template_slug, status, enviado_em'),
    ])

    if (templatesRes.error) {
      console.error('Erro ao ler marketing_templates:', templatesRes.error)
      return NextResponse.json({ error: 'Não consegui carregar a pasta de templates' }, { status: 500 })
    }
    if (enviosRes.error) {
      console.error('Erro ao ler marketing_sends:', enviosRes.error)
      return NextResponse.json({ error: 'Não consegui carregar a pasta de templates' }, { status: 500 })
    }

    const versoes = ((templatesRes.data ?? []) as MarketingTemplateRow[]).map(mapRow)
    const envios = enviosRes.data ?? []

    const porSlug = new Map<string, VersaoTemplate[]>()
    for (const v of versoes) {
      const lista = porSlug.get(v.slug) ?? []
      lista.push(v)
      porSlug.set(v.slug, lista)
    }

    const enviosPorSlug = new Map<string, { count: number; ultimoEnvioEm: string | null }>()
    for (const e of envios) {
      if (e.status !== 'enviado') continue
      const atual = enviosPorSlug.get(e.template_slug) ?? { count: 0, ultimoEnvioEm: null }
      atual.count += 1
      if (!atual.ultimoEnvioEm || e.enviado_em > atual.ultimoEnvioEm) atual.ultimoEnvioEm = e.enviado_em
      enviosPorSlug.set(e.template_slug, atual)
    }

    const templates = SLUGS_GERENCIADOS.map((slug) => {
      const versoesDoSlug = (porSlug.get(slug) ?? []).sort((a, b) => b.versao - a.versao)
      const envio = enviosPorSlug.get(slug) ?? { count: 0, ultimoEnvioEm: null }
      return {
        slug,
        segmento: segmentoDoTemplate(slug),
        versoes: versoesDoSlug,
        enviosCount: envio.count,
        ultimoEnvioEm: envio.ultimoEnvioEm,
      }
    })

    return NextResponse.json({ templates })
  } catch (error) {
    console.error('Erro no GET admin/templates:', error)
    return NextResponse.json({ error: 'Erro ao montar a pasta de templates' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const admin = await exigirAdminSessao()
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  try {
    const body = (await request.json()) as { slug?: string; assunto?: string; corpo?: string }
    const slug = body.slug?.trim() ?? ''
    const assunto = body.assunto ?? ''
    const corpo = body.corpo ?? ''

    if (!SLUGS_GERENCIADOS.includes(slug)) {
      return NextResponse.json(
        { error: `Slug desconhecido. Válidos: ${SLUGS_GERENCIADOS.join(', ')}.` },
        { status: 400 },
      )
    }

    const validacao = validarTemplate(assunto, corpo)
    if (!validacao.valido) {
      return NextResponse.json({ error: validacao.erros.join(' ') }, { status: 400 })
    }

    const existentesRes = await supabaseAdmin
      .from('marketing_templates')
      .select('versao')
      .eq('slug', slug)

    if (existentesRes.error) {
      console.error('Erro ao ler versões existentes:', existentesRes.error)
      return NextResponse.json({ error: 'Não consegui salvar o template' }, { status: 500 })
    }

    const versao = proximaVersao((existentesRes.data ?? []).map((r) => r.versao as number))

    const insertRes = await supabaseAdmin
      .from('marketing_templates')
      .insert({
        slug,
        versao,
        assunto,
        corpo,
        segmento: segmentoDoTemplate(slug),
        status: 'rascunho',
        criado_por: admin.email ?? 'admin',
      })
      .select('*')
      .single()

    if (insertRes.error) {
      console.error('Erro ao salvar template:', insertRes.error)
      return NextResponse.json({ error: 'Não consegui salvar o template' }, { status: 500 })
    }

    return NextResponse.json({ template: mapRow(insertRes.data as MarketingTemplateRow) })
  } catch (error) {
    console.error('Erro no POST admin/templates:', error)
    return NextResponse.json({ error: 'Erro ao salvar o template' }, { status: 500 })
  }
}
