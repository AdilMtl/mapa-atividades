// ═══════════════════════════════════════════════════════════════════
// 🧭 API: PAINEL DE FUNIL — ISSUE-601A + ISSUE-601B (jornada)
// ═══════════════════════════════════════════════════════════════════
// GET /api/admin/funil?segmento=<id>&busca=<texto>&pagina=1&tamanho=50
// Sempre devolve a jornada de 7 etapas e os 6 cards de segmento (§4 da spec).
// Com `segmento`, devolve também a lista paginada de contatos daquele segmento.
//
// 🔒 Gate: sessão validada no servidor (exigirAdminSessao) — nunca header do cliente.
// Esta issue não dispara e-mail nenhum (isso é a 601C); só lê `vw_marketing_contatos`,
// `marketing_sends` e contagens de `radar_sessions` via service_role, atrás do gate de admin.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

import { exigirAdminSessao } from '@/lib/admin'
import { montarJornadaFunil } from '@/lib/marketing/jornada'
import {
  type ContatoMarketing,
  type ContatoMarketingRow,
  type SegmentoId,
  SEGMENTOS,
  contatosDoSegmento,
  mapContatoRow,
  montarJaReceberam,
  montarResumoSegmentos,
} from '@/lib/marketing/segmentos'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
)

const TAMANHO_PADRAO = 50
const TAMANHO_MAXIMO = 200

function segmentoValido(valor: string | null): SegmentoId | null {
  if (!valor) return null
  return SEGMENTOS.some((s) => s.id === valor) ? (valor as SegmentoId) : null
}

function inteiroPositivo(valor: string | null, padrao: number, maximo: number): number {
  const n = Number(valor)
  if (!Number.isInteger(n) || n < 1) return padrao
  return Math.min(n, maximo)
}

/** Slugs de template já enviados com sucesso pro e-mail, mais recente primeiro. */
function montarTemplatesRecebidos(
  envios: { email: string; template_slug: string; status: string; enviado_em: string }[],
): Map<string, string[]> {
  const porEmail = new Map<string, { slug: string; enviadoEm: string }[]>()
  for (const e of envios) {
    if (e.status !== 'enviado') continue
    const email = e.email.trim().toLowerCase()
    const lista = porEmail.get(email) ?? []
    lista.push({ slug: e.template_slug, enviadoEm: e.enviado_em })
    porEmail.set(email, lista)
  }

  const resultado = new Map<string, string[]>()
  for (const [email, lista] of porEmail) {
    const ordenada = [...lista].sort((a, b) => b.enviadoEm.localeCompare(a.enviadoEm))
    const slugsUnicos = [...new Set(ordenada.map((x) => x.slug))]
    resultado.set(email, slugsUnicos)
  }
  return resultado
}

interface ContatoResposta extends ContatoMarketing {
  templatesRecebidos: string[]
}

export async function GET(request: NextRequest) {
  const admin = await exigirAdminSessao()
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  try {
    const url = new URL(request.url)
    const segmento = segmentoValido(url.searchParams.get('segmento'))
    const busca = url.searchParams.get('busca')?.trim().toLowerCase() || null
    const pagina = inteiroPositivo(url.searchParams.get('pagina'), 1, Number.MAX_SAFE_INTEGER)
    const tamanho = inteiroPositivo(url.searchParams.get('tamanho'), TAMANHO_PADRAO, TAMANHO_MAXIMO)

    const [contatosRes, enviosRes, sessoesRes, concluidasRes] = await Promise.all([
      supabaseAdmin.from('vw_marketing_contatos').select('*'),
      supabaseAdmin.from('marketing_sends').select('email, template_slug, status, enviado_em'),
      supabaseAdmin.from('radar_sessions').select('id', { count: 'exact', head: true }),
      supabaseAdmin
        .from('radar_sessions')
        .select('id', { count: 'exact', head: true })
        .not('completed_at', 'is', null),
    ])

    if (contatosRes.error) {
      console.error('Erro ao ler vw_marketing_contatos:', contatosRes.error)
      return NextResponse.json({ error: 'Não consegui montar o funil' }, { status: 500 })
    }
    if (enviosRes.error) {
      console.error('Erro ao ler marketing_sends:', enviosRes.error)
      return NextResponse.json({ error: 'Não consegui montar o funil' }, { status: 500 })
    }
    if (sessoesRes.error || concluidasRes.error) {
      console.error('Erro ao contar radar_sessions:', sessoesRes.error ?? concluidasRes.error)
      return NextResponse.json({ error: 'Não consegui montar o funil' }, { status: 500 })
    }

    const agora = new Date()
    const contatos = ((contatosRes.data ?? []) as ContatoMarketingRow[]).map(mapContatoRow)
    const envios = enviosRes.data ?? []
    const jaReceberam = montarJaReceberam(envios)
    const templatesRecebidos = montarTemplatesRecebidos(envios)

    const segmentos = montarResumoSegmentos(contatos, jaReceberam, agora)

    // Jornada (601B): "convidados" conta plan_type='lab_beta' independente de
    // esta_autorizado — um convite revogado/expirado ainda ACONTECEU, e a
    // jornada é histórico, não estado atual (diferente dos segmentos, que são
    // fila de trabalho e por isso olham só pra quem está autorizado agora).
    const jornada = montarJornadaFunil({
      sessoesRadar: sessoesRes.count ?? 0,
      concluiramRadar: concluidasRes.count ?? 0,
      leadsUnicos: contatos.filter((c) => c.fezRadar).length,
      convidadosLab: contatos.filter((c) => c.planType === 'lab_beta').length,
      criaramConta: contatos.filter((c) => c.planType === 'lab_beta' && c.temConta).length,
      criaramProjeto: contatos.filter((c) => c.projetosCount > 0).length,
      concluiramProjeto: contatos.filter((c) => c.projetosConcluidos > 0).length,
    })

    if (!segmento) {
      return NextResponse.json({ jornada, segmentos })
    }

    let membros = contatosDoSegmento(contatos, segmento, agora)
    if (busca) {
      membros = membros.filter(
        (c) => c.email.toLowerCase().includes(busca) || c.nome?.toLowerCase().includes(busca),
      )
    }

    const total = membros.length
    const inicio = (pagina - 1) * tamanho
    const pagina_contatos: ContatoResposta[] = membros
      .slice(inicio, inicio + tamanho)
      .map((c) => ({ ...c, templatesRecebidos: templatesRecebidos.get(c.email) ?? [] }))

    return NextResponse.json({
      jornada,
      segmentos,
      contatos: pagina_contatos,
      paginacao: { pagina, tamanho, total },
    })
  } catch (error) {
    console.error('Erro no GET admin/funil:', error)
    return NextResponse.json({ error: 'Erro ao montar o painel de funil' }, { status: 500 })
  }
}
