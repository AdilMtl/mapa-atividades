import { Badge, Card, Eyebrow, GridSection } from '@/components/ds2'

// =============================================================================
// /lab/inicio — ESQUELETO (ISSUE-311). O hub real, com estados vazio/1/N
// projetos e "continue de onde parou", é a ISSUE-315 — aqui só se prova que o
// gate + shell funcionam, já na voz e no visual certos.
// =============================================================================

export default function LabInicioPage() {
  return (
    <div className="space-y-6">
      <div>
        <Eyebrow>jornada guiada de construção</Eyebrow>
        <h1 className="mt-3 font-ds2-serif text-4xl font-medium tracking-[-0.045em]">
          Bem-vindo ao Lab.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ds2-text-secondary">
          Aqui um problema do teu trabalho vira um projeto com plano — do jeito
          que a gente faz nos workshops: começa menor que a ambição, prova valor,
          amplia.
        </p>
      </div>

      <GridSection className="rounded-ds2-hero border border-ds2-border-subtle p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-ds2-mono text-xs text-ds2-text-secondary">
              módulo 01 / novo projeto
            </p>
            <h2 className="mt-2 font-ds2-sans text-lg font-semibold tracking-[-0.03em]">
              Transformar um problema em projeto
            </h2>
            <p className="mt-1 max-w-md text-sm text-ds2-text-secondary">
              Uma conversa de ~3 minutos: você conta, o Lab lê, você confirma — e
              sai com diagnóstico e plano de construção.
            </p>
          </div>
          <Badge>chega na próxima atualização</Badge>
        </div>
      </GridSection>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="mb-8 font-ds2-mono text-[11px] tracking-[0.08em] text-ds2-text-muted">
            02 / BIBLIOTECA
          </p>
          <h3 className="font-ds2-sans text-lg font-semibold tracking-[-0.03em]">
            Materiais que conversam com teu projeto
          </h3>
          <p className="mt-2 text-sm text-ds2-text-secondary">
            Guias, canvas e checklists conectados ao plano — não uma pilha
            genérica de PDFs.
          </p>
        </Card>
        <Card>
          <p className="mb-8 font-ds2-mono text-[11px] tracking-[0.08em] text-ds2-text-muted">
            03 / PERFIL
          </p>
          <h3 className="font-ds2-sans text-lg font-semibold tracking-[-0.03em]">
            O Lab aprende teu contexto
          </h3>
          <p className="mt-2 text-sm text-ds2-text-secondary">
            Área, fluência e arsenal de ferramentas — pra cada plano caber na tua
            realidade, não numa ideal.
          </p>
        </Card>
      </div>
    </div>
  )
}
