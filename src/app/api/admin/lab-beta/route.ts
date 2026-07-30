// ═══════════════════════════════════════════════════════════════════
// 🎟️ API: PAINEL DE CONVITES DO BETA DO LAB — ISSUE-318
// ═══════════════════════════════════════════════════════════════════
// GET   → fila unificada (lab_leads + radar_leads.lab_interest) + convidados
// POST  → convida: INSERT authorized_emails (plan_type='lab_beta') + e-mail Resend
// PATCH → revoga: expira o acesso de um convidado do beta
//
// 🔒 Gate: sessão validada no servidor (cookie → getUser) e e-mail do admin —
// NUNCA o header x-user-email do padrão antigo (forjável; corrigido nesta issue).

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

import { exigirAdminSessao } from '@/lib/admin'

import { gerarAssuntoConvite, gerarTemplateConvite } from './email-convite'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
)

const PLAN_LAB_BETA = 'lab_beta'
// Validade padrão do convite — dá pra estender pelo painel de assinantes depois.
const VALIDADE_PADRAO = '2026-12-31'

interface LeadFila {
  email: string
  nome: string | null
  origem: 'pagina_lab' | 'radar'
  criadoEm: string
}

function emailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function GET() {
  const admin = await exigirAdminSessao()
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  try {
    const [labLeadsRes, radarLeadsRes, autorizadosRes, usersRes] = await Promise.all([
      supabaseAdmin.from('lab_leads').select('email, created_at').order('created_at'),
      supabaseAdmin
        .from('radar_leads')
        .select('email, name, created_at')
        .eq('lab_interest', true)
        .order('created_at'),
      supabaseAdmin.from('authorized_emails').select('email, expires_at, plan_type, notes, created_at'),
      supabaseAdmin.rpc('admin_list_users'),
    ])

    const autorizados = autorizadosRes.data ?? []
    const autorizadoPorEmail = new Map(
      autorizados.map((a) => [String(a.email).toLowerCase(), a]),
    )
    const users = (usersRes.data ?? []) as {
      email?: string | null
      created_at?: string | null
      last_sign_in_at?: string | null
    }[]
    const userPorEmail = new Map(
      users.filter((u) => u.email).map((u) => [String(u.email).toLowerCase(), u]),
    )

    // Fila: leads das duas origens, dedupe por e-mail (fica o registro mais antigo,
    // preferindo o do radar quando tem nome), fora quem já está autorizado.
    const fila = new Map<string, LeadFila>()
    for (const l of radarLeadsRes.data ?? []) {
      const email = String(l.email).toLowerCase()
      if (!fila.has(email)) {
        fila.set(email, {
          email,
          nome: l.name ?? null,
          origem: 'radar',
          criadoEm: l.created_at,
        })
      }
    }
    for (const l of labLeadsRes.data ?? []) {
      const email = String(l.email).toLowerCase()
      if (!fila.has(email)) {
        fila.set(email, { email, nome: null, origem: 'pagina_lab', criadoEm: l.created_at })
      }
    }

    const filaSemConvidados = [...fila.values()]
      .filter((l) => !autorizadoPorEmail.has(l.email))
      .sort((a, b) => a.criadoEm.localeCompare(b.criadoEm))

    // Convidados do beta (com status de conta) — assinantes de outros planos ficam
    // no painel /admin/assinantes, não aqui.
    const convidados = autorizados
      .filter((a) => a.plan_type === PLAN_LAB_BETA)
      .map((a) => {
        const user = userPorEmail.get(String(a.email).toLowerCase())
        return {
          email: a.email,
          expiraEm: a.expires_at,
          notes: a.notes,
          convidadoEm: a.created_at,
          temConta: !!user,
          ultimoAcesso: user?.last_sign_in_at ?? null,
          ativo: new Date() <= new Date(a.expires_at),
        }
      })
      .sort((a, b) => String(b.convidadoEm).localeCompare(String(a.convidadoEm)))

    return NextResponse.json({ fila: filaSemConvidados, convidados })
  } catch (error) {
    console.error('Erro no GET admin/lab-beta:', error)
    return NextResponse.json({ error: 'Erro ao montar o painel' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const admin = await exigirAdminSessao()
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  try {
    const body = await request.json()
    const email = String(body?.email ?? '').toLowerCase().trim()
    const nome = typeof body?.nome === 'string' && body.nome.trim() ? body.nome.trim() : null
    const expiraEm = typeof body?.expiraEm === 'string' && body.expiraEm ? body.expiraEm : VALIDADE_PADRAO
    // reenviar=true: convidado do beta que não recebeu o e-mail — só reenvia,
    // sem tocar na autorização que já existe.
    const reenviar = body?.reenviar === true

    if (!emailValido(email)) {
      return NextResponse.json({ error: 'E-mail inválido' }, { status: 400 })
    }

    // Quem já está em authorized_emails não é tocado: sobrescrever plan_type de
    // assinante antigo mudaria a navegação dele (regra do doc da rotina).
    const { data: existente } = await supabaseAdmin
      .from('authorized_emails')
      .select('email, plan_type')
      .eq('email', email)
      .maybeSingle()

    if (existente && !(reenviar && existente.plan_type === PLAN_LAB_BETA)) {
      const motivo =
        existente.plan_type === PLAN_LAB_BETA
          ? 'Já foi convidado pro beta (usa o Reenviar e-mail na lista de convidados)'
          : 'Já tem acesso como assinante (não mexo no plano dele)'
      return NextResponse.json({ error: motivo }, { status: 409 })
    }

    if (!existente) {
      const { error: insertError } = await supabaseAdmin.from('authorized_emails').insert({
        email,
        expires_at: expiraEm,
        plan_type: PLAN_LAB_BETA,
        notes: `convite beta Lab — via painel admin (${new Date().toISOString().slice(0, 10)})`,
      })

      if (insertError) {
        console.error('Erro ao autorizar convite:', insertError)
        return NextResponse.json({ error: 'Não consegui liberar o acesso' }, { status: 500 })
      }
    }

    // E-mail de convite: se o Resend falhar, o acesso JÁ está liberado — o painel
    // avisa COM O MOTIVO e o dono manda manualmente (template no doc da rotina).
    // ⚠️ O SDK do Resend NÃO lança exceção em erro de envio — devolve { error } na
    // resposta (bug real pego no 1º teste do dono: falha passava como "enviado").
    let emailEnviado = false
    let motivoEmail: string | null = null
    try {
      const apiKey = process.env.RESEND_API_KEY
      if (!apiKey) {
        motivoEmail = 'RESEND_API_KEY não configurada no ambiente'
      } else {
        const resend = new Resend(apiKey)
        const { error: sendError } = await resend.emails.send({
          from: process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev',
          to: email,
          subject: gerarAssuntoConvite(),
          html: gerarTemplateConvite(nome ? nome.split(' ')[0] : null),
        })
        if (sendError) {
          motivoEmail = sendError.message ?? 'Resend recusou o envio (sem mensagem)'
          console.error('Convite autorizado, mas o Resend recusou:', sendError)
        } else {
          emailEnviado = true
        }
      }
    } catch (emailError) {
      motivoEmail = emailError instanceof Error ? emailError.message : 'erro inesperado no envio'
      console.error('Convite autorizado, mas o e-mail falhou:', emailError)
    }

    return NextResponse.json({ success: true, emailEnviado, motivoEmail })
  } catch (error) {
    console.error('Erro no POST admin/lab-beta:', error)
    return NextResponse.json({ error: 'Erro ao convidar' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const admin = await exigirAdminSessao()
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  try {
    const body = await request.json()
    const email = String(body?.email ?? '').toLowerCase().trim()
    if (!emailValido(email)) {
      return NextResponse.json({ error: 'E-mail inválido' }, { status: 400 })
    }

    // Revogação = expirar ontem. Só mexe em convidado do beta — nunca em assinante.
    const ontem = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const { data, error } = await supabaseAdmin
      .from('authorized_emails')
      .update({ expires_at: ontem })
      .eq('email', email)
      .eq('plan_type', PLAN_LAB_BETA)
      .select('email')

    if (error) {
      console.error('Erro ao revogar convite:', error)
      return NextResponse.json({ error: 'Não consegui revogar' }, { status: 500 })
    }
    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Convidado do beta não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro no PATCH admin/lab-beta:', error)
    return NextResponse.json({ error: 'Erro ao revogar' }, { status: 500 })
  }
}
