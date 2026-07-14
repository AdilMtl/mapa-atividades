import { Hammer, Lock, TrendingUp } from 'lucide-react'

import { Eyebrow } from '@/components/ds2'
import { Trilha } from '@/components/lab/biblioteca/Trilha'
import { montarTrilha, type TrilhaProjectRow } from '@/lib/lab/trilha'
import { criarClienteServidor } from '@/lib/supabase-server'

// =============================================================================
// /lab/biblioteca — A TRILHA (ISSUE-316, Fatia A)
// Server Component: lê os projetos do dono (RLS filtra por auth.uid()), deriva a
// trilha no motor puro `lib/lab/trilha.ts` e renderiza. Zero rota de API, zero
// tabela nova — o desbloqueio deriva de `lab_projects` (mesmo padrão do hub).
// Os guias de construção são lidos direto de `materiais.ts` na rota [slug]
// (conteúdo já aprovado na 314) — o seed em `lab_assets` fica pra quando o
// paywall/DB precisar (Fatia B / 1C).
// ⚠️ FATIA A: a trilha + leitura + navegação. O andar de VALOR & CARREIRA
// (ramos + conteúdo) é Fatia B — aqui entra como placeholder "em breve".
// ⚠️ COPY pendente de veto do dono (norma da casa).
// Spec: docs/revamp/ISSUE-316-spec-tela-trilha.md
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
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ds2-text-secondary">
          Cada projeto teu acende um degrau desta trilha. Toca num degrau pra ver o que é; conclui um
          projeto do tipo e o guia daquele degrau abre pra você. O que ainda tá trancado mostra o que
          falta — e o horizonte espera você chegar perto.
        </p>
      </div>

      {/* Trilha de Construção */}
      <section className="space-y-5">
        <p className="flex items-center gap-2 font-ds2-mono text-xs tracking-[0.13em] text-ds2-amber-soft uppercase">
          <Hammer className="h-3.5 w-3.5" /> construção
        </p>
        <div className="rounded-ds2-hero border border-ds2-border-subtle p-5 md:p-8">
          <Trilha view={trilha} />
        </div>
      </section>

      {/* Andar de Valor & Carreira — PLACEHOLDER (Fatia B) */}
      <RamoValorPlaceholder algumConquistado={trilha.conquistados > 0} />
    </div>
  )
}

// ----------------------------------------------------------------------------
// Placeholder do andar de Valor & Carreira (conteúdo = Fatia B / outra sessão)
// Mostra o SLOT pro dono ver onde os ramos vão morar e já pensar em alternativas.
// ----------------------------------------------------------------------------

function RamoValorPlaceholder({ algumConquistado }: { algumConquistado: boolean }) {
  return (
    <section className="rounded-ds2-panel border border-ds2-magenta/25 bg-ds2-magenta/[0.06] p-6 md:p-8">
      <p className="flex items-center gap-2 font-ds2-mono text-xs tracking-[0.13em] text-ds2-magenta uppercase">
        <TrendingUp className="h-3.5 w-3.5" /> valor &amp; carreira
      </p>
      <h2 className="mt-3 font-ds2-serif text-2xl font-medium tracking-[-0.03em] text-ds2-text-primary">
        Construir não basta — o retorno é parte do trabalho
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ds2-text-secondary">
        Cada projeto que você conclui vai brotar aqui um ramo pra você{' '}
        <span className="text-ds2-text-primary">colher o benefício</span> dele: apresentar pra tua
        liderança, traduzir o ganho em números, transformar a entrega em reconhecimento. É o que
        separa quem constrói de quem constrói <em>e é visto por isso</em>.
      </p>
      <p className="mt-4 flex items-center gap-2 font-ds2-mono text-[11px] tracking-[0.08em] text-ds2-text-subtle uppercase">
        <Lock className="h-3 w-3" />
        {algumConquistado
          ? 'os ramos de valor chegam numa próxima atualização'
          : 'conclua teu primeiro projeto pra começar a abrir este andar'}
      </p>
    </section>
  )
}
