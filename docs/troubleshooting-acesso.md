\# 🛠️ GUIA DE TROUBLESHOOTING - PROBLEMAS DE ACESSO



\## 📋 ÍNDICE

1\. \[Diagnóstico Inicial](#1-diagnóstico-inicial)

2\. \[Verificações por SQL](#2-verificações-por-sql)

3\. \[Problemas Comuns e Soluções](#3-problemas-comuns-e-soluções)

4\. \[Reset Completo de Usuário](#4-reset-completo-de-usuário)

5\. \[Problemas de Browser/Mobile](#5-problemas-de-browsermobile)

6\. \[Comandos de Monitoramento](#6-comandos-de-monitoramento)

7\. \[Prevenção e Manutenção](#7-prevenção-e-manutenção)



---



\## 1. DIAGNÓSTICO INICIAL



\### 🔍 \*\*PASSO 1: IDENTIFICAR O PROBLEMA\*\*



\*\*Perguntas para fazer ao usuário:\*\*

\- \[ ] Qual o email usado?

\- \[ ] Qual erro específico aparece?

\- \[ ] Em que navegador/dispositivo?

\- \[ ] Consegue acessar a landing page?

\- \[ ] Já confirmou o email de cadastro?



\### 🎯 \*\*PASSO 2: VERIFICAÇÃO BÁSICA\*\*



```sql

-- COMANDO 1: Verificar se usuário existe no auth

SELECT 

&nbsp;   id,

&nbsp;   email, 

&nbsp;   email\_confirmed\_at,

&nbsp;   created\_at,

&nbsp;   last\_sign\_in\_at

FROM auth.users 

WHERE email = 'EMAIL\_DO\_USUARIO@dominio.com';

```



\*\*Interpretação:\*\*

\- \*\*Sem resultado\*\* = Usuário nunca se cadastrou

\- \*\*email\_confirmed\_at = NULL\*\* = Email não confirmado

\- \*\*email\_confirmed\_at preenchido\*\* = Usuário válido



---



\## 2. VERIFICAÇÕES POR SQL



\### 📊 \*\*VERIFICAÇÃO COMPLETA DE USUÁRIO\*\*



```sql

-- COMANDO 2: Status completo do usuário

SELECT 

&nbsp; au.id as auth\_id,

&nbsp; au.email as auth\_email,

&nbsp; au.email\_confirmed\_at,

&nbsp; au.last\_sign\_in\_at,

&nbsp; u.id as usuarios\_id, 

&nbsp; u.email as usuarios\_email,

&nbsp; u.nome,

&nbsp; CASE 

&nbsp;   WHEN au.email IS NULL THEN '❌ Não registrado'

&nbsp;   WHEN au.email\_confirmed\_at IS NULL THEN '⏳ Email não confirmado'

&nbsp;   WHEN u.id IS NULL THEN '🚨 SEM ACESSO (falta registro usuarios)'

&nbsp;   ELSE '✅ Funcionando'

&nbsp; END as status\_geral

FROM auth.users au

FULL OUTER JOIN usuarios u ON au.id = u.id

WHERE au.email = 'EMAIL\_DO\_USUARIO@dominio.com' 

&nbsp;  OR u.email = 'EMAIL\_DO\_USUARIO@dominio.com';

```



\### 📋 \*\*VERIFICAÇÃO DE MÚLTIPLOS USUÁRIOS\*\*



```sql

-- COMANDO 3: Verificar lista completa de autorizados

WITH emails\_autorizados AS (

&nbsp; SELECT unnest(ARRAY\[

&nbsp;   'email1@dominio.com',

&nbsp;   'email2@dominio.com',

&nbsp;   'email3@dominio.com'

&nbsp;   -- Adicionar todos os emails da lista

&nbsp; ]) as email

)

SELECT 

&nbsp; ea.email as email\_autorizado,

&nbsp; CASE 

&nbsp;   WHEN au.email IS NOT NULL THEN '✅ Registrado' 

&nbsp;   ELSE '❌ Não registrado' 

&nbsp; END as status\_auth,

&nbsp; CASE 

&nbsp;   WHEN au.email\_confirmed\_at IS NOT NULL THEN '✅ Confirmado' 

&nbsp;   ELSE '❌ Não confirmado' 

&nbsp; END as status\_confirmacao,

&nbsp; CASE 

&nbsp;   WHEN u.email IS NOT NULL THEN '✅ Tem acesso' 

&nbsp;   ELSE '❌ SEM ACESSO' 

&nbsp; END as status\_sistema,

&nbsp; au.last\_sign\_in\_at as ultimo\_login

FROM emails\_autorizados ea

LEFT JOIN auth.users au ON ea.email = au.email

LEFT JOIN usuarios u ON au.id = u.id

ORDER BY 

&nbsp; CASE WHEN u.email IS NULL THEN 0 ELSE 1 END,

&nbsp; ea.email;

```



\### 🔍 \*\*VERIFICAÇÃO DE RLS\*\*



```sql

-- COMANDO 4: Verificar se RLS está ativo

SELECT 

&nbsp;   schemaname, 

&nbsp;   tablename, 

&nbsp;   rowsecurity as rls\_enabled,

&nbsp;   CASE WHEN rowsecurity THEN '✅ Protegida' ELSE '❌ VULNERÁVEL' END as status

FROM pg\_tables 

WHERE schemaname = 'public'

ORDER BY tablename;

```



---



\## 3. PROBLEMAS COMUNS E SOLUÇÕES



\### 🚨 \*\*PROBLEMA A: "❌ SEM ACESSO" (Dessincronia)\*\*



\*\*Sintomas:\*\*

\- Usuário existe em `auth.users`

\- Email confirmado

\- MAS não existe em tabela `usuarios`



\*\*Solução:\*\*

```sql

-- CORREÇÃO: Criar registro na tabela usuarios

INSERT INTO usuarios (id, email, nome, created\_at)

VALUES (

&nbsp;   'ID\_DO\_AUTH\_USERS',  -- Copiar da consulta anterior

&nbsp;   'email@dominio.com',

&nbsp;   'Usuário',

&nbsp;   NOW()

);

```



\*\*Verificação:\*\*

```sql

-- Confirmar correção

SELECT id, email, nome, created\_at 

FROM usuarios 

WHERE email = 'email@dominio.com';

```



\### ⏳ \*\*PROBLEMA B: Email Não Confirmado\*\*



\*\*Sintomas:\*\*

\- `email\_confirmed\_at = NULL`

\- Usuário não clicou no link do email



\*\*Soluções:\*\*

1\. \*\*Pedir para verificar spam/lixo eletrônico\*\*

2\. \*\*Reenviar email de confirmação\*\* (via Supabase Dashboard)

3\. \*\*Confirmar manualmente\*\* (SQL):



```sql

-- CORREÇÃO: Confirmar email manualmente (emergencial)

UPDATE auth.users 

SET email\_confirmed\_at = NOW()

WHERE email = 'email@dominio.com';

```



\### 📧 \*\*PROBLEMA C: Email Não Autorizado\*\*



\*\*Sintomas:\*\*

\- Erro: "Email não está na lista de autorizados"



\*\*Verificação:\*\*

```cmd

\# Verificar arquivo local

notepad public\\emails-autorizados.txt

```



\*\*Correção:\*\*

```cmd

\# Adicionar email no formato correto

email@dominio.com,31/12/2025



\# Fazer commit

git add .

git commit -m "feat: adicionar novo email autorizado"

git push

```



\### 🌐 \*\*PROBLEMA D: RLS Bloqueando Acesso\*\*



\*\*Sintomas:\*\*

\- Usuário loga mas não vê dados

\- Página em branco após login



\*\*Verificação:\*\*

```sql

-- Verificar se política RLS funciona

SET request.jwt.claims TO '{"sub": "ID\_DO\_USUARIO"}';

SELECT id, email, nome FROM usuarios WHERE auth.uid() = id;

```



\*\*Correção:\*\*

```sql

-- Recriar política se necessário

DROP POLICY IF EXISTS "usuarios\_policy" ON public.usuarios;

CREATE POLICY "usuarios\_policy" ON public.usuarios

FOR ALL USING (auth.uid() = id);

```



---



\## 4. RESET COMPLETO DE USUÁRIO



\### 🔄 \*\*QUANDO USAR:\*\*

\- Problemas persistentes inexplicáveis

\- Corrupção de dados/sessão

\- Múltiplas tentativas falharam



\### 📋 \*\*PROCESSO COMPLETO:\*\*



```sql

-- PASSO 1: Backup dos dados (opcional)

SELECT \* FROM usuarios WHERE email = 'email@dominio.com';

SELECT \* FROM atividades WHERE user\_id = (

&nbsp; SELECT id FROM usuarios WHERE email = 'email@dominio.com'

);



-- PASSO 2: Remover da tabela usuarios

DELETE FROM usuarios 

WHERE email = 'email@dominio.com';



-- PASSO 3: Remover do auth

DELETE FROM auth.users 

WHERE email = 'email@dominio.com';



-- PASSO 4: Verificar limpeza

SELECT 'auth.users' as tabela, email FROM auth.users WHERE email = 'email@dominio.com'

UNION ALL

SELECT 'usuarios' as tabela, email FROM usuarios WHERE email = 'email@dominio.com';

```



\### 📧 \*\*ORIENTAÇÃO PARA O USUÁRIO:\*\*

```

Reset completo realizado! Agora faça um cadastro fresh:



1\. Acesse: https://conversas-no-corredor.vercel.app

2\. Clique "Criar Conta" (não "Entrar")

3\. Use: seu@email.com + senha nova

4\. Confirme no email que vai chegar

5\. Faça login normalmente



Qualquer problema, me avise!

```



---



\## 5. PROBLEMAS DE BROWSER/MOBILE



\### 🍎 \*\*SAFARI NO IPHONE (PROBLEMA CONHECIDO)\*\*



\*\*Sintomas:\*\*

\- Funciona no desktop, falha no iPhone

\- Safari específico com problemas



\*\*Soluções por prioridade:\*\*



1\. \*\*Chrome para iOS:\*\*

&nbsp;  ```

&nbsp;  App Store → Buscar "Chrome" → Instalar

&nbsp;  Chrome → https://conversas-no-corredor.vercel.app

&nbsp;  ```



2\. \*\*Configurações Safari:\*\*

&nbsp;  ```

&nbsp;  Configurações → Safari →

&nbsp;  - Bloquear todos os cookies: DESLIGAR

&nbsp;  - Impedir rastreamento: DESLIGAR

&nbsp;  - Limpar histórico e dados: CONFIRMAR

&nbsp;  ```



3\. \*\*Modo Desktop:\*\*

&nbsp;  ```

&nbsp;  Safari → AA (canto superior) → 

&nbsp;  "Solicitar site para desktop"

&nbsp;  ```



\### 🧹 \*\*LIMPEZA DE CACHE (TODOS OS BROWSERS)\*\*



\*\*Chrome/Edge:\*\*

```

Ctrl + Shift + Delete →

Marcar: Cookies, Cache, Dados de site →

Período: Todo o tempo →

Limpar dados

```



\*\*Firefox:\*\*

```

Ctrl + Shift + Delete →

Marcar: Cookies, Cache →

Período: Tudo →

Limpar agora

```



\*\*Safari:\*\*

```

Configurações → Safari →

Limpar histórico e dados do site →

Limpar histórico e dados

```



---

## 6. PROBLEMAS ESPECÍFICOS ANDROID/RLS

### 🤖 **PROBLEMA D: ANDROID REDIRECT PARA LANDING PAGE (RESOLVIDO v1.9.3)**

**Sintomas:**
- Página `/pre-diagnostico` carrega mas redireciona em <1 segundo
- Funciona no iPhone/Desktop, falha no Android
- Usuário não consegue acessar pré-diagnóstico

**Causa Raiz:**
Sistema de autenticação no `layout.tsx` redirecionava usuários não autenticados

**Solução Aplicada:**
```typescript
// ANTES (problema):
if (!session?.user && pathname !== '/auth' && pathname !== '/') {
  router.push('/')
}

// DEPOIS (corrigido):
if (!session?.user && pathname !== '/auth' && pathname !== '/' && pathname !== '/pre-diagnostico') {
  router.push('/')
}
Status: ✅ Resolvido na versão v1.9.3

📧 PROBLEMA E: EMAIL NÃO ENVIADO - RLS BLOQUEANDO (RESOLVIDO v1.9.3)
Sintomas:

API /api/prediag/lead retorna erro 500
Console mostra: Error 42501: new row violates row-level security policy
Pré-diagnóstico funciona mas email não é enviado

Causa Raiz:
Políticas RLS muito restritivas impediam inserções das APIs públicas na tabela roi_leads
Solução Aplicada:
sql-- Remover políticas restritivas
DROP POLICY IF EXISTS "roi_leads_insert_policy" ON public.roi_leads;

-- Criar política permissiva para APIs públicas
CREATE POLICY "roi_leads_allow_all" ON public.roi_leads
FOR ALL
USING (true)
WITH CHECK (true);
Status: ✅ Resolvido na versão v1.9.3

**E RENUMERAR as seções seguintes:**
- "6. Comandos de Monitoramento" vira "7. Comandos de Monitoramento"  
- "7. Prevenção e Manutenção" vira "8. Prevenção e Manutenção"

Esses são os únicos acréscimos necessários para documentar os problemas críticos que resolvemos nesta sessão.

\## 7. COMANDOS DE MONITORAMENTO



\### 📊 \*\*DASHBOARD DE USUÁRIOS\*\*



```sql

-- Resumo geral de usuários

SELECT 

&nbsp; COUNT(\*) as total\_auth\_users,

&nbsp; COUNT(CASE WHEN email\_confirmed\_at IS NOT NULL THEN 1 END) as confirmados,

&nbsp; COUNT(CASE WHEN last\_sign\_in\_at > NOW() - INTERVAL '7 days' THEN 1 END) as ativos\_7\_dias,

&nbsp; COUNT(CASE WHEN last\_sign\_in\_at > NOW() - INTERVAL '30 days' THEN 1 END) as ativos\_30\_dias

FROM auth.users;

```



\### 📈 \*\*MÉTRICAS DE ACESSO\*\*



```sql

-- Usuários mais ativos

SELECT 

&nbsp; email,

&nbsp; last\_sign\_in\_at,

&nbsp; created\_at,

&nbsp; EXTRACT(DAY FROM NOW() - last\_sign\_in\_at) as dias\_sem\_acesso

FROM auth.users 

WHERE email\_confirmed\_at IS NOT NULL

ORDER BY last\_sign\_in\_at DESC NULLS LAST;

```



\### 🔍 \*\*DETECÇÃO DE PROBLEMAS\*\*



```sql

-- Usuários com potenciais problemas

SELECT 

&nbsp; au.email,

&nbsp; au.created\_at,

&nbsp; au.email\_confirmed\_at,

&nbsp; au.last\_sign\_in\_at,

&nbsp; CASE 

&nbsp;   WHEN au.email\_confirmed\_at IS NULL THEN 'Email não confirmado'

&nbsp;   WHEN u.id IS NULL THEN 'Falta registro em usuarios'

&nbsp;   WHEN au.last\_sign\_in\_at < NOW() - INTERVAL '30 days' THEN 'Inativo há 30+ dias'

&nbsp;   ELSE 'OK'

&nbsp; END as status\_problema

FROM auth.users au

LEFT JOIN usuarios u ON au.id = u.id

WHERE au.email\_confirmed\_at IS NULL 

&nbsp;  OR u.id IS NULL 

&nbsp;  OR au.last\_sign\_in\_at < NOW() - INTERVAL '30 days'

ORDER BY au.created\_at DESC;

```



---



\## 8. PREVENÇÃO E MANUTENÇÃO



\### 🛡️ \*\*CHECKLIST SEMANAL\*\*



\- \[ ] Verificar alertas de segurança no Supabase

\- \[ ] Monitorar novos cadastros vs acessos

\- \[ ] Verificar se RLS está ativo em todas as tabelas

\- \[ ] Backup da lista de emails autorizados



\### 📋 \*\*COMANDO DE VERIFICAÇÃO COMPLETA\*\*



```sql

-- Relatório completo de saúde do sistema

WITH stats AS (

&nbsp; SELECT 

&nbsp;   COUNT(\*) as total\_auth,

&nbsp;   COUNT(CASE WHEN email\_confirmed\_at IS NOT NULL THEN 1 END) as confirmados,

&nbsp;   COUNT(CASE WHEN u.id IS NOT NULL THEN 1 END) as com\_acesso

&nbsp; FROM auth.users au

&nbsp; LEFT JOIN usuarios u ON au.id = u.id

),

rls\_status AS (

&nbsp; SELECT 

&nbsp;   COUNT(\*) as total\_tables,

&nbsp;   COUNT(CASE WHEN rowsecurity THEN 1 END) as protected\_tables

&nbsp; FROM pg\_tables 

&nbsp; WHERE schemaname = 'public'

)

SELECT 

&nbsp; 'Usuários registrados' as metrica, s.total\_auth::text as valor

FROM stats s

UNION ALL

SELECT 'Emails confirmados', s.confirmados::text FROM stats s

UNION ALL

SELECT 'Com acesso completo', s.com\_acesso::text FROM stats s

UNION ALL

SELECT 'Tabelas protegidas', r.protected\_tables || '/' || r.total\_tables FROM rls\_status r

UNION ALL

SELECT 'Status RLS', CASE WHEN r.protected\_tables = r.total\_tables THEN '✅ OK' ELSE '❌ PROBLEMA' END FROM rls\_status r;

```



\### 🔄 \*\*ROTINA DE CORREÇÃO AUTOMÁTICA\*\*



```sql

-- Corrigir automaticamente usuários confirmados sem acesso

INSERT INTO usuarios (id, email, nome, created\_at)

SELECT 

&nbsp; au.id,

&nbsp; au.email,

&nbsp; 'Usuário',

&nbsp; NOW()

FROM auth.users au

LEFT JOIN usuarios u ON au.id = u.id

WHERE au.email\_confirmed\_at IS NOT NULL  -- Email confirmado

&nbsp; AND u.id IS NULL                       -- Mas sem registro em usuarios

&nbsp; AND au.email LIKE '%@%';              -- Email válido básico

```



---



\## 📞 PROCESSO DE SUPORTE



\### 🎯 \*\*FLUXO RECOMENDADO:\*\*



1\. \*\*Coleta de informações\*\* (email, erro, browser)

2\. \*\*Diagnóstico SQL\*\* (comando 2 - status completo)

3\. \*\*Aplicar correção específica\*\* (baseada no problema identificado)

4\. \*\*Verificar correção\*\* (comando de confirmação)

5\. \*\*Orientar usuário\*\* (passos para testar)

6\. \*\*Monitorar resultado\*\* (acompanhar se funcionou)



\### 📧 \*\*TEMPLATES DE RESPOSTA:\*\*



\*\*Problema resolvido:\*\*

```

Oi! Identifiquei e corrigi o problema técnico.

Agora tente acessar novamente: \[URL]

Qualquer dificuldade, me avise!

```



\*\*Reset necessário:\*\*

```

Vou fazer um reset completo da sua conta.

Depois siga estes passos: \[instruções]

Deve funcionar perfeitamente agora!

```



\*\*Problema de browser:\*\*

```

Identifiquei que é problema do Safari no iPhone.

Instale o Chrome e tente pelo Chrome.

É um problema conhecido que afeta vários sites.

```



---



📅 \*\*Documento criado:\*\* 20 de agosto de 2025  

🔧 \*\*Versão:\*\* 1.0 - Guia Completo de Troubleshooting  

🎯 \*\*Status:\*\* Pronto para uso em produção

