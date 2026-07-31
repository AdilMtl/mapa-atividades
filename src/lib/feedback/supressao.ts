// =============================================================================
// FEEDBACK — onde o FAB NÃO aparece (ISSUE-318D, §3 da spec)
// Decisão de conversão, não de engenharia: o funil que vira dinheiro do Ads não
// divide a tela com um botão flutuante. Ligar o FAB numa dessas rotas é remover
// uma string desta lista — a decisão é reversível de propósito.
// =============================================================================

export const ROTAS_SEM_FEEDBACK = [
  // Funil legado: ninguém toca, e o dono vai aposentar.
  '/pre-diagnostico',
  // Transacional: quem está tentando entrar quer entrar, não comentar.
  '/auth',
  '/reset-password',
] as const

/**
 * `pathname` puro (sem query/hash), como devolvido pelo `usePathname()`.
 * Casa a rota exata e as filhas (`/auth/x`), mas nunca por prefixo de string
 * solta — `/authorizacao` continua liberada.
 */
export function rotaPermiteFeedback(pathname: string | null | undefined): boolean {
  if (!pathname) return false
  const rota = pathname.replace(/\/+$/, '') || '/'
  return !ROTAS_SEM_FEEDBACK.some((suprimida) => rota === suprimida || rota.startsWith(`${suprimida}/`))
}
