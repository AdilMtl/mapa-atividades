import { Badge, Panel, SectionTitle } from '@/components/ds2'

import { NewsletterSignup } from './NewsletterSignup'

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

// ISSUE-111.1: o CTA que jogava para o Substack virou embed (assina sem sair do site);
// os temas entram no painel de texto e a coluna direita vira o formulário.
export function NewsletterSection() {
  return (
    <section id="newsletter" className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
      <Panel>
        <SectionTitle className="text-[28px] md:text-[32px]">
          A newsletter é onde a conversa continua.
        </SectionTitle>
        <p className="mt-4 font-ds2-sans text-sm leading-relaxed text-ds2-text-secondary">
          Toda semana, uma reflexão prática sobre IA, trabalho, carreira e construção digital —
          escrita por quem vive o corredor corporativo, não por quem vende curso.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {TEMAS.map((tema) => (
            <Badge key={tema}>{tema}</Badge>
          ))}
        </div>
      </Panel>
      <div className="flex flex-col justify-center">
        <NewsletterSignup />
      </div>
    </section>
  )
}
