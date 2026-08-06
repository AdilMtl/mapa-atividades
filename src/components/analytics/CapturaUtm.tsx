'use client'

import { useEffect } from 'react'

import { capturarUtm } from '@/lib/analytics'

/**
 * Captura a UTM no PONTO DE ENTRADA do visitante, não na página do funil.
 *
 * Por que existe: o anúncio do Google Ads aponta para a home
 * (`/?utm_source=google&utm_medium=cpc&utm_campaign=...`), mas a home só tem CTA
 * para os radares. Até 2026-08-06 o `capturarUtm()` só rodava dentro do
 * `RadarFlow` — que monta em `/radar/*`, quando a query string da entrada já se
 * perdeu na navegação. Resultado medido: 273 sessões de radar em um mês, 100%
 * gravadas como `(sem utm)`.
 *
 * Montado no layout do grupo `(publico)`, que não remonta entre navegações do
 * grupo: o efeito roda uma vez, na entrada, que é exatamente onde a UTM existe.
 * `capturarUtm()` é idempotente e não sobrescreve o que já estava guardado, então
 * as chamadas que já existem no `RadarFlow`/`LabWaitlistForm` seguem válidas para
 * quem entra direto numa dessas páginas.
 */
export function CapturaUtm() {
  useEffect(() => {
    capturarUtm()
  }, [])

  return null
}
