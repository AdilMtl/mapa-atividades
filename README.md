# 🎯 Mapa de Atividades - ROI do Foco

**Sistema Enterprise para Diagnóstico e Otimização do Foco Profissional**

[![Deploy](https://img.shields.io/badge/deploy-vercel-black?logo=vercel)](https://conversas-no-corredor.vercel.app)
[![Versão](https://img.shields.io/badge/versão-v1.9.1-blue)](docs/CURRENT-STATUS.md)
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
- **🎯 Pré-Diagnóstico** - Captura nome + recomendações personalizadas (**v1.9.1**)
- **🗺️ Mapa de Atividades** - Matriz Impacto × Clareza (4 zonas)
- **📊 Diagnóstico Automático** - Análise ROI do Foco com relatórios personalizados
- **📋 Plano de Ação** - Framework DAR CERTO com IA V2.1
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

## 🌊 Fluxo do Usuário

### 🎯 Fluxo Completo Atualizado

1. **Landing Page** → Apresentação e captação de assinantes
2. **Pré-Diagnóstico** → Sistema de leads com nome + 5 etapas + email (**v1.9.1**)
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
│   │   ├── lead/route.ts             # POST - Capturar nome + email + enviar
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
│   ├── prediagnostico/              # EmailGate com campo nome (v1.9.1)
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

## 🎯 Versão Atual: v1.9.1 - Campo Nome + Personalização

**Foco da Sessão (27/08/2025 - Tarde):** Correção de bug crítico + campo nome

### ✅ Implementado Nesta Versão
- **📧 Campo Nome Obrigatório** - EmailGate captura nome completo
- **🎯 Emails Personalizados** - "Olá João" em vez de "joao.silva@email.com"
- **🔧 Bug Crítico Corrigido** - 53 leads perdidos recuperados
- **🛡️ Validação Robusta** - Nome mínimo 2 caracteres + email válido

### 🔧 Funcionalidades do Pré-Diagnóstico
```typescript
// Fluxo de 6 etapas implementado:
1. ProfileSelector    # Perfil profissional (estudante, analista, gestor, etc.)
2. AgendaSelector     # Estado da agenda (sempre_lotada, equilibrada, etc.)
3. PainSelector       # Principal dor (urgencias, reunioes, falta_clareza, etc.)
4. ActivitySelector   # Atividade que mais consome tempo
5. GoalSelector       # Objetivo principal (vender_mais, tempo_planejamento, etc.)
6. EmailGate         # Captura nome + email com validação (NOVO v1.9.1)

// Email personalizado com nome real
"Olá João" em vez de "joao.silva" → 3 sugestões categorizadas → CTAs para newsletter/sistema
```

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
```env
# Adicionar ao .env.local:
SUPABASE_URL=https://xxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
EMAIL_FROM_ADDRESS=onboarding@resend.dev
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

📋 **Status:** Sistema 100% operacional com pré-diagnóstico + nome personalizado  
📅 **Última atualização:** 27 de agosto de 2025  
📄 **Próxima versão:** Integração com landing page principal + analytics avançados  
📊 **Métricas:** [Veja status detalhado no CURRENT-STATUS.md](docs/CURRENT-STATUS.md)