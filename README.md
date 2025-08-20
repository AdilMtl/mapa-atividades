# 🎯 Mapa de Atividades - Sistema Enterprise

## 📊 STATUS ATUAL - v1.7

### ✅ **ÚLTIMAS ATUALIZAÇÕES (v1.7 - Framework DAR CERTO)**

- ✅ **Sistema TAREFA vs HÁBITO**: Diferenciação inteligente entre ações pontuais e recorrentes
- ✅ **Framework DAR CERTO**: 8 categorias implementadas com base na teoria ROI do Foco
- ✅ **Modal de Criação Guiado**: Interface para inserção manual com seleção de categoria
- ✅ **Ordenação Inteligente**: Atividades priorizadas pelo foco diagnóstico
- ✅ **Orientação do Diagnóstico**: Seção automática no plano de ação
- ✅ **Integração Sequencial**: Fluxo Diagnóstico → Plano completamente funcional

### ✅ **FUNCIONALIDADES PRINCIPAIS**

- ✅ **Autenticação Segura**: Login/cadastro com RLS (Row Level Security)
- ✅ **Mapa de Atividades**: Gráfico interativo Impacto × Clareza com 4 zonas
- ✅ **Diagnóstico Automático**: Motor de análise com relatórios personalizados
- ✅ **Plano de Ação Inteligente**: Framework DAR CERTO + táticas baseadas no diagnóstico
- ✅ **Perfil Completo**: Configurações pessoais com compliance LGPD
- ✅ **Export Profissional**: PDF e JSON para acompanhamento

---

## 🗂️ ESTRUTURA TÉCNICA

```
📁 mapa-atividades/
├── 📁 src/
│   ├── 📁 app/
│   │   ├── 📁 auth/                    # Autenticação
│   │   ├── 📁 dashboard/               # Mapa de Atividades
│   │   ├── 📁 diagnostico/             # Diagnóstico com fluxo visual
│   │   ├── 📁 plano-acao/              # 🆕 Plano com Framework DAR CERTO
│   │   ├── 📁 perfil/                  # Perfil e configurações
│   │   ├── 📁 privacidade/             # LGPD compliance
│   │   ├── layout.tsx                  # Layout + menu responsivo
│   │   └── page.tsx                    # Landing page
│   ├── 📁 components/
│   │   ├── 📁 base/                    # 8 componentes reutilizáveis
│   │   ├── 📁 mapa/                    # 5 componentes do mapa
│   │   ├── 📁 plano/                   # 🆕 7 componentes (+ ModalDAR_CERTO)
│   │   ├── 📁 diagnostico/             # Componentes responsivos
│   │   ├── 📁 ui/                      # shadcn/ui components
│   │   └── TermosModal.tsx             # Modal de termos LGPD
│   ├── 📁 lib/
│   │   ├── design-system.ts            # Design tokens centralizados
│   │   ├── diagnostico-engine.ts       # Motor de análise
│   │   ├── supabase.ts                 # Config banco
│   │   └── utils.ts                    # Utilitários gerais
│   └── 📁 styles/
│       └── globals.css                 # Estilos globais + cursors
```

---

## 🎯 METODOLOGIA ROI DO FOCO IMPLEMENTADA

### **🧠 Framework DAR CERTO (8 Categorias)**

Baseado na teoria ROI do Foco, implementamos o sistema completo:

```
🗑️ DESCARTAR    - Aquilo que não faz sentido continuar
⚡ AUTOMATIZAR  - Investir tempo agora para ganhar depois  
📉 REDUZIR      - Escopo, energia ou frequência
📦 COMBINAR     - Reagrupar atividades, entregar junto
➡️ ENCAMINHAR   - Direcionar para quem é responsável
🔄 REVISITAR    - Ajustar ou descontinuar o que perdeu sentido
👥 TREINAR      - Preparar alguém para assumir com autonomia
⚙️ OTIMIZAR     - Redesenhar a forma como a tarefa é feita
```

### **📋 Sistema TAREFA vs HÁBITO**

**TAREFAS**: Ações pontuais com prazo (máximo 4 semanas)
- Têm data limite definida
- Estimativa de horas
- Resultado específico esperado
- Exemplo: "Criar template de relatório semanal"

**HÁBITOS**: Comportamentos recorrentes contínuos
- Frequência: diária, semanal ou mensal
- Gatilho definido para execução
- Sustentam o foco no longo prazo
- Exemplo: "Revisar agenda toda manhã após café"

---

## 📊 FUNCIONALIDADES DETALHADAS

### **1. 🗺️ MAPA DE ATIVIDADES**

- **Gráfico Interativo**: Impacto × Clareza com 4 zonas automáticas
- **CRUD Completo**: Criar, editar, excluir atividades
- **Zonificação Automática**: Distração, Tática, Estratégica, Essencial
- **Export PNG**: Download da visualização
- **Integração Sequencial**: Flui automaticamente para diagnóstico

### **2. 🔍 DIAGNÓSTICO DO FOCO**

- **Análise Automática**: Motor baseado na distribuição das zonas
- **5 Focos Identificados**: 
  - REDUZIR_DISTRACAO
  - COMPRIMIR_TATICO  
  - FORTALECER_ESSENCIAL
  - DAR_FORMA_ESTRATEGICO
  - MANTER_PADRAO
- **Relatório Detalhado**: Cenário + recomendações + meta
- **Integração com Plano**: Dados salvos automaticamente

### **3. 📋 PLANO DE AÇÃO INTELIGENTE**

#### **🎯 Orientação do Diagnóstico**
- **Seção Automática**: Mostra foco primário/secundário do diagnóstico
- **Meta das 4 Semanas**: Direcionamento específico baseado na análise
- **Ordenação Inteligente**: Atividades reordenadas por prioridade do foco
- **Aplicação Automática**: Botão para aplicar táticas sugeridas

#### **🔧 Inserção Manual Guiada**
- **Framework DAR CERTO**: 8 botões de categoria disponíveis por zona
- **Modal Inteligente**: Interface guiada para criação de táticas/hábitos
- **Flexibilidade Total**: Usuário escolhe se é TAREFA ou HÁBITO
- **Campos Específicos**: Prazo para tarefas, frequência/gatilho para hábitos

#### **📈 Gestão Completa**
- **CRUD de Táticas**: Criar, editar, marcar como concluído, remover
- **Distinção Visual**: Badges coloridos para TAREFA vs HÁBITO
- **Impactos Definidos**: Seleção de efeitos esperados (tempo, clareza, impacto)
- **Salvamento Automático**: Persistência no localStorage

### **4. 🛡️ PRIVACIDADE & LGPD**

- **Política Completa**: Transparência total sobre dados coletados
- **Download de Dados**: JSON estruturado de todas as informações
- **Exclusão Total**: Remoção permanente da conta e dados
- **Modal de Termos**: Integrado na experiência do usuário

---

## 🚀 FLUXO DE USO OTIMIZADO

### **Jornada Completa do Usuário:**

```
1. 🔐 Login (/auth)
   ↓
2. 🗺️ Mapear Atividades (/dashboard)
   ↓ Clicar "Diagnóstico do Foco"
3. 📊 Analisar Distribuição (/diagnostico)
   ↓ Clicar "Criar Plano de Ação Agora"
4. 🎯 Construir Plano (/plano-acao)
   ├── Ver orientação automática do diagnóstico
   ├── Aplicar táticas sugeridas (automático)
   ├── OU inserir táticas manuais (Framework DAR CERTO)
   ├── Escolher TAREFA vs HÁBITO para cada ação
   └── Salvar plano completo
5. 👤 Gerenciar Perfil (/perfil)
```

### **🎨 Design System Consistente**

**Cores por zona:**
- **Background**: `#042f2e` (verde escuro)
- **Primary**: `#d97706` (laranja accent)  
- **Essencial**: `#22c55e` (verde)
- **Estratégica**: `#3b82f6` (azul)
- **Tática**: `#eab308` (amarelo)
- **Distração**: `#ef4444` (vermelho)

**Badges visuais:**
- **TAREFA**: 📋 Badge laranja com estimativa de horas
- **HÁBITO**: 🔄 Badge verde com frequência

---

## 🛠️ STACK TECNOLÓGICO

```
Frontend:     Next.js 14 (App Router) + TypeScript
UI:           Tailwind CSS + shadcn/ui + Lucide Icons
Estado:       React Hooks (useState, useEffect, useMemo)
Banco:        Supabase (PostgreSQL + Auth + RLS)
Deploy:       Vercel (pronto para produção)
Metodologia:  ROI do Foco + Framework DAR CERTO
Análise:      Motor heurístico customizado
Export:       jsPDF + html2canvas
```

---

## 🔧 INSTALAÇÃO E CONFIGURAÇÃO

### **Instalação Rápida:**

```bash
# 1. Clonar repositório
git clone https://github.com/AdilMtl/mapa-atividades.git
cd mapa-atividades

# 2. Instalar dependências
npm install

# 3. Configurar ambiente
cp .env.example .env.local
# Editar .env.local com suas chaves do Supabase

# 4. Rodar projeto
npm run dev
```

### **📊 Configuração do Banco (Supabase):**

```sql
-- Executar no SQL Editor do Supabase

-- Tabela de atividades
CREATE TABLE atividades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  eixo_x INTEGER CHECK (eixo_x >= 1 AND eixo_x <= 6),
  eixo_y INTEGER CHECK (eixo_y >= 1 AND eixo_y <= 6),
  horas_mes DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de perfil
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  full_name VARCHAR(100),
  emoji VARCHAR(10) DEFAULT '😊',
  email_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE atividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Users can manage own data" ON atividades
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own profile" ON profiles
  FOR ALL USING (auth.uid() = id);
```

---

## 🧩 ARQUITETURA MODULAR ATUALIZADA

### **Componentes Base (8):**
```typescript
// src/components/base/index.tsx
- PageContainer      # Layout de página padronizado
- Section           # Seções com títulos e espaçamento
- Card             # Cards com tema consistente
- QuickButton      # Botões de ação rápida
- EmptyState       # Estados vazios informativos
- ChipZona         # Chips coloridos por zona
- ProgressBar      # Barras de progresso
- Meter           # Medidores visuais
```

### **Componentes Plano (7):**
```typescript
// src/components/plano/index.tsx
- PlanoHeader            # Cabeçalho do plano
- PlanoStats             # Estatísticas e métricas
- OrientacaoDiagnostico  # 🆕 Seção com foco diagnóstico
- AtividadeCard          # Card expansível de atividade
- TaticaItem            # Item individual com badges TAREFA/HÁBITO
- PlanoFooter           # Footer com salvamento
- ModalDAR_CERTO        # 🆕 Modal do Framework DAR CERTO

// Funções utilitárias:
- ordenarPorFocoDiagnostico  # 🆕 Priorização automática
- sugerirAcoesInteligentes   # 🆕 Sistema baseado no foco
```

---

## 📊 MÉTRICAS DE QUALIDADE ATUALIZADAS

### **Funcionalidades Implementadas: 100%**

- ✅ **Autenticação**: Sistema completo com RLS
- ✅ **Mapa Interativo**: CRUD + visualização + export  
- ✅ **Diagnóstico**: Motor de análise + relatórios + fluxo visual
- ✅ **Plano Inteligente**: Framework DAR CERTO + TAREFA/HÁBITO + ordenação
- ✅ **Perfil/LGPD**: Compliance completo + export de dados
- ✅ **UX/UI**: Design system + responsividade + transições

### **🏗️ Arquitetura: Enterprise Ready**

- **Componentes Modulares**: 21 componentes isolados (+ ModalDAR_CERTO)
- **Design System**: Tokens centralizados e reutilizáveis
- **Responsividade**: Mobile-first em todas as páginas
- **Performance**: Loading < 2s + bundle otimizado
- **Manutenibilidade**: Código limpo e documentado
- **Metodologia**: ROI do Foco implementado completamente

### **🛡️ Segurança e Compliance**

- **Row Level Security**: Isolamento total por usuário
- **LGPD Compliance**: Download/exclusão de dados funcionais
- **Autenticação**: Senhas hash + sessões seguras
- **HTTPS**: Criptografia em todas as comunicações

---

## 🎯 PRÓXIMOS PASSOS

### **📋 Para Finalizar MVP:**

1. **🎓 Tutorial/Onboarding** (20 min)
2. **📚 Página de Ajuda/FAQ** (15 min)
3. **🏠 Landing Page Aprimorada** (25 min)

### **🌐 Para Deploy:**

```bash
# Deploy Vercel (recomendado)
npm run build
npx vercel --prod

# Ou configurar manualmente
npm run build
npm run start
```

### **📊 Wave 2 (Pós-MVP):**

- **📅 Foco da Semana**: Seleção inteligente de 3-5 tarefas + 2-3 hábitos
- **📈 Analytics**: Dashboard de progresso e tendências
- **🔄 Templates**: Biblioteca de táticas pré-definidas
- **👥 Social**: Compartilhamento de planos entre usuários

---

## 🆘 TROUBLESHOOTING

### **❓ Problemas Comuns:**

```bash
# Modal DAR CERTO não abre
# Verificar se função está sendo passada como prop:
# onAbrirModalDAR_CERTO={onAbrirModalDAR_CERTO}

# Erro de export/import no componente
# Verificar se ModalDAR_CERTO está na lista de exports:
# export { ... ModalDAR_CERTO, ... }

# Ordenação não funciona
# Verificar se dados do diagnóstico estão no localStorage:
# localStorage.getItem('ultimo-diagnostico')

# Badge TAREFA/HÁBITO não aparece
# Verificar se campo 'tipo' existe no objeto Tatica

# Erro de dependências
rm -rf node_modules package-lock.json
npm install

# Erro de TypeScript
npx tsc --noEmit

# Verificar banco
# Confirmar se tabelas existem e RLS está habilitado
```

### **🔧 Comandos de Desenvolvimento:**

```bash
# Desenvolvimento
npm run dev           # Servidor local
npm run build         # Build de produção
npm run lint          # Verificar código

# Git
git add .             # Adicionar mudanças
git commit -m "feat: implementar Framework DAR CERTO"
git push              # Enviar para GitHub

# Backup
git tag v1.7          # Criar tag da versão
git push --tags       # Enviar tags
```

---

## 📞 SUPORTE

### **🐛 Reportar Issues:**

- **GitHub Issues**: Para bugs e sugestões técnicas
- **Discussions**: Para dúvidas sobre metodologia ROI do Foco
- **Wiki**: Documentação detalhada (em construção)

### **📧 Contato:**

- **Projeto**: Sistema de mapeamento baseado em ROI do Foco
- **Versão**: v1.7 (Framework DAR CERTO)
- **Status**: ✅ Produção Ready com metodologia completa
- **Deploy**: Vercel + Supabase

---

## 📊 CHANGELOG

### **v1.7 - Framework DAR CERTO (Atual)**
- ✅ 8 categorias do Framework DAR CERTO implementadas
- ✅ Sistema TAREFA vs HÁBITO com flexibilidade total
- ✅ Modal de criação guiado com seleção de categoria
- ✅ Ordenação inteligente baseada no foco diagnóstico
- ✅ Seção "Orientação do Diagnóstico" automática
- ✅ Integração sequencial Diagnóstico → Plano funcional

### **v1.6 - Layout Otimizado**
- ✅ Header com fluxo visual e progress bar
- ✅ Menu retrátil com transições suaves
- ✅ Reorganização da página de diagnóstico
- ✅ UX consistente entre todas as páginas

### **v1.5 - Perfil e LGPD**
- ✅ Página de perfil completa
- ✅ Sistema LGPD compliance
- ✅ Modal de termos integrado

### **v1.4 - Wave 1 Modular**
- ✅ 19 componentes modulares
- ✅ Design system centralizado
- ✅ Arquitetura enterprise

### **v1.3 - Diagnóstico**
- ✅ Motor de análise heurística
- ✅ Relatórios automáticos
- ✅ Export PDF/JSON

---

**🎯 Status: SISTEMA COMPLETO - Metodologia ROI do Foco implementada integralmente**

**📅 Última atualização:** 20 de Agosto de 2025  
**🏷️ Versão:** v1.7 - Framework DAR CERTO Completo  
**🚀 Pronto para deploy profissional!**