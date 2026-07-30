'use client'

// =============================================================================
// PERFIL DO BUILDER — FORMULÁRIO (ISSUE-317)
// Form único, tudo opcional, sempre editável. Fluência pré-preenche do radar
// de maturidade (sessionStorage) quando o perfil ainda não tem um nível
// salvo — mesmo dado que o wizard já lê via `lab_profiles.ai_fluency_level`.
// Visual: mesmo vocabulário de chips/cartões do wizard (EtapaPergunta), sem
// puxar a máquina do wizard em si — este form é mais simples de propósito.
// =============================================================================

import * as React from 'react'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ds2'
import { track } from '@/lib/analytics'
import type { AmbienteId } from '@/lib/lab/types'
import type { MaturityLevelId } from '@/lib/radar/types'
import { OPCOES_AREA, OPCOES_FERRAMENTAS, OPCOES_FLUENCIA, OPCOES_SENIORIDADE } from '@/lib/lab/perfil'
import { lerMaturidadeReal } from '@/lib/radar-storage'
import { cn } from '@/lib/utils'

export interface PerfilInicial {
  role_area: string | null
  seniority: string | null
  ai_fluency_level: MaturityLevelId | null
  main_goal: string | null
  biggest_bottleneck: string | null
  tools_used: AmbienteId[] | null
}

type StatusSalvar = 'ocioso' | 'salvando' | 'salvo' | 'erro'

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

function Secao({
  titulo,
  apoio,
  children,
}: {
  titulo: string
  apoio?: string
  children: React.ReactNode
}) {
  return (
    <div className="border-t border-ds2-border-subtle pt-6 first:border-t-0 first:pt-0">
      <p className="font-ds2-mono text-[11px] tracking-[0.08em] text-ds2-text-muted uppercase">
        {titulo}
      </p>
      {apoio && <p className="mt-1 text-xs text-ds2-text-subtle">{apoio}</p>}
      <div className="mt-3">{children}</div>
    </div>
  )
}

export function PerfilForm({ perfilInicial }: { perfilInicial: PerfilInicial | null }) {
  const [roleArea, setRoleArea] = React.useState<string | null>(perfilInicial?.role_area ?? null)
  const [seniority, setSeniority] = React.useState<string | null>(perfilInicial?.seniority ?? null)
  const [fluencia, setFluencia] = React.useState<MaturityLevelId | null>(
    perfilInicial?.ai_fluency_level ?? null,
  )
  const [mainGoal, setMainGoal] = React.useState(perfilInicial?.main_goal ?? '')
  const [gargalo, setGargalo] = React.useState(perfilInicial?.biggest_bottleneck ?? '')
  const [ferramentas, setFerramentas] = React.useState<AmbienteId[]>(
    perfilInicial?.tools_used ?? [],
  )
  const [status, setStatus] = React.useState<StatusSalvar>('ocioso')

  // Sugestão pelo radar de maturidade — só quando o perfil ainda não tem
  // fluência salva (nunca sobrepõe o que a pessoa já escolheu aqui).
  React.useEffect(() => {
    if (perfilInicial?.ai_fluency_level) return
    const real = lerMaturidadeReal()
    if (real) setFluencia(real.nivel)
  }, [perfilInicial?.ai_fluency_level])

  const alternarFerramenta = (id: AmbienteId) =>
    setFerramentas((atual) => (atual.includes(id) ? atual.filter((a) => a !== id) : [...atual, id]))

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setStatus('salvando')
    try {
      const res = await fetch('/api/lab/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role_area: roleArea,
          seniority,
          ai_fluency_level: fluencia,
          main_goal: mainGoal,
          biggest_bottleneck: gargalo,
          tools_used: ferramentas,
          origin: lerMaturidadeReal() ? 'radar' : 'direto',
        }),
      })
      if (!res.ok) throw new Error(String(res.status))
      setStatus('salvo')
      // ISSUE-318: perfil salvo com sucesso — a edição também conta (o funil quer
      // saber "quem preencheu", e o form é sempre editável por design da 317).
      track('lab_profile_completed', { tem_area: roleArea !== null, tem_fluencia: fluencia !== null })
    } catch {
      setStatus('erro')
    }
  }

  return (
    <form onSubmit={salvar} className="space-y-6">
      <Secao titulo="área de atuação">
        <div className="flex flex-wrap gap-2">
          {OPCOES_AREA.map((o) => (
            <ChipOpcao
              key={o.id}
              label={o.label}
              selecionado={roleArea === o.id}
              onEscolher={() => setRoleArea(o.id)}
            />
          ))}
        </div>
      </Secao>

      <Secao titulo="senioridade">
        <div className="flex flex-wrap gap-2">
          {OPCOES_SENIORIDADE.map((o) => (
            <ChipOpcao
              key={o.id}
              label={o.label}
              selecionado={seniority === o.id}
              onEscolher={() => setSeniority(o.id)}
            />
          ))}
        </div>
      </Secao>

      <Secao titulo="fluência em IA">
        <div className="flex flex-wrap gap-2">
          {OPCOES_FLUENCIA.map((o) => (
            <ChipOpcao
              key={o.id}
              label={o.label}
              selecionado={fluencia === o.id}
              onEscolher={() => setFluencia(o.id)}
            />
          ))}
        </div>
      </Secao>

      <Secao titulo="ferramentas que você tem à mão" apoio="Multiescolha — molda os planos futuros.">
        <div className="flex flex-wrap gap-2">
          {OPCOES_FERRAMENTAS.map((o) => (
            <ChipOpcao
              key={o.id}
              label={o.label}
              selecionado={ferramentas.includes(o.id)}
              onEscolher={() => alternarFerramenta(o.id)}
            />
          ))}
        </div>
      </Secao>

      <Secao titulo="teu objetivo" apoio="O que você quer conseguir construindo com IA.">
        <textarea
          value={mainGoal}
          onChange={(e) => setMainGoal(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Ex.: apresentar um caso pronto até o fim do trimestre"
          className="w-full rounded-ds2-card border border-ds2-border-medium bg-transparent px-4 py-3 text-base leading-relaxed text-ds2-text-primary placeholder:text-ds2-text-subtle focus:border-ds2-orange/60 focus:outline-none"
        />
      </Secao>

      <Secao titulo="teu maior gargalo hoje" apoio="A tarefa que mais come teu tempo.">
        <textarea
          value={gargalo}
          onChange={(e) => setGargalo(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Ex.: consolidar a mesma planilha toda semana"
          className="w-full rounded-ds2-card border border-ds2-border-medium bg-transparent px-4 py-3 text-base leading-relaxed text-ds2-text-primary placeholder:text-ds2-text-subtle focus:border-ds2-orange/60 focus:outline-none"
        />
      </Secao>

      <div className="flex items-center gap-4 pt-2">
        <Button type="submit" disabled={status === 'salvando'}>
          {status === 'salvando' && <Loader2 className="h-4 w-4 animate-spin" />}
          Salvar perfil
        </Button>
        {status === 'salvo' && (
          <span className="font-ds2-mono text-xs text-ds2-text-muted">perfil salvo</span>
        )}
        {status === 'erro' && (
          <span className="font-ds2-mono text-xs text-ds2-magenta">
            não salvou — tenta de novo
          </span>
        )}
      </div>
    </form>
  )
}
