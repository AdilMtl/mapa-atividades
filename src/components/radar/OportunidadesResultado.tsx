'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react'
import Link from 'next/link'

import { Badge, Button, Card, Eyebrow, Panel } from '@/components/ds2'
import { track } from '@/lib/analytics'
import {
  BLOCO_DILIGENCIA,
  CONTEUDO_FAMILIAS,
  CONTEUDO_OPORTUNIDADES,
  CONVITE_MATURIDADE,
  CRUZAMENTO_MATURIDADE,
  TEASERS_OPORTUNIDADES,
} from '@/lib/radar/content'
import type { OpportunityResult } from '@/lib/radar/types'
import { lerMaturidadeReal } from '@/lib/radar-storage'

import { EmailCaptureRadar } from './EmailCaptureRadar'
import { RadarChartAxes } from './RadarChartAxes'

// Injetado em runtime pelo script do GTM (src/app/layout.tsx) — declaração de tipo apenas.
declare function gtag(...args: unknown[]): void

interface OportunidadesResultadoProps {
  resultado: OpportunityResult
  ensureSessionId: () => Promise<string | null>
}

export function OportunidadesResultado({
  resultado,
  ensureSessionId,
}: OportunidadesResultadoProps) {
  const [revelado, setRevelado] = useState(false)
  const [maturidadeReal, setMaturidadeReal] = useState<ReturnType<typeof lerMaturidadeReal>>(null)

  useEffect(() => {
    setMaturidadeReal(lerMaturidadeReal())
  }, [])

  const teaser = TEASERS_OPORTUNIDADES[resultado.tipo]
  const diagnostico = CONTEUDO_OPORTUNIDADES[resultado.tipo]
  const familia = CONTEUDO_FAMILIAS[resultado.teaser.familia]

  const cruzamento = maturidadeReal
    ? CRUZAMENTO_MATURIDADE.comNivelReal[maturidadeReal.nivel]
    : CRUZAMENTO_MATURIDADE.comEstimativa[resultado.estimativaMaturidade]

  const exemploArea = resultado.area ? diagnostico.exemploPorArea?.[resultado.area] : undefined

  // session_id só viaja no trilho Supabase (o helper track separa os payloads) — sem ele,
  // radar_events grava a linha com session_id null e o funil por sessão não fecha.
  function trackComSessao(...[event, props]: Parameters<typeof track>) {
    void ensureSessionId().then((sessionId) => {
      track(event, { ...props, session_id: sessionId })
    })
  }

  function handleEmailSuccess({ triggerConversion }: { triggerConversion: boolean }) {
    setRevelado(true)
    trackComSessao('result_full_requested', {
      assessment_type: 'oportunidades',
      recommended_solution_type: resultado.tipo,
      area: resultado.area,
    })
    if (triggerConversion && typeof gtag !== 'undefined') {
      gtag('event', 'conversion', {
        send_to: 'AW-16601345592/0K0dCMm6oo4bELjckew9',
        value: 1.0,
        currency: 'BRL',
      })
      console.log('Google Ads conversion triggered')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Eyebrow>Radar de Oportunidades · direção</Eyebrow>
        <h1 className="mt-2.5 font-ds2-serif text-[clamp(28px,4.5vw,42px)] leading-[1.05] tracking-[-0.03em] text-ds2-text-primary">
          {teaser.fraseDirecao}
        </h1>
        <div className="mt-3 flex items-center gap-2">
          <Badge className="font-ds2-sans text-[13px] normal-case tracking-normal text-ds2-text-primary">
            {familia.label}
          </Badge>
          <span className="font-ds2-mono text-xs text-ds2-text-muted">{teaser.nivelNaFamiliaLabel}</span>
        </div>
      </div>

      <RadarChartAxes eixos={resultado.teaser.eixos} max={100} />

      {!maturidadeReal && (
        <Panel>
          <p className="text-sm leading-relaxed text-ds2-text-secondary">
            {CONVITE_MATURIDADE}{' '}
            <Link href="/radar/maturidade" className="text-ds2-orange underline underline-offset-2">
              Fazer o Radar de Maturidade
            </Link>
          </p>
        </Panel>
      )}

      {!revelado && (
        <Panel className="border-ds2-orange/25">
          <Eyebrow>Diagnóstico completo</Eyebrow>
          <p className="mt-2.5 text-sm leading-relaxed text-ds2-text-secondary">{teaser.promessaCompleto}</p>
          <EmailCaptureRadar
            ensureSessionId={ensureSessionId}
            assessmentType="oportunidades"
            ctaLabel="Quero ver o diagnóstico completo"
            onSuccess={handleEmailSuccess}
            className="mt-4 max-w-md"
          />
        </Panel>
      )}

      {revelado && (
        <div className="flex flex-col gap-6">
          <Panel>
            <h2 className="font-ds2-serif text-2xl tracking-[-0.03em] text-ds2-text-primary">
              {diagnostico.titulo}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ds2-text-secondary">{diagnostico.porque}</p>
          </Panel>

          <div className="grid gap-3 sm:grid-cols-2">
            <Card>
              <Eyebrow>Complexidade</Eyebrow>
              <p className="mt-2 text-sm text-ds2-text-secondary">{diagnostico.complexidade}</p>
            </Card>
            <Card>
              <Eyebrow>Risco principal</Eyebrow>
              <p className="mt-2 text-sm text-ds2-text-secondary">{diagnostico.risco}</p>
            </Card>
          </div>

          <Panel>
            <Eyebrow>Primeiro passo</Eyebrow>
            <p className="mt-2.5 text-sm leading-relaxed text-ds2-text-secondary">{diagnostico.primeiroPasso}</p>
          </Panel>

          <Panel className="bg-[rgba(46,104,96,0.13)]">
            <Eyebrow>Na prática</Eyebrow>
            <p className="mt-2.5 text-sm leading-relaxed text-ds2-text-primary">{diagnostico.naPratica.gancho}</p>
            <p className="mt-2.5 text-sm leading-relaxed text-ds2-text-secondary">
              {diagnostico.naPratica.comeceAssim}
            </p>
            <p className="mt-2.5 text-sm leading-relaxed text-ds2-text-secondary">
              {diagnostico.naPratica.umNivelAcima}
            </p>
            <p className="mt-2.5 font-ds2-mono text-xs text-ds2-text-muted">
              {diagnostico.naPratica.comoFazerNoEmail}
            </p>
          </Panel>

          <Panel>
            <p className="text-sm leading-relaxed text-ds2-text-secondary">{cruzamento}</p>
          </Panel>

          {exemploArea && (
            <Card>
              <Eyebrow>Na prática, no seu contexto</Eyebrow>
              <p className="mt-2 text-sm text-ds2-text-secondary">{exemploArea}</p>
            </Card>
          )}

          {resultado.flags.diligencia && (
            <Panel className="border-ds2-magenta/25 bg-[rgba(211,76,117,0.06)]">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-ds2-magenta" />
                <Eyebrow className="text-ds2-magenta">{BLOCO_DILIGENCIA.titulo}</Eyebrow>
              </div>
              <p className="mt-2.5 text-sm leading-relaxed text-ds2-text-secondary">{BLOCO_DILIGENCIA.corpo}</p>
              <a
                href={BLOCO_DILIGENCIA.leitura.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2.5 inline-block text-sm text-ds2-orange underline underline-offset-2"
                onClick={() =>
                  trackComSessao('recommended_article_clicked', {
                    assessment_type: 'oportunidades',
                    recommended_solution_type: resultado.tipo,
                    article_url: BLOCO_DILIGENCIA.leitura.url,
                  })
                }
              >
                {BLOCO_DILIGENCIA.leitura.titulo}
              </a>
            </Panel>
          )}

          {diagnostico.leituras.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {diagnostico.leituras.map((leitura) => (
                <Card key={leitura.url}>
                  <a
                    href={leitura.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                    onClick={() =>
                      trackComSessao('recommended_article_clicked', {
                        assessment_type: 'oportunidades',
                        recommended_solution_type: resultado.tipo,
                        article_url: leitura.url,
                      })
                    }
                  >
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
              <a
                href="https://conversasnocorredor.substack.com/subscribe"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackComSessao('newsletter_cta_clicked', {
                    assessment_type: 'oportunidades',
                    recommended_solution_type: resultado.tipo,
                  })
                }
              >
                {diagnostico.ctaNewsletter}
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>

          <p className="flex items-center gap-2 text-sm text-ds2-text-secondary">
            <CheckCircle2 className="h-4 w-4 text-ds2-orange" />
            Diagnóstico enviado também para o seu e-mail.
          </p>
        </div>
      )}
    </div>
  )
}
