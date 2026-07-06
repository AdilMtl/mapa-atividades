# 07 — Mapa de Tracking: Google Ads + GTM (inventário completo)

> **Revamp Conversas no Corredor / +ConverSaaS** · criado em 2026-07-05 a pedido do dono.
> **Função:** registro autoritativo de ONDE cada marcador de Google Ads/GTM vive no código,
> o que ele faz, e as regras para preservá-los nas páginas novas do revamp (em especial na
> landing page nova). Qualquer issue que toque nesses arquivos referencia este mapa.

---

## 1. Identificadores oficiais

| Identificador | Valor | O que é |
|---|---|---|
| Container GTM | `GTM-PDJ2K5BX` | Google Tag Manager — carrega todas as tags (GA4, Google Ads) |
| Conversão Google Ads | `AW-16601345592/0K0dCMm6oo4bELjckew9` | Evento de conversão "lead capturado", valor 1.0 BRL |

A função global `gtag` NÃO é definida pelo nosso código — ela é injetada pelo container GTM
(tag de Google Ads configurada na interface do GTM, gerida pelo dono). Por isso o código
sempre testa `typeof gtag !== 'undefined'` antes de disparar.

## 2. Inventário — onde cada marcador vive HOJE

### 2.1 `src/app/layout.tsx` — carregamento do GTM (2 blocos)

- **Linhas ~139–148:** `<Script id="google-tag-manager" strategy="afterInteractive">` com o
  loader oficial do GTM apontando para `GTM-PDJ2K5BX`. Inicializa `window.dataLayer`.
- **Linhas ~150–158:** `<noscript>` com iframe `googletagmanager.com/ns.html?id=GTM-PDJ2K5BX`
  (fallback sem JS).
- **Posição:** primeiro conteúdo dentro do `<body>`.
- **Alcance:** o layout raiz envolve TODAS as rotas → GTM carrega em todas as páginas,
  públicas e privadas.

### 2.2 `src/components/prediagnostico/EmailGate.tsx` — o disparo REAL da conversão

- **Linha 11:** `declare function gtag(...)` — declaração de tipo apenas (adicionada na
  v3.5.3; zero runtime).
- **Linhas 67–75:** o ÚNICO disparo funcional da conversão Google Ads do site:
  ```js
  if (data.triggerConversion && typeof gtag !== 'undefined') {
    gtag('event', 'conversion', {
      'send_to': 'AW-16601345592/0K0dCMm6oo4bELjckew9',
      'value': 1.0, 'currency': 'BRL'
    });
  }
  ```
- **Quando dispara:** após `POST /api/prediag/lead` responder `success: true` com
  `triggerConversion: true`.

### 2.3 `src/app/api/prediag/lead/route.ts` — origem do flag

- **Linha ~194:** `const shouldTriggerConversion = true;` — constante: toda captura de lead
  bem-sucedida autoriza a conversão.
- **Linha ~269:** `triggerConversion: shouldTriggerConversion` na resposta JSON.

### 2.4 `src/app/api/prediag/email-template.ts` — snippet INERTE (não funcional)

- **Linhas ~456–465:** um `<script>` com o mesmo `gtag('event','conversion',...)` embutido no
  HTML do e-mail enviado ao lead. **Clientes de e-mail não executam JavaScript** — este bloco
  nunca dispara. É resquício histórico, inofensivo.
- **Decisão:** NÃO remover no revamp (arquivo é trava crítica; risco/benefício não compensa).
  Registrado aqui para ninguém confundir com o disparo real.

### 2.5 `public/` — nenhum marcador

Verificado em 2026-07-05: nenhum `gtag`/`GTM-`/`AW-` em `public/` (nem no service worker).

## 3. Regras para as páginas novas do revamp

1. **GTM em toda página nova, automaticamente.** O snippet vive no layout raiz; a ISSUE-101
   (layout server-first) DEVE manter os dois blocos (script + noscript) byte-idênticos no
   novo layout raiz, na mesma posição (início do `<body>`). Como o layout raiz continua
   envolvendo todas as rotas, homepage nova, `/radar/*`, `/newsletter`, `/lab` e `/obrigado`
   herdam o GTM sem código adicional. **Proibido** carregar GTM por página.
2. **Landing page nova (`/`):** nenhum marcador adicional é necessário nela — o GTM vem do
   layout. O que a home nova precisa garantir é NÃO interferir: nenhum outro script de tag,
   nenhuma remoção do dataLayer.
3. **Conversão no funil novo (radares) — DECIDIDO PELO DONO (2026-07-05):** o front dos
   radares replica o padrão do EmailGate — dispara `gtag('event','conversion', …)` somente
   após a rota de lead responder `triggerConversion: true`, usando o **MESMO label atual**
   (`AW-16601345592/0K0dCMm6oo4bELjckew9`, value 1.0 BRL). A eventual separação de labels por
   funil fica registrada no "plano de melhoria de Google Ads" (Fase 1.5, ISSUE-208 do
   backlog). O funil legado continua intocado.
4. **Funil legado intocável:** `EmailGate.tsx`, `api/prediag/lead/route.ts` e
   `email-template.ts` não são alterados por nenhuma issue do revamp (exceção: nada prevista).
5. **Config fora do código:** tags/acionadores dentro do container GTM e campanhas/labels no
   Google Ads são geridos pelo dono na interface das plataformas. Quando uma issue precisar de
   tag nova (ex.: GA4 para os 15 eventos novos), ela entrega uma ESPECIFICAÇÃO de tag/trigger
   para o dono aplicar no GTM — o código só faz `dataLayer.push`.

## 4. Checklist de validação (obrigatório em todo PR que tocar layout ou funil)

- [ ] Diff do PR mostra os 2 blocos GTM byte-idênticos (ou intocados).
- [ ] GTM Preview / Tag Assistant no deploy de preview: container `GTM-PDJ2K5BX` carrega.
- [ ] Fluxo legado completo (`/pre-diagnostico` → EmailGate → lead) dispara a conversão
      `AW-16601345592/0K0dCMm6oo4bELjckew9` (visível no Tag Assistant).
- [ ] Se a issue adicionou disparo novo: conversão nova visível E a legada continua disparando.
- [ ] `console.log('Google Ads conversion triggered')` aparece no console do fluxo legado.

## 5. Histórico de verificação

| Data | O que foi verificado | Resultado |
|---|---|---|
| 2026-07-05 | Inventário completo via grep em `src/` e `public/` (padrões: gtag, dataLayer, GTM-, AW-, googletagmanager, conversion) | 4 pontos encontrados (§2.1–2.4); nenhum em `public/` |
