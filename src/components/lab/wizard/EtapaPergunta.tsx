'use client'

// =============================================================================
// WIZARD DO LAB — ETAPAS DA CONVERSA (ISSUE-313)
// Renderiza uma etapa do roteiro (wizard-flow) conforme o formato: escala,
// chips, cards, confirmação de hipótese, multiselect, slider e texto.
// Lição Foodvisor da spec (§3.6): o FORMATO varia a serviço do dado — quase
// tudo é 1 toque com auto-avanço; multiselect/slider/texto pedem confirmação.
// Espelho e proposta têm componentes próprios (EtapaEspelho/EtapaProposta).
// =============================================================================

import * as React from 'react'
import {
  Compass,
  LayoutDashboard,
  Lightbulb,
  ListTodo,
  MessageSquareText,
  Sparkles,
  Table2,
  TextCursorInput,
  Timer,
  Workflow,
} from 'lucide-react'

import { Button } from '@/components/ds2'
import { Slider } from '@/components/ui/slider'
import type { EtapaWizard } from '@/lib/lab/wizard-flow'
import {
  AMBIENTES,
  ARQUETIPO_POR_ID,
  ARQUETIPOS,
  cenaParaArea,
  LABEL_OPCAO,
  PORTAS,
  REACAO_SHADOW_SENSIVEL,
} from '@/lib/lab/wizard-flow'
import type { AmbienteId, PortaEntrada } from '@/lib/lab/types'
import { cn } from '@/lib/utils'

import type { Opcao, RespostasParciais } from './dados'
import {
  OPCOES_AREA,
  OPCOES_DADO,
  OPCOES_ENTREGA,
  OPCOES_FLUENCIA,
  OPCOES_FREQUENCIA,
  OPCOES_PUBLICO,
  opcoesBeneficio,
  opcoesCena,
} from './dados'
import { CheckDesenhado, IconePop } from './IconesAnimados'

/** Como avançar: próximo índice, ou mesmo índice (troca de trilha do arq_outro). */
export type Avanco = 'proxima' | 'mesma' | 'ficar'

interface EtapaPerguntaProps {
  etapa: EtapaWizard
  respostas: RespostasParciais
  onResponder: (patch: Partial<RespostasParciais>, avanco: Avanco) => void
}

const ICONE_PORTA: Record<PortaEntrada, React.ReactNode> = {
  ideia: <Lightbulb className="h-5 w-5" />,
  dor: <Timer className="h-5 w-5" />,
  difusa: <Compass className="h-5 w-5" />,
}

const ICONE_ARQUETIPO: Record<string, React.ReactNode> = {
  arq_painel: <LayoutDashboard className="h-5 w-5" />,
  arq_organizador: <ListTodo className="h-5 w-5" />,
  arq_input: <TextCursorInput className="h-5 w-5" />,
  arq_consolidador: <Table2 className="h-5 w-5" />,
  arq_assistente: <MessageSquareText className="h-5 w-5" />,
  arq_automatizador: <Workflow className="h-5 w-5" />,
  arq_outro: <Sparkles className="h-5 w-5" />,
}

// ----------------------------------------------------------------------------
// Átomos
// ----------------------------------------------------------------------------

/** Card de opção — 1 toque, alvo ≥44px, seleção visível antes do avanço. */
function CartaoOpcao({
  label,
  detalhe,
  icone,
  selecionado,
  onEscolher,
}: {
  label: string
  detalhe?: string
  icone?: React.ReactNode
  selecionado: boolean
  onEscolher: () => void
}) {
  return (
    <button
      type="button"
      onClick={onEscolher}
      aria-pressed={selecionado}
      className={cn(
        'flex min-h-11 w-full items-center gap-3 rounded-ds2-card border px-4 py-3 text-left transition-colors',
        selecionado
          ? 'border-ds2-orange/50 bg-[rgba(217,119,6,0.12)] text-ds2-text-primary'
          : 'border-ds2-border-subtle bg-ds2-surface-glass text-ds2-text-secondary hover:bg-ds2-surface-glass-hover',
      )}
    >
      {icone && (
        <IconePop
          selecionado={selecionado}
          className={cn('shrink-0', selecionado ? 'text-ds2-orange' : 'text-ds2-text-muted')}
        >
          {icone}
        </IconePop>
      )}
      <span className="flex-1">
        <span className="block text-sm font-medium">{label}</span>
        {detalhe && <span className="mt-0.5 block text-xs text-ds2-text-muted">{detalhe}</span>}
      </span>
      {selecionado && <CheckDesenhado className="shrink-0 text-ds2-orange" />}
    </button>
  )
}

/** Chip (grid de área / arsenal) — pill compacta, ainda ≥44px de alvo. */
function ChipOpcao({
  label,
  selecionado,
  onEscolher,
}: {
  label: string
  selecionado: boolean
  onEscolher: () => void
}) {
  return (
    <button
      type="button"
      onClick={onEscolher}
      aria-pressed={selecionado}
      className={cn(
        'min-h-11 rounded-ds2-pill border px-4 py-2 text-sm transition-colors',
        selecionado
          ? 'border-ds2-orange/50 bg-[rgba(217,119,6,0.12)] text-ds2-text-primary'
          : 'border-ds2-border-subtle bg-ds2-surface-glass text-ds2-text-secondary hover:bg-ds2-surface-glass-hover',
      )}
    >
      {label}
    </button>
  )
}

/** Hook do auto-avanço: mostra a seleção por um instante e segue (1 toque). */
function useEscolherESeguir(
  onResponder: EtapaPerguntaProps['onResponder'],
): (patch: Partial<RespostasParciais>, avanco?: Avanco) => void {
  const disparado = React.useRef(false)
  React.useEffect(() => {
    disparado.current = false
  })
  return React.useCallback(
    (patch, avanco = 'proxima') => {
      if (disparado.current) return
      disparado.current = true
      onResponder(patch, 'ficar')
      window.setTimeout(() => onResponder(patch, avanco), 220)
    },
    [onResponder],
  )
}

// ----------------------------------------------------------------------------
// Formatos
// ----------------------------------------------------------------------------

function EscalaFluencia({ respostas, onResponder }: Omit<EtapaPerguntaProps, 'etapa'>) {
  const escolher = useEscolherESeguir(onResponder)
  return (
    <div className="flex flex-col gap-2">
      {OPCOES_FLUENCIA.map((opcao, idx) => {
        const selecionado = respostas.conforto === opcao.id
        return (
          <button
            key={opcao.id}
            type="button"
            onClick={() => escolher({ conforto: opcao.id })}
            aria-pressed={selecionado}
            className={cn(
              'flex min-h-11 w-full items-center gap-3 rounded-ds2-card border px-4 py-3 text-left transition-colors',
              selecionado
                ? 'border-ds2-orange/50 bg-[rgba(217,119,6,0.12)] text-ds2-text-primary'
                : 'border-ds2-border-subtle bg-ds2-surface-glass text-ds2-text-secondary hover:bg-ds2-surface-glass-hover',
            )}
          >
            {/* Escala visual: 5 barras, preenchidas até a posição da opção. */}
            <span className="flex shrink-0 items-end gap-[3px]" aria-hidden>
              {[0, 1, 2, 3, 4].map((n) => (
                <span
                  key={n}
                  className={cn(
                    'w-[4px] rounded-full transition-colors',
                    n <= idx
                      ? selecionado
                        ? 'bg-ds2-orange'
                        : 'bg-ds2-amber-soft/70'
                      : 'bg-white/15',
                  )}
                  style={{ height: `${8 + n * 3}px` }}
                />
              ))}
            </span>
            <span className="text-sm">{opcao.label}</span>
            {selecionado && <CheckDesenhado className="ml-auto shrink-0 text-ds2-orange" />}
          </button>
        )
      })}
    </div>
  )
}

function ChipsArea({ respostas, onResponder }: Omit<EtapaPerguntaProps, 'etapa'>) {
  const escolher = useEscolherESeguir(onResponder)
  return (
    <div className="flex flex-wrap gap-2">
      {OPCOES_AREA.map((opcao) => (
        <ChipOpcao
          key={opcao.id}
          label={opcao.label}
          selecionado={respostas.area === opcao.id}
          onEscolher={() => escolher({ area: opcao.id })}
        />
      ))}
    </div>
  )
}

function CardsPorta({ respostas, onResponder }: Omit<EtapaPerguntaProps, 'etapa'>) {
  const escolher = useEscolherESeguir(onResponder)
  return (
    <div className="flex flex-col gap-2.5">
      {PORTAS.map((porta) => (
        <CartaoOpcao
          key={porta.id}
          label={porta.label}
          icone={ICONE_PORTA[porta.id]}
          selecionado={respostas.porta === porta.id}
          onEscolher={() =>
            // Trocar de porta zera o arquétipo — senão um `arq_outro` antigo
            // seguiria desviando a trilha e a pergunta 2.I1 nunca voltaria.
            escolher(
              respostas.porta && respostas.porta !== porta.id
                ? { porta: porta.id, arquetipo: undefined, arquetipo_outro: undefined }
                : { porta: porta.id },
            )
          }
        />
      ))}
    </div>
  )
}

function CardsArquetipo({ respostas, onResponder }: Omit<EtapaPerguntaProps, 'etapa'>) {
  const escolher = useEscolherESeguir(onResponder)
  const [outroAberto, setOutroAberto] = React.useState(respostas.arquetipo === 'arq_outro')
  const [outroTexto, setOutroTexto] = React.useState(respostas.arquetipo_outro ?? '')

  return (
    <div className="flex flex-col gap-2.5">
      {ARQUETIPOS.map((arq) =>
        arq.id === 'arq_outro' ? (
          <React.Fragment key={arq.id}>
            <CartaoOpcao
              label={arq.label}
              icone={ICONE_ARQUETIPO[arq.id]}
              selecionado={outroAberto}
              onEscolher={() => setOutroAberto((v) => !v)}
            />
            {outroAberto && (
              <div className="flex flex-col gap-2 rounded-ds2-card border border-ds2-border-subtle bg-ds2-surface-glass p-4">
                <input
                  type="text"
                  value={outroTexto}
                  onChange={(e) => setOutroTexto(e.target.value)}
                  maxLength={200}
                  placeholder="Em uma frase: o que você tem em mente?"
                  className="min-h-11 w-full rounded-[14px] border border-ds2-border-medium bg-transparent px-3 py-2 text-base text-ds2-text-primary placeholder:text-ds2-text-subtle focus:border-ds2-orange/60 focus:outline-none"
                />
                <p className="text-xs text-ds2-text-muted">
                  Guardo do teu jeito e sigo te perguntando pela tarefa por trás — é ela que
                  classifica, não o texto.
                </p>
                <Button
                  variant="secondary"
                  className="self-start px-4 py-2 text-sm"
                  disabled={outroTexto.trim().length === 0}
                  onClick={() =>
                    // arq_outro troca a trilha pro caminho DOR no MESMO índice.
                    escolher(
                      { arquetipo: 'arq_outro', arquetipo_outro: outroTexto.trim() },
                      'mesma',
                    )
                  }
                >
                  Seguir com isso
                </Button>
              </div>
            )}
          </React.Fragment>
        ) : (
          <CartaoOpcao
            key={arq.id}
            label={arq.label}
            icone={ICONE_ARQUETIPO[arq.id]}
            selecionado={respostas.arquetipo === arq.id}
            onEscolher={() =>
              escolher({ arquetipo: arq.id as never, arquetipo_outro: undefined })
            }
          />
        ),
      )}
    </div>
  )
}

/** Cards genéricos de opção fechada (cena, entrega, benefício, frequência…). */
function CardsOpcoes({
  opcoes,
  campo,
  respostas,
  onResponder,
}: Omit<EtapaPerguntaProps, 'etapa'> & { opcoes: Opcao[]; campo: keyof RespostasParciais }) {
  const escolher = useEscolherESeguir(onResponder)
  return (
    <div className="flex flex-col gap-2">
      {opcoes.map((opcao) => (
        <CartaoOpcao
          key={opcao.id}
          label={opcao.label}
          detalhe={opcao.detalhe}
          selecionado={respostas[campo] === opcao.id}
          onEscolher={() => escolher({ [campo]: opcao.id })}
        />
      ))}
    </div>
  )
}

/** 2.I3 — hipótese do arquétipo pré-marcada: 1 toque confirma, 1 toque corrige. */
function ConfirmacaoRotina({ respostas, onResponder }: Omit<EtapaPerguntaProps, 'etapa'>) {
  const escolher = useEscolherESeguir(onResponder)
  const hipoteses = respostas.arquetipo
    ? ARQUETIPO_POR_ID[respostas.arquetipo]?.hipoteses
    : null
  const [ajustando, setAjustando] = React.useState(false)
  const [perda, setPerda] = React.useState(respostas.perda ?? hipoteses?.perda ?? '')
  const [entrega, setEntrega] = React.useState(respostas.entrega ?? hipoteses?.entrega ?? '')

  if (!hipoteses) return null
  const cena = cenaParaArea(respostas.area ?? null, hipoteses.perda)

  if (!ajustando) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-ds2-card border border-ds2-border-subtle bg-[rgba(46,104,96,0.13)] p-4">
          <p className="text-sm leading-relaxed text-ds2-text-secondary">
            Teu dia tem bastante{' '}
            <strong className="text-ds2-text-primary">“{cena.toLowerCase()}”</strong> pra
            entregar{' '}
            <strong className="text-ds2-text-primary">
              {LABEL_OPCAO[hipoteses.entrega].toLowerCase()}
            </strong>
            .
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Button
            onClick={() =>
              escolher({
                entrega: hipoteses.entrega,
                perda: hipoteses.perda,
                hipoteses_confirmadas: ['entrega', 'perda'],
              })
            }
          >
            É isso
          </Button>
          <Button variant="secondary" onClick={() => setAjustando(true)}>
            Não é bem isso
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-2 font-ds2-mono text-[11px] tracking-[0.13em] text-ds2-amber-soft uppercase">
          a cena que mais parece a tua
        </p>
        <div className="flex flex-col gap-2">
          {opcoesCena(respostas.area ?? null).map((o) => (
            <CartaoOpcao
              key={o.id}
              label={o.label}
              selecionado={perda === o.id}
              onEscolher={() => setPerda(o.id)}
            />
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 font-ds2-mono text-[11px] tracking-[0.13em] text-ds2-amber-soft uppercase">
          e o que ela produz no final
        </p>
        <div className="flex flex-wrap gap-2">
          {OPCOES_ENTREGA.map((o) => (
            <ChipOpcao
              key={o.id}
              label={o.label}
              selecionado={entrega === o.id}
              onEscolher={() => setEntrega(o.id)}
            />
          ))}
        </div>
      </div>
      <Button
        className="self-start"
        disabled={!perda || !entrega}
        onClick={() => escolher({ perda, entrega, hipoteses_confirmadas: [] })}
      >
        Agora sim
      </Button>
    </div>
  )
}

/** 3.3 — arsenal (multiselect) + reação de diligência ativa (spec §3.9). */
function MultiselectArsenal({ respostas, onResponder }: Omit<EtapaPerguntaProps, 'etapa'>) {
  const [selecao, setSelecao] = React.useState<AmbienteId[]>(respostas.ambiente ?? [])
  const alternar = (id: AmbienteId) =>
    setSelecao((atual) =>
      atual.includes(id) ? atual.filter((a) => a !== id) : [...atual, id],
    )
  const reagirShadow = selecao.includes('amb_shadow') && respostas.dado === 'dado_sensiveis'

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {AMBIENTES.map((amb) => (
          <ChipOpcao
            key={amb.id}
            label={amb.label}
            selecionado={selecao.includes(amb.id)}
            onEscolher={() => alternar(amb.id)}
          />
        ))}
      </div>
      {reagirShadow && (
        <p className="rounded-ds2-card border border-ds2-orange/25 bg-[rgba(217,119,6,0.08)] p-3 text-sm text-ds2-amber-soft">
          {REACAO_SHADOW_SENSIVEL}
        </p>
      )}
      <div className="flex items-center gap-4">
        <Button onClick={() => onResponder({ ambiente: selecao }, 'proxima')}>
          É isso que tenho
        </Button>
        {selecao.length === 0 && (
          <span className="text-xs text-ds2-text-muted">
            Nada marcado = sigo pelo básico que todo mundo alcança.
          </span>
        )}
      </div>
    </div>
  )
}

/** 2.x5 — slider de horas/semana (cor quantificadora da manchete). */
function SliderHoras({ respostas, onResponder }: Omit<EtapaPerguntaProps, 'etapa'>) {
  const [horas, setHoras] = React.useState<number>(respostas.horas_semana ?? 3)
  const rotulo =
    horas === 0 ? 'quase nada' : horas >= 10 ? '10h+ por semana' : `~${horas}h por semana`

  return (
    <div className="flex flex-col gap-5">
      <p className="font-ds2-serif text-3xl font-medium text-ds2-text-primary">{rotulo}</p>
      <Slider
        value={[horas]}
        onValueChange={([v]) => setHoras(v)}
        min={0}
        max={10}
        step={1}
        aria-label="Horas por semana"
        className="[&_[data-slot=slider-range]]:bg-ds2-gradient-primary [&_[data-slot=slider-thumb]]:border-ds2-orange [&_[data-slot=slider-thumb]]:bg-ds2-text-primary [&_[data-slot=slider-thumb]]:size-6 [&_[data-slot=slider-track]]:h-2.5 [&_[data-slot=slider-track]]:bg-white/[0.11]"
      />
      <div className="flex items-center gap-4">
        <Button onClick={() => onResponder({ horas_semana: horas }, 'proxima')}>
          Por aí mesmo
        </Button>
        <button
          type="button"
          onClick={() => onResponder({ horas_semana: undefined }, 'proxima')}
          className="min-h-11 font-ds2-mono text-xs text-ds2-text-muted transition-colors hover:text-ds2-text-secondary"
        >
          prefiro não chutar →
        </button>
      </div>
    </div>
  )
}

/** 4.2 — relato livre OPCIONAL (cor, jamais classificação — regra da 1A). */
function TextoRelato({ respostas, onResponder }: Omit<EtapaPerguntaProps, 'etapa'>) {
  const [texto, setTexto] = React.useState(respostas.relato ?? '')
  return (
    <div className="flex flex-col gap-4">
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        maxLength={2000}
        rows={4}
        placeholder="Do teu jeito: o que te consome, como é hoje, o que você queria que fosse…"
        className="w-full rounded-ds2-card border border-ds2-border-medium bg-transparent px-4 py-3 text-base leading-relaxed text-ds2-text-primary placeholder:text-ds2-text-subtle focus:border-ds2-orange/60 focus:outline-none"
      />
      <div className="flex items-center gap-4">
        <Button
          disabled={texto.trim().length === 0}
          onClick={() => onResponder({ relato: texto.trim() }, 'proxima')}
        >
          Guardar do meu jeito
        </Button>
        <button
          type="button"
          onClick={() => onResponder({ relato: undefined }, 'proxima')}
          className="min-h-11 font-ds2-mono text-xs text-ds2-text-muted transition-colors hover:text-ds2-text-secondary"
        >
          pular →
        </button>
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------------
// Dispatcher
// ----------------------------------------------------------------------------

export function EtapaPergunta({ etapa, respostas, onResponder }: EtapaPerguntaProps) {
  const comum = { respostas, onResponder }

  switch (etapa.id) {
    case 'fluencia':
      return <EscalaFluencia {...comum} />
    case 'area':
      return <ChipsArea {...comum} />
    case 'porta':
      return <CardsPorta {...comum} />
    case 'arquetipo':
      return <CardsArquetipo {...comum} />
    case 'beneficio':
      return (
        <CardsOpcoes {...comum} campo="desejo" opcoes={opcoesBeneficio(respostas.arquetipo)} />
      )
    case 'confirmacao_rotina':
      return <ConfirmacaoRotina {...comum} />
    case 'cena':
      return <CardsOpcoes {...comum} campo="perda" opcoes={opcoesCena(respostas.area ?? null)} />
    case 'entrega':
      return <CardsOpcoes {...comum} campo="entrega" opcoes={OPCOES_ENTREGA} />
    case 'frequencia':
      return <CardsOpcoes {...comum} campo="frequencia" opcoes={OPCOES_FREQUENCIA} />
    case 'horas':
      return <SliderHoras {...comum} />
    case 'dado':
      return <CardsOpcoes {...comum} campo="dado" opcoes={OPCOES_DADO} />
    case 'publico':
      return <CardsOpcoes {...comum} campo="publico" opcoes={OPCOES_PUBLICO} />
    case 'arsenal':
      return <MultiselectArsenal {...comum} />
    case 'relato':
      return <TextoRelato {...comum} />
    default:
      return null
  }
}
