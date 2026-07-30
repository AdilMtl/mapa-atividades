# ISSUE-318 — Copy da vitrine `/lab` em modo "beta no ar" (v2, vetos do dono aplicados)

> Criado em 2026-07-29. Substitui a copy de 2026-07-05 que prometia features especulativas
> ("Builder Canvas", "PRD Kit"). **v2 na mesma data:** o dono revisou a v1 e vetou — os vetos
> e a versão vigente estão abaixo. O formulário da lista (`LabWaitlistForm`) fica intocado.
>
> **Vetos do dono na v1 (registrar pra não repetir):**
> 1. H1 com meta-referência ("saiu do 'em breve'") — não precisa explicar o passado da página.
> 2. **Travessão como aparte é cara de IA** — trocar por construção conversacional ou dois-pontos.
> 3. Copy "travada"/traduzida — escrever **português do Brasil com artigos** ("naquela
>    planilha", "uma tarde inteira"), fluido como se fala.
> 4. "O que trava não é X: é Y" (contraste seco) → forma fluida: "Porque o que está travando
>    talvez não seja..., mas...".
> 5. Bloco do beta com "pouca gente de cada vez" soava excludente — o tom certo é **instigar**:
>    quem entra agora ajuda a construir, fala direto com o autor.

---

## Estrutura da página (de cima pra baixo)

1. Badge de status: `Lab · beta fechado, no ar`
2. Título (H1)
3. Dois parágrafos (cena → o que o Lab faz)
4. Badges do que existe de verdade (substituem a lista especulativa)
5. Bloco do beta: como funciona o convite + CTA de entrada pra convidados
6. Lista de interesse (formulário atual, sem mudança de código)

---

## Copy vigente (v2 — no ar quando a issue fechar)

**Badge:** `Lab · beta no ar`

**H1:**
> O Lab está no ar: o lugar onde um problema do seu trabalho vira um projeto com plano.

**Parágrafo 1 (a cena):**
> Você já sabe onde a IA poderia te ajudar: naquela planilha que você atualiza toda semana,
> naquele relatório que leva uma tarde inteira para ficar pronto, naquele processo que todo
> mundo reclama e ninguém arruma. Porque o que está travando talvez não seja a falta de
> ferramenta, mas transformar essa ideia em algo que funciona de verdade no seu contexto.

**Parágrafo 2 (o que o Lab faz):**
> No Lab, você conta esse problema numa conversa guiada, como se estivesse falando com um
> consultor, e sai com um diagnóstico honesto: que tipo de solução faz sentido para você, com
> as ferramentas que você já tem, e um plano em fases para construir. E aí, no final, você
> ainda tem acesso a uma biblioteca de ferramentas para transformar o que você construiu em
> algo prático, que te dá resultado na carreira.

**Badges (o que existe hoje, no lugar dos itens especulativos):**
- `Conversa guiada, estilo consultor`
- `Diagnóstico com 9 tipos de solução`
- `Plano em fases, com guia e prompt`
- `Biblioteca que cresce com você`

**Bloco do beta:**

Eyebrow/label: `beta por convite`

> O Lab está abrindo em levas de convites, e quem entra agora ajuda a construir o que ele vai
> ser: testa primeiro, fala direto comigo e vê as próprias sugestões virarem produto.

CTA do convidado (botão secundário, link pra `/auth?next=/lab/inicio`):
> Recebi meu convite, quero entrar

**Introdução da lista (acima do formulário):**
> Quer o seu convite? Entra na lista: é dela que saem as próximas levas.

**Nota de rodapé (a atual, levemente ajustada):**
> A lista também ajuda a decidir o que construir primeiro.

*(Botão do formulário continua o que já existe: "Quero entrar na lista do Lab".)*

---

## Notas de decisão (por que assim)

- **Cena antes do conceito** (anti-padrão nº 1 do feed: aforismo sem âncora). A planilha
  semanal e o relatório de uma tarde inteira são cenas que o leitor reconhece na pele.
- **"Como se estivesse falando com um consultor"** carrega o critério 7 do gate da Fase 1A
  ("diferente de chat") de forma conversacional, sem aparte de travessão (veto 2).
- **CTAs verbalizam intenção** (README §7): "Recebi meu convite, quero entrar" e "Quero
  entrar na lista do Lab" — nunca "Login" / "Cadastre-se".
- **Zero promessa de features futuras** — a página só afirma o que o beta entrega hoje.
  Wizard/Canvas/PRD Kit especulativos saíram; o que era promessa virou descrição.
- **Sem "desbloqueia"** (proibição do README §7) — a biblioteca "cresce com você".
- **Bloco do beta instiga em vez de excluir** (veto 5): entrar cedo = moldar o produto e
  falar direto com o autor — pertencimento, não escassez artificial.
- **"Fala direto comigo"** assume a primeira pessoa do Adilson — coerente com a newsletter,
  e é o convite de comunidade que ele pediu.

## O que NÃO muda nesta página

- `LabWaitlistForm` (componente, API `/api/lab/interest`, honeypot, UTM) — byte a byte.
- GTM continua vindo do layout raiz — nenhum script novo na página.
- Rota, metadata `title`/`description` ganham ajuste mínimo coerente com a copy nova
  (sem "em construção").
