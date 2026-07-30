> # ⚠️ DOCUMENTO HISTÓRICO — NÃO USAR COMO GUIA
>
> **Aposentado em 2026-07-29 por decisão do dono.** Este dashboard **não funciona mais**: o data
> source abaixo aponta para o projeto Supabase `ghscflemhgrbfflmxqbk`, que foi pausado por
> inatividade e migrado em julho/2026 (ver `CHANGELOG` v3.5.2). O dono confirmou que não vê
> nenhum dado no Grafana — "deu trabalho configurar e não me mostra muita coisa".
>
> **Substituto:** painel de Analytics dentro do próprio admin (`/admin/analytics`) —
> ISSUE-318A, spec em `revamp/ISSUE-318A-spec-analytics-admin.md`.
>
> **Não reconectar.** As 7 views `vw_*` que alimentavam este dashboard cobrem apenas o funil
> legado `roi_*` (`/pre-diagnostico`), que o dono também vai aposentar (ISSUE-207). Mantido no
> repo só como registro do que existiu.

# 📊 Dashboard Grafana - Supabase Analytics

## 📋 Visão Geral

Guia completo para configuração e uso do dashboard Grafana conectado às views analytics do Supabase. Este documento inclui setup, queries implementadas e JSON de exportação para replicação.

### **🎯 Dashboard Atual: "Principais KPIs do Site"**

**Painéis implementados:**
- KPIs Principais (métricas executivas)
- Taxa de Conversão por Perfil
- Volume do Funil (diagnósticos → emails)
- Volume de Sessões por Perfil
- Distribuição de Dores por Perfil (7 painéis)
- Lista de Leads Capturados
- **Performance Temporal** (Sessões e Leads ao longo do tempo) - NOVO
- **Taxa de Conversão Temporal** (Evolução % de conversão) - NOVO

**Dados em tempo real:** Refresh automático a cada 30 segundos

---

## 🔄 Atualização: Série Histórica Completa (Outubro 2025)

### **⚡ Mudança Importante**
**ANTES:** Views limitadas aos últimos 30 dias  
**AGORA:** Views mostram **série histórica completa** desde 28/08/2025

### **🎯 Impacto no Grafana**
- ✅ Todos os painéis agora mostram dados históricos completos
- ✅ **Time Range recomendado:** "Last 90 days" (ajuste conforme necessário)
- ✅ Use o seletor de tempo do Grafana para controlar período visualizado
- ✅ Painéis se ajustam automaticamente ao range selecionado

### **💡 Como Usar**
1. **No dashboard**, clique no seletor de tempo (canto superior direito)
2. Escolha: "Last 90 days" para visão trimestral
3. Ou use "Custom range" para período específico (ex: desde 28/08/2025)
4. Todos os painéis se atualizam automaticamente

---

## 🔧 Setup Inicial

### **1. Configurar Data Source PostgreSQL**

**Connection Settings:**
```
Host: aws-1-sa-east-1.pooler.supabase.com
Port: 6543  
Database: postgres
Username: postgres.ghscflemhgrbfflmxqbk
Password: [sua senha do Supabase]
SSL Mode: require
```

**Validação:** Deve retornar "Database connection OK"

### **2. Importar Dashboard Completo**

Use o JSON exportado abaixo para recriar o dashboard exato:

```json
{
  "annotations": {
    "list": [
      {
        "builtIn": 1,
        "datasource": {
          "type": "grafana",
          "uid": "-- Grafana --"
        },
        "enable": true,
        "hide": true,
        "iconColor": "rgba(0, 211, 255, 1)",
        "name": "Annotations & Alerts",
        "type": "dashboard"
      }
    ]
  },
  "description": "Registro de sessões, Capturas de Lead e Perfis - Série Histórica Completa",
  "title": "Principais KPIs do Site",
  "uid": "roi_analytics_dashboard",
  "version": 2,
  "panels": []
}
```

### **3. Configuração de Refresh**

**Dashboard Settings > Time options:**
- Refresh: 30s, 1m, 5m, 15m, 30m, 1h
- Auto refresh: 30s (recomendado)
- **Time range: Last 90 days (ATUALIZADO)** - ajustável conforme necessidade

---

## 📊 Painéis Implementados

### **Painel 1: KPIs Principais**
**Tipo:** Stat  
**Query:**
```sql
SELECT 
  total_sessoes as "Total Sessões",
  total_leads_unicos as "Leads Capturados", 
  conversao_geral_pct as "Taxa Conversão (%)",
  perfil_dominante as "Perfil Top"
FROM vw_kpis_executivos;
```

**Configuração Visual:**
- Display mode: Big value
- Color mode: Value
- Show percent change: false
- Orientation: Horizontal

**Nota:** Esta view agora retorna métricas da série histórica completa, não apenas 30 dias.

---

### **Painel 2: Taxa de Conversão por Perfil**
**Tipo:** Bar chart (horizontal)  
**Query:**
```sql
WITH all_profiles AS (
  SELECT 'estudante' as perfil, 1 as ordem
  UNION SELECT 'estagiario', 2
  UNION SELECT 'analista', 3
  UNION SELECT 'especialista', 4
  UNION SELECT 'lider', 5
  UNION SELECT 'gestor', 6
  UNION SELECT 'empreendedor', 7
)
SELECT 
  ap.perfil,
  COALESCE(vp.taxa_conversao_pct, 0) as "Taxa de Conversão (%)"
FROM all_profiles ap
LEFT JOIN vw_perfil_performance vp ON ap.perfil = vp.perfil
ORDER BY ap.ordem;
```

**Configuração Visual:**
- Orientation: Horizontal
- Color: Palette classic
- Show values: Auto
- Y-axis unit: Percent (0-100)

**Nota:** Dados consideram toda a série histórica, não apenas 30 dias.

---

### **Painel 3: Volume do Funil**
**Tipo:** Bar chart (horizontal)  
**Query:**
```sql
SELECT 
  CASE evento 
    WHEN 'prediag_completed' THEN 'Diagnósticos Completados'
    WHEN 'email_submitted' THEN 'Emails Capturados'
  END as etapa,
  sessoes_unicas as quantidade
FROM vw_events_funnel
WHERE evento IN ('prediag_completed', 'email_submitted')
ORDER BY sessoes_unicas DESC;
```

**Insights:** Mostra o funil de conversão visual - quantos completaram diagnóstico vs quantos converteram em leads.

**Nota:** Volume total desde o início do projeto.

---

### **Painel 4: Volume de Sessões por Perfil**
**Tipo:** Bar chart (horizontal)  
**Query:**
```sql
SELECT 
  perfil,
  total_sessoes as "Sessões"
FROM vw_perfil_performance
ORDER BY total_sessoes DESC;
```

**Uso:** Identificar perfis com maior volume para direcionar campanhas.

---

### **Painéis 5-11: Distribuição de Dores por Perfil**

**Formato:** 7 painéis tipo "Bar gauge" (um para cada perfil)

**IMPORTANTE:** Estas queries **não usam as views** e buscam diretamente da tabela `roi_prediag_sessions`, portanto já mostram série histórica completa automaticamente.

#### **Estudante:**
```sql
WITH estudante_pains AS (
  SELECT 'procrastinacao' as pain
  UNION SELECT 'falta_clareza'
  UNION SELECT 'distracao_redes' 
  UNION SELECT 'dificuldade_rotina'
  UNION SELECT 'sem_energia'
)
SELECT 
  ep.pain as "Dor Principal",
  COALESCE(COUNT(s.id), 0) as "Sessões"
FROM estudante_pains ep
LEFT JOIN roi_prediag_sessions s ON ep.pain = s.pain AND s.profile = 'estudante'
GROUP BY ep.pain
ORDER BY ep.pain;
```

#### **Estagiário:**
```sql
WITH estagiario_pains AS (
  SELECT 'falta_direcionamento' as pain
  UNION SELECT 'tarefas_simples'
  UNION SELECT 'medo_errar'
  UNION SELECT 'sobrecarga_estudo'
  UNION SELECT 'inseguranca'
)
SELECT 
  ep.pain,
  COALESCE(COUNT(s.id), 0) as sessoes
FROM estagiario_pains ep
LEFT JOIN roi_prediag_sessions s ON ep.pain = s.pain AND s.profile = 'estagiario'
GROUP BY ep.pain
ORDER BY ep.pain;
```

#### **Analista:**
```sql
WITH analista_pains AS (
  SELECT 'urgencias' as pain
  UNION SELECT 'operacional_demais'
  UNION SELECT 'reunioes'
  UNION SELECT 'priorizar_entregas'
  UNION SELECT 'falta_direcionamento'
)
SELECT 
  ap.pain,
  COALESCE(COUNT(s.id), 0) as sessoes
FROM analista_pains ap
LEFT JOIN roi_prediag_sessions s ON ap.pain = s.pain AND s.profile = 'analista'
GROUP BY ap.pain
ORDER BY ap.pain;
```

#### **Especialista:**
```sql
WITH especialista_pains AS (
  SELECT 'demanda_operacional' as pain
  UNION SELECT 'reunioes'
  UNION SELECT 'sem_tempo_projetos'
  UNION SELECT 'urgencias'
  UNION SELECT 'consistencia_habitos'
)
SELECT 
  ep.pain,
  COALESCE(COUNT(s.id), 0) as sessoes
FROM especialista_pains ep
LEFT JOIN roi_prediag_sessions s ON ep.pain = s.pain AND s.profile = 'especialista'
GROUP BY ep.pain
ORDER BY ep.pain;
```

#### **Líder:**
```sql
WITH lider_pains AS (
  SELECT 'incendios_time' as pain
  UNION SELECT 'sem_tempo_estrategia'
  UNION SELECT 'reunioes'
  UNION SELECT 'conflito_diretoria'
  UNION SELECT 'desenvolver_pessoas'
)
SELECT 
  lp.pain,
  COALESCE(COUNT(s.id), 0) as sessoes
FROM lider_pains lp
LEFT JOIN roi_prediag_sessions s ON lp.pain = s.pain AND s.profile = 'lider'
GROUP BY lp.pain
ORDER BY lp.pain;
```

#### **Gestor:**
```sql
WITH gestor_pains AS (
  SELECT 'agenda_urgencias' as pain
  UNION SELECT 'sem_tempo_longo_prazo'
  UNION SELECT 'reunioes_politicas'
  UNION SELECT 'falta_visibilidade'
  UNION SELECT 'multistakeholders'
)
SELECT 
  gp.pain,
  COALESCE(COUNT(s.id), 0) as sessoes
FROM gestor_pains gp
LEFT JOIN roi_prediag_sessions s ON gp.pain = s.pain AND s.profile = 'gestor'
GROUP BY gp.pain
ORDER BY gp.pain;
```

#### **Empreendedor:**
```sql
WITH empreendedor_pains AS (
  SELECT 'sobrecarregado' as pain
  UNION SELECT 'vendas_consomem'
  UNION SELECT 'sem_tempo_inovar'
  UNION SELECT 'falta_processo'
  UNION SELECT 'equilibrio_vida'
)
SELECT 
  ep.pain,
  COALESCE(COUNT(s.id), 0) as sessoes
FROM empreendedor_pains ep
LEFT JOIN roi_prediag_sessions s ON ep.pain = s.pain AND s.profile = 'empreendedor'
GROUP BY ep.pain
ORDER BY ep.pain;
```

**Configuração Visual (todos os perfis):**
- Tipo: Bar gauge
- Display mode: LCD
- Color mode: Continuous (GrYlRd)
- Orientation: Horizontal
- Show unfilled: true

---

### **Painel 12: Lista de Leads Capturados**
**Tipo:** Table  
**Query:**
```sql
SELECT 
  TO_CHAR(l.created_at, 'DD/MM/YYYY') as "Data",
  TO_CHAR(l.created_at, 'HH24:MI') as "Hora",
  COALESCE(l.name, 'Não informado') as "Nome",
  l.email as "Email",
  l.profile_segment as "Perfil",
  l.pain_segment as "Dor Principal"
FROM roi_leads l
ORDER BY l.created_at DESC;
```

**Configuração Visual:**
- Cell height: Small
- Filterable: true
- Show header: true
- Order: Descending by created_at

**Nota:** Query direta na tabela, mostra todos os leads desde o início.

---

### **🆕 Painel 13: Performance Temporal - Volume**
**Tipo:** Time series  
**Query:**
```sql
SELECT 
  data as time,
  total_sessoes as "Sessões",
  total_leads as "Leads Capturados"
FROM vw_conversao_diaria
ORDER BY data ASC;
```

**Configuração Visual:**
- Time column: time
- Format: Time series
- Eixo Y (único):
  - Title: "Quantidade"
  - Unit: None
  - Min: 0
- Séries:
  - Sessões: Azul (#5794F2), Fill 10%, Line 2px
  - Leads: Verde (#73BF69), Fill 10%, Line 2px
- Legend: Bottom, com Last/Min/Max/Mean
- Tooltip: All series

**Uso:** Visualizar evolução de volume de sessões e leads ao longo do tempo, identificar tendências semanais/mensais.

---

### **🆕 Painel 14: Performance Temporal - Taxa de Conversão**
**Tipo:** Time series  
**Query:**
```sql
SELECT 
  data as time,
  taxa_conversao_pct as "Taxa de Conversão (%)"
FROM vw_conversao_diaria
ORDER BY data ASC;
```

**Configuração Visual:**
- Time column: time
- Format: Time series
- Eixo Y:
  - Title: "Conversão %"
  - Unit: Percent (0-100)
  - Min: 0
  - Max: 100 (ou Auto)
- Série:
  - Taxa Conversão: Laranja (#FF9830), Fill 20%, Line 3px
  - Line interpolation: Smooth
  - Show points: Always
- Thresholds (opcional):
  - Verde: > 15% (meta atingida)
  - Amarelo: 10-15% (atenção)
  - Vermelho: < 10% (crítico)
- Legend: Bottom, com Last/Min/Max/Mean

**Uso:** Monitorar efetividade do pré-diagnóstico ao longo do tempo, identificar períodos de melhor/pior performance.

---

## 🎨 Layout e Design

### **Grid Organization (Atualizado):**
```
Row 1: [KPIs Principais - 12 cols] [Taxa Conversão - 12 cols]
Row 2: [Volume Funil - 12 cols] [Volume Sessões - 12 cols]
Row 3: [Performance Temporal - Volume - 12 cols] [Taxa Conversão Temporal - 12 cols] 🆕
Row 4: [Estudante - 6 cols] [Líder - 6 cols]
Row 5: [Estagiário - 6 cols] [Gestor - 6 cols]
Row 6: [Analista - 6 cols] [Empreendedor - 6 cols]
Row 7: [Especialista - 6 cols] [Espaço vazio - 6 cols]
Row 8: [Lista de Leads - 16 cols]
```

### **Color Scheme:**
- Primary: Blues/Greens para métricas positivas
- Secondary: Oranges para atenção
- Gradient: GrYlRd para heatmaps de dor
- Background: Dark theme (recomendado)

---

## 🔄 Automação e Alertas

### **Refresh Automático:**
```javascript
// Configurado no dashboard settings
refresh_intervals: ["5s", "10s", "30s", "1m", "5m", "15m", "30m", "1h"]
auto_refresh: "30s"
```

### **Alertas Configuráveis:**

**Alert 1: Taxa de conversão baixa**
```sql
SELECT conversao_geral_pct 
FROM vw_kpis_executivos 
WHERE conversao_geral_pct < 10
```

**Alert 2: Ausência de novos leads**
```sql
SELECT COUNT(*) as leads_hoje
FROM roi_leads 
WHERE DATE(created_at) = CURRENT_DATE
HAVING COUNT(*) = 0
```

**Alert 3: Queda abrupta de sessões** (NOVO)
```sql
SELECT 
  data,
  total_sessoes
FROM vw_conversao_diaria
WHERE data = CURRENT_DATE
  AND total_sessoes < 5
```

---

## 📱 Sharing e Acesso

### **URLs de Compartilhamento:**
- Dashboard público: `https://[seu-workspace].grafana.net/d/[dashboard-uid]/principais-kpis-do-site`
- Snapshot temporário: Generate via Share > Snapshot
- Embed iframe: Share > Embed (para sites externos)

### **Permissões:**
- Viewer: Apenas visualização
- Editor: Pode editar painéis
- Admin: Controle total

### **Mobile Access:**
- Grafana Mobile App
- Responsive web interface
- Push notifications para alertas

---

## 🔧 Troubleshooting

### **Problemas Comuns:**

**1. Connection timeout:**
```
Solução: Verificar se IP está na whitelist do Supabase
Comando: Test connection no data source
```

**2. Query muito lenta:**
```sql
-- Adicionar índices no Supabase:
CREATE INDEX CONCURRENTLY idx_sessions_profile_created 
ON roi_prediag_sessions (profile, created_at);

CREATE INDEX CONCURRENTLY idx_sessions_created_date 
ON roi_prediag_sessions (DATE(created_at));
```

**3. Dados não atualizando:**
```
Solução: Forçar refresh do painel (Ctrl+R)
Verificar: Auto-refresh está habilitado
```

**4. Permissões de view:**
```sql
-- Verificar no Supabase:
GRANT SELECT ON vw_kpis_executivos TO anon;
GRANT SELECT ON vw_perfil_performance TO anon;
GRANT SELECT ON vw_conversao_diaria TO anon;
```

**5. Gráficos temporais vazios:** (NOVO)
```
Problema: Painéis de time series não mostram dados
Solução: 
1. Verificar se "Time column" está configurado como "time"
2. Confirmar que "Format" está em "Time series"
3. Ajustar Time Range do dashboard (canto superior direito)
4. Verificar query no Query Inspector (ícone de lupa)
```

---

## 📊 Expansões Futuras

### **Novos Painéis Sugeridos:**

**Heatmap Temporal:**
```sql
SELECT 
  nome_dia,
  hora,
  total_sessoes
FROM vw_activity_heatmap
WHERE total_sessoes > 0;
```

**Análise de Retenção:**
```sql
SELECT 
  cohort_week,
  total_leads,
  engagement_rate
FROM vw_retention_cohort
ORDER BY cohort_week DESC;
```

**Mix de Atividades:**
```sql
SELECT 
  perfil,
  avg_essencial,
  avg_estrategico,
  avg_tatico,
  avg_distracao
FROM vw_mix_atividades;
```

**Performance Semanal:** (NOVO)
```sql
SELECT 
  DATE_TRUNC('week', data) as time,
  SUM(total_sessoes) as "Sessões (Semana)",
  SUM(total_leads) as "Leads (Semana)",
  ROUND(SUM(total_leads) * 100.0 / NULLIF(SUM(total_sessoes), 0), 2) as "Taxa Conversão Semanal (%)"
FROM vw_conversao_diaria
GROUP BY DATE_TRUNC('week', data)
ORDER BY time ASC;
```

---

## 💾 Backup e Migração

### **Export Dashboard:**
1. Dashboard settings > JSON Model
2. Copy JSON completo
3. Salvar como `dashboard-backup-[data].json`

### **Import Dashboard:**
1. Home > Import
2. Upload JSON file ou paste JSON
3. Configure data source UID
4. Save & import

### **Version Control:**
- Manter JSONs versionados no Git
- Tag releases importantes
- Documentar mudanças significativas

**Histórico de Versões:**
- v1.0 (Agosto 2025): Dashboard inicial com 12 painéis, filtro 30 dias
- v2.0 (Outubro 2025): Série histórica completa, 2 painéis temporais adicionados

---

## 📈 Métricas de Performance

**Benchmarks atuais (baseado em dados reais):**
- Load time: < 2s
- Query response: < 500ms por painel  
- Refresh cycle: 30s
- **Data retention: Série histórica completa (desde 28/08/2025)** - ATUALIZADO
- Concurrent users: Até 10 (Grafana free)
- Total de painéis: 14 painéis ativos

---

## 🔗 Integrações Externas

### **APIs disponíveis para dashboards:**
```typescript
// Endpoint Next.js que espelha os dados
GET /api/dashboard/kpis
GET /api/dashboard/perfil-performance  
GET /api/dashboard/leads
GET /api/dashboard/conversao-diaria?start_date=2025-09-01 // NOVO - com filtro opcional

// Usar para dashboards React externos
const { data } = await fetch('/api/dashboard/kpis');

// Com filtro de período
const { data } = await fetch('/api/dashboard/conversao-diaria?start_date=2025-09-01');
```

### **Webhook para alertas:**
```json
// POST para Slack/Discord quando conversão < 10%
{
  "text": "🚨 Taxa conversão abaixo de 10%",
  "value": "8.5%",
  "dashboard": "https://grafana.com/d/roi_analytics"
}
```

---

## 📚 Recursos Adicionais

### **Tutoriais Grafana:**
- [Time Series Visualization](https://grafana.com/docs/grafana/latest/panels-visualizations/visualizations/time-series/)
- [Configure Time Range](https://grafana.com/docs/grafana/latest/dashboards/use-dashboards/#set-dashboard-time-range)
- [PostgreSQL Data Source](https://grafana.com/docs/grafana/latest/datasources/postgres/)

### **Documentação Relacionada:**
```
docs/
├── views-analytics-supabase.md        # Views SQL detalhadas
├── dashboard-grafana-supabase.md      # Este documento
└── tabelas-supabase.md                # Schema das tabelas base
```

---

**📊 Sistema Dashboard Grafana - ROI do Foco**  
**🔄 Última atualização:** Outubro 2025 (Série Histórica Completa + Painéis Temporais)  
**👥 Responsável:** Equipe de Desenvolvimento  
**🔗 Dashboard URL:** https://[workspace].grafana.net/d/add4mzt/principais-kpis-do-site  
**📧 Contato:** Para dúvidas sobre dashboards ou expansões