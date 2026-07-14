import { describe, expect, it } from 'vitest'

import type { SolutionTypeId } from '../radar/types'
import {
  montarTrilha,
  NOME_TIPO,
  ORDEM_TRILHA,
  type EstadoNo,
  type TrilhaProjectRow,
} from './trilha'

// Fabrica uma linha de lab_projects só com o que o motor lê (tipo + status).
function proj(tipo: SolutionTypeId | null, status: string): TrilhaProjectRow {
  return {
    id: `${tipo ?? 'rascunho'}-${status}`,
    status,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    diagnosis: tipo ? ({ tipo } as any) : null,
  }
}

/** Mapa tipo → estado, pra asserções legíveis. */
function estados(rows: TrilhaProjectRow[]): Record<SolutionTypeId, EstadoNo> {
  const view = montarTrilha(rows)
  return Object.fromEntries(view.nos.map((n) => [n.tipo, n.estado])) as Record<
    SolutionTypeId,
    EstadoNo
  >
}

describe('montarTrilha', () => {
  it('trilha vazia: só o primeiro degrau (prompt) fica ao alcance; o resto é horizonte', () => {
    const view = montarTrilha([])
    const e = estados([])
    expect(e.prompt).toBe('ao_alcance')
    expect(e.template).toBe('horizonte')
    expect(e.agentico).toBe('horizonte')
    expect(view.conquistados).toBe(0)
    expect(view.total).toBe(9)
    expect(view.nos).toHaveLength(9)
  })

  it('projeto concluído: o nó vira conquistado e ganha ramo de valor', () => {
    const view = montarTrilha([proj('workflow', 'concluido')])
    const workflow = view.nos.find((n) => n.tipo === 'workflow')!
    expect(workflow.estado).toBe('conquistado')
    expect(workflow.temRamoValor).toBe(true)
    expect(view.conquistados).toBe(1)
  })

  it('conclusão abre só o próximo degrau; o horizonte distante segue fosco', () => {
    // Concluiu workflow (índice 2). Prompt/template (abaixo) e automação (o
    // próximo) ficam ao alcance; dashboard pra frente segue horizonte.
    const e = estados([proj('workflow', 'concluido')])
    expect(e.workflow).toBe('conquistado')
    expect(e.prompt).toBe('ao_alcance')
    expect(e.template).toBe('ao_alcance')
    expect(e.automacao).toBe('ao_alcance')
    expect(e.dashboard).toBe('horizonte')
    expect(e.agentico).toBe('horizonte')
  })

  it('anti-spoiler: quem só fez prompt NÃO vê o agente (fica no horizonte)', () => {
    const e = estados([proj('prompt', 'concluido')])
    expect(e.prompt).toBe('conquistado')
    expect(e.template).toBe('ao_alcance') // só o degrau seguinte
    expect(e.workflow).toBe('horizonte')
    expect(e.agentico).toBe('horizonte')
  })

  it('projeto em andamento (com diagnóstico, não concluído) vira em_construcao, sem ramo', () => {
    const view = montarTrilha([proj('dashboard', 'em_construcao')])
    const dashboard = view.nos.find((n) => n.tipo === 'dashboard')!
    expect(dashboard.estado).toBe('em_construcao')
    expect(dashboard.temRamoValor).toBe(false)
    expect(view.conquistados).toBe(0) // em construção não conta no progresso
  })

  it('concluído tem prioridade sobre em construção para o mesmo tipo', () => {
    const e = estados([proj('template', 'em_construcao'), proj('template', 'concluido')])
    expect(e.template).toBe('conquistado')
  })

  it('rascunho (sem diagnóstico) não posiciona nada na trilha', () => {
    const view = montarTrilha([proj(null, 'rascunho')])
    expect(view.conquistados).toBe(0)
    expect(view.nos.every((n) => n.estado === 'ao_alcance' || n.estado === 'horizonte')).toBe(true)
  })

  it('cada nó carrega nome, slug e complexidade coerentes', () => {
    const view = montarTrilha([])
    for (const no of view.nos) {
      expect(no.nome).toBe(NOME_TIPO[no.tipo])
      expect(no.slug.length).toBeGreaterThan(0)
      expect(no.complexidade).toBeGreaterThanOrEqual(1)
      expect(no.complexidade).toBeLessThanOrEqual(5)
    }
    expect(view.nos.map((n) => n.tipo)).toEqual(ORDEM_TRILHA)
  })
})
