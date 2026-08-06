# 07 — Mapa de Tracking: Google Ads + GTM (inventário completo)

> **Revamp Conversas no Corredor / +ConverSaaS** · criado em 2026-07-05 a pedido do dono.
> **Função:** registro autoritativo de ONDE cada marcador de Google Ads/GTM vive no código,
> o que ele faz, e as regras para preservá-los nas páginas novas do revamp (em especial na
> landing page nova). Qualquer issue que toque nesses arquivos referencia este mapa.

---

> 🚨 **CORREÇÃO IMPORTANTE — 2026-08-06.** Este documento afirmava, desde 2026-07-05, que o
> bloco `gtag('event','conversion', …)` do `EmailGate.tsx` era *"o ÚNICO disparo funcional da
> conversão Google Ads do site"*. **Isso é falso**, e a auditoria do dump do Tag Assistant
> (`docs/Google Ads and Tags/tag_assistant_…_2026_08_06.json`) provou o contrário. Quem
> converte são **tags configuradas no GTM** com gatilhos próprios de clique/formulário; o
> rótulo que está no código **não existe em nenhuma tag**. A afirmação errada fez a ISSUE-106
> replicar para os radares um padrão que nunca disparou nada. As seções §1 e §2.2 abaixo estão
> corrigidas; a §6 registra o estado real medido.

## 1. Identificadores oficiais

| Identificador | Valor | O que é |
|---|---|---|
| Container GTM | `GTM-PDJ2K5BX` | Google Tag Manager — carrega as tags (GA4, Google Ads) |
| Container gtag | `AW-16601345592` ("Conversas no Corredor") | Destinos `G-0HX5BX2XL7` (GA4) + `AW-16601345592` (Ads) |
| ID de conversão do Ads | `16601345592` | Único da conta — comum a todas as ações |

**Rótulos de conversão REAIS (lidos do container em 2026-08-06):**

| Tag no GTM | Rótulo | Funil |
|---|---|---|
| Botao Quero acessar o ecossistema | `xmrlCJuBxegbELjckew9` | legado |
| Botão já sou assinante | `wHARCJ6BxegbELjckew9` | legado |
| Enviar formulário - Fazer pré-diagnóstico | `U6ARCKGBxegbELjckew9` | legado |
| Conversão - Radar Oportunidades ✅ | `m2nPCIPRn90cELjckew9` | **radar** |

✅ **Validada em produção em 2026-08-06.** Ação "Radar Oportunidades - lead" criada no Google Ads
(categoria "Enviar formulário de lead", valor 1 BRL, contagem "Uma", configuração **manual por
evento** — a por URL não serve porque a tela de resultado divide a URL com as perguntas). Tag
homônima no GTM (versão 4 do container, publicada 20:38), acionada pelo **evento personalizado
`result_full_requested`**. Teste no Tag Assistant: a tag aparece em **"Tags disparadas →
Concluída"** na jornada real, sem disparo duplicado, e as 3 tags legadas seguem presentes e
corretamente **não** disparando nesse evento.

⚠️ O rótulo `0K0dCMm6oo4bELjckew9`, presente no `EmailGate.tsx`, no `OportunidadesResultado.tsx`
e na versão anterior desta tabela, **não corresponde a nenhuma tag do container**. Origem
desconhecida (o sufixo `ELjckew9` indica que pertence à mesma conta, então provavelmente é uma
ação antiga). **Não usar como referência.**

A função global `gtag` NÃO é definida pelo nosso código. O código testa
`typeof gtag !== 'undefined'` antes de disparar — e, como o teste falha em silêncio, um disparo
quebrado **não gera erro, log nem alerta**. Foi exatamente assim que isso passou despercebido.

## 2. Inventário — onde cada marcador vive HOJE

### 2.1 `src/app/layout.tsx` — carregamento do GTM (2 blocos)

- **Linhas ~139–148:** `<Script id="google-tag-manager" strategy="afterInteractive">` com o
  loader oficial do GTM apontando para `GTM-PDJ2K5BX`. Inicializa `window.dataLayer`.
- **Linhas ~150–158:** `<noscript>` com iframe `googletagmanager.com/ns.html?id=GTM-PDJ2K5BX`
  (fallback sem JS).
- **Posição:** primeiro conteúdo dentro do `<body>`.
- **Alcance:** o layout raiz envolve TODAS as rotas → GTM carrega em todas as páginas,
  públicas e privadas.

### 2.2 `src/components/prediagnostico/EmailGate.tsx` — bloco com rótulo INVÁLIDO

> ⚠️ Descrito até 2026-08-06 como "o disparo REAL / ÚNICO funcional". **Não é.**

- **Linha 11:** `declare function gtag(...)` — declaração de tipo apenas (adicionada na
  v3.5.3; zero runtime).
- **Linhas 67–75:** dispara com o rótulo `0K0dCMm6oo4bELjckew9`, que **não existe em nenhuma
  tag do container** (§1). Mesmo que `gtag` esteja definido, o Ads não tem ação correspondente.
- **Quem realmente registra a conversão do funil legado:** a tag de GTM
  **"Enviar formulário - Fazer pré-diagnóstico"** (rótulo `U6ARCKGBxegbELjckew9`), com gatilho
  próprio de envio de formulário — independente deste código.
- **Consequência prática:** o padrão deste arquivo **não deve ser copiado**. Foi o que a
  ISSUE-106 fez para o radar de Oportunidades, e o resultado foi zero conversão.

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
3. ~~**Conversão no funil novo (radares) — DECIDIDO PELO DONO (2026-07-05):** o front dos
   radares replica o padrão do EmailGate…~~ **REVOGADO em 2026-08-06.** A decisão era válida
   sob a premissa (falsa) de que o padrão do EmailGate funcionava. Como não funciona, replicá-lo
   produziu zero conversão no radar por um mês. **Regra nova:** conversão de Google Ads é
   configurada **como tag no GTM**, disparada por evento personalizado do `dataLayer` que o
   código já emite (`result_full_requested` para o radar de Oportunidades). O código faz
   `dataLayer.push` e nada mais — igual à regra 5. Ver §6.
4. **Funil legado intocável:** `EmailGate.tsx`, `api/prediag/lead/route.ts` e
   `email-template.ts` não são alterados por nenhuma issue do revamp (exceção: nada prevista).
5. **Config fora do código:** tags/acionadores dentro do container GTM e campanhas/labels no
   Google Ads são geridos pelo dono na interface das plataformas. Quando uma issue precisar de
   tag nova (ex.: GA4 para os 15 eventos novos), ela entrega uma ESPECIFICAÇÃO de tag/trigger
   para o dono aplicar no GTM — o código só faz `dataLayer.push`.

## 4. Checklist de validação (obrigatório em todo PR que tocar layout ou funil)

- [ ] Diff do PR mostra os 2 blocos GTM byte-idênticos (ou intocados).
- [ ] GTM Preview / Tag Assistant no deploy de preview: container `GTM-PDJ2K5BX` carrega.
- [ ] As 3 tags de conversão do §1 continuam **presentes e inalteradas** no container.
- [ ] Se a issue adicionou evento novo que deve converter: existe tag no GTM apontando pra ele.

> ❌ **Critérios removidos em 2026-08-06** (eram inverificáveis porque partiam da premissa
> falsa): "o fluxo legado dispara a conversão `0K0dCMm6oo4bELjckew9` visível no Tag Assistant"
> e "`console.log('Google Ads conversion triggered')` aparece no console". Esse `console.log`
> pode aparecer sem que conversão nenhuma seja registrada — ele prova só que a linha executou.

## 5. Histórico de verificação

| Data | O que foi verificado | Resultado |
|---|---|---|
| 2026-07-05 | Inventário completo via grep em `src/` e `public/` (padrões: gtag, dataLayer, GTM-, AW-, googletagmanager, conversion) | 4 pontos encontrados (§2.1–2.4); nenhum em `public/` |
| 2026-08-06 | Auditoria do dump do Tag Assistant (sessão real no radar de Oportunidades) + `SELECT` de UTM em `radar_events` | **2 falhas reais** — ver §6 |

## 6. Estado real medido em 2026-08-06 (auditoria do dump)

**Fonte:** `docs/Google Ads and Tags/tag_assistant_conversas_no_corredor_vercel_app_2026_08_06.json`
— sessão completa do dono no `/radar/oportunidades`, 19 eventos de `dataLayer`, 2 containers.

**O que está SAUDÁVEL:**
- Container `GTM-PDJ2K5BX` carrega; "Tag do Google" e "Vinculador de conversões" disparam.
- A tag **"GA4 Event - Eventos dos radares"** dispara **8x**, mandando todos os eventos do radar
  para `G-0HX5BX2XL7`. A analytics do funil novo funciona.
- As 3 tags de conversão legadas estão presentes e íntegras.

**Falha 1 — nenhuma conversão do radar chegava ao Google Ads.** ✅ **corrigida em 2026-08-06**
Não existia evento `conversion` em nenhum dos 19 (nos dois containers), e nenhuma das 3 tags de
conversão disparou na sessão — os gatilhos delas são elementos do funil legado, que não existem
na home nova nem no radar. Como o anúncio aponta para `/` e a home só tem CTA para os radares
(`HeroCtas`, `PortasSection`, `FechamentoSection` — zero links para `/pre-diagnostico`), **todo
o tráfego pago caía num funil sem sinal de conversão de volta**, por ~1 mês (desde 08/07).
→ Corrigido com a ação + tag "Radar Oportunidades" (§1), validada no Tag Assistant no mesmo dia.
O bloco `gtag()` morto do `OportunidadesResultado.tsx` foi removido **depois** da validação.

**Falha 2 — a UTM do anúncio se perdia na primeira navegação.** (corrigida no mesmo dia)
A URL final do anúncio é `/?utm_source=google&utm_medium=cpc&utm_campaign=analistas`, mas
`capturarUtm()` só rodava no `RadarFlow`, que monta em `/radar/*` — quando a query string já
não existe mais. Medição: **273 sessões / 863 eventos entre 08/07 e 06/08, 100% `(sem utm)`**.
Corrigido com `src/components/analytics/CapturaUtm.tsx` montado no layout de `(publico)`, que
cobre toda entrada pública.

**Pendente (operação do dono, fora do código):** criar a ação de conversão do radar no Google
Ads e a tag correspondente no GTM, com gatilho de evento personalizado em
`result_full_requested` — evento exclusivo do radar de Oportunidades (o de Maturidade não o
emite, o que mantém a escada de captura da §3 do doc 10).
