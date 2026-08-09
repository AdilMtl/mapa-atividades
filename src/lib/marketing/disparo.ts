// =============================================================================
// MARKETING — motor de disparo (ISSUE-601C)
// Zero I/O: classificação de destinatários, substituição de variáveis com
// valores REAIS e render do e-mail que sai de verdade. A rota de API cuida de
// Supabase/Resend; aqui vive tudo que precisa de teste — inclusive a regra de
// que falha do Resend vira `status='falhou'` com motivo (o SDK não lança
// exceção; devolve `{ error }` na resposta — armadilha já paga uma vez na 318).
//
// Travas da spec (§3.3, §3.4, §9):
// - descadastrado e optin_newsletter=false NUNCA recebem — não existe forçar.
// - repetir template só com `forcarReenvio` (segunda confirmação explícita).
// - o rodapé de descadastro é injetado aqui, por fora do corpo editável.
// =============================================================================

import { rotuloNivelMaturidade, rotuloTipoSolucao } from '@/lib/admin/analytics-rotulos'

import { chaveEnvio, type ContatoMarketing } from './segmentos'
import { markdownSimplesParaHtml } from './email-preview'
import { VARIAVEIS_VALIDAS, type VariavelTemplate } from './templates'

// ----------------------------------------------------------------------------
// Classificação — quem pode receber e quem está bloqueado (e por quê)
// ----------------------------------------------------------------------------

export type StatusDestino =
  | 'apto'
  | 'sem_optin' // LGPD vence preferência de qualquer um — sem caminho de forçar
  | 'descadastrado' // idem: descadastro vence opt-in
  | 'ja_recebeu' // vira apto SÓ com forcarReenvio=true (segundo toque)
  | 'desconhecido' // e-mail que não existe em vw_marketing_contatos

export interface DestinoClassificado {
  email: string
  status: StatusDestino
  contato: ContatoMarketing | null
}

export function classificarDestinatarios(
  emails: string[],
  contatosPorEmail: Map<string, ContatoMarketing>,
  jaReceberam: Set<string>,
  templateSlug: string,
  forcarReenvio: boolean,
): DestinoClassificado[] {
  const unicos = [...new Set(emails.map((e) => e.trim().toLowerCase()).filter(Boolean))]

  return unicos.map((email) => {
    const contato = contatosPorEmail.get(email) ?? null
    if (!contato) return { email, status: 'desconhecido' as const, contato }
    // Ordem importa: os bloqueios de consentimento vêm antes da duplicidade —
    // forcarReenvio nunca pode "passar por cima" de descadastro/opt-in.
    if (contato.descadastrado) return { email, status: 'descadastrado' as const, contato }
    if (!contato.optinNewsletter) return { email, status: 'sem_optin' as const, contato }
    if (jaReceberam.has(chaveEnvio(email, templateSlug)) && !forcarReenvio) {
      return { email, status: 'ja_recebeu' as const, contato }
    }
    return { email, status: 'apto' as const, contato }
  })
}

// ----------------------------------------------------------------------------
// Variáveis com valores reais (a prévia da 601D usa exemplos; aqui é pra valer)
// ----------------------------------------------------------------------------

const REGEX_VARIAVEL = /\{\{\s*([a-zA-Z_]+)\s*\}\}/g

export function resultadoRadarLegivel(contato: ContatoMarketing): string {
  if (contato.radarKind === 'maturidade' && contato.radarResult) {
    const nivel = rotuloNivelMaturidade(contato.radarResult)
    if (nivel) return `nível ${nivel} no Radar de Maturidade`
  }
  if (contato.radarKind === 'oportunidades' && contato.radarResult) {
    const tipo = rotuloTipoSolucao(contato.radarResult)
    if (tipo) return `caminho ${tipo} no Radar de Oportunidades`
  }
  // Contato sem radar (ex.: segmento assinante_sem_radar) — texto neutro.
  return 'o teu resultado do radar'
}

export interface ValoresVariaveis {
  primeiro_nome: string
  resultado_radar: string
  link_lab: string
  link_descadastro: string
}

export function montarValores(
  contato: ContatoMarketing,
  templateSlug: string,
  siteUrl: string,
  linkDescadastroUrl: string,
): ValoresVariaveis {
  return {
    primeiro_nome: contato.nome?.trim().split(/\s+/)[0] ?? '',
    resultado_radar: resultadoRadarLegivel(contato),
    link_lab: `${siteUrl}/auth?next=${encodeURIComponent('/lab/inicio')}&utm_source=email&utm_medium=marketing&utm_campaign=${templateSlug}`,
    link_descadastro: linkDescadastroUrl,
  }
}

/**
 * Troca `{{variavel}}` pelos valores reais. Quando o contato não tem nome,
 * `{{primeiro_nome}}` vira vazio e a saudação é limpa ("Oi, !" → "Oi!") —
 * melhor um cumprimento seco que um buraco no meio da frase.
 */
export function substituirVariaveisReais(texto: string, valores: ValoresVariaveis): string {
  const trocado = texto.replace(REGEX_VARIAVEL, (match, nome: string) => {
    if ((VARIAVEIS_VALIDAS as readonly string[]).includes(nome)) {
      return valores[nome as VariavelTemplate]
    }
    return match
  })
  return trocado.replace(/([Oo]i|[Oo]lá),\s+([!,.?])/g, '$1$2')
}

// ----------------------------------------------------------------------------
// Render do e-mail real — mesmo envelope visual da newsletter (dark-safe),
// com o rodapé de descadastro injetado pelo sistema (§6.3)
// ----------------------------------------------------------------------------

function escapeHtml(texto: string): string {
  return texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function renderEmailMarketing(
  assuntoFinal: string,
  corpoFinal: string,
  linkDescadastroUrl: string,
): string {
  const corpoHtml = markdownSimplesParaHtml(corpoFinal)

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <title>${escapeHtml(assuntoFinal)}</title>
  <style>
    @media screen and (max-width: 600px) {
      .mobile-full { width: 100% !important; }
      .mobile-pad { padding-left: 20px !important; padding-right: 20px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#08110F;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#08110F;">
    <tr>
      <td align="center" style="padding:32px 12px;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" class="mobile-full" style="max-width:600px; background-color:#0A1412; border-radius:16px; border:1px solid rgba(255,255,255,0.08);">
          <tr>
            <td style="padding:34px 40px 26px; text-align:center; border-bottom:1px solid rgba(255,255,255,0.08);" class="mobile-pad">
              <div style="font-family:'Courier New', monospace; font-size:14px; letter-spacing:0.12em; text-transform:uppercase; color:#D97706; font-weight:700;">Conversas no Corredor</div>
              <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:12px auto;">
                <tr>
                  <td style="width:56px; height:3px; line-height:3px; font-size:0; background-color:#D97706; background-image:linear-gradient(90deg,#D97706,#D34C75); border-radius:2px;">&nbsp;</td>
                </tr>
              </table>
              <div style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#F8F0E6; line-height:1.4;">${escapeHtml(assuntoFinal)}</div>
              <div style="font-family:Arial, Helvetica, sans-serif; font-size:12px; color:#70817B; margin-top:8px;">+ConverSaaS, o laboratório da newsletter</div>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px;" class="mobile-pad">
              ${corpoHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px; border-top:1px solid rgba(255,255,255,0.08); text-align:center;" class="mobile-pad">
              <div style="font-family:Arial, Helvetica, sans-serif; font-size:12px; color:#70817B;">
                Não quer mais receber estes e-mails?
                <a href="${linkDescadastroUrl}" style="color:#F0B674; text-decoration:underline;">Descadastrar-se</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim()
}

// ----------------------------------------------------------------------------
// Execução — o "enviar" é injetado (a rota passa o Resend; os testes, um fake)
// ----------------------------------------------------------------------------

export interface EnvioPedido {
  to: string
  subject: string
  html: string
}

/** Mesmo formato de resposta do SDK do Resend: erro vem no retorno, não em exceção. */
export type EnviarFn = (pedido: EnvioPedido) => Promise<{ error: { message?: string } | null }>

export interface ResultadoEnvio {
  email: string
  status: 'enviado' | 'falhou'
  erro: string | null
}

export interface TemplateParaEnvio {
  slug: string
  versao: number
  assunto: string
  corpo: string
}

export async function executarDisparo(opts: {
  aptos: { email: string; contato: ContatoMarketing }[]
  template: TemplateParaEnvio
  enviar: EnviarFn
  siteUrl: string
  gerarLinkDescadastro: (email: string) => string
  /** Pausa entre envios (rate limit do Resend). Injetável pra teste não dormir. */
  aguardar?: (ms: number) => Promise<void>
  intervaloMs?: number
}): Promise<ResultadoEnvio[]> {
  const {
    aptos,
    template,
    enviar,
    siteUrl,
    gerarLinkDescadastro,
    aguardar = (ms) => new Promise((r) => setTimeout(r, ms)),
    intervaloMs = 600,
  } = opts

  const resultados: ResultadoEnvio[] = []

  for (const [i, { email, contato }] of aptos.entries()) {
    if (i > 0 && intervaloMs > 0) await aguardar(intervaloMs)

    try {
      const linkDesc = gerarLinkDescadastro(email)
      const valores = montarValores(contato, template.slug, siteUrl, linkDesc)
      const assunto = substituirVariaveisReais(template.assunto, valores)
      const corpo = substituirVariaveisReais(template.corpo, valores)
      const html = renderEmailMarketing(assunto, corpo, linkDesc)

      const { error } = await enviar({ to: email, subject: assunto, html })
      if (error) {
        resultados.push({ email, status: 'falhou', erro: error.message ?? 'Resend recusou o envio (sem mensagem)' })
      } else {
        resultados.push({ email, status: 'enviado', erro: null })
      }
    } catch (e) {
      resultados.push({ email, status: 'falhou', erro: e instanceof Error ? e.message : 'erro inesperado no envio' })
    }
  }

  return resultados
}
