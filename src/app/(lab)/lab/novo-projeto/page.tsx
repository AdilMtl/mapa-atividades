import { Caveat } from 'next/font/google'

import { WizardNovoProjeto } from '@/components/lab/wizard/WizardNovoProjeto'
import { sanitizarRascunho } from '@/lib/lab/validacao'
import { WIZARD_SCHEMA_VERSION_V2 } from '@/lib/lab/types'
import { criarClienteServidor, obterUsuarioSessao } from '@/lib/supabase-server'

// =============================================================================
// /lab/novo-projeto — WIZARD "CONVERSA DE CONSULTOR" (ISSUE-313)
// Server Component: o gate de sessão/autorização já rodou no layout do (lab).
// Aqui se resolve o que precisa do servidor ANTES da conversa começar:
//   1. o rascunho mais recente (retomada volta ao ponto certo — aceite da spec);
//   2. a sugestão de fluência do perfil, quando existir (1.1 — sempre editável).
// A fonte manuscrita das notas do consultor (Caveat) carrega SÓ nesta rota —
// nada de tocar no layout raiz (trava de tracking do CLAUDE.md).
// =============================================================================

const fonteNota = Caveat({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-nota',
  display: 'swap',
})

/** Fluência do radar de maturidade (lab_profiles) → id `conf_*` do wizard. */
const CONFORTO_POR_MATURIDADE: Record<string, string> = {
  curioso: 'conf_baixo',
  usuario: 'conf_medio',
  operador: 'conf_bom',
  builder: 'conf_alto',
  referencia: 'conf_muito_alto',
}

export default async function NovoProjetoPage() {
  const supabase = await criarClienteServidor()
  const user = await obterUsuarioSessao()

  // Rascunho mais recente (RLS já limita ao dono da sessão).
  const { data: rascunhos } = await supabase
    .from('lab_projects')
    .select('id, wizard_answers')
    .eq('status', 'rascunho')
    .order('updated_at', { ascending: false })
    .limit(1)

  const rascunho = rascunhos?.[0]
  const respostas =
    rascunho?.wizard_answers?.schema_version === WIZARD_SCHEMA_VERSION_V2
      ? sanitizarRascunho(rascunho.wizard_answers)
      : null

  // Pré-preenchimento de fluência (perfil da 317, quando existir) — editável.
  let sugestaoConforto: string | null = null
  if (user) {
    const { data: perfil } = await supabase
      .from('lab_profiles')
      .select('ai_fluency_level')
      .eq('user_id', user.id)
      .maybeSingle()
    sugestaoConforto = perfil?.ai_fluency_level
      ? (CONFORTO_POR_MATURIDADE[perfil.ai_fluency_level] ?? null)
      : null
  }

  return (
    <div className={fonteNota.variable}>
      <WizardNovoProjeto
        rascunhoInicial={rascunho && respostas ? { id: rascunho.id, respostas } : null}
        sugestaoConforto={sugestaoConforto}
      />
    </div>
  )
}
