# 🎯 +Conversas no Corredor

** Sistema completo para mapear, diagnosticar e otimizar seu foco profissional | PWA instalável em desktop e mobile**

[![Deploy](https://img.shields.io/badge/deploy-vercel-black?logo=vercel)](https://conversas-no-corredor.vercel.app)
[![Versão](https://img.shields.io/badge/version-3.5.0-nlue.svg)](docs/CURRENT-STATUS.md)
[![Status](https://img.shields.io/badge/status-✅%20operacional-green)](docs/CURRENT-STATUS.md)

## 🚀 Quick Start

```bash
# Clonar repositório
git clone https://github.com/AdilMtl/mapa-atividades.git
cd mapa-atividades

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Configurar Supabase URLs + Resend API no .env.local

# Executar em desenvolvimento
npm run dev
```
---
**Acesso:** http://localhost:3000

## 📊 Sistema Completo

### ✅ Funcionalidades Principais
- **📱 Landing Page Mobile-First** - Copy persuasivo + hero otimizado + progressive loading (**v3.4.0**) 
- **🎬 Landing Page Interativa** - 4 vídeos com scroll-trigger automático (**v3.0.0**)
- **💼 Ecossistema Completo** - Newsletter + Plataforma integradas (**v3.0.0**)
- **🎯 Pré-Diagnóstico Educativo** - Interface progressiva com contexto sobre metodologia (**v1.9.5**)
- **🎯 Landing Page Integrada** - CTAs de pré-diagnóstico na página principal (**v1.9.2**)
- **🎯 Pré-Diagnóstico** - Captura nome + recomendações personalizadas (**v1.9.1**)
- **🗺️ Mapa de Atividades** - Matriz Impacto × Clareza (4 zonas)
- **📊 Diagnóstico Automático** - Análise ROI do Foco com relatórios personalizados
- **📋 Plano de Ação Redesenhado** - Interface otimizada com dashboard de estatísticas e controles centralizados (**v1.9.6**)
- **📧 Email Marketing** - Templates profissionais via Resend (**v1.9.0**)
- **📄 Export Profissional** - PDF otimizado + cópia de texto
- **👤 Perfil Completo** - Configurações pessoais + compliance LGPD
- **🔐 Autenticação Segura** - RLS (Row Level Security) + emails autorizados
- **🔒 Sistema de Segurança** - Autorização server-side + admin dashboard (**v3.2.0**)
- **🎥 Vídeos Otimizados** - Redução de 96% no tamanho (200MB → 8MB) (**v3.3.0**)
- **🔐 Reset de Senha Funcional** - SMTP Resend + detecção de sessão ativa (**v3.3.0**)
**🔧 Admin Assinantes Otimizado** - Função SQL customizada para contornar bug do Supabase (**v3.4.3**)
- **📱 PWA Instalável** - App nativo para desktop e mobile, com Service Worker e ajuste de icones (**v3.5.0**)

### **Páginas Funcionais:**
✅ Landing Page Principal (/)           # Apresentação + 2 CTAs pré-diagnósSistema de Segurançatico
✅ Pré-Diagnóstico (/pre-diagnostico)   # Funcionando universalmente
✅ Autenticação (/auth)                 # Login/cadastro com verificação v3.2.0
✅ Dashboard (/dashboard)               # Mapa mobile-first responsivo v3.1.0
✅ Diagnóstico (/diagnostico)           # Análise automática + relatórios
✅ Plano de Ação (/plano-acao)          # Framework DAR CERTO + IA V2.1
✅ Perfil (/perfil)                     # Configurações + LGPD
✅ Admin Assinantes (/admin/assinantes) # Dashboard gestão + workaround SQL v3.4.3
✅ Painel Semanal (/painel-semanal)     # Kanban visual drag & drop v2.0.0
✅ Reset de Senha (/reset-password)     # SMTP Resend + detecção sessão v3.3.0

### 🛠️ Stack Tecnológica
- **Frontend:** Next.js 15.5.3 + TypeScript + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **Email:** Supabase Email Service com templates HTML customizados (**v3.3.1**)
- **Mobile-First:** Copy otimizado + progressive loading vídeos (**v3.4.0**) 
- **Segurança:** Service Role Key + Validação Server-Side (**v3.2.0**)
- **Deploy:** Vercel (automático via Git)
- **Metodologia:** ROI do Foco + Framework DAR CERTO
- **Drag & Drop:** @hello-pangea/dnd para Kanban visual
- **Admin:** Dashboard com filtros e métricas (**v3.2.0**)
- **Otimização:** FFmpeg para compressão de vídeos (**v3.3.0**)
- **PWA:** next-pwa 5.6.0 (Service Worker + Workbox)

## 🌊 Fluxo do Usuário

### 🎯 Fluxo Completo v3.2.0

1. **Landing Page Mobile-First** → Hero otimizado + copy persuasivo + sticky CTA 
2. **Ecossistema Virtual** → Apresentação completa +Conversas no Corredor
3. **Pré-Diagnóstico** → Sistema de leads com nome + 5 etapas + email
4. **Autorização Segura** → Verificação server-side no cadastro (**v3.2.0**)
5. **Verificação Login** → Check de expiração antes de permitir acesso (**v3.2.0**)
6. **Dashboard** → Mapeamento mobile-first na matriz Impacto × Clareza
7. **Diagnóstico** → Análise automática + relatório personalizado
8. **Plano de Ação** → Interface redesenhada com dashboard e controles
9. **Fluxo Semanal** → Kanban visual para execução de táticas
10. **Admin Dashboard** → Gestão completa de assinantes (admin only) (**v3.2.0**)

### 🔒 Fluxo de Segurança v3.2.0

**Para Usuários:**
- Cadastro → Verifica autorização no banco → Verifica se conta existe → Cria conta
- Login → Verifica expiração → Permite ou bloqueia acesso
- Uso → Todas as funcionalidades disponíveis até data de expiração

**Para Admin:**
- Login com email autorizado → Acesso ao `/admin/assinantes`
- Dashboard completo → Adicionar, editar, remover assinantes
- Métricas → Visualizar último acesso, status, atividades
- Filtros → Buscar e filtrar por múltiplos critérios


## 📂 Estrutura do Projeto

```
src/
├── app/
│   ├── page.tsx                             # Landing mobile-first otimizada (v3.4.0)
│   ├── pre-diagnostico/page.tsx             # Pré-diagnóstico conversacional
│   ├── api/
│   │   ├── prediag/                          # APIs do pré-diagnóstico
│   │   │   ├── diagnose/route.ts             # POST - Processar diagnóstico
│   │   │   ├── lead/route.ts                 # POST - Capturar nome + email + enviar
│   │   │   ├── options/route.ts              # GET - Opções por perfil
│   │   │   ├── email-template.ts             # Helper - Template HTML profissional
│   │   │   └── recommendations.ts            # Helper - Heurística 450+ sugestões
│   │   ├── auth/                             # 🆕 v3.2.0 - APIs de segurança
│   │   │   ├── check-authorization/route.ts  # Verificar autorização segura
│   │   │   ├── check-existing/route.ts       # Verificar conta existente
│   │   │   └── check-expiration/route.ts     # Validar expiração no login
│   │   └── admin/                            # 🆕 v3.2.0 - APIs administrativas
│   │       └── assinantes/route.ts           # CRUD completo de assinantes
│   ├── admin/                                # 🆕 v3.2.0 - Área administrativa
│   │   └── assinantes/page.tsx               # Dashboard de gestão de assinantes
│   ├── painel-semanal/                       # v2.0.0 - Kanban visual
│   │   ├── page.tsx                          # Wrapper da página
│   │   └── components/
│   │       └── KanbanPage.tsx                # Componente principal com drag & drop
│   ├── auth/page.tsx                         # Autenticação com verificação v3.2.0
│   ├── dashboard/page.tsx                   # Mapa de atividades mobile-first v3.1.0
│   ├── diagnostico/page.tsx                 # Análise do foco
│   ├── plano-acao/page.tsx                  # Framework DAR CERTO
│   ├── perfil/page.tsx                      # Configurações
│   ├── privacidade/page.tsx                 # LGPD compliance
│   └── reset-password/page.tsx              # Reset de senha
├── components/
│   ├── base/                                # 8 componentes reutilizáveis
│   ├── mapa/                                # Componentes do mapa + mobile v3.1.0
│   ├── prediagnostico/                      # EmailGate com campo nome
│   └── plano/                               # 7 componentes do plano
├── lib/
│   ├── diagnostico-engine.ts                # Motor de análise
│   ├── heuristica-engine.ts                 # IA V2.1 para táticas
│   ├── design-system.ts                     # Tokens centralizados
│   ├── supabase.ts                          # Configuração do banco
│   ├── email-validator.ts                   # 🆕 v3.2.0 - Validação segura
│   └── kanban/                              # v2.0.0 - Funções específicas
│       └── database.ts                      # Integração Supabase para Kanban
└── public/
     └── videos/                                  # 4 vídeos de demonstração (v3.0.0)
          ├── mapeamento.mp4
          ├── diagnostico.mp4
          ├── taticas.mp4
          └── kanban.mp4
```


### 📋 **Documentação Principal**

- **📊 [CURRENT-STATUS.md](docs/CURRENT-STATUS.md)** - Status v3.4.0 com landing mobile-first 
- **📅 [CHANGELOG.md](docs/CHANGELOG.md)** - Histórico completo até v3.4.0 
- **🔒 [admin-dashboard.md](docs/admin-dashboard.md)** - Guia completo do admin 
- **🛡️ [seguranca-lgpd.md](docs/seguranca-lgpd.md)** - Proteção de dados 
- **🔧 [troubleshooting-acesso.md](docs/troubleshooting-acesso.md)** - Debug e soluções
 **🔧 [troubleshooting-admin-assinantes.md](docs/troubleshooting-admin-assinantes.md)** - Debug admin dashboard 

### 📖 **Documentação Técnica v3.2.0**
docs/
├── landing-page-mobile.md           # Guia mobile-first optimization
├── api-prediagnostico.md            # Especificação completa das 3 APIs
├── api-seguranca.md                 # APIs de autorização e verificação
├── admin-dashboard.md               # Guia do sistema administrativo
├── pagina-prediagnostico.md         # Interface conversacional + UX
├── tabelas-supabase.md              # Schema das tabelas + RLS atualizado
├── seguranca-lgpd.md                # Compliance e proteção de dados
├── deploy-configuracao.md           # Guia Vercel + Supabase + Resend
└── troubleshooting-acesso.md        # Soluções para problemas comuns```
```

### 📖 **Versões Detalhadas**
docs/versions/
├── v3.4.0-landing-mobile-first.md         # Landing mobile optimization - 01/10/2025
├── v3.3.1-signup-correcao-critica.md      # Correção signup + doc banco - 29/09/2025
├── v3.3.0-videos-reset-senha.md           # Otimização vídeos + reset - 24/09/2025
├── v3.2.0-seguranca-admin.md          # Sistema seguro + admin dashboard - 19/09/2025 🆕
├── v3.1.0-mobile-first-redesign.md    # Redesign mobile do mapa - 19/09/2025 🆕
├── v3.0.0-landing-videos.md           # Landing page com vídeos - 17/09/2025 🆕
├── v2.0.0-kanban-visual.md            # Kanban visual completo - 13/09/2025
├── v1.9.8-sincronizacao-supabase.md   # Sincronização + notificações - 12/09/2025
├── v1.9.7-google-ads-tracking.md      # Conversion tracking - 09/09/2025
├── v1.9.6-plano-acao-redesign.md      # UX redesign plano - 08/09/2025
├── v1.9.5-ux-prediagnostico.md        # Melhorias pré-diagnóstico - 07/09/2025
├── v1.9.4-google-ads-setup.md         # Setup inicial Google Ads - 01/09/2025
├── v1.9.3-correcoes-android.md        # Correções Android + RLS - 27/08/2025
├── v1.9.2-landing-integrada.md        # Landing page integrada - 27/08/2025
├── v1.9.1-campo-nome.md               # Campo nome + personalização - 27/08/2025
├── v1.9.0-prediagnostico-completo.md  # Sistema pré-diagnóstico - 27/08/2025
├── v1.8.3-diagnostico-premium.md      # Export otimizado - 22/08/2025
├── v1.8.2-fluxo-padronizado.md        # ROI do Foco + nome real - 20/08/2025
├── v1.8.1-heuristica-refinada.md      # IA V2.1 + Framework - 18/08/2025
├── v1.8.0-framework-dar-certo.md      # Framework DAR CERTO - 15/08/2025
├── v1.7.0-diagnostico-automatico.md   # Motor de análise - 12/08/2025
├── v1.6.0-layout-otimizado.md         # Layout + UX consistente - 10/08/2025
├── v1.5.0-perfil-lgpd.md              # Perfil completo + LGPD - 08/08/2025
├── v1.4.0-wave1-modular.md            # Design system modular - 05/08/2025
├── v1.3.0-sistema-diagnostico.md      # Sistema diagnóstico - 02/08/2025
├── v1.2.0-mapa-atividades.md          # Mapa core - 30/07/2025
├── v1.1.0-autenticacao.md             # Auth + banco - 25/07/2025
└── v1.0.0-mvp-inicial.md              # MVP inicial - 20/07/2025
```

### 🔄 **Workflow de Desenvolvimento**
**Para desenvolvedores:** Este projeto usa um sistema modular de documentação. 

**ANTES de qualquer modificação:**
1. Consultar `docs/CURRENT-STATUS.md` para ver status atual
2. Verificar `docs/CHANGELOG.md` para entender histórico

**DEPOIS de terminar modificações:**
1. Atualizar seção "Última Sessão" do `CURRENT-STATUS.md`
2. Adicionar entrada no `CHANGELOG.md` se necessário
3. Se breaking changes, criar arquivo em `docs/versions/`

**Template para Claude:**
```
Claude, terminei modificações:
- [Listar mudanças]
- [Arquivos alterados] 
- [Impacto: Alto/Médio/Baixo]

Atualizar documentação com comandos Windows.
```

> 💡 **Dica:** Mantenha um documento no Obsidian com estes templates para agilizar o processo!

## 🎯 Versão Atual: v3.4.3 - Admin Assinantes Corrigido

**Foco da Sessão (14/10/2025):** Correção bug Supabase listUsers()
**Sessão Anterior (13/10/2025):** Correção Security Definer Views

### ✅ Admin Assinantes Funcionando:
- **🔧 Bug Crítico Resolvido** - Todos apareciam como "Sem conta" 
- **🔍 Causa Raiz** - Bug do Supabase `auth.admin.listUsers()` com NULL em `confirmation_token`
- **✅ Solução** - Função SQL `public.admin_list_users()` com SECURITY DEFINER
- **📊 Status** - CRUD 100% funcional, dados corretos

### ✅ Função SQL Criada:
- **public.admin_list_users()** - Acessa `auth.users` diretamente via SQL
- **Performance** - ~30% mais rápido que API HTTP
- **Confiabilidade** - Workaround definitivo para bug do Supabase

### ✅ Documentação Criada:
- **📖 troubleshooting-admin-assinantes.md** - Debug completo documentado
- **📊 supabase-database-schema.md** - Função SQL adicionada
- **📋 CHANGELOG.md** - Entrada v3.4.3 detalhada

---

## 🎯 Versão Anterior: v3.4.2 - Correção Security Definer Views

**Foco da Sessão (13/10/2025):** Views Analytics com security_invoker
**Sessão Anterior (02/10/2025):** Views Analytics série histórica completa

### ✅ Security Advisor Zero Warnings:
- **🔐 Views Corrigidas** - 7 views analytics com `security_invoker = true`
- **🎯 Causa Raiz** - Views com owner 'postgres' executavam como SECURITY DEFINER
- **✅ Solução** - DROP + CREATE com `WITH (security_invoker = true)`
- **📊 Impacto** - Zero breaking changes, Grafana funciona normalmente

---

### 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev          # Servidor local
npm run build        # Build de produção
npm run lint         # Verificar código
# Testar PWA (Service Worker ativo)
npm run build
npm run start        # PWA funciona apenas em produção
`````

---

# Deploy
git add .
git commit -m "feat: Google Ads conversion tracking v1.9.7"
git push             # Deploy automático Vercel

## 🎯 Versão Anterior: v1.9.6 - Plano de Ação UX Redesign

**Foco da Sessão (08/09/2025):** Redesign completo da página Plano de Ação
### ✅ Plano de Ação Redesenhado
- **📊 Dashboard Visual** - Contadores de atividades, táticas, tarefas e hábitos
- **🎛️ Controles Centralizados** - Abas e filtros organizados e responsivos
- **📱 Mobile-First** - Layout otimizado para smartphone com UX nativa
- **🎨 Design Consistente** - Ícones e cores padronizados em toda a página
- **⚙️ Filtros Inteligentes** - Seções colapsáveis com animações suaves

### 🚀 Experiência Otimizada
Página Plano de Ação → Interface limpa e organizada → 
Filtros contextuais → Dashboard de progresso → Ações unificadas

### 📊 Melhorias de UX
- **Hierarquia Clara:** Estatísticas → Filtros → Conteúdo → Ações
- **Responsividade Total:** Mobile, tablet e desktop otimizados
- **Feedback Visual:** Estados de loading, hover e interação
- **Prevenção de Erros:** Validações antes de ações críticas

### 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev          # Servidor local
npm run build        # Build de produção
npm run lint         # Verificar código

# Deploy
git add .
git commit -m "feat: plano de ação UX redesign v1.9.6"
git push             # Deploy automático Vercel

## 🎯 Versão Anterior: v1.9.5 - Melhorias na página pré-diagnóstico

**Foco da Sessão (01/09/2025):** Configuração inicial Google Ads sem modificação de código
**Sessão Anterior (27/08/2025):** Correções críticas Android + RLS

### ✅ Google Ads Configurado
- **🎯 2 Campanhas Ativas** - Analistas (R$ 15/dia) + Gestores (R$ 20/dia)  
- **📊 Monitoramento Simples** - Google Ads dashboard + Grafana atual
- **🎯 Targeting Focado** - Palavras-chave de produtividade profissional
- **📈 Sem Modificações** - Sistema atual suporta tracking via roi_leads

### 🚀 Aquisição Paga Iniciada
Google Ads → /pre-diagnostico → Sistema atual (nome+email) →
Dashboard Grafana mostra conversões via roi_leads

### 📊 Abordagem Conservadora
- **Monitoramento:** Google Ads nativo + Dashboard Grafana existente
- **Dados:** roi_leads Supabase captura conversões automaticamente
- **Decisão Futura:** Avaliar UTM/tracking avançado após 2-3 semanas

## Versões anteriores a seguir

## 🎯 Versão Anterior: v1.9.3 - Correções Android + RLS

**Foco da Sessão (27/08/2025 - Tarde):** Integração landing page + refinamentos UX
**Sessão Anterior (27/08/2025 - Noite):** Correções críticas Android + RLS

### ✅ Problemas Críticos Resolvidos
- **🤖 Android Compatibility** - Sistema funcionando universalmente em iPhone + Android + Desktop
- **📧 Email Delivery** - RLS balanceado permitindo APIs públicas sem comprometer segurança
- **🔧 Auth System** - Exceções adequadas para páginas públicas como `/pre-diagnostico`

### 🔧 Status Atual
- **✅ Universal Compatibility** - Testado e funcionando em todas as plataformas
- **✅ Email System** - 100% delivery rate com RLS ativo
- **✅ Zero Critical Issues** - Nenhum problema bloqueante identificado

### ✅ Implementado Nesta Versão
- **🎯 2 CTAs Estratégicos** - Pré-diagnóstico integrado na landing page principal
- **📝 Textos Tangíveis** - "30-60 minutos por dia" baseados na teoria ROI do Foco
- **🎨 UX Refinado** - Espaçamentos otimizados e alinhamentos corrigidos
- **🔧 Scroll Anchoring** - Accordions com comportamento suave e previsível

### 🚀 Funnel de Conversão Completo
```typescript
// Fluxo integrado implementado:
Landing Page → [Hero CTA] ou [ROI Section CTA] → Pré-Diagnóstico (5 etapas) → 
EmailGate (nome + email) → Recomendações por email → Newsletter ou Sistema Completo

// CTAs implementados:
Hero: "Identifique onde você está perdendo tempo e receba até 3 ações específicas 
       para ganhar 30-60 minutos por dia na sua agenda"
ROI:  "Faça um diagnóstico rápido e descubra onde investir seu tempo para 
       gerar mais resultado com menos esforço"


### 🗄️ Banco de Dados Expandido (v1.9.1)
```sql
-- 3 TABELAS IMPLEMENTADAS:
roi_prediag_sessions  # Dados completos do diagnóstico
  - profile, agenda, pain, top_activity, goal (inputs usuário)
  - mix_essencial, mix_estrategico, mix_tatico, mix_distracao (outputs %)
  - insight_hash, ip_address, user_agent, duration_seconds (metadados)

roi_leads            # Leads capturados para marketing
  - name, email, source, last_session_id (identificação)
  - profile_segment, pain_segment (segmentação)  
  - email_sent, email_opened, subscribed (engajamento)

roi_events          # Analytics de conversão
  - session_id, event_name, payload (tracking)
  - 'prediag_completed', 'email_submitted' (eventos principais)
```

### 📧 Integração de Email (v1.9.1)
- **Serviço:** Resend API configurada e funcionando
- **Templates:** HTML profissional com design consistente
- **Personalização:** Nome real + perfil + dor + atividade + objetivo
- **CTAs:** Newsletter principal + sistema completo

### 🔧 Status de Funcionalidades
- ✅ **Pré-Diagnóstico:** Funcional com 6 etapas + validações
- ✅ **API Lead Capture:** Capturando nome + emails + enviando recomendações
- ✅ **Email Templates:** Design profissional com nome personalizado
- ✅ **Heurística:** 450+ recomendações funcionando
- ✅ **Analytics:** Eventos sendo rastreados no Supabase
- ✅ **RLS:** Políticas de segurança configuradas

### 📱 PWA - Progressive Web App (v3.5.0)

**App instalável em todos os dispositivos!**

- ✅ **Desktop:** Windows, Mac, Linux (Chrome/Edge)
- ✅ **Mobile:** Android (Chrome) e iOS (Safari)
- ✅ **Offline:** Assets básicos funcionam sem internet
- ✅ **Ícone Nativo:** Copos de café na área de trabalho/home screen
- ✅ **Fullscreen:** Sem barra do navegador
- ✅ **Service Worker:** Cache inteligente (Supabase 24h, assets 30d)

**Como instalar:**
`````bash
# Desktop (Chrome/Edge)
1. Acesse o site
2. Clique no ícone ⊕ na barra de endereços
3. "Instalar +ConverSaaS"

# Android (Chrome)
1. Acesse o site
2. Menu (⋮) > "Adicionar à tela inicial"

# iOS (Safari)
1. Acesse o site
2. Botão Compartilhar (□↑) > "Adicionar à Tela de Início"
`````

**Testar localmente:**
`````bash
npm run build
npm run start  # PWA ativo em localhost:3000
`````

**Arquivos criados:**
- `/public/pwa/manifest.json` - Configuração PWA
- `/public/pwa/icons/*` - 6 ícones otimizados (290KB)
- `/public/sw.js` - Service Worker (auto-gerado)

---

### 📈 Analytics em Produção (Dados Reais)
- **67 sessões** de pré-diagnóstico completas (26-27 ago/2025)
- **Taxa conversão**: 96% (49 de 51 que completaram enviaram email)
- **Público principal**: 40% estudantes, 24% estagiários
- **Dor mais comum**: Procrastinação (14 usuários)
- **Atividade crítica**: Aulas (13), treinamentos (8)
- **Tracking atual**: 2 eventos principais (prediag_completed, email_submitted)

### 📱 Instalações PWA (Novo v3.5.0)
- **Plataforma:** Desktop + Mobile
- **Ícone:** Personalizado (copos de café)
- **Nome App:** +ConverSaaS
- **Service Worker:** Ativo em produção
- **Tracking:** Em implementação (próxima versão)

### 📋 Detalhes Técnicos
```typescript

// APIs implementadas
POST /api/prediag/diagnose   # Gerar diagnóstico + salvar sessão
POST /api/prediag/lead       # Capturar nome + email + enviar recomendações
GET /api/prediag/options     # Opções dinâmicas por perfil

// Campo nome implementado
const { name, email, sessionId } = body;  // API agora processa nome
firstName: name.split(' ')[0],            // Email usa nome real

// Sistema de recomendações funcionando
450+ sugestões → Scoring por relevância → Top 3 por categoria (HABITO/TAREFA/MINDSET)

**PWA Implementado (v3.5.0):**
// Configuração PWA
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    // Supabase: NetworkFirst (24h cache)
    // Assets: CacheFirst (30d cache)
  ]
})

// Manifest
{
  "name": "+Conversas no Corredor",
  "short_name": "+ConverSaaS",
  "theme_color": "#d97706"
}
```
```

### 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev          # Servidor local
npm run build        # Build de produção
npm run lint         # Verificar código

# Testar pré-diagnóstico
# http://localhost:3000/pre-diagnostico

# Deploy
git add .            # Adicionar mudanças
git commit -m "feat: campo nome + personalização emails v1.9.1"
git push             # Deploy automático

# Debug
npm run type-check   # Verificar TypeScript
npm run analyze      # Análise do bundle

# Testar integração completa
# http://localhost:3000                 # Landing page com CTAs
# http://localhost:3000/pre-diagnostico # Pré-diagnóstico

# Deploy
git commit -m "feat: landing page integrada + UX refinado v1.9.2"
```

## 🌐 Deploy e Acesso

**Produção:** https://conversas-no-corredor.vercel.app
**Pré-Diagnóstico:** https://conversas-no-corredor.vercel.app/pre-diagnostico

### ⚙️ Nota Técnica Admin (v3.4.3)

**Função SQL Customizada:**
O dashboard de assinantes usa função SQL `public.admin_list_users()` ao invés de `auth.admin.listUsers()` devido a bug conhecido do Supabase com valores NULL em `confirmation_token`.

**Por que isso é seguro:**
- Função executa com SECURITY DEFINER (permissões de postgres)
- Apenas service_role pode executar (protegido por GRANT)
- API já valida que usuário é admin antes de chamar
- Mais confiável e ~30% mais rápido que API HTTP

**Workaround documentado em:** `docs/troubleshooting-admin-assinantes.md`

---

### 🔒 Sistema de Segurança (v3.2.0)

**Autorização de Usuários:**
- Sistema migrado de arquivo público para banco de dados seguro
- Verificação server-side impossível de burlar
- Dupla verificação: no cadastro E no login
- Interface admin em `/admin/assinantes` (acesso restrito)

**Para gerenciar assinantes:**
1. Acesse `/admin/assinantes` com email autorizado (admin only)
2. Use a interface visual para adicionar/editar/remover
3. Mudanças aplicadas instantaneamente
4. Filtros e busca para gestão eficiente

**Tabela no Supabase:**
```sql
authorized_emails
├── id (uuid)
├── email (text unique)
├── expires_at (date)
├── notes (text)
├── stripe_customer_id (preparado para futuro)
└── created_at (timestamp)

Segurança implementada:

✅ Zero exposição de dados sensíveis
✅ Validação server-side com service role key
✅ Verificação de expiração automática
✅ Prevenção de emails duplicados
✅ LGPD compliance total

### Configuração Email Marketing (v1.9.1)

```

### SQL para Atualização do Banco (v1.9.1)
```sql
-- Adicionar coluna nome na tabela roi_leads
ALTER TABLE roi_leads ADD COLUMN name VARCHAR(100);
```

## 🎨 Design System

**Cores principais:**
- Background: `#042f2e` (verde escuro)
- Accent: `#d97706` (laranja)
- Essencial: `#22c55e` (verde)
- Estratégica: `#3b82f6` (azul)
- Tática: `#eab308` (amarelo)
- Distração: `#ef4444` (vermelho)

**Componentes modulares:** 19+ componentes totalmente reutilizáveis com design tokens centralizados.

## 🗄️ Arquitetura do Banco de Dados

### Estrutura
O sistema utiliza **3 tabelas sincronizadas automaticamente**:
- `auth.users` - Gerenciada pelo Supabase Auth
- `usuarios` - Dados principais (id, email, nome)
- `profiles` - Perfil completo (full_name, emoji, preferências)

### Sincronização Automática
**Trigger `handle_new_user()`** popula automaticamente `usuarios` e `profiles` quando um usuário é criado em `auth.users`:
```sql
-- Disparado automaticamente após signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
Row Level Security (RLS)
Todas as tabelas protegidas com políticas que garantem:

✅ Usuários só acessam seus próprios dados
✅ Triggers funcionam com SECURITY DEFINER
✅ Admin acessa apenas via service role key

Documentação Completa
📖 Schema Completo do Banco
📖 Troubleshooting Signup

## 🤝 Sobre o Projeto

Baseado na metodologia **ROI do Foco** da newsletter [Conversas no Corredor]. Agora disponível como **PWA instalável** (+ConverSaaS) em desktop e mobile.
(https://conversasnocorredor.substack.com), este sistema oferece uma abordagem prática para mapear, diagnosticar e otimizar o foco profissional.

**Criado por:** [Adilson Matioli](https://www.linkedin.com/in/adilsonmatioli/)  
**Newsletter:** https://conversasnocorredor.substack.com  

---
📋 **Status:** Admin assinantes corrigido + Security Advisor zerado
📅 **Última atualização:** 23 de Outubro de 2025  
🔄 **Versão:** 3.5.0 - PWA instalável + Rebranding +Conversas no Corredor
📊 **Métricas:** [Veja status detalhado no CURRENT-STATUS.md](docs/CURRENT-STATUS.md)