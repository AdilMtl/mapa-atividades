# 08 — Diretrizes Visuais DS2 (caderno de receitas para execução)

> **Revamp Conversas no Corredor / +Conversas** · criado em 2026-07-05
> **Função:** traduzir o Design System oficial (`docs/GPT Project Revamp/
> conversaas_design_system_v1_final.md` + `.html`) em receitas prontas para qualquer modelo
> executar SEM decidir nada de design. Se algo aqui conflitar com os arquivos-fonte, os
> arquivos-fonte vencem — reporte a divergência em vez de improvisar.
> O `.html` da pasta é o **protótipo visual de referência**: abra-o no navegador e compare o
> resultado. "Parecido" não basta — os valores abaixo são literais.

---

## 1. Tokens (copiar EXATAMENTE — proibido inventar cor, raio ou fonte)

```css
/* Fundos */
--bg-deep: #0A1412;          /* fundo profundo (body de páginas públicas) */
--bg-app: #08110F;           /* fundo do app logado */
--bg-panel: #1B3F39;         /* painel verde estrutural (destaques) */
--bg-panel-soft: rgba(255,255,255,0.055);
--bg-panel-strong: rgba(255,255,255,0.075);

/* Texto */
--text-primary: #F8F0E6;     /* títulos e texto principal (creme quente) */
--text-secondary: #D2DDD9;   /* corpo, descrições */
--text-muted: #9EAEA8;       /* metadados, numeração */
--text-subtle: #70817B;      /* o mais apagado */

/* Acentos */
--accent-orange: #D97706;    /* ação primária (herança da marca) */
--accent-magenta: #D34C75;   /* acento contemporâneo / premium */
--accent-amber-soft: #F0B674;/* eyebrows, labels mono */

/* Bordas e vidro */
--border-subtle: rgba(255,255,255,0.09);
--border-medium: rgba(255,255,255,0.14);
--surface-glass: rgba(255,255,255,0.055);
--surface-glass-hover: rgba(255,255,255,0.075);

/* Gradientes */
--gradient-primary: linear-gradient(90deg,#D97706,#D34C75);

/* Fontes */
--font-serif: "Fraunces", Georgia, serif;
--font-sans: "IBM Plex Sans", Inter, system-ui, sans-serif;
--font-mono: "IBM Plex Mono", Consolas, monospace;
```

**Fundo do body (páginas públicas)** — gradiente de ambiente, literal:

```css
background:
  radial-gradient(circle at 10% 0%, rgba(211,76,117,.12), transparent 25%),
  radial-gradient(circle at 90% 8%, rgba(217,119,6,.12), transparent 24%),
  linear-gradient(135deg,#08110F 0%,#132622 60%,#08110F 100%);
```

**Grid técnico** (APENAS em hero, módulos de ferramenta e áreas de laboratório — nunca na
página inteira):

```css
background:
  linear-gradient(90deg, rgba(255,255,255,.028) 1px, transparent 1px),
  linear-gradient(rgba(255,255,255,.028) 1px, transparent 1px),
  linear-gradient(135deg,#091514 0%,#10211D 100%);
background-size: 34px 34px, 34px 34px, auto;
```

## 2. Tipografia (regras de uso, sem exceção)

| Papel | Fonte | Especificação |
|---|---|---|
| H1 hero | Fraunces 500 | `clamp(48px,7vw,94px)`, line-height .92, letter-spacing -.065em |
| H2 seção | Fraunces 500 | 42px, line-height 1, letter-spacing -.045em |
| H3 card | IBM Plex Sans 600 | 19px, letter-spacing -.03em |
| Lead (sub do hero) | IBM Plex Sans 400 | 19px, line-height 1.5, cor `--text-secondary`, max-width 680px |
| Corpo | IBM Plex Sans 400 | 14–16px, line-height 1.45–1.55, cor `--text-secondary` |
| Eyebrow/label | IBM Plex Mono 500 | 11–12px, UPPERCASE, letter-spacing .13em, cor `--accent-amber-soft` |
| Numeração de card | IBM Plex Mono | 11px, letter-spacing .08em, cor `--text-muted` (ex.: `01 / EDITORIAL`) |
| Metadados/módulo | IBM Plex Mono | 12px, cor `--text-secondary` (ex.: `módulo 03 / ativo`) |

**Proibições:** Fraunces em corpo de texto ou botão; Mono em parágrafos; peso 700+ em
Fraunces; texto primário em branco puro `#fff` (é sempre o creme `#F8F0E6`).

## 3. Receitas de componentes (valores literais do protótipo)

### 3.1 Botões (sempre pill)
```css
.btn      { border-radius:999px; padding:14px 19px; font-weight:700; font-size:14px; border:1px solid transparent; }
.primary  { background:var(--accent-orange); color:#1E1005; }            /* texto ESCURO no laranja */
.primary:hover { background:var(--gradient-primary); }                    /* hover = gradiente */
.secondary{ background:transparent; color:var(--text-primary); border-color:rgba(255,240,220,.18); }
```
Primário = 1 por seção, no máximo. Nunca dois primários lado a lado.

### 3.2 Cards (3 variantes)
```css
.card          { border-radius:24px; border:1px solid var(--border-subtle); background:var(--surface-glass); padding:20px; }
.card-featured { background:rgba(46,104,96,.13); }                        /* verde estrutural */
.card-premium  { background:linear-gradient(145deg,rgba(211,76,117,.10),rgba(255,255,255,.04));
                 border-color:rgba(211,76,117,.20); }                      /* magenta = premium */
```
Anatomia do card padrão: numeração mono no topo (`01 / EDITORIAL`, margin-bottom 32px) →
H3 19px → parágrafo 14px `--text-secondary`.

### 3.3 Módulo com progresso (trilhas, ferramentas, kanban)
```css
.module      { border-radius:26px; border:1px solid var(--border-subtle); background:var(--surface-glass); padding:20px; }
.module-head { display:flex; justify-content:space-between; font-family:var(--font-mono); font-size:12px; color:var(--text-secondary); margin-bottom:14px; }
.progress       { height:10px; background:rgba(255,255,255,.11); border-radius:999px; overflow:hidden; }
.progress > span{ height:100%; background:var(--gradient-primary); }
```

### 3.4 Painel editorial (blocos de texto de seção)
```css
.panel { border-radius:28px; border:1px solid var(--border-subtle); background:var(--surface-glass); padding:24px; }
```
Layout de seção editorial: grid `grid-template-columns: .8fr 1.2fr; gap:24px` (painel de texto
à esquerda, conteúdo demonstrativo à direita). Em <900px vira 1 coluna.

### 3.5 Badge
```css
.badge { font-family:var(--font-mono); font-size:12px; letter-spacing:.08em; text-transform:uppercase;
         border:1px solid var(--border-medium); background:rgba(255,255,255,.05);
         color:var(--text-secondary); border-radius:999px; padding:.45rem .65rem; }
.badge-premium { border-color:rgba(211,76,117,.35); color:#F2B5C7; }
```

### 3.6 Hero (container)
Borda `--border-subtle`, `border-radius:34px`, padding 44px (28px em mobile), fundo = grid
técnico (§1). Estrutura interna: eyebrow → H1 (max-width 900px) → lead → `.actions`
(flex, gap 12px, wrap) → grid de 3 cards → módulo demonstrativo.

### 3.7 Navegação pública
Mono 12px; logo `+ConverSaaS` em 700 (com o `+` em gradiente ou `--accent-orange`) cor
`--text-primary`; tagline "o ecossistema virtual da newsletter Conversas no Corredor" em
mono 10px `--text-subtle`; links em `--text-secondary`; acento `--accent-amber-soft`. Em
mobile os links colapsam e a tagline some.

## 4. Escala de forma (memorize)

- **Raios:** botão/badge/progress = 999px · swatch 18px · type-card 20px · card 24px ·
  módulo 26px · painel 28px · hero 34px. (Quanto maior o container, maior o raio.)
- **Container da página:** `width:min(1220px, calc(100% - 40px)); margin:0 auto`.
- **Gaps:** cards 16px · seções 24px · margem entre seções 48px.
- **Breakpoint principal:** 900px (grids viram 1 coluna).
- **Touch:** alvos ≥44px; fonte base ≥16px em inputs (herança mobile-first do projeto).

## 5. Mapeamento de migração (tema antigo → DS2)

Tabela para as issues de restyle da plataforma logada (Fase 1B). Substituição mecânica:

| Uso atual (legado) | Valor atual | Vira (DS2) |
|---|---|---|
| Fundo body | `#042f2e` | `--bg-app` `#08110F` (+ gradiente de ambiente §1 nas telas principais) |
| Accent geral | `#d97706` | mantém `--accent-orange` (mesmo hex!) — hover ganha `--gradient-primary` |
| Texto branco | `#fff` / `text-white` | `--text-primary` `#F8F0E6` |
| Texto `white/80`,`white/70` | rgba branco | `--text-secondary` `#D2DDD9` |
| Texto `white/60`,`white/50` | rgba branco | `--text-muted` `#9EAEA8` |
| `.glass` (blur + white/6%) | backdrop-filter | `--surface-glass` + `--border-subtle` (sem blur pesado) |
| Bordas `white/10`,`white/20` | rgba | `--border-subtle` / `--border-medium` |
| Radius `rounded-lg/xl` (8–12px) | pequeno | escala do §4 (cards 24px, painéis 28px) |
| Títulos (font-mono ou bold sans) | system-ui | Fraunces nos H1/H2 de página; Plex Sans no resto |
| Zonas ROI (essencial/estratégica/tática/distração) | verde/azul/amarelo/vermelho | **MANTÊM os hex atuais** — são semântica de dados do produto, não decoração. Só o entorno muda. |

**Regra de ouro da Fase 1B:** restyle é 100% visual. Nenhuma mudança de lógica, estado, dados,
rotas, props ou textos funcionais. Se para estilizar você "precisaria" refatorar lógica, PARE
e registre — não refatore.

## 6. Proibições visuais (colar em toda issue de UI)

Robôs · circuitos · cérebros · neon ciano/roxo · glassmorphism pesado (blur alto) · sombras
duras/coloridas · emojis como ícones de interface (usar lucide-react) · branco puro em texto ·
laranja como cor de TEXTO longo (é ação/acento) · gradiente em fundos grandes (gradiente é
acento: botão hover, progress, borda premium) · grid técnico em seções de leitura · mais de um
CTA primário por seção · headline sem Fraunces.

## 7. Implementação no projeto (para a ISSUE-102 e consumidores)

1. Tokens entram em `src/app/globals.css` como CSS vars sob `:root` com prefixo `--ds2-*`
   (evita colisão com o tema legado inline do layout atual) e são expostos ao Tailwind v4 via
   `@theme` (ex.: `--color-ds2-orange: #D97706` → classe `bg-ds2-orange`).
2. Fontes via `next/font/google` (Fraunces variable com eixo opsz; IBM Plex Sans 400/500/600/700;
   IBM Plex Mono 400/500/600), `display:swap`, aplicadas como CSS vars no layout raiz —
   componentes DS2 as referenciam; legado continua em system-ui até a issue de restyle de cada tela.
3. Componentes em `src/components/ds2/`: `Button`, `Card`, `Badge`, `Module`, `Progress`,
   `Panel`, `GridSection` (wrapper com grid técnico), `Eyebrow`, `PageContainer`. Cada um
   implementa LITERALMENTE uma receita do §3 — o nome do componente = nome da receita.
4. Páginas novas proíbem hex solto: só classes/vars DS2. Grep de `#[0-9a-fA-F]{6}` no diff das
   issues de página deve retornar zero (exceto zonas ROI no legado).
