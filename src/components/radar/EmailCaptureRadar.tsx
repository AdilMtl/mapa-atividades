'use client'

import { useEffect, useState } from 'react'
import { Loader2, Mail, ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ds2'
import { track } from '@/lib/analytics'
import type { RadarKind } from '@/lib/radar/types'
import { cn } from '@/lib/utils'

interface EmailCaptureRadarProps {
  /** Cria a sessão sob demanda se a criação inicial (no mount) tiver falhado. */
  ensureSessionId: () => Promise<string | null>
  /** Qual radar originou esta captura — vira `assessment_type` nos eventos de analytics. */
  assessmentType: RadarKind
  ctaLabel: string
  onSuccess: (result: { triggerConversion: boolean }) => void
  className?: string
}

function validarEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function EmailCaptureRadar({
  ensureSessionId,
  assessmentType,
  ctaLabel,
  onSuccess,
  className,
}: EmailCaptureRadarProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [labInterest, setLabInterest] = useState(false)
  const [website, setWebsite] = useState('') // honeypot — humano nunca preenche
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    void ensureSessionId().then((sessionId) => {
      track('email_capture_viewed', { assessment_type: assessmentType, session_id: sessionId })
    })
  }, [ensureSessionId, assessmentType])

  function handleLabInterestChange(checked: boolean) {
    setLabInterest(checked)
    if (checked) {
      void ensureSessionId().then((sessionId) => {
        track('premium_interest_clicked', { assessment_type: assessmentType, session_id: sessionId })
      })
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!name.trim() || name.trim().length < 2) {
      setError('Digite seu nome')
      return
    }
    if (!validarEmail(email)) {
      setError('Digite um e-mail válido')
      return
    }

    setLoading(true)
    setError('')

    try {
      const sessionId = await ensureSessionId()
      if (!sessionId) {
        setError('Não foi possível conectar agora. Tente novamente em instantes.')
        setLoading(false)
        return
      }

      const response = await fetch('/api/radar/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          labInterest,
          website,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.error || 'Não foi possível salvar seu e-mail. Tente novamente.')
        setLoading(false)
        return
      }

      // Honeypot preenchido = bot (a rota finge sucesso sem gravar) — não conta como evento real.
      if (!website.trim()) {
        track('email_submitted', { assessment_type: assessmentType, premium_interest: labInterest, session_id: sessionId })
        if (labInterest) {
          track('premium_waitlist_submitted', { assessment_type: assessmentType, session_id: sessionId })
        }
      }

      onSuccess({ triggerConversion: Boolean(data.triggerConversion) })
    } catch {
      setError('Erro de conexão. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn('flex flex-col gap-3', className)}>
      <input
        type="text"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        name="website"
        autoComplete="off"
        tabIndex={-1}
        className="hidden"
        aria-hidden="true"
      />

      <input
        type="text"
        value={name}
        onChange={(e) => {
          setName(e.target.value)
          if (error) setError('')
        }}
        placeholder="Seu nome"
        aria-label="Seu nome"
        disabled={loading}
        className="min-h-[44px] rounded-ds2-card border border-ds2-border-subtle bg-ds2-surface-glass px-4 text-sm text-ds2-text-primary placeholder-ds2-text-muted transition-colors outline-none focus:border-ds2-orange/50"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value)
          if (error) setError('')
        }}
        placeholder="seu-email@exemplo.com"
        aria-label="Seu e-mail"
        disabled={loading}
        className="min-h-[44px] rounded-ds2-card border border-ds2-border-subtle bg-ds2-surface-glass px-4 text-sm text-ds2-text-primary placeholder-ds2-text-muted transition-colors outline-none focus:border-ds2-orange/50"
      />

      <label className="flex min-h-[44px] items-center gap-2.5 text-xs text-ds2-text-secondary">
        <input
          type="checkbox"
          checked={labInterest}
          onChange={(e) => handleLabInterestChange(e.target.checked)}
          className="h-4 w-4 rounded border-ds2-border-medium accent-ds2-orange"
        />
        Quero entrar na lista do Lab (área premium, em breve)
      </label>

      {error && <p className="text-xs text-ds2-magenta">{error}</p>}

      <Button type="submit" disabled={loading} variant="primary">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
        {ctaLabel}
      </Button>

      <p className="flex items-start gap-1.5 font-ds2-mono text-[11px] text-ds2-text-subtle">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Sem conta, sem spam — só o resultado no seu e-mail.
      </p>
    </form>
  )
}
