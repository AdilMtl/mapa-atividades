'use client'

// =============================================================================
// PÁGINA DO PROJETO — ORQUESTRADOR (ISSUE-314 + 314B)
// "As notas viraram o plano": a folha manuscrita do wizard virou documento de
// trabalho. Dois modos (spec §2):
//   guiado    → só a 1ª visita (redirect do wizard, ?leitura=1): os 5 blocos
//               se revelam em sequência, "avançar" descobre o próximo.
//   documento → todas as visitas seguintes: tudo aberto, sem pedágio.
// A 314B soma a continuidade: etapa atual derivada do checklist (primeira
// pendente — lib/lab/continuidade.ts), beat do consultor após cada marcação,
// marcação direto do bloco Mão na massa (com scroll de volta pro plano) e
// cartão de retomada na revisita ("você parou na etapa N de M").
// Toda a composição de texto (devolutiva, guia, prompt, linha de evolução) já
// vem PRONTA do Server Component (materiais.ts é puro, roda no servidor) —
// este componente só orquestra revelação + persistência do checklist.
// =============================================================================

import * as React from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

import { Button, Card } from '@/components/ds2'
import { beatTransicao, etapaAtual, textoRetomada } from '@/lib/lab/continuidade'
import type { Devolutiva, Guia } from '@/lib/lab/materiais'
import type { LabChecklistItem, LabDiagnosis, LabPlanEtapa } from '@/lib/lab/types'

import { BlocoDevolutiva } from './BlocoDevolutiva'
import { BlocoLeitura } from './BlocoLeitura'
import { BlocoMaoNaMassa } from './BlocoMaoNaMassa'
import { BlocoPlano } from './BlocoPlano'
import { BlocoRotina } from './BlocoRotina'

export interface PaginaProjetoProps {
  id: string
  titulo: string
  status: string
  diagnosis: LabDiagnosis
  etapas: LabPlanEtapa[]
  checklistInicial: LabChecklistItem[]
  devolutiva: Devolutiva
  guia: Guia
  prompt: string
  linhaEvolucao: string | null
  modoInicial: 'guiado' | 'documento'
}

const TOTAL_BLOCOS = 5

function rotuloAvancar(blocoAtual: number): string {
  // Do bloco 3 (Plano, índice 2) pro 4 (Mão na massa): o botão verbaliza a
  // pergunta que a pessoa está fazendo nesse momento (regra de CTA da casa).
  return blocoAtual === 2 ? 'E como eu começo?' : 'Continuar'
}

export function PaginaProjeto({
  id,
  titulo,
  status: statusInicial,
  diagnosis,
  etapas,
  checklistInicial,
  devolutiva,
  guia,
  prompt,
  linhaEvolucao,
  modoInicial,
}: PaginaProjetoProps) {
  const semMovimento = useReducedMotion()
  const guiado = modoInicial === 'guiado'

  const [blocoAtual, setBlocoAtual] = React.useState(guiado ? 0 : TOTAL_BLOCOS - 1)
  const [checklist, setChecklist] = React.useState<LabChecklistItem[]>(checklistInicial)
  const [status, setStatus] = React.useState(statusInicial)
  const [pendentes, setPendentes] = React.useState<Set<string>>(new Set())
  const [concluindo, setConcluindo] = React.useState(false)
  const [erro, setErro] = React.useState<string | null>(null)
  // Beat do consultor após marcar (ISSUE-314B) — limpa ao desmarcar/errar.
  const [beat, setBeat] = React.useState<string | null>(null)
  // Retomada some assim que a pessoa interage — daí em diante o beat guia.
  const [interagiu, setInteragiu] = React.useState(false)

  const mostrarTudo = !guiado || blocoAtual >= TOTAL_BLOCOS - 1
  const podeAvancar = guiado && blocoAtual < TOTAL_BLOCOS - 1

  const atual = etapaAtual(etapas, checklist)
  const retomada =
    !guiado && !interagiu && status !== 'concluido' ? textoRetomada(etapas, checklist) : null

  const irParaEtapa = React.useCallback(
    (etapaId: string | null) => {
      const alvo = etapaId ? `etapa-${etapaId}` : null
      if (!alvo) return
      document
        .getElementById(alvo)
        ?.scrollIntoView({ behavior: semMovimento ? 'auto' : 'smooth', block: 'center' })
    },
    [semMovimento],
  )

  const onToggle = React.useCallback(
    async (itemId: string, done: boolean) => {
      const anterior = checklist
      const proximo = checklist.map((c) => (c.id === itemId ? { ...c, done } : c))
      setErro(null)
      setInteragiu(true)
      setChecklist(proximo)
      setBeat(done ? beatTransicao(etapas, proximo) : null)
      setPendentes((atualSet) => new Set(atualSet).add(itemId))
      try {
        const res = await fetch(`/api/lab/projects/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ checklistItem: { id: itemId, done } }),
        })
        if (!res.ok) throw new Error('falhou')
        const data = (await res.json()) as { status: string }
        setStatus(data.status)
      } catch {
        setChecklist(anterior)
        setBeat(null)
        setErro('Não consegui salvar essa marcação agora — tenta de novo.')
      } finally {
        setPendentes((atualSet) => {
          const proximoSet = new Set(atualSet)
          proximoSet.delete(itemId)
          return proximoSet
        })
      }
    },
    [checklist, etapas, id],
  )

  // Marcar a partir do bloco Mão na massa (ISSUE-314B): mesmo toggle, e a
  // página volta sozinha pra próxima etapa no plano — a navegação que faltava.
  const onMarcarDoCiclo = React.useCallback(
    (itemId: string) => {
      const proximo = checklist.map((c) => (c.id === itemId ? { ...c, done: true } : c))
      const proximaEtapa = etapaAtual(etapas, proximo)
      void onToggle(itemId, true)
      requestAnimationFrame(() => irParaEtapa(proximaEtapa?.id ?? itemId))
    },
    [checklist, etapas, irParaEtapa, onToggle],
  )

  const onConcluir = React.useCallback(async () => {
    setErro(null)
    setConcluindo(true)
    try {
      const res = await fetch(`/api/lab/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concluir: true }),
      })
      if (!res.ok) throw new Error('falhou')
      setStatus('concluido')
      setBeat(null)
    } catch {
      setErro('Não consegui concluir o projeto agora — tenta de novo.')
    } finally {
      setConcluindo(false)
    }
  }, [id])

  const podeConcluir = checklist.length > 0 && checklist.every((c) => c.done)
  const transicao = semMovimento
    ? { duration: 0 }
    : { duration: 0.24, ease: 'easeOut' as const }

  return (
    <div className="space-y-10 pb-16">
      {retomada && atual && (
        <Card className="max-w-3xl space-y-3 border-ds2-orange/25">
          <p className="text-sm leading-relaxed text-ds2-text-secondary">{retomada}</p>
          <Button
            type="button"
            variant="secondary"
            onClick={() => irParaEtapa(atual.id)}
            className="py-2.5 text-xs"
          >
            continuar de onde parei
          </Button>
        </Card>
      )}

      <BlocoDevolutiva devolutiva={devolutiva} titulo={titulo} />

      <AnimatePresence initial={false}>
        {(mostrarTudo || blocoAtual >= 1) && (
          <motion.div
            key="leitura"
            initial={semMovimento ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transicao}
          >
            <BlocoLeitura diagnosis={diagnosis} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {(mostrarTudo || blocoAtual >= 2) && (
          <motion.div
            key="plano"
            initial={semMovimento ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transicao}
          >
            <BlocoPlano
              etapas={etapas}
              checklist={checklist}
              pendentes={pendentes}
              onToggle={onToggle}
              podeConcluir={podeConcluir && status === 'em_construcao'}
              concluindo={concluindo}
              onConcluir={onConcluir}
              jaConcluido={status === 'concluido'}
              etapaAtualId={atual?.id ?? null}
              beat={beat}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {(mostrarTudo || blocoAtual >= 3) && (
          <motion.div
            key="mao-na-massa"
            initial={semMovimento ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transicao}
          >
            <BlocoMaoNaMassa
              guia={guia}
              prompt={prompt}
              etapaAtual={atual}
              onMarcarEtapa={onMarcarDoCiclo}
              marcando={atual ? pendentes.has(atual.id) : false}
              aguardandoConclusao={podeConcluir && status === 'em_construcao'}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {(mostrarTudo || blocoAtual >= 4) && (
          <motion.div
            key="rotina"
            initial={semMovimento ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transicao}
          >
            <BlocoRotina linhaEvolucao={linhaEvolucao} concluido={status === 'concluido'} />
          </motion.div>
        )}
      </AnimatePresence>

      {erro && <p className="max-w-3xl text-sm text-ds2-magenta">{erro}</p>}

      {podeAvancar && (
        <Button onClick={() => setBlocoAtual((b) => Math.min(b + 1, TOTAL_BLOCOS - 1))}>
          {rotuloAvancar(blocoAtual)}
        </Button>
      )}

      {mostrarTudo && (
        <p className="font-ds2-mono text-[11px] tracking-[0.06em] text-ds2-text-subtle">
          classificação: {diagnosis.tipo} · família {diagnosis.familia} · motor{' '}
          {diagnosis.engine_version}
        </p>
      )}
    </div>
  )
}
