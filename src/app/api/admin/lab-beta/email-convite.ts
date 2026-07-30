// ═══════════════════════════════════════════════════════════════════
// 📧 TEMPLATE: E-MAIL DE CONVITE DO BETA DO LAB — ISSUE-318
// ═══════════════════════════════════════════════════════════════════
// Mesma casca dark-safe do e-mail de trilha dos radares (hex literal +
// color-scheme dark). Corpo = o template aprovado no doc da rotina
// (docs/revamp/ISSUE-318-rotina-convites-beta.md), voz do dono — sem
// travessão de aparte (veto de voz registrado na copy da vitrine).

import { SITE_URL } from '@/lib/site-config'

const LINK_ENTRADA = `${SITE_URL}/auth?next=${encodeURIComponent('/lab/inicio')}&utm_source=email&utm_medium=convite_lab&utm_campaign=beta`

export function gerarAssuntoConvite(): string {
  return 'Teu convite pro Lab chegou'
}

function paragrafo(texto: string, cor = '#D2DDD9'): string {
  return `<p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; line-height:1.65; color:${cor}; margin:0 0 18px 0;">${texto}</p>`
}

// Botão principal à prova de Outlook (VML), igual ao padrão do e-mail de trilha.
function botaoPrincipal(label: string, url: string, largura = 300): string {
  return `
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:6px 0 18px 0;">
      <tr>
        <td align="center">
          <!--[if mso]>
          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${url}" style="height:50px;v-text-anchor:middle;width:${largura}px;" arcsize="20%" stroke="f" fillcolor="#D97706">
          <w:anchorlock/>
          <center style="color:#1E1005;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">${label} &rarr;</center>
          </v:roundrect>
          <![endif]-->
          <!--[if !mso]><!-->
          <a href="${url}" style="display:inline-block; min-width:${largura - 56}px; padding:15px 28px; background-color:#D97706; background-image:linear-gradient(90deg,#D97706,#D34C75); font-family:Arial, Helvetica, sans-serif; font-size:16px; font-weight:700; color:#1E1005; text-align:center; text-decoration:none; border-radius:12px;">
            ${label} →
          </a>
          <!--<![endif]-->
        </td>
      </tr>
    </table>`
}

export function gerarTemplateConvite(firstName: string | null): string {
  const saudacao = firstName ? `Oi, ${firstName}!` : 'Oi!'

  const corpo = `
    ${paragrafo(saudacao, '#F8F0E6')}
    ${paragrafo('Você entrou na lista do Lab lá no site. Chegou a tua vez.')}
    ${paragrafo(
      'O Lab é a parte prática do Conversas no Corredor: você conta um problema do teu trabalho numa conversa guiada, como se estivesse falando com um consultor, e sai com um diagnóstico e um plano em fases pra construir uma solução com as ferramentas que você já tem.',
    )}
    ${paragrafo('Teu acesso já está liberado pra este e-mail. É só criar tua conta aqui:')}
    ${botaoPrincipal('Entrar no Lab', LINK_ENTRADA)}
    ${paragrafo(
      'O beta é fechado de propósito: pouca gente de cada vez, pra eu conseguir acompanhar de perto. Qualquer coisa que travar, parecer esquisita ou te der uma ideia, responde este e-mail direto, que eu leio tudo.',
    )}
    ${paragrafo('Pega teu café e bora construir.', '#F8F0E6')}
    ${paragrafo('Adilson')}
  `

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <title>Convite pro Lab — +ConverSaaS</title>
  <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
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
              <div style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#F8F0E6; line-height:1.4;">Teu convite pro Lab</div>
              <div style="font-family:Arial, Helvetica, sans-serif; font-size:12px; color:#70817B; margin-top:8px;">+ConverSaaS, o laboratório da newsletter</div>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px;" class="mobile-pad">
              ${corpo}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px; border-top:1px solid rgba(255,255,255,0.08); text-align:center;" class="mobile-pad">
              <div style="font-family:Arial, Helvetica, sans-serif; font-size:13px; color:#70817B;">
                Você recebeu este convite porque entrou na lista do Lab em
                <a href="${SITE_URL}/lab" style="color:#F0B674; text-decoration:underline;">conversas-no-corredor.vercel.app/lab</a>.
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
