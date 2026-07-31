// =============================================================================
// API: CAPTURA DE FEEDBACK — ISSUE-318D
// POST /api/feedback — pública (anônimo e logado usam a mesma rota).
// Proteção idêntica ao /api/lab/interest e /api/radar/lead: honeypot com sucesso
// falso, rate limit por IP, vocabulário fechado e teto de tamanho.
// ⚠️ `user_id`/`logado` vêm SÓ da sessão validada no servidor, nunca do body —
// é literalmente a falha do `x-user-email` forjável corrigida na ISSUE-318.
// Campos de triagem (status/notas_admin/issue_ref) são inalcançáveis por aqui.
// =============================================================================

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

import {
  EMAIL_MAX,
  MENSAGEM_MAX,
  MENSAGEM_MIN,
  ROTA_MAX,
  SEVERIDADES_FEEDBACK,
  TIPOS_FEEDBACK,
  aceitaSeveridade,
  type SeveridadeFeedback,
  type TipoFeedback,
} from '@/lib/feedback/tipos'
import { obterUsuarioSessao } from '@/lib/supabase-server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
)

const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const
const USER_AGENT_MAX = 400
const VIEWPORT_PADRAO = /^\d{1,5}x\d{1,5}$/

function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown'
}

function ehEmailValido(email: string): boolean {
  return email.length <= EMAIL_MAX && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * Em qual deploy o bug existia. Sem isso, "não reproduz" fica sem explicação.
 * `package.json` marca 0.1.0 desde sempre, então fora da Vercel vale 'local'.
 */
function versaoDoDeploy(): string {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA
  return sha ? sha.slice(0, 7) : 'local'
}

/** Só pares utm_* string→string entram — nada de texto livre disfarçado de UTM. */
function limparUtm(bruto: unknown): Record<string, string> | undefined {
  if (!bruto || typeof bruto !== 'object' || Array.isArray(bruto)) return undefined
  const fonte = bruto as Record<string, unknown>
  const limpo: Record<string, string> = {}
  for (const chave of UTM_KEYS) {
    const valor = fonte[chave]
    if (typeof valor === 'string' && valor.trim()) limpo[chave] = valor.trim().slice(0, 100)
  }
  return Object.keys(limpo).length > 0 ? limpo : undefined
}

/**
 * O contexto do cliente é copiado campo a campo (allowlist), nunca espalhado:
 * JSONB sem teto é vetor de inchaço — mesma lição do `answers` no radar.
 */
function montarContexto(bruto: unknown, userAgent: string | null, logado: boolean) {
  const fonte = bruto && typeof bruto === 'object' && !Array.isArray(bruto)
    ? (bruto as Record<string, unknown>)
    : {}

  const viewport = typeof fonte.viewport === 'string' && VIEWPORT_PADRAO.test(fonte.viewport)
    ? fonte.viewport
    : undefined

  const rotaAnterior = typeof fonte.rota_anterior === 'string' && fonte.rota_anterior.startsWith('/')
    ? fonte.rota_anterior.slice(0, ROTA_MAX)
    : undefined

  return {
    viewport,
    rota_anterior: rotaAnterior,
    utm: limparUtm(fonte.utm),
    user_agent: userAgent ? userAgent.slice(0, USER_AGENT_MAX) : undefined,
    app_version: versaoDoDeploy(),
    logado,
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Honeypot: finge sucesso sem gravar — não ensina o bot que foi detectado.
    if (typeof body?.website === 'string' && body.website.trim().length > 0) {
      return NextResponse.json({ success: true })
    }

    const tipo = body?.tipo
    if (typeof tipo !== 'string' || !TIPOS_FEEDBACK.includes(tipo as TipoFeedback)) {
      return NextResponse.json({ error: 'Tipo de feedback inválido' }, { status: 400 })
    }

    const mensagem = typeof body?.mensagem === 'string' ? body.mensagem.trim() : ''
    if (mensagem.length < MENSAGEM_MIN || mensagem.length > MENSAGEM_MAX) {
      return NextResponse.json(
        { error: `A mensagem precisa ter entre ${MENSAGEM_MIN} e ${MENSAGEM_MAX} caracteres` },
        { status: 400 },
      )
    }

    const severidadeBruta = body?.severidade
    let severidade: SeveridadeFeedback | null = null
    if (aceitaSeveridade(tipo as TipoFeedback) && typeof severidadeBruta === 'string') {
      if (!SEVERIDADES_FEEDBACK.includes(severidadeBruta as SeveridadeFeedback)) {
        return NextResponse.json({ error: 'Severidade inválida' }, { status: 400 })
      }
      severidade = severidadeBruta as SeveridadeFeedback
    }

    const emailInformado = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    if (emailInformado && !ehEmailValido(emailInformado)) {
      return NextResponse.json({ error: 'Formato de e-mail inválido' }, { status: 400 })
    }

    const ip = getClientIp(request)
    if (ip !== 'unknown') {
      const desde = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString()
      const { count } = await supabaseAdmin
        .from('feedback')
        .select('id', { count: 'exact', head: true })
        .eq('ip_address', ip)
        .gte('created_at', desde)

      if ((count ?? 0) >= RATE_LIMIT_MAX) {
        return NextResponse.json(
          { error: 'Você já mandou vários feedbacks agora há pouco. Tenta de novo mais tarde.' },
          { status: 429 },
        )
      }
    }

    const usuario = await obterUsuarioSessao()

    const { error } = await supabaseAdmin.from('feedback').insert({
      user_id: usuario?.id ?? null,
      email: usuario?.email ?? (emailInformado || null),
      tipo,
      severidade,
      mensagem,
      rota: typeof body?.rota === 'string' ? body.rota.slice(0, ROTA_MAX) : null,
      contexto: montarContexto(body?.contexto, request.headers.get('user-agent'), Boolean(usuario)),
      ip_address: ip !== 'unknown' ? ip : null,
      // status fica no default 'novo'; notas_admin e issue_ref são da triagem (318E).
    })

    if (error) {
      console.error('Erro ao salvar feedback:', error)
      return NextResponse.json({ error: 'Não foi possível registrar agora' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro na API feedback:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
