import { Eyebrow } from '@/components/ds2'
import { PerfilForm } from '@/components/lab/perfil/PerfilForm'
import { criarClienteServidor, obterUsuarioSessao } from '@/lib/supabase-server'

// =============================================================================
// /lab/perfil — PERFIL DO BUILDER (ISSUE-317)
// Server Component: gate já rodou no layout do (lab). Lê o perfil salvo (se
// existir) e entrega pro form client-side — tudo opcional, sempre editável.
// Alimenta a personalização da 1B e pré-preenche a área/fluência do wizard
// (ver `/lab/novo-projeto`).
// =============================================================================

export default async function PerfilPage() {
  const supabase = await criarClienteServidor()
  const user = await obterUsuarioSessao()

  const { data: perfil } = user
    ? await supabase
        .from('lab_profiles')
        .select('role_area, seniority, ai_fluency_level, main_goal, biggest_bottleneck, tools_used')
        .eq('user_id', user.id)
        .maybeSingle()
    : { data: null }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <Eyebrow>perfil do builder</Eyebrow>
        <h1 className="mt-3 font-ds2-serif text-3xl font-medium tracking-[-0.03em] text-ds2-text-primary md:text-4xl">
          Só o essencial pra eu te entender melhor
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ds2-text-secondary">
          Nada aqui é obrigatório. O que você preencher personaliza os próximos projetos — e já
          fica pronto pra quando o assistente entrar na jornada. Edita quando quiser.
        </p>
      </div>

      <PerfilForm perfilInicial={perfil} />
    </div>
  )
}
