'use client'

// =============================================================================
// PAINEL DE FUNIL — ISSUE-601B (Jornada + Segmentos)
// Duas telas do protótipo aprovado (docs/marketing/mockups/601-painel-funil.html),
// só leitura: a Jornada mostra os 7 degraus dos anúncios até o projeto concluído;
// Segmentos mostra os 6 cards do §4 da spec, cada um com o template designado.
// Sem seleção de pessoas, disparo ou templates — isso é a 601C/601D.
// =============================================================================

import * as React from 'react'
import {
  Activity,
  Award,
  CheckCircle2,
  ChevronDown,
  Clock,
  Hammer,
  KeyRound,
  Mail,
  UserPlus,
} from 'lucide-react'

import { Badge, Card, Eyebrow, PageContainer, SectionTitle } from '@/components/ds2'

type SegmentoId =
  | 'lead_sem_convite'
  | 'convidado_sem_conta'
  | 'conta_sem_projeto'
  | 'projeto_parado'
  | 'assinante_sem_radar'
  | 'concluiu_projeto'

interface EtapaJornada {
  id: string
  n: number
  pctAnterior: number | null
  parede: boolean
}

interface JornadaFunil {
  topo: number
  etapas: EtapaJornada[]
}

interface ResumoSegmento {
  id: SegmentoId
  rotulo: string
  templateSlug: string
  total: number
  semEnvioDesignado: number
  mais14DiasSemContato: number
}

interface RespostaFunil {
  jornada: JornadaFunil
  segmentos: ResumoSegmento[]
}

const ETAPA_INFO: Record<
  string,
  { rotulo: string; icone: React.ElementType; oQueE: string; vemDe: string }
> = {
  sessoes_radar: {
    rotulo: 'Sessões de radar',
    icone: Activity,
    oQueE: 'Alguém abriu um dos radares públicos e começou a responder.',
    vemDe: 'radar_sessions',
  },
  concluiram_radar: {
    rotulo: 'Concluíram o radar',
    icone: CheckCircle2,
    oQueE: 'Respondeu até o fim e viu o resultado na tela.',
    vemDe: 'radar_sessions com completed_at preenchido',
  },
  deixaram_email: {
    rotulo: 'Deixaram e-mail',
    icone: Mail,
    oQueE: 'Virou contato: nome, e-mail, resultado salvo e opt-in registrado.',
    vemDe: 'radar_leads',
  },
  convidados_lab: {
    rotulo: 'Convidados pro Lab',
    icone: UserPlus,
    oQueE: 'Autorização criada e e-mail de convite enviado — sem isso o Lab é inacessível.',
    vemDe: "authorized_emails (plan_type = 'lab_beta')",
  },
  criaram_conta: {
    rotulo: 'Criaram conta',
    icone: KeyRound,
    oQueE: 'Usou o convite, criou login e entrou de fato.',
    vemDe: 'auth.users via admin_list_users()',
  },
  criaram_projeto: {
    rotulo: 'Criaram projeto',
    icone: Hammer,
    oQueE: 'Passou pelo wizard e gerou um plano — a métrica norte do Lab.',
    vemDe: 'lab_projects',
  },
  concluiram_projeto: {
    rotulo: 'Concluíram projeto',
    icone: Award,
    oQueE: 'Marcou o projeto como concluído. Vira relato, prova social e caso de uso.',
    vemDe: 'lab_projects com status = concluido',
  },
}

const SEGMENTO_INFO: Record<SegmentoId, { icone: React.ElementType; descricao: string }> = {
  lead_sem_convite: {
    icone: Mail,
    descricao: 'Fez o radar ou pediu o Lab direto, mas ainda não tem acesso.',
  },
  convidado_sem_conta: {
    icone: KeyRound,
    descricao: 'Recebeu o convite e não usou.',
  },
  conta_sem_projeto: {
    icone: Hammer,
    descricao: 'Entrou, olhou e não começou nada.',
  },
  projeto_parado: {
    icone: Clock,
    descricao: 'Começou e travou no meio da caminhada — mais de 14 dias sem mexer.',
  },
  assinante_sem_radar: {
    icone: Activity,
    descricao: 'Paga, tem acesso, e nunca passou pela porta de entrada.',
  },
  concluiu_projeto: {
    icone: Award,
    descricao: 'Terminou pelo menos um projeto. Candidato a relato e caso de uso.',
  },
}

function Jornada({ jornada }: { jornada: JornadaFunil }) {
  const [aberta, setAberta] = React.useState<string | null>(null)

  return (
    <div className="space-y-1">
      {jornada.etapas.map((etapa, i) => {
        const info = ETAPA_INFO[etapa.id]
        const Icone = info.icone
        const zero = etapa.n === 0
        const largura = jornada.topo > 0 ? Math.max((etapa.n / jornada.topo) * 100, etapa.n === 0 ? 3 : 6) : 0
        const expandida = aberta === etapa.id

        return (
          <div key={etapa.id}>
            {i > 0 && (
              <div
                className={`flex items-center gap-1.5 py-1 pl-4 font-ds2-mono text-[11px] ${
                  etapa.parede ? 'text-ds2-magenta' : 'text-ds2-text-subtle'
                }`}
              >
                {etapa.parede ? (
                  <span>
                    nenhuma das {jornada.etapas[i - 1].n} passou —{' '}
                    <strong className="text-ds2-magenta">porta fechada</strong>
                  </span>
                ) : (
                  <span>
                    <strong className="text-ds2-text-secondary">{etapa.pctAnterior ?? 0}%</strong> seguiram
                  </span>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => setAberta(expandida ? null : etapa.id)}
              aria-expanded={expandida}
              className={`relative flex min-h-[56px] w-full items-center gap-3 overflow-hidden rounded-ds2-card border px-4 text-left transition-colors ${
                zero
                  ? 'border-dashed border-ds2-magenta/40 bg-ds2-surface-glass'
                  : 'border-ds2-border-subtle bg-ds2-surface-glass hover:bg-ds2-surface-glass-hover'
              }`}
            >
              <span
                className="absolute inset-y-0 left-0 bg-ds2-gradient-primary opacity-20"
                style={{ width: `${largura}%` }}
                aria-hidden
              />
              <Icone className={`relative h-[19px] w-[19px] shrink-0 ${zero ? 'text-ds2-magenta' : 'text-ds2-orange'}`} />
              <span className="relative min-w-0 flex-1 truncate font-ds2-sans text-sm font-semibold text-ds2-text-primary">
                {info.rotulo}
              </span>
              <span
                className={`relative shrink-0 font-ds2-serif text-2xl leading-none ${zero ? 'text-ds2-magenta' : 'text-ds2-text-primary'}`}
              >
                {etapa.n}
              </span>
              <ChevronDown
                className={`relative h-4 w-4 shrink-0 text-ds2-text-subtle transition-transform ${expandida ? 'rotate-180' : ''}`}
              />
            </button>

            {expandida && (
              <Card className="mb-1 mt-1.5 space-y-2 overflow-hidden">
                <p className="font-ds2-mono text-[11px] uppercase tracking-[0.08em] text-ds2-amber-soft">
                  o que é esta etapa
                </p>
                <p className="font-ds2-sans text-sm leading-relaxed text-ds2-text-secondary">{info.oQueE}</p>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-ds2-mono text-[11px] text-ds2-text-muted">
                  <span>vem de</span>
                  <code className="rounded-ds2-pill border border-ds2-border-subtle bg-white/5 px-2 py-0.5 text-ds2-text-secondary">
                    {info.vemDe}
                  </code>
                  <span>
                    · {etapa.n}/{jornada.topo} do topo
                  </span>
                </div>
              </Card>
            )}
          </div>
        )
      })}
    </div>
  )
}

function Segmentos({ segmentos }: { segmentos: ResumoSegmento[] }) {
  return (
    <div className="space-y-3">
      {segmentos.map((seg) => {
        const info = SEGMENTO_INFO[seg.id]
        const Icone = info.icone
        return (
          <Card key={seg.id} className="space-y-3 overflow-hidden border-l-4 border-l-ds2-orange">
            <div className="flex items-start gap-3">
              <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-ds2-card border border-ds2-border-medium bg-white/5">
                <Icone className="h-[18px] w-[18px] text-ds2-orange" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-ds2-sans text-[15px] font-semibold leading-tight text-ds2-text-primary">
                  {seg.rotulo}
                </p>
                <p className="mt-0.5 font-ds2-sans text-xs leading-snug text-ds2-text-muted">{info.descricao}</p>
              </div>
              <p className="shrink-0 font-ds2-serif text-[32px] leading-none text-ds2-text-primary">{seg.total}</p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <Badge className="text-[10px]">
                {seg.total === 0
                  ? 'ninguém neste segmento ainda'
                  : `${seg.semEnvioDesignado} de ${seg.total} sem o e-mail`}
              </Badge>
              {seg.mais14DiasSemContato > 0 && (
                <Badge variant="premium" className="text-[10px]">
                  {seg.mais14DiasSemContato} de {seg.total} há +14 dias sem contato
                </Badge>
              )}
              <Badge className="border-[rgba(211,76,117,0.35)] text-[10px] text-[#F2B5C7]">{seg.templateSlug}</Badge>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

export function PainelFunil() {
  const [aba, setAba] = React.useState<'jornada' | 'segmentos'>('jornada')
  const [dados, setDados] = React.useState<RespostaFunil | null>(null)
  const [carregando, setCarregando] = React.useState(true)
  const [erro, setErro] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelado = false
    async function carregar() {
      setCarregando(true)
      setErro(null)
      try {
        const res = await fetch('/api/admin/funil')
        if (!res.ok) throw new Error(String(res.status))
        const data = (await res.json()) as RespostaFunil
        if (!cancelado) setDados(data)
      } catch {
        if (!cancelado) setErro('Não consegui carregar o funil — recarrega a página.')
      } finally {
        if (!cancelado) setCarregando(false)
      }
    }
    void carregar()
    return () => {
      cancelado = true
    }
  }, [])

  return (
    <div className="ds2-bg-ambient min-h-screen">
      <PageContainer className="max-w-4xl space-y-6 pb-16 pt-8">
        <div>
          <Eyebrow>admin · funil</Eyebrow>
          <SectionTitle as="h1" className="mt-2 text-[28px] md:text-[36px]">
            Do anúncio ao projeto
          </SectionTitle>
          <p className="mt-2 max-w-[640px] font-ds2-sans text-sm leading-relaxed text-ds2-text-secondary">
            Ninguém é movido à mão. A posição de cada pessoa é calculada do que ela já fez — por
            isso nunca desatualiza.
          </p>
        </div>

        <div className="flex gap-1.5">
          {(
            [
              { id: 'jornada', rotulo: 'Jornada' },
              { id: 'segmentos', rotulo: 'Segmentos' },
            ] as const
          ).map((opcao) => (
            <button
              key={opcao.id}
              type="button"
              onClick={() => setAba(opcao.id)}
              className={`min-h-[44px] flex-1 rounded-ds2-pill border px-3.5 text-sm font-ds2-sans transition-colors ${
                aba === opcao.id
                  ? 'border-ds2-orange/50 bg-ds2-orange/15 text-ds2-text-primary'
                  : 'border-ds2-border-subtle bg-transparent text-ds2-text-secondary hover:bg-white/5'
              }`}
            >
              {opcao.rotulo}
            </button>
          ))}
        </div>

        {erro && (
          <Card className="border-ds2-magenta/40">
            <p className="font-ds2-sans text-sm text-ds2-text-primary">{erro}</p>
          </Card>
        )}

        {carregando && !dados ? (
          <Card>
            <p className="font-ds2-sans text-sm text-ds2-text-muted">Carregando o funil…</p>
          </Card>
        ) : dados ? (
          <>
            {aba === 'jornada' ? (
              <>
                <Jornada jornada={dados.jornada} />
                <Card className="flex gap-2.5 border-dashed border-ds2-border-medium">
                  <p className="font-ds2-sans text-xs leading-relaxed text-ds2-text-muted">
                    <strong className="text-ds2-text-secondary">Como ler:</strong> a barra é
                    proporcional ao topo do funil. Etapa tracejada é etapa com zero — e zero
                    depois de um número não é fraqueza do produto, é passo que ninguém executou
                    ainda.
                  </p>
                </Card>
              </>
            ) : (
              <>
                <Segmentos segmentos={dados.segmentos} />
                <Card className="flex gap-2.5 border-dashed border-ds2-border-medium">
                  <p className="font-ds2-sans text-xs leading-relaxed text-ds2-text-muted">
                    <strong className="text-ds2-text-secondary">O número que importa</strong> é o
                    de &quot;há +14 dias sem contato&quot;. Total é foto; esse é fila de trabalho.
                  </p>
                </Card>
              </>
            )}
          </>
        ) : null}
      </PageContainer>
    </div>
  )
}
