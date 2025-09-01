\# 📊 Views Analytics - Supabase Dashboard



\## 📋 Visão Geral



Sistema de \*\*7 views analíticas\*\* criadas no Supabase para dashboard automático do projeto ROI do Foco. Este documento serve como guia para criação, uso e expansão do sistema de analytics.



\### \*\*🎯 Objetivo\*\*

Transformar os dados brutos das tabelas (`roi\_prediag\_sessions`, `roi\_leads`, `roi\_events`) em insights visuais e métricas estratégicas para tomada de decisão.



\### \*\*📊 Estrutura de Dados Base\*\*

```sql

-- Tabelas utilizadas:

├── roi\_prediag\_sessions  # Sessões completas do diagnóstico

├── roi\_leads            # Emails capturados + segmentação

└── roi\_events           # Eventos de tracking (ts, event\_name, payload)

```



\## 🔒 Segurança das Views



\### \*\*⚠️ Correção Crítica Aplicada\*\*

As views foram inicialmente criadas com \*\*SECURITY DEFINER\*\* (detectado pelo Security Advisor do Supabase), o que representava um risco de segurança. Correção aplicada:



```sql

-- ❌ PROBLEMA: Views com SECURITY DEFINER

-- Executavam com permissões do criador, não do usuário



-- ✅ SOLUÇÃO: Views recriadas SEM security definer

CREATE VIEW vw\_kpis\_executivos AS  -- sem SECURITY DEFINER

SELECT ...



-- Permissões configuradas adequadamente

GRANT SELECT ON vw\_kpis\_executivos TO anon;

GRANT SELECT ON vw\_kpis\_executivos TO authenticated;

```



\### \*\*✅ Status de Segurança Atual\*\*

Todas as 7 views passaram na validação do Security Advisor:

\- ✅ `vw\_conversao\_diaria` - SEGURO (SEM SECURITY DEFINER)

\- ✅ `vw\_perfil\_performance` - SEGURO (SEM SECURITY DEFINER)  

\- ✅ `vw\_pain\_analysis` - SEGURO (SEM SECURITY DEFINER)

\- ✅ `vw\_events\_funnel` - SEGURO (SEM SECURITY DEFINER)

\- ✅ `vw\_activity\_heatmap` - SEGURO (SEM SECURITY DEFINER)

\- ✅ `vw\_kpis\_executivos` - SEGURO (SEM SECURITY DEFINER)

\- ✅ `vw\_mix\_atividades` - SEGURO (SEM SECURITY DEFINER)



---



\## 🔧 Views Criadas (7 Total)



\### \*\*1️⃣ vw\_conversao\_diaria\*\*

\*\*Propósito\*\*: Acompanhar evolução diária de conversões  

\*\*Uso\*\*: Gráficos de linha temporal, identificar tendências



```sql

CREATE OR REPLACE VIEW vw\_conversao\_diaria AS

SELECT 

&nbsp; DATE(s.created\_at) as data,

&nbsp; COUNT(s.id) as total\_sessoes,

&nbsp; COUNT(l.id) as total\_leads,

&nbsp; ROUND(COUNT(l.id) \* 100.0 / NULLIF(COUNT(s.id), 0), 2) as taxa\_conversao\_pct,

&nbsp; ROUND(AVG(s.duration\_seconds)) as tempo\_medio\_sessao

FROM roi\_prediag\_sessions s

LEFT JOIN roi\_leads l ON s.id = l.last\_session\_id

WHERE s.created\_at >= NOW() - INTERVAL '30 days'

GROUP BY DATE(s.created\_at)

ORDER BY data DESC;

```



\*\*📈 Casos de Uso:\*\*

\- Identificar dias com maior/menor conversão

\- Análise sazonal (fins de semana vs dias úteis)

\- Correlação entre tempo de sessão e conversão

\- A/B testing de campanhas por período



---



\### \*\*2️⃣ vw\_perfil\_performance\*\*

\*\*Propósito\*\*: Segmentação por perfil profissional  

\*\*Uso\*\*: Direcionamento de campanhas, persona analysis



```sql

CREATE OR REPLACE VIEW vw\_perfil\_performance AS

SELECT 

&nbsp; COALESCE(profile, 'Não informado') as perfil,

&nbsp; COUNT(\*) as total\_sessoes,

&nbsp; COUNT(l.email) as total\_leads,

&nbsp; ROUND(COUNT(l.email) \* 100.0 / NULLIF(COUNT(\*), 0), 2) as taxa\_conversao\_pct,

&nbsp; ROUND(AVG(duration\_seconds)) as tempo\_medio\_sessao,

&nbsp; ROUND(AVG(mix\_distracao)) as media\_distracao\_pct,

&nbsp; ROUND(AVG(mix\_essencial)) as media\_essencial\_pct,

&nbsp; ROUND(AVG(mix\_estrategico)) as media\_estrategico\_pct,

&nbsp; ROUND(AVG(mix\_tatico)) as media\_tatico\_pct

FROM roi\_prediag\_sessions s

LEFT JOIN roi\_leads l ON s.id = l.last\_session\_id

WHERE s.created\_at >= NOW() - INTERVAL '30 days'

GROUP BY profile

ORDER BY total\_sessoes DESC;

```



\*\*🎯 Insights Estratégicos:\*\*

\- Qual perfil converte melhor (foco de ads)

\- Perfis com maior nível de distração (oportunidades)

\- Tempo médio por perfil (otimização UX)

\- Mix de atividades por persona



---



\### \*\*3️⃣ vw\_pain\_analysis\*\*

\*\*Propósito\*\*: Análise por dores/pain points dos usuários  

\*\*Uso\*\*: Content marketing, segmentação avançada



```sql

CREATE OR REPLACE VIEW vw\_pain\_analysis AS

SELECT 

&nbsp; COALESCE(pain, 'Não informado') as principal\_dor,

&nbsp; COUNT(\*) as total\_sessoes,

&nbsp; COUNT(l.email) as total\_leads,

&nbsp; ROUND(COUNT(l.email) \* 100.0 / NULLIF(COUNT(\*), 0), 2) as taxa\_conversao\_pct,

&nbsp; ROUND(AVG(mix\_distracao)) as nivel\_distracao\_medio,

&nbsp; ROUND(AVG(mix\_essencial)) as nivel\_essencial\_medio

FROM roi\_prediag\_sessions s

LEFT JOIN roi\_leads l ON s.id = l.last\_session\_id

WHERE s.created\_at >= NOW() - INTERVAL '30 days'

GROUP BY pain

ORDER BY taxa\_conversao\_pct DESC;

```



\*\*🔍 Aplicações:\*\*

\- Dores que mais convertem (criar conteúdo específico)

\- Correlação entre dor e nível de distração

\- Personalização de email marketing por pain point

\- Desenvolvimento de produtos/serviços direcionados



---



\### \*\*4️⃣ vw\_events\_funnel\*\*

\*\*Propósito\*\*: Funil de conversão por eventos  

\*\*Uso\*\*: Identificar gargalos no processo, otimização UX



```sql

CREATE OR REPLACE VIEW vw\_events\_funnel AS

SELECT 

&nbsp; event\_name as evento,

&nbsp; COUNT(\*) as total\_eventos,

&nbsp; COUNT(DISTINCT session\_id) as sessoes\_unicas,

&nbsp; ROUND(COUNT(\*) \* 100.0 / 

&nbsp;   (SELECT COUNT(\*) FROM roi\_events WHERE ts >= NOW() - INTERVAL '30 days'), 2) as percentual\_total

FROM roi\_events

WHERE ts >= NOW() - INTERVAL '30 days'

GROUP BY event\_name

ORDER BY total\_eventos DESC;

```



\*\*🚀 Otimizações Baseadas em Dados:\*\*

\- Taxa de abandono entre `prediag\_completed` e `email\_submitted`

\- Eventos que mais antecedem conversão

\- Identificação de friction points

\- A/B testing de CTAs e formulários



---



\### \*\*5️⃣ vw\_activity\_heatmap\*\*

\*\*Propósito\*\*: Heatmap temporal de atividade  

\*\*Uso\*\*: Otimização de horários de campaign, análise comportamental



```sql

CREATE OR REPLACE VIEW vw\_activity\_heatmap AS

SELECT 

&nbsp; EXTRACT(DOW FROM s.created\_at) as dia\_semana, -- 0=Domingo, 6=Sábado

&nbsp; EXTRACT(HOUR FROM s.created\_at) as hora,

&nbsp; COUNT(\*) as total\_sessoes,

&nbsp; COUNT(l.email) as leads\_gerados,

&nbsp; CASE EXTRACT(DOW FROM s.created\_at)

&nbsp;   WHEN 0 THEN 'Domingo' WHEN 1 THEN 'Segunda' WHEN 2 THEN 'Terça'

&nbsp;   WHEN 3 THEN 'Quarta' WHEN 4 THEN 'Quinta' WHEN 5 THEN 'Sexta'

&nbsp;   WHEN 6 THEN 'Sábado'

&nbsp; END as nome\_dia

FROM roi\_prediag\_sessions s

LEFT JOIN roi\_leads l ON s.id = l.last\_session\_id

WHERE s.created\_at >= NOW() - INTERVAL '14 days'

GROUP BY EXTRACT(DOW FROM s.created\_at), EXTRACT(HOUR FROM s.created\_at)

ORDER BY dia\_semana, hora;

```



\*\*⏰ Estratégias Baseadas em Tempo:\*\*

\- Melhores horários para email marketing

\- Dias da semana com maior conversão

\- Planejamento de campanhas pagas

\- Otimização de disponibilidade de suporte



---



\### \*\*6️⃣ vw\_kpis\_executivos\*\*

\*\*Propósito\*\*: Dashboard executivo com métricas principais  

\*\*Uso\*\*: Relatórios gerenciais, acompanhamento de performance geral



```sql

CREATE OR REPLACE VIEW vw\_kpis\_executivos AS

SELECT 

&nbsp; 'Últimos 30 dias' as periodo,

&nbsp; COUNT(DISTINCT s.id) as total\_sessoes,

&nbsp; COUNT(DISTINCT l.email) as total\_leads\_unicos,

&nbsp; ROUND(COUNT(DISTINCT l.email) \* 100.0 / NULLIF(COUNT(DISTINCT s.id), 0), 2) as conversao\_geral\_pct,

&nbsp; ROUND(AVG(s.duration\_seconds)) as tempo\_medio\_sessao\_seg,

&nbsp; COUNT(DISTINCT DATE(s.created\_at)) as dias\_com\_atividade,

&nbsp; ROUND(COUNT(DISTINCT s.id) \* 1.0 / NULLIF(COUNT(DISTINCT DATE(s.created\_at)), 0), 1) as sessoes\_por\_dia,

&nbsp; ROUND(AVG(s.mix\_essencial)) as mix\_essencial\_medio,

&nbsp; ROUND(AVG(s.mix\_distracao)) as mix\_distracao\_medio,

&nbsp; (SELECT COALESCE(profile, 'Não informado') FROM roi\_prediag\_sessions 

&nbsp;  WHERE created\_at >= NOW() - INTERVAL '30 days'

&nbsp;  GROUP BY profile ORDER BY COUNT(\*) DESC LIMIT 1) as perfil\_dominante,

&nbsp; (SELECT COALESCE(pain, 'Não informado') FROM roi\_prediag\_sessions 

&nbsp;  WHERE created\_at >= NOW() - INTERVAL '30 days'

&nbsp;  GROUP BY pain ORDER BY COUNT(\*) DESC LIMIT 1) as dor\_dominante

FROM roi\_prediag\_sessions s

LEFT JOIN roi\_leads l ON s.id = l.last\_session\_id

WHERE s.created\_at >= NOW() - INTERVAL '30 days';

```



\*\*📋 KPIs Monitorados:\*\*

\- Taxa de conversão geral

\- Volume de sessões e leads

\- Tempo médio de sessão

\- Mix de atividades médio

\- Perfil e dor dominantes

\- Frequência de atividade



---



\### \*\*7️⃣ vw\_mix\_atividades\*\*

\*\*Propósito\*\*: Análise detalhada do mix de atividades por perfil  

\*\*Uso\*\*: Insights sobre produtividade, validação da metodologia ROI



```sql

CREATE OR REPLACE VIEW vw\_mix\_atividades AS

SELECT 

&nbsp; COALESCE(profile, 'Não informado') as perfil,

&nbsp; COUNT(\*) as total\_sessoes,

&nbsp; ROUND(AVG(mix\_essencial)) as avg\_essencial,

&nbsp; ROUND(AVG(mix\_estrategico)) as avg\_estrategico,

&nbsp; ROUND(AVG(mix\_tatico)) as avg\_tatico,

&nbsp; ROUND(AVG(mix\_distracao)) as avg\_distracao,

&nbsp; CASE 

&nbsp;   WHEN AVG(mix\_essencial) >= AVG(mix\_estrategico) 

&nbsp;        AND AVG(mix\_essencial) >= AVG(mix\_tatico) 

&nbsp;        AND AVG(mix\_essencial) >= AVG(mix\_distracao) THEN 'Focado Essencial'

&nbsp;   WHEN AVG(mix\_estrategico) >= AVG(mix\_tatico) 

&nbsp;        AND AVG(mix\_estrategico) >= AVG(mix\_distracao) THEN 'Focado Estratégico'

&nbsp;   WHEN AVG(mix\_tatico) >= AVG(mix\_distracao) THEN 'Focado Tático'

&nbsp;   ELSE 'Alto Nível Distração'

&nbsp; END as classificacao\_foco

FROM roi\_prediag\_sessions

WHERE created\_at >= NOW() - INTERVAL '30 days'

GROUP BY profile

ORDER BY avg\_essencial DESC;

```



\*\*🎯 Validações de Negócio:\*\*

\- Eficácia da metodologia ROI do Foco

\- Perfis com maior necessidade do produto

\- Oportunidades de coaching/consultoria

\- Desenvolvimento de features específicas



---



\## 📊 Como Usar as Views



\### \*\*1. Consultas Diretas (SQL Editor)\*\*

```sql

-- Dashboard principal

SELECT \* FROM vw\_kpis\_executivos;



-- Performance por perfil

SELECT \* FROM vw\_perfil\_performance ORDER BY taxa\_conversao\_pct DESC;



-- Funil de conversão

SELECT \* FROM vw\_events\_funnel;

```



\### \*\*2. APIs Next.js\*\*

```typescript

// app/api/dashboard/kpis/route.ts

import { createClient } from '@supabase/supabase-js';



export async function GET() {

&nbsp; const supabase = createClient(process.env.SUPABASE\_URL!, process.env.SUPABASE\_ANON\_KEY!);

&nbsp; 

&nbsp; const { data, error } = await supabase

&nbsp;   .from('vw\_kpis\_executivos')

&nbsp;   .select('\*');

&nbsp;   

&nbsp; return Response.json({ data, error });

}

```



\### \*\*3. Dashboards Externos\*\*



\#### \*\*Grafana (Recomendado)\*\*

\- Connection: PostgreSQL direto no Supabase

\- Queries: Use as views como source

\- Templates: Dashboards pré-configurados



\#### \*\*Metabase/Superset\*\*

\- Setup: Docker ou cloud

\- Connection: Supabase PostgreSQL URL

\- Automation: Refresh automático



\#### \*\*Power BI/Tableau\*\*

\- Connector: PostgreSQL

\- Refresh: Scheduled updates

\- Sharing: Enterprise dashboards



---



\## 🔧 Manutenção e Evolução



\### \*\*Adicionando Novas Views\*\*



\#### \*\*Template Base\*\*

```sql

-- Padrão para novas views

CREATE OR REPLACE VIEW vw\_nova\_metrica AS

SELECT 

&nbsp; -- Dimensões (group by)

&nbsp; coluna\_agrupamento,

&nbsp; 

&nbsp; -- Métricas básicas

&nbsp; COUNT(\*) as total\_registros,

&nbsp; 

&nbsp; -- Métricas calculadas

&nbsp; ROUND(AVG(coluna\_numerica)) as media\_calculada,

&nbsp; 

&nbsp; -- Classificações

&nbsp; CASE 

&nbsp;   WHEN condicao THEN 'Categoria A'

&nbsp;   ELSE 'Categoria B'

&nbsp; END as classificacao

&nbsp; 

FROM tabela\_principal p

LEFT JOIN tabela\_relacionada r ON p.id = r.foreign\_key

WHERE p.created\_at >= NOW() - INTERVAL '30 days'

&nbsp; AND p.coluna\_filtro IS NOT NULL

GROUP BY coluna\_agrupamento

ORDER BY total\_registros DESC;

```



\#### \*\*Convenções de Nomenclatura\*\*

\- \*\*Prefixo\*\*: `vw\_` (view)

\- \*\*Categoria\*\*: `conversao\_`, `perfil\_`, `temporal\_`, `mix\_`

\- \*\*Sufixo\*\*: `\_diario`, `\_mensal`, `\_performance`, `\_analysis`



\#### \*\*Exemplos de Expansão\*\*

```sql

-- View para análise mensal

CREATE OR REPLACE VIEW vw\_conversao\_mensal AS ...



-- View para análise de retenção

CREATE OR REPLACE VIEW vw\_retencao\_cohort AS ...



-- View para ROI por canal

CREATE OR REPLACE VIEW vw\_roi\_por\_canal AS ...

```



\### \*\*Otimização de Performance\*\*



\#### \*\*Índices Necessários\*\*

```sql

-- Para queries temporais

CREATE INDEX CONCURRENTLY idx\_sessions\_created\_date 

ON roi\_prediag\_sessions (DATE(created\_at));



-- Para segmentação

CREATE INDEX CONCURRENTLY idx\_sessions\_profile\_pain

ON roi\_prediag\_sessions (profile, pain) 

WHERE created\_at >= NOW() - INTERVAL '90 days';



-- Para eventos

CREATE INDEX CONCURRENTLY idx\_events\_name\_ts

ON roi\_events (event\_name, ts);

```



\#### \*\*Materialização (Para Alto Volume)\*\*

```sql

-- Converter view em tabela materializada

CREATE MATERIALIZED VIEW mv\_kpis\_executivos AS

SELECT \* FROM vw\_kpis\_executivos;



-- Refresh programado

REFRESH MATERIALIZED VIEW mv\_kpis\_executivos;

```



\### \*\*Monitoramento de Views\*\*

```sql

-- Query para verificar performance das views

SELECT 

&nbsp; schemaname,

&nbsp; viewname,

&nbsp; definition

FROM pg\_views 

WHERE viewname LIKE 'vw\_%'

ORDER BY viewname;



-- Verificar uso das views (via pg\_stat\_statements)

SELECT 

&nbsp; query,

&nbsp; calls,

&nbsp; total\_time,

&nbsp; mean\_time

FROM pg\_stat\_statements 

WHERE query ILIKE '%vw\_%'

ORDER BY mean\_time DESC;

```



---



\## 📈 Métricas de Sucesso



\### \*\*KPIs Principais Monitorados\*\*

\- \*\*Taxa de Conversão Geral\*\*: Meta > 15%

\- \*\*Tempo Médio de Sessão\*\*: Meta < 5 minutos

\- \*\*Mix Essencial Médio\*\*: Meta > 40%

\- \*\*Mix Distração Médio\*\*: Meta < 15%

\- \*\*Sessões por Dia\*\*: Meta > 10/dia



\### \*\*Alertas Configuráveis\*\*

```sql

-- Alert: Conversão muito baixa

SELECT 'ALERT: Conversão baixa' as status

FROM vw\_kpis\_executivos 

WHERE conversao\_geral\_pct < 10;



-- Alert: Alto nível de distração

SELECT 'ALERT: Distração alta' as status

FROM vw\_kpis\_executivos 

WHERE mix\_distracao\_medio > 20;

```



---



\## 🔮 Roadmap Analytics



\### \*\*Fase 2: Analytics Avançados\*\*

\- \[ ] \*\*Cohort Analysis\*\*: Retenção por período de cadastro

\- \[ ] \*\*Funnel Analysis\*\*: Análise detalhada de abandono

\- \[ ] \*\*Attribution Modeling\*\*: ROI por canal de aquisição

\- \[ ] \*\*Predictive Analytics\*\*: ML para scoring de leads



\### \*\*Fase 3: Real-time Analytics\*\*

\- \[ ] \*\*Stream Processing\*\*: Métricas em tempo real

\- \[ ] \*\*Event-driven Architecture\*\*: Triggers automáticos

\- \[ ] \*\*Alert System\*\*: Notificações automáticas

\- \[ ] \*\*A/B Testing Framework\*\*: Testes automatizados



\### \*\*Fase 4: Business Intelligence\*\*

\- \[ ] \*\*Executive Reporting\*\*: Relatórios automáticos

\- \[ ] \*\*Competitive Analysis\*\*: Benchmarking de mercado

\- \[ ] \*\*Revenue Analytics\*\*: LTV, CAC, ROI financeiro

\- \[ ] \*\*Product Analytics\*\*: Feature usage, engagement



---



\## 📚 Recursos e Referências



\### \*\*Documentação Técnica\*\*

\- \[Supabase Views Documentation](https://supabase.com/docs/guides/database/views)

\- \[PostgreSQL Views Best Practices](https://www.postgresql.org/docs/current/sql-createview.html)

\- \[SQL Analytics Patterns](https://mode.com/sql-tutorial/)



\### \*\*Ferramentas de Visualização\*\*

\- \[Grafana + PostgreSQL](https://grafana.com/docs/grafana/latest/datasources/postgres/)

\- \[Metabase Open Source](https://www.metabase.com/)

\- \[Apache Superset](https://superset.apache.org/)



\### \*\*Arquivos Relacionados\*\*

```

docs/

├── tabelas-supabase.md         # Schema das tabelas base

├── api-prediagnostico.md       # APIs que alimentam os dados

├── views-analytics-supabase.md # Este documento

└── dashboard-configuracao.md   # Setup de dashboards externos

```



---



\## ✅ Checklist de Implementação



\### \*\*Setup Inicial\*\*

\- \[x] Tabelas base criadas (roi\_prediag\_sessions, roi\_leads, roi\_events)

\- \[x] Views analíticas implementadas (7 views)

\- \[x] \*\*Correção de segurança aplicada\*\* (views sem SECURITY DEFINER)

\- \[x] Permissões adequadas configuradas (anon + authenticated)

\- \[x] Testes de performance executados

\- \[x] Validação de segurança aprovada (Security Advisor)



\### \*\*Próximos Passos\*\*

\- \[ ] Dashboard visual configurado (Grafana/React)

\- \[ ] APIs de consulta implementadas

\- \[ ] Monitoramento de performance ativo

\- \[ ] Sistema de alertas configurado

\- \[ ] Backups automáticos das views

\- \[ ] Treinamento da equipe no uso das views

\- \[ ] \*\*Monitoramento contínuo de segurança\*\* (Security Advisor mensalmente)



---



\*\*📊 Sistema Analytics ROI do Foco - Views Supabase\*\*  

\*\*🔄 Última atualização:\*\* Agosto 2025 (Correção de Segurança Aplicada)  

\*\*👥 Responsável:\*\* Equipe de Desenvolvimento  

\*\*🔒 Status Segurança:\*\* ✅ Aprovado (Security Advisor)  

\*\*📧 Contato:\*\* Para dúvidas técnicas, consulte a documentação ou abra issue no repositório

