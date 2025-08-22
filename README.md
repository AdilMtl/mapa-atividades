# 🎯 Mapa de Atividades - ROI do Foco

**Sistema Enterprise para Diagnóstico e Otimização do Foco Profissional**

[![Deploy](https://img.shields.io/badge/deploy-vercel-black?logo=vercel)](https://conversas-no-corredor.vercel.app)
[![Versão](https://img.shields.io/badge/versão-v1.8.3-blue)](docs/CURRENT-STATUS.md)
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
# Configurar Supabase URLs no .env.local

# Executar em desenvolvimento
npm run dev
```

**Acesso:** http://localhost:3000

## 📊 Sistema Completo

### ✅ Funcionalidades Principais
- **🗺️ Mapa de Atividades** - Matriz Impacto × Clareza (4 zonas)
- **📊 Diagnóstico Automático** - Análise ROI do Foco com relatórios personalizados
- **📋 Plano de Ação** - Framework DAR CERTO com IA V2.1
- **📄 Export Profissional** - PDF otimizado + cópia de texto
- **👤 Perfil Completo** - Configurações pessoais + compliance LGPD
- **🔐 Autenticação Segura** - RLS (Row Level Security) + emails autorizados

### 🛠️ Stack Tecnológica
- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **Deploy:** Vercel (automático via Git)
- **Metodologia:** ROI do Foco + Framework DAR CERTO

## 🌊 Fluxo do Usuário

```mermaid
graph LR
    A → [Landing Page] → B → [Autenticação] 
    B → C[Dashboard]
    C → D[Diagnóstico]
    D → E[Plano de Ação]
    E → F[Execução]
```

1. **Landing Page** → Apresentação e captação de assinantes
2. **Autenticação** → Login/cadastro com emails autorizados
3. **Dashboard** → Mapeamento na matriz Impacto × Clareza
4. **Diagnóstico** → Análise automática + relatório personalizado
5. **Plano de Ação** → Táticas específicas baseadas no diagnóstico

## 📂 Estrutura do Projeto

```
src/
├── app/
│   ├── auth/              # Autenticação
│   ├── dashboard/         # Mapa de atividades
│   ├── diagnostico/       # Análise do foco
│   ├── plano-acao/        # Framework DAR CERTO
│   ├── perfil/            # Configurações
│   └── privacidade/       # LGPD compliance
├── components/
│   ├── base/              # 8 componentes reutilizáveis
│   ├── mapa/              # 5 componentes do mapa
│   └── plano/             # 7 componentes do plano
└── lib/
    ├── diagnostico-engine.ts    # Motor de análise
    ├── heuristica-engine.ts     # IA V2.1 para táticas
    ├── design-system.ts         # Tokens centralizados
    └── supabase.ts             # Configuração do banco
```

## 📚 Sistema de Documentação Modular

### 📋 **Documentação Principal**
- **📊 [CURRENT-STATUS.md](docs/CURRENT-STATUS.md)** - Status atual sempre atualizado
- **📅 [CHANGELOG.md](docs/CHANGELOG.md)** - Histórico completo de versões
- **🔧 [troubleshooting-acesso.md](docs/troubleshooting-acesso.md)** - Soluções para problemas comuns

### 📖 **Versões Detalhadas**
```
docs/versions/
├── v1.8.3-diagnostico-premium.md     # Versão atual - Sessão 22/08/2025
├── v1.8.2-fluxo-padronizado.md       # ROI do Foco + nome real usuário
└── v1.8.1-heuristica-refinada.md     # IA V2.1 + Framework DAR CERTO
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

## 🎯 Versão Atual: v1.8.3 - Diagnóstico Premium

**Foco da Sessão (22/08/2025):** Export Otimizado + Interface Profissional

### ✅ Implementado Nesta Versão
- **📄 Export PDF Corrigido** - Removido html2canvas, sem caracteres corrompidos
- **🎨 Dropdown "Salvar Diagnóstico"** - PDF + Copiar texto (substituiu 2 botões feios)
- **👤 Header Personalizado** - Nome real + emoji do perfil do usuário
- **📊 Barra Visual Integrada** - Distribuição de zonas dentro do RelatorioView  
- **🧹 Interface Limpa** - Removida seção redundante "Distribuição do Seu Tempo"
- **💅 CSS Melhorado** - Formatação profissional do texto do relatório

### 🔧 Status de Funcionalidades
- ✅ **PDF Export:** Funcional (versão simplificada sem html2canvas)
- ✅ **Dropdown:** Criado com opções PDF + Copiar texto  
- ⚠️ **Nome do usuário:** Pode precisar debug (busca profiles correta implementada)
- ✅ **Layout:** Cards otimizados, fluxo linear preservado
- ✅ **Barra visual:** Integrada no relatório principal

### 📋 Detalhes Técnicos
```typescript
// Export PDF otimizado (sem html2canvas)
const pdf = new jsPDF('p', 'mm', 'a4');
pdf.text('DIAGNOSTICO DO FOCO', margin, currentY);

// Dropdown funcional  
const [dropdownAberto, setDropdownAberto] = useState(false);

// Busca nome real do perfil
const { data: profile } = await supabase
  .from('profiles')
  .select('full_name, emoji, email')
```

### 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev          # Servidor local
npm run build        # Build de produção
npm run lint         # Verificar código

# Deploy
git add .            # Adicionar mudanças
git commit -m "feat: nova funcionalidade"
git push             # Deploy automático

# Debug
npm run type-check   # Verificar TypeScript
npm run analyze      # Análise do bundle
```

## 🌐 Deploy e Acesso

**Produção:** https://conversas-no-corredor.vercel.app

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

## 🎨 Design System

**Cores principais:**
- Background: `#042f2e` (verde escuro)
- Accent: `#d97706` (laranja)
- Essencial: `#22c55e` (verde)
- Estratégica: `#3b82f6` (azul)
- Tática: `#eab308` (amarelo)
- Distração: `#ef4444` (vermelho)

**Componentes modulares:** 19 componentes totalmente reutilizáveis com design tokens centralizados.

## 🤝 Sobre o Projeto

Baseado na metodologia **ROI do Foco** da newsletter [Conversas no Corredor](https://conversasnocorredor.substack.com), este sistema oferece uma abordagem prática para mapear, diagnosticar e otimizar o foco profissional.

**Criado por:** [Adilson Matioli](https://www.linkedin.com/in/adilsonmatioli/)  
**Newsletter:** https://conversasnocorredor.substack.com  

---

📋 **Status:** Sistema 100% operacional em produção  
📅 **Última atualização:** 22 de agosto de 2025  
🔄 **Próxima versão:** [Veja roadmap no CURRENT-STATUS.md](docs/CURRENT-STATUS.md)