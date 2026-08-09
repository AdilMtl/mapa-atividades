// ═══════════════════════════════════════════════════════════════════
// 📨 API: DISPARO DE TEMPLATE — ISSUE-601C
// ═══════════════════════════════════════════════════════════════════
// POST /api/admin/funil/disparar → { template_slug, emails[], forcar_reenvio? }
// Revalida TUDO no servidor (a tela de confirmação é UX, não segurança):
// - descadastrado e optin_newsletter=false nunca recebem — sem caminho de forçar;
// - repetir template exige forcar_reenvio=true (o "segundo toque" da tela);
// - só sai o que tem versão ATIVA na pasta de templates (601D);
// - toda tentativa vira linha em marketing_sends — INCLUSIVE as falhas, porque
//   o SDK do Resend não lança exceção: devolve { error } na resposta (§7).
//
// 🔒 Gate: sessão validada no servidor (exigirAdminSessao) — nunca header do cliente.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

import { exigirAdminSessao } from '@/lib/admin'
import { linkDescadastro } from '@/lib/marketing/descadastro'
import { classificarDestinatarios, executarDisparo } from '@/lib/marketing/disparo'
import {
  type ContatoMarketingRow,
  mapContatoRow,
  montarJaReceberam,
} from '@/lib/marketing/segmentos'
import { SLUGS_GERENCIADOS } from '@/lib/marketing/templates'
import { SITE_URL } from '@/lib/site-config'

// Envio é sequencial com pausa (rate limit do Resend) — lote de 50 leva ~35s.
export const maxDuration = 60

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
)

const MAX_EMAILS_POR_DISPARO = 50

const MOTIVO_BLOQUEIO: Record<string, string> = {
  sem_optin: 'sem opt-in de e-mail — não pode ser forçado (LGPD)',
  descadastrado: 'pediu descadastro — não pode ser forçado',
  ja_recebeu: 'já recebeu este template (reenvio exige segunda confirmação)',
  desconhecido: 'e-mail não está na base de contatos',
}

export async function POST(request: NextRequest) {
  const admin = await exigirAdminSessao()
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  try {
    const secret = process.env.MARKETING_LINK_SECRET
    if (!secret) {
      // Trava intencional: sem segredo não existe link de descadastro válido,
      // e sem link de descadastro nenhum e-mail de marketing pode sair (§3.4).
      return NextResponse.json(
        { error: 'MARKETING_LINK_SECRET não configurada — nenhum disparo até o ambiente estar completo.' },
        { status: 500 },
      )
    }
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'RESEND_API_KEY não configurada no ambiente.' }, { status: 500 })
    }

    const body = (await request.json()) as {
      template_slug?: string
      emails?: unknown
      forcar_reenvio?: boolean
    }
    const slug = body.template_slug?.trim() ?? ''
    const forcarReenvio = body.forcar_reenvio === true
    const emails = Array.isArray(body.emails)
      ? body.emails.filter((e): e is string => typeof e === 'string')
      : []

    if (!SLUGS_GERENCIADOS.includes(slug)) {
      return NextResponse.json(
        { error: `Template desconhecido. Válidos: ${SLUGS_GERENCIADOS.join(', ')}.` },
        { status: 400 },
      )
    }
    if (emails.length === 0) {
      return NextResponse.json({ error: 'Nenhum destinatário selecionado.' }, { status: 400 })
    }
    if (emails.length > MAX_EMAILS_POR_DISPARO) {
      return NextResponse.json(
        { error: `Máximo de ${MAX_EMAILS_POR_DISPARO} destinatários por disparo — divide em lotes.` },
        { status: 400 },
      )
    }

    // Template: só a versão ATIVA sai (601D garante no banco que há no máximo 1).
    const templateRes = await supabaseAdmin
      .from('marketing_templates')
      .select('slug, versao, assunto, corpo')
      .eq('slug', slug)
      .eq('status', 'ativo')
      .maybeSingle()

    if (templateRes.error) {
      console.error('Erro ao ler template ativo:', templateRes.error)
      return NextResponse.json({ error: 'Não consegui ler o template.' }, { status: 500 })
    }
    const template = templateRes.data
    if (!template || !template.assunto.trim() || !template.corpo.trim()) {
      return NextResponse.json(
        { error: `"${slug}" não tem versão ativa com conteúdo — ativa uma versão na aba Templates antes.` },
        { status: 400 },
      )
    }

    const emailsNormalizados = [...new Set(emails.map((e) => e.trim().toLowerCase()).filter(Boolean))]

    const [contatosRes, enviosRes] = await Promise.all([
      supabaseAdmin.from('vw_marketing_contatos').select('*').in('email', emailsNormalizados),
      supabaseAdmin
        .from('marketing_sends')
        .select('email, template_slug, status')
        .eq('template_slug', slug),
    ])

    if (contatosRes.error || enviosRes.error) {
      console.error('Erro ao ler contatos/envios:', contatosRes.error ?? enviosRes.error)
      return NextResponse.json({ error: 'Não consegui validar os destinatários.' }, { status: 500 })
    }

    const contatosPorEmail = new Map(
      ((contatosRes.data ?? []) as ContatoMarketingRow[])
        .map(mapContatoRow)
        .map((c) => [c.email.toLowerCase(), c] as const),
    )
    const jaReceberam = montarJaReceberam(enviosRes.data ?? [])

    const classificados = classificarDestinatarios(
      emailsNormalizados,
      contatosPorEmail,
      jaReceberam,
      slug,
      forcarReenvio,
    )

    const aptos = classificados
      .filter((d) => d.status === 'apto' && d.contato)
      .map((d) => ({ email: d.email, contato: d.contato! }))
    const bloqueados = classificados
      .filter((d) => d.status !== 'apto')
      .map((d) => ({ email: d.email, status: d.status, motivo: MOTIVO_BLOQUEIO[d.status] ?? d.status }))

    const resend = new Resend(apiKey)
    const resultados = await executarDisparo({
      aptos,
      template,
      siteUrl: SITE_URL,
      gerarLinkDescadastro: (email) => linkDescadastro(email, secret, SITE_URL, slug),
      enviar: async ({ to, subject, html }) => {
        const { error } = await resend.emails.send({
          from: process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev',
          to,
          subject,
          html,
        })
        return { error }
      },
    })

    // Registro é parte do produto (§3.1): toda tentativa entra, com a versão
    // que saiu no metadata. Falhar aqui não desfaz envio — então avisa alto.
    let avisoRegistro: string | null = null
    if (resultados.length > 0) {
      const { error: insertError } = await supabaseAdmin.from('marketing_sends').insert(
        resultados.map((r) => ({
          email: r.email,
          template_slug: slug,
          status: r.status,
          erro: r.erro,
          enviado_por: admin.email ?? 'admin',
          metadata: { template_versao: template.versao, forcar_reenvio: forcarReenvio },
        })),
      )
      if (insertError) {
        console.error('ENVIO FEITO mas registro em marketing_sends falhou:', insertError)
        avisoRegistro =
          'Os e-mails acima saíram, mas NÃO consegui gravar o registro — anota manualmente e investiga antes do próximo disparo.'
      }
    }

    return NextResponse.json({
      resultados,
      bloqueados,
      resumo: {
        enviados: resultados.filter((r) => r.status === 'enviado').length,
        falharam: resultados.filter((r) => r.status === 'falhou').length,
        bloqueados: bloqueados.length,
      },
      avisoRegistro,
    })
  } catch (error) {
    console.error('Erro no POST admin/funil/disparar:', error)
    return NextResponse.json({ error: 'Erro ao disparar.' }, { status: 500 })
  }
}
