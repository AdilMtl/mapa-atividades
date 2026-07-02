---
name: finalizar-sessao
description: Encerra uma sessão de trabalho no projeto +Conversas no Corredor (ROI do Foco). Use quando o usuário disser "finalizar sessão", "terminamos", "fecha a sessão", "pode commitar", "sobe pro deploy". Atualiza a documentação (CURRENT-STATUS + CHANGELOG), roda as verificações, faz o commit e — só após confirmação explícita — dá push na main, o que dispara o deploy automático na Vercel.
---

# Finalizar Sessão

Automatiza o ritual manual que antes era feito à mão. Cada etapa com verificação e confirmação —
nada é commitado ou publicado sem checagem.

## Passo 1 — Revisar o que mudou

```bash
git status
git diff --stat
```
Liste ao usuário o que foi alterado nesta sessão e confirme se está tudo que deveria (sem
`.env.local`, sem arquivos temporários, sem segredos).

## Passo 2 — Verificações de qualidade (antes de qualquer commit)

⚠️ O build ignora erros de TS/ESLint, então valide manualmente:
```bash
npm run lint
npx tsc --noEmit
npm run build      # garante que compila
```
Se algo falhar, **pare** e corrija (ou avise o usuário) antes de continuar.

## Passo 3 — Atualizar documentação

Siga o fluxo do `CLAUDE.md`:
1. **`docs/CURRENT-STATUS.md`** — adicione a sessão atual no topo (data, versão, entregas, status).
   Use a data real de hoje.
2. **`docs/CHANGELOG.md`** — nova entrada no topo, formato Keep a Changelog:
   `## [vX.Y.Z] - AAAA-MM-DD - Título` com seções `✅ Adicionado` / `🔧 Corrigido` / `🎨 Melhorado` /
   `📊 Técnico`. Para bugs, registre **causa raiz** e **solução**.
3. Decida o bump de versão (SemVer): patch (correção), minor (feature), major (breaking).
   Se for versão nova relevante, crie `docs/versions/vX.Y.Z-descricao.md`.
4. Atualize o número de versão no `README.md`/badges se aplicável.

Confirme a versão e o título com o usuário se houver dúvida.

## Passo 4 — Commit

Mensagem em português, formato `tipo: descrição vX.Y.Z`. Encerre a mensagem com o trailer:
```
Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
```
```bash
git add .
git commit -m "tipo: descrição vX.Y.Z

<detalhes opcionais>

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

## Passo 5 — Deploy (SÓ com confirmação)

Pergunte explicitamente: **"Faço o push para a `main`? Isso publica em produção via Vercel."**

- Só prossiga com um "sim" claro.
- Este projeto **deploya a partir da `main`** (fluxo estabelecido do dono) — o push já é o deploy:
  ```bash
  git push origin main
  ```
- Confirme ao usuário que o push foi feito e que a Vercel vai buildar automaticamente.
  Lembre que o deploy leva ~1–2 min e o PWA/Service Worker só é validável em produção.

## Regras
- **Nunca** dê push sem confirmação explícita nesta sessão.
- **Nunca** use `--no-verify`, `--force`, ou pule hooks, a menos que o usuário peça.
- **Nunca** commite `.env.local` ou segredos — cheque o `git diff` antes.
- Se as verificações do Passo 2 falharem, não commite "para resolver depois" sem avisar.
- Se não houver mudança que justifique versão nova, faça só commit (sem bump) e diga isso.
