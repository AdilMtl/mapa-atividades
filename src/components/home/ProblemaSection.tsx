import { Panel, SectionTitle } from '@/components/ds2'

const PONTOS = [
  'Você já usa IA, mas sente que só arranha a superfície.',
  'Vê exemplos incríveis por aí e não sabe trazer pro seu contexto.',
  'Não sabe se a sua dor pede prompt, automação, dashboard ou app.',
  'Não quer virar dev — mas quer construir coisas melhores que uma planilha.',
  'Cansou de curso raso, buzzword e ferramenta da semana.',
]

export function ProblemaSection() {
  return (
    <section className="grid gap-6 md:grid-cols-[0.8fr_1.2fr]">
      <Panel>
        <SectionTitle className="text-[28px] md:text-[32px]">
          Todo mundo fala de IA. Pouca gente mostra como isso vira trabalho melhor.
        </SectionTitle>
        <p className="mt-4 font-ds2-sans text-sm leading-relaxed text-ds2-text-secondary">
          Você já viu o vídeo do app mágico feito em três minutos. Aí segunda-feira chega, você
          abre o notebook da empresa e a régua é outra: sistema homologado, dado sensível, prazo
          apertado.
        </p>
        <p className="mt-3 font-ds2-sans text-sm leading-relaxed text-ds2-text-secondary">
          O problema não é falta de ferramenta — é falta de clareza sobre o que, na sua rotina,
          vale virar prompt, fluxo, dashboard ou app. E o que é melhor nem fazer.
        </p>
      </Panel>
      <ul className="space-y-4">
        {PONTOS.map((ponto, index) => (
          <li key={ponto} className="flex gap-3 font-ds2-sans text-sm text-ds2-text-secondary">
            <span className="font-ds2-mono text-xs text-ds2-text-muted">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span>{ponto}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
