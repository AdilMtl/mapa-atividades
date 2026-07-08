import { Badge, Button, Card, SectionTitle } from '@/components/ds2'

const SUBSCRIBE_URL = 'https://conversasnocorredor.substack.com/subscribe'

export function PricingSection() {
  return (
    <section>
      <SectionTitle>Escolha como participar</SectionTitle>
      <p className="mt-2 max-w-[620px] font-ds2-sans text-sm text-ds2-text-secondary">
        A assinatura é feita pela newsletter no Substack. Quem assina o plano pago recebe acesso
        completo à plataforma.
      </p>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="flex flex-col gap-4">
          <span className="font-ds2-sans text-sm font-semibold text-ds2-text-primary">
            Gratuito
          </span>
          <div className="font-ds2-serif text-3xl text-ds2-text-primary">
            R$ 0<small className="font-ds2-sans text-sm text-ds2-text-muted">/mês</small>
          </div>
          <ul className="flex-1 space-y-2 font-ds2-sans text-sm text-ds2-text-secondary">
            <li>Newsletter toda semana no seu e-mail</li>
            <li>Textos públicos e radares gratuitos</li>
            <li>Sem cartão, sem pegadinha</li>
          </ul>
          <Button asChild variant="secondary">
            <a href={SUBSCRIBE_URL} target="_blank" rel="noopener noreferrer">
              Receber a newsletter grátis
            </a>
          </Button>
        </Card>

        <Card variant="featured" className="flex flex-col gap-4">
          <Badge className="self-start">Mais popular</Badge>
          <span className="font-ds2-sans text-sm font-semibold text-ds2-text-primary">
            Mensal
          </span>
          <div className="font-ds2-serif text-3xl text-ds2-text-primary">
            R$ 15<small className="font-ds2-sans text-sm text-ds2-text-muted">/mês</small>
          </div>
          <ul className="flex-1 space-y-2 font-ds2-sans text-sm text-ds2-text-secondary">
            <li>Artigos e séries exclusivas</li>
            <li>Acesso completo ao aplicativo</li>
            <li>Todo conteúdo pago publicado</li>
          </ul>
          <Button asChild variant="primary">
            <a href={SUBSCRIBE_URL} target="_blank" rel="noopener noreferrer">
              Quero o acesso completo
            </a>
          </Button>
        </Card>

        <Card className="flex flex-col gap-4">
          <span className="font-ds2-sans text-sm font-semibold text-ds2-text-primary">
            Anual
          </span>
          <div className="font-ds2-serif text-3xl text-ds2-text-primary">
            R$ 150<small className="font-ds2-sans text-sm text-ds2-text-muted">/ano</small>
          </div>
          <span className="font-ds2-mono text-xs text-ds2-text-muted line-through">
            R$ 180 · 2 meses de cortesia
          </span>
          <ul className="flex-1 space-y-2 font-ds2-sans text-sm text-ds2-text-secondary">
            <li>Tudo do plano Mensal</li>
            <li>Bônus exclusivos</li>
          </ul>
          <Button asChild variant="secondary">
            <a href={SUBSCRIBE_URL} target="_blank" rel="noopener noreferrer">
              Ver plano anual
            </a>
          </Button>
        </Card>
      </div>
    </section>
  )
}
