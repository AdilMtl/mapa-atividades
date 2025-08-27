\# 🚀 Guia de Deploy e Configuração - Sistema Pré-Diagnóstico



\## 📋 Checklist de Implementação



Sistema completo em produção requer configuração de 4 serviços integrados:



```

✅ Next.js App (Vercel)

✅ Supabase Database  

✅ Resend Email Service

✅ Domain/DNS Configuration

```



---



\## 🗄️ PASSO 1: Configuração Supabase



\### 1.1 Criar Projeto

```bash

\# Via Supabase Dashboard

1\. Acesse https://supabase.com/dashboard

2\. Clique "New Project"

3\. Nome: "mapa-atividades-prod" 

4\. Region: South America (São Paulo)

5\. Database Password: \[senha forte]

```



\### 1.2 Executar Scripts SQL

```sql

-- Execute no SQL Editor do Supabase (nesta ordem):



-- 1️⃣ Criar tabelas

CREATE TABLE roi\_prediag\_sessions (

&nbsp; id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

&nbsp; created\_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

&nbsp; completed\_at TIMESTAMP WITH TIME ZONE,

&nbsp; 

&nbsp; profile VARCHAR(50) NOT NULL,

&nbsp; agenda VARCHAR(50) NOT NULL,

&nbsp; pain VARCHAR(100) NOT NULL,

&nbsp; top\_activity VARCHAR(100) NOT NULL,

&nbsp; goal VARCHAR(100) NOT NULL,

&nbsp; 

&nbsp; mix\_essencial INTEGER NOT NULL,

&nbsp; mix\_estrategico INTEGER NOT NULL,

&nbsp; mix\_tatico INTEGER NOT NULL,

&nbsp; mix\_distracao INTEGER NOT NULL,

&nbsp; insight\_hash VARCHAR(100),

&nbsp; 

&nbsp; ip\_address INET,

&nbsp; user\_agent TEXT,

&nbsp; duration\_seconds INTEGER,

&nbsp; 

&nbsp; CONSTRAINT roi\_prediag\_sessions\_mix\_sum CHECK (

&nbsp;   mix\_essencial + mix\_estrategico + mix\_tatico + mix\_distracao = 100

&nbsp; )

);



CREATE TABLE roi\_leads (

&nbsp; id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

&nbsp; email VARCHAR(255) UNIQUE NOT NULL,

&nbsp; created\_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

&nbsp; updated\_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

&nbsp; 

&nbsp; source VARCHAR(50) DEFAULT 'prediagnostico',

&nbsp; last\_session\_id UUID REFERENCES roi\_prediag\_sessions(id),

&nbsp; 

&nbsp; profile\_segment VARCHAR(50),

&nbsp; pain\_segment VARCHAR(100),

&nbsp; 

&nbsp; email\_sent BOOLEAN DEFAULT FALSE,

&nbsp; email\_sent\_at TIMESTAMP WITH TIME ZONE,

&nbsp; email\_opened BOOLEAN DEFAULT FALSE,

&nbsp; email\_clicked BOOLEAN DEFAULT FALSE,

&nbsp; 

&nbsp; subscribed BOOLEAN DEFAULT FALSE,

&nbsp; subscribed\_at TIMESTAMP WITH TIME ZONE,

&nbsp; unsubscribed BOOLEAN DEFAULT FALSE,

&nbsp; unsubscribed\_at TIMESTAMP WITH TIME ZONE

);



CREATE TABLE roi\_events (

&nbsp; id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

&nbsp; created\_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

&nbsp; 

&nbsp; session\_id UUID REFERENCES roi\_prediag\_sessions(id),

&nbsp; 

&nbsp; event\_name VARCHAR(100) NOT NULL,

&nbsp; page\_url VARCHAR(500),

&nbsp; payload JSONB,

&nbsp; 

&nbsp; ip\_address INET,

&nbsp; user\_agent TEXT

);



-- 2️⃣ Criar índices

CREATE INDEX idx\_roi\_prediag\_profile ON roi\_prediag\_sessions(profile);

CREATE INDEX idx\_roi\_prediag\_created ON roi\_prediag\_sessions(created\_at DESC);



CREATE INDEX idx\_roi\_leads\_email ON roi\_leads(email);

CREATE INDEX idx\_roi\_leads\_created ON roi\_leads(created\_at DESC);



CREATE INDEX idx\_roi\_events\_session ON roi\_events(session\_id);

CREATE INDEX idx\_roi\_events\_name ON roi\_events(event\_name);

CREATE INDEX idx\_roi\_events\_created ON roi\_events(created\_at DESC);



-- 3️⃣ Trigger para updated\_at

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



-- 4️⃣ RLS Policies

ALTER TABLE roi\_prediag\_sessions ENABLE ROW LEVEL SECURITY;

ALTER TABLE roi\_leads ENABLE ROW LEVEL SECURITY;

ALTER TABLE roi\_events ENABLE ROW LEVEL SECURITY;



CREATE POLICY "Allow anonymous read sessions" ON roi\_prediag\_sessions

&nbsp; FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anonymous insert sessions" ON roi\_prediag\_sessions

&nbsp; FOR INSERT TO anon WITH CHECK (true);



CREATE POLICY "System only leads" ON roi\_leads

&nbsp; FOR ALL TO service\_role USING (true);



CREATE POLICY "Allow anonymous insert events" ON roi\_events

&nbsp; FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "System read events" ON roi\_events

&nbsp; FOR SELECT TO service\_role USING (true);

```



\### 1.3 Coletar Credenciais

```bash

\# No Dashboard Supabase > Settings > API

SUPABASE\_URL=https://xxxxxxxxxx.supabase.co

SUPABASE\_ANON\_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...



\# Para operações administrativas (opcional)

SUPABASE\_SERVICE\_ROLE\_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

```



---



\## 📧 PASSO 2: Configuração Resend



\### 2.1 Criar Conta e API Key

```bash

\# 1. Acesse https://resend.com/signup

\# 2. Confirme email e faça login

\# 3. Vá em "API Keys" > "Create API Key"  

\# 4. Nome: "Mapa Atividades - Prod"

\# 5. Permission: "Full Access"

\# 6. Copie a chave (só aparece uma vez!)



RESEND\_API\_KEY=re\_xxxxxxxxxx\_xxxxxxxxxxxxxxxxxxxxxxxxx

```



\### 2.2 Configurar Domínio (Opcional)

```bash

\# Para emails profissionais (recomendado para produção)



\# 1. Dashboard Resend > Domains > Add Domain

\# 2. Digite: conversasnocorredor.com (ou seu domínio)

\# 3. Adicione records DNS:

\#    - TXT: "resend.\_domainkey" com valor fornecido

\#    - CNAME: "resend" apontando para resend.com

\# 4. Aguarde verificação (até 24h)

\# 5. Use: noreply@conversasnocorredor.com



\# Se não configurar domínio, use:

EMAIL\_FROM\_ADDRESS=onboarding@resend.dev

```



\### 2.3 Testar Envio

```bash

\# Teste manual via cURL

curl -X POST 'https://api.resend.com/emails' \\

&nbsp; -H 'Authorization: Bearer re\_xxxxxxxxxx' \\

&nbsp; -H 'Content-Type: application/json' \\

&nbsp; -d '{

&nbsp;   "from": "onboarding@resend.dev",

&nbsp;   "to": "seuemail@teste.com", 

&nbsp;   "subject": "Teste Resend",

&nbsp;   "html": "<h1>Funcionou!</h1>"

&nbsp; }'



\# Resposta esperada:

\# {"id":"049b23bf-626d-4e7d-8118-661e88cae9cd"}

```



---



\## 🌐 PASSO 3: Deploy Next.js (Vercel)



\### 3.1 Preparar Repositório

```bash

cd C:\\Users\\adils\\mapa-atividades



\# Verificar build local

npm run build

npm run start  # Testar produção local na porta 3000



\# Commit das mudanças

git add .

git commit -m "feat: sistema pré-diagnóstico completo



\- 3 APIs: /options, /diagnose, /lead

\- Página /pre-diagnostico conversacional

\- 4 tabelas Supabase com RLS

\- Templates email HTML via Resend

\- Sistema recomendações 450+ heurísticas"



git push origin main

```



\### 3.2 Deploy Vercel

```bash

\# Método 1: Via Dashboard

\# 1. Acesse https://vercel.com/dashboard  

\# 2. "New Project" > Import do GitHub

\# 3. Selecione repositório "mapa-atividades"

\# 4. Framework: Next.js (autodetectado)

\# 5. Deploy (primeiro deploy pode demorar 3-5 min)



\# Método 2: Via CLI  

npm i -g vercel

vercel login

vercel --prod

```



\### 3.3 Configurar Environment Variables

```bash

\# No Dashboard Vercel > Settings > Environment Variables

\# Adicione cada variável:



SUPABASE\_URL=https://xxxxxxxxxx.supabase.co

SUPABASE\_ANON\_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

RESEND\_API\_KEY=re\_xxxxxxxxxx\_xxxxxxxxxxxxxxxxxxxxxxxxx  

EMAIL\_FROM\_ADDRESS=noreply@conversasnocorredor.com



\# Para todas as environments: Production, Preview, Development

```



\### 3.4 Redeploy com Variables

```bash

\# Após configurar variáveis, force redeploy

\# Dashboard > Deployments > \[...] > Redeploy



\# Ou via git push

git commit --allow-empty -m "trigger: redeploy with env vars"

git push

```



---



\## 🔗 PASSO 4: Configuração DNS (Opcional)



\### 4.1 Domínio Custom

```bash

\# Se quiser https://pre-diagnostico.conversasnocorredor.com



\# 1. Vercel Dashboard > Settings > Domains

\# 2. Add Domain: "pre-diagnostico.conversasnocorredor.com"

\# 3. Adicionar CNAME no seu DNS:

\#    - Name: pre-diagnostico

\#    - Value: cname.vercel-dns.com

\# 4. Aguardar propagação (até 24h)

```



\### 4.2 SSL Automático

```bash

\# Vercel configura SSL automaticamente via Let's Encrypt

\# Nada precisa ser feito manualmente

\# Certificado renova automaticamente

```



---



\## 🧪 PASSO 5: Testes de Produção



\### 5.1 Smoke Tests

```bash

\# 1. Testar APIs diretamente

curl https://sua-app.vercel.app/api/prediag/options

curl https://sua-app.vercel.app/api/prediag/options?profile=analista



\# 2. Testar fluxo completo  

\# Acesse: https://sua-app.vercel.app/pre-diagnostico

\# Complete diagnóstico com email de teste

\# Verifique recebimento do email



\# 3. Verificar banco Supabase

\# Dashboard > Table Editor > roi\_prediag\_sessions

\# Dashboard > Table Editor > roi\_leads  

\# Confirme dados salvos corretamente

```



\### 5.2 Performance Tests

```bash

\# Teste velocidade das APIs

curl -w "@curl-format.txt" -s -o /dev/null https://sua-app.vercel.app/api/prediag/diagnose



\# curl-format.txt:

\#      time\_namelookup:  %{time\_namelookup}\\n

\#         time\_connect:  %{time\_connect}\\n  

\#      time\_appconnect:  %{time\_appconnect}\\n

\#         time\_total:   %{time\_total}\\n



\# Alvo: < 2s para diagnose, < 5s para lead+email

```



---



\## 📊 PASSO 6: Monitoramento



\### 6.1 Dashboard Supabase

```bash

\# Métricas importantes:

\# 1. Table Editor: Ver dados chegando

\# 2. API Logs: Erros de queries

\# 3. Auth: Uso de RLS

\# 4. Database > Extensions: Ativar pg\_stat\_statements se necessário

```



\### 6.2 Dashboard Vercel  

```bash

\# Métricas importantes:

\# 1. Functions: Duração das APIs

\# 2. Analytics: Pageviews em /pre-diagnostico

\# 3. Speed Insights: Core Web Vitals

\# 4. Runtime Logs: Erros de servidor

```



\### 6.3 Dashboard Resend

```bash

\# Métricas importantes:  

\# 1. Emails: Delivery rate

\# 2. Analytics: Open/click rates

\# 3. Domains: Status DNS

\# 4. Logs: Bounces/complaints

```



---



\## 🚨 PASSO 7: Troubleshooting



\### 7.1 Problemas Comuns



\#### API retorna 500

```bash

\# 1. Verificar env vars no Vercel

\# 2. Verificar conexão Supabase (URL/Key corretos)  

\# 3. Ver logs: Vercel Dashboard > Functions > \[API Name]

\# 4. Testar queries direto no Supabase SQL Editor

```



\#### Emails não chegam

```bash  

\# 1. Verificar RESEND\_API\_KEY válida

\# 2. Verificar EMAIL\_FROM\_ADDRESS

\# 3. Se domínio custom: verificar DNS records

\# 4. Ver logs Resend Dashboard > Logs

\# 5. Verificar spam/promotions no Gmail

```



\#### Dados não salvam no banco

```bash

\# 1. Verificar RLS policies (podem estar bloqueando)

\# 2. Testar insert manual via Supabase SQL Editor  

\# 3. Verificar foreign key constraints

\# 4. Ver logs Supabase Dashboard > Logs

```



\### 7.2 Comandos Debug

```bash

\# Logs em tempo real (Vercel)

vercel logs https://sua-app.vercel.app --follow



\# Testar connection Supabase

npx supabase gen types typescript --project-id "xxxxxxxxxx"



\# Validar schema

npx supabase db diff --use-migra

```



---



\## 🔒 PASSO 8: Segurança



\### 8.1 Variáveis de Ambiente

```bash

\# ✅ Correto: Usar env vars do Vercel

RESEND\_API\_KEY=re\_xxxxx



\# ❌ Errado: Nunca commitir no git

const apiKey = "re\_xxxxxxxxxxxx"; // NUNCA!

```



\### 8.2 Rate Limiting (Futuro)

```typescript

// Implementar rate limiting por IP nas APIs

import rateLimit from 'express-rate-limit';



const limiter = rateLimit({

&nbsp; windowMs: 15 \* 60 \* 1000, // 15 min

&nbsp; max: 10, // 10 requests per IP

&nbsp; message: "Muitas tentativas. Tente novamente em 15 minutos."

});

```



\### 8.3 Validação de Entrada

```typescript

// Sanitizar inputs sempre

const email = body.email?.trim().toLowerCase();

const sessionId = body.sessionId?.match(/^\[0-9a-f-]{36}$/i) ? body.sessionId : null;

```



---



\## 📈 PASSO 9: Analytics (Opcional)



\### 9.1 Google Analytics

```typescript

// pages/\_app.tsx ou layout.tsx

import { GoogleAnalytics } from '@next/third-parties/google'



export default function App() {

&nbsp; return (

&nbsp;   <>

&nbsp;     <YourApp />

&nbsp;     <GoogleAnalytics gaId="GA\_MEASUREMENT\_ID" />

&nbsp;   </>

&nbsp; )

}

```



\### 9.2 Custom Analytics

```sql

-- View para métricas de negócio  

CREATE VIEW prediag\_metrics AS

SELECT 

&nbsp; DATE(created\_at) as date,

&nbsp; COUNT(\*) as total\_sessions,

&nbsp; COUNT(DISTINCT profile) as unique\_profiles,

&nbsp; ROUND(AVG(duration\_seconds)) as avg\_duration,

&nbsp; COUNT(\*) FILTER (WHERE mix\_distracao > 30) as high\_distraction

FROM roi\_prediag\_sessions

WHERE created\_at >= CURRENT\_DATE - INTERVAL '30 days'  

GROUP BY DATE(created\_at)

ORDER BY date DESC;

```



---



\## ✅ CHECKLIST FINAL



\### Pré-Deploy

```bash

✅ Código commitado no GitHub (main branch)

✅ Build local funcionando (npm run build)

✅ Testes manuais das APIs localmente

✅ Variáveis de ambiente mapeadas

```



\### Supabase

```bash

✅ Projeto criado (região São Paulo)

✅ 4 tabelas criadas (sessions, leads, events, analytics)

✅ Índices de performance aplicados

✅ RLS policies configuradas

✅ Triggers updated\_at funcionando

✅ Conexão testada via SQL Editor

```



\### Resend

```bash

✅ Conta criada e verificada

✅ API key gerada (re\_xxxxx)

✅ Domínio configurado (opcional)

✅ DNS records adicionados (se domínio custom)

✅ Teste de envio realizado via cURL

```



\### Vercel

```bash

✅ Repositório importado

✅ Deploy inicial executado

✅ 4 environment variables configuradas

✅ Redeploy realizado com env vars

✅ URLs funcionando (app + APIs)

```



\### Testes Produção

```bash

✅ /api/prediag/options retornando dados

✅ /api/prediag/diagnose processando corretamente

✅ /api/prediag/lead enviando emails

✅ /pre-diagnostico renderizando sem erros

✅ Fluxo completo testado end-to-end

✅ Dados salvando no Supabase

✅ Emails chegando no destinatário

```



\### Monitoramento

```bash

✅ Dashboard Supabase configurado

✅ Dashboard Vercel configurado  

✅ Dashboard Resend configurado

✅ Alertas configurados (opcional)

```



---



\## 🎯 PRÓXIMOS PASSOS (Fase 2)



\### Integração com Landing Page Principal

```bash

1\. Adicionar CTA na landing page → /pre-diagnostico

2\. Pixel de conversão Google Analytics/Facebook

3\. A/B test diferentes headlines/CTAs

4\. Popup exit-intent com link pré-diagnóstico

```



\### Otimizações de Conversão

```bash

1\. Implementar progress bar no ChatFlow

2\. Adicionar social proof (ex: "847 profissionais já fizeram")  

3\. Personalizar email subject por perfil profissional

4\. Sequência de follow-up emails (D+3, D+7, D+14)

```



\### Analytics Avançadas  

```bash

1\. Dashboard executivo com métricas de conversão

2\. Heatmaps na página /pre-diagnostico

3\. Análise de drop-off por etapa do fluxo

4\. Segmentação avançada por perfil/dor/objetivo

```



\### Automações Marketing

```bash

1\. Webhook Resend → Zapier → CRM

2\. Segmentação automática de leads por perfil

3\. Drip campaigns personalizadas  

4\. Integração com LinkedIn/Meta Ads

```



---



\## 🚨 SUPORTE E MANUTENÇÃO



\### Logs Para Monitorar

```bash

\# Vercel - Errors críticos

\- API timeouts (>30s)

\- 5xx errors em volumes altos

\- Memory usage spikes



\# Supabase - Performance

\- Slow queries (>2s)  

\- Connection pool exhaustion

\- Table locks/deadlocks



\# Resend - Deliverability

\- Bounce rate >5%

\- Complaint rate >0.1%

\- Domain reputation issues

```



\### Escalabilidade

```bash

\# Quando atingir 1000+ diagnósticos/dia:

1\. Implementar cache Redis nas APIs options

2\. Otimizar queries com EXPLAIN ANALYZE

3\. Considerar CDN para assets estáticos

4\. Rate limiting por IP/sessão

5\. Separar reads/writes no banco

```



\### Backup Strategy

```bash

\# Diário (automático via Supabase)

\- Point-in-time recovery habilitado

\- Retention: 7 dias (free tier)



\# Semanal (manual)

pg\_dump roi\_prediag\_sessions > backup\_sessions\_$(date).sql

pg\_dump roi\_leads > backup\_leads\_$(date).sql



\# Mensal (arquivamento)  

\- Export CSV via Dashboard

\- Armazenar no Google Drive/S3

```



---



\## 📞 CONTATOS DE EMERGÊNCIA



\### Serviços Críticos

```bash

Vercel Status: https://vercel-status.com

Supabase Status: https://status.supabase.com  

Resend Status: https://resend.com/status



\# Em caso de outage:

1\. Verificar status pages acima

2\. Verificar logs específicos

3\. Implementar fallback (offline page)

4\. Comunicar usuários via social media

```



\### Documentação Técnica

```bash

APIs: /docs/apis-prediagnostico.md

Página: /docs/pagina-prediagnostico.md  

Banco: /docs/tabelas-supabase.md

Deploy: /docs/deploy-configuracao.md (este arquivo)

```



\*\*Sistema Pré-Diagnóstico ROI do Foco - Documentação Completa v1.9.0\*\*

