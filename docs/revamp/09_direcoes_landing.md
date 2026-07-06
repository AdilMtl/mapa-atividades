# 09 — Direções da Landing (A/B/C) — comparação para decisão

> **Revamp Conversas no Corredor / +Conversas** · criado em 2026-07-05
> Três protótipos estáticos da home nova, mesmas 12 seções obrigatórias, mesmo DS2, mesma
> marca — direções de composição diferentes. O dono escolhe (ou híbrida) e a escolha vira a
> spec final da ISSUE-107. Arquivos em `docs/revamp/mockups/` (as versões do projeto tocam os
> 4 vídeos reais quando abertas localmente).

## As três hipóteses

| | **A — "Atelier fiel ao DS"** | **B — "Publicação premium"** | **C — "Workbench do builder"** |
|---|---|---|---|
| Arquivo | `landing-preview.html` | `landing-preview-b.html` | `landing-preview-c.html` |
| Hipótese | O protótipo do DS traduzido literalmente já comunica a tese | Autoridade editorial vende: a página lê como uma publicação que virou produto | Energia de produto vende: a página parece um app vivo desde o hero |
| Benchmarks-fonte | `conversaas_design_system_v1_final.html` (protótipo oficial) | Stripe Press, Anthropic, Stratechery, Farnam Street (benchmark §13.5) | Linear, Raycast, Every, Lenny (benchmark §13.5) |
| Hero | Frame com grid técnico + módulo de radar estático | Tipográfico aberto, Fraunces gigante, capítulos numerados | Split: copy + janela de app com radar ANIMADO (auto-seleção CSS) |
| Headline | "Você já usa IA. Agora falta descobrir onde ela realmente melhora seu trabalho." (doc §8.1, teste A) | "Todo mundo fala de IA. Pouca gente te mostra onde ela cabe no seu trabalho." (fusão da H2 de problema — mais corredor) | "Descubra o que você poderia construir com IA no seu trabalho." (doc §8.2, variação builder) |
| Estrutura | Seções empilhadas com panels/cards | Capítulos 01–07 com réguas, prosa em coluna de leitura, demos como "figuras", pricing em linhas (Stratechery-style) | Bento grid, chips, tabela compacta, pricing com anel gradiente, Lab com input de waitlist |
| Gradiente/animação | Mínimo (hover de botão) | Contido: pull-quote com borda gradiente, texto gradiente pontual, zero animação de scroll | Máximo controlado: orbs de fundo, borda gradiente na janela de app, radar auto-animado, reveal on scroll, glow em hover |
| Copy | Literal do doc operacional (v1 — o dono apontou "cheiro de IA") | Reescrita na voz do corredor, frases mais longas, provocação por capítulo | Reescrita na voz do corredor, curta e punchy, microcopy mono de sistema |
| Risco da direção | Genérica demais dentro do próprio DS; copy dura | Denso para visitante frio de Ads; menos "app" | "Startup demais" se exagerar; animação pode distrair do CTA |

## Feedback do dono sobre a A (2026-07-05) — já aplicado em B/C

1. Copy ~80%, com "toque de IA" / tradução do inglês → B e C têm copy reescrita direto na voz
   editorial (contrações, "firma", provocações, frases de corredor), não portada do briefing.
2. Mais gradiente/animação com percepção premium, sem ficar sloppy → C carrega essa aposta;
   B testa o extremo oposto (premium por contenção).
3. Estruturas de blocos dos benchmarks → mapeadas na tabela acima, por site.

## Como avaliar (mesmos 4 critérios da prévia A + 2 novos)

1. Teste dos 5 segundos (frio → entende que é IA aplicada ao trabalho?)
2. Tom da copy (soa você?) — **atenção: B e C têm copies diferentes entre si de propósito**
3. Percepção premium/profissional de primeira
4. Hierarquia mobile (rolar no celular)
5. **Qual hero pede mais clique?** (frame estático A vs manifesto B vs app animado C)
6. **Fadiga**: depois de 3 visitas, qual continua boa? (animação cansa antes de tipografia)

## Decisão — ✅ TOMADA PELO DONO (2026-07-05)

**Direção escolhida: HÍBRIDO A+C**, consolidado em `mockups/landing-preview-final.html`
(artifact "final-hibrido-a-c"). Componentes:

- **Da A (base visual):** frame do hero com grid técnico (o "quadriculado" de linhas
  horizontais/verticais — manter obrigatoriamente), estrutura das 12 seções, panels/cards,
  stage da plataforma, pricing em cards, Lab, todo o sistema visual.
- **Da C:** bloco de copy inicial — headline *"Descubra o que você poderia construir com IA
  no seu trabalho."* com **"construir com IA" destacado no gradiente laranja→magenta**; lead
  correspondente; **janela de app animada** do radar (auto-seleção + progresso) dentro do
  frame do hero; chips do hero; copy geral no tom corredor (reescrita da C aplicada às seções).
- **Marca corrigida: a plataforma chama-se "+ConverSaaS"** (não "+Conversas") — logo, barra da
  janela de app (`+conversaas/radar/...`), textos do Lab e rodapé. Sempre apresentada como
  "o ecossistema virtual da newsletter Conversas no Corredor".

**Consequência:** `landing-preview-final.html` é a spec visual pixel-a-pixel da ISSUE-107.
As versões A/B/C ficam arquivadas em `mockups/` como registro do processo.

## Decisão adicional — sequenciamento de execução (dono, 2026-07-05)

O dono pediu para começar a execução "já na fase zero" pela landing page, sem esperar os
radares (que ainda não existem). Consequência prática, registrada em detalhe na ISSUE-107 do
`04_issue_backlog.md`: os CTAs de diagnóstico do mock (hero e as duas "portas") são
implementados apontando **temporariamente** para `/pre-diagnostico` — o funil que já converte
hoje — em vez de `/radar/*`. O link "Já sou assinante" → `/auth` (entrar direto na plataforma,
como o site atual já tem) também é preservado no header/footer. Quando os radares existirem
(fim do Sprint 1), a ISSUE-107B troca esses destinos. O visual do mock não muda em nada por
causa disso — é só o `href` por trás dos botões.
