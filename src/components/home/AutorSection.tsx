import { Eyebrow, Panel } from '@/components/ds2'

// ISSUE-111.1: bio saiu do clichê "gestor + LinkedIn" para o endosso real — quem escreve
// também constrói, e a prova é a plataforma que o visitante está usando. Fatos fornecidos
// pelo dono em 2026-07-08 (99, agentes de IA, vibe coding, workshops); veto dele no aceite.
export function AutorSection() {
  return (
    <section>
      <Panel className="flex flex-col items-start gap-4 md:flex-row md:items-center">
        <div
          aria-hidden="true"
          className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border border-ds2-border-medium bg-ds2-surface-glass font-ds2-serif text-2xl text-ds2-text-primary"
        >
          A
        </div>
        <div>
          <Eyebrow className="mb-2 block">Quem escreve — e constrói</Eyebrow>
          <h3 className="font-ds2-serif text-[22px] font-medium text-ds2-text-primary">
            Adilson Matioli
          </h3>
          <p className="mt-2 max-w-[620px] font-ds2-sans text-sm leading-relaxed text-ds2-text-secondary">
            Gestor com carreira executiva em grandes empresas — hoje na 99, implementando
            agentes de IA no trabalho real. Comecei escrevendo as conversas que eu gostaria de
            ter tido com meus gestores; elas viraram esta newsletter, workshops de IA e
            soluções construídas com vibe coding. Esta plataforma é uma delas.
          </p>
          <p className="mt-3 font-ds2-mono text-[11px] text-ds2-text-muted">
            newsletter semanal · workshops de IA · agentes em produção · este site
          </p>
          <a
            href="https://www.linkedin.com/in/adilsonmatioli/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block font-ds2-sans text-sm font-semibold text-ds2-orange underline underline-offset-4 hover:text-ds2-amber-soft"
          >
            LinkedIn
          </a>
        </div>
      </Panel>
    </section>
  )
}
