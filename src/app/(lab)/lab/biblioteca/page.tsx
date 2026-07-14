import { Hammer } from 'lucide-react'

import { Eyebrow } from '@/components/ds2'
import { Estante } from '@/components/lab/biblioteca/Estante'
import { MarcoTrajetoria } from '@/components/lab/biblioteca/MarcoTrajetoria'
import { Trilha } from '@/components/lab/biblioteca/Trilha'
import { montarTrilha, type TrilhaProjectRow } from '@/lib/lab/trilha'
import { criarClienteServidor } from '@/lib/supabase-server'

// =============================================================================
// /lab/biblioteca — A TRILHA + A ESTANTE (ISSUE-316, Fatias A e B)
// Server Component: lê os projetos do dono (RLS filtra por auth.uid()), deriva
// tudo no motor puro `lib/lab/trilha.ts` (que por sua vez chama `lab/valor.ts`)
// e renderiza. Zero rota de API, zero tabela nova — o desbloqueio deriva de
// `lab_projects` (mesmo padrão do hub).
//
// Anatomia da página (Fatia B):
//   1. Cabeçalho — o que é essa trilha
//   2. Marco de trajetória — só aparece com >= 1 projeto terminado (mostrar um
//      marco trancado pra quem não terminou nada seria só lembrar do que falta)
//   3. A trilha de Construção — pra onde você vai
//   4. A estante — o que você JÁ ganhou (some quando está vazia)
//
// ⚠️ Validação final da copy: issue própria (ISSUE-316B), a pedido do dono.
// Spec: docs/revamp/ISSUE-316-spec-tela-trilha.md
// Copy: docs/revamp/ISSUE-316-copy-para-aprovacao.md (v2, aprovada 2026-07-14)
// =============================================================================

export default async function BibliotecaPage() {
  const supabase = await criarClienteServidor()
  const { data } = await supabase
    .from('lab_projects')
    .select('id, status, diagnosis')
    .order('updated_at', { ascending: false })

  const trilha = montarTrilha((data ?? []) as TrilhaProjectRow[])

  return (
    <div className="space-y-10">
      <div>
        <Eyebrow>teu repertório de construção</Eyebrow>
        <h1 className="mt-3 font-ds2-serif text-4xl font-medium tracking-[-0.045em] text-ds2-text-primary">
          O mapa do que você sabe construir
        </h1>
        <div className="mt-3 max-w-2xl space-y-3 text-sm leading-relaxed text-ds2-text-secondary">
          <p>
            São nove tipos de solução, do pedido bem-feito até o sistema que decide sozinho. E isso
            aqui é uma trilha de aprendizado: você vai desbloqueando conforme avança, um projeto de
            cada vez.
          </p>
          <p>
            A ideia é te mostrar o caminho e abrir possibilidade que talvez você nem tenha mapeado
            ainda — ou que olhou de longe uma vez, achou que não era pra você, e deixou pra lá.
          </p>
        </div>
      </div>

      {/* Marco de trajetória — só entra depois do 1º projeto terminado */}
      {trilha.marco.terminados > 0 && <MarcoTrajetoria marco={trilha.marco} />}

      {/* Trilha de Construção */}
      <section className="space-y-5">
        <p className="flex items-center gap-2 font-ds2-mono text-xs tracking-[0.13em] text-ds2-amber-soft uppercase">
          <Hammer className="h-3.5 w-3.5" /> construção
        </p>
        <div className="rounded-ds2-hero border border-ds2-border-subtle p-5 md:p-8">
          <Trilha view={trilha} />
        </div>
      </section>

      {/* A estante — o que já foi aberto (não renderiza vazia) */}
      <Estante nos={trilha.nos} />
    </div>
  )
}
