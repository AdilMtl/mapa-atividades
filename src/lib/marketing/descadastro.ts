// =============================================================================
// MARKETING — token de descadastro (ISSUE-601C, §3.4 da spec)
// O link de descadastro carrega um token assinado (HMAC-SHA256) derivado do
// e-mail — NUNCA o e-mail em texto na URL (senão qualquer um descadastra
// qualquer um, e o e-mail vaza em log de referer).
//
// O segredo vem de MARKETING_LINK_SECRET (env). Sem ele configurado, nenhum
// link pode ser gerado — e por consequência nenhum disparo acontece. É trava
// intencional: o sistema nasce incapaz de enviar até o ambiente estar completo.
//
// Formato do token: base64url(email) + "." + base64url(hmac(email)) — o e-mail
// viaja dentro do token (codificado, não legível a olho nu) porque a rota
// pública precisa saber QUEM descadastrar sem consultar banco antes de validar.
// =============================================================================

import { createHmac, timingSafeEqual } from 'crypto'

function b64url(buf: Buffer): string {
  return buf.toString('base64url')
}

function assinar(email: string, secret: string): Buffer {
  return createHmac('sha256', secret).update(email, 'utf8').digest()
}

/** Normalização única do e-mail — o token sempre assina a forma canônica. */
export function normalizarEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function gerarTokenDescadastro(email: string, secret: string): string {
  if (!secret) throw new Error('MARKETING_LINK_SECRET ausente — não dá pra gerar link de descadastro.')
  const canonico = normalizarEmail(email)
  const payload = Buffer.from(canonico, 'utf8')
  return `${b64url(payload)}.${b64url(assinar(canonico, secret))}`
}

/**
 * Valida o token e devolve o e-mail canônico, ou null se o token for inválido,
 * adulterado ou assinado com outro segredo. Nunca lança por entrada malformada
 * (a rota é pública — lixo na URL não pode virar 500).
 */
export function validarTokenDescadastro(token: string, secret: string): string | null {
  if (!secret || !token) return null
  const partes = token.split('.')
  if (partes.length !== 2 || !partes[0] || !partes[1]) return null

  try {
    const email = Buffer.from(partes[0], 'base64url').toString('utf8')
    if (!email || email !== normalizarEmail(email)) return null

    const assinaturaRecebida = Buffer.from(partes[1], 'base64url')
    const assinaturaEsperada = assinar(email, secret)
    if (assinaturaRecebida.length !== assinaturaEsperada.length) return null
    if (!timingSafeEqual(assinaturaRecebida, assinaturaEsperada)) return null

    return email
  } catch {
    return null
  }
}

/** URL completa do link que vai no rodapé de todo e-mail de marketing. */
export function linkDescadastro(email: string, secret: string, siteUrl: string, origem?: string): string {
  const token = gerarTokenDescadastro(email, secret)
  const de = origem ? `&de=${encodeURIComponent(origem)}` : ''
  return `${siteUrl}/descadastrar?t=${encodeURIComponent(token)}${de}`
}
