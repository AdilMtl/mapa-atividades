// =============================================================================
// DESCADASTRO — página pública (ISSUE-601C, §3.4 da spec)
// GET /descadastrar?t=<token assinado>. Sem login, sem formulário: a página
// mostra qual e-mail vai sair da lista e um único botão que confirma.
// O GET nunca grava (proteção contra prefetch de scanner de e-mail) — a
// gravação é da ação em ./actions.ts. Token inválido = mensagem, nunca 500.
// =============================================================================

import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'

import { validarTokenDescadastro } from '@/lib/marketing/descadastro'

import { confirmarDescadastro } from './actions'

export const metadata: Metadata = {
  title: 'Descadastrar — Conversas no Corredor',
  robots: { index: false, follow: false },
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
)

function Moldura({ children }: { children: React.ReactNode }) {
  return (
    <main className="ds2-bg-ambient flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-[440px] rounded-ds2-panel border border-ds2-border-subtle bg-ds2-surface-glass p-7">
        <p className="font-ds2-mono text-xs uppercase tracking-[0.16em] text-ds2-amber-soft">
          Conversas no Corredor
        </p>
        <div className="mt-4 space-y-4">{children}</div>
      </div>
    </main>
  )
}

export default async function PaginaDescadastrar({
  searchParams,
}: {
  searchParams: Promise<{ t?: string; de?: string; ok?: string; erro?: string }>
}) {
  const params = await searchParams
  const token = params.t ?? ''
  const email = token
    ? validarTokenDescadastro(token, process.env.MARKETING_LINK_SECRET ?? '')
    : null

  if (!email) {
    return (
      <Moldura>
        <h1 className="font-ds2-serif text-2xl text-ds2-text-primary">Este link não funciona</h1>
        <p className="font-ds2-sans text-sm leading-relaxed text-ds2-text-secondary">
          O link de descadastro veio incompleto ou foi alterado. Abre de novo o link que está no
          rodapé do e-mail que você recebeu — ou responde o e-mail pedindo pra sair da lista, que
          eu mesmo tiro.
        </p>
      </Moldura>
    )
  }

  const { data: existente, error: erroConsulta } = await supabaseAdmin
    .from('marketing_unsubscribes')
    .select('email')
    .eq('email', email)
    .maybeSingle()

  const jaDescadastrado = !erroConsulta && !!existente

  if (jaDescadastrado) {
    return (
      <Moldura>
        <h1 className="font-ds2-serif text-2xl text-ds2-text-primary">
          {params.ok ? 'Pronto, tá feito' : 'Você já está fora da lista'}
        </h1>
        <p className="font-ds2-sans text-sm leading-relaxed text-ds2-text-secondary">
          <strong className="text-ds2-text-primary">{email}</strong> não recebe mais e-mails deste
          sistema. Se um dia quiser voltar, é só responder qualquer e-mail antigo.
        </p>
        <p className="font-ds2-sans text-xs leading-relaxed text-ds2-text-muted">
          A newsletter no Substack é uma assinatura separada — se você também assina lá, o
          descadastro dela é pelo link no rodapé da própria newsletter.
        </p>
      </Moldura>
    )
  }

  return (
    <Moldura>
      <h1 className="font-ds2-serif text-2xl text-ds2-text-primary">Sair da lista de e-mails</h1>
      <p className="font-ds2-sans text-sm leading-relaxed text-ds2-text-secondary">
        Confirmando, <strong className="text-ds2-text-primary">{email}</strong> não recebe mais
        nenhum e-mail deste sistema — convites, lembretes, nada.
      </p>
      {params.erro && (
        <p className="rounded-ds2-card border border-ds2-magenta/40 p-3 font-ds2-sans text-sm text-ds2-text-primary">
          Não consegui gravar agora — tenta de novo em instantes.
        </p>
      )}
      <form action={confirmarDescadastro}>
        <input type="hidden" name="t" value={token} />
        <input type="hidden" name="de" value={params.de ?? ''} />
        <button
          type="submit"
          className="min-h-[48px] w-full rounded-ds2-pill bg-ds2-orange px-6 font-ds2-sans text-[15px] font-bold text-[#1E1005]"
        >
          Não quero mais receber
        </button>
      </form>
      <p className="font-ds2-sans text-xs leading-relaxed text-ds2-text-muted">
        Um toque e acabou — sem login, sem perguntas.
      </p>
    </Moldura>
  )
}
