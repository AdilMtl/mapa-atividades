'use server'

// =============================================================================
// DESCADASTRO — ação pública (ISSUE-601C, §3.4 da spec)
// O clique do e-mail cai numa página GET que NÃO grava nada (scanner corporativo
// pré-visita link de e-mail; gravar no GET descadastraria gente sem querer).
// Quem grava é esta ação, disparada pelo único botão da página. Sem login,
// sem formulário de motivo — um toque e acabou.
// =============================================================================

import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

import { validarTokenDescadastro } from '@/lib/marketing/descadastro'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
)

// Origem é informativa (template_slug que gerou o clique) — sanitizada por
// forma, não por lista, pra rota pública nunca depender do vocabulário interno.
const REGEX_ORIGEM = /^[a-z0-9_]{1,40}$/

export async function confirmarDescadastro(formData: FormData) {
  const token = String(formData.get('t') ?? '')
  const origemBruta = String(formData.get('de') ?? '')
  const origem = REGEX_ORIGEM.test(origemBruta) ? origemBruta : null

  const email = validarTokenDescadastro(token, process.env.MARKETING_LINK_SECRET ?? '')
  if (!email) redirect('/descadastrar')

  const { error } = await supabaseAdmin
    .from('marketing_unsubscribes')
    .upsert({ email, origem }, { onConflict: 'email', ignoreDuplicates: true })

  const query = `t=${encodeURIComponent(token)}${origem ? `&de=${origem}` : ''}`
  if (error) {
    console.error('Erro ao gravar descadastro:', error)
    redirect(`/descadastrar?${query}&erro=1`)
  }
  redirect(`/descadastrar?${query}&ok=1`)
}
