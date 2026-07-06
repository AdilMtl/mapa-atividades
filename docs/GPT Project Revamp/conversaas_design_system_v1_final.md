# +ConverSaaS — Design System v1

## Decisão de direção

**Direção visual oficial:** Dark Editorial Atelier  
**Paleta escolhida:** Orange / Magenta  
**Serifa principal:** Fraunces  
**Nível de gradiente/transparência:** manter como na opção 2

O sistema deve parecer uma plataforma editorial-prática: escura, sofisticada, energética, com sensação de app/produto, mas sem cair na estética genérica de IA.

---

## Arquitetura de marca

**Conversas no Corredor**  
Marca-mãe editorial, newsletter, repertório, pensamento e autoridade.

**+ConverSaaS**  
Plataforma/site/app: laboratório, ferramentas, trilhas, área premium, templates, miniapps e experiência prática.

---

## Princípios visuais

1. **Editorial antes de genérico**
   - Usar tipografia serifada em títulos e chamadas principais.
   - O site deve ter gosto, não parecer template de SaaS.

2. **Produto antes de arquivo**
   - Cards, módulos, trilhas, diagnósticos e componentes precisam parecer parte de um app.
   - Evitar sensação de “blog com links”.

3. **Energia com controle**
   - Laranja e magenta trazem modernidade.
   - Gradientes aparecem como acentos, não como decoração excessiva.

4. **Técnico, mas humano**
   - Grid sutil, mono em labels e módulos.
   - Evitar visual dev demais ou cyberpunk.

5. **Construído com IA, mas com taste humano**
   - Nada de robôs, circuitos, cérebros azuis, neon roxo/ciano ou estética AI startup genérica.

---

## Paleta oficial v1

### Base escura

```css
--bg-deep: #0A1412;
--bg-app: #08110F;
--bg-panel: #1B3F39;
--bg-panel-soft: rgba(255, 255, 255, 0.055);
--bg-panel-strong: rgba(255, 255, 255, 0.075);
```

### Texto

```css
--text-primary: #F8F0E6;
--text-secondary: #D2DDD9;
--text-muted: #9EAEA8;
--text-subtle: #70817B;
```

### Acentos

```css
--accent-orange: #D97706;
--accent-magenta: #D34C75;
--accent-amber-soft: #F0B674;
--accent-grid: rgba(255, 255, 255, 0.028);
```

### Bordas e superfícies

```css
--border-subtle: rgba(255, 255, 255, 0.09);
--border-medium: rgba(255, 255, 255, 0.14);
--surface-glass: rgba(255, 255, 255, 0.055);
--surface-glass-hover: rgba(255, 255, 255, 0.075);
```

### Gradientes

```css
--gradient-primary: linear-gradient(90deg, #D97706, #D34C75);
--gradient-bg-soft:
  radial-gradient(circle at 10% 0%, rgba(211, 76, 117, 0.12), transparent 25%),
  radial-gradient(circle at 90% 8%, rgba(217, 119, 6, 0.12), transparent 24%),
  linear-gradient(135deg, #08110F 0%, #132622 60%, #08110F 100%);
```

---

## Tipografia

### Fonte 1 — Serifada principal

**Fraunces**

Usar em:
- hero;
- títulos principais;
- manifesto;
- chamadas editoriais;
- headers de seção;
- blocos de tese.

Características:
- elegante;
- autoral;
- curvas com personalidade;
- mais “taste” do que uma sans genérica.

### Fonte 2 — Sans de interface

**IBM Plex Sans** ou **Geist**

Usar em:
- navegação;
- cards;
- descrições;
- botões;
- formulários;
- textos de interface;
- dashboards.

Recomendação: começar com **IBM Plex Sans** se quiser mais seriedade e sistema; usar **Geist** se quiser mais produto digital contemporâneo.

### Fonte 3 — Mono técnica

**IBM Plex Mono** ou **Geist Mono**

Usar em:
- labels;
- badges;
- etapas;
- metadados;
- snippets;
- nomes de trilhas;
- indicadores de módulo;
- pequenas anotações técnicas.

---

## Escala tipográfica sugerida

```css
--font-serif: "Fraunces", Georgia, serif;
--font-sans: "IBM Plex Sans", Inter, system-ui, sans-serif;
--font-mono: "IBM Plex Mono", Consolas, monospace;

--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
--text-2xl: 1.5rem;
--text-3xl: 2rem;
--text-4xl: 2.75rem;
--text-5xl: 4rem;
--text-hero: clamp(3rem, 7vw, 6rem);
```

### Uso

```css
.hero-title {
  font-family: var(--font-serif);
  font-size: var(--text-hero);
  line-height: 0.95;
  letter-spacing: -0.055em;
  font-weight: 500;
}

.section-title {
  font-family: var(--font-serif);
  font-size: var(--text-4xl);
  line-height: 1;
  letter-spacing: -0.045em;
  font-weight: 500;
}

.label {
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.13em;
  font-size: var(--text-xs);
}
```

---

## Grid e fundo

O grid é parte do DNA visual do +ConverSaaS.

Usar de forma sutil, com opacidade baixa.

```css
.grid-bg {
  background:
    linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px),
    linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px),
    linear-gradient(135deg, #091514 0%, #10211D 100%);
  background-size: 34px 34px, 34px 34px, auto;
}
```

Uso:
- hero;
- áreas de laboratório;
- módulos premium;
- páginas de ferramenta;
- dashboards.

Evitar:
- grid muito claro;
- grid em todas as seções;
- grid competindo com texto.

---

## Componentes-base

### Botão primário

```css
.btn-primary {
  background: var(--accent-orange);
  color: #1E1005;
  border-radius: 999px;
  padding: 0.8rem 1.15rem;
  font-weight: 700;
  border: 1px solid transparent;
}

.btn-primary:hover {
  background: var(--gradient-primary);
}
```

Uso:
- CTA principal;
- começar diagnóstico;
- acessar plataforma;
- assinar.

### Botão secundário

```css
.btn-secondary {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid rgba(255, 240, 220, 0.18);
  border-radius: 999px;
  padding: 0.8rem 1.15rem;
  font-weight: 700;
}
```

Uso:
- ler proposta;
- assinar newsletter;
- ver premium;
- abrir manifesto.

---

## Cards

### Card padrão

```css
.card {
  background: rgba(255, 255, 255, 0.055);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 22px;
  padding: 1.125rem;
}
```

### Card ativo/destaque

```css
.card-featured {
  background: rgba(46, 104, 96, 0.13);
  border: 1px solid rgba(255, 255, 255, 0.11);
}
```

### Card premium

```css
.card-premium {
  background: linear-gradient(145deg, rgba(211,76,117,0.10), rgba(255,255,255,0.04));
  border: 1px solid rgba(211,76,117,0.20);
}
```

---

## Badges e labels

```css
.badge {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border: 1px solid var(--border-medium);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  border-radius: 999px;
  padding: 0.45rem 0.65rem;
}

.badge-premium {
  border-color: rgba(211, 76, 117, 0.35);
  color: #F2B5C7;
}
```

---

## Módulos e trilhas

```css
.module {
  background: rgba(255, 255, 255, 0.055);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 26px;
  padding: 1.125rem;
}

.progress {
  height: 10px;
  border-radius: 999px;
  background: rgba(255,255,255,0.11);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: var(--gradient-primary);
}
```

---

## Hierarquia de páginas

### Home

Deve comunicar:
1. existe uma plataforma útil;
2. tem profundidade editorial;
3. tem ferramentas/trilhas;
4. não é hype;
5. tem assinatura/newsletter.

### Laboratório

Deve parecer mais produto:
- módulos;
- cards;
- trilhas;
- diagnósticos;
- ferramentas;
- estados premium.

### Newsletter/textos

Deve preservar leitura editorial:
- serifada em títulos;
- sans confortável no corpo;
- metadados em mono;
- pouca interferência visual.

### Premium

Deve ter acento mais forte:
- magenta em badges;
- gradientes sutis;
- cards especiais;
- sensação de acesso a sistema completo.

---

## Frases-guia de design

- “Construído com IA, mas com taste humano.”
- “Publicação que virou ferramenta.”
- “Sistema editorial-prático.”
- “Energia contemporânea sem estética de hype.”
- “Atelier digital escuro, útil e refinado.”

---

## Prompt técnico para Claude Code

Use este briefing para implementar o novo design system:

```text
Redesenhe o site +ConverSaaS usando a direção visual "Dark Editorial Atelier".

A marca-mãe é Conversas no Corredor, mas +ConverSaaS é a plataforma/site/app. O visual deve ser escuro, editorial, modular e energético, com fundo em verde profundo, grid técnico sutil, tipografia serifada elegante, componentes de app e acentos em laranja e magenta.

Use Fraunces como fonte principal para títulos e chamadas editoriais. Use IBM Plex Sans ou Geist para UI e texto de interface. Use IBM Plex Mono ou Geist Mono para labels, badges, etapas, metadados e snippets.

A paleta principal deve usar:
- #0A1412 como fundo profundo
- #08110F como app background
- #1B3F39 como painel verde estrutural
- #F8F0E6 como texto principal
- #D2DDD9 como texto secundário
- #D97706 como laranja principal
- #D34C75 como magenta de acento
- gradiente principal linear-gradient(90deg, #D97706, #D34C75)

O grid de fundo deve ser sutil, com linhas rgba(255,255,255,0.028), background-size 34px, e usado em hero, laboratório, módulos e páginas de ferramentas.

Evite estética genérica de IA: nada de robôs, cérebros azuis, circuitos, neon roxo/ciano ou visual cyberpunk. O site deve parecer uma plataforma autoral, útil e refinada — construída com IA, mas com taste humano.

Crie componentes base:
- hero escuro com título em Fraunces
- cards modulares
- botões primário/secundário
- badges premium
- módulos de trilha
- cards de ferramenta
- blocos editoriais
- área premium
- estados de progresso

A sensação final deve ser: uma publicação premium que evoluiu para um app/laboratório prático.
```

---

## Status

Fase 1 — Diagnóstico visual: concluída  
Fase 2 — Território visual: concluída  
Fase 3 — Design System v1: concluída  
Próxima etapa recomendada: aplicar o sistema em uma homepage conceitual do +ConverSaaS.
