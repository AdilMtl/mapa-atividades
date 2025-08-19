This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# 🎯 Mapa de Atividades - Documentação Atualizada

## 📊 STATUS ATUAL - v1.5

### ✅ **NOVAS FUNCIONALIDADES IMPLEMENTADAS**

- ✅ **Página de Perfil Completa**: Emoji, senha, estatísticas, LGPD
- ✅ **Sistema de Termos e Privacidade**: Modal integrado + compliance LGPD
- ✅ **Cursors Corrigidos**: Todos os botões mostram mãozinha
- ✅ **Emojis Expandidos**: 32 opções incluindo 🤓🥸🥵🫠🤠😷🤡💩

---

## 🗂️ ESTRUTURA ATUALIZADA

```
📁 mapa-atividades/
├── 📁 src/
│   ├── 📁 app/
│   │   ├── 📁 auth/                    # Autenticação
│   │   ├── 📁 dashboard/               # Mapa de Atividades
│   │   ├── 📁 diagnostico/             # Diagnóstico do foco
│   │   ├── 📁 plano-acao/              # Plano de ação
│   │   ├── 📁 perfil/                  # 🆕 PERFIL COMPLETO
│   │   │   └── page.tsx                # Emoji, senha, LGPD, stats
│   │   ├── 📁 privacidade/             # 🆕 LGPD COMPLIANCE
│   │   │   └── page.tsx                # Política + modal termos
│   │   ├── 📁 termos/ [REMOVIDO]       # Agora é modal
│   │   ├── layout.tsx                  # Layout + menu
│   │   ├── globals.css                 # 🆕 CURSORS CORRIGIDOS
│   │   └── page.tsx                    # Home/landing
│   ├── 📁 components/
│   │   ├── 📁 base/                    # 8 componentes reutilizáveis
│   │   ├── 📁 mapa/                    # 5 componentes do mapa
│   │   ├── 📁 plano/                   # 6 componentes do plano
│   │   ├── 📁 ui/                      # shadcn/ui components
│   │   └── TermosModal.tsx             # 🆕 MODAL DE TERMOS
│   ├── 📁 lib/
│   │   ├── design-system.ts            # Design System
│   │   ├── supabase.ts                 # Config banco
│   │   └── utils.ts                    # Utilitários gerais
│   └── 📁 styles/
│       └── globals.css                 # Estilos globais + cursors
```

---

## 🆕 FUNCIONALIDADES ADICIONADAS

### **👤 Página de Perfil (/perfil)**

#### **Funcionalidades Implementadas:**
- ✅ **Informações Básicas**: Nome, email, emoji
- ✅ **Seletor de Emoji**: 32 opções incluindo novos
- ✅ **Segurança**: Alterar senha com validações
- ✅ **Estatísticas**: Atividades, diagnósticos, planos
- ✅ **LGPD Compliance**: Export/deletar dados
- ✅ **Preferências**: Notificações por email

#### **Tecnologias:**
- React Hooks (useState, useEffect)
- Supabase Auth para alteração de senha
- Download automático de dados (JSON)
- Validação de formulários

### **🛡️ Sistema de Privacidade (/privacidade)**

#### **Funcionalidades Implementadas:**
- ✅ **Política LGPD**: Completa e em português
- ✅ **Modal de Termos**: Popup integrado
- ✅ **Export de Dados**: Download JSON automático
- ✅ **Direitos do Usuário**: Explicação clara
- ✅ **Contato DPO**: Email para questões legais

#### **Componentes:**
- `TermosModal.tsx` - Modal responsivo com scroll
- Integração com sistema de perfil
- Links contextuais entre páginas

### **🖱️ Correção de Cursors**

#### **Problema Resolvido:**
- Botões não mostravam mãozinha (cursor: pointer)
- Aplicado em todos os elementos clicáveis
- Compatível com shadcn/ui e Tailwind

#### **Implementação:**
```css
/* src/app/globals.css */
button, [role="button"], a, [onclick] {
  cursor: pointer !important;
}
```

---

## 🗃️ BANCO DE DADOS ATUALIZADO

### **Tabela `profiles` (Nova)**

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  full_name VARCHAR(100),
  emoji VARCHAR(10) DEFAULT '😊',
  email_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- RLS habilitado
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

---

## 🎨 MELHORIAS DE UX/UI

### **Emojis Expandidos**
```typescript
const EMOJIS_PERFIL = [
  // Originais
  '😊', '😎', '🤔', '😌', '🙂', '😀', '🤗', '😇',
  '🧠', '💡', '⚡', '🎯', '🚀', '✨', '🔥', '💪',
  '📊', '📈', '🎨', '🔧', '⭐', '🎪', '🎭', '🦄',
  // Novos adicionados
  '🤓', '🥸', '🥵', '🫠', '🤠', '😷', '🤡', '💩'
];
```

### **Design Consistente**
- Uso do Design System da Wave 1
- Glass effects em modais
- Cores semânticas (verde/vermelho/azul)
- Responsividade mobile-first

---

## 🔧 COMANDOS DE IMPLEMENTAÇÃO

### **Para desenvolvedores que clonam o projeto:**

#### **1. Instalar dependências:**
```bash
npm install
```

#### **2. Configurar Supabase:**
```bash
# Criar arquivo .env.local com suas chaves
cp .env.example .env.local
# Editar com suas chaves do Supabase
```

#### **3. Criar tabela profiles:**
```sql
-- Executar no SQL Editor do Supabase
-- (SQL fornecido na seção Banco de Dados)
```

#### **4. Rodar projeto:**
```bash
npm run dev
```

---

## 📱 FLUXO DO USUÁRIO ATUALIZADO

### **Jornada Completa:**
1. **Login** → `/auth`
2. **Dashboard** → `/dashboard` (Mapa de Atividades)
3. **Diagnóstico** → `/diagnostico` (Análise automática)
4. **Plano** → `/plano-acao` (Táticas personalizadas)
5. **Perfil** → `/perfil` (Configurações pessoais)
6. **Privacidade** → `/privacidade` (LGPD + Termos)

### **Funcionalidades Transversais:**
- Menu lateral responsivo
- Autenticação segura
- RLS (Row Level Security)
- Export de dados
- Design system consistente

---

## 🎯 MÉTRICAS DE QUALIDADE

### **Funcionalidades Implementadas:**
- ✅ **Autenticação**: 100%
- ✅ **Mapa de Atividades**: 100%
- ✅ **Diagnóstico**: 100%
- ✅ **Plano de Ação**: 100%
- ✅ **Perfil de Usuário**: 100%
- ✅ **LGPD Compliance**: 100%
- ✅ **Design System**: 100%

### **Páginas Implementadas:** 6/9 (67%)
- ✅ Auth, Dashboard, Diagnóstico, Plano, Perfil, Privacidade
- 🔄 Relatórios, Configurações, Ajuda (próximas)

### **Componentes Modulares:** 20 componentes
- 8 componentes base
- 5 componentes mapa
- 6 componentes plano
- 1 modal de termos

---

## 🚀 PRÓXIMOS PASSOS RECOMENDADOS

### **Para Finalizar MVP:**
1. **🎓 Tutorial/Onboarding** (20 min)
2. **📚 Página de Ajuda/FAQ** (15 min)
3. **🏠 Melhorar Landing Page** (25 min)

### **Para Deploy:**
1. **🌐 Deploy Vercel** (10 min)
2. **🔗 Domínio personalizado** (5 min)
3. **📧 Configurar emails LGPD** (15 min)

### **Wave 2 (Pós-Deploy):**
1. **📊 Página de Relatórios**
2. **⚙️ Página de Configurações**
3. **🔔 Sistema de notificações**

---

## 🆘 TROUBLESHOOTING

### **Problemas Comuns:**

#### **Modal não abre:**
```bash
# Verificar importação do componente
# src/app/privacidade/page.tsx linha 8
import { TermosModal } from '@/components/TermosModal';
```

#### **Cursors não funcionam:**
```bash
# Verificar src/app/globals.css
# Deve ter as regras CSS de cursor no final
```

#### **Erro na tabela profiles:**
```sql
-- Verificar se RLS está habilitado
SELECT * FROM pg_tables WHERE tablename = 'profiles';
```

#### **Emoji não salva:**
```bash
# Verificar se campo emoji existe na tabela
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emoji VARCHAR(10) DEFAULT '😊';
```

---

## 📞 SUPORTE

### **Para dúvidas técnicas:**
- 📧 **GitHub Issues**: Use para bugs e sugestões
- 📚 **Documentação**: Consulte este README
- 🔧 **Comandos**: Seção específica neste documento

### **Para questões de privacidade:**
- 📧 **Email**: privacidade@mapaatividades.com
- 📄 **Política**: Disponível em `/privacidade`
- 📋 **Termos**: Modal integrado na página de privacidade

---

## 📊 CHANGELOG

### **v1.5 - Perfil e LGPD (Atual)**
- ✅ Página de perfil completa
- ✅ Sistema LGPD compliance
- ✅ Modal de termos integrado
- ✅ Cursors corrigidos
- ✅ Emojis expandidos

### **v1.4 - Wave 1 Modular**
- ✅ 19 componentes modulares
- ✅ Design system centralizado
- ✅ Plano de ação funcional

### **v1.3 - Diagnóstico**
- ✅ Motor de análise
- ✅ Relatórios automáticos
- ✅ Integração com mapa

### **v1.2 - Plano de Ação**
- ✅ Táticas personalizadas
- ✅ Integração com dados reais
- ✅ CRUD completo

### **v1.1 - Mapa Base**
- ✅ Gráfico interativo
- ✅ 4 zonas automáticas
- ✅ Export PNG

### **v1.0 - MVP**
- ✅ Autenticação básica
- ✅ CRUD atividades
- ✅ Interface inicial

---

**🎯 Status: PRONTO PARA DEPLOY - MVP COMPLETO com funcionalidades essenciais implementadas**

**📅 Última atualização:** {new Date().toLocaleDateString('pt-BR')}
**🏷️ Versão:** v1.5
