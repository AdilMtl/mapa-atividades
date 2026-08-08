---
name: prototype
description: Constrói um protótipo descartável para responder uma pergunta de design antes de codar de verdade. Use quando o usuário quiser validar se uma lógica/modelo de estados faz sentido, ou explorar como uma UI deveria ficar ("faz um mockup", "quero ver antes", "testa umas variações de layout").
---

# Prototype

Um protótipo é **código descartável que responde uma pergunta**. A pergunta decide o formato.

## Escolha o ramo

Identifique qual pergunta está sendo respondida — pelo pedido do usuário, pelo código ao redor,
ou perguntando se ele estiver disponível:

- **"Essa lógica / modelo de estados faz sentido?"** → [LOGIC.md](LOGIC.md). Um único arquivo
  HTML compartilhável — botões de exploração livre + walkthroughs guiados em abas — que força a
  máquina de estados pelos casos difíceis de raciocinar no papel. Exemplos neste projeto: fluxo
  do wizard do pré-diagnóstico, regras de desbloqueio da biblioteca/gamificação, motor de
  heurísticas.
- **"Como isso deveria ficar?"** → [UI.md](UI.md). Várias variações de UI **radicalmente
  diferentes**, alternáveis. Exemplos: seções da landing, telas da plataforma logada, admin.

Errar o ramo desperdiça o protótipo inteiro. Se a pergunta for ambígua e o usuário não estiver
disponível, escolha pelo código ao redor (módulo/motor → lógica; página/componente → UI) e
declare a suposição no topo do protótipo.

## Regras deste projeto (adaptam as originais)

1. **Descartável desde o dia um, e marcado como tal.** Protótipos de UI/HTML estático vivem em
   `docs/revamp/mockups/` (a convenção já existente — ex.: `landing-preview-final.html`), com
   nome que deixe claro que é protótipo. **Nunca** crie rotas de protótipo dentro de `src/app/`
   sem o dono pedir — a `main` é produção.
2. **Trivial de rodar.** O ideal é um único arquivo HTML que abre com duplo clique — sem servidor,
   sem build. É também o formato que o dono consegue abrir **no celular**, onde ele valida UI de
   verdade (a validação manual de UI é sempre dele, no aparelho real).
3. **Mobile-first no protótipo também.** Viewport de celular como caso principal, touch targets
   ≥ 44px, fonte base 16px. Protótipo que só funciona em desktop responde a pergunta errada.
4. **Use os tokens reais.** Cores e espaçamentos do `src/lib/design-system.ts` (ou das diretrizes
   DS2 em `docs/revamp/08_diretrizes_visuais_ds2.md` se for coisa do revamp) — um protótipo com
   hex inventado valida uma estética que não existe.
5. **Sem persistência por padrão.** Estado em memória. Se a pergunta envolver banco de verdade,
   pare e discuta com o dono antes — nada de tabela de rascunho no Supabase de produção.
6. **Zero polimento.** Sem testes, sem tratamento de erro além do mínimo para rodar, sem
   abstração. O objetivo é aprender rápido.
7. **Mostre o estado.** Após cada ação (lógica) ou troca de variante (UI), renderize o estado
   relevante completo, para o usuário ver o que mudou.
8. **Capture a resposta ao final.** O veredito (qual variante ganhou, qual regra caiu) vai para o
   doc da issue/spec correspondente em `docs/revamp/` ou para o `CURRENT-STATUS.md` da sessão.
   O protótipo em si pode ficar commitado em `docs/revamp/mockups/` como fonte primária — é a
   convenção deste repo (não usamos branch descartável para isso).
