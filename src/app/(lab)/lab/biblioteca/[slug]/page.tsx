import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'

import { Eyebrow } from '@/components/ds2'
import { guiaPorSlug } from '@/lib/lab/materiais'

// =============================================================================
// /lab/biblioteca/[slug] — LEITURA DE UM GUIA (ISSUE-316, Fatia A)
// Server Component: lê o guia direto de `materiais.ts` (conteúdo já aprovado na
// 314) — não precisa de banco pra Fatia A. O plano do projeto linka pros mesmos
// slugs (`plan.materiais_slugs`), então deep-link funciona (contrato "zero slug
// quebrado" garantido pelos SLUGS_CANONICOS). Slug inexistente → 404.
// Área de LEITURA: DS2 limpo, sem grid técnico (proibição doc 08 §6).
// Spec: docs/revamp/ISSUE-316-spec-tela-trilha.md
// =============================================================================

export default async function GuiaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const guia = guiaPorSlug(slug)
  if (!guia) notFound()

  return (
    <article className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/lab/biblioteca"
        className="inline-flex min-h-11 items-center gap-2 font-ds2-mono text-xs text-ds2-text-muted transition-colors hover:text-ds2-text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Biblioteca
      </Link>

      <div>
        <Eyebrow>guia de construção</Eyebrow>
        <h1 className="mt-3 font-ds2-serif text-3xl font-medium tracking-[-0.03em] text-ds2-text-primary md:text-4xl">
          {guia.titulo}
        </h1>
      </div>

      <div className="space-y-4">
        {guia.paragrafos.map((paragrafo, i) => (
          <p key={i} className="text-[15px] leading-relaxed text-ds2-text-secondary">
            {paragrafo}
          </p>
        ))}
      </div>
    </article>
  )
}
