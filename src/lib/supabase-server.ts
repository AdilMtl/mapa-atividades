// =============================================================================
// LAB — SUPABASE SERVER-SIDE (ISSUE-311)
// Clientes para Server Components/rotas: sessão lida do COOKIE (@supabase/ssr)
// e autorização checada em `authorized_emails` via service role (mesma lógica
// da rota /api/auth/check-authorization — aqui como função, sem hop de HTTP).
// Server Component não pode ESCREVER cookie: o refresh do token é papel do
// middleware (src/middleware.ts, escopado às rotas logadas do Lab).
// =============================================================================

import { createServerClient } from '@supabase/ssr'
import { createClient, type User } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

/** Cliente com a sessão do usuário (leitura de cookie; setAll é no-op em RSC). */
export async function criarClienteServidor() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {
          // Server Component não escreve cookie — refresh acontece no middleware.
        },
      },
    },
  )
}

/** Usuário da sessão, VALIDADO no servidor do Supabase (getUser, não getSession). */
export async function obterUsuarioSessao(): Promise<User | null> {
  const supabase = await criarClienteServidor()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export interface Autorizacao {
  autorizado: boolean
  /** 'lab_beta' = convidado do beta (não vê o legado) · outros = assinante antigo. */
  planType: string | null
  motivo?: string
}

/**
 * Checa `authorized_emails` com service role (mesmas regras da rota
 * check-authorization: e-mail presente + não expirado).
 */
export async function verificarAutorizacao(email: string): Promise<Autorizacao> {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  const { data, error } = await admin
    .from('authorized_emails')
    .select('expires_at, plan_type')
    .eq('email', email.toLowerCase().trim())
    .single()

  if (error || !data) {
    return { autorizado: false, planType: null, motivo: 'nao_autorizado' }
  }
  if (new Date() > new Date(data.expires_at)) {
    return { autorizado: false, planType: data.plan_type ?? null, motivo: 'expirado' }
  }
  return { autorizado: true, planType: data.plan_type ?? 'manual' }
}
