---
name: nova-feature
description: Planeja e implementa uma feature nova no projeto +Conversas no Corredor (ROI do Foco) com disciplina. Use quando o usuário pedir para adicionar/criar/implementar uma funcionalidade, página, componente, endpoint ou fluxo novo ("adicionar X", "criar página Y", "quero uma feature de Z"). Garante escopo claro, respeito à arquitetura existente, verificação real e documentação.
---

# Nova Feature

Implementar feature nova sem recriar o caos do passado (código manual, sem verificação, sem doc).

## Passo 1 — Escopo antes de código

Antes de escrever qualquer linha:
- Reformule em 1–2 frases o que a feature faz e para quem.
- Liste os arquivos/áreas que serão tocados (páginas em `src/app/`, componentes em
  `src/components/`, lógica em `src/lib/`, APIs em `src/app/api/`).
- Identifique impacto em **dados**: precisa de nova tabela/coluna? Nova política RLS?
  Se sim, escreva o SQL e trate RLS/`security_invoker` com cuidado (ver `CLAUDE.md`).
- Se o escopo estiver grande ou ambíguo, proponha um plano e confirme com o usuário antes de codar.

## Passo 2 — Implementar seguindo o que já existe

- **Reutilize** componentes de `src/components/base` e `ui`, e tokens de `src/lib/design-system.ts`.
  Não invente cores/estilos novos — use as cores das zonas e o accent `#d97706`.
- **Mobile-first**: touch targets ≥ 44px, fonte base 16px, layout responsivo.
- Siga o padrão de código do arquivo vizinho (nomes, idioma pt-BR nos textos de UI, imports).
- Para dados, use o cliente de `src/lib/supabase.ts`. Segredos só via env (nunca hardcode).

## Passo 3 — Verificar de verdade

⚠️ O build **não** pega erros de tipo/lint (config ignora ambos). Então, obrigatoriamente:
```bash
npm run lint
npx tsc --noEmit
npm run dev        # exercite o fluxo no navegador
```
- Teste o caminho feliz **e** um caminho de erro.
- Se a feature toca o PWA, valide com `npm run build && npm run start`.
- Se toca RLS/APIs públicas, teste o fluxo sem estar logado.

## Passo 4 — Fechar

- Atualize a documentação seguindo o fluxo do `CLAUDE.md` (ou deixe para a `/finalizar-sessao`).
- Descreva ao usuário o que foi feito, arquivos alterados e como testar.

## Regras
- Não faça over-engineering: entregue a feature pedida, não uma plataforma.
- Não commite/pushe aqui — isso é papel da `/finalizar-sessao`.
- Nunca edite `next.config.ts` (morto) nem os arquivos `*.backup.*`.
