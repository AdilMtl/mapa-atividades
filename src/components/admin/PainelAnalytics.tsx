'use client'

// =============================================================================
// PAINEL DE ANALYTICS DO ADMIN — ISSUE-318A (Fatia A)
// Blocos 1, 2, 3 e 7 da spec: números da janela, funil dos radares por kind,
// origem do tráfego (UTM) + série temporal, e notas de leitura. Blocos 4-6
// (segmentação de conteúdo + pipeline do Lab) são a Fatia B (ISSUE-318A2).
// A API valida a sessão de admin no servidor; aqui é só orquestração de tela.
// =============================================================================

import * as React from 'react'
import Link from 'next/link'
import { Loader2, RefreshCw } from 'lucide-react'

import { Button, Card, Eyebrow, PageContainer, SectionTitle } from '@/components/ds2'
import type {
  AmostraInfo,
  FunilRadar,
  JanelaId,
  LinhaOrigem,
  NumerosJanela,
  PontoSerieTemporal,
} from '@/lib/admin/analytics'

import { BlocoFunil } from './analytics/BlocoFunil'
import { BlocoNotas } from './analytics/BlocoNotas'
import { BlocoNumeros } from './analytics/BlocoNumeros'
import { BlocoOrigem } from './analytics/BlocoOrigem'

interface RespostaPainel {
  janela: JanelaId
  dataCorte: string | null
  incluirTrafegoTeste: boolean
  desde: string | null
  ate: string
  numeros: NumerosJanela
  funis: FunilRadar[]
  origem: LinhaOrigem[]
  serie: PontoSerieTemporal[]
  leadsUnicosTotal: number
  amostra: { sessoes: AmostraInfo; leads: AmostraInfo }
}

const JANELA_OPCOES: { id: JanelaId; rotulo: string }[] = [
  { id: '7', rotulo: '7 dias' },
  { id: '28', rotulo: '28 dias' },
  { id: '90', rotulo: '90 dias' },
  { id: 'tudo', rotulo: 'tudo' },
]

export function PainelAnalytics() {
  const [janela, setJanela] = React.useState<JanelaId>('28')
  const [dataCorte, setDataCorte] = React.useState('')
  const [incluirTeste, setIncluirTeste] = React.useState(false)
  const [dados, setDados] = React.useState<RespostaPainel | null>(null)
  const [carregando, setCarregando] = React.useState(true)
  const [erro, setErro] = React.useState<string | null>(null)

  const carregar = React.useCallback(async () => {
    setCarregando(true)
    setErro(null)
    try {
      const qs = new URLSearchParams({ janela, incluirTeste: incluirTeste ? '1' : '0' })
      if (dataCorte) qs.set('dataCorte', dataCorte)
      const res = await fetch(`/api/admin/analytics?${qs.toString()}`)
      if (!res.ok) throw new Error(String(res.status))
      setDados((await res.json()) as RespostaPainel)
    } catch {
      setErro('Não consegui carregar o painel — tenta atualizar.')
    } finally {
      setCarregando(false)
    }
  }, [janela, dataCorte, incluirTeste])

  React.useEffect(() => {
    void carregar()
  }, [carregar])

  return (
    <div className="ds2-bg-ambient min-h-screen">
      <PageContainer className="max-w-5xl space-y-8 pb-16 pt-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Eyebrow>admin · analytics</Eyebrow>
            <SectionTitle as="h1" className="mt-2 text-[28px] md:text-[36px]">
              De onde vêm, e onde ficam
            </SectionTitle>
            <p className="mt-2 max-w-[640px] font-ds2-sans text-sm leading-relaxed text-ds2-text-secondary">
              Funil dos radares e origem de tráfego, direto do que já é gravado hoje — sem view
              nova, sem evento novo (ISSUE-318A).
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/lab-beta"
              className="min-h-[44px] rounded-ds2-pill border border-ds2-border-subtle px-4 py-2.5 font-ds2-sans text-xs text-ds2-text-secondary hover:bg-white/5"
            >
              convites do Lab
            </Link>
            <Link
              href="/admin/assinantes"
              className="min-h-[44px] rounded-ds2-pill border border-ds2-border-subtle px-4 py-2.5 font-ds2-sans text-xs text-ds2-text-secondary hover:bg-white/5"
            >
              assinantes
            </Link>
          </div>
        </div>

        <Card className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="font-ds2-mono text-[11px] uppercase tracking-[0.08em] text-ds2-text-muted">
              janela
            </span>
            <div className="flex flex-wrap gap-1.5">
              {JANELA_OPCOES.map((opcao) => (
                <button
                  key={opcao.id}
                  type="button"
                  onClick={() => setJanela(opcao.id)}
                  className={`min-h-[44px] rounded-ds2-pill border px-3.5 text-sm font-ds2-sans transition-colors ${
                    janela === opcao.id
                      ? 'border-ds2-orange/50 bg-ds2-orange/15 text-ds2-text-primary'
                      : 'border-ds2-border-subtle bg-transparent text-ds2-text-secondary hover:bg-white/5'
                  }`}
                >
                  {opcao.rotulo}
                </button>
              ))}
            </div>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="font-ds2-mono text-[11px] uppercase tracking-[0.08em] text-ds2-text-muted">
              dados a partir de
            </span>
            <input
              type="date"
              value={dataCorte}
              onChange={(e) => setDataCorte(e.target.value)}
              aria-label="Data de corte"
              className="min-h-[44px] rounded-ds2-card border border-ds2-border-subtle bg-ds2-surface-glass px-3 text-base text-ds2-text-primary outline-none focus:border-ds2-orange/50"
            />
          </label>

          <label className="flex min-h-[44px] items-center gap-2 font-ds2-sans text-sm text-ds2-text-secondary">
            <input
              type="checkbox"
              checked={incluirTeste}
              onChange={(e) => setIncluirTeste(e.target.checked)}
              className="h-4 w-4"
            />
            incluir meu tráfego
          </label>

          <Button
            type="button"
            variant="secondary"
            className="ml-auto py-2.5 text-xs"
            onClick={() => void carregar()}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${carregando ? 'animate-spin' : ''}`} /> atualizar
          </Button>
        </Card>

        {erro && (
          <Card className="border-ds2-magenta/40">
            <p className="font-ds2-sans text-sm text-ds2-text-primary">{erro}</p>
          </Card>
        )}

        {carregando && !dados ? (
          <Card>
            <p className="flex items-center gap-2 font-ds2-sans text-sm text-ds2-text-muted">
              <Loader2 className="h-4 w-4 animate-spin" /> Carregando o painel…
            </p>
          </Card>
        ) : dados ? (
          <>
            <BlocoNumeros numeros={dados.numeros} />

            <section className="space-y-3">
              <Eyebrow>funil dos radares</Eyebrow>
              <div className="grid gap-4 md:grid-cols-2">
                {dados.funis.map((funil) => (
                  <BlocoFunil key={funil.kind} funil={funil} />
                ))}
              </div>
            </section>

            <BlocoOrigem origem={dados.origem} serie={dados.serie} />

            <BlocoNotas
              desde={dados.desde}
              amostraSessoes={dados.amostra.sessoes}
              amostraLeads={dados.amostra.leads}
              incluirTrafegoTeste={dados.incluirTrafegoTeste}
            />
          </>
        ) : null}
      </PageContainer>
    </div>
  )
}
