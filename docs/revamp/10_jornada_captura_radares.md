# 10 — Jornada de Captura dos Radares (a jornada não é só informativa)

> **Revamp Conversas no Corredor / +ConverSaaS** · criado em 2026-07-06
> **Complementa** `01_product_spec_faseada.md` §3, §6 e §7 — **não substitui**. A metodologia
> de IA já mapeada (maturidade → 5 níveis; oportunidades → 9 tipos de solução de IA) permanece
> intacta. Esta nota adiciona **uma camada de conversão** por cima do que já existe: como e onde
> a jornada captura o e-mail, para o radar deixar de ser só um brinde informativo e virar canal.

---

## 1. Por que esta revisão (decisão do dono, 2026-07-06)

A spec original tratava os dois radares igual: "resultado resumido na tela → **captura
opcional**" ([01](01_product_spec_faseada.md) §3, regra 1; §6 e §7). O problema:

1. **Sem captura, o radar não é canal de conversão** — é um brinde. O que faz o
   `/pre-diagnostico` funcionar hoje é justamente o e-mail como troca-por-valor.
2. **Economia de Ads:** a rota de lead do radar já foi desenhada para disparar a **mesma
   conversão do Google Ads** do funil atual ([02](02_technical_spec.md) §3.4, `triggerConversion`).
   Captura de e-mail **é o evento de conversão**. Um radar 100% aberto com captura opcional =
   pagar tráfego para um funil que mede conversão lá no fim.
3. **Mas gate duro trai a marca:** trancar tudo atrás do e-mail antes de ver qualquer coisa
   vira paywall e mata o posicionamento editorial. O risco "quiz de marketing raso" ([01](01_product_spec_faseada.md)
   §12) continua de pé.

**Decisão:** a jornada vira uma **escada de dois degraus** — dá primeiro (grátis), pede depois
(e-mail), com um radar por degrau. Modelo de revelação = **camadas**; radares **diferenciados**
(confirmado com o dono em 2026-07-06).

## 2. A escada de compromisso

```text
Home (entende a tese)
   │
   ▼  degrau 1 — o "dou primeiro" (grátis, sem e-mail)
/radar/maturidade  →  resultado NA TELA: seu nível de fluência em IA
   │                  (situa a pessoa; abre a lacuna: "e agora, o que eu faço?")
   ▼  ponte: "você já sabe ONDE está — descubra O QUE fazer no seu trabalho"
/radar/oportunidades  →  teste de exploração: mapeia as oportunidades de IA no seu trabalho
   │                     • direção/forma da oportunidade aparece NA TELA (grátis, teaser real)
   ▼  gate de e-mail — o "pede depois" (= evento de conversão do Ads)
Diagnóstico COMPLETO (na tela após o e-mail + no e-mail) + /obrigado + newsletter
```

Por que funciona: **dou (situo) → lacuna (curiosidade) → peço (e-mail para fechar a lacuna)**.
É micro-compromisso clássico — a pessoa que já investiu 2 min descobrindo o nível tem muito mais
disposição de dar o e-mail para destravar o próximo passo. Os dois radares viram **uma jornada**,
não duas ferramentas soltas.

## 3. Degrau 1 — Radar de Maturidade (grátis, o gancho)

**A estrutura de [01](01_product_spec_faseada.md) §6 permanece:** 7 perguntas, escala 7–35,
5 níveis (Curioso / Usuário / Operador / Builder / Referência), textos por nível, leituras
mapeadas. O que esta nota fixa:

- **Resultado 100% na tela, sem e-mail.** Nível + o que significa + risco de ficar nele +
  próximo salto + 2–3 leituras. É o "dou primeiro" — a prova de valor que compra confiança.
- **CTA primário = ponte para o oportunidades** ("descubra as oportunidades de IA no seu
  trabalho"), não um formulário de e-mail. A lacuna que o resultado abre é o que empurra a
  pessoa para o degrau 2.
- **CTA de e-mail = secundário e suave** ("quer receber sua interpretação + a trilha por
  e-mail?"). Serve para capturar quem **não** vai fazer o segundo radar — é rede, não o gate
  principal. Manter opcional (decisão do dono: maturidade não trava resultado atrás do e-mail).
- **Este degrau não é o evento de conversão principal do Ads** (é topo de funil / gancho).

## 4. Degrau 2 — Radar de Oportunidades (o teste que captura)

**A estrutura de [01](01_product_spec_faseada.md) §7 permanece:** 8 perguntas, 1 de 9 tipos de
solução de IA, árvore de decisão determinística, guard-rails (dados sensíveis rebaixam +
marcam diligência; agêntico nunca é entrada). O que esta nota fixa:

- **Framing de teste/exploração, não "playbook"** (preferência explícita do dono, 2026-07-06):
  a pessoa **mapeia as oportunidades de IA no próprio trabalho** através do teste — a sensação é
  de explorar/descobrir, não de receber uma receita de cima. A copy e a UX refletem isso
  ("mapeie", "explore", "descubra" — não "aqui está seu plano").
- **Revelação em camadas dentro do radar:**
  - **Grátis, na tela:** a **direção / forma** da oportunidade — um teaser real e específico
    (não caixa preta). Ex.: os eixos dominantes que o teste mapeou + a "família" de solução para
    onde o trabalho aponta. A pessoa vê que o diagnóstico é de verdade **antes** de dar o e-mail.
  - **Atrás do e-mail:** o **diagnóstico completo** — os 8 blocos de [01](01_product_spec_faseada.md)
    §7 (tipo recomendado, porquê, complexidade, risco, primeiro passo, leitura, CTA newsletter,
    CTA Lab) + o cruzamento com a maturidade. Entregue **na tela logo após o e-mail** e **no
    e-mail** (redundância = rede de segurança de deliverability).
- **Este é o evento de conversão** — o lead de oportunidades dispara a mesma conversão Google Ads
  do funil atual ([02](02_technical_spec.md) §3.4).

## 5. Onde o gate cai (regra precisa)

| | Grátis na tela (sem e-mail) | Atrás do e-mail | Dispara conversão Ads? |
|---|---|---|---|
| **Maturidade** | Resultado completo (nível + interpretação + próximo passo + leituras) | Nada obrigatório; e-mail é opção suave (interpretação/trilha) | Não (gancho) |
| **Oportunidades** | Direção/forma da oportunidade (teaser real e específico) | Diagnóstico completo (8 blocos + cruzamento) | **Sim** |

Invariantes que **continuam valendo** (não quebram com esta revisão):
- **Sem conta, sem login, nunca.** E-mail ≠ conta — a pessoa completa tudo anonimamente
  ([01](01_product_spec_faseada.md) §9, critério #3).
- **Valor antes do gate** ([01](01_product_spec_faseada.md) critério #4) — reinterpretado, não
  abandonado: **sempre há um resultado real e específico na tela**; o e-mail destrava o
  **aprofundamento** no oportunidades, nunca um resultado vazio. O gate é continuação natural
  da curiosidade, não paywall.

## 6. Implicações por issue (sem mexer na estrutura já mapeada)

- **ISSUE-103 (páginas /radar/\*):** o `RadarFlow` compartilhado precisa de **dois estados finais
  parametrizáveis por radar** — maturidade termina em resultado completo aberto; oportunidades
  termina em teaser aberto + gate de e-mail → diagnóstico completo. A captura no oportunidades
  **não** bloqueia ver o teaser. CTA-ponte da maturidade para o oportunidades é obrigatório.
- **ISSUE-104 (motor):** além do resultado final, o motor de oportunidades expõe a **camada
  "direção/teaser"** (o que mostrar de graça) separada da **camada "completo"** (o que fica
  atrás do e-mail). Decisão de produto — revisar com o modelo forte qual recorte vai no teaser
  (mostrar o suficiente para provar valor, reter o suficiente para dar vontade do completo).
- **ISSUE-105 (conteúdo):** os textos de maturidade são **conteúdo grátis** (mostrados inteiros
  na tela); os 9 tipos de oportunidade compõem o **diagnóstico completo** (atrás do e-mail + no
  e-mail). Escrever os teasers de direção no tom de **exploração**, não de veredito.
- **ISSUE-106 (captura):** a **conversão dispara no lead de oportunidades**; maturidade tem
  captura suave opcional. O e-mail de oportunidades entrega o diagnóstico completo. Rate
  limit/honeypot/service_role conforme já especificado.
- **ISSUE-107 (home):** os CTAs devem refletir a escada — maturidade como **"comece (grátis)"**
  e oportunidades como o passo que aprofunda. ⚠️ **Reconciliar com o mock aprovado**
  (`mockups/landing-preview-final.html`), cujo CTA primário do hero hoje é *"Quero ver minhas
  oportunidades"*. Ponto em aberto para a ISSUE-107 — não resolver aqui.

## 7. O que esta nota NÃO faz (para não repetir o erro de escopo)

- Não introduz DAR CERTO, ROI do Foco nem qualquer framework do produto legado nos radares —
  eles são sobre **IA**, e a metodologia de IA já está mapeada em [01](01_product_spec_faseada.md)
  §6–§8.
- Não reescreve perguntas, níveis, tipos de solução nem a lógica de scoring.
- Não muda o número de radares, rotas ou o fluxo sem conta.
- É estritamente a **camada de captura/jornada** — o "como converte", não o "qual é a metodologia".

## 8. Registro de decisão (2026-07-06)

- **Modelo de revelação:** camadas (não ungated, não gate duro). Confirmado pelo dono.
- **Radares diferenciados:** maturidade = grátis/gancho (topo); oportunidades = teste que captura
  (conversão). Confirmado pelo dono.
- **Framing do oportunidades:** exploração/teste ("mapeie suas oportunidades"), não playbook
  prescritivo. Preferência explícita do dono.
- **Ponto de conversão:** movido de "opcional nos dois" para "lead de oportunidades = conversão".
- **Escopo:** complementa 01 §3/§6/§7; mantém a metodologia de IA e a estrutura das issues
  103–106 intactas.
- **Aberto:** reconciliar CTAs do hero (mock) com a escada — tratado na ISSUE-107.
