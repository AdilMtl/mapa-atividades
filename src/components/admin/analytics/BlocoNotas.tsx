import * as React from 'react'

import { Card, Eyebrow } from '@/components/ds2'
import type { AmostraInfo } from '@/lib/admin/analytics'

function dataCurta(iso: string | null): string {
  if (!iso) return 'sem piso (todo o histórico)'
  return new Date(iso).toLocaleDateString('pt-BR')
}

export function BlocoNotas({
  desde,
  amostraSessoes,
  amostraLeads,
  incluirTrafegoTeste,
}: {
  desde: string | null
  amostraSessoes: AmostraInfo
  amostraLeads: AmostraInfo
  incluirTrafegoTeste: boolean
}) {
  const truncado = amostraSessoes.truncada || amostraLeads.truncada

  return (
    <section className="space-y-3">
      <Eyebrow>como ler estes números</Eyebrow>
      <Card className="space-y-3 font-ds2-sans text-sm leading-relaxed text-ds2-text-secondary">
        <p>
          <strong className="text-ds2-text-primary">Dados a partir de:</strong> {dataCurta(desde)}
          {incluirTrafegoTeste
            ? ' — incluindo o tráfego de teste do dono.'
            : ' — o tráfego de teste do dono está excluído dos leads e projetos (sessões anônimas sem e-mail não têm como ser identificadas; use a data de corte pra isso).'}
        </p>
        <p>
          <strong className="text-ds2-text-primary">Exato × direcional:</strong> números de sessões, leads e
          projetos vêm das tabelas (uma linha por pessoa) — são exatos. Números com o selo{' '}
          <em>evento</em> vêm de um log que pode duplicar ou perder disparo — são direcionais,
          nunca uma contagem de pessoa.
        </p>
        <p>
          <strong className="text-ds2-text-primary">Não existe topo de funil.</strong> Sem evento de
          pageview, o funil começa em &quot;sessão de radar criada&quot; — não sabemos quantas
          pessoas viram a página e não começaram.
        </p>
        <p>
          <strong className="text-ds2-text-primary">Não existe dropout por pergunta.</strong> As
          respostas só são gravadas no fim do radar — quem abandona na pergunta 1 e na pergunta 7
          são indistinguíveis hoje.
        </p>
        <p>
          <strong className="text-ds2-text-primary">Taxa com N baixo é indício, não conclusão.</strong>{' '}
          Todo percentual nesta tela vem com o número absoluto ao lado — decisão de mídia com N
          pequeno é aposta, não dado.
        </p>
        {truncado && (
          <p className="text-ds2-amber-soft">
            ⚠️ A amostra desta janela passou do teto de leitura ({amostraSessoes.lidas} de{' '}
            {amostraSessoes.total} sessões, {amostraLeads.lidas} de {amostraLeads.total} leads) — os
            números abaixo estão subcontando. Encurte a janela ou avise o dono pra migrar a
            agregação para views SQL.
          </p>
        )}
      </Card>
    </section>
  )
}
