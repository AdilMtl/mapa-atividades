'use client'

// =============================================================================
// PAINEL DE TRIAGEM DE FEEDBACK — ISSUE-318E
// Fecha o ciclo que o dono pediu: ele registra pelo widget, tria aqui, clica em
// "copiar como markdown", cola em docs/revamp/feedback-inbox.md, e eu leio
// nativamente na sessão. O `issue_ref` é a costura com o 04_issue_backlog.md —
// é o que impede este inbox de virar um segundo backlog concorrente.
// Lista de cards, nunca tabela: multi-coluna no celular já foi problema real
// duas vezes (v3.11.28 e v3.11.29).
// =============================================================================

import * as React from 'react'
import { Check, ClipboardCopy, Loader2, RefreshCw } from 'lucide-react'

import { Badge, Button, Card, Eyebrow, PageContainer, SectionTitle } from '@/components/ds2'
import {
  dataLegivel,
  dispositivoDoUserAgent,
  formatarFeedbackMarkdown,
  refCurta,
  type FeedbackLinha,
} from '@/lib/admin/feedback'
import {
  STATUS_FEEDBACK,
  TIPOS_FEEDBACK,
  type StatusFeedback,
  type TipoFeedback,
} from '@/lib/feedback/tipos'

const ROTULO_STATUS: Record<StatusFeedback, string> = {
  novo: 'novo',
  triado: 'triado',
  em_execucao: 'em execução',
  resolvido: 'resolvido',
  descartado: 'descartado',
}

const ROTULO_TIPO: Record<TipoFeedback, string> = {
  bug: 'bug',
  melhoria: 'melhoria',
  ideia: 'ideia',
  confuso: 'confuso',
  elogio: 'elogio',
}

interface Contadores {
  porTipo: Record<TipoFeedback, number>
  porStatus: Record<StatusFeedback, number>
  total: number
}

const ESTILO_CAMPO =
  'min-h-[44px] w-full rounded-ds2-card border border-ds2-border-subtle bg-ds2-surface-glass px-3 text-base text-ds2-text-primary placeholder-ds2-text-muted outline-none focus:border-ds2-orange/50'

async function copiar(texto: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto)
    return true
  } catch {
    return false
  }
}

export function PainelFeedback() {
  const [itens, setItens] = React.useState<FeedbackLinha[]>([])
  const [contadores, setContadores] = React.useState<Contadores | null>(null)
  const [filtroStatus, setFiltroStatus] = React.useState<StatusFeedback | 'todos'>('novo')
  const [carregando, setCarregando] = React.useState(true)
  const [erro, setErro] = React.useState<string | null>(null)
  const [copiado, setCopiado] = React.useState<string | null>(null)

  const carregar = React.useCallback(async () => {
    setCarregando(true)
    setErro(null)
    try {
      const query = filtroStatus === 'todos' ? '' : `?status=${filtroStatus}`
      const res = await fetch(`/api/admin/feedback${query}`)
      if (!res.ok) throw new Error(String(res.status))
      const data = (await res.json()) as { itens: FeedbackLinha[]; contadores: Contadores }
      setItens(data.itens)
      setContadores(data.contadores)
    } catch {
      setErro('Não consegui carregar a fila — recarrega a página.')
    } finally {
      setCarregando(false)
    }
  }, [filtroStatus])

  React.useEffect(() => {
    void carregar()
  }, [carregar])

  const avisarCopia = React.useCallback((chave: string, ok: boolean) => {
    setCopiado(ok ? chave : null)
    if (!ok) setErro('O navegador bloqueou a cópia — seleciona o texto na mão.')
    window.setTimeout(() => setCopiado(null), 2000)
  }, [])

  const copiarFila = React.useCallback(async () => {
    const markdown = itens.map(formatarFeedbackMarkdown).join('\n\n')
    avisarCopia('fila', await copiar(markdown))
  }, [itens, avisarCopia])

  return (
    <div className="ds2-bg-ambient min-h-screen">
      <PageContainer className="max-w-4xl space-y-8 pb-16 pt-8">
        <div>
          <Eyebrow>admin · feedback</Eyebrow>
          <SectionTitle as="h1" className="mt-2 text-[28px] md:text-[36px]">
            O que chegou do uso real
          </SectionTitle>
          <p className="mt-2 max-w-[640px] font-ds2-sans text-sm leading-relaxed text-ds2-text-secondary">
            Cada item veio do botão de feedback, com a rota, o aparelho e a versão do deploy que
            estava no ar na hora. Tria aqui, copia como markdown e cola no{' '}
            <span className="font-ds2-mono text-xs">feedback-inbox.md</span>. Quando virar trabalho,
            preenche a ref da issue: é o que costura esta fila com o backlog planejado.
          </p>
        </div>

        {erro && (
          <Card className="border-ds2-magenta/40">
            <p className="font-ds2-sans text-sm text-ds2-text-primary">{erro}</p>
          </Card>
        )}

        {contadores && (
          <Card className="space-y-3">
            <Eyebrow>a base inteira ({contadores.total})</Eyebrow>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 font-ds2-mono text-[11px] text-ds2-text-muted">
              {TIPOS_FEEDBACK.map((tipo) => (
                <span key={tipo}>
                  {ROTULO_TIPO[tipo]}{' '}
                  <span className="text-ds2-text-primary">{contadores.porTipo[tipo]}</span>
                </span>
              ))}
            </div>
          </Card>
        )}

        <section className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {(['todos', ...STATUS_FEEDBACK] as const).map((opcao) => {
              const ativo = filtroStatus === opcao
              const quantidade =
                opcao === 'todos' ? contadores?.total : contadores?.porStatus[opcao]
              return (
                <button
                  key={opcao}
                  type="button"
                  onClick={() => setFiltroStatus(opcao)}
                  aria-pressed={ativo}
                  className={`flex min-h-11 items-center rounded-ds2-pill border px-3 font-ds2-mono text-xs transition-colors ${
                    ativo
                      ? 'border-ds2-orange/50 bg-ds2-orange/15 text-ds2-text-primary'
                      : 'border-ds2-border-subtle text-ds2-text-secondary hover:border-ds2-border-medium'
                  }`}
                >
                  {opcao === 'todos' ? 'todos' : ROTULO_STATUS[opcao]}
                  {typeof quantidade === 'number' && (
                    <span className="ml-1.5 text-ds2-text-muted">{quantidade}</span>
                  )}
                </button>
              )
            })}

            <div className="ml-auto flex gap-2">
              <Button
                type="button"
                variant="secondary"
                className="py-2 text-xs"
                onClick={() => void carregar()}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${carregando ? 'animate-spin' : ''}`} /> atualizar
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="py-2 text-xs"
                disabled={itens.length === 0}
                onClick={() => void copiarFila()}
              >
                {copiado === 'fila' ? (
                  <Check className="h-3.5 w-3.5 text-ds2-orange" />
                ) : (
                  <ClipboardCopy className="h-3.5 w-3.5" />
                )}
                copiar a fila
              </Button>
            </div>
          </div>

          {carregando && itens.length === 0 ? (
            <Card>
              <p className="font-ds2-sans text-sm text-ds2-text-muted">Carregando…</p>
            </Card>
          ) : itens.length === 0 ? (
            <Card>
              <p className="font-ds2-sans text-sm text-ds2-text-muted">
                {filtroStatus === 'novo'
                  ? 'Nada novo na fila. O que chegar pelo botão de feedback aparece aqui.'
                  : 'Nenhum item com esse status.'}
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {itens.map((item) => (
                <CardFeedback
                  key={item.id}
                  item={item}
                  copiado={copiado === item.id}
                  onCopiar={async () => avisarCopia(item.id, await copiar(formatarFeedbackMarkdown(item)))}
                  onSalvo={(atualizado) =>
                    setItens((atuais) => atuais.map((i) => (i.id === atualizado.id ? atualizado : i)))
                  }
                  onErro={setErro}
                />
              ))}
            </div>
          )}
        </section>
      </PageContainer>
    </div>
  )
}

function CardFeedback({
  item,
  copiado,
  onCopiar,
  onSalvo,
  onErro,
}: {
  item: FeedbackLinha
  copiado: boolean
  onCopiar: () => void
  onSalvo: (item: FeedbackLinha) => void
  onErro: (mensagem: string | null) => void
}) {
  const [notas, setNotas] = React.useState(item.notasAdmin ?? '')
  const [ref, setRef] = React.useState(item.issueRef ?? '')
  const [salvando, setSalvando] = React.useState(false)
  const [abertoTriagem, setAbertoTriagem] = React.useState(false)

  const salvar = React.useCallback(
    async (patch: Record<string, unknown>) => {
      setSalvando(true)
      onErro(null)
      try {
        const res = await fetch('/api/admin/feedback', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item.id, ...patch }),
        })
        const data = (await res.json()) as { success?: boolean; item?: FeedbackLinha; error?: string }
        if (!res.ok || !data.success || !data.item) {
          onErro(data.error ?? 'Não consegui salvar a triagem.')
          return
        }
        onSalvo(data.item)
      } catch {
        onErro('Não consegui salvar a triagem.')
      } finally {
        setSalvando(false)
      }
    },
    [item.id, onErro, onSalvo],
  )

  const contexto = item.contexto ?? {}
  const aparelho = [
    dispositivoDoUserAgent(contexto.user_agent),
    contexto.viewport?.replace('x', '×'),
    contexto.app_version,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge className="text-[10px]">{ROTULO_TIPO[item.tipo]}</Badge>
        {item.severidade && (
          <Badge variant="premium" className="text-[10px]">
            {item.severidade}
          </Badge>
        )}
        <span className="font-ds2-mono text-[11px] text-ds2-text-subtle">{refCurta(item.id)}</span>
        <button
          type="button"
          onClick={onCopiar}
          className="ml-auto flex min-h-11 items-center gap-1.5 font-ds2-mono text-[11px] text-ds2-text-muted transition-colors hover:text-ds2-text-primary"
        >
          {copiado ? (
            <Check className="h-3.5 w-3.5 text-ds2-orange" />
          ) : (
            <ClipboardCopy className="h-3.5 w-3.5" />
          )}
          copiar
        </button>
      </div>

      <p className="font-ds2-sans text-sm leading-relaxed break-words text-ds2-text-primary">
        {item.mensagem}
      </p>

      <div className="space-y-1 font-ds2-mono text-[11px] text-ds2-text-muted">
        <p className="break-all">{item.rota ?? 'rota não registrada'}</p>
        <p>
          {dataLegivel(item.createdAt)} · {item.logado ? 'logado' : 'anônimo'}
          {item.email ? ` · ${item.email}` : ''}
        </p>
        {aparelho && <p className="break-all">{aparelho}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-ds2-border-subtle pt-3">
        <label className="sr-only" htmlFor={`status-${item.id}`}>
          Status do feedback
        </label>
        <select
          id={`status-${item.id}`}
          value={item.status}
          disabled={salvando}
          onChange={(e) => void salvar({ status: e.target.value })}
          className="min-h-[44px] rounded-ds2-card border border-ds2-border-subtle bg-ds2-bg-panel px-3 font-ds2-mono text-xs text-ds2-text-primary outline-none focus:border-ds2-orange/50"
        >
          {STATUS_FEEDBACK.map((status) => (
            <option key={status} value={status} className="bg-ds2-bg-panel text-ds2-text-primary">
              {ROTULO_STATUS[status]}
            </option>
          ))}
        </select>

        {item.issueRef && (
          <span className="font-ds2-mono text-[11px] text-ds2-amber-soft">{item.issueRef}</span>
        )}

        <button
          type="button"
          onClick={() => setAbertoTriagem((atual) => !atual)}
          className="ml-auto flex min-h-11 items-center font-ds2-mono text-[11px] text-ds2-text-muted transition-colors hover:text-ds2-text-primary"
        >
          {abertoTriagem ? 'fechar' : 'nota e ref'}
        </button>
      </div>

      {abertoTriagem && (
        <div className="space-y-2">
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={2}
            placeholder="O que você entendeu do problema"
            aria-label="Nota de triagem"
            className={`${ESTILO_CAMPO} resize-y py-3`}
          />
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              placeholder="ISSUE-321"
              aria-label="Referência da issue"
              className={`${ESTILO_CAMPO} sm:w-40`}
            />
            <Button
              type="button"
              variant="secondary"
              className="py-2.5 text-xs"
              disabled={salvando}
              onClick={() => void salvar({ notasAdmin: notas, issueRef: ref })}
            >
              {salvando ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              salvar
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
