import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

import { Badge, Button, Card, Eyebrow, GridSection, Progress } from '@/components/ds2'
import {
  badgeStatus,
  metaLinha,
  montarHub,
  montarTopo,
  primeiroNome,
  saudacaoTudoConcluido,
  saudacaoVazia,
  type LabProjectRow,
  type ProjetoResumo,
  type TopoContent,
} from '@/lib/lab/hub'
import { criarClienteServidor, obterUsuarioSessao } from '@/lib/supabase-server'

// =============================================================================
// /lab/inicio — HUB COM ESTADOS REAIS (ISSUE-315)
// Server Component: lê os projetos do dono (RLS já filtra por auth.uid()),
// deriva o view-model no motor puro `lib/lab/hub.ts` e renderiza os 4 estados
// (vazio / retomar_rascunho / em_andamento / tudo_concluido). Zero lógica de
// negócio aqui — a página só monta JSX a partir do que o motor já decidiu.
// Substitui o esqueleto estático da ISSUE-311 (o gate/shell continuam intocados).
// Spec completa: docs/revamp/ISSUE-315-spec-hub.md
// ⚠️ Copy pendente de veto do dono (norma da casa).
// =============================================================================

export default async function LabInicioPage() {
  const supabase = await criarClienteServidor()
  const user = await obterUsuarioSessao()

  const { data } = await supabase
    .from('lab_projects')
    .select('id, title, status, plan')
    .order('updated_at', { ascending: false })

  const hub = montarHub((data ?? []) as LabProjectRow[])
  const nome = primeiroNome(user)

  if (hub.estado === 'vazio') {
    return <EstadoVazio nome={nome} />
  }

  if (hub.estado === 'tudo_concluido') {
    const saudacao = saudacaoTudoConcluido(nome, hub.projetos.length)
    return (
      <div className="space-y-8">
        <div>
          <Eyebrow>teu laboratório de construção</Eyebrow>
          <h1 className="mt-3 font-ds2-serif text-4xl font-medium tracking-[-0.045em] text-ds2-text-primary">
            {saudacao.headline}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ds2-text-secondary">
            {saudacao.linha}
          </p>
        </div>

        <CardNovoProjeto
          label="módulo 01 / novo projeto"
          titulo="Transformar um problema em projeto"
          linha="Você conta o problema, o Lab lê, você confirma — e sai com um diagnóstico e um plano de construção. Leva uns 3 minutos."
          cta="Começar um novo projeto"
        />

        <ListaProjetos projetos={hub.projetos} />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {hub.destaque && (
        <TopoContinuar destaque={hub.destaque} topo={montarTopo(hub.destaque, nome)} />
      )}

      <CardNovoProjetoSecundario />

      <ListaProjetos projetos={hub.projetos} />
    </div>
  )
}

// ----------------------------------------------------------------------------
// Estado vazio — primeiro acesso (§5.5 da spec)
// ----------------------------------------------------------------------------

function EstadoVazio({ nome }: { nome: string | null }) {
  return (
    <div className="space-y-6">
      <div>
        <Eyebrow>teu laboratório de construção</Eyebrow>
        <h1 className="mt-3 font-ds2-serif text-4xl font-medium tracking-[-0.045em] text-ds2-text-primary">
          {saudacaoVazia(nome)}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ds2-text-secondary">
          Aqui um problema chato do teu trabalho — daquele que volta toda semana e come teu tempo
          — vira um projeto com plano de construção. Do jeito que a gente faz nos workshops:
          começa menor que a ambição, prova que funciona e só depois amplia.
        </p>
      </div>

      <CardNovoProjeto
        label="módulo 01 / primeiro projeto"
        titulo="Transformar um problema em projeto"
        linha="Você conta o problema, o Lab lê, você confirma — e sai com um diagnóstico e um plano de construção. Leva uns 3 minutos."
        cta="Quero começar meu primeiro projeto"
      />

      <p className="font-ds2-mono text-[11px] tracking-[0.08em] text-ds2-text-subtle uppercase">
        O Perfil chega em breve — por ora, o caminho começa pelo teu primeiro projeto.
      </p>
    </div>
  )
}

// ----------------------------------------------------------------------------
// Topo "continue de onde parou" (§5.1/§5.2)
// ----------------------------------------------------------------------------

function TopoContinuar({ destaque, topo }: { destaque: ProjetoResumo; topo: TopoContent }) {
  const ratio = destaque.total > 0 ? (destaque.feitas / destaque.total) * 100 : 0

  return (
    <Card className="max-w-3xl space-y-4 border-ds2-orange/35 bg-[rgba(217,119,6,0.05)]">
      <Eyebrow>{topo.eyebrow}</Eyebrow>
      <h1 className="font-ds2-serif text-2xl font-medium tracking-[-0.03em] text-ds2-text-primary md:text-3xl">
        {topo.headline}
      </h1>
      <p className="text-sm leading-relaxed text-ds2-text-secondary">{topo.subtexto}</p>

      {topo.metaProgresso && (
        <div className="space-y-2">
          <p className="font-ds2-mono text-[11px] tracking-[0.08em] text-ds2-text-muted uppercase">
            {topo.metaProgresso}
          </p>
          <Progress value={ratio} />
        </div>
      )}

      <Button asChild>
        <Link href={topo.href}>{topo.ctaLabel}</Link>
      </Button>
    </Card>
  )
}

// ----------------------------------------------------------------------------
// Card "novo projeto" — destaque (vazio/tudo_concluido) ou secundário (o resto)
// ----------------------------------------------------------------------------

function CardNovoProjeto({
  label,
  titulo,
  linha,
  cta,
}: {
  label: string
  titulo: string
  linha: string
  cta: string
}) {
  return (
    <GridSection className="rounded-ds2-hero border border-ds2-border-subtle p-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-ds2-mono text-xs text-ds2-text-secondary">{label}</p>
          <h2 className="mt-2 font-ds2-sans text-lg font-semibold tracking-[-0.03em] text-ds2-text-primary">
            {titulo}
          </h2>
          <p className="mt-1 max-w-md text-sm text-ds2-text-secondary">{linha}</p>
        </div>
        <Button asChild>
          <Link href="/lab/novo-projeto">{cta} →</Link>
        </Button>
      </div>
    </GridSection>
  )
}

function CardNovoProjetoSecundario() {
  return (
    <Card className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="font-ds2-mono text-[11px] tracking-[0.08em] text-ds2-text-muted uppercase">
          novo projeto
        </p>
        <h3 className="mt-2 font-ds2-sans text-lg font-semibold tracking-[-0.03em] text-ds2-text-primary">
          Pegar outro problema
        </h3>
        <p className="mt-1 max-w-md text-sm text-ds2-text-secondary">
          Outra dor do teu trabalho que dá pra transformar em projeto? Começa aqui.
        </p>
      </div>
      <Button asChild variant="secondary">
        <Link href="/lab/novo-projeto">Começar um novo projeto →</Link>
      </Button>
    </Card>
  )
}

// ----------------------------------------------------------------------------
// Lista "Teus projetos" (§5.4)
// ----------------------------------------------------------------------------

function ListaProjetos({ projetos }: { projetos: ProjetoResumo[] }) {
  return (
    <div className="space-y-3">
      <p className="font-ds2-mono text-xs tracking-[0.08em] text-ds2-text-muted uppercase">
        teus projetos
      </p>
      <ul className="space-y-2">
        {projetos.map((p) => (
          <LinhaProjeto key={p.id} p={p} />
        ))}
      </ul>
    </div>
  )
}

function LinhaProjeto({ p }: { p: ProjetoResumo }) {
  return (
    <li>
      <Link
        href={p.href}
        className="flex min-h-11 flex-wrap items-center justify-between gap-3 rounded-[14px] border border-ds2-border-subtle bg-white/[0.03] px-4 py-3 transition-colors hover:bg-white/[0.06]"
      >
        <span className="flex flex-wrap items-center gap-3">
          <span className="font-ds2-sans text-sm font-semibold text-ds2-text-primary">
            {p.titulo}
          </span>
          <Badge>{badgeStatus(p.status)}</Badge>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <span className="font-ds2-mono text-[11px] text-ds2-text-muted">{metaLinha(p)}</span>
          <ChevronRight className="h-4 w-4 text-ds2-text-muted" />
        </span>
      </Link>
    </li>
  )
}
