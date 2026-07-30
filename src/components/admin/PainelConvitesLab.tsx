'use client'

// =============================================================================
// PAINEL DE CONVITES DO BETA DO LAB — ISSUE-318
// A rotina de convite que era SQL manual virou botão: fila unificada de
// interessados (lab_leads + radar_leads.lab_interest) → convidar (libera
// authorized_emails + manda o e-mail Resend) → acompanhar status → revogar.
// A API valida a sessão de admin no servidor; aqui é só orquestração de tela.
// =============================================================================

import * as React from 'react'
import Link from 'next/link'
import { Loader2, Mail, RefreshCw, Send, UserX } from 'lucide-react'

import { Badge, Button, Card, Eyebrow, PageContainer, SectionTitle } from '@/components/ds2'

interface LeadFila {
  email: string
  nome: string | null
  origem: 'pagina_lab' | 'radar'
  criadoEm: string
}

interface Convidado {
  email: string
  expiraEm: string
  notes: string | null
  convidadoEm: string | null
  temConta: boolean
  ultimoAcesso: string | null
  ativo: boolean
}

const ROTULO_ORIGEM: Record<LeadFila['origem'], string> = {
  pagina_lab: 'página /lab',
  radar: 'radar',
}

function dataCurta(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR')
}

export function PainelConvitesLab() {
  const [fila, setFila] = React.useState<LeadFila[]>([])
  const [convidados, setConvidados] = React.useState<Convidado[]>([])
  const [carregando, setCarregando] = React.useState(true)
  const [enviando, setEnviando] = React.useState<string | null>(null)
  const [aviso, setAviso] = React.useState<string | null>(null)
  const [erro, setErro] = React.useState<string | null>(null)
  const [emailManual, setEmailManual] = React.useState('')
  const [nomeManual, setNomeManual] = React.useState('')
  const [validade, setValidade] = React.useState('2026-12-31')

  const carregar = React.useCallback(async () => {
    setCarregando(true)
    setErro(null)
    try {
      const res = await fetch('/api/admin/lab-beta')
      if (!res.ok) throw new Error(String(res.status))
      const data = (await res.json()) as { fila: LeadFila[]; convidados: Convidado[] }
      setFila(data.fila)
      setConvidados(data.convidados)
    } catch {
      setErro('Não consegui carregar o painel — recarrega a página.')
    } finally {
      setCarregando(false)
    }
  }, [])

  React.useEffect(() => {
    void carregar()
  }, [carregar])

  const convidar = React.useCallback(
    async (email: string, nome: string | null, reenviar = false) => {
      setEnviando(email)
      setAviso(null)
      setErro(null)
      try {
        const res = await fetch('/api/admin/lab-beta', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, nome, expiraEm: validade, reenviar }),
        })
        const data = (await res.json()) as {
          success?: boolean
          emailEnviado?: boolean
          motivoEmail?: string | null
          error?: string
        }
        if (!res.ok || !data.success) {
          setErro(data.error ?? 'Não consegui convidar — tenta de novo.')
          return
        }
        setAviso(
          data.emailEnviado
            ? `Convite enviado pra ${email} — acesso liberado até ${dataCurta(validade)}.`
            : `Acesso liberado pra ${email}, mas o E-MAIL FALHOU${
                data.motivoEmail ? ` — motivo do Resend: "${data.motivoEmail}"` : ''
              }. Manda manualmente (template no doc da rotina) ou me traz esse motivo.`,
        )
        await carregar()
      } catch {
        setErro('Não consegui convidar — tenta de novo.')
      } finally {
        setEnviando(null)
      }
    },
    [carregar, validade],
  )

  const revogar = React.useCallback(
    async (email: string) => {
      if (!window.confirm(`Revogar o acesso de ${email}? O login dele para de funcionar hoje.`)) return
      setEnviando(email)
      setAviso(null)
      setErro(null)
      try {
        const res = await fetch('/api/admin/lab-beta', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })
        const data = (await res.json()) as { success?: boolean; error?: string }
        if (!res.ok || !data.success) {
          setErro(data.error ?? 'Não consegui revogar.')
          return
        }
        setAviso(`Acesso de ${email} revogado.`)
        await carregar()
      } catch {
        setErro('Não consegui revogar.')
      } finally {
        setEnviando(null)
      }
    },
    [carregar],
  )

  return (
    <div className="ds2-bg-ambient min-h-screen">
      <PageContainer className="max-w-4xl space-y-8 pb-16 pt-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Eyebrow>admin · lab</Eyebrow>
            <SectionTitle as="h1" className="mt-2 text-[28px] md:text-[36px]">
              Convites do beta
            </SectionTitle>
            <p className="mt-2 max-w-[640px] font-ds2-sans text-sm leading-relaxed text-ds2-text-secondary">
              A fila junta quem pediu convite na página do Lab e quem marcou interesse no radar.
              Convidar libera o acesso (até a validade abaixo) e envia o e-mail na hora.
            </p>
          </div>
          <Link
            href="/admin/analytics"
            className="min-h-[44px] rounded-ds2-pill border border-ds2-border-subtle px-4 py-2.5 font-ds2-sans text-xs text-ds2-text-secondary hover:bg-white/5"
          >
            ver Analytics →
          </Link>
        </div>

        {(aviso || erro) && (
          <Card className={erro ? 'border-ds2-magenta/40' : 'border-ds2-orange/30'}>
            <p className="font-ds2-sans text-sm text-ds2-text-primary">{erro ?? aviso}</p>
          </Card>
        )}

        {/* Convite manual + validade padrão */}
        <Card className="space-y-4">
          <Eyebrow>convidar por e-mail (fora da fila)</Eyebrow>
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              type="email"
              value={emailManual}
              onChange={(e) => setEmailManual(e.target.value)}
              placeholder="email@exemplo.com"
              aria-label="E-mail do convidado"
              className="min-h-[44px] flex-1 rounded-ds2-card border border-ds2-border-subtle bg-ds2-surface-glass px-4 text-base text-ds2-text-primary placeholder-ds2-text-muted outline-none focus:border-ds2-orange/50"
            />
            <input
              type="text"
              value={nomeManual}
              onChange={(e) => setNomeManual(e.target.value)}
              placeholder="Nome (opcional, entra no e-mail)"
              aria-label="Nome do convidado"
              className="min-h-[44px] flex-1 rounded-ds2-card border border-ds2-border-subtle bg-ds2-surface-glass px-4 text-base text-ds2-text-primary placeholder-ds2-text-muted outline-none focus:border-ds2-orange/50"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 font-ds2-mono text-xs text-ds2-text-muted">
              acesso válido até
              <input
                type="date"
                value={validade}
                onChange={(e) => setValidade(e.target.value)}
                className="min-h-[44px] rounded-ds2-card border border-ds2-border-subtle bg-ds2-surface-glass px-3 text-base text-ds2-text-primary outline-none focus:border-ds2-orange/50"
              />
            </label>
            <Button
              type="button"
              variant="primary"
              disabled={enviando !== null || !emailManual.trim()}
              onClick={() => void convidar(emailManual.toLowerCase().trim(), nomeManual || null)}
            >
              {enviando === emailManual.toLowerCase().trim() ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Convidar
            </Button>
          </div>
        </Card>

        {/* A fila */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <Eyebrow>na fila ({fila.length})</Eyebrow>
            <Button type="button" variant="secondary" className="py-2 text-xs" onClick={() => void carregar()}>
              <RefreshCw className={`h-3.5 w-3.5 ${carregando ? 'animate-spin' : ''}`} /> atualizar
            </Button>
          </div>

          {carregando && fila.length === 0 ? (
            <Card>
              <p className="font-ds2-sans text-sm text-ds2-text-muted">Carregando a fila…</p>
            </Card>
          ) : fila.length === 0 ? (
            <Card>
              <p className="font-ds2-sans text-sm text-ds2-text-muted">
                Ninguém esperando — quem entrar na lista aparece aqui.
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {fila.map((lead) => (
                <Card key={lead.email} className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <div className="min-w-0">
                    <p className="truncate font-ds2-sans text-sm font-medium text-ds2-text-primary">
                      {lead.email}
                    </p>
                    <p className="font-ds2-mono text-[11px] text-ds2-text-muted">
                      {lead.nome ? `${lead.nome} · ` : ''}
                      {ROTULO_ORIGEM[lead.origem]} · {dataCurta(lead.criadoEm)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    className="py-2.5 text-xs"
                    disabled={enviando !== null}
                    onClick={() => void convidar(lead.email, lead.nome)}
                  >
                    {enviando === lead.email ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Mail className="h-4 w-4" />
                    )}
                    Convidar
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Convidados */}
        <section className="space-y-3">
          <Eyebrow>convidados do beta ({convidados.length})</Eyebrow>
          {convidados.length === 0 ? (
            <Card>
              <p className="font-ds2-sans text-sm text-ds2-text-muted">
                Nenhum convite enviado ainda — o primeiro sai da fila acima.
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {convidados.map((c) => (
                <Card key={c.email} className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <div className="min-w-0">
                    <p className="truncate font-ds2-sans text-sm font-medium text-ds2-text-primary">
                      {c.email}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {!c.ativo ? (
                        <Badge className="text-[10px]">revogado/expirado</Badge>
                      ) : c.temConta ? (
                        <Badge variant="premium" className="text-[10px]">
                          conta criada · último acesso {dataCurta(c.ultimoAcesso)}
                        </Badge>
                      ) : (
                        <Badge className="text-[10px]">convite enviado, sem conta ainda</Badge>
                      )}
                      <span className="font-ds2-mono text-[11px] text-ds2-text-muted">
                        válido até {dataCurta(c.expiraEm)}
                      </span>
                    </div>
                  </div>
                  {c.ativo && (
                    <div className="flex flex-wrap gap-2">
                      {!c.temConta && (
                        <Button
                          type="button"
                          variant="secondary"
                          className="py-2.5 text-xs"
                          disabled={enviando !== null}
                          onClick={() => void convidar(c.email, null, true)}
                        >
                          {enviando === c.email ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Mail className="h-4 w-4" />
                          )}
                          Reenviar e-mail
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="secondary"
                        className="py-2.5 text-xs"
                        disabled={enviando !== null}
                        onClick={() => void revogar(c.email)}
                      >
                        {enviando === c.email ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <UserX className="h-4 w-4" />
                        )}
                        Revogar
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </section>
      </PageContainer>
    </div>
  )
}
