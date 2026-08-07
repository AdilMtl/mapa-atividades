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
          <strong className="text-ds2-text-primary">O topo do funil existe desde ago/2026 — e é
          direcional.</strong> &quot;Viu a página&quot; vem do evento de pageview, gravado uma vez
          por rota por visita (sessão do navegador) e só nas três rotas de entrada: a home e as
          páginas dos dois radares. Janela que inclui período anterior a ago/2026 mostra um topo
          menor que o real — as visitas daquela época simplesmente não foram contadas. E por ser
          visita (evento), não sessão, ele não ganha percentual sobre o resto do funil.
        </p>
        <p>
          <strong className="text-ds2-text-primary">O dropout por pergunta é exato — mas só enxerga
          desde ago/2026.</strong> As respostas passaram a ser salvas a cada pergunta respondida.
          Sessão abandonada antes disso não tem resposta salva e cai no balde &quot;sem
          resposta&quot;, junto de quem abriu e não respondeu nada — os dois casos são
          indistinguíveis por construção, e é por isso que esse balde fica fora do gráfico.
        </p>
        <p>
          <strong className="text-ds2-text-primary">Taxa com N baixo é indício, não conclusão.</strong>{' '}
          Todo percentual nesta tela vem com o número absoluto ao lado — decisão de mídia com N
          pequeno é aposta, não dado. Por isso o cruzamento área × tipo esconde combinação que
          apareceu uma vez só: uma pessoa não é um padrão.
        </p>
        <p>
          <strong className="text-ds2-text-primary">Concluir o radar não é um clique.</strong> Não
          existe botão de &quot;terminar&quot;: no instante em que a pessoa responde a última
          pergunta, o radar calcula o resultado e grava as respostas, o veredito e a conclusão de
          uma vez só. Responder e concluir são o mesmo evento — não existe uma sem a outra.
        </p>
        <p>
          <strong className="text-ds2-text-primary">Segmentação é autodeclarada, não demografia.</strong>{' '}
          &quot;Quem chega&quot; e &quot;o que dói&quot; saem das respostas fechadas dos radares —
          não temos (nem queremos, por ora) idade, gênero ou cidade. Como a resposta só é gravada
          no fim, <strong className="text-ds2-text-primary">a base desses dois painéis é o número
          de conclusões, não o de sessões</strong> — se a janela tem 60 sessões e 25 conclusões,
          as barras estão lendo 25.
        </p>
        <p>
          <strong className="text-ds2-text-primary">Ali a contagem é de sessões, não de pessoas.</strong>{' '}
          Quem refez o radar aparece duas vezes na distribuição. Já o número de{' '}
          <em>leads únicos</em> é por e-mail distinto: a mesma pessoa nos dois radares gera duas
          linhas na tabela e conta como um lead só.
        </p>
        <p>
          <strong className="text-ds2-text-primary">Conclusão pode estar subcontada — nunca inflada.</strong>{' '}
          A gravação do resultado é tolerante a falha de propósito: se a rede cair naquele
          instante, a pessoa vê o resultado normalmente e a conclusão não fica registrada. Uma
          diferença pequena entre &quot;concluiu&quot; e &quot;virou lead&quot; pode ser isso, e
          não comportamento de quem respondeu.
        </p>
        <p>
          <strong className="text-ds2-text-primary">O pipeline do Lab ignora a janela.</strong> É o
          acumulado do beta: os degraus vivem em tabelas de tempos diferentes (convite de 40 dias
          atrás, conta criada hoje), e recortar por período faria um degrau ficar maior que o topo.
          Ele também separa pessoas de projetos — são unidades diferentes e não se somam.
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
