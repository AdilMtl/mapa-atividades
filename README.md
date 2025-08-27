# 🎯 Mapa de Atividades - ROI do Foco

**Sistema Enterprise para Diagnóstico e Otimização do Foco Profissional**

[![Deploy](https://img.shields.io/badge/deploy-vercel-black?logo=vercel)](https://conversas-no-corredor.vercel.app)
[![Versão](https://img.shields.io/badge/versão-v1.9.0-blue)](docs/CURRENT-STATUS.md)
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
- **🎯 Pré-Diagnóstico** - Captura de leads com recomendações por email (**NOVO v1.9.0**)
- **🗺️ Mapa de Atividades** - Matriz Impacto × Clareza (4 zonas)
- **📊 Diagnóstico Automático** - Análise ROI do Foco com relatórios personalizados
- **📋 Plano de Ação** - Framework DAR CERTO com IA V2.1
- **📧 Email Marketing** - Templates profissionais via Resend (**NOVO v1.9.0**)
- **📄 Export Profissional** - PDF otimizado + cópia de texto
- **👤 Perfil Completo** - Configurações pessoais + compliance LGPD
- **🔐 Autenticação Segura** - RLS (Row Level Security) + emails autorizados

### 🛠️ Stack Tecnológica
- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **Email:** Resend API com templates HTML (**NOVO v1.9.0**)
- **Deploy:** Vercel (automático via Git)
- **Metodologia:** ROI do Foco + Framework DAR CERTO

## 🌊 Fluxo do Usuário

### 🎯 Fluxo Completo Atualizado

1. **Landing Page** → Apresentação e captação de assinantes
2. **Pré-Diagnóstico** → Sistema de leads com 5 etapas + email (**NOVO v1.9.0**)
3. **Autenticação** → Login/cadastro com emails autorizados
4. **Reset de Senha** → Página dedicada com emails customizados
5. **Dashboard** → Mapeamento na matriz Impacto × Clareza
6. **Diagnóstico** → Análise automática + relatório personalizado
7. **Plano de Ação** → Táticas específicas baseadas no diagnóstico

## 📂 Estrutura do Projeto

```
src/
├── app/
│   ├── pre-diagnostico/page.tsx      # Pré-diagnóstico conversacional
│   ├── api/prediag/                  # APIs do pré-diagnóstico
│   │   ├── diagnose/route.ts         # POST - Processar diagnóstico
│   │   ├── lead/route.ts             # POST - Capturar email + enviar
│   │   ├── options/route.ts          # GET - Opções por perfil
│   │   ├── email-template.ts         # Template HTML profissional
│   │   └── recommendations.ts        # Heurística 450+ sugestões
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
│   └── plano/                       # 7 componentes do plano
└── lib/
    ├── diagnostico-engine.ts        # Motor de análise
    ├── heuristica-engine.ts         # IA V2.1 para táticas
    ├── design-system.ts             # Tokens centralizados
    └── supabase.ts                  # Configuração do banco
```

## 📚 Sistema de Documentação Modular

### 📋 **Documentação Principal**
- **📊 [CURRENT-STATUS.md](docs/CURRENT-STATUS.md)** - Status atual sempre atualizado
- **📅 [CHANGELOG.md](docs/CHANGELOG.md)** - Histórico completo de versões
- **🔧 [troubleshooting-acesso.md](docs/troubleshooting-acesso.md)** - Soluções para problemas comuns

### 📖 **Documentação Técnica v1.9.0**
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
├── v1.9.0-prediagnostico-completo.md  # Versão atual - Sessão 27/08/2025
├── v1.8.3-diagnostico-premium.md      # Export otimizado - Sessão 22/08/2025
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

## 🎯 Versão Atual: v1.9.0 - Sistema de Pré-Diagnóstico Completo

**Foco da Sessão (27/08/2025):** Pré-Diagnóstico + Email Marketing + APIs Completas

### ✅ Implementado Nesta Versão
- **🎯 Landing Page Pré-Diagnóstico** - `/pre-diagnostico` com fluxo de 5 etapas
- **🔧 APIs Completas** - `/api/prediag/*` para diagnóstico, leads e recomendações
- **📧 Sistema Email Marketing** - Resend configurado com templates HTML profissionais
- **🧠 Heurística Inteligente** - 450+ recomendações categorizadas por perfil + dor + objetivo
- **🗄️ Banco Expandido** - 3 novas tabelas (sessions, leads, events)
- **📊 Analytics** - Sistema de eventos para tracking de conversão
- **🛡️ Segurança** - Validações robustas + RLS em todas as novas tabelas

### 🔧 Funcionalidades do Pré-Diagnóstico
```typescript
// Fluxo de 5 etapas implementado:
1. ProfileSelector    # Perfil profissional (estudante, analista, gestor, etc.)
2. AgendaSelector     # Estado da agenda (sempre_lotada, equilibrada, etc.)
3. PainSelector       # Principal dor (urgencias, reunioes, falta_clareza, etc.)
4. ActivitySelector   # Atividade que mais consome tempo
5. GoalSelector       # Objetivo principal (vender_mais, tempo_planejamento, etc.)

// Email com recomendações personalizadas
Template HTML profissional → 3 sugestões categorizadas → CTAs para newsletter/sistema
```

### 🗄️ Banco de Dados Expandido (v1.9.0)
```sql
-- 3 TABELAS IMPLEMENTADAS:
roi_prediag_sessions  # Dados completos do diagnóstico
  - profile, agenda, pain, top_activity, goal (inputs usuário)
  - mix_essencial, mix_estrategico, mix_tatico, mix_distracao (outputs %)
  - insight_hash, ip_address, user_agent, duration_seconds (metadados)

roi_leads            # Leads capturados para marketing
  - email, source, last_session_id (identificação)
  - profile_segment, pain_segment (segmentação)
  - email_sent, email_opened, subscribed (engajamento)

roi_events          # Analytics de conversão
  - session_id, event_name, payload (tracking)
  - 'prediag_completed', 'email_submitted' (eventos principais)
```

### 📧 Integração de Email (v1.9.0)
- **Serviço:** Resend API configurada e funcionando
- **Templates:** HTML profissional com design consistente
- **Personalização:** Baseada em perfil + dor + atividade + objetivo
- **CTAs:** Newsletter principal + sistema completo

### 🔧 Status de Funcionalidades
- ✅ **Pré-Diagnóstico:** Funcional com 5 etapas + validações
- ✅ **API Lead Capture:** Capturando emails + enviando recomendações
- ✅ **Email Templates:** Design profissional com barras de diagnóstico
- ✅ **Heurística:** 450+ recomendações funcionando
- ✅ **Analytics:** Eventos sendo rastreados no Supabase
- ✅ **RLS:** Políticas de segurança configuradas

### 📋 Detalhes Técnicos
```typescript
// APIs implementadas
POST /api/prediag/diagnose   # Gerar diagnóstico + salvar sessão
POST /api/prediag/lead       # Capturar email + enviar recomendações
GET /api/prediag/options     # Opções dinâmicas por perfil

// Correção crítica implementada
const { data: sessao } = await supabase
  .select('*')  // Solução: buscar todos os campos
  .eq('id', sessionId)
  .single();

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
git commit -m "feat: sistema pré-diagnóstico v1.9.0"
git push             # Deploy automático

# Debug
npm run type-check   # Verificar TypeScript
npm run analyze      # Análise do bundle
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

### Configuração Email Marketing (v1.9.0)
```env
# Adicionar ao .env.local:
SUPABASE_URL=https://xxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
EMAIL_FROM_ADDRESS=onboarding@resend.dev
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

📋 **Status:** Sistema 100% operacional com pré-diagnóstico funcionando  
📅 **Última atualização:** 27 de agosto de 2025  
🔄 **Próxima versão:** Integração com landing page principal + analytics avançados  
📊 **Métricas:** [Veja status detalhado no CURRENT-STATUS.md](docs/CURRENT-STATUS.md)