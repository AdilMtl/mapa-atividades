\# 📅 CHANGELOG



Todas as mudanças notáveis neste projeto serão documentadas aqui.



O formato é baseado em \[Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),

e este projeto adere ao \[Semantic Versioning](https://semver.org/lang/pt-BR/).



---

## [v1.8.4] - 2025-08-23 - 🔐 Sistema de Reset de Senha Completo

### ✅ Adicionado
- **Página Dedicada Reset** - Nova rota `/reset-password` seguindo padrão de mercado
- **Emails Customizados** - Templates visuais profissionais para reset e cadastro
- **Fluxo Linear** - Esqueci senha → email → nova senha → login automático
- **Rate Limits Ajustados** - Configurações otimizadas no Supabase
- **UX Intuitiva** - Detecção automática de tokens válidos/expirados

### 🔧 Corrigido
- **Lógica Confusa** - Removida implementação problemática da página auth
- **Links Quebrados** - Configuração correta de redirects no Supabase
- **Rate Limiting** - Identificação e solução de bloqueios por excesso de requests
- **Token Validation** - Detecção robusta de parâmetros em query string e hash

### 🎨 Melhorado
- **Separação de Responsabilidades** - Auth só para login/cadastro, reset isolado
- **Feedback Visual** - Loading states e mensagens claras de erro/sucesso
- **Mobile First** - Layout responsivo para todos os dispositivos
- **Templates Email** - Visual consistente com identidade da marca

### 📊 Técnico
- **Arquivos Criados:** `src/app/reset-password/page.tsx`
- **Arquivos Modificados:** `src/app/auth/page.tsx`
- **Configurações:** Supabase SMTP, Rate Limits, Redirect URLs
- **Padrão:** Seguindo benchmarks Gmail, GitHub, Outlook

---


\## \[v1.8.3] - 2025-08-22 - 🎯 Diagnóstico Premium + Export Otimizado



\### ✅ Adicionado

\- \*\*PDF Export Limpo\*\*: Implementação direta com jsPDF sem html2canvas

\- \*\*RelatorioView Personalizado\*\*: Header com emoji + nome real do usuário

\- \*\*Barra Visual Integrada\*\*: Distribuição das zonas dentro do relatório

\- \*\*Status Badge Dinâmico\*\*: Crítico/Saudável/Ajustes com cores automáticas

\- \*\*CSS Inline Profissional\*\*: Formatação aprimorada do texto do relatório



\### 🔧 Corrigido

\- \*\*Caracteres Quebrados\*\*: PDF agora exporta sem emojis/acentos corrompidos

\- \*\*Layout Redundante\*\*: Removida seção duplicada "Distribuição do Seu Tempo"

\- \*\*Import Missing\*\*: Adicionado `getCenarioColor` e `getCenarioIcon` nos componentes

\- \*\*Header Genérico\*\*: Personalização com dados reais do perfil do usuário



\### 🎨 Melhorado

\- \*\*Performance PDF\*\*: Geração 3x mais rápida sem dependência do html2canvas

\- \*\*UX Limpa\*\*: Interface mais enxuta com informação consolidada

\- \*\*Responsividade\*\*: Layout otimizado para mobile e desktop

\- \*\*Typography\*\*: Hierarquia visual melhorada no relatório



\### 📊 Técnico

\- \*\*Arquivos Modificados\*\*: `page.tsx`, `index.tsx` (diagnostico), engine confirmado

\- \*\*Limpeza de Imports\*\*: Consolidação de imports duplicados

\- \*\*Estado Otimizado\*\*: Interface `dadosUsuario` com suporte a emoji



---



\## \[v1.8.2] - 2025-08-20 - 🔄 Fluxo Padronizado + Interface Profissional



\### ✅ Adicionado

\- \*\*Fluxo ROI do Foco\*\*: Design idêntico nas 3 páginas principais (Mapa/Diagnóstico/Plano)

\- \*\*Nome Real\*\*: Busca automática na tabela `profiles` com fallback para email

\- \*\*Métricas Coloridas\*\*: Grid 2x2 (mobile) / 1x4 (desktop) com cores padronizadas

\- \*\*Progress Steps\*\*: Indicação visual do progresso no fluxo (verde/laranja/cinza)

\- \*\*Data Formatada\*\*: Português brasileiro em todos os componentes



\### 🔧 Corrigido

\- \*\*Busca de Perfil\*\*: Correção de `display\_name` para `full\_name`

\- \*\*Props Incorretos\*\*: Dados do usuário e resultado passados corretamente

\- \*\*Visual Inconsistente\*\*: Unificação do design entre todas as páginas



\### 🎨 Melhorado

\- \*\*Design System\*\*: Cores/espaçamentos/typography padronizados

\- \*\*Modularidade\*\*: Componente RelatorioView reutilizável

\- \*\*Accessibility\*\*: Contraste melhorado e estrutura semântica



---



\## \[v1.8.1] - 2025-08-18 - 🧠 Heurística V2.1 + Edição Profissional



\### ✅ Adicionado

\- \*\*IA V2.1 Robusta\*\*: 6 padrões principais + scoring inteligente

\- \*\*Sistema de Edição\*\*: Modal pré-preenchido para táticas existentes

\- \*\*Tags Visuais\*\*: TAREFA (amarelo) vs HÁBITO (azul) com diferenciação automática

\- \*\*IDs Únicos\*\*: Sistema timestamp + random para eliminar keys duplicadas

\- \*\*Preservação de Categoria\*\*: Mantém categoria original ao editar



\### 🔧 Corrigido

\- \*\*Keys Duplicadas\*\*: Zero erros de React rendering

\- \*\*Botões Não Funcionais\*\*: Modal unificado conectado a todos os botões

\- \*\*Impactos Inconsistentes\*\*: Sistema manual para configuração



\### 🎨 Melhorado

\- \*\*Interface Profissional\*\*: Layout com grid e ícones organizados

\- \*\*Qualidade IA\*\*: Barreira de 75% + sempre 2+ sugestões por zona

\- \*\*Manutenibilidade\*\*: Código documentado com TODOs para futuro



---



\## \[v1.8.0] - 2025-08-15 - 🎯 Framework DAR CERTO + IA Automática



\### ✅ Adicionado

\- \*\*Framework DAR CERTO\*\*: 8 categorias implementadas (Delegar/Automatizar/Reduzir/etc)

\- \*\*IA V2.0\*\*: Motor de sugestões automáticas baseado em padrões

\- \*\*Sistema TAREFA vs HÁBITO\*\*: Flexibilidade total na criação

\- \*\*Modal Guiado\*\*: Interface para inserção manual com seleção de categoria

\- \*\*Ordenação Inteligente\*\*: Atividades priorizadas pelo diagnóstico



\### 🔧 Corrigido

\- \*\*Integração Sequencial\*\*: Fluxo Diagnóstico → Plano completamente funcional

\- \*\*Orientação Automática\*\*: Seção baseada no foco identificado



---



\## \[v1.7.0] - 2025-08-12 - 📊 Diagnóstico Automático + Relatórios



\### ✅ Adicionado

\- \*\*Motor de Análise\*\*: 5 focos identificados automaticamente

\- \*\*Relatórios Detalhados\*\*: Cenário + recomendações + meta personalizada

\- \*\*Export Profissional\*\*: PDF e JSON para acompanhamento

\- \*\*3 Cenários\*\*: Saudável/Ajustes/Crítico com análise contextual



\### 🎨 Melhorado

\- \*\*Integração com Plano\*\*: Dados salvos automaticamente para próximo passo



---



\## \[v1.6.0] - 2025-08-10 - 🎨 Layout Otimizado + UX Consistente



\### ✅ Adicionado

\- \*\*Header com Fluxo\*\*: Progress bar visual nas páginas principais

\- \*\*Menu Retrátil\*\*: Transições suaves na navegação

\- \*\*Reorganização\*\*: Página de diagnóstico reestruturada



\### 🎨 Melhorado

\- \*\*UX Consistente\*\*: Design padronizado entre todas as páginas



---



\## \[v1.5.0] - 2025-08-08 - 👤 Perfil Completo + LGPD



\### ✅ Adicionado

\- \*\*Página de Perfil\*\*: Configurações pessoais completas

\- \*\*Sistema LGPD\*\*: Compliance total com exportação de dados

\- \*\*Modal de Termos\*\*: Integrado na experiência do usuário

\- \*\*Emojis de Perfil\*\*: Personalização visual do usuário



---



\## \[v1.4.0] - 2025-08-05 - 🧩 Wave 1 Modular + Design System



\### ✅ Adicionado

\- \*\*19 Componentes Modulares\*\*: Base sólida para escalabilidade

\- \*\*Design System\*\*: Centralizado com tokens de cores/espaçamentos

\- \*\*Arquitetura Enterprise\*\*: Separação clara de responsabilidades



---



\## \[v1.3.0] - 2025-08-02 - 🔍 Sistema de Diagnóstico



\### ✅ Adicionado

\- \*\*Motor de Análise Heurística\*\*: Primeiro algoritmo de diagnóstico

\- \*\*Relatórios Automáticos\*\*: Geração baseada em padrões identificados

\- \*\*Export Básico\*\*: PDF/JSON inicial



---



\## \[v1.2.0] - 2025-07-30 - 🗺️ Mapa de Atividades Core



\### ✅ Adicionado

\- \*\*Gráfico Interativo\*\*: Impacto × Clareza com 4 zonas automáticas

\- \*\*CRUD Completo\*\*: Criar, editar, excluir atividades

\- \*\*Zonificação Automática\*\*: Distração/Tática/Estratégica/Essencial

\- \*\*Export PNG\*\*: Download da visualização



---



\## \[v1.1.0] - 2025-07-25 - 🔐 Autenticação + Banco



\### ✅ Adicionado

\- \*\*Supabase Integration\*\*: Banco PostgreSQL + RLS

\- \*\*Sistema de Auth\*\*: Login/cadastro seguro

\- \*\*Tabelas Core\*\*: Atividades + Profiles + Políticas



---



\## \[v1.0.0] - 2025-07-20 - 🚀 MVP Inicial



\### ✅ Adicionado

\- \*\*Landing Page\*\*: Design profissional + newsletter integration

\- \*\*Estrutura Base\*\*: Next.js + TypeScript + Tailwind

\- \*\*Deploy\*\*: Vercel com domínio personalizado



---



\## 📝 TEMPLATE PARA PRÓXIMAS VERSÕES



```markdown

\## \[vX.Y.Z] - YYYY-MM-DD - 🎯 Título da Release



\### ✅ Adicionado

\- \*\*Feature Nome\*\*: Descrição clara do que foi adicionado



\### 🔧 Corrigido  

\- \*\*Bug Nome\*\*: Descrição do problema que foi resolvido



\### 🎨 Melhorado

\- \*\*Área Nome\*\*: Descrição da melhoria implementada



\### 📊 Técnico

\- \*\*Arquivos\*\*: Lista dos principais arquivos modificados

\- \*\*Breaking Changes\*\*: Se houver mudanças que quebram compatibilidade



\### 🚨 Depreciado

\- \*\*Feature Antiga\*\*: O que será removido em versões futuras



\### ❌ Removido

\- \*\*Feature Removida\*\*: O que foi completamente removido

```



---



\*\*📝 Mantido por:\*\* Equipe de desenvolvimento  

\*\*🔄 Atualizado:\*\* A cada release  

\*\*📋 Formato:\*\* \[Keep a Changelog](https://keepachangelog.com/)

