import { Eyebrow, Panel } from '@/components/ds2'

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
          <Eyebrow className="mb-2 block">Quem escreve</Eyebrow>
          <h3 className="font-ds2-serif text-[22px] font-medium text-ds2-text-primary">
            Adilson Matioli
          </h3>
          <p className="mt-2 max-w-[560px] font-ds2-sans text-sm text-ds2-text-secondary">
            Gestor com carreira executiva em grandes empresas. Comecei escrevendo as conversas
            que eu gostaria de ter tido com meus gestores — hoje elas são sobre IA aplicada ao
            trabalho real, fluência e construção.
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
