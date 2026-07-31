'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Check, Loader2, MessageSquarePlus, X } from 'lucide-react'

import { Button } from '@/components/ds2'
import { lerUtm } from '@/lib/analytics'
import { rotaPermiteFeedback } from '@/lib/feedback/supressao'
import {
  MENSAGEM_MAX,
  MENSAGEM_MIN,
  aceitaSeveridade,
  type SeveridadeFeedback,
  type TipoFeedback,
} from '@/lib/feedback/tipos'
import { cn } from '@/lib/utils'

import { useFeedbackSuprimido } from './SuprimirFeedback'

// =============================================================================
// WIDGET DE FEEDBACK (ISSUE-318D)
// Montado nos layouts de grupo — (publico), (app) e (lab) —, NUNCA no layout
// raiz: o raiz carrega o GTM e é trava crítica (07_mapa_tracking_ads.md).
// z-40: acima da página, abaixo dos modais existentes (z-50).
// =============================================================================

const TIPOS: { id: TipoFeedback; rotulo: string }[] = [
  { id: 'bug', rotulo: 'Não funcionou' },
  { id: 'confuso', rotulo: 'Não entendi' },
  { id: 'melhoria', rotulo: 'Dá pra melhorar' },
  { id: 'ideia', rotulo: 'Tive uma ideia' },
  { id: 'elogio', rotulo: 'Curti' },
]

const SEVERIDADES: { id: SeveridadeFeedback; rotulo: string }[] = [
  { id: 'trava', rotulo: 'Travou de vez' },
  { id: 'incomoda', rotulo: 'Dá pra seguir, mas incomoda' },
  { id: 'cosmetico', rotulo: 'Só o visual' },
]

const FOCAVEIS = 'button, [href], input, textarea, [tabindex]:not([tabindex="-1"])'

export function FeedbackWidget() {
  const pathname = usePathname()
  const suprimidoPorTela = useFeedbackSuprimido()

  const [montado, setMontado] = useState(false)
  const [aberto, setAberto] = useState(false)
  const [tipo, setTipo] = useState<TipoFeedback | null>(null)
  const [severidade, setSeveridade] = useState<SeveridadeFeedback | null>(null)
  const [mensagem, setMensagem] = useState('')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('') // honeypot — humano nunca preenche
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState('')

  const painelRef = useRef<HTMLDivElement>(null)
  const gatilhoRef = useRef<HTMLButtonElement>(null)

  // Só depois de hidratar. Dentro dos radares a supressão é ESTADO (efeito de
  // outro componente), então renderizar o FAB no HTML do servidor faria ele
  // piscar por cima da pergunta antes de sumir — justamente na tela que a §3
  // manda proteger.
  useEffect(() => setMontado(true), [])

  const fechar = useCallback(() => {
    setAberto(false)
    gatilhoRef.current?.focus()
  }, [])

  // Esc fecha e Tab circula dentro do painel (o resto da página fica inerte).
  useEffect(() => {
    if (!aberto) return

    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === 'Escape') {
        evento.preventDefault()
        fechar()
        return
      }
      if (evento.key !== 'Tab' || !painelRef.current) return

      const focaveis = Array.from(painelRef.current.querySelectorAll<HTMLElement>(FOCAVEIS))
        .filter((elemento) => elemento.offsetParent !== null)
      if (focaveis.length === 0) return

      const primeiro = focaveis[0]
      const ultimo = focaveis[focaveis.length - 1]
      if (evento.shiftKey && document.activeElement === primeiro) {
        evento.preventDefault()
        ultimo.focus()
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault()
        primeiro.focus()
      }
    }

    document.addEventListener('keydown', aoTeclar)
    const primeiroFocavel = painelRef.current?.querySelector<HTMLElement>(FOCAVEIS)
    primeiroFocavel?.focus()

    return () => document.removeEventListener('keydown', aoTeclar)
  }, [aberto, fechar])

  if (!montado || !rotaPermiteFeedback(pathname) || suprimidoPorTela) return null

  function reiniciar() {
    setTipo(null)
    setSeveridade(null)
    setMensagem('')
    setEmail('')
    setErro('')
    setEnviado(false)
  }

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault()
    if (!tipo || mensagem.trim().length < MENSAGEM_MIN) return

    setEnviando(true)
    setErro('')

    try {
      const resposta = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo,
          severidade: aceitaSeveridade(tipo) ? severidade : null,
          mensagem: mensagem.trim(),
          email: email.trim(),
          rota: pathname,
          website,
          contexto: {
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            rota_anterior: rotaAnteriorInterna(),
            utm: lerUtm(),
          },
        }),
      })

      // 400/429 têm resposta útil pra pessoa; qualquer outra falha é nossa e não
      // vira problema dela — o feedback não é transacional, então a gente agradece.
      if (resposta.status === 400 || resposta.status === 429) {
        const dados = await resposta.json().catch(() => null)
        setErro(dados?.error || 'Não deu pra registrar agora.')
        setEnviando(false)
        return
      }

      setEnviado(true)
    } catch {
      setEnviado(true)
    }
    setEnviando(false)
  }

  const podeEnviar = Boolean(tipo) && mensagem.trim().length >= MENSAGEM_MIN && !enviando

  return (
    <>
      <button
        ref={gatilhoRef}
        type="button"
        onClick={() => {
          reiniciar()
          setAberto(true)
        }}
        aria-label="Contar o que você achou desta página"
        className={cn(
          'fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40',
          'flex min-h-[44px] items-center gap-2 rounded-ds2-pill px-4',
          'border border-ds2-border-medium bg-ds2-bg-panel/95 backdrop-blur-sm',
          'font-ds2-sans text-sm font-semibold text-ds2-text-primary shadow-lg',
          'transition-colors hover:border-ds2-orange/40',
          aberto && 'hidden',
        )}
      >
        <MessageSquarePlus className="h-5 w-5 text-ds2-orange" />
        <span className="hidden sm:inline">Achou algo?</span>
      </button>

      {aberto && (
        <div className="fixed inset-0 z-40 flex flex-col justify-end sm:items-end sm:p-6">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={fechar}
            aria-hidden="true"
          />

          <div
            ref={painelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-titulo"
            className={cn(
              'relative z-10 flex h-full w-full flex-col overflow-y-auto',
              'border border-ds2-border-subtle bg-ds2-bg-deep p-5',
              'sm:h-auto sm:max-h-[80vh] sm:w-[380px] sm:rounded-ds2-panel',
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <h2
                id="feedback-titulo"
                className="font-ds2-serif text-xl leading-tight tracking-[-0.02em] text-ds2-text-primary"
              >
                {enviado ? 'Recebi, valeu.' : 'Achou algo por aqui?'}
              </h2>
              <button
                type="button"
                onClick={fechar}
                aria-label="Fechar"
                className="-mr-1 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-ds2-pill text-ds2-text-muted transition-colors hover:text-ds2-text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {enviado ? (
              <div className="mt-4 flex flex-col gap-4">
                <p className="flex items-start gap-2 text-sm leading-relaxed text-ds2-text-secondary">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-ds2-orange" />
                  {email.trim()
                    ? 'Se eu precisar de mais detalhe pra entender, te chamo nesse e-mail.'
                    : 'Isso entra na fila do que eu vou ajustando por aqui.'}
                </p>
                <Button type="button" variant="secondary" onClick={fechar}>
                  Voltar pra página
                </Button>
              </div>
            ) : (
              <form onSubmit={enviar} className="mt-4 flex flex-col gap-4">
                <input
                  type="text"
                  value={website}
                  onChange={(evento) => setWebsite(evento.target.value)}
                  name="website"
                  autoComplete="off"
                  tabIndex={-1}
                  className="hidden"
                  aria-hidden="true"
                />

                <fieldset>
                  <legend className="font-ds2-mono text-[11px] tracking-[0.13em] text-ds2-amber-soft uppercase">
                    O que rolou
                  </legend>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {TIPOS.map((opcao) => (
                      <button
                        key={opcao.id}
                        type="button"
                        onClick={() => {
                          setTipo(opcao.id)
                          if (!aceitaSeveridade(opcao.id)) setSeveridade(null)
                        }}
                        aria-pressed={tipo === opcao.id}
                        className={cn(
                          'min-h-[44px] rounded-ds2-pill border px-3.5 text-sm transition-colors',
                          tipo === opcao.id
                            ? 'border-ds2-orange/50 bg-ds2-orange/15 text-ds2-text-primary'
                            : 'border-ds2-border-subtle bg-ds2-surface-glass text-ds2-text-secondary hover:border-ds2-border-medium',
                        )}
                      >
                        {opcao.rotulo}
                      </button>
                    ))}
                  </div>
                </fieldset>

                {tipo && aceitaSeveridade(tipo) && (
                  <fieldset>
                    <legend className="font-ds2-mono text-[11px] tracking-[0.13em] text-ds2-amber-soft uppercase">
                      Quanto atrapalhou
                    </legend>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {SEVERIDADES.map((opcao) => (
                        <button
                          key={opcao.id}
                          type="button"
                          onClick={() => setSeveridade(opcao.id)}
                          aria-pressed={severidade === opcao.id}
                          className={cn(
                            'min-h-[44px] rounded-ds2-pill border px-3.5 text-sm transition-colors',
                            severidade === opcao.id
                              ? 'border-ds2-magenta/50 bg-ds2-magenta/15 text-ds2-text-primary'
                              : 'border-ds2-border-subtle bg-ds2-surface-glass text-ds2-text-secondary hover:border-ds2-border-medium',
                          )}
                        >
                          {opcao.rotulo}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                )}

                <label className="flex flex-col gap-2.5">
                  <span className="font-ds2-mono text-[11px] tracking-[0.13em] text-ds2-amber-soft uppercase">
                    Me conta
                  </span>
                  <textarea
                    value={mensagem}
                    onChange={(evento) => {
                      setMensagem(evento.target.value)
                      if (erro) setErro('')
                    }}
                    maxLength={MENSAGEM_MAX}
                    rows={4}
                    placeholder="O que você estava tentando fazer, e o que aconteceu?"
                    className="w-full resize-y rounded-ds2-card border border-ds2-border-subtle bg-ds2-surface-glass px-4 py-3 text-base text-ds2-text-primary placeholder-ds2-text-muted transition-colors outline-none focus:border-ds2-orange/50"
                  />
                </label>

                <label className="flex flex-col gap-2.5">
                  <span className="font-ds2-mono text-[11px] tracking-[0.13em] text-ds2-amber-soft uppercase">
                    Seu e-mail, se quiser resposta
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(evento) => {
                      setEmail(evento.target.value)
                      if (erro) setErro('')
                    }}
                    placeholder="opcional"
                    className="min-h-[44px] w-full rounded-ds2-card border border-ds2-border-subtle bg-ds2-surface-glass px-4 text-base text-ds2-text-primary placeholder-ds2-text-muted transition-colors outline-none focus:border-ds2-orange/50"
                  />
                </label>

                {erro && <p className="text-xs text-ds2-magenta">{erro}</p>}

                <Button type="submit" variant="primary" disabled={!podeEnviar}>
                  {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Enviar
                </Button>

                <p className="font-ds2-mono text-[11px] leading-relaxed text-ds2-text-subtle">
                  Junto vai a página em que você está, o tamanho da tela e a versão do site, pra eu
                  conseguir repetir o problema aqui. Detalhes na{' '}
                  <Link href="/privacidade" className="underline transition-colors hover:text-ds2-text-secondary">
                    política de privacidade
                  </Link>
                  .
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}

/** Só o caminho interno de onde a pessoa veio — referrer de fora não interessa. */
function rotaAnteriorInterna(): string | undefined {
  try {
    if (!document.referrer) return undefined
    const anterior = new URL(document.referrer)
    return anterior.origin === window.location.origin ? anterior.pathname : undefined
  } catch {
    return undefined
  }
}
