# ISSUE-109 — Eventos de analytics do funil novo (radares)

> **Como usar:** este documento é a especificação que você (dono) usa para criar as
> tags/triggers de GA4 dentro do container GTM (`GTM-PDJ2K5BX`). O código só faz
> `window.dataLayer.push({ event: '<nome>', ...propriedades })` — a tag em si é criada na UI
> do GTM (fora do código, por decisão registrada em `07_mapa_tracking_ads.md` §3.5).
> A conversão do Google Ads (`AW-16601345592/...`) **não muda** — continua disparando só no
> `EmailGate` (funil legado) e no lead de `oportunidades` dos radares (ISSUE-103), como já
> documentado. Este arquivo cobre os eventos **informativos** (GA4/Grafana), não a conversão.

## 1. Duplo trilho (como funciona)

`src/lib/analytics.ts` exporta `track(event, props)`, chamado pelos componentes do radar.
Cada chamada dispara dois destinos, na ordem:

1. `window.dataLayer.push({ event, ...props })` — GTM captura e você cria a tag GA4 no painel.
2. `POST /api/radar/event` (via `navigator.sendBeacon`, com fallback `fetch(keepalive: true)`)
   — grava uma linha em `radar_events` (schema criado na ISSUE-106; `session_id`, `event_name`,
   `page_url`, `payload` JSONB, `ip_address`, `user_agent`, `created_at`).

Nunca bloqueia navegação: falha de rede em qualquer um dos dois trilhos é engolida
silenciosamente. A rota da API também responde `200` mesmo em erro interno ou rate limit —
analytics não pode virar mensagem de erro pro usuário.

## 2. Os 15 eventos (nomes literais do doc operacional §21)

| # | Evento | Onde dispara HOJE | Status |
|---|---|---|---|
| 1 | `hero_cta_opportunities_clicked` | Hero da home, CTA primário → `/radar/oportunidades` | ⚠️ **não instrumentado** — a home nova ainda não existe (ISSUE-107) |
| 2 | `hero_cta_maturity_clicked` | Hero da home, CTA secundário → `/radar/maturidade` | ⚠️ **não instrumentado** — idem |
| 3 | `newsletter_cta_clicked` | Botão "Assinar newsletter" no diagnóstico completo de oportunidades (`OportunidadesResultado`) | ✅ instrumentado |
| 4 | `maturity_assessment_started` | `RadarFlow` monta em `/radar/maturidade` (sessão criada) | ✅ instrumentado |
| 5 | `maturity_assessment_completed` | Última pergunta do radar de maturidade respondida | ✅ instrumentado |
| 6 | `opportunity_radar_started` | `RadarFlow` monta em `/radar/oportunidades` | ✅ instrumentado |
| 7 | `opportunity_radar_completed` | Última pergunta do radar de oportunidades respondida | ✅ instrumentado |
| 8 | `email_capture_viewed` | Formulário de e-mail (`EmailCaptureRadar`) aparece na tela | ✅ instrumentado |
| 9 | `email_submitted` | Envio de e-mail bem-sucedido (honeypot filtrado — bot não conta) | ✅ instrumentado |
| 10 | `result_preview_viewed` | Resultado calculado e mostrado (maturidade = completo; oportunidades = teaser) | ✅ instrumentado |
| 11 | `result_full_requested` | Diagnóstico completo de oportunidades revelado após o e-mail | ✅ instrumentado |
| 12 | `recommended_article_clicked` | Clique em qualquer link de leitura (maturidade, oportunidades, bloco de diligência) | ✅ instrumentado |
| 13 | `premium_interest_clicked` | Checkbox "Quero entrar na lista do Lab" marcado | ✅ instrumentado |
| 14 | `premium_waitlist_submitted` | E-mail enviado com o checkbox do Lab marcado | ✅ instrumentado |
| 15 | `thank_you_page_viewed` | Página `/obrigado` carrega | ⚠️ **não instrumentado** — a página ainda não existe (ISSUE-108) |

**Pendência explícita:** os 3 eventos marcados ⚠️ dependem de páginas que ainda não foram
construídas (home = ISSUE-107, `/obrigado` = ISSUE-108). O helper `track()` já está pronto —
quando essas issues rodarem, instrumentar é uma chamada de uma linha em cada CTA/mount, seguindo
o mesmo padrão dos 12 eventos já implementados (ver exemplos no código de `src/components/radar/*`).

## 3. Propriedades por evento (o que popula `payload`)

Todo evento inclui automaticamente (via `track()`, sem precisar passar manualmente):
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` — capturados da URL no
  primeiro pageview (`capturarUtm()`) e persistidos em `sessionStorage['conversaas.utm']`
  durante a sessão do navegador.
- `entry_path` — `window.location.pathname` no momento do disparo.

Propriedades específicas passadas por evento:

| Evento | Propriedades extras |
|---|---|
| `maturity_assessment_started` / `opportunity_radar_started` | `assessment_type` |
| `maturity_assessment_completed` | `assessment_type`, `maturity_level` |
| `opportunity_radar_completed` | `assessment_type`, `recommended_solution_type`, `area` |
| `result_preview_viewed` | `assessment_type` |
| `result_full_requested` | `assessment_type`, `recommended_solution_type`, `area` |
| `email_capture_viewed` / `email_submitted` | `assessment_type`, `premium_interest` (só no `email_submitted`) |
| `premium_interest_clicked` / `premium_waitlist_submitted` | `assessment_type` |
| `recommended_article_clicked` | `assessment_type`, `recommended_solution_type` (quando aplicável), `article_url` |
| `newsletter_cta_clicked` | `assessment_type`, `recommended_solution_type` |

`session_id` (o UUID de `radar_sessions`) viaja em todo evento como propriedade reservada —
usado **só** no trilho Supabase (a rota extrai e grava na coluna `session_id` de
`radar_events`); não é enviado ao `dataLayer`/GA4 por não ser uma dimensão útil lá.

## 4. Especificação de tags GA4 para você criar no GTM

Para cada evento acima marcado ✅ (e os ⚠️ quando forem instrumentados): criar uma tag "Evento
GA4" no GTM com:
- **Nome do evento:** o nome literal da tabela (ex.: `email_submitted`) — não renomear.
- **Acionador:** evento personalizado com o mesmo nome (`Custom Event` = nome do evento).
- **Parâmetros do evento:** mapear as propriedades da tabela §3 acima como parâmetros do evento
  (ex.: `{{DLV - assessment_type}}` → variável de camada de dados lendo `assessment_type`).
- UTMs (`utm_source` etc.) e `entry_path` já vêm em todo evento — só criar as variáveis de
  camada de dados uma vez e reusar em todas as tags.

## 5. Consultar os eventos no Supabase

```sql
select event_name, payload, page_url, created_at
from radar_events
order by created_at desc
limit 50;
```

Views `vw_*` para Grafana (agregações por evento/funil) ficam para o fim da fase, com SQL
entregue separadamente ao dono — fora do escopo desta issue (`02_technical_spec.md` §3.7).
