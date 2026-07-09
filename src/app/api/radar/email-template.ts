// ═══════════════════════════════════════════════════════════════════
// 📧 TEMPLATE: E-MAIL DE TRILHA DOS RADARES — ISSUE-113
// ═══════════════════════════════════════════════════════════════════
// E-mail 1 do doc operacional §15.1 (resultado) — a sequência de nutrição
// (e-mails 2–4) fica para a Fase 1.5, fora do escopo desta issue.
// Dark-safe: cores DS2 em hex literal (clientes de e-mail não leem CSS vars)
// + color-scheme/supported-color-schemes "dark" — não depende do tema do
// cliente, então não sofre re-coloração automática.
// Conteúdo reaproveitado de lib/radar/content.ts (ISSUE-105): o bloco "Na
// prática" da oportunidade É o mini-guia prometido na tela (nota do dono,
// CURRENT-STATUS 2026-07-06) — este arquivo só renderiza, não escreve copy nova.

import { SITE_URL } from '@/lib/site-config';
import type { MaturityContent, OpportunityContent, Reading } from '@/lib/radar/types';

interface RadarEmailMaturidade {
  kind: 'maturidade';
  firstName: string;
  conteudo: MaturityContent;
}

interface RadarEmailOportunidades {
  kind: 'oportunidades';
  firstName: string;
  conteudo: OpportunityContent;
}

export type RadarEmailData = RadarEmailMaturidade | RadarEmailOportunidades;

// Critério de aceite da issue: "links com UTM" — todo link de saída do e-mail carrega.
function comUtm(url: string, campanha: string): string {
  const separador = url.includes('?') ? '&' : '?';
  return `${url}${separador}utm_source=email&utm_medium=radar_trilha&utm_campaign=${campanha}`;
}

export function gerarAssuntoEmailRadar(data: RadarEmailData): string {
  if (data.kind === 'maturidade') {
    return `Seu resultado do Radar de Maturidade: estágio ${data.conteudo.nome}`;
  }
  return `Seu diagnóstico completo: ${data.conteudo.titulo.replace(/\.$/, '')}`;
}

function paragrafo(texto: string, cor = '#D2DDD9'): string {
  return `<p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; line-height:1.6; color:${cor}; margin:0 0 18px 0;">${texto}</p>`;
}

function tituloEmail(texto: string): string {
  return `<h1 style="font-family:Georgia, 'Times New Roman', serif; font-size:24px; line-height:1.3; color:#F8F0E6; margin:0 0 16px 0;">${texto}</h1>`;
}

function painel(conteudoHtml: string): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px 0;">
      <tr>
        <td style="padding:20px; background-color:#1B3F39; border-radius:12px;">
          ${conteudoHtml}
        </td>
      </tr>
    </table>`;
}

// Botão secundário (alinhado à esquerda, cantos arredondados só onde o cliente suporta).
function botao(label: string, url: string): string {
  return `
    <table cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px 0;">
      <tr>
        <td style="border-radius:10px; background-color:#1B3F39; border:1px solid rgba(240,182,116,0.35);">
          <a href="${url}" style="display:inline-block; padding:13px 26px; font-family:Arial, Helvetica, sans-serif; font-size:15px; font-weight:700; color:#F8F0E6; text-decoration:none; border-radius:10px;">
            ${label} →
          </a>
        </td>
      </tr>
    </table>`;
}

// Botão principal, centralizado e à prova de Outlook (VML roundrect) — para a CTA de maior
// prioridade do e-mail (assinar a newsletter). Largura fixa exigida pelo VML.
function botaoPrincipal(label: string, url: string, largura = 320): string {
  return `
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:4px 0 14px 0;">
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
    </table>`;
}

function linkSecundario(label: string, url: string): string {
  return `<a href="${url}" style="font-family:Arial, Helvetica, sans-serif; color:#F0B674; text-decoration:underline; font-size:14px;">${label}</a>`;
}

// Bloco de fechamento dedicado à newsletter — a conversão-fim da Fase 1. Faixa de acento no
// topo (gradiente da marca, com fallback sólido no Outlook), pitch curto e CTA principal.
function newsletterBlock(campanha: string): string {
  const linkNewsletter = comUtm('https://conversasnocorredor.substack.com/subscribe', campanha);
  const linkArquivo = comUtm('https://conversasnocorredor.substack.com/archive', campanha);
  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:30px 0 6px 0;">
      <tr>
        <td style="height:4px; line-height:4px; font-size:0; background-color:#D97706; background-image:linear-gradient(90deg,#D97706,#D34C75); border-radius:14px 14px 0 0;">&nbsp;</td>
      </tr>
      <tr>
        <td style="padding:26px 24px; background-color:#1B3F39; border-radius:0 0 14px 14px; text-align:center;">
          <span style="display:block; font-family:'Courier New', monospace; font-size:11px; letter-spacing:0.1em; text-transform:uppercase; color:#F0B674; margin-bottom:10px;">A newsletter que move tudo isso</span>
          <h2 style="font-family:Georgia, 'Times New Roman', serif; font-size:22px; line-height:1.3; color:#F8F0E6; margin:0 0 12px 0;">Conversas no Corredor</h2>
          <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; line-height:1.65; color:#D2DDD9; margin:0 0 22px 0;">Toda semana, uma conversa curta sobre IA aplicada ao trabalho real — repertório, julgamento e exemplos de dentro da firma. Sem hype, sem ferramenta da semana. É daqui que nascem os radares que você acabou de fazer.</p>
          ${botaoPrincipal('Vamos para mais conversas', linkNewsletter)}
          <div style="margin-top:2px;">${linkSecundario('Ver os textos já publicados', linkArquivo)}</div>
        </td>
      </tr>
    </table>`;
}

function blocoLeituras(leituras: Reading[], campanha: string): string {
  if (leituras.length === 0) return '';
  const itens = leituras
    .map(
      (l) => `
      <tr>
        <td style="padding:14px 18px; background-color:#132622; border:1px solid rgba(255,255,255,0.08); border-radius:10px;">
          <span style="display:block; font-family:'Courier New', monospace; font-size:11px; letter-spacing:0.06em; text-transform:uppercase; color:#9EAEA8; margin-bottom:4px;">Leitura</span>
          <a href="${comUtm(l.url, campanha)}" style="font-size:15px; color:#F8F0E6; text-decoration:none; font-weight:600;">${l.titulo}</a>
        </td>
      </tr>
      <tr><td style="height:10px; line-height:10px; font-size:10px;">&nbsp;</td></tr>`
    )
    .join('');
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 8px 0;">${itens}</table>`;
}

function envelope(firstName: string, corpoHtml: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <title>+ConverSaaS</title>
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
              <div style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#F8F0E6; line-height:1.4;">IA aplicada ao trabalho real, sem hype</div>
              <div style="font-family:Arial, Helvetica, sans-serif; font-size:12px; color:#70817B; margin-top:8px;">Seu resultado no +ConverSaaS, o laboratório da newsletter</div>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px;" class="mobile-pad">
              <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#D2DDD9; margin:0 0 20px 0;">Oi, ${firstName} —</p>
              ${corpoHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px; border-top:1px solid rgba(255,255,255,0.08); text-align:center;" class="mobile-pad">
              <div style="font-family:Arial, Helvetica, sans-serif; font-size:13px; color:#70817B;">
                Você recebeu este e-mail porque completou um radar em
                <a href="${SITE_URL}" style="color:#F0B674; text-decoration:underline;">conversas-no-corredor.vercel.app</a>.
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

function gerarCorpoMaturidade(data: RadarEmailMaturidade): string {
  const { conteudo } = data;
  const campanha = 'maturidade';
  const linkOportunidades = comUtm(`${SITE_URL}/radar/oportunidades`, campanha);

  return `
    ${tituloEmail(conteudo.titulo)}
    ${paragrafo(conteudo.corpo)}
    ${painel(paragrafo(`<strong style="color:#F8F0E6;">Seu próximo salto:</strong> ${conteudo.proximoSalto}`))}
    ${blocoLeituras(conteudo.leituras, campanha)}
    ${botao(conteudo.ctaPonte, linkOportunidades)}
    ${newsletterBlock(campanha)}
  `;
}

function gerarCorpoOportunidades(data: RadarEmailOportunidades): string {
  const { conteudo } = data;
  const campanha = 'oportunidades';
  const linkLab = comUtm(`${SITE_URL}/lab`, campanha);

  return `
    ${tituloEmail(conteudo.titulo)}
    ${paragrafo(conteudo.porque)}
    ${painel(paragrafo(`<strong style="color:#F8F0E6;">Primeiro passo:</strong> ${conteudo.primeiroPasso}`))}
    ${painel(`
      <span style="display:block; font-family:'Courier New', monospace; font-size:11px; letter-spacing:0.06em; text-transform:uppercase; color:#F0B674; margin-bottom:10px;">Na prática</span>
      ${paragrafo(conteudo.naPratica.gancho, '#F8F0E6')}
      ${paragrafo(conteudo.naPratica.comeceAssim)}
      ${paragrafo(conteudo.naPratica.umNivelAcima)}
    `)}
    ${blocoLeituras(conteudo.leituras, campanha)}
    ${newsletterBlock(campanha)}
    <div style="text-align:center; margin-top:6px;">${linkSecundario(conteudo.ctaLab, linkLab)}</div>
  `;
}

export function gerarTemplateEmailRadar(data: RadarEmailData): string {
  const corpoHtml = data.kind === 'maturidade' ? gerarCorpoMaturidade(data) : gerarCorpoOportunidades(data);
  return envelope(data.firstName, corpoHtml);
}
