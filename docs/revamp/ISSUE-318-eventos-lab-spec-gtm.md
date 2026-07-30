# ISSUE-318 — Eventos `lab_*` + especificação de tags GTM

> **Como usar:** este documento é a especificação que você (dono) usa para criar as
> tags/triggers de GA4 dentro do container GTM (`GTM-PDJ2K5BX`) — mesmo formato e mesmo
> processo da ISSUE-109 (`ISSUE-109-eventos-analytics.md`). O código só faz
> `window.dataLayer.push({ event: '<nome>', ...propriedades })`; a tag é criada na UI do GTM
> (decisão registrada em `07_mapa_tracking_ads.md` §3.5).
> A conversão do Google Ads (`AW-16601345592/...`) **não muda em nada** — o Lab é área logada,
> não dispara conversão de lead; os eventos abaixo são informativos (GA4/Grafana).

## 1. Como funciona (mesmo duplo trilho da ISSUE-109)

Os eventos `lab_*` usam o MESMO helper `track()` de `src/lib/analytics.ts` e o MESMO pipeline:

1. `window.dataLayer.push({ event, ...props })` — GTM captura, você cria a tag GA4 no painel.
2. `POST /api/radar/event` → grava em `radar_events` (tabela existente — decisão de reusar o
   pipeline, doc 13 §5; zero SQL novo para analytics).

Diferenças em relação aos eventos do radar:

- **`session_id` nunca viaja** nos eventos do Lab — a coluna `session_id` de `radar_events`
  tem FK para `radar_sessions` (funil público); o identificador do Lab é o **`project_id`**,
  que viaja como propriedade comum do `payload`.
- Nomes canônicos em `src/lib/lab-events.ts` (o vocabulário fechado que a rota valida — nome
  fora da lista leva 400, mesmo mecanismo anti-"evento quase igual" da 109).
- Nenhum dado pessoal no payload: `project_id` é UUID pseudônimo, `solution_type`/`fase_id`
  são ids de vocabulário fechado.

## 2. Os 10 eventos (7 do plano doc 13 §8 + 3 da jornada que nasceu depois)

| # | Evento | Onde dispara | Propriedades extras |
|---|---|---|---|
| 1 | `lab_project_started` | `WizardNovoProjeto` monta em `/lab/novo-projeto` | `retomada` (bool — rascunho reaberto?) |
| 2 | `lab_wizard_completed` | PATCH `finalizar` respondeu ok (projeto criado com diagnóstico) | `project_id`, `porta` (ideia/dor/exploracao) |
| 3 | `lab_plan_generated` | **Métrica norte da Fase 1A** — mesmo momento do nº 2 (o motor gera diagnóstico + plano juntos, no servidor) | `project_id` |
| 4 | `lab_diagnosis_viewed` | `/lab/projeto/[id]` abre com o diagnóstico visível | `project_id`, `solution_type`, `primeira_visita` (bool) |
| 5 | `lab_step_completed` | Fase da Caminhada fechada E persistida (desmarcar/reabrir não conta) | `project_id`, `fase_id` |
| 6 | `lab_asset_opened` | Guia de construção aberto em `/lab/biblioteca/[slug]` | `slug` |
| 7 | `lab_profile_completed` | Perfil salvo com sucesso em `/lab/perfil` (edição também conta) | `tem_area`, `tem_fluencia` (bools) |
| 8 | `lab_project_concluded` | Conclusão REAL do projeto (botão cerimonial, tudo marcado) — o gate anti-Goodhart que abre ramo de valor | `project_id`, `solution_type`, `com_checkup` (bool) |
| 9 | `lab_result_submitted` | Check-up de resultado respondido na conclusão (ISSUE-314D) | `project_id`, `chegou` |
| 10 | `lab_branch_opened` | Ramo de Valor & Carreira (`valor-<tipo>`) ou marco de trajetória aberto | `slug`, `solution_type` (ramo) |

Todo evento inclui automaticamente `entry_path` (e UTMs se houver — irrelevantes na área
logada, mas o helper é o mesmo).

**Funil-resumo pra leitura executiva:**
`lab_project_started` → `lab_wizard_completed`/`lab_plan_generated` (métrica norte) →
`lab_step_completed` (engajamento) → `lab_project_concluded` (o prêmio real) →
`lab_branch_opened` (colheita de valor).

## 3. Configuração no GTM: **1 trigger novo, ZERO tag nova** (padrão da casa)

Na sessão de configuração manual do gate da ISSUE-112 (registrada no CURRENT-STATUS), o
container ficou com **uma tag genérica** pra todos os eventos do funil:
`GA4 Event - Eventos dos radares` (tipo GA4 Event, ID `G-0HX5BX2XL7`), disparada pelo trigger
`CE - Eventos dos radares` (Custom Event com regex casando os 19 nomes canônicos). Não se cria
tag por evento neste projeto.

Pro Lab, o caminho é o mesmo, em 2 passos no painel:

1. **Criar 1 trigger novo:** `CE - Eventos do Lab` — tipo *Evento personalizado*, marcar
   "Usar correspondência de regex", com o vocabulário fechado (mesma disciplina da regex dos
   radares — não usar `lab_.*` aberto, pra nome errado nunca virar evento no GA4):

   ```
   ^lab_(project_started|wizard_completed|plan_generated|diagnosis_viewed|step_completed|asset_opened|profile_completed|project_concluded|result_submitted|branch_opened)$
   ```

2. **Anexar o trigger novo à tag existente** `GA4 Event - Eventos dos radares` (a tag passa a
   ter 2 acionadores). Se preferir manter os nomes organizados, dá pra renomear a tag pra
   `GA4 Event - Eventos radares + Lab` — só o nome de exibição, nada muda no disparo.

**Parâmetros (opcional, dá pra deixar pra depois):** os nomes dos eventos chegam ao GA4 sem
configurar mais nada. As propriedades (`project_id`, `solution_type` etc.) só viram parâmetro
no GA4 se forem mapeadas como variáveis de camada de dados na tag — e o trilho Supabase já
grava o payload completo em `radar_events`, então nada se perde se você não mapear agora.

**Validação (GTM Preview / Tag Assistant):** logado no Lab, rodar wizard → plano → marcar uma
fase → abrir um guia → salvar perfil, e conferir cada evento aparecendo no debugger com a tag
disparando. O critério de aceite da issue é "eventos disparam no GTM Preview".

## 4. Consultar no Supabase

```sql
-- Últimos eventos do Lab
select event_name, payload, created_at
from radar_events
where event_name like 'lab_%'
order by created_at desc
limit 50;

-- Métrica norte: projetos que chegaram a plano, por dia
select date_trunc('day', created_at) as dia, count(*) as projetos_com_plano
from radar_events
where event_name = 'lab_plan_generated'
group by 1
order by 1 desc;
```

> Nota de conferência: a métrica norte também pode ser lida direto de `lab_projects`
> (`status in ('em_construcao','concluido')` = chegou a plano) — os dois números devem andar
> juntos; se divergirem muito, é sinal de evento perdido (ad-blocker etc.). A tabela é a fonte
> da verdade; o evento é o funil.

Views `vw_lab_*` para Grafana ficam para depois do beta ter dados reais (mesma decisão da 109
de não criar view antes de existir volume).
