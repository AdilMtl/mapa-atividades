import Link from 'next/link'

import { Badge, Button, Card, Eyebrow, SectionTitle } from '@/components/ds2'

export function PortasSection() {
  return (
    <section id="portas">
      <SectionTitle>Por onde você quer começar?</SectionTitle>
      <p className="mt-2 max-w-[620px] font-ds2-sans text-sm text-ds2-text-secondary">
        Dois radares. Os dois terminam com um próximo passo claro.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Eyebrow>Radar 01 · Maturidade</Eyebrow>
            <Badge>comece grátis</Badge>
          </div>
          <h3 className="font-ds2-sans text-lg font-semibold tracking-[-0.03em] text-ds2-text-primary">
            Onde eu estou nessa história?
          </h3>
          <p className="font-ds2-sans text-sm leading-relaxed text-ds2-text-secondary">
            Curioso, Usuário, Operador, Builder ou Referência — descubra seu estágio e o salto
            que faz sentido agora. Retrato honesto, sem ranking.
          </p>
          <Button asChild variant="secondary" className="self-start">
            <Link href="/radar/maturidade">Ver meu nível em IA</Link>
          </Button>
          <p className="font-ds2-mono text-xs text-ds2-text-muted">
            Melhor pra quem sente que usa IA sem método. · 7 perguntas, ~2 min
          </p>
        </Card>
        <Card variant="featured" className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Eyebrow>Radar 02 · Oportunidades</Eyebrow>
            <Badge>diagnóstico completo por e-mail</Badge>
          </div>
          <h3 className="font-ds2-sans text-lg font-semibold tracking-[-0.03em] text-ds2-text-primary">
            O que dá pra construir no meu trabalho?
          </h3>
          <p className="font-ds2-sans text-sm leading-relaxed text-ds2-text-secondary">
            Pegue uma dor real da rotina e veja que formato de solução ela pede — e qual é o
            primeiro passo pra tirar do papel.
          </p>
          <Button asChild variant="primary" className="self-start">
            <Link href="/radar/oportunidades">Descobrir o que posso construir</Link>
          </Button>
          <p className="font-ds2-mono text-xs text-ds2-text-muted">
            Melhor pra quem já tem uma dor ou rotina em mente. · 8 perguntas, ~3 min
          </p>
        </Card>
      </div>
    </section>
  )
}
