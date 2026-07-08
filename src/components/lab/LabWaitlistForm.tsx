'use client'

import { useEffect, useState } from 'react'
import { Loader2, Mail } from 'lucide-react'

import { Button } from '@/components/ds2'
import { capturarUtm, lerUtm } from '@/lib/analytics'
import { cn } from '@/lib/utils'

function validarEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function LabWaitlistForm({ className }: { className?: string }) {
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('') // honeypot — humano nunca preenche
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [enviado, setEnviado] = useState(false)

  useEffect(() => {
    capturarUtm()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!validarEmail(email)) {
      setError('Digite um e-mail válido')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/lab/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), website, ...lerUtm() }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.error || 'Não foi possível salvar seu e-mail. Tente novamente.')
        setLoading(false)
        return
      }

      setEnviado(true)
    } catch {
      setError('Erro de conexão. Tente novamente.')
      setLoading(false)
    }
  }

  if (enviado) {
    return (
      <p className={cn('font-ds2-sans text-sm text-ds2-text-secondary', className)}>
        Você está na lista. Avisamos assim que o Lab abrir.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={cn('flex flex-col gap-3 sm:flex-row', className)}>
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
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value)
          if (error) setError('')
        }}
        placeholder="seu-email@exemplo.com"
        aria-label="Seu e-mail"
        disabled={loading}
        className="min-h-[44px] flex-1 rounded-ds2-card border border-ds2-border-subtle bg-ds2-surface-glass px-4 text-sm text-ds2-text-primary placeholder-ds2-text-muted transition-colors outline-none focus:border-ds2-orange/50"
      />

      <Button type="submit" disabled={loading} variant="primary">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
        Quero entrar na lista do Lab
      </Button>

      {error && <p className="basis-full font-ds2-sans text-xs text-ds2-magenta">{error}</p>}
    </form>
  )
}
