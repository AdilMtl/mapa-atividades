# 🎯 Mapa de Atividades - ROI do Foco

**Sistema Enterprise para Diagnóstico e Otimização do Foco Profissional**

[![Deploy](https://img.shields.io/badge/deploy-vercel-black?logo=vercel)](https://conversas-no-corredor.vercel.app)
[![Versão](https://img.shields.io/badge/versão-v3.0.0-blue)](docs/CURRENT-STATUS.md)
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

**Acesso:** http://localhost:3000

## 📊 Sistema Completo

### ✅ Funcionalidades Principais
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

### 🛠️ Stack Tecnológica
- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **Email:** Resend API com templates HTML (**v1.9.0**)
- **Deploy:** Vercel (automático via Git)
- **Metodologia:** ROI do Foco + Framework DAR CERTO
- **Drag & Drop:** @dnd para Kanban visual

## 🌊 Fluxo do Usuário

### 🎯 Fluxo Completo v3.0.0

1. **Landing Page Premium** → 4 vídeos demonstrativos com auto-play (**v3.0.0**)
2. **Ecossistema Virtual** → Apresentação completa Conversas no Corredor + (**v3.0.0**)
3. **Pré-Diagnóstico** → Sistema de leads com nome + 5 etapas + email
4. **Reset de Senha** → Página dedicada com emails customizados
5. **Dashboard** → Mapeamento na matriz Impacto × Clareza
6. **Diagnóstico** → Análise automática + relatório personalizado
7. **Plano de Ação** → Interface redesenhada com dashboard e controles centralizados (**v1.9.6**)
8. **Fluxo Semanal** → Kanban visual para execução de táticas (**v2.0.0** 🆕)

## 📂 Estrutura do Projeto

```
src/
├── app/
│   ├── page.tsx                      # Landing page com vídeos interativos (v3.0.0)
│   ├── pre-diagnostico/page.tsx      # Pré-diagnóstico conversacional
│   ├── api/prediag/                  # APIs do pré-diagnóstico
│   │   ├── diagnose/route.ts         # POST - Processar diagnóstico
│   │   ├── lead/route.ts             # POST - Capturar nome + email + enviar
│   │   ├── options/route.ts          # GET - Opções por perfil
│   │   ├── email-template.ts         # Helper - Template HTML profissional
│   │   └── recommendations.ts        # Helper - Heurística 450+ sugestões
│   ├── painel-semanal/               # 🆕 v2.0.0 - Kanban visual
│   │   ├── page.tsx                  # Wrapper da página
│   │   └── components/
│   │       └── KanbanPage.tsx        # Componente principal com drag & drop
│   ├── auth/page.tsx                 # Autenticação
│   ├── dashboard/page.tsx            # Mapa de atividades
│   ├── diagnostico/page.tsx          # Análise do foco
│   ├── plano-acao/page.tsx          # Framework DAR CERTO
│   ├── perfil/page.tsx              # Configurações
│   ├── privacidade/page.tsx         # LGPD compliance
│   └── reset-password/page.tsx      # Reset de senha
├── components/
│   ├── base/                        # 8 componentes reutilizáveis
│   ├── mapa/                        # 5 componentes do mapa
│   ├── prediagnostico/              # EmailGate com campo nome (v1.9.1)
│   └── plano/                       # 7 componentes do plano
└── lib/
|   ├── diagnostico-engine.ts        # Motor de análise
|   ├── heuristica-engine.ts         # IA V2.1 para táticas
|   ├── design-system.ts             # Tokens centralizados
|   └── supabase.ts                  # Configuração do banco
|   ├── kanban/                       # 🆕 v2.0.0 - Funções específicas
|   │   └── database.ts               # Integração Supabase para Kanban
└── public/
    └── videos/                        # 4 vídeos de demonstração (v3.0.0)
        ├── mapeamento.mp4
        ├── diagnostico.mp4
        ├── taticas.mp4
        └── kanban.mp4
```

## 📚 Sistema de Documentação Modular

### 📋 **Documentação Principal**
- **📊 [CURRENT-STATUS.md](docs/CURRENT-STATUS.md)** - Status atual sempre atualizado
- **📅 [CHANGELOG.md](docs/CHANGELOG.md)** - Histórico completo de versões
- **🔧 [troubleshooting-acesso.md](docs/troubleshooting-acesso.md)** - Soluções para problemas comuns

### 📖 **Documentação Técnica v1.9.1**
```
docs/
├── api-prediagnostico.md            # Especificação completa das 3 APIs
├── pagina-prediagnostico.md         # Interface conversacional + UX
├── tabelas-supabase.md              # Schema das 3 tabelas + RLS
└── deploy-configuracao.md           # Guia completo Vercel + Supabase + Resend
```

### 📖 **Versões Detalhadas**
```
docs/versions/
├── v2.0.0-kanban-visual.md            # Kanban visual completo - 13/12/2025 🆕
├── v1.9.0-prediagnostico-completo.md  # Sistema pré-diagnóstico - 27/08/2025
├── v1.8.3-diagnostico-premium.md      # Export otimizado - 22/08/2025
├── v1.8.2-fluxo-padronizado.md        # ROI do Foco + nome real usuário
└── v1.8.1-heuristica-refinada.md      # IA V2.1 + Framework DAR CERTO
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


## 🎯 Versão Atual: v3.0.0 - Landing Page Premium com Vídeos Interativos

**Foco da Sessão (17/01/2024):** Redesign completo da landing page com demonstrações em vídeo
**Sessão Anterior (13/12/2025):** Kanban Visual - Fluxo Semanal


### ✅ Nova Funcionalidade Major: Fluxo Semanal
- **🎯 Kanban Visual** - Sistema drag & drop com 4 colunas (Backlog → Para Fazer → Fazendo → Feito)
- **📊 Integração Total** - Utiliza táticas criadas no Plano de Ação automaticamente
- **🎨 Design Consistente** - Glass effects + animações + tema unificado com projeto
- **📱 Responsivo** - Layout otimizado para desktop com scroll horizontal funcional

### 🗄️ Extensão do Banco Supabase
- **📋 Tabela Estendida** - 3 novos campos na tabela 'taticas' existente
- **🔧 Campos Adicionados** - status_kanban, ordem_coluna, semana_referencia  
- **⚡ Performance** - Novo índice idx_taticas_kanban para queries otimizadas
- **🔒 Compatibilidade** - Zero breaking changes, funcionalidades v1.9.8 preservadas

### 🚀 Arquitetura v2.0.0 Implementada
ATIVIDADES (dashboard/mapa)
└── TÁTICAS (plano-acao)
└── STATUS KANBAN (painel-semanal) ← NOVO v2.0.0

### 🔧 Tecnologias Adicionadas
- **Biblioteca:** @hello-pangea/dnd para drag & drop performático
- **Next.js:** Atualizado v15.0.0-canary → v15.5.3 (vulnerabilidade SSRF resolvida)
- **SQL:** Constraint + índice para validação e performance do Kanban

### 📱 UX/UI Implementada
- **Drag & Drop:** Cards com cursor grab/grabbing + animações suaves
- **Feedback Visual:** Colunas destacam ao receber drag + contadores automáticos
- **Hierarquia:** Cards mostram atividade mãe + zona ROI + categoria automaticamente
- **Navegação:** Botão "Fluxo Semanal" adicionado na sidebar lateral

--- 

## 🎯 Versão Anterior: v1.9.8 - Sincronização Supabase + Notificações ROI do Foco

**Foco da Sessão (09/12/2025):** Migração localStorage → Supabase + Sistema de notificações
**Sessão Anterior (09/09/2025):** Google Ads Conversion Tracking

### ✅ Sincronização Entre Dispositivos
- **🔄 Salvamento Híbrido** - localStorage + Supabase simultaneamente
- **📊 Tabela Táticas** - Nova tabela `public.taticas` com RLS ativo
- **🔄 Strategy Replace All** - Deleta antigas e insere novas (evita duplicatas)
- **📱 Problema Resolvido** - Táticas agora sincronizam entre celular e computador

### 🎨 Notificações ROI do Foco
- **✨ UX Melhorada** - Substituição dos alert() feios por notificações visuais
- **🎯 Design Consistente** - Cores e tipografia alinhadas com identidade
- **⏱️ Feedback Temporal** - Notificações aparecem por 3 segundos
- **🏷️ Branding Integrado** - Todas mostram "ROI do Foco"

### 🚀 Sistema Robusto Implementado
Salvamento Local → Sincronização Supabase → Notificação Visual →
Dados disponíveis em qualquer dispositivo

### 🔧 Arquivos Principais Modificados
- `src/app/plano-acao/page.tsx` - função salvarPlano() + notificações
- Schema SQL Supabase - tabela taticas com 15 campos + RLS


## 🎯 Versão Anterior: v1.9.7 - Google Ads Conversion Tracking

**Foco da Sessão (09/09/2025):** Implementação completa de tracking de conversão Google Ads
**Sessão Anterior (08/09/2025):** Plano de Ação UX Redesign

### ✅ Google Ads Conversion Tracking
- **📊 Conversion Pipeline** - Google Ads → Pré-diagnóstico → Lead → Conversão registrada
- **🎯 Trigger Preciso** - Conversão dispara no momento da captura nome + email
- **💻 Frontend Integration** - gtag() executado via JavaScript no navegador
- **🔍 Debug Confirmation** - Console mostra "Google Ads conversion triggered"

### 🚀 Sistema Completo Validado
Pipeline de Conversão → Todas as etapas funcionando → 
Tracking confirmado → ROI do Google Ads mensurável

### 📊 Descobertas Importantes
- **Sistema Sempre Funcionou:** Problema era teste com mesmo email repetidamente
- **Upsert Behavior:** created_at mantém data original, usar updated_at para tracking
- **Conversion Accuracy:** Disparo no momento exato de lead qualificado

### 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev          # Servidor local
npm run build        # Build de produção
npm run lint         # Verificar código

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

### 📈 Analytics em Produção (Dados Reais)
- **67 sessões** de pré-diagnóstico completas (26-27 ago/2025)
- **Taxa conversão**: 96% (49 de 51 que completaram enviaram email)
- **Público principal**: 40% estudantes, 24% estagiários
- **Dor mais comum**: Procrastinação (14 usuários)
- **Atividade crítica**: Aulas (13), treinamentos (8)
- **Tracking atual**: 2 eventos principais (prediag_completed, email_submitted)

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

### Sistema de Emails Autorizados
Arquivo: `public/emails-autorizados.txt`
```
email@dominio.com,31/12/2025
usuario@gmail.com,30/06/2025
```

Para adicionar novos usuários:
1. Editar `public/emails-autorizados.txt`
2. Adicionar linha: `email@dominio.com,DD/MM/AAAA`
3. Fazer commit: `git push`
4. Deploy automático em 2-3 minutos

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

## 🤝 Sobre o Projeto

Baseado na metodologia **ROI do Foco** da newsletter [Conversas no Corredor](https://conversasnocorredor.substack.com), este sistema oferece uma abordagem prática para mapear, diagnosticar e otimizar o foco profissional.

**Criado por:** [Adilson Matioli](https://www.linkedin.com/in/adilsonmatioli/)  
**Newsletter:** https://conversasnocorredor.substack.com  

---

📋 **Status:** Sistema completo com landing page premium e vídeos interativos
📅 **Última atualização:** 16 de Setembro e 2025
📄 **Próxima versão:** Pequenos deploys e correção e bugs, criação de view free
📊 **Métricas:** [Veja status detalhado no CURRENT-STATUS.md](docs/CURRENT-STATUS.md)