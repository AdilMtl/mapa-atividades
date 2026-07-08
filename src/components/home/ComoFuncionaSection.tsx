import { SectionTitle } from '@/components/ds2'

const PASSOS = [
  'Escolha sua porta: maturidade ou oportunidade.',
  'Responda perguntas rápidas sobre sua rotina.',
  'Veja o resultado inicial na hora.',
  'Se quiser, receba a trilha completa por e-mail.',
  'Continue evoluindo pela newsletter.',
]

export function ComoFuncionaSection() {
  return (
    <section>
      <SectionTitle>Como funciona</SectionTitle>
      <p className="mt-2 max-w-[680px] font-ds2-sans text-sm text-ds2-text-secondary">
        Simples de verdade: você responde sobre seu momento e sua rotina, e sai com um
        direcionamento — não com mais uma lista de ferramentas.
      </p>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {PASSOS.map((passo, index) => (
          <div
            key={passo}
            className={
              index === PASSOS.length - 1
                ? 'rounded-ds2-card border border-ds2-border-subtle bg-ds2-surface-glass p-5 sm:col-span-2 lg:col-span-1'
                : 'rounded-ds2-card border border-ds2-border-subtle bg-ds2-surface-glass p-5'
            }
          >
            <span className="font-ds2-mono text-xs text-ds2-text-muted">
              Passo {index + 1}
            </span>
            <p className="mt-2 font-ds2-sans text-sm text-ds2-text-secondary">{passo}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 font-ds2-mono text-xs text-ds2-text-muted">
        Os resultados vêm de lógica guiada e critérios pré-definidos. Nenhuma IA generativa lendo
        suas respostas, nenhum dado seu virando treino de modelo.
      </p>
    </section>
  )
}
