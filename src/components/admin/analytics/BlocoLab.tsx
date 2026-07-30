import * as React from 'react'

import { Badge, Card, Eyebrow } from '@/components/ds2'
import type {
  AberturaGuia,
  DistribuicaoRotulada,
  FaseCaminhada,
  MetadePipeline,
  PipelineLab,
} from '@/lib/admin/analytics'

export interface DadosLab {
  pipeline: PipelineLab
  statusProjetos: DistribuicaoRotulada
  progressao: { mediaPct: number | null; base: number }
  fases: { topo: number; fases: FaseCaminhada[] }
  guias: AberturaGuia[]
}

/**
 * A unidade (pessoas × projetos) mora no TÍTULO do card, não em cada linha:
 * repetir "pessoas" em toda linha empurraria o par rótulo/número além dos
 * ~290px úteis de um card em tela de 360px — o erro que já derrubou três
 * layouts desta tela.
 */
function Funil({
  titulo,
  descricao,
  metade,
}: {
  titulo: string
  descricao: string
  metade: MetadePipeline
}) {
  return (
    <Card className="space-y-3 overflow-hidden">
      <div className="space-y-1">
        <p className="font-ds2-mono text-xs uppercase tracking-[0.08em] text-ds2-amber-soft">{titulo}</p>
        <p className="font-ds2-sans text-xs leading-snug text-ds2-text-muted">{descricao}</p>
      </div>

      {metade.topo === 0 ? (
        <p className="font-ds2-sans text-sm text-ds2-text-muted">Nada aqui ainda.</p>
      ) : (
        <div className="space-y-2.5">
          {metade.degraus.map((degrau) => (
            <div key={degrau.id} className="space-y-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="min-w-0 break-words font-ds2-sans text-sm text-ds2-text-secondary">
                  {degrau.rotulo}
                </span>
                <span className="shrink-0 whitespace-nowrap font-ds2-mono text-[11px] text-ds2-text-muted">
                  {degrau.pct}% · {degrau.n}/{metade.topo}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-ds2-pill bg-white/[0.08]">
                <span
                  className="block h-full bg-ds2-gradient-primary"
                  style={{ width: `${Math.min(100, degrau.pct)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

/**
 * Dropout por fase da Caminhada — o dado que o radar NÃO tem (lá as respostas
 * só são gravadas no fim, então quem abandona na pergunta 1 e na 7 são
 * indistinguíveis). Aqui cada gate fechado fica registrado no checklist do
 * projeto, então dá pra ver onde a jornada trava.
 */
function Fases({ dados }: { dados: DadosLab['fases'] }) {
  return (
    <Card className="space-y-3 overflow-hidden">
      <div className="space-y-1">
        <p className="font-ds2-mono text-xs uppercase tracking-[0.08em] text-ds2-amber-soft">
          onde a Caminhada trava
        </p>
        <p className="font-ds2-sans text-xs leading-snug text-ds2-text-muted">
          Quantos projetos fecharam cada fase — e quantos pararam exatamente ali.
        </p>
      </div>

      {dados.fases.length === 0 ? (
        <p className="font-ds2-sans text-sm text-ds2-text-muted">Nenhum projeto com plano gerado ainda.</p>
      ) : (
        <div className="space-y-2.5">
          {dados.fases.map((fase) => (
            <div key={fase.indice} className="space-y-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="min-w-0 font-ds2-sans text-sm text-ds2-text-secondary">
                  fase {fase.indice}
                  {fase.pararamAqui > 0 && (
                    <span className="ml-1.5 font-ds2-mono text-[10px] text-ds2-magenta">
                      {fase.pararamAqui} parou aqui
                    </span>
                  )}
                </span>
                <span className="shrink-0 whitespace-nowrap font-ds2-mono text-[11px] text-ds2-text-muted">
                  {fase.pct}% · {fase.fecharam}/{fase.elegiveis}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-ds2-pill bg-white/[0.08]">
                <span
                  className="block h-full bg-ds2-gradient-primary"
                  style={{ width: `${Math.min(100, fase.pct)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

function Guias({ guias }: { guias: AberturaGuia[] }) {
  return (
    <Card className="space-y-3 overflow-hidden">
      <div className="space-y-1">
        <p className="flex flex-wrap items-center gap-1.5 font-ds2-mono text-xs uppercase tracking-[0.08em] text-ds2-amber-soft">
          guias mais abertos
          <Badge className="text-[9px]" title="derivado de evento — pode duplicar ou perder">
            evento
          </Badge>
        </p>
        <p className="font-ds2-sans text-xs leading-snug text-ds2-text-muted">
          Aberturas, não pessoas: a mesma pessoa reabrindo o guia conta de novo.
        </p>
      </div>

      {guias.length === 0 ? (
        <p className="font-ds2-sans text-sm text-ds2-text-muted">Nenhum guia aberto ainda.</p>
      ) : (
        <ul className="space-y-1.5">
          {guias.map((guia) => (
            <li key={guia.slug} className="flex items-baseline justify-between gap-2">
              <span className="min-w-0 break-words font-ds2-sans text-sm text-ds2-text-secondary">
                {guia.titulo ?? guia.slug}
              </span>
              <span className="shrink-0 font-ds2-mono text-[11px] text-ds2-text-muted">{guia.n}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

/**
 * Bloco 6 da spec — decisão do LAB. Duas metades separadas de propósito: a
 * primeira conta PESSOAS, a segunda conta PROJETOS. Um funil só, empilhando as
 * duas, passaria de 100% no dia em que alguém criar dois projetos.
 */
export function BlocoLab({ lab }: { lab: DadosLab }) {
  const { progressao } = lab

  return (
    <section className="space-y-3">
      <Eyebrow>pipeline do Lab</Eyebrow>
      <p className="max-w-[640px] font-ds2-sans text-xs text-ds2-text-muted">
        Onde o Lab está travando.{' '}
        <strong className="text-ds2-amber-soft">
          Este bloco ignora a janela: é o acumulado do beta.
        </strong>{' '}
        O beta é por convite e os degraus vivem em tempos diferentes — alguém convidado há 40 dias
        cria conta hoje. Cortado por janela, um degrau ficaria maior que o topo.
      </p>

      <div className="space-y-2.5">
        <Funil
          titulo="pessoas"
          descricao="da lista de interesse até a conta criada · unidade: pessoa"
          metade={lab.pipeline.pessoas}
        />
        <Funil
          titulo="projetos"
          descricao="unidade: projeto — plano gerado é a métrica norte, o momento em que o Lab entrega o que promete"
          metade={lab.pipeline.projetos}
        />

        <Card className="flex flex-wrap items-baseline gap-x-3 gap-y-1 overflow-hidden py-3.5">
          <p className="font-ds2-serif text-[30px] leading-none text-ds2-text-primary">
            {progressao.mediaPct === null ? '—' : `${progressao.mediaPct}%`}
          </p>
          <div className="min-w-0">
            <p className="font-ds2-sans text-sm text-ds2-text-secondary">progressão média do checklist</p>
            <p className="font-ds2-mono text-[10px] text-ds2-text-subtle">
              base: {progressao.base} projetos com plano
            </p>
          </div>
        </Card>

        {/* Status como chips, não como quarto gráfico de barras: o funil acima já
            desenha a progressão: aqui interessa só o corte exclusivo (quantos
            pararam em rascunho), que o funil cumulativo não mostra. */}
        {lab.statusProjetos.total > 0 && (
          <Card className="flex flex-wrap items-center gap-x-3 gap-y-1.5 overflow-hidden py-3.5">
            <span className="font-ds2-mono text-[11px] uppercase tracking-[0.08em] text-ds2-text-muted">
              status
            </span>
            {lab.statusProjetos.itens.map((item) => (
              <span key={item.id} className="font-ds2-sans text-sm text-ds2-text-secondary">
                <strong className="text-ds2-text-primary">{item.n}</strong> {item.rotulo}
              </span>
            ))}
          </Card>
        )}

        <Fases dados={lab.fases} />
        <Guias guias={lab.guias} />
      </div>
    </section>
  )
}
