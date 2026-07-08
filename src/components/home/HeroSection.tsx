import { Badge, GridSection } from '@/components/ds2'

import { HeroAppPreview } from './HeroAppPreview'
import { HeroCtas } from './HeroCtas'

export function HeroSection() {
  return (
    <GridSection className="rounded-ds2-hero border border-ds2-border-subtle p-7 md:p-11">
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <p className="font-ds2-mono text-[11px] uppercase tracking-[0.13em] text-ds2-amber-soft">
            IA aplicada ao trabalho real · sem hype
          </p>
          <h1 className="mt-4 max-w-[900px] font-ds2-serif text-[clamp(40px,7vw,94px)] font-medium leading-[0.92] tracking-[-0.065em] text-ds2-text-primary">
            Descubra o que você poderia{' '}
            <em className="bg-ds2-gradient-primary bg-clip-text not-italic text-transparent">
              construir com IA
            </em>{' '}
            no seu trabalho.
          </h1>
          <p className="mt-5 max-w-[680px] font-ds2-sans text-lg leading-normal text-ds2-text-secondary">
            Responda um radar de poucos minutos e veja se aquela tarefa que te consome pede um
            prompt, uma automação, um dashboard — ou um app que você mesmo consegue tirar do
            papel. Sem hype. Sem virar dev.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <HeroCtas />
            <a
              href="https://conversasnocorredor.substack.com/subscribe"
              target="_blank"
              rel="noopener noreferrer"
              className="font-ds2-sans text-sm font-semibold text-ds2-orange underline underline-offset-4 hover:text-ds2-amber-soft"
            >
              Assinar a newsletter
            </a>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Badge>2 radares gratuitos</Badge>
            <Badge>resultado na hora</Badge>
            <Badge>4 ferramentas no ar</Badge>
          </div>
        </div>
        <HeroAppPreview />
      </div>
    </GridSection>
  )
}
