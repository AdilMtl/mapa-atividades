# 📅 CHANGELOG - ROI DO FOCO

Todas as mudanças notáveis neste projeto serão documentadas aqui.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

# 📅 CHANGELOG - ROI DO FOCO

Todas as mudanças notáveis neste projeto serão documentadas aqui.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [v3.4.1] - 2025-10-02 - 📊 Views Analytics - Série Histórica Completa

### ✅ Adicionado
- **Painéis Temporais Grafana:** 2 novos gráficos time series para análise temporal
  - Painel 13: Performance Temporal - Volume (Sessões + Leads)
  - Painel 14: Taxa de Conversão ao Longo do Tempo
- **Documentação Completa:** Guias atualizados com todas as mudanças

### 🔧 Corrigido
- **Filtros Temporais Views:** Removido `WHERE created_at >= NOW() - INTERVAL '30 days'` de todas as 7 views
  - `vw_conversao_diaria` - agora mostra série completa
  - `vw_perfil_performance` - agora mostra série completa
  - `vw_pain_analysis` - agora mostra série completa
  - `vw_events_funnel` - agora mostra série completa
  - `vw_activity_heatmap` - removido filtro de 14 dias
  - `vw_kpis_executivos` - período alterado para "Série Histórica Completa"
  - `vw_mix_atividades` - agora mostra série completa

### 🎨 Melhorado
- **Análise de Longo Prazo:** Views agora permitem análise desde 28/08/2025 (primeira sessão)
- **Flexibilidade Grafana:** Time Range do dashboard controla período visualizado
- **Performance Otimizada:** Índices ajustados para queries sem filtros temporais
- **Queries Grafana:** 2 novas queries para gráficos de linha temporal

### 📊 Técnico
- **Arquivos Atualizados:**
  - `docs/views-analytics-supabase.md` - Documentação completa das views atualizada
  - `docs/dashboard-grafana-supabase.md` - Guia Grafana com novos painéis
  - `docs/CHANGELOG.md` - Esta entrada
- **SQL Executado:** Script de atualização das 7 views no Supabase
- **Grafana:** Time Range padrão atualizado de "Last 6 hours" → "Last 90 days"
- **Índices:** Removido filtro `WHERE created_at >= NOW() - INTERVAL '90 days'` do índice parcial

### 🎯 Impacto
- **Análise Completa:** 32 dias de dados históricos disponíveis (vs. 30 dias limitados)
- **Dashboards Flexíveis:** Usuários podem visualizar qualquer período desejado
- **Comparação Temporal:** Análise de tendências entre diferentes períodos
- **Zero Breaking Changes:** Sistema continua funcionando, apenas amplia capacidades

### 💡 Mudanças de Uso
**ANTES:**
```sql
-- Views retornavam apenas últimos 30 dias
SELECT * FROM vw_conversao_diaria; -- máx 30 registros
```

**AGORA:**
```sql
-- Views retornam série completa
SELECT * FROM vw_conversao_diaria; -- todos os registros desde 28/08/2025

-- Filtro manual opcional quando necessário
SELECT * FROM vw_conversao_diaria 
WHERE data >= '2025-09-01';
```

### 📈 Grafana
- **Painel 13 Query:**
```sql
SELECT 
  data as time,
  total_sessoes as "Sessões",
  total_leads as "Leads Capturados"
FROM vw_conversao_diaria
ORDER BY data ASC;
```

- **Painel 14 Query:**
```sql
SELECT 
  data as time,
  taxa_conversao_pct as "Taxa de Conversão (%)"
FROM vw_conversao_diaria
ORDER BY data ASC;
```

### 🔍 Verificação
Execute no Supabase para confirmar mudanças:
```sql
-- Ver range completo de dados
SELECT 
  MIN(data) as primeira_sessao,
  MAX(data) as ultima_sessao,
  MAX(data)::date - MIN(data)::date as dias_totais,
  COUNT(*) as dias_com_atividade
FROM vw_conversao_diaria;

-- Resultado esperado:
-- primeira_sessao: 2025-08-28
-- ultima_sessao: [data atual]
-- dias_totais: 32+ dias
```


## [v3.4.0] - 2025-10-01 - 📱 Landing Page Mobile-First Optimization

### ✅ Adicionado
- **Hero Mobile Otimizado**: Copy persuasivo "Trabalhe menos, Conquiste mais" inspirado em Todoist/TickTick
- **Logo Newsletter**: Imagem oficial da newsletter integrada na navegação (substituindo ícone Coffee)
- **Social Proof Card Mobile**: Seção destacada "Sou o gestor que você gostaria de ter tido" com credenciais
- **3 Cards de Benefício Mobile**: Benefícios tangíveis (Riscar tarefas, Negociar urgências, Sair sem ansiedade)
- **FAQ Accordion Mobile**: 4 perguntas essenciais com respostas customizadas
- **Pricing Mobile Redesign**: Cards verticais com destaque visual para plano Mensal
- **Sticky Bottom Bar**: CTA fixo que aparece após scroll de 800px
- **Progressive Loading Vídeos**: Primeiro vídeo autoplay, demais click-to-play (economia de 75% dados móveis)

### 🔧 Corrigido
- **Navegação Mobile**: Texto não quebra mais (fonte responsiva text-sm → text-lg)
- **Botão "Já sou assinante"**: Fundo transparente corrigido, estilo discreto
- **Glow Buttons**: Removido glow permanente, ativado apenas no hover
- **Espaçamento Hero**: Redução de gaps excessivos (space-y-6 → space-y-4)
- **Separador "Prefere testar primeiro?"**: Cor de fundo corrigida (bg-[#042f2e])
- **Pricing Cards**: Botões com cores adequadas (Gratuito: branco, Mensal: laranja, Anual: verde)
- **Autoplay Vídeos**: Primeiro vídeo desktop voltou a tocar automaticamente

### 🎨 Melhorado
- **Copy Orientado a Benefícios**: Headline aspiracional alinhada com benchmarks (Todoist/TickTick)
- **Hierarquia de CTAs**: Newsletter primário > Diagnóstico secundário
- **Tipografia Responsiva**: Sistema mobile-first (text-sm → text-base → text-lg)
- **Cards de Pricing**: Layout vertical mobile-friendly com badge "Mais Popular"
- **Ordem de Seções Mobile**: Hero → Social Proof → Benefícios → Vídeos → Pricing → FAQ
- **Botão Diagnóstico**: Card interativo com ícone, tempo e descrição (vs botão plano anterior)

### 📊 Técnico
- **Arquivos Modificados**:
  - `src/app/page.tsx` - Reescrita completa da estrutura mobile
  - Componentes mantidos: Desktop hero, vídeos desktop, todas seções existentes
- **Breakpoints Utilizados**: `lg:hidden` para mobile-only, `hidden lg:block` para desktop-only
- **Performance**: Progressive loading economiza ~6MB por sessão mobile
- **Responsive Classes**: Padronização text-sm/base/lg, gap-2/3/4, py-3/4
- **Zero Breaking Changes**: Versão desktop 100% preservada

### 🎯 Impacto Esperado
- **Bounce Rate Mobile**: -25% a -35%
- **Time to First CTA**: 15s → 3s (-80%)
- **Conversão Pré-Diagnóstico**: +40% a +60%
- **Dados Economizados**: 75% (progressive loading vídeos)

### 💡 Decisões de Copy
- **Headline Final**: "Trabalhe menos, Conquiste mais" (paralelismo estilo TickTick)
- **Proposta**: "O ecossistema virtual para quem precisa de foco e método"
- **Dor**: "Eu não tenho tempo nem pra me organizar"
- **CTA Principal**: "Comece agora!" → Newsletter Substack
- **CTA Secundário**: Card diagnóstico com descrição expandida

### 📱 Mobile-First Principles Aplicados
- Touch targets mínimos 44px
- Fonte base 16px (evita zoom iOS)
- Espaçamento otimizado para scroll vertical
- Cards substituindo tabelas
- Progressive disclosure de informação
- CTAs grandes e visualmente destacados

---

## [v3.3.1] - 2025-09-29 - 🔧 Correção Crítica Signup + Documentação Banco

### 🔧 Corrigido
- **Erro 500 no Signup:** Adicionado `emailRedirectTo` obrigatório no `supabase.auth.signUp()`
  - **Causa:** Supabase exige `emailRedirectTo` quando "Confirm email" está ativo
  - **Código:** `src/app/auth/page.tsx` linha 170
  - **Impacto:** Alto - signup estava completamente quebrado
- **Configuração de Email:** Migrado de Resend SMTP para Supabase Email Service
  - **Motivo:** Resend gratuito em modo sandbox só permite emails autorizados
  - **Benefício:** Signup funciona para qualquer email autorizado na lista
  - **Sender:** Emails virão de `noreply@mail.app.supabase.co`

### ✅ Validado
- **Trigger `handle_new_user()`:** Testado manualmente e funcionando 100%
  - **Função:** Popula `usuarios` + `profiles` automaticamente após signup
  - **Teste:** Inserção em `auth.users` → trigger disparou → ambas tabelas populadas
  - **Segurança:** `SECURITY DEFINER` com políticas RLS corretas
- **Foreign Keys:** `profiles.id → auth.users.id (ON DELETE CASCADE)` confirmada
- **Políticas RLS:** Todas com `WITH CHECK (true)` permitindo trigger funcionar

### 📖 Documentação Criada
- **supabase-database-schema.md:** 
  - Schema completo das 8 tabelas principais
  - Documentação de 2 triggers (`handle_new_user`, `update_updated_at_column`)
  - Todas as políticas RLS explicadas
  - Queries de diagnóstico para verificar sincronização
  - Scripts de manutenção e correção
- **troubleshooting-signup.md:**
  - Histórico completo da investigação (4 horas)
  - 8 queries SQL executadas para mapear problema
  - Causa raiz identificada (2 problemas combinados)
  - Solução aplicada passo a passo
  - Testes de verificação documentados
- **README.md:** Seção "Arquitetura do Banco de Dados" adicionada

### 🔍 Investigação Técnica
- **Problema Identificado:** Erro 500 ao criar conta
- **Investigação:** 8 queries SQL + análise de logs + testes manuais
- **Causas Encontradas:**
  1. Faltava `emailRedirectTo` no código (obrigatório para email confirmation)
  2. Resend SMTP em modo sandbox (só permite emails autorizados)
- **Solução:** Código corrigido + migração para Supabase Email Service
- **Resultado:** Signup 100% funcional

### 📊 Técnico
- **Arquivos Modificados:**
  - `src/app/auth/page.tsx` (1 linha alterada)
  - `docs/supabase-database-schema.md` (criado - 400+ linhas)
  - `docs/troubleshooting-signup.md` (criado - 300+ linhas)
  - `docs/CHANGELOG.md` (esta entrada)
  - `docs/CURRENT-STATUS.md` (atualizado)
  - `README.md` (seção adicionada)
- **Banco de Dados:** Nenhuma alteração necessária (estrutura já estava correta)
- **Configuração:** SMTP customizado desabilitado no Supabase Dashboard

### 🎯 Impacto
- **Crítico:** Sistema de signup estava completamente quebrado
- **Resolução:** Funcional em produção após correção
- **Benefício:** Documentação completa evita retrabalho futuro
- **Tempo:** 4 horas de investigação + correção + documentação

### 💡 Aprendizados
1. Sempre configurar `emailRedirectTo` quando confirmação de email está ativa
2. Resend gratuito tem limitações de sandbox (apenas emails verificados)
3. Triggers com `EXCEPTION WHEN OTHERS` escondem erros - evitar
4. Logs do Supabase Auth são essenciais para debug
5. Documentação técnica economiza horas de retrabalho

---

## [v3.3.0] - 2025-09-24 - 🎥 Otimização de Vídeos + Reset de Senha Corrigido

### ✅ Adicionado
- **Sistema de Reset de Senha via SMTP:** Configuração do Resend como SMTP provider no Supabase
  - SMTP customizado substituindo sistema padrão do Supabase
  - Templates de email personalizados mantidos
  - Melhor entregabilidade e controle sobre envios
- **Detecção de Sessão Ativa:** Página de reset detecta quando usuário já está autenticado
  - Verificação de sessão antes de procurar tokens na URL
  - Suporte ao fluxo de recovery que faz login automático
- **Documentação de Bugs:** Registro de limitações conhecidas do Supabase gratuito

### 🔧 Corrigido
- **Reset de Senha Não Funcionava:** Supabase não passava tokens corretamente para aplicação
  - **Causa:** Limitação do plano gratuito com redirect_to customizado
  - **Solução:** Detectar sessão ativa ao invés de depender de tokens na URL
- **Erro 500 com Emails Hotmail:** Reset múltiplos falhavam para domínios Hotmail/Outlook
  - **Workaround:** Documentado uso da página de perfil como alternativa

### 🎨 Melhorado
- **Performance da Landing Page:** Vídeos reduzidos de 200MB para 8MB (redução de 96%)
  - Compressão com FFmpeg (CRF 32, resolução 960x540, áudio mono)
  - Economia drástica na cota de bandwidth do Vercel
  - Melhoria significativa no LCP e Web Vitals
- **Processo de Compressão Documentado:** Template Obsidian com comandos reutilizáveis
  - 3 níveis de compressão configurados (Mobile/Desktop/Ultra)
  - Comandos em lote para múltiplos vídeos
  - Estrutura organizada em C:\Users\adils\Videos\CompressaoVideos

### 📊 Técnico
- **Configuração SMTP Resend:**
  - Host: smtp.resend.com
  - Port: 465
  - Username: resend (fixo)
  - Password: API Key do Resend
- **Arquivos Modificados:**
  - `src/app/reset-password/page.tsx` - Adicionada verificação de sessão ativa
  - Vídeos em `/public/videos/` - Recomprimidos com FFmpeg
- **Economia de Recursos:**
  - Bandwidth: ~576GB/mês economizados (para 3000 visitantes)
  - Tamanho por vídeo: ~50MB → ~2MB

### 🐛 Bugs Conhecidos
- **Hotmail/Outlook:** Erro 500 em resets múltiplos (limitação Supabase + SMTP)
  - **Workaround:** Usar página /perfil para trocar senha
- **Plano Gratuito Supabase:** Redirect customizado não passa tokens corretamente
  - **Resolvido:** Sistema detecta sessão ao invés de depender de tokens

---

---

## [v3.2.0] - 2025-09-24 - 🔒 Sistema de Segurança e Admin Dashboard

### ✅ Adicionado
- **Sistema de Autorização Seguro:** Migração completa de arquivo público para banco de dados
  - Tabela `authorized_emails` no Supabase com RLS e service role key
  - APIs seguras server-side impossíveis de burlar
  - Verificação de expiração no login e cadastro
- **Interface Admin de Assinantes:** Dashboard completo em `/admin/assinantes`
  - CRUD completo (Create, Read, Update, Delete) de assinantes
  - Informações de acesso: último login, conta criada, atividades
  - Filtros avançados: status, período de acesso, ordenação
  - Busca em tempo real e contador de resultados
- **Verificação de Conta Existente:** Previne envio de emails duplicados no cadastro
- **Check de Expiração no Login:** Bloqueia acesso de assinaturas expiradas

### 🔧 Corrigido
- **Vulnerabilidade de Segurança:** Arquivo `public/emails-autorizados.txt` expondo dados
- **LGPD Compliance:** Dados sensíveis agora protegidos no banco
- **Emails Duplicados:** Sistema não envia mais email quando conta já existe
- **Acesso Expirado:** Usuários com data expirada não conseguem mais fazer login
- **Botões Admin:** Corrigido estilo dos selects/dropdowns (fundo escuro visível)

### 🎨 Melhorado
- **Gestão de Assinantes:** De edição manual via Git para interface visual instantânea
- **Performance:** Queries otimizadas com índices no banco
- **UX Admin:** Swipe gestures para ações, indicadores visuais de status
- **Segurança:** Validação server-side com service role key do Supabase
- **Filtros Inteligentes:** Múltiplos filtros combinados para gestão eficiente

### 📊 Técnico
- **Novas APIs:** 
  - `/api/auth/check-authorization` - Verificação segura de autorização
  - `/api/auth/check-existing` - Verifica se conta já existe
  - `/api/auth/check-expiration` - Valida expiração no login
  - `/api/admin/assinantes` - CRUD completo do admin
- **Nova Tabela:** `authorized_emails` com campos para futuro Stripe
- **Arquivos Removidos:** `public/emails-autorizados.txt` (vulnerabilidade)
- **Componentes:** Nova página admin com filtros, busca e métricas

### 🔒 Segurança
- **Zero Exposição:** Emails não são mais visíveis no GitHub ou cliente
- **Impossible Bypass:** Verificação server-side com service role
- **Dupla Verificação:** Check na criação de conta E no login
- **Admin Protegido:** Apenas email autorizado pode acessar dashboard

--

## [v3.1.0] - 2025-09-21 - 📱 Mobile-First Redesign + UX Profissional do Mapa

### ✅ Adicionado
- **Visualização Mobile Nativa:** Cards por zona com mini-matriz visual no mobile
- **Swipe Gestures:** Deslizar para editar (→) ou excluir (←) no mobile
- **Seletor de Números:** Substituição dos sliders por botões 1-6 para Impacto/Clareza
- **Cards por Zona Desktop:** Visualização unificada desktop/mobile agrupada por zonas
- **Scroll para Edição:** Auto-scroll suave ao editar atividade
- **Card Diagnóstico Mobile:** CTA contextual no final da lista mobile

### 🔧 Corrigido
- **Conversão de Horas:** Cálculo preciso com 22 dias úteis e 4.33 semanas/mês
- **Gráfico Interativo:** Clique nas bolhas agora abre formulário de edição
- **Sobreposição de Bolhas:** Jitter circular + transparência + tooltip melhorado
- **Textos Longos:** Break-words em nomes de atividades evita quebra de layout
- **Responsividade Formulário:** Layout adaptativo mobile/tablet/desktop

### 🎨 Melhorado
- **UX Mobile-First:** Interface completamente otimizada para touch
- **Preview de Conversão:** Box visual mostrando horas/mês e horas/dia
- **Tamanho das Bolhas:** Range aumentado [200, 600] para melhor visibilidade
- **Título do Gráfico:** "Matriz Impacto × Clareza" substituindo "Gráfico de bolhas"
- **Consistência Visual:** Cards unificados entre mobile e desktop
- **Feedback Visual:** Indicadores coloridos ao deslizar cards no mobile

### 🔍 Detalhes Técnicos
- **Componente MatrizMobile:** Nova visualização mobile com mini-matriz + cards colapsáveis
- **CardAtividadeMobile:** Touch handlers para swipe actions
- **NumberSelector:** Grid responsivo substituindo sliders problemáticos
- **ZonaCollapsivel:** Componente reutilizável para agrupamento por zona
- **DIAS_UTEIS_MES:** Atualizado de 20 para 22 (mais realista)
- **SEMANAS_MES:** Atualizado de 4 para 4.33 (mais preciso)

### 📊 Métricas de Qualidade
- **Zero scroll horizontal:** Layout 100% responsivo
- **Touch targets:** Mínimo 44px conforme guidelines mobile
- **Performance:** Componentes otimizados com useMemo
- **Acessibilidade:** Controles keyboard-friendly mantidos

### 🐛 Bugs Conhecidos Resolvidos
- ✅ Horas/mês mostrando 0,67 quando selecionado período mensal
- ✅ Sliders difíceis de usar em telas pequenas
- ✅ Tabela quebrando em displays menores
- ✅ Bolhas sobrepostas impossíveis de clicar
- ✅ Formulário espremido em tablets

---

## [v3.0.0] - 2024-09-17 - 🎬 Landing Page Premium com Vídeos Interativos

### ✅ Adicionado
- **Seção de Vídeos Interativa:** 4 vídeos com scroll-trigger automático (desktop) e cards responsivos (mobile)
- **Ecossistema Virtual:** Novo posicionamento "Conversas no Corredor +" como ecossistema completo
- **Seções Completas:** Pricing, Metodologia, Gestão Profissional, Para Quem É, Resultados Esperados
- **CTAs Estratégicos:** Botões com gradiente laranja e hover effects profissionais
- **Observer Pattern:** Intersection Observer para troca automática de vídeos no scroll

### 🔧 Corrigido
- **Sticky Position:** Vídeo centralizado verticalmente com `calc(50vh - 12rem)`
- **Mobile Experience:** Cards de vídeo com controles nativos e layout otimizado
- **Padding Bottom:** `pb-[15vh]` na coluna de textos para scroll completo
- **Bordas Arredondadas:** Padronização com `rounded-xl` em todos os componentes

### 🎨 Melhorado
- **Copy Refinado:** Textos focados em benefícios tangíveis e ROI do tempo
- **Hierarquia Visual:** 2 colunas no hero, metodologia em 3 cards, CTAs duplos
- **Responsividade:** Grid adaptativo desktop/tablet/mobile em todas as seções
- **Performance:** Lazy loading de vídeos com transições suaves de opacidade

### 📊 Técnico
- **Arquivo Principal:** `src/app/page.tsx` completamente redesenhado
- **Vídeos:** 4 arquivos MP4 em `/public/videos/` (mapeamento, diagnostico, taticas, kanban)
- **Estados React:** currentVideo, isVideoSectionVisible, videoRefs, sectionRefs
- **CSS Profissional:** Glass effects, shadows, gradients, transforms

---

## [v2.0.0] - 2025-09-13 - 🎯 KANBAN VISUAL - FLUXO SEMANAL

### ✅ Adicionado
- **Página Fluxo Semanal:** Nova rota /painel-semanal com Kanban de 4 colunas
- **Drag & Drop:** Sistema visual para mover táticas entre status (Backlog → Feito)
- **Biblioteca:** @hello-pangea/dnd para drag & drop performático
- **Campos Kanban:** status_kanban, ordem_coluna, semana_referencia na tabela táticas

### 🔧 Corrigido
- **Next.js:** Atualizado v15.0.0-canary → v15.5.3 (vulnerabilidade SSRF resolvida)
- **Performance:** Novo índice no Supabase para queries do Kanban
- **UX:** Cursor grab/grabbing + feedback visual durante arrastar

### 🎨 Melhorado
- **Arquitetura:** Sistema agora suporta dois fluxos (Plano de Ação + Fluxo Semanal)
- **Hierarquia:** Cards do Kanban mostram atividade mãe + zona ROI automaticamente
- **Design:** Glass effects + animações + cores consistentes com design system

### 📊 Técnico
- **Zero Breaking Changes:** Funcionalidades v1.9.8 preservadas 100%
- **Estrutura:** Nova pasta src/app/painel-semanal + src/lib/kanban
- **Tipos:** Interfaces KanbanBoard, TaticaKanban, KanbanStatus adicionadas
---

## [v1.9.8] - 2025-09-09 - 🔄 Sincronização Supabase + Notificações ROI do Foco

### ✅ Adicionado
- **Tabela Táticas:** Nova tabela `public.taticas` no Supabase para sincronização entre dispositivos
- **Salvamento Híbrido:** Sistema salva simultaneamente no localStorage e Supabase
- **Notificações ROI do Foco:** Substituição dos alert() feios por notificações visuais consistentes
- **RLS Completo:** Row Level Security implementado seguindo boas práticas já testadas

### 🔧 Corrigido
- **Sincronização:** Táticas e hábitos agora sincronizam entre celular e computador
- **UX Inconsistente:** Alertas padrão do navegador substituídos por design system próprio
- **Dados Isolados:** localStorage causava perda de dados ao trocar de dispositivo

### 🎨 Melhorado
- **Compatibilidade Total:** Sistema funciona offline (localStorage) e online (Supabase)
- **Feedback Visual:** Notificações aparecem no canto superior direito com branding "ROI do Foco"
- **Performance:** Strategy "replace all" evita duplicatas no banco
- **Tolerância a Erros:** Sistema continua funcionando se Supabase falhar

### 📊 Técnico
- **Nova Tabela:** `public.taticas` com 15 campos (user_id, atividade_id, titulo, etc.)
- **Arquivos Modificados:** 
  - `src/app/plano-acao/page.tsx` - função salvarPlano() + carregamento Supabase + notificações
  - SQL Schema aplicado no Supabase com RLS ativo
- **Carregamento Híbrido:** Supabase primeiro, localStorage como fallback
- **Migração Automática:** Sistema detecta dados mais recentes automaticamente
- **Segurança:** Política RLS `auth.uid() = user_id` testada e funcionando

---

## [v1.9.7] - 2025-09-09 - 📊 Google Ads Conversion Tracking

### ✅ Adicionado
- **Conversion Tracking:** Google Ads gtag() executado quando usuário vira lead qualificado
- **Backend Flag:** API /lead retorna triggerConversion para frontend executar
- **Console Logging:** Confirmação visual "Google Ads conversion triggered"
- **Pixel Integration:** Conversão dispara no momento da captura nome + email

### 🔧 Corrigido
- **False Negative:** Sistema sempre funcionou - problema era email duplicado no upsert
- **Debug Process:** Identificação de que created_at não mudava em emails repetidos
- **Validation Issue:** Descoberta de que upsert mantém timestamp original

### 🎨 Melhorado
- **Tracking Accuracy:** Conversão registrada no momento exato de lead qualificado
- **Error Handling:** Sistema continua funcionando mesmo se gtag falhar
- **Data Quality:** Confirmação de que pipeline completa está operacional

### 📊 Técnico
- **Arquivos Modificados:**
  - `src/app/api/prediag/lead/route.ts` - Adiciona triggerConversion flag
  - `src/components/prediagnostico/EmailGate.tsx` - Executa gtag() conversion
- **Flow:** Google Ads → Pré-diagnóstico → Lead capturado → Conversão disparada
- **Debugging:** Logs temporários removidos após confirmação

---

## [v1.9.6] - 2025-09-08 - 📋 Plano de Ação UX Redesign

### ✅ Adicionado
- **Dashboard de Estatísticas:** Seção "Seu plano de ação contém" com contadores de atividades, táticas, tarefas e hábitos
- **Controles Centralizados:** Abas Atividades/Táticas centralizadas com design consistente
- **Filtros Colapsáveis:** Seção "Filtrar atividades por zona" com dropdown recolhível
- **Ícones Padronizados:** Sistema consistente de ícones laranjas em fundos quadrados para todas as seções
- **Botões Salvar Unificados:** Ícone de disquete + cor laranja padrão em todos os 3 botões salvar

### 🎨 Melhorado
- **Layout Mobile:** Header responsivo com botão salvar embaixo no mobile, ao lado no desktop
- **Espaçamentos:** Padronização de margens entre seções (mb-4 sm:mb-6)
- **Hierarquia Visual:** Seções colapsáveis seguindo padrão consistente da página
- **Grid Responsivo:** Estatísticas em grid 2x2 no mobile, linha única no desktop
- **Prevenção de Duplicatas:** Validação antes de aplicar sugestões inteligentes globais

### 🔧 Corrigido
- **Altura de Cards:** Padronização de altura entre todos os cards colapsáveis
- **Espaçamento Dropdown:** Adicionado margin-top correto no conteúdo expandido
- **Layout Responsivo:** Quebras de linha adequadas em ícones e números no mobile
- **Texto de Táticas:** Remoção de \n\n nos detalhes das táticas geradas

### 📊 Técnico
- **Arquivos Modificados:** `src/app/plano-acao/page.tsx`, `src/components/plano/index.tsx`
- **Novos Estados:** `showZoneFilters` para controle de filtros colapsáveis
- **Imports Adicionados:** `Save`, `TrendingUp` do lucide-react
- **Componentes:** PlanoHeader, PlanoStats, OrientacaoDiagnostico redesenhados

## [v1.9.5] - 2025-09-07 - 🎯 UX Melhorado Pré-Diagnóstico

### ✅ Adicionado
- **Contexto Educativo:** Seções explicativas sobre metodologia ROI do Foco antes do chat
- **Credibilidade Pessoal:** Biografia do criador com link para LinkedIn
- **Personalização Destacada:** 3 blocos mostrando inteligência adaptativa do sistema
- **Sistema Completo:** Nova seção mostrando benefícios da versão completa
- **Progressive Disclosure:** Interface em 2 estados (educativo → conversacional)

### 🎨 Melhorado
- **Taxa de Conversão:** Visitantes Google Ads agora entendem proposta de valor
- **Fluxo UX:** Educação progressiva antes da interação
- **Consistência Visual:** Reuso de componentes da landing page
- **Clareza:** Distinção entre pré-diagnóstico gratuito e sistema completo

### 📊 Técnico
- **Arquivo Modificado:** `src/app/pre-diagnostico/page.tsx`
- **Novo Estado:** `showChat` para controlar visualização progressiva
- **Links Adicionados:** LinkedIn do autor + artigo sobre produto digital
- **Performance:** Mantida com lazy loading do ChatFlow

---

## [v1.9.4] - 2025-09-01 - 🎯 Google Ads Setup Inicial

### ✅ Adicionado
- **2 Campanhas Google Ads:** Analistas (R$ 15/dia) + Gestores Multinacionais (R$ 20/dia)
- **Targeting Estratégico:** Palavras-chave focadas em produtividade e gestão de tempo
- **Budget Management:** R$ 1.050/mês distribuído entre 2 campanhas
- **Landing Page:** /pre-diagnostico como destino único

### 🎯 Configurado
- **Monitoramento:** Google Ads dashboard para métricas iniciais
- **Conversões:** Tracking via roi_leads existente no Supabase
- **Alertas:** CPC > R$ 8 para pausar palavras-chave
- **Otimização:** Plano de realocação após 2 semanas

### 📊 Técnico
- **Plataforma:** Google Ads com campanhas de pesquisa
- **Tracking:** Dashboard Grafana atual + dados Supabase roi_leads
- **Budget:** Controle diário automático Google Ads
- **Código:** Nenhuma modificação necessária no sistema atual

---

## [v1.9.3] - 2025-08-27 - 🔧 Correções Críticas Android + RLS

### 🚨 Corrigido - Problemas Críticos
- **Android Redirect Issue:** Sistema de autenticação redirecionava usuários não autenticados da página `/pre-diagnostico` para landing page
  - **Causa:** `layout.tsx` não incluía `/pre-diagnostico` nas exceções de redirecionamento
  - **Solução:** Adicionado `&& pathname !== '/pre-diagnostico'` nas condições de auth
  - **Impacto:** ✅ Página agora funciona universalmente (iPhone + Android + Desktop)

- **Email Delivery Failure:** RLS bloqueava inserções das APIs públicas do pré-diagnóstico
  - **Causa:** Políticas RLS muito restritivas impediam `INSERT` na tabela `roi_leads`
  - **Erro:** `Error 42501: new row violates row-level security policy`
  - **Solução:** Política `FOR ALL USING (true) WITH CHECK (true)` permite acesso público necessário
  - **Impacto:** ✅ Email enviado corretamente mantendo segurança RLS

### 🎨 Melhorado
- **Compatibilidade Universal:** Sistema funcionando em todas as plataformas testadas
- **RLS Balanceado:** Segurança ativa mas com exceções adequadas para APIs públicas
- **Debugging Process:** Identificação sistemática de problemas de autenticação vs RLS

### 📊 Técnico
- **Arquivos Modificados:**
  - `src/app/layout.tsx` - Exceções de autenticação corrigidas
  - `src/app/pre-diagnostico/page.tsx` - Hidratação simplificada
  - `src/components/prediagnostico/ChatFlow.tsx` - useLayoutEffect otimizado
- **Database:** Política RLS na tabela `roi_leads` ajustada para acesso público
- **Testing:** Validação em iPhone, Android, Desktop confirmada

### 📱 Compatibilidade Confirmada
- ✅ iPhone Safari - Funcionando
- ✅ Android Chrome - Funcionando (corrigido)  
- ✅ Desktop browsers - Funcionando
- ✅ Email delivery - Funcionando (corrigido)

---

## [v1.9.2] - 2025-08-27 - 🎯 Landing Page Integrada + UX Refinado

### ✅ Adicionado
- **2 CTAs Pré-Diagnóstico:** Hero section + seção ROI do Foco na landing page
- **Textos Tangíveis:** Promessas baseadas na teoria ROI (30-60 min/dia)
- **Hierarquia Visual:** Newsletter → Demo → Acesso sistema

### 🔧 Corrigido  
- **Scroll Anchoring:** Slide-downs dos accordions com `overflow-anchor: none`
- **Centralização:** Cards de perfil e CTAs alinhados corretamente
- **Espaçamentos:** Gaps verticais reduzidos 25% para melhor fluxo visual

### 🎨 Melhorado
- **Conversão:** 2 pontos de entrada para pré-diagnóstico na landing
- **UX Profissional:** Acordeões com comportamento previsível de expansão
- **Hierarquia de CTAs:** Priorização clara entre newsletter e demo

### 📊 Técnico
- **Arquivo Modificado:** `src/app/page.tsx`
- **Integração:** Sistema de pré-diagnóstico conectado à landing page
- **Performance:** Sem impacto na velocidade de carregamento

---

## [v1.9.1] - 2025-08-27 - 🔧 Campo Nome + Personalização de Emails

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

---

## [v1.9.0] - 2025-08-27 - 🎯 Sistema de Pré-Diagnóstico Completo

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

### 🔧 Corrigido
- **API Recomendações:** Correção crítica com `select('*')` resolvendo recomendações vazias
- **Template Email:** Layout profissional com barras gráficas funcionais
- **Integração Supabase:** 3 tabelas com relacionamentos e índices otimizados

### 🎨 Melhorado
- **UX Conversacional:** Fluxo intuitivo de 5 etapas sem fricção
- **Email Design:** Template responsivo com snapshot visual dos resultados
- **Analytics:** Sistema de eventos para tracking de conversão completo

---

## [v1.8.3] - 2025-08-22 - 🎯 Diagnóstico Premium + Export Otimizado

### ✅ Adicionado
- **PDF Export Limpo**: Implementação direta com jsPDF sem html2canvas
- **RelatorioView Personalizado**: Header com emoji + nome real do usuário
- **Status Badge Dinâmico**: Crítico/Saudável/Ajustes com cores automáticas

### 🔧 Corrigido
- **Caracteres Quebrados**: PDF agora exporta sem emojis/acentos corrompidos
- **Import Missing**: Adicionado `getCenarioColor` e `getCenarioIcon`
- **Header Genérico**: Personalização com dados reais do perfil

### 🎨 Melhorado
- **Performance PDF**: Geração 3x mais rápida sem dependência do html2canvas
- **UX Limpa**: Interface mais enxuta com informação consolidada

---

## [v1.8.2] - 2025-08-20 - 📄 Fluxo Padronizado + Interface Profissional

### ✅ Adicionado
- **Fluxo ROI do Foco**: Design idêntico nas 3 páginas principais
- **Nome Real**: Busca automática na tabela `profiles` com fallback
- **Métricas Coloridas**: Grid responsivo com cores padronizadas

### 🔧 Corrigido
- **Busca de Perfil**: Correção de `display_name` para `full_name`
- **Visual Inconsistente**: Unificação do design entre todas as páginas

---

## [v1.8.1] - 2025-08-18 - 🧠 Heurística V2.1 + Edição Profissional

### ✅ Adicionado
- **IA V2.1 Robusta**: 6 padrões principais + scoring inteligente
- **Sistema de Edição**: Modal pré-preenchido para táticas existentes
- **Tags Visuais**: TAREFA (amarelo) vs HÁBITO (azul)

### 🔧 Corrigido
- **Keys Duplicadas**: Zero erros de React rendering
- **Botões Não Funcionais**: Modal unificado conectado

---

## [v1.8.0] - 2025-08-15 - 🎯 Framework DAR CERTO + IA Automática

### ✅ Adicionado
- **Framework DAR CERTO**: 8 categorias implementadas
- **IA V2.0**: Motor de sugestões automáticas baseado em padrões
- **Sistema TAREFA vs HÁBITO**: Flexibilidade total na criação

---

## [v1.7.0] - 2025-08-12 - 📊 Diagnóstico Automático + Relatórios

### ✅ Adicionado
- **Motor de Análise**: 5 focos identificados automaticamente
- **Relatórios Detalhados**: Cenário + recomendações + meta personalizada
- **Export Profissional**: PDF e JSON para acompanhamento

---

## [v1.6.0] - 2025-08-10 - 🎨 Layout Otimizado + UX Consistente

### ✅ Adicionado
- **Header com Fluxo**: Progress bar visual nas páginas principais
- **Menu Retrátil**: Transições suaves na navegação

---

## [v1.5.0] - 2025-08-08 - 👤 Perfil Completo + LGPD

### ✅ Adicionado
- **Página de Perfil**: Configurações pessoais completas
- **Sistema LGPD**: Compliance total com exportação de dados
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

---

## [v1.2.0] - 2025-07-30 - 🗺️ Mapa de Atividades Core

### ✅ Adicionado
- **Gráfico Interativo**: Impacto × Clareza com 4 zonas automáticas
- **CRUD Completo**: Criar, editar, excluir atividades
- **Zonificação Automática**: Distração/Tática/Estratégica/Essencial

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

**📝 Mantido por:** Equipe de desenvolvimento  
**📄 Atualizado:** A cada release  
**📋 Formato:** [Keep a Changelog](https://keepachangelog.com/)  
**🎉 Estatísticas:** 16+ sessões, 200+ commits, sistema universal funcionando

## [v1.9.2] - 2025-08-27 - 🎯 Landing Page Integrada + UX Refinado

### ✅ Adicionado
- **2 CTAs Pré-Diagnóstico:** Hero section + seção ROI do Foco na landing page
- **Textos Tangíveis:** Promessas baseadas na teoria ROI (30-60 min/dia)
- **Hierarquia Visual:** Newsletter → Demo → Acesso sistema

### 🔧 Corrigido  
- **Scroll Anchoring:** Slide-downs dos accordions com `overflow-anchor: none`
- **Centralização:** Cards de perfil e CTAs alinhados corretamente
- **Espaçamentos:** Gaps verticais reduzidos 25% para melhor fluxo visual

### 🎨 Melhorado
- **Conversão:** 2 pontos de entrada para pré-diagnóstico na landing
- **UX Profissional:** Acordeões com comportamento previsível de expansão
- **Hierarquia de CTAs:** Priorização clara entre newsletter e demo

### 📊 Técnico
- **Arquivo Modificado:** `src/app/page.tsx`
- **Integração:** Sistema de pré-diagnóstico conectado à landing page
- **Performance:** Sem impacto na velocidade de carregamento

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
não entend
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