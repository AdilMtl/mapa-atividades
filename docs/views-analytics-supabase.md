# 📊 Views Analytics - Supabase Dashboard

## 📋 Visão Geral

Sistema de **7 views analíticas** criadas no Supabase para dashboard automático do projeto ROI do Foco. Este documento serve como guia para criação, uso e expansão do sistema de analytics.

### **🎯 Objetivo**
Transformar os dados brutos das tabelas (`roi_prediag_sessions`, `roi_leads`, `roi_events`) em insights visuais e métricas estratégicas para tomada de decisão.

### **📊 Estrutura de Dados Base**
```sql
-- Tabelas utilizadas:
├── roi_prediag_sessions  # Sessões completas do diagnóstico
├── roi_leads            # Emails capturados + segmentação
└── roi_events           # Eventos de tracking (ts, event_name, payload)
```

---

## 🔒 Segurança das Views

### **✅ Configuração Atual (v3.4.2 - Outubro 2025)**

Todas as views estão configuradas com `security_invoker = true`, o que significa que executam com as **permissões do usuário que consulta**, não do criador da view.
```sql
-- Exemplo de criação correta de view
CREATE VIEW public.vw_conversao_diaria 
WITH (security_invoker = true) AS  -- ← Flag crítica!
SELECT ...
Status de Segurança:

✅ vw_conversao_diaria - SEGURO (security_invoker = true)
✅ vw_perfil_performance - SEGURO (security_invoker = true)
✅ vw_pain_analysis - SEGURO (security_invoker = true)
✅ vw_events_funnel - SEGURO (security_invoker = true)
✅ vw_activity_heatmap - SEGURO (security_invoker = true)
✅ vw_kpis_executivos - SEGURO (security_invoker = true)
✅ vw_mix_atividades - SEGURO (security_invoker = true)


📚 Histórico de Correções de Segurança
v3.4.2 (13/10/2025) - Correção Definitiva
Problema: Views persistindo com SECURITY DEFINER mesmo após múltiplas correções
Causa Raiz: Views criadas com owner 'postgres' (superuser) executam automaticamente como SECURITY DEFINER no PostgreSQL, independente de como são declaradas.
Solução Final:
sql-- Recriar views com flag explícita
DROP VIEW IF EXISTS public.vw_conversao_diaria CASCADE;
CREATE VIEW public.vw_conversao_diaria 
WITH (security_invoker = true) AS  -- ← Força execução como usuário consultando
SELECT ...
v3.4.1 (02/10/2025) - Tentativa com CREATE OR REPLACE

❌ Falhou: CREATE OR REPLACE VIEW manteve atributo SECURITY DEFINER da view original
Lição: REPLACE preserva atributos de segurança existentes

Setembro 2025 - Primeira Correção

❌ Falhou: Tentativa de ALTER VIEW ... OWNER TO authenticator bloqueada por permissões
❌ Falhou: DROP + CREATE simples sem security_invoker

Agosto 2025 - Criação Original

Views criadas sem especificar security, herdaram SECURITY DEFINER do owner postgres
Security Advisor detectou vulnerabilidade


🛡️ Best Practices para Views
1. Sempre usar security_invoker = true
sql-- ✅ CORRETO - Para views de analytics/dashboards
CREATE VIEW public.vw_sua_view 
WITH (security_invoker = true) AS
SELECT ...

-- ❌ EVITAR - Executa como criador da view
CREATE VIEW public.vw_sua_view AS
SELECT ...
2. Verificar configuração após criar
sql-- Query para verificar security_invoker
SELECT 
    c.relname AS view_name,
    CASE 
        WHEN 'security_invoker=true' = ANY(c.reloptions) 
        THEN '✅ SECURITY INVOKER'
        ELSE '⚠️ SECURITY DEFINER ou não configurado'
    END as security_status
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'v'
AND n.nspname = 'public'
AND c.relname = 'vw_sua_view';
3. Conceder permissões adequadas
sql-- Após criar a view, conceder acesso
GRANT SELECT ON public.vw_sua_view TO anon, authenticated;
-- Ou apenas para service_role (admin only)
GRANT SELECT ON public.vw_sua_view TO service_role;

🔍 Quando Usar SECURITY DEFINER vs SECURITY INVOKER
CenárioUsarMotivoAnalytics/Dashboards públicossecurity_invoker = trueUsuários devem ver apenas seus dados via RLSViews administrativassecurity_invoker = true + permissão apenas para service_roleAdmin acessa via API protegidaAgregações complexassecurity_invoker = trueMantém RLS das tabelas baseViews com lógica sensívelRaramente SECURITY DEFINERApenas se absolutamente necessário
Regra geral: Para este projeto, SEMPRE use security_invoker = true.

⚠️ Troubleshooting
Problema: Security Advisor ainda mostra warnings
sql-- 1. Verificar owner da view
SELECT viewname, viewowner 
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname = 'vw_sua_view';

-- Se owner = 'postgres', a view terá SECURITY DEFINER implícito
-- Solução: Recriar com security_invoker = true

-- 2. Verificar flag security_invoker
SELECT c.relname, c.reloptions
FROM pg_class c
WHERE c.relname = 'vw_sua_view';

-- Se reloptions não contém 'security_invoker=true', recriar
Problema: CREATE OR REPLACE não remove SECURITY DEFINER
Solução: Usar DROP + CREATE ao invés de REPLACE:
sqlDROP VIEW IF EXISTS public.vw_sua_view CASCADE;
CREATE VIEW public.vw_sua_view 
WITH (security_invoker = true) AS
SELECT ...


---

## 🔄 Atualização: Série Histórica Completa (Outubro 2025)

### **⚡ Mudança Importante**
**ANTES (Agosto 2025):** Views limitadas aos últimos 30 dias via `WHERE created_at >= NOW() - INTERVAL '30 days'`  
**AGORA (Outubro 2025):** Views mostram **série histórica completa** desde o início do projeto

### **📊 Impacto**
- ✅ Todas as 7 views agora retornam dados desde **28/08/2025** (primeira sessão)
- ✅ Permite análise de tendências de longo prazo
- ✅ Facilita comparação entre períodos diferentes
- ✅ Dashboards Grafana automaticamente exibem série completa

### **🎯 Views Afetadas**
Todas as 7 views foram atualizadas para remover filtros temporais:
1. `vw_conversao_diaria` - removido filtro de 30 dias
2. `vw_perfil_performance` - removido filtro de 30 dias
3. `vw_pain_analysis` - removido filtro de 30 dias
4. `vw_events_funnel` - removido filtro de 30 dias
5. `vw_activity_heatmap` - removido filtro de 14 dias
6. `vw_kpis_executivos` - removido filtro de 30 dias, período alterado para "Série Histórica Completa"
7. `vw_mix_atividades` - removido filtro de 30 dias

### **💡 Recomendação de Uso**
- **Grafana:** Use o Time Range do dashboard (ex: "Last 90 days") para controlar período visualizado
- **SQL Direto:** Adicione `WHERE data >= '2025-09-01'` nas queries quando necessário limitar período
- **APIs:** Implemente filtros de data como parâmetros opcionais

---

## 🔧 Views Criadas (7 Total)

### **1️⃣ vw_conversao_diaria**
**Propósito:** Acompanhar evolução diária de conversões  
**Uso:** Gráficos de linha temporal, identificar tendências

```sql
CREATE OR REPLACE VIEW vw_conversao_diaria AS
SELECT 
  DATE(s.created_at) as data,
  COUNT(s.id) as total_sessoes,
  COUNT(l.id) as total_leads,
  ROUND(COUNT(l.id) * 100.0 / NULLIF(COUNT(s.id), 0), 2) as taxa_conversao_pct,
  ROUND(AVG(s.duration_seconds)) as tempo_medio_sessao
FROM roi_prediag_sessions s
LEFT JOIN roi_leads l ON s.id = l.last_session_id
-- NOTA: Filtro temporal removido - mostra série histórica completa
GROUP BY DATE(s.created_at)
ORDER BY data DESC;
```

**📈 Casos de Uso:**
- Identificar dias com maior/menor conversão
- Análise sazonal (fins de semana vs dias úteis)
- Correlação entre tempo de sessão e conversão
- A/B testing de campanhas por período

---

### **2️⃣ vw_perfil_performance**
**Propósito:** Segmentação por perfil profissional  
**Uso:** Direcionamento de campanhas, persona analysis

```sql
CREATE OR REPLACE VIEW vw_perfil_performance AS
SELECT 
  COALESCE(profile, 'Não informado') as perfil,
  COUNT(*) as total_sessoes,
  COUNT(l.email) as total_leads,
  ROUND(COUNT(l.email) * 100.0 / NULLIF(COUNT(*), 0), 2) as taxa_conversao_pct,
  ROUND(AVG(duration_seconds)) as tempo_medio_sessao,
  ROUND(AVG(mix_distracao)) as media_distracao_pct,
  ROUND(AVG(mix_essencial)) as media_essencial_pct,
  ROUND(AVG(mix_estrategico)) as media_estrategico_pct,
  ROUND(AVG(mix_tatico)) as media_tatico_pct
FROM roi_prediag_sessions s
LEFT JOIN roi_leads l ON s.id = l.last_session_id
-- NOTA: Filtro temporal removido - mostra série histórica completa
GROUP BY profile
ORDER BY total_sessoes DESC;
```

**🎯 Insights Estratégicos:**
- Qual perfil converte melhor (foco de ads)
- Perfis com maior nível de distração (oportunidades)
- Tempo médio por perfil (otimização UX)
- Mix de atividades por persona

---

### **3️⃣ vw_pain_analysis**
**Propósito:** Análise por dores/pain points dos usuários  
**Uso:** Content marketing, segmentação avançada

```sql
CREATE OR REPLACE VIEW vw_pain_analysis AS
SELECT 
  COALESCE(pain, 'Não informado') as principal_dor,
  COUNT(*) as total_sessoes,
  COUNT(l.email) as total_leads,
  ROUND(COUNT(l.email) * 100.0 / NULLIF(COUNT(*), 0), 2) as taxa_conversao_pct,
  ROUND(AVG(mix_distracao)) as nivel_distracao_medio,
  ROUND(AVG(mix_essencial)) as nivel_essencial_medio
FROM roi_prediag_sessions s
LEFT JOIN roi_leads l ON s.id = l.last_session_id
-- NOTA: Filtro temporal removido - mostra série histórica completa
GROUP BY pain
ORDER BY taxa_conversao_pct DESC;
```

**🔍 Aplicações:**
- Dores que mais convertem (criar conteúdo específico)
- Correlação entre dor e nível de distração
- Personalização de email marketing por pain point
- Desenvolvimento de produtos/serviços direcionados

---

### **4️⃣ vw_events_funnel**
**Propósito:** Funil de conversão por eventos  
**Uso:** Identificar gargalos no processo, otimização UX

```sql
CREATE OR REPLACE VIEW vw_events_funnel AS
SELECT 
  event_name as evento,
  COUNT(*) as total_eventos,
  COUNT(DISTINCT session_id) as sessoes_unicas,
  ROUND(COUNT(*) * 100.0 / 
    (SELECT COUNT(*) FROM roi_events), 2) as percentual_total
    -- NOTA: Subquery também sem filtro temporal
FROM roi_events
-- NOTA: Filtro temporal removido - mostra série histórica completa
GROUP BY event_name
ORDER BY total_eventos DESC;
```

**🚀 Otimizações Baseadas em Dados:**
- Taxa de abandono entre `prediag_completed` e `email_submitted`
- Eventos que mais antecedem conversão
- Identificação de friction points
- A/B testing de CTAs e formulários

---

### **5️⃣ vw_activity_heatmap**
**Propósito:** Heatmap temporal de atividade  
**Uso:** Otimização de horários de campaign, análise comportamental

```sql
CREATE OR REPLACE VIEW vw_activity_heatmap AS
SELECT 
  EXTRACT(DOW FROM s.created_at) as dia_semana, -- 0=Domingo, 6=Sábado
  EXTRACT(HOUR FROM s.created_at) as hora,
  COUNT(*) as total_sessoes,
  COUNT(l.email) as leads_gerados,
  CASE EXTRACT(DOW FROM s.created_at)
    WHEN 0 THEN 'Domingo' WHEN 1 THEN 'Segunda' WHEN 2 THEN 'Terça'
    WHEN 3 THEN 'Quarta' WHEN 4 THEN 'Quinta' WHEN 5 THEN 'Sexta'
    WHEN 6 THEN 'Sábado'
  END as nome_dia
FROM roi_prediag_sessions s
LEFT JOIN roi_leads l ON s.id = l.last_session_id
-- NOTA: Filtro temporal removido (era 14 dias) - mostra série histórica completa
GROUP BY EXTRACT(DOW FROM s.created_at), EXTRACT(HOUR FROM s.created_at)
ORDER BY dia_semana, hora;
```

**⏰ Estratégias Baseadas em Tempo:**
- Melhores horários para email marketing
- Dias da semana com maior conversão
- Planejamento de campanhas pagas
- Otimização de disponibilidade de suporte

---

### **6️⃣ vw_kpis_executivos**
**Propósito:** Dashboard executivo com métricas principais  
**Uso:** Relatórios gerenciais, acompanhamento de performance geral

```sql
CREATE OR REPLACE VIEW vw_kpis_executivos AS
SELECT 
  'Série Histórica Completa' as periodo, -- ATUALIZADO
  COUNT(DISTINCT s.id) as total_sessoes,
  COUNT(DISTINCT l.email) as total_leads_unicos,
  ROUND(COUNT(DISTINCT l.email) * 100.0 / NULLIF(COUNT(DISTINCT s.id), 0), 2) as conversao_geral_pct,
  ROUND(AVG(s.duration_seconds)) as tempo_medio_sessao_seg,
  COUNT(DISTINCT DATE(s.created_at)) as dias_com_atividade,
  ROUND(COUNT(DISTINCT s.id) * 1.0 / NULLIF(COUNT(DISTINCT DATE(s.created_at)), 0), 1) as sessoes_por_dia,
  ROUND(AVG(s.mix_essencial)) as mix_essencial_medio,
  ROUND(AVG(s.mix_distracao)) as mix_distracao_medio,
  (SELECT COALESCE(profile, 'Não informado') FROM roi_prediag_sessions 
   -- NOTA: Subquery sem filtro temporal
   GROUP BY profile ORDER BY COUNT(*) DESC LIMIT 1) as perfil_dominante,
  (SELECT COALESCE(pain, 'Não informado') FROM roi_prediag_sessions 
   -- NOTA: Subquery sem filtro temporal
   GROUP BY pain ORDER BY COUNT(*) DESC LIMIT 1) as dor_dominante
FROM roi_prediag_sessions s
LEFT JOIN roi_leads l ON s.id = l.last_session_id;
-- NOTA: Filtro temporal removido - mostra série histórica completa
```

**📋 KPIs Monitorados:**
- Taxa de conversão geral
- Volume de sessões e leads
- Tempo médio de sessão
- Mix de atividades médio
- Perfil e dor dominantes
- Frequência de atividade

---

### **7️⃣ vw_mix_atividades**
**Propósito:** Análise detalhada do mix de atividades por perfil  
**Uso:** Insights sobre produtividade, validação da metodologia ROI

```sql
CREATE OR REPLACE VIEW vw_mix_atividades AS
SELECT 
  COALESCE(profile, 'Não informado') as perfil,
  COUNT(*) as total_sessoes,
  ROUND(AVG(mix_essencial)) as avg_essencial,
  ROUND(AVG(mix_estrategico)) as avg_estrategico,
  ROUND(AVG(mix_tatico)) as avg_tatico,
  ROUND(AVG(mix_distracao)) as avg_distracao,
  CASE 
    WHEN AVG(mix_essencial) >= AVG(mix_estrategico) 
         AND AVG(mix_essencial) >= AVG(mix_tatico) 
         AND AVG(mix_essencial) >= AVG(mix_distracao) THEN 'Focado Essencial'
    WHEN AVG(mix_estrategico) >= AVG(mix_tatico) 
         AND AVG(mix_estrategico) >= AVG(mix_distracao) THEN 'Focado Estratégico'
    WHEN AVG(mix_tatico) >= AVG(mix_distracao) THEN 'Focado Tático'
    ELSE 'Alto Nível Distração'
  END as classificacao_foco
FROM roi_prediag_sessions
-- NOTA: Filtro temporal removido - mostra série histórica completa
GROUP BY profile
ORDER BY avg_essencial DESC;
```

**🎯 Validações de Negócio:**
- Eficácia da metodologia ROI do Foco
- Perfis com maior necessidade do produto
- Oportunidades de coaching/consultoria
- Desenvolvimento de features específicas

---

## 📊 Como Usar as Views

### **1. Consultas Diretas (SQL Editor)**
```sql
-- Dashboard principal
SELECT * FROM vw_kpis_executivos;

-- Performance por perfil
SELECT * FROM vw_perfil_performance ORDER BY taxa_conversao_pct DESC;

-- Funil de conversão
SELECT * FROM vw_events_funnel;

-- Conversão diária com filtro manual (opcional)
SELECT * FROM vw_conversao_diaria 
WHERE data >= '2025-09-01'  -- Adicione filtro quando necessário
ORDER BY data DESC;
```

### **2. APIs Next.js**
```typescript
// app/api/dashboard/kpis/route.ts
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
  
  const { data, error } = await supabase
    .from('vw_kpis_executivos')
    .select('*');
    
  return Response.json({ data, error });
}

// Com filtro de data opcional
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('start_date');
  
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
  
  let query = supabase.from('vw_conversao_diaria').select('*');
  
  if (startDate) {
    query = query.gte('data', startDate);
  }
  
  const { data, error } = await query;
  return Response.json({ data, error });
}
```

### **3. Dashboards Externos**

#### **Grafana (Recomendado)**
- Connection: PostgreSQL direto no Supabase
- Queries: Use as views como source
- **Time Range:** Configure "Last 90 days" como padrão, ajuste conforme necessário
- Templates: Dashboards pré-configurados

#### **Metabase/Superset**
- Setup: Docker ou cloud
- Connection: Supabase PostgreSQL URL
- Automation: Refresh automático
- **Filtros:** Configure filtros de data na interface visual

#### **Power BI/Tableau**
- Connector: PostgreSQL
- Refresh: Scheduled updates
- Sharing: Enterprise dashboards
- **Período:** Use filtros nativos de date range

---

## 🔧 Manutenção e Evolução

### **Adicionando Novas Views**

#### **Template Base**
```sql
-- Padrão para novas views (SEM filtro temporal hardcoded)
CREATE OR REPLACE VIEW vw_nova_metrica AS
SELECT 
  -- Dimensões (group by)
  coluna_agrupamento,
  
  -- Métricas básicas
  COUNT(*) as total_registros,
  
  -- Métricas calculadas
  ROUND(AVG(coluna_numerica)) as media_calculada,
  
  -- Classificações
  CASE 
    WHEN condicao THEN 'Categoria A'
    ELSE 'Categoria B'
  END as classificacao
  
FROM tabela_principal p
LEFT JOIN tabela_relacionada r ON p.id = r.foreign_key
-- IMPORTANTE: NÃO adicionar filtros temporais hardcoded
-- Deixe o controle de período para o dashboard/query
WHERE p.coluna_filtro IS NOT NULL
GROUP BY coluna_agrupamento
ORDER BY total_registros DESC;
```

#### **Convenções de Nomenclatura**
- **Prefixo**: `vw_` (view)
- **Categoria**: `conversao_`, `perfil_`, `temporal_`, `mix_`
- **Sufixo**: `_diario`, `_mensal`, `_performance`, `_analysis`

#### **Exemplos de Expansão**
```sql
-- View para análise mensal
CREATE OR REPLACE VIEW vw_conversao_mensal AS
SELECT 
  DATE_TRUNC('month', data) as mes,
  SUM(total_sessoes) as sessoes_mes,
  SUM(total_leads) as leads_mes,
  ROUND(SUM(total_leads) * 100.0 / NULLIF(SUM(total_sessoes), 0), 2) as taxa_conversao_mes
FROM vw_conversao_diaria
GROUP BY DATE_TRUNC('month', data)
ORDER BY mes DESC;

-- View para análise de retenção
CREATE OR REPLACE VIEW vw_retencao_cohort AS ...

-- View para ROI por canal
CREATE OR REPLACE VIEW vw_roi_por_canal AS ...
```

### **Otimização de Performance**

#### **Índices Necessários**
```sql
-- Para queries temporais
CREATE INDEX CONCURRENTLY idx_sessions_created_date 
ON roi_prediag_sessions (DATE(created_at));

-- Para segmentação
CREATE INDEX CONCURRENTLY idx_sessions_profile_pain
ON roi_prediag_sessions (profile, pain);
-- NOTA: Removido filtro WHERE do índice parcial

-- Para eventos
CREATE INDEX CONCURRENTLY idx_events_name_ts
ON roi_events (event_name, ts);
```

#### **Materialização (Para Alto Volume)**
```sql
-- Converter view em tabela materializada
CREATE MATERIALIZED VIEW mv_kpis_executivos AS
SELECT * FROM vw_kpis_executivos;

-- Refresh programado
REFRESH MATERIALIZED VIEW mv_kpis_executivos;
```

### **Monitoramento de Views**
```sql
-- Query para verificar performance das views
SELECT 
  schemaname,
  viewname,
  definition
FROM pg_views 
WHERE viewname LIKE 'vw_%'
ORDER BY viewname;

-- Verificar uso das views (via pg_stat_statements)
SELECT 
  query,
  calls,
  total_time,
  mean_time
FROM pg_stat_statements 
WHERE query ILIKE '%vw_%'
ORDER BY mean_time DESC;
```

---

## 📈 Métricas de Sucesso

### **KPIs Principais Monitorados**
- **Taxa de Conversão Geral**: Meta > 15%
- **Tempo Médio de Sessão**: Meta < 5 minutos
- **Mix Essencial Médio**: Meta > 40%
- **Mix Distração Médio**: Meta < 15%
- **Sessões por Dia**: Meta > 10/dia

### **Alertas Configuráveis**
```sql
-- Alert: Conversão muito baixa
SELECT 'ALERT: Conversão baixa' as status
FROM vw_kpis_executivos 
WHERE conversao_geral_pct < 10;

-- Alert: Alto nível de distração
SELECT 'ALERT: Distração alta' as status
FROM vw_kpis_executivos 
WHERE mix_distracao_medio > 20;
```

---

## 🔮 Roadmap Analytics

### **Fase 2: Analytics Avançados**
- [ ] **Cohort Analysis**: Retenção por período de cadastro
- [ ] **Funnel Analysis**: Análise detalhada de abandono
- [ ] **Attribution Modeling**: ROI por canal de aquisição
- [ ] **Predictive Analytics**: ML para scoring de leads

### **Fase 3: Real-time Analytics**
- [ ] **Stream Processing**: Métricas em tempo real
- [ ] **Event-driven Architecture**: Triggers automáticos
- [ ] **Alert System**: Notificações automáticas
- [ ] **A/B Testing Framework**: Testes automatizados

### **Fase 4: Business Intelligence**
- [ ] **Executive Reporting**: Relatórios automáticos
- [ ] **Competitive Analysis**: Benchmarking de mercado
- [ ] **Revenue Analytics**: LTV, CAC, ROI financeiro
- [ ] **Product Analytics**: Feature usage, engagement

---

## 📚 Recursos e Referências

### **Documentação Técnica**
- [Supabase Views Documentation](https://supabase.com/docs/guides/database/views)
- [PostgreSQL Views Best Practices](https://www.postgresql.org/docs/current/sql-createview.html)
- [SQL Analytics Patterns](https://mode.com/sql-tutorial/)

### **Ferramentas de Visualização**
- [Grafana + PostgreSQL](https://grafana.com/docs/grafana/latest/datasources/postgres/)
- [Metabase Open Source](https://www.metabase.com/)
- [Apache Superset](https://superset.apache.org/)

### **Arquivos Relacionados**
```
docs/
├── tabelas-supabase.md         # Schema das tabelas base
├── api-prediagnostico.md       # APIs que alimentam os dados
├── views-analytics-supabase.md # Este documento
└── dashboard-grafana-supabase.md # Setup do Grafana
```

---

## ✅ Checklist de Implementação

### **Setup Inicial**
- [x] Tabelas base criadas (roi_prediag_sessions, roi_leads, roi_events)
- [x] Views analíticas implementadas (7 views)
- [x] **Correção de segurança aplicada** (views sem SECURITY DEFINER)
- [x] **Filtros temporais removidos** (série histórica completa)
- [x] Permissões adequadas configuradas (anon + authenticated)
- [x] Testes de performance executados
- [x] Validação de segurança aprovada (Security Advisor)

### **Próximos Passos**
- [x] Dashboard visual configurado (Grafana)
- [ ] APIs de consulta implementadas com filtros opcionais
- [ ] Monitoramento de performance ativo
- [ ] Sistema de alertas configurado
- [ ] Backups automáticos das views
- [ ] Treinamento da equipe no uso das views
- [ ] **Monitoramento contínuo de segurança** (Security Advisor mensalmente)

---

**📊 Sistema Analytics ROI do Foco - Views Supabase**  
**🔄 Última atualização:** Outubro 2025 (Série Histórica Completa)  
**👥 Responsável:** Equipe de Desenvolvimento  
**🔒 Status Segurança:** ✅ Aprovado (Security Advisor)  
**📧 Contato:** Para dúvidas técnicas, consulte a documentação ou abra issue no repositório