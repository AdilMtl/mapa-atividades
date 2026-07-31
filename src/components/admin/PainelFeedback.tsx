'use client'

// =============================================================================
// PAINEL DE TRIAGEM DE FEEDBACK — ISSUE-318E
// Fecha o ciclo que o dono pediu: ele registra pelo widget, tria aqui, clica em
// "copiar como markdown", cola em docs/revamp/feedback-inbox.md, e eu leio
// nativamente na sessão. O `issue_ref` é a costura com o 04_issue_backlog.md —
// é o que impede este inbox de virar um segundo backlog concorrente.
//
// Revisão de UX (mesma issue, depois do 1º uso no celular): a v1 dava o MESMO
// peso visual pra um bug que trava e pra um elogio. Numa fila de triagem, a
// primeira coisa que o olho precisa achar é o que está quebrado. Agora:
//   · COR = quanto o item cobra ação (magenta = conserto · âmbar = melhora o
//     produto · apagado = só registro). Três níveis, não um arco-íris.
//   · ÍCONE = categoria dentro do nível (lucide, nunca emoji — §6 do DS2).
//   · FAIXA LATERAL = severidade do bug, escaneável sem ler nada.
// A mensagem virou o maior elemento do card: é o conteúdo, o resto é apoio.
// Lista de cards, nunca tabela: multi-coluna no celular já foi problema real
// duas vezes (v3.11.28 e v3.11.29).
// =============================================================================

import * as React from 'react'
import {
  Bug,
  Check,
  ChevronDown,
  ClipboardCopy,
  Heart,
  HelpCircle,
  Lightbulb,
  Loader2,
  RefreshCw,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

import { Button, Card, Eyebrow, PageContainer, SectionTitle } from '@/components/ds2'
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
  type SeveridadeFeedback,
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

/** Cor = grau de cobrança. Ícone = categoria. Paleta DS2, sem cor inventada. */
const VISUAL_TIPO: Record<TipoFeedback, { rotulo: string; Icone: LucideIcon; cor: string }> = {
  bug: { rotulo: 'bug', Icone: Bug, cor: 'text-ds2-magenta' },
  confuso: { rotulo: 'confuso', Icone: HelpCircle, cor: 'text-ds2-amber-soft' },
  melhoria: { rotulo: 'melhoria', Icone: Wrench, cor: 'text-ds2-amber-soft' },
  ideia: { rotulo: 'ideia', Icone: Lightbulb, cor: 'text-ds2-amber-soft' },
  elogio: { rotulo: 'elogio', Icone: Heart, cor: 'text-ds2-text-muted' },
}

/** A faixa na lateral do card: dá pra varrer a fila sem ler uma palavra. */
const FAIXA_SEVERIDADE: Record<SeveridadeFeedback, string> = {
  trava: 'border-l-ds2-magenta',
  incomoda: 'border-l-ds2-magenta/40',
  cosmetico: 'border-l-ds2-border-medium',
}

/**
 * Status em 3 níveis, a MESMA gramática de cor dos tipos: pendente (laranja),
 * andando (âmbar), fechado (apagado). Cinco cores para cinco status seria
 * granularidade sem leitura — o olho não decora cinco.
 */
const PONTO_STATUS: Record<StatusFeedback, string> = {
  novo: 'bg-ds2-orange',
  triado: 'bg-ds2-amber-soft',
  em_execucao: 'bg-ds2-amber-soft',
  resolvido: 'bg-ds2-text-muted',
  descartado: 'bg-ds2-text-subtle',
}

interface Contadores {
  porTipo: Record<TipoFeedback, number>
  porStatus: Record<StatusFeedback, number>
  total: number
}

const ESTILO_CAMPO =
  'min-h-[44px] w-full rounded-ds2-card border border-ds2-border-subtle bg-ds2-surface-glass px-3 text-base text-ds2-text-primary placeholder-ds2-text-muted outline-none focus:border-ds2-orange/50'

/** Faixa de filtros: uma linha só, com máscara avisando que continua (318A2). */
const ESTILO_FAIXA =
  'flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [mask-image:linear-gradient(90deg,#000_0,#000_calc(100%-28px),transparent_100%)] [scrollbar-width:none] md:[mask-image:none] [&::-webkit-scrollbar]:hidden'

/**
 * Dois níveis de chip. O alvo de toque é ≥44px nos dois (regra do projeto) —
 * a hierarquia vem do PESO visual, não do tamanho: status é o eixo principal
 * da fila (borda sempre visível), tipo é recorte secundário (borda só no
 * hover/ativo). Facet zerado fica esmaecido: o olho vai pro que tem conteúdo.
 */
const ESTILO_CHIP = (ativo: boolean, secundario = false, vazio = false) =>
  [
    'flex min-h-11 shrink-0 items-center gap-1.5 rounded-ds2-pill border px-3 font-ds2-mono transition-colors',
    secundario ? 'text-[11px]' : 'text-xs',
    ativo
      ? 'border-ds2-orange/50 bg-ds2-orange/15 text-ds2-text-primary'
      : secundario
        ? 'border-transparent text-ds2-text-muted hover:border-ds2-border-subtle hover:text-ds2-text-secondary'
        : 'border-ds2-border-subtle text-ds2-text-secondary hover:border-ds2-border-medium',
    vazio && !ativo ? 'opacity-45' : '',
  ].join(' ')

const ESTILO_ROTULO_FILTRO = 'font-ds2-mono text-[10px] tracking-[0.13em] text-ds2-text-muted uppercase'

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
  const [filtroTipo, setFiltroTipo] = React.useState<TipoFeedback | 'todos'>('todos')
  const [carregando, setCarregando] = React.useState(true)
  const [erro, setErro] = React.useState<string | null>(null)
  const [copiado, setCopiado] = React.useState<string | null>(null)
  const [comoFunciona, setComoFunciona] = React.useState(false)

  const carregar = React.useCallback(async () => {
    setCarregando(true)
    setErro(null)
    try {
      const params = new URLSearchParams()
      if (filtroStatus !== 'todos') params.set('status', filtroStatus)
      if (filtroTipo !== 'todos') params.set('tipo', filtroTipo)
      const query = params.toString()
      const res = await fetch(`/api/admin/feedback${query ? `?${query}` : ''}`)
      if (!res.ok) throw new Error(String(res.status))
      const data = (await res.json()) as { itens: FeedbackLinha[]; contadores: Contadores }
      setItens(data.itens)
      setContadores(data.contadores)
    } catch {
      setErro('Não consegui carregar a fila — recarrega a página.')
    } finally {
      setCarregando(false)
    }
  }, [filtroStatus, filtroTipo])

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
      {/* pb generoso: o FAB de feedback flutua no canto e tapava o último card. */}
      <PageContainer className="max-w-4xl space-y-6 pb-28 pt-8">
        <div>
          <Eyebrow>admin · feedback</Eyebrow>
          <SectionTitle as="h1" className="mt-2 text-[28px] md:text-[36px]">
            O que chegou do uso real
          </SectionTitle>
          <button
            type="button"
            onClick={() => setComoFunciona((atual) => !atual)}
            className="-ml-1 flex min-h-11 items-center gap-1.5 px-1 font-ds2-mono text-[11px] text-ds2-text-muted transition-colors hover:text-ds2-text-primary"
          >
            como isso vira trabalho
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${comoFunciona ? 'rotate-180' : ''}`}
            />
          </button>
          {comoFunciona && (
            <p className="mt-1 max-w-[640px] font-ds2-sans text-sm leading-relaxed text-ds2-text-secondary">
              Cada item veio do botão de feedback, com a rota, o aparelho e a versão do deploy que
              estava no ar na hora. Tria aqui, copia como markdown e cola no{' '}
              <span className="font-ds2-mono text-xs">feedback-inbox.md</span>. Quando virar
              trabalho, preenche a ref da issue: é o que costura esta fila com o backlog planejado.
            </p>
          )}
        </div>

        {erro && (
          <Card className="border-ds2-magenta/40">
            <p className="font-ds2-sans text-sm text-ds2-text-primary">{erro}</p>
          </Card>
        )}

        {/* Um bloco de filtro só, com os dois eixos rotulados. Antes eram duas
            fileiras idênticas de pill + uma fileira de AÇÕES com a mesma forma
            logo abaixo: três camadas visualmente iguais, e nenhuma dizia o que
            filtrava. Rótulo resolve a ambiguidade; tirar as ações daqui mata a
            terceira camada (elas viraram cabeçalho da lista). */}
        <Card className="space-y-3 p-4">
          <div>
            <span className={ESTILO_ROTULO_FILTRO}>status</span>
            <div className={`${ESTILO_FAIXA} mt-2`}>
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
                    className={ESTILO_CHIP(ativo, false, quantidade === 0)}
                  >
                    {opcao !== 'todos' && (
                      <span className={`h-1.5 w-1.5 rounded-full ${PONTO_STATUS[opcao]}`} />
                    )}
                    {opcao === 'todos' ? 'todos' : ROTULO_STATUS[opcao]}
                    {typeof quantidade === 'number' && (
                      <span className="text-ds2-text-muted">{quantidade}</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="border-t border-ds2-border-subtle pt-3">
            <span className={ESTILO_ROTULO_FILTRO}>tipo</span>
            {/* Os contadores por tipo VIRARAM o filtro: na v1 ocupavam um card
                inteiro só informando, e a rota já aceitava ?tipo desde sempre. */}
            <div className={`${ESTILO_FAIXA} mt-2`}>
              <button
                type="button"
                onClick={() => setFiltroTipo('todos')}
                aria-pressed={filtroTipo === 'todos'}
                className={ESTILO_CHIP(filtroTipo === 'todos', true)}
              >
                tudo
                <span className="text-ds2-text-subtle">{contadores?.total ?? 0}</span>
              </button>
              {TIPOS_FEEDBACK.map((tipo) => {
                const { rotulo, Icone, cor } = VISUAL_TIPO[tipo]
                const ativo = filtroTipo === tipo
                const quantidade = contadores?.porTipo[tipo] ?? 0
                return (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => setFiltroTipo(ativo ? 'todos' : tipo)}
                    aria-pressed={ativo}
                    className={ESTILO_CHIP(ativo, true, quantidade === 0)}
                  >
                    <Icone className={`h-3.5 w-3.5 ${cor}`} />
                    {rotulo}
                    <span className="text-ds2-text-subtle">{quantidade}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </Card>

        {/* Cabeçalho da lista: dá um ponto de ancoragem entre o filtro e os
            cards, e é onde as ações da fila passam a morar. */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Eyebrow>
            fila · {itens.length} {itens.length === 1 ? 'item' : 'itens'}
          </Eyebrow>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => void carregar()}
              aria-label="Atualizar a fila"
              className="flex min-h-11 min-w-11 items-center justify-center rounded-ds2-pill text-ds2-text-muted transition-colors hover:text-ds2-text-primary"
            >
              <RefreshCw className={`h-4 w-4 ${carregando ? 'animate-spin' : ''}`} />
            </button>
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

        {/* O "copiado" era só visual: leitor de tela não recebia confirmação. */}
        <p aria-live="polite" className="sr-only">
          {copiado ? 'Copiado para a área de transferência' : ''}
        </p>

        {carregando && itens.length === 0 ? (
          <Card>
            <p className="font-ds2-sans text-sm text-ds2-text-muted">Carregando…</p>
          </Card>
        ) : itens.length === 0 ? (
          <Card>
            <p className="font-ds2-sans text-sm text-ds2-text-muted">
              {filtroStatus === 'novo' && filtroTipo === 'todos'
                ? 'Nada novo na fila. O que chegar pelo botão de feedback aparece aqui.'
                : 'Nenhum item com esse filtro.'}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {itens.map((item) => (
              <CardFeedback
                key={item.id}
                item={item}
                copiado={copiado === item.id}
                onCopiar={async () =>
                  avisarCopia(item.id, await copiar(formatarFeedbackMarkdown(item)))
                }
                onSalvo={(atualizado) =>
                  setItens((atuais) => atuais.map((i) => (i.id === atualizado.id ? atualizado : i)))
                }
                onErro={setErro}
              />
            ))}
          </div>
        )}
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

  const { rotulo, Icone, cor } = VISUAL_TIPO[item.tipo]
  const faixa = item.severidade ? FAIXA_SEVERIDADE[item.severidade] : 'border-l-transparent'
  const resolvido = item.status === 'resolvido' || item.status === 'descartado'

  const contexto = item.contexto ?? {}
  const aparelho = [
    dispositivoDoUserAgent(contexto.user_agent),
    contexto.viewport?.replace('x', '×'),
    contexto.app_version,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <Card className={`space-y-3 border-l-2 ${faixa} ${resolvido ? 'opacity-60' : ''}`}>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className={`flex items-center gap-1.5 font-ds2-mono text-xs ${cor}`}>
          <Icone className="h-4 w-4" />
          {rotulo}
        </span>
        {item.severidade && (
          <span
            className={`font-ds2-mono text-[11px] ${
              item.severidade === 'trava' ? 'text-ds2-magenta' : 'text-ds2-text-muted'
            }`}
          >
            · {item.severidade}
          </span>
        )}
        <span className="font-ds2-mono text-[11px] text-ds2-text-subtle">{refCurta(item.id)}</span>
        <button
          type="button"
          onClick={onCopiar}
          aria-label="Copiar este feedback como markdown"
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

      {/* A mensagem é o conteúdo do card — tudo o mais é apoio. */}
      <p className="font-ds2-sans text-[15px] leading-relaxed font-medium break-words text-ds2-text-primary">
        {item.mensagem}
      </p>

      {/* text-subtle (#70817B) em 11px não passa em contraste; virou muted. */}
      <div className="space-y-0.5 font-ds2-mono text-[11px] text-ds2-text-muted">
        <p className="break-all text-ds2-text-secondary">{item.rota ?? 'rota não registrada'}</p>
        <p className="break-all">
          {dataLegivel(item.createdAt)} · {item.logado ? 'logado' : 'anônimo'}
          {item.email ? ` · ${item.email}` : ''}
          {aparelho ? ` · ${aparelho}` : ''}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-ds2-border-subtle pt-3">
        {/* O select nativo era o elemento mais pesado do card: verde sólido que
            não aparece em nenhum outro lugar da tela, largura do maior rótulo e
            a setinha do sistema por cima. `appearance-none` + nosso chevron +
            ponto de status deixa ele no mesmo vocabulário do resto. */}
        <label className="sr-only" htmlFor={`status-${item.id}`}>
          Status do feedback
        </label>
        <div className="relative">
          <span
            className={`pointer-events-none absolute top-1/2 left-3 h-1.5 w-1.5 -translate-y-1/2 rounded-full ${PONTO_STATUS[item.status]}`}
          />
          <select
            id={`status-${item.id}`}
            value={item.status}
            disabled={salvando}
            onChange={(e) => void salvar({ status: e.target.value })}
            className="min-h-11 appearance-none rounded-ds2-pill border border-ds2-border-subtle bg-ds2-surface-glass pr-9 pl-7 font-ds2-mono text-xs text-ds2-text-primary outline-none focus:border-ds2-orange/50 disabled:opacity-60"
          >
            {STATUS_FEEDBACK.map((status) => (
              <option key={status} value={status} className="bg-ds2-bg-panel text-ds2-text-primary">
                {ROTULO_STATUS[status]}
              </option>
            ))}
          </select>
          {salvando ? (
            <Loader2 className="pointer-events-none absolute top-1/2 right-3 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-ds2-text-muted" />
          ) : (
            <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-3.5 w-3.5 -translate-y-1/2 text-ds2-text-muted" />
          )}
        </div>

        {item.issueRef && (
          <span className="font-ds2-mono text-[11px] text-ds2-amber-soft">{item.issueRef}</span>
        )}

        {/* Sem borda: o chevron já entrega que abre, e o status precisa ser o
            elemento mais forte desta linha (é a ação principal da triagem). */}
        <button
          type="button"
          onClick={() => setAbertoTriagem((atual) => !atual)}
          aria-expanded={abertoTriagem}
          className="ml-auto flex min-h-11 items-center gap-1.5 px-1 font-ds2-mono text-[11px] text-ds2-text-muted transition-colors hover:text-ds2-text-primary"
        >
          {item.notasAdmin ? 'ver a nota' : 'nota e ref'}
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${abertoTriagem ? 'rotate-180' : ''}`}
          />
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
