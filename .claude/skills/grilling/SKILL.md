---
name: grilling
description: Entrevista o usuário implacavelmente sobre um plano, decisão ou ideia até fechar todas as pontas soltas. Use quando o usuário quiser estressar o próprio raciocínio, pedir para ser "grelhado", ou antes de fechar uma spec grande (ex.: sessões de spec de issue do Lab/revamp).
---

# Grilling

Entreviste o usuário implacavelmente até chegarem a um entendimento compartilhado. Modele isso
como uma **árvore de design**: cada decisão ramifica nas decisões que dependem dela.

Trabalhe a árvore em **rodadas**. A **fronteira** é o conjunto de decisões cujos pré-requisitos
já estão resolvidos — as perguntas que dá para fazer *agora* sem chutar respostas que você ainda
não ouviu. Pergunte a fronteira inteira numa rodada só: numere cada pergunta e dê sua resposta
recomendada. Depois espere as respostas antes da próxima rodada.

Formato de cada pergunta:

```
❓ **Q1** - **<título da pergunta>**: <corpo da pergunta, pode ter múltiplos parágrafos e alternativas>

➡️ <sua resposta recomendada>
```

Cada rodada respondida remodela a árvore — decisões resolvidas empurram a fronteira para fora e
desbloqueiam perguntas que dependiam delas. Recompute a fronteira e faça a próxima rodada. Uma
pergunta cuja resposta depende de outra ainda aberta nesta rodada pertence a uma rodada
*posterior*, não a esta.

Descobrir **fatos** é trabalho seu, nunca do usuário. Quando uma pergunta da fronteira precisa de
um fato do ambiente (arquivos, docs do repo, comportamento do código), despache um sub-agente ou
vá olhar você mesmo — não pergunte ao usuário nada que você pode verificar sozinho. E não
bloqueie nisso: só as perguntas a jusante da exploração esperam; o resto da fronteira vai agora.
As **decisões** são do usuário — apresente cada uma e espere.

A sessão termina quando a fronteira está vazia: todo ramo da árvore visitado, nada assumido em
silêncio. Não aja sobre o plano até o usuário confirmar que vocês chegaram a um entendimento
compartilhado.

## Regras deste projeto

- **Grilling é para ANTES da direção, nunca depois.** O dono já deixou claro: depois que ele dá a
  direção de produto, os detalhes são seus para decidir, sem novas rodadas de pergunta. Use esta
  skill na fase de spec/plano (quando ele invocar ou quando a decisão for genuinamente dele) — e
  encerre-a de vez quando a direção estiver dada.
- Perguntas de produto/copy devem respeitar os vetos de voz já registrados (guias de voz do dono)
  — não reabra decisões de voz já tomadas.
- Sempre em português (Brasil).
