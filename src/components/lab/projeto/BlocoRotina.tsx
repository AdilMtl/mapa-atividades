// =============================================================================
// PÁGINA DO PROJETO — BLOCO 5: "DAQUI PRA FRENTE" (ISSUE-314)
// Fechamento de rotina + linha de evolução (quando houver) + texto de
// conclusão (quando o projeto foi concluído). Zero CTA comercial (spec §3/§7).
// =============================================================================

const TEXTO_ROTINA =
  'Você já viu esse filme: a ideia empolga na sexta, e na segunda ela já tá enterrada embaixo ' +
  'de vinte e-mails. Não é falta de vontade — é falta de lugar na rotina. Então combina isso ' +
  'comigo: uma etapa por semana, que seja. Marca aqui o que você for fazendo, volta quando ' +
  'travar, copia o prompt de novo quando precisar. Esse projeto fica te esperando, do jeito ' +
  'que você deixou.'

const TEXTO_CONCLUSAO =
  'Fechou. Você tirou a ideia do papel e colocou pra rodar no teu trabalho de verdade. Pouca ' +
  'gente atravessa esse caminho inteiro — a maioria ainda tá na conversa sobre IA, e você ' +
  'construiu uma coisa com ela. O projeto fica guardado aqui, do jeito que você deixou. E ' +
  'quando o uso te mostrar o próximo degrau, você já sabe onde me encontrar.'

export function BlocoRotina({
  linhaEvolucao,
  concluido,
  temResultado = false,
}: {
  linhaEvolucao: string | null
  concluido: boolean
  /** Quando o check-up de resultado (ISSUE-314D) já fecha a página com uma
   *  devolutiva personalizada, o texto genérico de conclusão vira redundante. */
  temResultado?: boolean
}) {
  // Concluído COM check-up: o BlocoResultado já deu o fechamento personalizado —
  // aqui fica só a linha de evolução (quando houver), sem repetir "você conseguiu".
  const textoFechamento = concluido ? (temResultado ? null : TEXTO_CONCLUSAO) : TEXTO_ROTINA

  if (!textoFechamento && !linhaEvolucao) return null

  return (
    <section className="space-y-4" aria-label="Daqui pra frente">
      <p className="text-base text-ds2-text-secondary">Última coisa — e é a mais importante.</p>

      <div className="max-w-3xl space-y-3 text-sm leading-relaxed text-ds2-text-secondary">
        {textoFechamento && <p>{textoFechamento}</p>}
        {linhaEvolucao && <p className="text-ds2-amber-soft">{linhaEvolucao}</p>}
      </div>
    </section>
  )
}
