import { SectionTitle } from '@/components/ds2'

const LINHAS = [
  ['Ferramenta da semana', 'Método e repertório'],
  ['Prompt solto', 'Problema bem formulado'],
  ['Automação no impulso', 'Discernimento sobre o que vale'],
  ['Hype e FOMO', 'Aplicação no trabalho real'],
  ['Técnica pela técnica', 'Julgamento de negócio'],
  ['"Crie qualquer coisa"', '"Escolha bem o que vale construir"'],
]

export function DiferenciacaoSection() {
  return (
    <section>
      <SectionTitle>Menos ferramenta da semana. Mais clareza para construir.</SectionTitle>
      <p className="mt-2 max-w-[720px] font-ds2-sans text-sm text-ds2-text-secondary">
        Aqui não é sobre decorar prompt, perseguir buzzword ou trocar de ferramenta a cada
        lançamento. É sobre desenvolver repertório para entender problemas, escolher boas
        soluções e aplicar IA com julgamento dentro do contexto real das empresas.
      </p>
      <div className="mt-6 overflow-x-auto rounded-ds2-card border border-ds2-border-subtle">
        <table className="w-full min-w-[480px] border-collapse font-ds2-sans text-sm">
          <thead>
            <tr className="border-b border-ds2-border-subtle">
              <th className="p-4 text-left font-ds2-mono text-xs uppercase tracking-[0.08em] text-ds2-text-muted">
                Mercado comum
              </th>
              <th className="p-4 text-left font-ds2-mono text-xs uppercase tracking-[0.08em] text-ds2-text-muted">
                Conversas no Corredor
              </th>
            </tr>
          </thead>
          <tbody>
            {LINHAS.map(([comum, corredor]) => (
              <tr key={comum} className="border-b border-ds2-border-subtle last:border-0">
                <td className="p-4 text-ds2-text-secondary">{comum}</td>
                <td className="p-4 text-ds2-text-primary">{corredor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
