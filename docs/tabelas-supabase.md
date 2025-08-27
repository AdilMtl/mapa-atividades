\# 🗄️ Documentação: Tabelas Supabase - Sistema Pré-Diagnóstico



\## 📋 Visão Geral



Sistema de 4 tabelas para suportar o fluxo completo: \*\*Sessões de Diagnóstico → Leads → Analytics → Eventos\*\*.



```sql

Tabelas Criadas:

├── roi\_prediag\_sessions  # Dados do diagnóstico

├── roi\_leads            # Emails capturados  

├── roi\_events          # Analytics/tracking

└── roi\_analytics       # Métricas agregadas (futura)

```



---



\## 📊 Tabela 1: `roi\_prediag\_sessions`



\*\*Propósito\*\*: Armazenar dados completos do pré-diagnóstico processado



\### Schema SQL

```sql

CREATE TABLE roi\_prediag\_sessions (

&nbsp; -- Identificação

&nbsp; id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

&nbsp; created\_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

&nbsp; completed\_at TIMESTAMP WITH TIME ZONE,

&nbsp; 

&nbsp; -- Respostas do usuário (inputs)

&nbsp; profile VARCHAR(50) NOT NULL,           -- estudante, analista, gestor...

&nbsp; agenda VARCHAR(50) NOT NULL,            -- sempre\_lotada, freq\_cheia...

&nbsp; pain VARCHAR(100) NOT NULL,             -- urgencias, operacional\_demais...

&nbsp; top\_activity VARCHAR(100) NOT NULL,     -- emails, reunioes\_status...

&nbsp; goal VARCHAR(100) NOT NULL,             -- entregas\_prazo, tempo\_planejamento...

&nbsp; 

&nbsp; -- Resultado do diagnóstico (outputs)

&nbsp; mix\_essencial INTEGER NOT NULL,         -- % zona essencial (0-100)

&nbsp; mix\_estrategico INTEGER NOT NULL,       -- % zona estratégica (0-100)  

&nbsp; mix\_tatico INTEGER NOT NULL,            -- % zona tática (0-100)

&nbsp; mix\_distracao INTEGER NOT NULL,         -- % zona distração (0-100)

&nbsp; insight\_hash VARCHAR(100),              -- Primeiros 100 chars do insight

&nbsp; 

&nbsp; -- Metadados de sessão

&nbsp; ip\_address INET,                        -- IP do usuário (analytics)

&nbsp; user\_agent TEXT,                        -- Browser info

&nbsp; duration\_seconds INTEGER,               -- Tempo para completar

&nbsp; 

&nbsp; -- Índices para performance

&nbsp; CONSTRAINT roi\_prediag\_sessions\_mix\_sum CHECK (

&nbsp;   mix\_essencial + mix\_estrategico + mix\_tatico + mix\_distracao = 100

&nbsp; )

);



-- Índices para queries rápidas

CREATE INDEX idx\_roi\_prediag\_profile ON roi\_prediag\_sessions(profile);

CREATE INDEX idx\_roi\_prediag\_pain ON roi\_prediag\_sessions(pain);

CREATE INDEX idx\_roi\_prediag\_created ON roi\_prediag\_sessions(created\_at DESC);

```



\### Dados de Exemplo

```json

{

&nbsp; "id": "123e4567-e89b-12d3-a456-426614174000",

&nbsp; "profile": "analista",

&nbsp; "agenda": "freq\_cheia", 

&nbsp; "pain": "urgencias",

&nbsp; "top\_activity": "emails",

&nbsp; "goal": "entregas\_prazo",

&nbsp; "mix\_essencial": 25,

&nbsp; "mix\_estrategico": 30,

&nbsp; "mix\_tatico": 35, 

&nbsp; "mix\_distracao": 10,

&nbsp; "insight\_hash": "Você está reagindo mais do que agindo. Seu foco está sendo sequestrado por demandas...",

&nbsp; "ip\_address": "192.168.1.1",

&nbsp; "user\_agent": "Mozilla/5.0...",

&nbsp; "duration\_seconds": 120,

&nbsp; "completed\_at": "2025-01-27T10:30:00Z"

}

```



\### Queries Comuns

```sql

-- Distribuição por perfil (últimos 30 dias)

SELECT profile, COUNT(\*) as total

FROM roi\_prediag\_sessions 

WHERE created\_at >= NOW() - INTERVAL '30 days'

GROUP BY profile

ORDER BY total DESC;



-- Mix médio por perfil

SELECT 

&nbsp; profile,

&nbsp; ROUND(AVG(mix\_essencial)) as avg\_essencial,

&nbsp; ROUND(AVG(mix\_estrategico)) as avg\_estrategico, 

&nbsp; ROUND(AVG(mix\_tatico)) as avg\_tatico,

&nbsp; ROUND(AVG(mix\_distracao)) as avg\_distracao

FROM roi\_prediag\_sessions

GROUP BY profile;



-- Sessões mais rápidas/lentas

SELECT profile, pain, duration\_seconds

FROM roi\_prediag\_sessions

WHERE duration\_seconds IS NOT NULL

ORDER BY duration\_seconds DESC

LIMIT 10;

```



---



\## 👥 Tabela 2: `roi\_leads`



\*\*Propósito\*\*: Capturar e gerenciar leads (emails) do pré-diagnóstico



\### Schema SQL

```sql

CREATE TABLE roi\_leads (

&nbsp; -- Identificação

&nbsp; id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

&nbsp; email VARCHAR(255) UNIQUE NOT NULL,     -- Email único (chave natural)

&nbsp; created\_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

&nbsp; updated\_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

&nbsp; 

&nbsp; -- Origem e contexto

&nbsp; source VARCHAR(50) DEFAULT 'prediagnostico', -- origem do lead

&nbsp; last\_session\_id UUID REFERENCES roi\_prediag\_sessions(id), -- última sessão

&nbsp; 

&nbsp; -- Segmentação (baseada na última sessão)

&nbsp; profile\_segment VARCHAR(50),            -- perfil profissional

&nbsp; pain\_segment VARCHAR(100),              -- principal dor/desafio

&nbsp; 

&nbsp; -- Status de engajamento

&nbsp; email\_sent BOOLEAN DEFAULT FALSE,       -- email foi enviado?

&nbsp; email\_sent\_at TIMESTAMP WITH TIME ZONE, -- quando foi enviado

&nbsp; email\_opened BOOLEAN DEFAULT FALSE,     -- abriu o email? (webhook Resend)

&nbsp; email\_clicked BOOLEAN DEFAULT FALSE,    -- clicou no email? (webhook Resend)

&nbsp; 

&nbsp; -- Subscrição newsletter

&nbsp; subscribed BOOLEAN DEFAULT FALSE,       -- se inscreveu na newsletter

&nbsp; subscribed\_at TIMESTAMP WITH TIME ZONE,

&nbsp; unsubscribed BOOLEAN DEFAULT FALSE,     -- cancelou inscrição

&nbsp; unsubscribed\_at TIMESTAMP WITH TIME ZONE

);



-- Índices e triggers

CREATE INDEX idx\_roi\_leads\_email ON roi\_leads(email);

CREATE INDEX idx\_roi\_leads\_segment ON roi\_leads(profile\_segment);

CREATE INDEX idx\_roi\_leads\_created ON roi\_leads(created\_at DESC);



-- Trigger para updated\_at

CREATE OR REPLACE FUNCTION update\_updated\_at\_column()

RETURNS TRIGGER AS $$

BEGIN

&nbsp; NEW.updated\_at = NOW();

&nbsp; RETURN NEW;

END;

$$ language 'plpgsql';



CREATE TRIGGER update\_roi\_leads\_updated\_at 

&nbsp; BEFORE UPDATE ON roi\_leads 

&nbsp; FOR EACH ROW EXECUTE FUNCTION update\_updated\_at\_column();

```



\### Dados de Exemplo

```json

{

&nbsp; "id": "456e7890-e89b-12d3-a456-426614174001", 

&nbsp; "email": "joao.silva@empresa.com",

&nbsp; "source": "prediagnostico",

&nbsp; "last\_session\_id": "123e4567-e89b-12d3-a456-426614174000",

&nbsp; "profile\_segment": "analista",

&nbsp; "pain\_segment": "urgencias", 

&nbsp; "email\_sent": true,

&nbsp; "email\_sent\_at": "2025-01-27T10:32:00Z",

&nbsp; "email\_opened": true,

&nbsp; "subscribed": false,

&nbsp; "created\_at": "2025-01-27T10:31:00Z"

}

```



\### Operação Upsert (usado na API)

```sql

-- Como a API faz upsert baseado no email

INSERT INTO roi\_leads (

&nbsp; email, source, last\_session\_id, 

&nbsp; profile\_segment, pain\_segment

) VALUES (

&nbsp; 'novo@email.com', 'prediagnostico', 'session\_uuid',

&nbsp; 'analista', 'urgencias'  

)

ON CONFLICT (email) DO UPDATE SET

&nbsp; last\_session\_id = EXCLUDED.last\_session\_id,

&nbsp; profile\_segment = EXCLUDED.profile\_segment,

&nbsp; pain\_segment = EXCLUDED.pain\_segment,

&nbsp; updated\_at = NOW();

```



\### Métricas de Conversão

```sql

-- Taxa de abertura de email por segmento

SELECT 

&nbsp; profile\_segment,

&nbsp; COUNT(\*) as emails\_sent,

&nbsp; COUNT(\*) FILTER (WHERE email\_opened) as emails\_opened,

&nbsp; ROUND(

&nbsp;   COUNT(\*) FILTER (WHERE email\_opened) \* 100.0 / COUNT(\*), 2

&nbsp; ) as open\_rate

FROM roi\_leads

WHERE email\_sent = TRUE

&nbsp; AND created\_at >= NOW() - INTERVAL '30 days'

GROUP BY profile\_segment;



-- Leads mais engajados (abriram E clicaram)

SELECT email, profile\_segment, pain\_segment, created\_at

FROM roi\_leads  

WHERE email\_opened = TRUE AND email\_clicked = TRUE

ORDER BY created\_at DESC;

```



---



\## 📈 Tabela 3: `roi\_events`



\*\*Propósito\*\*: Tracking detalhado de eventos para analytics e otimização



\### Schema SQL

```sql

CREATE TABLE roi\_events (

&nbsp; -- Identificação

&nbsp; id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

&nbsp; created\_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

&nbsp; 

&nbsp; -- Contexto da sessão

&nbsp; session\_id UUID REFERENCES roi\_prediag\_sessions(id), -- sessão relacionada

&nbsp; 

&nbsp; -- Detalhes do evento  

&nbsp; event\_name VARCHAR(100) NOT NULL,       -- nome do evento

&nbsp; page\_url VARCHAR(500),                  -- página onde aconteceu

&nbsp; payload JSONB,                          -- dados específicos do evento

&nbsp; 

&nbsp; -- Metadados técnicos

&nbsp; ip\_address INET,                        -- IP do usuário

&nbsp; user\_agent TEXT                         -- Browser info

);



-- Índices para analytics rápidas

CREATE INDEX idx\_roi\_events\_session ON roi\_events(session\_id);

CREATE INDEX idx\_roi\_events\_name ON roi\_events(event\_name);

CREATE INDEX idx\_roi\_events\_created ON roi\_events(created\_at DESC);

CREATE INDEX idx\_roi\_events\_payload ON roi\_events USING GIN (payload); -- JSONB queries

```



\### Eventos Capturados

```json

// 1. Diagnóstico completado

{

&nbsp; "session\_id": "uuid",

&nbsp; "event\_name": "prediag\_completed",

&nbsp; "page\_url": "/pre-diagnostico",

&nbsp; "payload": {

&nbsp;   "cenario": "ANALISTA\_URGENCIAS",

&nbsp;   "mix": {

&nbsp;     "essencial": 25,

&nbsp;     "estrategica": 30,

&nbsp;     "tatica": 35, 

&nbsp;     "distracao": 10

&nbsp;   },

&nbsp;   "profile": "analista",

&nbsp;   "pain": "urgencias"

&nbsp; }

}



// 2. Email enviado

{

&nbsp; "session\_id": "uuid", 

&nbsp; "event\_name": "email\_submitted",

&nbsp; "page\_url": "/pre-diagnostico",

&nbsp; "payload": {

&nbsp;   "email\_hash": "base64\_hash",  // não salva email real

&nbsp;   "source": "prediag\_gate"

&nbsp; }

}



// 3. Link clicado no email (webhook Resend)

{

&nbsp; "session\_id": null,             // não temos sessão no webhook

&nbsp; "event\_name": "email\_link\_clicked", 

&nbsp; "page\_url": null,

&nbsp; "payload": {

&nbsp;   "link\_url": "https://conversasnocorredor.substack.com/subscribe",

&nbsp;   "email\_hash": "base64\_hash",

&nbsp;   "campaign": "prediag\_followup"

&nbsp; }

}

```



\### Analytics Queries

```sql

-- Funil de conversão

SELECT 

&nbsp; DATE(created\_at) as date,

&nbsp; COUNT(\*) FILTER (WHERE event\_name = 'prediag\_completed') as diagnostics,

&nbsp; COUNT(\*) FILTER (WHERE event\_name = 'email\_submitted') as emails,

&nbsp; ROUND(

&nbsp;   COUNT(\*) FILTER (WHERE event\_name = 'email\_submitted') \* 100.0 / 

&nbsp;   NULLIF(COUNT(\*) FILTER (WHERE event\_name = 'prediag\_completed'), 0), 2

&nbsp; ) as conversion\_rate

FROM roi\_events  

WHERE created\_at >= NOW() - INTERVAL '7 days'

GROUP BY DATE(created\_at)

ORDER BY date DESC;



-- Cenários mais comuns

SELECT 

&nbsp; payload->>'cenario' as cenario,

&nbsp; COUNT(\*) as frequency

FROM roi\_events

WHERE event\_name = 'prediag\_completed'

&nbsp; AND created\_at >= NOW() - INTERVAL '30 days'

GROUP BY payload->>'cenario'

ORDER BY frequency DESC;



-- Performance por perfil profissional  

SELECT 

&nbsp; payload->>'profile' as profile,

&nbsp; COUNT(\*) as total\_diagnostics,

&nbsp; COUNT(\*) FILTER (

&nbsp;   WHERE EXISTS (

&nbsp;     SELECT 1 FROM roi\_events e2 

&nbsp;     WHERE e2.session\_id = roi\_events.session\_id 

&nbsp;     AND e2.event\_name = 'email\_submitted'

&nbsp;   )

&nbsp; ) as converted\_to\_email

FROM roi\_events

WHERE event\_name = 'prediag\_completed'

GROUP BY payload->>'profile';

```



---



\## 🔒 Row Level Security (RLS)



\### Políticas de Segurança

```sql

-- Habilitar RLS nas tabelas

ALTER TABLE roi\_prediag\_sessions ENABLE ROW LEVEL SECURITY;

ALTER TABLE roi\_leads ENABLE ROW LEVEL SECURITY; 

ALTER TABLE roi\_events ENABLE ROW LEVEL SECURITY;



-- Política: Apenas leitura para role anônimo (API pública)

CREATE POLICY "Allow anonymous read" ON roi\_prediag\_sessions

&nbsp; FOR SELECT TO anon USING (true);



CREATE POLICY "Allow anonymous insert" ON roi\_prediag\_sessions  

&nbsp; FOR INSERT TO anon WITH CHECK (true);



-- Política: Leads são protegidos (só sistema pode acessar)

CREATE POLICY "System only" ON roi\_leads

&nbsp; FOR ALL TO service\_role USING (true);



-- Política: Events para analytics

CREATE POLICY "Allow anonymous insert events" ON roi\_events

&nbsp; FOR INSERT TO anon WITH CHECK (true);

&nbsp; 

CREATE POLICY "System read events" ON roi\_events

&nbsp; FOR SELECT TO service\_role USING (true);

```



\### Roles e Permissões

```sql

-- Role para APIs públicas (diagnóstico)

GRANT SELECT, INSERT ON roi\_prediag\_sessions TO anon;

GRANT SELECT, INSERT ON roi\_events TO anon;



-- Role para operações administrativas  

GRANT ALL ON ALL TABLES IN SCHEMA public TO service\_role;



-- Role para analytics/dashboard (futuro)

CREATE ROLE analytics\_reader;

GRANT SELECT ON roi\_prediag\_sessions TO analytics\_reader;

GRANT SELECT ON roi\_events TO analytics\_reader; 

GRANT SELECT ON roi\_leads TO analytics\_reader;

```



---



\## 🚀 Performance e Otimização



\### Índices Estratégicos

```sql

-- Para queries temporais (dashboards)

CREATE INDEX CONCURRENTLY idx\_sessions\_created\_date 

ON roi\_prediag\_sessions (DATE(created\_at));



-- Para segmentação (marketing)

CREATE INDEX CONCURRENTLY idx\_leads\_segments

ON roi\_leads (profile\_segment, pain\_segment) 

WHERE email\_sent = TRUE;



-- Para analytics de eventos

CREATE INDEX CONCURRENTLY idx\_events\_name\_date

ON roi\_events (event\_name, DATE(created\_at));

```



\### Particionamento (Futuro)

```sql

-- Para grandes volumes, particionar por mês

CREATE TABLE roi\_events\_y2025m01 PARTITION OF roi\_events

FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');



CREATE TABLE roi\_events\_y2025m02 PARTITION OF roi\_events  

FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

```



\### Limpeza de Dados

```sql

-- Job para limpar eventos antigos (>1 ano)

DELETE FROM roi\_events 

WHERE created\_at < NOW() - INTERVAL '1 year'

&nbsp; AND event\_name NOT IN ('prediag\_completed', 'email\_submitted');



-- Arquivar sessões antigas

INSERT INTO roi\_prediag\_sessions\_archive 

SELECT \* FROM roi\_prediag\_sessions 

WHERE created\_at < NOW() - INTERVAL '6 months';

```



---



\## 📊 Views Analíticas



\### View: Conversão Diária

```sql

CREATE VIEW daily\_conversion AS

SELECT 

&nbsp; DATE(s.created\_at) as date,

&nbsp; COUNT(s.id) as total\_sessions,

&nbsp; COUNT(l.id) as converted\_leads,

&nbsp; ROUND(COUNT(l.id) \* 100.0 / COUNT(s.id), 2) as conversion\_rate,

&nbsp; COUNT(DISTINCT s.profile) as unique\_profiles

FROM roi\_prediag\_sessions s

LEFT JOIN roi\_leads l ON s.id = l.last\_session\_id

WHERE s.created\_at >= NOW() - INTERVAL '30 days'

GROUP BY DATE(s.created\_at)

ORDER BY date DESC;

```



\### View: Performance por Segmento

```sql

CREATE VIEW segment\_performance AS

SELECT 

&nbsp; profile,

&nbsp; pain,

&nbsp; COUNT(\*) as total\_sessions,

&nbsp; ROUND(AVG(duration\_seconds)) as avg\_duration,

&nbsp; ROUND(AVG(mix\_essencial)) as avg\_essencial,

&nbsp; COUNT(l.email) as leads\_captured

FROM roi\_prediag\_sessions s

LEFT JOIN roi\_leads l ON s.id = l.last\_session\_id  

GROUP BY profile, pain

HAVING COUNT(\*) >= 5  -- só segmentos com volume

ORDER BY total\_sessions DESC;

```



---



\## 🔧 Backup e Manutenção



\### Backup Automático

```sql

-- Configurar backup diário via Supabase CLI

supabase db dump --data-only > backup\_$(date +%Y%m%d).sql



-- Backup específico para produção

pg\_dump -h db.xxx.supabase.co -U postgres \\

&nbsp; --table=roi\_prediag\_sessions \\

&nbsp; --table=roi\_leads \\

&nbsp; --table=roi\_events \\

&nbsp; database\_name > prediag\_backup.sql

```



\### Monitoramento de Health

```sql  

-- Query para monitorar saúde das tabelas

SELECT 

&nbsp; schemaname,

&nbsp; tablename,

&nbsp; pg\_size\_pretty(pg\_total\_relation\_size(schemaname||'.'||tablename)) as size,

&nbsp; pg\_stat\_get\_live\_tuples(c.oid) as live\_tuples,

&nbsp; pg\_stat\_get\_dead\_tuples(c.oid) as dead\_tuples

FROM pg\_tables t

JOIN pg\_class c ON c.relname = t.tablename

WHERE t.tablename LIKE 'roi\_%'

ORDER BY pg\_total\_relation\_size(schemaname||'.'||tablename) DESC;

```

