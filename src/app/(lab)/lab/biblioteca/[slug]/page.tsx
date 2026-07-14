import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'

import { Eyebrow } from '@/components/ds2'
import { BlocoCopiar } from '@/components/lab/biblioteca/BlocoCopiar'
import { guiaPorSlug } from '@/lib/lab/materiais'
import type { LabDiagnosis } from '@/lib/lab/types'
import {
  montarMarcoTrajetoria,
  montarRamoValor,
  paraDadosValor,
  tipoDoSlugRamo,
} from '@/lib/lab/valor'
import { criarClienteServidor } from '@/lib/supabase-server'

// =============================================================================
// /lab/biblioteca/[slug] — LEITURA (ISSUE-316, Fatias A e B)
// Server Component. Uma rota, três conteúdos:
//   1. `valor-<tipo>`      → ramo de Valor & Carreira (Fatia B)
//   2. `marco-trajetoria`  → o marco de capital de carreira (Fatia B)
//   3. qualquer outro slug → guia de construção (`materiais.ts`, aprovado na 314)
//      + a camada de PROFUNDIDADE nova (secoes), que só existe aqui.
//
// 🔒 TRAVA (o que sustenta a anti-manipulação, §6.3): ramo e marco NÃO abrem por
// URL. O ramo exige um projeto CONCLUÍDO daquele tipo; o marco exige 3 projetos
// concluídos. Sem isso, 404 — o mesmo cadeado da trilha, valendo também aqui.
// Sem essa checagem, digitar /lab/biblioteca/valor-agentico daria o prêmio de
// graça e o desbloqueio viraria enfeite.
//
// Área de LEITURA: DS2 limpo, sem grid técnico (proibição doc 08 §6). Cara de
// livro (pedido do dono): lombada, numeração mono das seções, tempo de leitura.
// =============================================================================

const SLUG_MARCO = 'marco-trajetoria'
const STATUS_CONCLUIDO = 'concluido'
const PALAVRAS_POR_MINUTO = 200

interface ProjetoRow {
  title: string | null
  status: string
  diagnosis: LabDiagnosis | null
  wizard_answers: unknown
}

export default async function LeituraPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const tipoRamo = tipoDoSlugRamo(slug)
  if (tipoRamo) return <PaginaRamoValor slug={slug} tipo={tipoRamo} />
  if (slug === SLUG_MARCO) return <PaginaMarco />

  const guia = guiaPorSlug(slug)
  if (!guia) notFound()

  const corpo = [...guia.paragrafos, ...(guia.secoes ?? []).flatMap((s) => s.paragrafos)]

  return (
    <Leitura eyebrow="guia de construção" titulo={guia.titulo} minutos={minutosDeLeitura(corpo)}>
      <Corpo paragrafos={guia.paragrafos} destaqueNoPrimeiro />

      {guia.secoes?.map((secao, i) => (
        <section key={secao.titulo} className="space-y-3 border-t border-ds2-border-subtle pt-6">
          <p className="font-ds2-mono text-[11px] tracking-[0.1em] text-ds2-text-muted uppercase">
            {String(i + 1).padStart(2, '0')} / {secao.titulo}
          </p>
          <Corpo paragrafos={secao.paragrafos} />
        </section>
      ))}
    </Leitura>
  )
}

// ----------------------------------------------------------------------------
// 1. O ramo de valor — exige projeto CONCLUÍDO daquele tipo
// ----------------------------------------------------------------------------

async function PaginaRamoValor({
  slug,
  tipo,
}: {
  slug: string
  tipo: NonNullable<ReturnType<typeof tipoDoSlugRamo>>
}) {
  const supabase = await criarClienteServidor()
  const { data } = await supabase
    .from('lab_projects')
    .select('title, status, diagnosis, wizard_answers')
    .eq('status', STATUS_CONCLUIDO)
    .order('updated_at', { ascending: false })

  const projetos = (data ?? []) as ProjetoRow[]
  // O projeto CONCLUÍDO mais recente daquele tipo é quem contextualiza o ramo.
  const projeto = projetos.find((p) => p.diagnosis?.tipo === tipo)
  if (!projeto) notFound() // 🔒 não terminou um desse tipo → o ramo não existe pra ela

  const ramo = montarRamoValor(tipo, paraDadosValor(projeto.wizard_answers, projeto.title))
  const corpo = [...ramo.abertura, ...ramo.blocos.flatMap((b) => b.paragrafos), ...ramo.combinado]

  return (
    <Leitura
      eyebrow="ramo de valor & carreira"
      titulo={ramo.titulo}
      minutos={minutosDeLeitura(corpo)}
      tom="valor"
      slugChave={slug}
    >
      <Corpo paragrafos={ramo.abertura} destaqueNoPrimeiro />

      {ramo.blocos.map((bloco, i) => (
        <section key={bloco.titulo} className="space-y-3 border-t border-ds2-border-subtle pt-6">
          <p className="font-ds2-mono text-[11px] tracking-[0.1em] text-ds2-text-muted uppercase">
            {String(i + 1).padStart(2, '0')} / {bloco.titulo}
          </p>
          <Corpo paragrafos={bloco.paragrafos} />
          {bloco.paraCopiar && <BlocoCopiar texto={bloco.paraCopiar} nota={bloco.notaCopiar} />}
        </section>
      ))}

      <section className="space-y-3 rounded-ds2-panel border border-ds2-magenta/25 bg-[linear-gradient(145deg,rgba(211,76,117,0.10),rgba(255,255,255,0.04))] p-5 md:p-6">
        <p className="font-ds2-mono text-[11px] tracking-[0.1em] text-ds2-magenta uppercase">
          o combinado
        </p>
        <Corpo paragrafos={ramo.combinado} />
      </section>
    </Leitura>
  )
}

// ----------------------------------------------------------------------------
// 2. O marco de trajetória — exige 3 projetos concluídos
// ----------------------------------------------------------------------------

async function PaginaMarco() {
  const supabase = await criarClienteServidor()
  const { count } = await supabase
    .from('lab_projects')
    .select('id', { count: 'exact', head: true })
    .eq('status', STATUS_CONCLUIDO)

  const marco = montarMarcoTrajetoria(count ?? 0)
  if (!marco.aberto) notFound() // 🔒 menos de 3 terminados → o marco não existe pra ela

  const corpo = [
    ...marco.paragrafos,
    ...marco.movimentos.map((m) => m.texto),
    marco.fechamento ?? '',
  ]

  return (
    <Leitura
      eyebrow="marco de trajetória"
      titulo={marco.titulo}
      minutos={minutosDeLeitura(corpo)}
      tom="valor"
      slugChave={SLUG_MARCO}
    >
      <Corpo paragrafos={marco.paragrafos} destaqueNoPrimeiro />

      {marco.movimentos.map((movimento, i) => (
        <section key={movimento.titulo} className="space-y-3 border-t border-ds2-border-subtle pt-6">
          <p className="font-ds2-mono text-[11px] tracking-[0.1em] text-ds2-text-muted uppercase">
            {String(i + 1).padStart(2, '0')} / {movimento.titulo}
          </p>
          <Corpo paragrafos={[movimento.texto]} />
        </section>
      ))}

      {marco.fechamento && (
        <section className="space-y-3 rounded-ds2-panel border border-ds2-magenta/25 bg-[linear-gradient(145deg,rgba(211,76,117,0.10),rgba(255,255,255,0.04))] p-5 md:p-6">
          <p className="font-ds2-mono text-[11px] tracking-[0.1em] text-ds2-magenta uppercase">
            a régua honesta
          </p>
          <Corpo paragrafos={[marco.fechamento]} />
        </section>
      )}
    </Leitura>
  )
}

// ----------------------------------------------------------------------------
// Casca de leitura — a "página de livro" (lombada + metadados + corpo)
// ----------------------------------------------------------------------------

function Leitura({
  eyebrow,
  titulo,
  minutos,
  tom = 'construcao',
  slugChave,
  children,
}: {
  eyebrow: string
  titulo: string
  minutos: number
  tom?: 'construcao' | 'valor'
  slugChave?: string
  children: React.ReactNode
}) {
  return (
    <article className="mx-auto max-w-2xl space-y-8" key={slugChave}>
      <Link
        href="/lab/biblioteca"
        className="inline-flex min-h-11 items-center gap-2 font-ds2-mono text-xs text-ds2-text-muted transition-colors hover:text-ds2-text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Biblioteca
      </Link>

      {/* Cabeçalho com lombada — a cara de livro */}
      <header className="relative pl-5">
        <span
          aria-hidden
          className={`absolute inset-y-0 left-0 w-[3px] rounded-full ${
            tom === 'valor' ? 'bg-ds2-magenta/70' : 'bg-ds2-orange/70'
          }`}
        />
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-3 font-ds2-serif text-3xl leading-tight font-medium tracking-[-0.03em] text-ds2-text-primary md:text-4xl">
          {titulo}
        </h1>
        <p className="mt-3 font-ds2-mono text-[11px] tracking-[0.08em] text-ds2-text-subtle uppercase">
          ~{minutos} min de leitura
        </p>
      </header>

      <div className="space-y-8">{children}</div>

      <footer className="border-t border-ds2-border-subtle pt-6">
        <Link
          href="/lab/biblioteca"
          className="inline-flex min-h-11 items-center gap-2 font-ds2-mono text-xs text-ds2-text-muted transition-colors hover:text-ds2-text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar pra trilha
        </Link>
      </footer>
    </article>
  )
}

function Corpo({
  paragrafos,
  destaqueNoPrimeiro = false,
}: {
  paragrafos: string[]
  destaqueNoPrimeiro?: boolean
}) {
  return (
    <div className="space-y-4">
      {paragrafos.map((paragrafo, i) => (
        <p
          key={i}
          className={
            destaqueNoPrimeiro && i === 0
              ? 'text-[17px] leading-relaxed text-ds2-text-primary'
              : 'text-[15px] leading-relaxed text-ds2-text-secondary'
          }
        >
          {paragrafo}
        </p>
      ))}
    </div>
  )
}

/** Tempo de leitura honesto (200 palavras/min) — metadado de livro, não enfeite. */
function minutosDeLeitura(paragrafos: string[]): number {
  const palavras = paragrafos.join(' ').trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(palavras / PALAVRAS_POR_MINUTO))
}
