'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Mail } from 'lucide-react'

import { Badge, Button, Card, Eyebrow, Panel } from '@/components/ds2'
import type { MaturityContent, MaturityResult } from '@/lib/radar/types'

import { EmailCaptureRadar } from './EmailCaptureRadar'
import { RadarChartAxes } from './RadarChartAxes'

interface MaturidadeResultadoProps {
  resultado: MaturityResult
  conteudo: MaturityContent
  ensureSessionId: () => Promise<string | null>
}

export function MaturidadeResultado({
  resultado,
  conteudo,
  ensureSessionId,
}: MaturidadeResultadoProps) {
  const [mostrarEmail, setMostrarEmail] = useState(false)
  const [emailEnviado, setEmailEnviado] = useState(false)

  const proximoPasso = resultado.fronteira
    ? conteudo.proximoPassoPorFronteira[resultado.fronteira]
    : null

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Eyebrow>Radar de Maturidade · resultado</Eyebrow>
        <h1 className="mt-2.5 font-ds2-serif text-[clamp(28px,4.5vw,42px)] leading-[1.05] tracking-[-0.03em] text-ds2-text-primary">
          {conteudo.titulo}
        </h1>
        <div className="mt-3 flex items-center gap-2">
          <Badge>{conteudo.nome}</Badge>
          <span className="font-ds2-mono text-xs text-ds2-text-muted">{resultado.score}/35 pontos</span>
        </div>
      </div>

      <RadarChartAxes eixos={resultado.eixos} max={5} />

      <Panel>
        <p className="text-sm leading-relaxed text-ds2-text-secondary">{conteudo.corpo}</p>
      </Panel>

      <Panel className="border-ds2-magenta/20 bg-[rgba(211,76,117,0.06)]">
        <Eyebrow className="text-ds2-magenta">Risco de ficar aqui</Eyebrow>
        <p className="mt-2.5 text-sm leading-relaxed text-ds2-text-secondary">{conteudo.risco}</p>
      </Panel>

      <Panel>
        <Eyebrow>Próximo salto</Eyebrow>
        <p className="mt-2.5 text-sm leading-relaxed text-ds2-text-secondary">{conteudo.proximoSalto}</p>
        {proximoPasso && (
          <p className="mt-2.5 text-sm leading-relaxed text-ds2-text-primary">{proximoPasso}</p>
        )}
      </Panel>

      {conteudo.leituras.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {conteudo.leituras.map((leitura) => (
            <Card key={leitura.url}>
              <a href={leitura.url} target="_blank" rel="noopener noreferrer" className="block">
                <span className="font-ds2-mono text-[11px] tracking-[0.08em] text-ds2-text-muted uppercase">
                  Leitura
                </span>
                <p className="mt-2 text-sm text-ds2-text-primary">{leitura.titulo}</p>
              </a>
            </Card>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button asChild variant="primary">
          <Link href="/radar/oportunidades">
            {conteudo.ctaPonte}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>

        {!mostrarEmail && !emailEnviado && (
          <Button variant="secondary" onClick={() => setMostrarEmail(true)}>
            <Mail className="h-4 w-4" />
            {conteudo.ctaEmailSuave}
          </Button>
        )}
      </div>

      {mostrarEmail && !emailEnviado && (
        <EmailCaptureRadar
          ensureSessionId={ensureSessionId}
          ctaLabel={conteudo.ctaEmailSuave}
          onSuccess={() => setEmailEnviado(true)}
          className="max-w-md"
        />
      )}

      {emailEnviado && (
        <p className="flex items-center gap-2 text-sm text-ds2-text-secondary">
          <CheckCircle2 className="h-4 w-4 text-ds2-orange" />
          Combinado — sua interpretação chega no e-mail.
        </p>
      )}
    </div>
  )
}
