// =============================================================================
// PÁGINA DO PROJETO — BLOCO 2: "A LEITURA DO TEU CASO" (ISSUE-314)
// Diagnóstico em prosa, não em tabela: reaproveita o texto já aprovado do
// Radar (ISSUE-105, `CONTEUDO_OPORTUNIDADES`) — mesmo "porquê"/complexidade/
// risco que a pessoa já viu no resultado do radar, agora no contexto do
// projeto salvo. Indicadores em UMA linha discreta, nunca três badges soltos.
// ============================================================================

import { Card } from '@/components/ds2'
import { BLOCO_DILIGENCIA } from '@/lib/lab/plan-generator'
import type { LabDiagnosis, NivelIndicador } from '@/lib/lab/types'
import { CONTEUDO_OPORTUNIDADES } from '@/lib/radar/content'

const LABEL_NIVEL: Record<NivelIndicador, string> = {
  baixo: 'baixo',
  medio: 'médio',
  alto: 'alto',
}

export function BlocoLeitura({ diagnosis }: { diagnosis: LabDiagnosis }) {
  const conteudo = CONTEUDO_OPORTUNIDADES[diagnosis.tipo]

  return (
    <section className="space-y-4" aria-label="A leitura do teu caso">
      <p className="text-base text-ds2-text-secondary">
        Agora deixa eu te falar o que isso significa.
      </p>

      <Card className="max-w-3xl space-y-3">
        <h2 className="font-ds2-serif text-xl font-medium text-ds2-text-primary">
          {conteudo.titulo}
        </h2>
        <p className="text-sm leading-relaxed text-ds2-text-secondary">{conteudo.porque}</p>
        <p className="text-sm leading-relaxed text-ds2-text-secondary">{conteudo.complexidade}</p>
        <p className="text-sm leading-relaxed text-ds2-text-secondary">{conteudo.risco}</p>
        <p className="font-ds2-mono text-[11px] tracking-[0.08em] text-ds2-text-muted uppercase">
          potencial de IA: {LABEL_NIVEL[diagnosis.potencial_ia]} · potencial de automação:{' '}
          {LABEL_NIVEL[diagnosis.potencial_automacao]} · risco: {LABEL_NIVEL[diagnosis.risco]}
        </p>
      </Card>

      {diagnosis.flags.diligencia && (
        <Card className="max-w-3xl border-ds2-magenta/30 bg-[rgba(211,76,117,0.06)]">
          <h3 className="font-ds2-sans text-sm font-semibold text-ds2-text-primary">
            {BLOCO_DILIGENCIA.titulo}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-ds2-text-secondary">
            {BLOCO_DILIGENCIA.corpo}
          </p>
          <a
            href={BLOCO_DILIGENCIA.leitura.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm text-ds2-orange underline underline-offset-2"
          >
            {BLOCO_DILIGENCIA.leitura.titulo}
          </a>
        </Card>
      )}
    </section>
  )
}
