import { Eyebrow, Panel } from '@/components/ds2'

export function ReframeSection() {
  return (
    <section>
      <Panel className="bg-[rgba(46,104,96,0.13)]">
        <Eyebrow className="mb-3.5 block">Produtividade, revisitada</Eyebrow>
        <p className="font-ds2-sans text-sm leading-relaxed text-ds2-text-secondary">
          Organizar tarefa era o jogo de ontem. Continua importante — mas com IA apareceu uma
          camada nova: redesenhar o próprio trabalho. Criar fluxos, interfaces, dashboards e
          pequenos aplicativos que cortam retrabalho e melhoram a qualidade do que você entrega.
        </p>
        <p className="mt-4 font-ds2-serif text-xl leading-snug text-ds2-text-primary">
          Quem aprende a construir com IA deixa de só usar ferramenta.{' '}
          <em className="not-italic text-ds2-orange">Passa a criar ativos.</em>
        </p>
      </Panel>
    </section>
  )
}
