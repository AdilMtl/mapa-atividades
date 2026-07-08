import { Badge, Button, Panel, SectionTitle } from '@/components/ds2'

const TEMAS = [
  'IA no trabalho real',
  'Fluência em IA · 4Ds',
  'Construção de soluções digitais',
  'Produtividade como sistema',
  'Discernimento e diligência',
  'Carreira em tempos de IA',
  'Liderança, estratégia e tecnologia',
  'Artesanato Digital',
]

export function NewsletterSection() {
  return (
    <section id="newsletter" className="grid gap-6 md:grid-cols-[0.8fr_1.2fr]">
      <Panel>
        <SectionTitle className="text-[28px] md:text-[32px]">
          A newsletter é onde a conversa continua.
        </SectionTitle>
        <p className="mt-4 font-ds2-sans text-sm leading-relaxed text-ds2-text-secondary">
          Toda semana, uma reflexão prática sobre IA, trabalho, carreira e construção digital —
          escrita por quem vive o corredor corporativo, não por quem vende curso.
        </p>
        <Button asChild variant="primary" className="mt-5">
          <a
            href="https://conversasnocorredor.substack.com/subscribe"
            target="_blank"
            rel="noopener noreferrer"
          >
            Receber as próximas conversas
          </a>
        </Button>
      </Panel>
      <div className="flex flex-wrap content-start gap-2">
        {TEMAS.map((tema) => (
          <Badge key={tema}>{tema}</Badge>
        ))}
      </div>
    </section>
  )
}
