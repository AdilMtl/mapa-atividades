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
  ArrowLeft,
  Award,
  CheckCircle2,
  ChevronDown,
  Clock,
  Eye,
  EyeOff,
  Folder,
  Hammer,
  KeyRound,
  Loader2,
  Mail,
  RotateCcw,
  Save,
  UserPlus,
} from 'lucide-react'

import { Badge, Button, Card, Eyebrow, PageContainer, SectionTitle } from '@/components/ds2'
import { renderPreviewEmail } from '@/lib/marketing/email-preview'
import {
  SLUGS_GERENCIADOS,
  VARIAVEIS_VALIDAS,
  type VersaoTemplate,
  validarTemplate,
  versaoParaEditar,
} from '@/lib/marketing/templates'

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

interface ResumoTemplate {
  slug: string
  segmento: SegmentoId | null
  versoes: VersaoTemplate[]
  enviosCount: number
  ultimoEnvioEm: string | null
}

const ROTULO_SLUG: Record<string, string> = {
  convite_lab: 'Convite pro Lab',
  convidado_nao_entrou: 'Convidado, nunca entrou',
  primeiro_projeto: 'Primeiro projeto',
  retomar_projeto: 'Retomar projeto',
  convite_radar: 'Convite pro radar',
  pedido_de_relato: 'Pedido de relato',
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

function dataHora(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

const COR_STATUS: Record<VersaoTemplate['status'], string> = {
  ativo: 'bg-[#22c55e]',
  rascunho: 'bg-ds2-text-muted',
  arquivado: 'bg-ds2-border-medium',
}

const ROTULO_STATUS: Record<VersaoTemplate['status'], string> = {
  ativo: 'ativo',
  rascunho: 'rascunho',
  arquivado: 'arquivado',
}

function TemplateEditor({
  template,
  onVoltar,
  onSalvo,
}: {
  template: ResumoTemplate
  onVoltar: () => void
  onSalvo: () => Promise<void>
}) {
  const versaoInicial = versaoParaEditar(template.versoes)
  const [assunto, setAssunto] = React.useState(versaoInicial?.assunto ?? '')
  const [corpo, setCorpo] = React.useState(versaoInicial?.corpo ?? '')
  const [mostrarPrevia, setMostrarPrevia] = React.useState(false)
  const [salvando, setSalvando] = React.useState(false)
  const [ativando, setAtivando] = React.useState<number | null>(null)
  const [aviso, setAviso] = React.useState<string | null>(null)
  const [erro, setErro] = React.useState<string | null>(null)
  const corpoRef = React.useRef<HTMLTextAreaElement>(null)

  const validacao = validarTemplate(assunto, corpo)
  const versoesOrdenadas = [...template.versoes].sort((a, b) => b.versao - a.versao)

  function inserirVariavel(nome: string) {
    const textarea = corpoRef.current
    const trecho = `{{${nome}}}`
    if (!textarea) {
      setCorpo((c) => `${c}${trecho}`)
      return
    }
    const inicio = textarea.selectionStart ?? corpo.length
    const fim = textarea.selectionEnd ?? corpo.length
    const novo = `${corpo.slice(0, inicio)}${trecho}${corpo.slice(fim)}`
    setCorpo(novo)
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.selectionStart = textarea.selectionEnd = inicio + trecho.length
    })
  }

  async function salvar() {
    if (!validacao.valido) return
    setSalvando(true)
    setAviso(null)
    setErro(null)
    try {
      const res = await fetch('/api/admin/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: template.slug, assunto, corpo }),
      })
      const data = (await res.json()) as { template?: VersaoTemplate; error?: string }
      if (!res.ok || !data.template) {
        setErro(data.error ?? 'Não consegui salvar — tenta de novo.')
        return
      }
      setAviso(`Salvo como versão ${data.template.versao} (rascunho). A anterior continua intacta.`)
      await onSalvo()
    } catch {
      setErro('Não consegui salvar — tenta de novo.')
    } finally {
      setSalvando(false)
    }
  }

  async function ativarVersao(versao: number) {
    setAtivando(versao)
    setAviso(null)
    setErro(null)
    try {
      const res = await fetch('/api/admin/templates/ativar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: template.slug, versao }),
      })
      const data = (await res.json()) as { success?: boolean; error?: string }
      if (!res.ok || !data.success) {
        setErro(data.error ?? 'Não consegui ativar essa versão.')
        return
      }
      setAviso(`Versão ${versao} está ativa agora — é a que um disparo futuro vai usar.`)
      await onSalvo()
    } catch {
      setErro('Não consegui ativar essa versão.')
    } finally {
      setAtivando(null)
    }
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onVoltar}
        className="flex items-center gap-2 font-ds2-mono text-[13px] text-ds2-text-subtle"
      >
        <ArrowLeft className="h-4 w-4" /> Templates
      </button>

      <div>
        <p className="font-ds2-mono text-xs uppercase tracking-[0.08em] text-ds2-text-muted">{template.slug}</p>
        <h2 className="mt-1 font-ds2-serif text-2xl text-ds2-text-primary">
          {ROTULO_SLUG[template.slug] ?? template.slug}
        </h2>
        {template.segmento && (
          <p className="mt-1 font-ds2-sans text-xs text-ds2-text-muted">
            Segmento designado: <span className="text-ds2-text-secondary">{template.segmento}</span>
          </p>
        )}
      </div>

      {(aviso || erro) && (
        <Card className={erro ? 'border-ds2-magenta/40' : 'border-ds2-orange/30'}>
          <p className="font-ds2-sans text-sm text-ds2-text-primary">{erro ?? aviso}</p>
        </Card>
      )}

      <div className="space-y-2">
        <label className="block font-ds2-mono text-[11px] uppercase tracking-[0.12em] text-ds2-amber-soft">
          Assunto
        </label>
        <input
          value={assunto}
          onChange={(e) => setAssunto(e.target.value)}
          placeholder="Assunto do e-mail"
          className="min-h-[44px] w-full rounded-ds2-card border border-ds2-border-subtle bg-ds2-surface-glass px-4 text-base text-ds2-text-primary placeholder-ds2-text-muted outline-none focus:border-ds2-orange/50"
        />
      </div>

      <div className="space-y-2">
        <label className="block font-ds2-mono text-[11px] uppercase tracking-[0.12em] text-ds2-amber-soft">
          Corpo (markdown simples)
        </label>
        <textarea
          ref={corpoRef}
          value={corpo}
          onChange={(e) => setCorpo(e.target.value)}
          placeholder="Oi, {{primeiro_nome}}..."
          rows={10}
          className="w-full rounded-ds2-card border border-ds2-border-subtle bg-ds2-surface-glass px-4 py-3.5 text-base leading-relaxed text-ds2-text-primary placeholder-ds2-text-muted outline-none focus:border-ds2-orange/50"
        />
        <div className="flex flex-wrap gap-1.5">
          {VARIAVEIS_VALIDAS.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => inserirVariavel(v)}
              className="rounded-ds2-card border border-[rgba(211,76,117,0.3)] bg-[rgba(211,76,117,0.13)] px-2 py-1 font-ds2-mono text-[11px] text-[#F2B5C7]"
            >
              {`{{${v}}}`}
            </button>
          ))}
        </div>
      </div>

      {!validacao.valido && (assunto.trim() || corpo.trim()) && (
        <Card className="border-ds2-magenta/40">
          <ul className="list-disc space-y-1 pl-4 font-ds2-sans text-xs text-ds2-text-secondary">
            {validacao.erros.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </Card>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="primary" disabled={salvando || !validacao.valido} onClick={() => void salvar()}>
          {salvando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar como nova versão
        </Button>
        <Button type="button" variant="secondary" onClick={() => setMostrarPrevia((v) => !v)}>
          {mostrarPrevia ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {mostrarPrevia ? 'Fechar prévia' : 'Pré-visualizar'}
        </Button>
      </div>

      <Card className="flex gap-2.5 border-dashed border-ds2-border-medium">
        <p className="font-ds2-sans text-xs leading-relaxed text-ds2-text-muted">
          <strong className="text-ds2-text-secondary">Trava de segurança:</strong> salvar nunca sobrescreve — cria
          uma versão nova e a anterior continua intacta e restaurável. O rodapé de descadastro é injetado pelo
          sistema no envio e não faz parte do texto acima.
        </p>
      </Card>

      {mostrarPrevia && (
        <div className="overflow-hidden rounded-ds2-card border border-ds2-border-subtle">
          <iframe
            title={`Prévia — ${template.slug}`}
            srcDoc={renderPreviewEmail(assunto, corpo)}
            className="h-[560px] w-full bg-[#08110F]"
          />
        </div>
      )}

      {versoesOrdenadas.length > 0 && (
        <div className="space-y-2">
          <Eyebrow>histórico de versões</Eyebrow>
          <div className="space-y-1.5">
            {versoesOrdenadas.map((v) => (
              <Card key={v.id} className="flex items-center justify-between gap-3 py-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${COR_STATUS[v.status]}`} aria-hidden />
                  <div className="min-w-0">
                    <p className="truncate font-ds2-sans text-sm text-ds2-text-primary">
                      v{v.versao} · {ROTULO_STATUS[v.status]}
                    </p>
                    <p className="font-ds2-mono text-[11px] text-ds2-text-muted">
                      {dataHora(v.criadoEm)} · {v.criadoPor}
                    </p>
                  </div>
                </div>
                {v.status !== 'ativo' && v.assunto.trim() && v.corpo.trim() && (
                  <Button
                    type="button"
                    variant="secondary"
                    className="shrink-0 py-2 text-xs"
                    disabled={ativando !== null}
                    onClick={() => void ativarVersao(v.versao)}
                  >
                    {ativando === v.versao ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RotateCcw className="h-3.5 w-3.5" />
                    )}
                    Ativar
                  </Button>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Templates() {
  const [templates, setTemplates] = React.useState<ResumoTemplate[] | null>(null)
  const [carregando, setCarregando] = React.useState(true)
  const [erro, setErro] = React.useState<string | null>(null)
  const [editando, setEditando] = React.useState<string | null>(null)

  const carregar = React.useCallback(async () => {
    setCarregando(true)
    setErro(null)
    try {
      const res = await fetch('/api/admin/templates')
      if (!res.ok) throw new Error(String(res.status))
      const data = (await res.json()) as { templates: ResumoTemplate[] }
      setTemplates(data.templates)
    } catch {
      setErro('Não consegui carregar a pasta de templates — recarrega a página.')
    } finally {
      setCarregando(false)
    }
  }, [])

  React.useEffect(() => {
    void carregar()
  }, [carregar])

  const templateEditando = templates?.find((t) => t.slug === editando) ?? null

  if (templateEditando) {
    return (
      <TemplateEditor
        template={templateEditando}
        onVoltar={() => setEditando(null)}
        onSalvo={carregar}
      />
    )
  }

  return (
    <div className="space-y-3">
      {erro && (
        <Card className="border-ds2-magenta/40">
          <p className="font-ds2-sans text-sm text-ds2-text-primary">{erro}</p>
        </Card>
      )}

      {carregando && !templates ? (
        <Card>
          <p className="font-ds2-sans text-sm text-ds2-text-muted">Carregando a pasta de templates…</p>
        </Card>
      ) : (
        (templates ?? SLUGS_GERENCIADOS.map((slug) => ({ slug, segmento: null, versoes: [], enviosCount: 0, ultimoEnvioEm: null }))).map(
          (t) => {
            const atual = versaoParaEditar(t.versoes)
            const temConteudo = !!atual?.assunto.trim()
            return (
              <Card
                key={t.slug}
                className="cursor-pointer space-y-2"
                onClick={() => setEditando(t.slug)}
              >
                <div className="flex items-center gap-3">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${atual ? COR_STATUS[atual.status] : 'bg-ds2-border-medium'}`} aria-hidden />
                  <p className="flex-1 truncate font-ds2-mono text-[13px] text-ds2-text-primary">{t.slug}</p>
                  {atual && <Badge className="shrink-0 text-[10px]">v{atual.versao} · {ROTULO_STATUS[atual.status]}</Badge>}
                </div>
                <p className="truncate font-ds2-sans text-sm text-ds2-text-secondary">
                  {temConteudo ? atual!.assunto : '(rascunho vazio — aguardando copy)'}
                </p>
                <p className="font-ds2-mono text-[11px] text-ds2-text-muted">
                  {t.enviosCount > 0 ? `enviado ${t.enviosCount}x · último em ${dataHora(t.ultimoEnvioEm)}` : 'nunca enviado'}
                </p>
              </Card>
            )
          },
        )
      )}

      <Card className="flex gap-2.5 border-dashed border-ds2-border-medium">
        <p className="font-ds2-sans text-xs leading-relaxed text-ds2-text-muted">
          <strong className="text-ds2-text-secondary">Editar aqui muda o e-mail real.</strong> Toda alteração vira
          uma versão nova — a anterior nunca se perde. O layout (cores, cabeçalho, botão) continua sendo código;
          só assunto e corpo são editáveis aqui.
        </p>
      </Card>
    </div>
  )
}

export function PainelFunil() {
  const [aba, setAba] = React.useState<'jornada' | 'segmentos' | 'templates'>('jornada')
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
              { id: 'jornada', rotulo: 'Jornada', icone: Activity },
              { id: 'segmentos', rotulo: 'Segmentos', icone: UserPlus },
              { id: 'templates', rotulo: 'Templates', icone: Folder },
            ] as const
          ).map((opcao) => (
            <button
              key={opcao.id}
              type="button"
              onClick={() => setAba(opcao.id)}
              className={`flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-ds2-pill border px-3.5 text-sm font-ds2-sans transition-colors ${
                aba === opcao.id
                  ? 'border-ds2-orange/50 bg-ds2-orange/15 text-ds2-text-primary'
                  : 'border-ds2-border-subtle bg-transparent text-ds2-text-secondary hover:bg-white/5'
              }`}
            >
              <opcao.icone className="h-3.5 w-3.5" />
              {opcao.rotulo}
            </button>
          ))}
        </div>

        {aba === 'templates' ? (
          <Templates />
        ) : (
          <>
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
          </>
        )}
      </PageContainer>
    </div>
  )
}
