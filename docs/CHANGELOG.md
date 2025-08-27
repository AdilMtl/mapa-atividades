# 📅 CHANGELOG - ROI DO FOCO

Todas as mudanças notáveis neste projeto serão documentadas aqui.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [v1.9.1] - 2025-08-27 - 📧 Campo Nome + Personalização de Emails
**Impacto:** Médio - Melhoria na experiência de email marketing
**Duração:** ~2 horas de implementação

### ✅ Adicionado
- **Campo Nome Obrigatório**: EmailGate agora captura nome completo do usuário
- **Personalização Real**: Emails mostram "Olá João" em vez de "Olá joao.silva"
- **Validação Robusta**: Nome mínimo 2 caracteres + email válido
- **Coluna Banco**: `roi_leads.name VARCHAR(100)` adicionada

### 🔧 Corrigido
- **Bug API Lead**: Sistema não salvava leads (53 perdidos detectados)
- **Validação Entrada**: API agora processa campo nome corretamente
- **Template Email**: firstName usa nome real extraído do formulário

### 📊 Técnico
- **Arquivos Modificados**: 
  - `src/components/prediagnostico/EmailGate.tsx`
  - `src/app/api/prediag/lead/route.ts`
- **Breaking Change**: Tabela roi_leads requer coluna name
- **Taxa Recuperação**: Bug detectado através de análise 67 sessões vs 1 lead salvo

### 📚 Lessons Learned
- **Validação Crítica**: APIs devem aceitar dados parciais para evitar perda de leads
- **Monitoring**: Comparação entre tabelas revelou bug silencioso
- **UX Impact**: Campo nome melhora personalização sem fricção significativa
- **Data Quality**: Tracking granular menos importante que conversão principal


## [v1.9.0] - 2025-08-27 - 🎯 Sistema de Pré-Diagnóstico Completo
**Impacto:** Alto - Nova funcionalidade de captura de leads
**Duração:** ~8 horas de implementação completa

### ✅ Adicionado

#### **📋 Pré-Diagnóstico ROI do Foco**
- **Landing Page Independente** (`/pre-diagnostico`)
  - Interface conversacional com 5 etapas: Perfil → Agenda → Dor → Atividade → Objetivo  
  - Design responsivo mobile-first alinhado com identidade visual
  - Validação robusta de inputs com error handling

#### **🔧 APIs Completas de Pré-Diagnóstico**
- **`POST /api/prediag/diagnose`** - Gerar diagnóstico + salvar sessão
- **`POST /api/prediag/lead`** - Capturar email + enviar recomendações  
- **`GET /api/prediag/options`** - Opções dinâmicas ramificadas por perfil

#### **💌 Sistema de Email Marketing**
- **Integração Resend** configurada e funcional
- **Template HTML Profissional** (`email-template.ts`)
  - Design consistente com landing page + identidade visual
  - Personalização baseada no perfil do usuário
  - 3 recomendações customizadas por sessão (HABITO/TAREFA/MINDSET)
  - CTAs duplos: Newsletter + Sistema Completo

#### **🧠 Heurística de Recomendações** (`recommendations.ts`)
- **450+ Recomendações Categorizadas**
  - Mapeamento por: perfil + dor + atividade + objetivo
  - Sistema de scoring para melhor match
  - Fallbacks garantidos para todos os perfis

#### **🗄️ Banco de Dados Expandido**
```sql
-- 3 Novas Tabelas Criadas:
roi_prediag_sessions  # Dados completos do diagnóstico
roi_leads            # Leads capturados para marketing  
roi_events           # Analytics de conversão
```

#### **🛡️ Segurança e Validação**
- **Validações Server-Side:** Email format + UUID + input sanitization
- **RLS Configurado:** Políticas de segurança em todas as novas tabelas
- **Error Handling:** Tratamento robusto de cenários de falha

### 🔧 Corrigido
- **API Recomendações:** Correção crítica com `select('*')` resolvendo recomendações vazias
- **Template Email:** Layout profissional com barras gráficas funcionais
- **Integração Supabase:** 3 tabelas com relacionamentos e índices otimizados
- **Response Time:** APIs otimizadas para < 2s

### 🎨 Melhorado
- **UX Conversacional:** Fluxo intuitivo de 5 etapas sem fricção
- **Email Design:** Template responsivo com snapshot visual dos resultados
- **Analytics:** Sistema de eventos para tracking de conversão completo
- **Performance:** Queries otimizadas com índices estratégicos

### 📊 Técnico
- **Arquivos Criados:** 
  - `src/app/pre-diagnostico/page.tsx`
  - `src/app/api/prediag/diagnose/route.ts`
  - `src/app/api/prediag/lead/route.ts` 
  - `src/app/api/prediag/options/route.ts`
  - `src/app/api/prediag/email-template.ts`
  - `src/app/api/prediag/recommendations.ts`
- **Integrações:** Resend API + Supabase expandido + RLS policies
- **Environment Variables:** `RESEND_API_KEY`, `EMAIL_FROM_ADDRESS`

---

## [v1.8.3] - 2025-08-22 - 🎯 Diagnóstico Premium + Export Otimizado

### ✅ Adicionado
- **PDF Export Limpo**: Implementação direta com jsPDF sem html2canvas
- **RelatorioView Personalizado**: Header com emoji + nome real do usuário
- **Barra Visual Integrada**: Distribuição das zonas dentro do relatório
- **Status Badge Dinâmico**: Crítico/Saudável/Ajustes com cores automáticas
- **CSS Inline Profissional**: Formatação aprimorada do texto do relatório

### 🔧 Corrigido
- **Caracteres Quebrados**: PDF agora exporta sem emojis/acentos corrompidos
- **Layout Redundante**: Removida seção duplicada "Distribuição do Seu Tempo"
- **Import Missing**: Adicionado `getCenarioColor` e `getCenarioIcon` nos componentes
- **Header Genérico**: Personalização com dados reais do perfil do usuário

### 🎨 Melhorado
- **Performance PDF**: Geração 3x mais rápida sem dependência do html2canvas
- **UX Limpa**: Interface mais enxuta com informação consolidada
- **Responsividade**: Layout otimizado para mobile e desktop
- **Typography**: Hierarquia visual melhorada no relatório

### 📊 Técnico
- **Arquivos Modificados**: `page.tsx`, `index.tsx` (diagnostico), engine confirmado
- **Limpeza de Imports**: Consolidação de imports duplicados
- **Estado Otimizado**: Interface `dadosUsuario` com suporte a emoji

---

## [v1.8.2] - 2025-08-20 - 🔄 Fluxo Padronizado + Interface Profissional

### ✅ Adicionado
- **Fluxo ROI do Foco**: Design idêntico nas 3 páginas principais (Mapa/Diagnóstico/Plano)
- **Nome Real**: Busca automática na tabela `profiles` com fallback para email
- **Métricas Coloridas**: Grid 2x2 (mobile) / 1x4 (desktop) com cores padronizadas
- **Progress Steps**: Indicação visual do progresso no fluxo (verde/laranja/cinza)
- **Data Formatada**: Português brasileiro em todos os componentes

### 🔧 Corrigido
- **Busca de Perfil**: Correção de `display_name` para `full_name`
- **Props Incorretos**: Dados do usuário e resultado passados corretamente
- **Visual Inconsistente**: Unificação do design entre todas as páginas

### 🎨 Melhorado
- **Design System**: Cores/espaçamentos/typography padronizados
- **Modularidade**: Componente RelatorioView reutilizável
- **Accessibility**: Contraste melhorado e estrutura semântica

---

## [v1.8.1] - 2025-08-18 - 🧠 Heurística V2.1 + Edição Profissional

### ✅ Adicionado
- **IA V2.1 Robusta**: 6 padrões principais + scoring inteligente
- **Sistema de Edição**: Modal pré-preenchido para táticas existentes
- **Tags Visuais**: TAREFA (amarelo) vs HÁBITO (azul) com diferenciação automática
- **IDs Únicos**: Sistema timestamp + random para eliminar keys duplicadas
- **Preservação de Categoria**: Mantém categoria original ao editar

### 🔧 Corrigido
- **Keys Duplicadas**: Zero erros de React rendering
- **Botões Não Funcionais**: Modal unificado conectado a todos os botões
- **Impactos Inconsistentes**: Sistema manual para configuração

### 🎨 Melhorado
- **Interface Profissional**: Layout com grid e ícones organizados
- **Qualidade IA**: Barreira de 75% + sempre 2+ sugestões por zona
- **Manutenibilidade**: Código documentado com TODOs para futuro

---

## [v1.8.0] - 2025-08-15 - 🎯 Framework DAR CERTO + IA Automática

### ✅ Adicionado
- **Framework DAR CERTO**: 8 categorias implementadas (Delegar/Automatizar/Reduzir/etc)
- **IA V2.0**: Motor de sugestões automáticas baseado em padrões
- **Sistema TAREFA vs HÁBITO**: Flexibilidade total na criação
- **Modal Guiado**: Interface para inserção manual com seleção de categoria
- **Ordenação Inteligente**: Atividades priorizadas pelo diagnóstico

### 🔧 Corrigido
- **Integração Sequencial**: Fluxo Diagnóstico → Plano completamente funcional
- **Orientação Automática**: Seção baseada no foco identificado

---

## [v1.7.0] - 2025-08-12 - 📊 Diagnóstico Automático + Relatórios

### ✅ Adicionado
- **Motor de Análise**: 5 focos identificados automaticamente
- **Relatórios Detalhados**: Cenário + recomendações + meta personalizada
- **Export Profissional**: PDF e JSON para acompanhamento
- **3 Cenários**: Saudável/Ajustes/Crítico com análise contextual

### 🎨 Melhorado
- **Integração com Plano**: Dados salvos automaticamente para próximo passo

---

## [v1.6.0] - 2025-08-10 - 🎨 Layout Otimizado + UX Consistente

### ✅ Adicionado
- **Header com Fluxo**: Progress bar visual nas páginas principais
- **Menu Retrátil**: Transições suaves na navegação
- **Reorganização**: Página de diagnóstico reestruturada

### 🎨 Melhorado
- **UX Consistente**: Design padronizado entre todas as páginas

---

## [v1.5.0] - 2025-08-08 - 👤 Perfil Completo + LGPD

### ✅ Adicionado
- **Página de Perfil**: Configurações pessoais completas
- **Sistema LGPD**: Compliance total com exportação de dados
- **Modal de Termos**: Integrado na experiência do usuário
- **Emojis de Perfil**: Personalização visual do usuário

---

## [v1.4.0] - 2025-08-05 - 🧩 Wave 1 Modular + Design System

### ✅ Adicionado
- **19 Componentes Modulares**: Base sólida para escalabilidade
- **Design System**: Centralizado com tokens de cores/espaçamentos
- **Arquitetura Enterprise**: Separação clara de responsabilidades

---

## [v1.3.0] - 2025-08-02 - 🔍 Sistema de Diagnóstico

### ✅ Adicionado
- **Motor de Análise Heurística**: Primeiro algoritmo de diagnóstico
- **Relatórios Automáticos**: Geração baseada em padrões identificados
- **Export Básico**: PDF/JSON inicial

---

## [v1.2.0] - 2025-07-30 - 🗺️ Mapa de Atividades Core

### ✅ Adicionado
- **Gráfico Interativo**: Impacto × Clareza com 4 zonas automáticas
- **CRUD Completo**: Criar, editar, excluir atividades
- **Zonificação Automática**: Distração/Tática/Estratégica/Essencial
- **Export PNG**: Download da visualização

---

## [v1.1.0] - 2025-07-25 - 🔐 Autenticação + Banco

### ✅ Adicionado
- **Supabase Integration**: Banco PostgreSQL + RLS
- **Sistema de Auth**: Login/cadastro seguro
- **Tabelas Core**: Atividades + Profiles + Políticas

---

## [v1.0.0] - 2025-07-20 - 🚀 MVP Inicial

### ✅ Adicionado
- **Landing Page**: Design profissional + newsletter integration
- **Estrutura Base**: Next.js + TypeScript + Tailwind
- **Deploy**: Vercel com domínio personalizado

---

## 📝 TEMPLATE PARA PRÓXIMAS VERSÕES

```markdown
## [vX.Y.Z] - YYYY-MM-DD - 🎯 Título da Release

### ✅ Adicionado
- **Feature Nome**: Descrição clara do que foi adicionado

### 🔧 Corrigido  
- **Bug Nome**: Descrição do problema que foi resolvido

### 🎨 Melhorado
- **Área Nome**: Descrição da melhoria implementada

### 📊 Técnico
- **Arquivos**: Lista dos principais arquivos modificados
- **Breaking Changes**: Se houver mudanças que quebram compatibilidade

### 🚨 Depreciado
- **Feature Antiga**: O que será removido em versões futuras

### ❌ Removido
- **Feature Removida**: O que foi completamente removido
```

---

**📝 Mantido por:** Equipe de desenvolvimento  
**🔄 Atualizado:** A cada release  
**📋 Formato:** [Keep a Changelog](https://keepachangelog.com/)  
**🎉 Estatísticas:** 15+ sessões, 180+ commits, ~25,000 linhas de código