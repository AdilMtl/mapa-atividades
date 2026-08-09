// =============================================================================
// MARKETING — pré-visualização de e-mail (ISSUE-601D)
// Renderiza assunto + corpo markdown da pasta de templates com a MESMA
// identidade visual dos e-mails reais (kicker âmbar, cartão escuro Georgia,
// botão gradiente) — hoje duplicada por copy-paste entre
// `api/radar/email-template.ts` e `api/admin/lab-beta/email-convite.ts`.
// Este módulo não substitui nenhum dos dois (o envio real é a ISSUE-601C);
// é uma casca própria, só para pré-visualização, fiel aos mesmos tokens de
// cor/tipografia — pra quem edita ver como a newsletter realmente se parece.
// Zero I/O: recebe texto, devolve HTML.
// =============================================================================

import { VARIAVEIS_VALIDAS, type VariavelTemplate } from './templates'

const REGEX_VARIAVEL = /\{\{\s*([a-zA-Z_]+)\s*\}\}/g

const VALORES_EXEMPLO: Record<VariavelTemplate, string> = {
  primeiro_nome: 'Marina',
  resultado_radar: 'nível Operador no Radar de Maturidade',
  link_lab: 'https://conversas-no-corredor.vercel.app/lab',
  link_descadastro: 'https://conversas-no-corredor.vercel.app/descadastrar?token=exemplo',
}

function ehVariavelValida(nome: string): nome is VariavelTemplate {
  return (VARIAVEIS_VALIDAS as readonly string[]).includes(nome)
}

/** Troca `{{variavel}}` por um valor de exemplo — só para a prévia, nunca usado no envio real. */
export function substituirVariaveisDeExemplo(texto: string): string {
  return texto.replace(REGEX_VARIAVEL, (match, nome: string) =>
    ehVariavelValida(nome) ? VALORES_EXEMPLO[nome] : match,
  )
}

function escapeHtml(texto: string): string {
  return texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** Corpo é "markdown simples" (§6.3): parágrafos separados por linha em branco + **negrito**. */
export function markdownSimplesParaHtml(corpo: string): string {
  const paragrafos = corpo
    .trim()
    .split(/\n\s*\n/)
    .filter((p) => p.trim().length > 0)

  return paragrafos
    .map((paragrafo) => {
      let html = escapeHtml(paragrafo.trim()).replace(/\n/g, '<br/>')
      html = html.replace(/\*\*(.+?)\*\*/g, '<strong style="color:#F8F0E6;">$1</strong>')
      return `<p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; line-height:1.65; color:#D2DDD9; margin:0 0 18px 0;">${html}</p>`
    })
    .join('\n')
}

function envelopePreview(assunto: string, corpoHtml: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <title>${escapeHtml(assunto)}</title>
</head>
<body style="margin:0; padding:0; background-color:#08110F;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#08110F;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; width:100%; background-color:#0A1412; border-radius:16px; border:1px solid rgba(255,255,255,0.08);">
          <tr>
            <td style="padding:28px 24px 22px; text-align:center; border-bottom:1px solid rgba(255,255,255,0.08);">
              <div style="font-family:'Courier New', monospace; font-size:14px; letter-spacing:0.12em; text-transform:uppercase; color:#D97706; font-weight:700;">Conversas no Corredor</div>
              <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:12px auto;">
                <tr>
                  <td style="width:56px; height:3px; line-height:3px; font-size:0; background-color:#D97706; background-image:linear-gradient(90deg,#D97706,#D34C75); border-radius:2px;">&nbsp;</td>
                </tr>
              </table>
              <div style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#F8F0E6; line-height:1.4;">${escapeHtml(assunto) || '(sem assunto ainda)'}</div>
              <div style="font-family:Arial, Helvetica, sans-serif; font-size:12px; color:#70817B; margin-top:8px;">+ConverSaaS, o laboratório da newsletter</div>
            </td>
          </tr>
          <tr>
            <td style="padding:26px 24px;">
              ${corpoHtml || '<p style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#70817B; font-style:italic;">(corpo vazio — este template ainda é um rascunho)</p>'}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px; border-top:1px solid rgba(255,255,255,0.08); text-align:center;">
              <div style="font-family:Arial, Helvetica, sans-serif; font-size:12px; color:#70817B;">
                Não quer mais receber estes e-mails?
                <a href="#" style="color:#F0B674; text-decoration:underline;">Descadastrar-se</a>
                <br/>
                <span style="opacity:0.7;">↑ rodapé injetado pelo sistema — não faz parte do corpo editável.</span>
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

/** Monta o HTML completo de prévia (assunto + corpo com variáveis trocadas por exemplos). */
export function renderPreviewEmail(assunto: string, corpo: string): string {
  const assuntoExemplo = substituirVariaveisDeExemplo(assunto)
  const corpoExemplo = substituirVariaveisDeExemplo(corpo)
  const corpoHtml = markdownSimplesParaHtml(corpoExemplo)
  return envelopePreview(assuntoExemplo, corpoHtml)
}
