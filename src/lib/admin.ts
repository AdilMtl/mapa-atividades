// =============================================================================
// ADMIN — identidade e gate server-side (ISSUE-318)
// Fonte única do "quem é admin" (antes o e-mail vivia hardcoded em 2 lugares).
// A autoridade é SEMPRE a sessão validada no servidor (getUser via cookie) —
// nunca header enviado pelo cliente (o x-user-email antigo era forjável por
// qualquer curl; corrigido nesta issue).
// =============================================================================

import type { User } from '@supabase/supabase-js'

import { obterUsuarioSessao } from './supabase-server'

// Env permite trocar sem deploy de código; fallback é o dono (único admin real).
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'adilson.matioli@gmail.com'

export function ehAdmin(email: string | null | undefined): boolean {
  return !!email && email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase()
}

/**
 * Gate para rotas/páginas de admin: devolve o usuário SE a sessão do cookie é
 * do admin; null caso contrário (anônimo, expirado ou outro usuário).
 */
export async function exigirAdminSessao(): Promise<User | null> {
  const user = await obterUsuarioSessao()
  if (!user || !ehAdmin(user.email)) return null
  return user
}
