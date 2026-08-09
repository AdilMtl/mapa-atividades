'use client'

// =============================================================================
// FUNIL — SELEÇÃO, CONFIRMAÇÃO E DISPARO (ISSUE-601C)
// Telas 3 e 4 do protótipo aprovado (docs/marketing/mockups/601-painel-funil.html)
// + a tela de resultado por pessoa. Fluxo do §5 da spec:
//   segmento → lista com checkbox → confirmação (nada sai antes dela) → disparo.
//
// A confirmação aqui é UX; a validação de verdade (opt-in, descadastro,
// duplicidade) mora no servidor (/api/admin/funil/disparar) — esta tela só
// mostra os números pro dono decidir com clareza. Selecionar UMA pessoa só
// (ex.: o próprio dono, pra se testar) é o caminho mais curto, de propósito.
// =============================================================================

import * as React from 'react'
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Loader2,
  Repeat2,
  Send,
  ShieldCheck,
  XCircle,
} from 'lucide-react'

import { Badge, Button, Card, Eyebrow } from '@/components/ds2'
import type { VersaoTemplate } from '@/lib/marketing/templates'

interface ResumoSegmento {
  id: string
  rotulo: string
  templateSlug: string
  total: number
}

interface ContatoLista {
  email: string
  nome: string | null
  diasSemContato: number | null
  templatesRecebidos: string[]
  radarRotulo: string | null
}

interface Excluidos {
  semOptin: number
  descadastrados: number
}

interface ResumoTemplate {
  slug: string
  versoes: VersaoTemplate[]
}

interface RespostaDisparo {
  resultados: { email: string; status: 'enviado' | 'falhou'; erro: string | null }[]
  bloqueados: { email: string; status: string; motivo: string }[]
  resumo: { enviados: number; falharam: number; bloqueados: number }
  avisoRegistro: string | null
  error?: string
}

function primeiroNome(c: ContatoLista): string {
  return c.nome?.trim() ? c.nome : '(sem nome)'
}

/** Versão ativa com conteúdo — a única coisa que um disparo consegue enviar. */
function versaoAtiva(t: ResumoTemplate | undefined): VersaoTemplate | null {
  const ativa = t?.versoes.find((v) => v.status === 'ativo')
  if (!ativa || !ativa.assunto.trim() || !ativa.corpo.trim()) return null
  return ativa
}

function BarraInferior({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ds2-border-subtle bg-[rgba(8,17,15,0.96)] px-5 py-3 backdrop-blur-md [padding-bottom:calc(12px+env(safe-area-inset-bottom))]">
      <div className="mx-auto flex max-w-4xl items-center gap-2.5">{children}</div>
    </div>
  )
}

export function FunilDisparo({
  segmento,
  onVoltar,
  onDisparou,
}: {
  segmento: ResumoSegmento
  onVoltar: () => void
  onDisparou: () => void
}) {
  const [etapa, setEtapa] = React.useState<'pessoas' | 'confirmar' | 'resultado'>('pessoas')
  const [contatos, setContatos] = React.useState<ContatoLista[] | null>(null)
  const [excluidos, setExcluidos] = React.useState<Excluidos>({ semOptin: 0, descadastrados: 0 })
  const [templates, setTemplates] = React.useState<ResumoTemplate[] | null>(null)
  const [erro, setErro] = React.useState<string | null>(null)
  const [selecionados, setSelecionados] = React.useState<Set<string>>(new Set())
  const [templateSlug, setTemplateSlug] = React.useState(segmento.templateSlug)
  const [reenviarTambem, setReenviarTambem] = React.useState(false)
  const [disparando, setDisparando] = React.useState(false)
  const [resposta, setResposta] = React.useState<RespostaDisparo | null>(null)

  React.useEffect(() => {
    let cancelado = false
    async function carregar() {
      setErro(null)
      try {
        const [funilRes, templatesRes] = await Promise.all([
          fetch(`/api/admin/funil?segmento=${segmento.id}&tamanho=200`),
          fetch('/api/admin/templates'),
        ])
        if (!funilRes.ok || !templatesRes.ok) throw new Error('fetch')
        const funil = (await funilRes.json()) as { contatos: ContatoLista[]; excluidos?: Excluidos }
        const tpls = (await templatesRes.json()) as { templates: ResumoTemplate[] }
        if (cancelado) return
        setContatos(funil.contatos)
        setExcluidos(funil.excluidos ?? { semOptin: 0, descadastrados: 0 })
        setTemplates(tpls.templates)
      } catch {
        if (!cancelado) setErro('Não consegui carregar a lista — volta e tenta de novo.')
      }
    }
    void carregar()
    return () => {
      cancelado = true
    }
  }, [segmento.id])

  const selecionadosLista = (contatos ?? []).filter((c) => selecionados.has(c.email))
  const jaReceberamSelecionados = selecionadosLista.filter((c) =>
    c.templatesRecebidos.includes(templateSlug),
  )
  const vaoReceber = reenviarTambem
    ? selecionadosLista.length
    : selecionadosLista.length - jaReceberamSelecionados.length
  const templateAtivo = versaoAtiva(templates?.find((t) => t.slug === templateSlug))
  const podeDisparar = vaoReceber > 0 && !!templateAtivo && !disparando

  function alternar(email: string) {
    setSelecionados((atual) => {
      const novo = new Set(atual)
      if (novo.has(email)) novo.delete(email)
      else novo.add(email)
      return novo
    })
  }

  async function disparar() {
    if (!podeDisparar) return
    setDisparando(true)
    setErro(null)
    try {
      const res = await fetch('/api/admin/funil/disparar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_slug: templateSlug,
          emails: [...selecionados],
          forcar_reenvio: reenviarTambem,
        }),
      })
      const data = (await res.json()) as RespostaDisparo
      if (!res.ok) {
        setErro(data.error ?? 'Não consegui disparar — nada foi enviado.')
        return
      }
      setResposta(data)
      setEtapa('resultado')
      onDisparou()
    } catch {
      setErro('Erro de rede no disparo — confere o registro na aba Templates antes de repetir.')
    } finally {
      setDisparando(false)
    }
  }

  // ---------------------------------------------------------------- resultado
  if (etapa === 'resultado' && resposta) {
    return (
      <div className="space-y-4">
        <div>
          <Eyebrow>resultado do disparo</Eyebrow>
          <h2 className="mt-2 font-ds2-serif text-2xl text-ds2-text-primary">
            {resposta.resumo.enviados} enviado{resposta.resumo.enviados === 1 ? '' : 's'}
            {resposta.resumo.falharam > 0 && `, ${resposta.resumo.falharam} falhou/falharam`}
          </h2>
          <p className="mt-1 font-ds2-sans text-sm text-ds2-text-secondary">
            Tudo isto ficou gravado no registro de envios — inclusive as falhas, com motivo.
          </p>
        </div>

        {resposta.avisoRegistro && (
          <Card className="border-ds2-magenta/40">
            <p className="font-ds2-sans text-sm text-ds2-text-primary">{resposta.avisoRegistro}</p>
          </Card>
        )}

        <div className="space-y-1.5">
          {resposta.resultados.map((r) => (
            <Card key={r.email} className="flex items-center gap-3 py-3">
              {r.status === 'enviado' ? (
                <CheckCircle2 className="h-[18px] w-[18px] shrink-0 text-[#22c55e]" />
              ) : (
                <XCircle className="h-[18px] w-[18px] shrink-0 text-ds2-magenta" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-ds2-mono text-[13px] text-ds2-text-primary">{r.email}</p>
                {r.erro && <p className="font-ds2-sans text-xs text-ds2-text-muted">{r.erro}</p>}
              </div>
              <Badge className="shrink-0 text-[10px]">{r.status}</Badge>
            </Card>
          ))}
          {resposta.bloqueados.map((b) => (
            <Card key={b.email} className="flex items-center gap-3 py-3 opacity-70">
              <ShieldCheck className="h-[18px] w-[18px] shrink-0 text-ds2-text-muted" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-ds2-mono text-[13px] text-ds2-text-primary">{b.email}</p>
                <p className="font-ds2-sans text-xs text-ds2-text-muted">{b.motivo}</p>
              </div>
              <Badge className="shrink-0 text-[10px]">bloqueado</Badge>
            </Card>
          ))}
        </div>

        <Button type="button" variant="secondary" onClick={onVoltar}>
          <ArrowLeft className="h-4 w-4" /> Voltar aos segmentos
        </Button>
      </div>
    )
  }

  // -------------------------------------------------------------- confirmação
  if (etapa === 'confirmar') {
    return (
      <div className="space-y-4 pb-24">
        <button
          type="button"
          onClick={() => setEtapa('pessoas')}
          className="flex min-h-[44px] items-center gap-2 font-ds2-mono text-[13px] text-ds2-text-subtle"
        >
          <ArrowLeft className="h-4 w-4" /> Lista
        </button>

        <div>
          <h2 className="font-ds2-serif text-2xl text-ds2-text-primary">Confirmar disparo</h2>
          <p className="mt-1 font-ds2-sans text-sm text-ds2-text-secondary">Nada sai antes desta tela.</p>
        </div>

        {erro && (
          <Card className="border-ds2-magenta/40">
            <p className="font-ds2-sans text-sm text-ds2-text-primary">{erro}</p>
          </Card>
        )}

        <div className="relative">
          <select
            value={templateSlug}
            onChange={(e) => {
              setTemplateSlug(e.target.value)
              setReenviarTambem(false)
            }}
            className="min-h-[48px] w-full appearance-none rounded-ds2-card border border-ds2-border-medium bg-ds2-surface-glass px-4 pr-11 font-ds2-mono text-[13px] text-ds2-text-primary outline-none focus:border-ds2-orange/50"
          >
            {(templates ?? []).map((t) => {
              const ativa = versaoAtiva(t)
              return (
                <option key={t.slug} value={t.slug} disabled={!ativa}>
                  {t.slug}
                  {t.slug === segmento.templateSlug ? ' (designado)' : ''}
                  {ativa ? ` — v${ativa.versao}` : ' — sem versão ativa'}
                </option>
              )
            })}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ds2-text-subtle" />
        </div>

        {!templateAtivo && (
          <Card className="border-ds2-magenta/40">
            <p className="font-ds2-sans text-sm text-ds2-text-primary">
              Este template não tem versão ativa com conteúdo — ativa uma na aba Templates antes de
              disparar.
            </p>
          </Card>
        )}

        <div className="rounded-ds2-panel border border-ds2-border-subtle bg-ds2-surface-glass px-5">
          <div className="flex items-center justify-between gap-3 border-b border-ds2-border-subtle py-4">
            <p className="flex items-center gap-2.5 font-ds2-sans text-sm text-ds2-text-secondary">
              <Send className="h-4 w-4 text-ds2-text-muted" /> Vão receber agora
            </p>
            <p className="font-ds2-serif text-[26px] leading-none text-[#22c55e]">{vaoReceber}</p>
          </div>
          <div className="border-b border-ds2-border-subtle py-4">
            <div className="flex items-center justify-between gap-3">
              <p className="flex items-center gap-2.5 font-ds2-sans text-sm text-ds2-text-secondary">
                <Repeat2 className="h-4 w-4 text-ds2-text-muted" /> Já receberam esse template
              </p>
              <p className="font-ds2-serif text-[26px] leading-none text-ds2-text-muted">
                {jaReceberamSelecionados.length}
              </p>
            </div>
            {jaReceberamSelecionados.length > 0 && (
              <label className="mt-2 flex min-h-[44px] cursor-pointer items-center gap-2.5 font-ds2-sans text-[13px] text-ds2-text-secondary">
                <input
                  type="checkbox"
                  checked={reenviarTambem}
                  onChange={(e) => setReenviarTambem(e.target.checked)}
                  className="h-5 w-5 accent-[#D97706]"
                />
                Reenviar também pra quem já recebeu (é a segunda confirmação)
              </label>
            )}
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-ds2-border-subtle py-4">
            <p className="flex items-center gap-2.5 font-ds2-sans text-sm text-ds2-text-secondary">
              <ShieldCheck className="h-4 w-4 text-ds2-text-muted" /> Sem opt-in (fora da lista)
            </p>
            <p className="font-ds2-serif text-[26px] leading-none text-ds2-text-muted">{excluidos.semOptin}</p>
          </div>
          <div className="flex items-center justify-between gap-3 py-4">
            <p className="flex items-center gap-2.5 font-ds2-sans text-sm text-ds2-text-secondary">
              <ShieldCheck className="h-4 w-4 text-ds2-text-muted" /> Descadastrados (fora da lista)
            </p>
            <p className="font-ds2-serif text-[26px] leading-none text-ds2-text-muted">
              {excluidos.descadastrados}
            </p>
          </div>
        </div>

        <Card className="flex gap-2.5 border-dashed border-ds2-border-medium">
          <p className="font-ds2-sans text-xs leading-relaxed text-ds2-text-muted">
            Os bloqueados por opt-in ou descadastro <strong className="text-ds2-text-secondary">não podem</strong>{' '}
            ser forçados — é LGPD, não preferência. Eles nem aparecem na lista de seleção; o servidor
            revalida tudo de novo antes de enviar.
          </p>
        </Card>

        <BarraInferior>
          <p className="flex-1 font-ds2-mono text-xs uppercase tracking-[0.04em] text-ds2-text-subtle">
            confirmação final
          </p>
          <Button type="button" variant="primary" disabled={!podeDisparar} onClick={() => void disparar()}>
            {disparando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Disparar {vaoReceber}
          </Button>
        </BarraInferior>
      </div>
    )
  }

  // ------------------------------------------------------------------ pessoas
  return (
    <div className="space-y-4 pb-24">
      <button
        type="button"
        onClick={onVoltar}
        className="flex min-h-[44px] items-center gap-2 font-ds2-mono text-[13px] text-ds2-text-subtle"
      >
        <ArrowLeft className="h-4 w-4" /> Segmentos
      </button>

      <div>
        <h2 className="font-ds2-serif text-2xl text-ds2-text-primary">{segmento.rotulo}</h2>
        <p className="mt-1 font-ds2-sans text-sm text-ds2-text-secondary">
          {contatos ? contatos.length : segmento.total} pessoa{(contatos?.length ?? segmento.total) === 1 ? '' : 's'} ·
          e-mail designado{' '}
          <span className="font-ds2-mono text-ds2-amber-soft">{segmento.templateSlug}</span>
        </p>
        {excluidos.semOptin + excluidos.descadastrados > 0 && (
          <p className="mt-1 font-ds2-sans text-xs text-ds2-text-muted">
            Fora da lista por consentimento: {excluidos.semOptin} sem opt-in ·{' '}
            {excluidos.descadastrados} descadastrado{excluidos.descadastrados === 1 ? '' : 's'}.
          </p>
        )}
      </div>

      {erro && (
        <Card className="border-ds2-magenta/40">
          <p className="font-ds2-sans text-sm text-ds2-text-primary">{erro}</p>
        </Card>
      )}

      {!contatos ? (
        <Card>
          <p className="font-ds2-sans text-sm text-ds2-text-muted">Carregando a lista…</p>
        </Card>
      ) : contatos.length === 0 ? (
        <Card>
          <p className="font-ds2-sans text-sm text-ds2-text-muted">Ninguém neste segmento agora.</p>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {contatos.map((c) => {
            const marcado = selecionados.has(c.email)
            return (
              <button
                key={c.email}
                type="button"
                onClick={() => alternar(c.email)}
                aria-pressed={marcado}
                className={`flex w-full items-start gap-3 rounded-ds2-card border p-4 text-left transition-colors ${
                  marcado
                    ? 'border-ds2-orange/55 bg-ds2-orange/10'
                    : 'border-ds2-border-subtle bg-ds2-surface-glass'
                }`}
              >
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-[7px] border transition-colors ${
                    marcado ? 'border-ds2-orange bg-ds2-orange' : 'border-ds2-border-medium'
                  }`}
                >
                  {marcado && <Check className="h-4 w-4 text-[#1E1005]" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-ds2-sans text-[15px] font-semibold text-ds2-text-primary">
                    {primeiroNome(c)}
                  </span>
                  <span className="block break-all font-ds2-mono text-[11.5px] text-ds2-text-muted">
                    {c.email}
                  </span>
                  <span className="mt-2 flex flex-wrap gap-1.5">
                    {c.radarRotulo && (
                      <Badge className="border-[rgba(59,130,246,0.4)] text-[10px] text-[#9dc0fb]">
                        {c.radarRotulo}
                      </Badge>
                    )}
                    {c.diasSemContato !== null && (
                      <Badge
                        variant={c.diasSemContato > 14 ? 'premium' : undefined}
                        className="text-[10px]"
                      >
                        <Clock className="mr-1 inline h-3 w-3" />
                        {c.diasSemContato}d sem contato
                      </Badge>
                    )}
                    {c.templatesRecebidos.map((slug) => (
                      <Badge key={slug} className="text-[10px] text-ds2-text-muted">
                        recebeu {slug}
                      </Badge>
                    ))}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      )}

      {contatos && contatos.length > 0 && (
        <BarraInferior>
          <p className="flex-1 font-ds2-mono text-xs uppercase tracking-[0.04em] text-ds2-text-subtle">
            <strong className="text-ds2-text-primary">{selecionados.size}</strong> selecionado
            {selecionados.size === 1 ? '' : 's'}
          </p>
          <Button
            type="button"
            variant="secondary"
            disabled={selecionados.size === 0}
            onClick={() => setSelecionados(new Set())}
          >
            Limpar
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={selecionados.size === 0}
            onClick={() => {
              setErro(null)
              setEtapa('confirmar')
            }}
          >
            <Send className="h-4 w-4" /> Template
          </Button>
        </BarraInferior>
      )}
    </div>
  )
}
