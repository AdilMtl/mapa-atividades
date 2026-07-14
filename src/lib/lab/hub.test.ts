// =============================================================================
// LAB — TESTES DO HUB (ISSUE-315)
// Os 4 estados do topo, os 4 tiers de headline, meta com/sem tempo (plano
// pré-314C), nome ausente/presente, e o roteamento por status.
// =============================================================================

import { describe, expect, it } from 'vitest'

import {
  badgeStatus,
  metaLinha,
  montarHub,
  montarTopo,
  primeiroNome,
  resumirProjeto,
  saudacaoTudoConcluido,
  saudacaoVazia,
  tierHeadline,
  type LabProjectRow,
} from './hub'
import type { LabChecklistItem, LabPlan, LabPlanEtapa } from './types'

const ETAPAS: LabPlanEtapa[] = [
  { id: 'e1', titulo: 'Descreva a tarefa', descricao: 'd1', duracao_min: 10 },
  { id: 'e2', titulo: 'Estruture o prompt', descricao: 'd2', duracao_min: 20 },
  { id: 'e3', titulo: 'Teste na tarefa real', descricao: 'd3', duracao_min: 15 },
  { id: 'e4', titulo: 'Ajuste com o feedback', descricao: 'd4', duracao_min: 15 },
]

function checklistDe(etapas: LabPlanEtapa[], done: Record<string, boolean>): LabChecklistItem[] {
  return etapas.map((e) => ({ id: e.id, label: e.titulo, done: done[e.id] ?? false }))
}

function plano(done: Record<string, boolean>, etapas = ETAPAS): LabPlan {
  return {
    resumo: 'resumo',
    etapas,
    checklist: checklistDe(etapas, done),
    artefato_sugerido: 'artefato',
    materiais_slugs: [],
    generator_version: 'v1',
    duracao_total_min: etapas.reduce((s, e) => s + (e.duracao_min ?? 0), 0),
  }
}

function row(overrides: Partial<LabProjectRow>): LabProjectRow {
  return { id: 'p1', title: 'Painel de vendas semanal', status: 'planejado', plan: null, ...overrides }
}

describe('resumirProjeto', () => {
  it('rascunho: sem plano, sem progresso, href de retomada com ?id=', () => {
    const r = resumirProjeto(row({ status: 'rascunho', plan: null }))
    expect(r.total).toBe(0)
    expect(r.feitas).toBe(0)
    expect(r.faseAtual).toBeNull()
    expect(r.minutosRestantes).toBeNull()
    expect(r.href).toBe('/lab/novo-projeto?id=p1')
    expect(r.emAndamento).toBe(true)
  })

  it('planejado: 0 feitas, fase atual 1, minutos = total', () => {
    const r = resumirProjeto(row({ status: 'planejado', plan: plano({}) }))
    expect(r.feitas).toBe(0)
    expect(r.total).toBe(4)
    expect(r.faseAtual).toBe(1)
    expect(r.minutosRestantes).toBe(60)
    expect(r.duracaoTotalMin).toBe(60)
    expect(r.href).toBe('/lab/projeto/p1')
  })

  it('em_construcao: progresso parcial', () => {
    const r = resumirProjeto(row({ status: 'em_construcao', plan: plano({ e1: true, e2: true }) }))
    expect(r.feitas).toBe(2)
    expect(r.faseAtual).toBe(3)
    expect(r.minutosRestantes).toBe(30)
    expect(r.emAndamento).toBe(true)
  })

  it('concluido: tudo feito, faseAtual null, minutosRestantes null, não emAndamento', () => {
    const r = resumirProjeto(
      row({ status: 'concluido', plan: plano({ e1: true, e2: true, e3: true, e4: true }) }),
    )
    expect(r.feitas).toBe(4)
    expect(r.faseAtual).toBeNull()
    expect(r.minutosRestantes).toBeNull()
    expect(r.emAndamento).toBe(false)
  })

  it('plano pré-314C (sem duracao_min): minutosRestantes e duracaoTotalMin null', () => {
    const etapasSemTempo: LabPlanEtapa[] = [
      { id: 'a', titulo: 'A', descricao: 'x' },
      { id: 'b', titulo: 'B', descricao: 'y' },
    ]
    const planoSemTempo: LabPlan = {
      resumo: 'r',
      etapas: etapasSemTempo,
      checklist: [
        { id: 'a', label: 'A', done: false },
        { id: 'b', label: 'B', done: false },
      ],
      artefato_sugerido: 'x',
      materiais_slugs: [],
      generator_version: 'v0',
    }
    const r = resumirProjeto(row({ status: 'planejado', plan: planoSemTempo }))
    expect(r.minutosRestantes).toBeNull()
    expect(r.duracaoTotalMin).toBeNull()
  })
})

describe('montarHub — os 4 estados', () => {
  it('sem projetos → vazio', () => {
    expect(montarHub([]).estado).toBe('vazio')
  })

  it('só concluídos → tudo_concluido, sem destaque', () => {
    const h = montarHub([
      row({ id: 'a', status: 'concluido', plan: plano({ e1: true, e2: true, e3: true, e4: true }) }),
    ])
    expect(h.estado).toBe('tudo_concluido')
    expect(h.destaque).toBeNull()
  })

  it('rascunho é o mais recente em andamento → retomar_rascunho', () => {
    const h = montarHub([row({ id: 'a', status: 'rascunho', plan: null })])
    expect(h.estado).toBe('retomar_rascunho')
    expect(h.destaque?.id).toBe('a')
  })

  it('planejado/em_construcao mais recente → em_andamento', () => {
    const h = montarHub([row({ id: 'a', status: 'em_construcao', plan: plano({ e1: true }) })])
    expect(h.estado).toBe('em_andamento')
    expect(h.destaque?.id).toBe('a')
  })

  it('destaque é o primeiro em-andamento na ordem recebida (mais recente primeiro)', () => {
    const h = montarHub([
      row({ id: 'concluido-recente', status: 'concluido', plan: plano({ e1: true, e2: true, e3: true, e4: true }) }),
      row({ id: 'em-construcao-antigo', status: 'em_construcao', plan: plano({ e1: true }) }),
    ])
    expect(h.destaque?.id).toBe('em-construcao-antigo')
    expect(h.estado).toBe('em_andamento')
  })
})

describe('tierHeadline', () => {
  it('planejado → tier planejado, mesmo sem nenhuma feita', () => {
    const r = resumirProjeto(row({ status: 'planejado', plan: plano({}) }))
    expect(tierHeadline(r)).toBe('planejado')
  })

  it('em_construcao com ratio < 0.5 → comecando', () => {
    const r = resumirProjeto(row({ status: 'em_construcao', plan: plano({ e1: true }) }))
    expect(tierHeadline(r)).toBe('comecando')
  })

  it('em_construcao com ratio >= 0.5 → quase', () => {
    const r = resumirProjeto(row({ status: 'em_construcao', plan: plano({ e1: true, e2: true }) }))
    expect(tierHeadline(r)).toBe('quase')
  })

  it('em_construcao com tudo feito → fechou_fases', () => {
    const r = resumirProjeto(
      row({ status: 'em_construcao', plan: plano({ e1: true, e2: true, e3: true, e4: true }) }),
    )
    expect(tierHeadline(r)).toBe('fechou_fases')
  })

  it('em_construcao reaberto de volta a 0 feitas → comecando, não planejado', () => {
    const r = resumirProjeto(row({ status: 'em_construcao', plan: plano({}) }))
    expect(tierHeadline(r)).toBe('comecando')
  })
})

describe('montarTopo', () => {
  it('rascunho: sem meta de progresso, CTA de terminar diagnóstico', () => {
    const r = resumirProjeto(row({ status: 'rascunho', plan: null }))
    const topo = montarTopo(r, 'Adilson')
    expect(topo.eyebrow).toBe('VOCÊ COMEÇOU E PAROU')
    expect(topo.headline).toBe('Teu diagnóstico ficou pela metade, Adilson.')
    expect(topo.metaProgresso).toBeNull()
    expect(topo.ctaLabel).toBe('Terminar o diagnóstico →')
  })

  it('planejado: headline de plano pronto, meta com tempo total', () => {
    const r = resumirProjeto(row({ status: 'planejado', plan: plano({}) }))
    const topo = montarTopo(r, 'Adilson')
    expect(topo.headline).toBe('Teu plano tá pronto, Adilson — agora é tirar do papel.')
    expect(topo.metaProgresso).toBe('0 de 4 fases feitas · faltam ~1h')
    expect(topo.ctaLabel).toBe('Começar a construir →')
  })

  it('em_construcao no meio: menciona fase atual e tempo restante', () => {
    const r = resumirProjeto(row({ status: 'em_construcao', plan: plano({ e1: true }) }))
    const topo = montarTopo(r, null)
    expect(topo.headline).toBe('Você já começou. Bora seguir de onde parou.')
    expect(topo.subtexto).toContain('parou na fase 2 de 4')
    expect(topo.subtexto).toContain('~50min')
    expect(topo.metaProgresso).toBe('1 de 4 fases feitas · faltam ~50min')
    expect(topo.ctaLabel).toBe('Voltar pro projeto →')
  })

  it('tudo marcado (falta concluir): CTA de concluir, sem "fase X de Y"', () => {
    const r = resumirProjeto(
      row({ status: 'em_construcao', plan: plano({ e1: true, e2: true, e3: true, e4: true }) }),
    )
    const topo = montarTopo(r, 'Adilson')
    expect(topo.headline).toBe('Você fechou todas as fases, Adilson — falta só concluir.')
    expect(topo.ctaLabel).toBe('Concluir o projeto →')
    expect(topo.metaProgresso).toBe('4 de 4 fases feitas')
  })

  it('sem nome: sufixo some de toda a copy', () => {
    const r = resumirProjeto(row({ status: 'planejado', plan: plano({}) }))
    const topo = montarTopo(r, null)
    expect(topo.headline).toBe('Teu plano tá pronto — agora é tirar do papel.')
  })

  it('plano pré-314C: some o tempo, mantém progresso', () => {
    const etapasSemTempo: LabPlanEtapa[] = [
      { id: 'a', titulo: 'A', descricao: 'x' },
      { id: 'b', titulo: 'B', descricao: 'y' },
    ]
    const p: LabPlan = {
      resumo: 'r',
      etapas: etapasSemTempo,
      checklist: [
        { id: 'a', label: 'A', done: true },
        { id: 'b', label: 'B', done: false },
      ],
      artefato_sugerido: 'x',
      materiais_slugs: [],
      generator_version: 'v0',
    }
    const r = resumirProjeto(row({ status: 'em_construcao', plan: p }))
    const topo = montarTopo(r, null)
    expect(topo.subtexto).not.toContain('~')
    expect(topo.subtexto).toContain('segue construindo')
    expect(topo.metaProgresso).toBe('1 de 2 fases feitas')
  })
})

describe('badgeStatus / metaLinha', () => {
  it('mapeia os 4 status conhecidos', () => {
    expect(badgeStatus('rascunho')).toBe('em rascunho')
    expect(badgeStatus('planejado')).toBe('plano pronto')
    expect(badgeStatus('em_construcao')).toBe('construindo')
    expect(badgeStatus('concluido')).toBe('concluído')
  })

  it('metaLinha planejado com tempo total', () => {
    const r = resumirProjeto(row({ status: 'planejado', plan: plano({}) }))
    expect(metaLinha(r)).toBe('4 fases · ~1h de foco')
  })

  it('metaLinha em_construcao com tempo restante', () => {
    const r = resumirProjeto(row({ status: 'em_construcao', plan: plano({ e1: true }) }))
    expect(metaLinha(r)).toBe('1/4 fases · faltam ~50min')
  })

  it('metaLinha concluido', () => {
    const r = resumirProjeto(
      row({ status: 'concluido', plan: plano({ e1: true, e2: true, e3: true, e4: true }) }),
    )
    expect(metaLinha(r)).toBe('concluído')
  })

  it('metaLinha rascunho', () => {
    const r = resumirProjeto(row({ status: 'rascunho', plan: null }))
    expect(metaLinha(r)).toBe('diagnóstico pela metade · retomar')
  })
})

describe('primeiroNome', () => {
  it('usuário nulo → null', () => {
    expect(primeiroNome(null)).toBeNull()
  })

  it('usa full_name do metadata, primeiro nome, capitalizado', () => {
    expect(primeiroNome({ user_metadata: { full_name: 'adilson matioli' }, email: null })).toBe(
      'Adilson',
    )
  })

  it('sem metadata, usa a parte local do e-mail', () => {
    expect(primeiroNome({ user_metadata: {}, email: 'adilson.matioli@gmail.com' })).toBe(
      'Adilson',
    )
  })

  it('parte local com dígitos não parece nome → null', () => {
    expect(primeiroNome({ user_metadata: {}, email: 'user123@empresa.com' })).toBeNull()
  })

  it('nada disponível → null', () => {
    expect(primeiroNome({ user_metadata: {}, email: null })).toBeNull()
  })
})

describe('saudacaoVazia / saudacaoTudoConcluido', () => {
  it('vazia com e sem nome', () => {
    expect(saudacaoVazia('Adilson')).toBe('Bem-vindo ao Lab, Adilson.')
    expect(saudacaoVazia(null)).toBe('Bem-vindo ao Lab.')
  })

  it('tudo concluído: plural correto', () => {
    expect(saudacaoTudoConcluido('Adilson', 1).linha).toContain('1 projeto ')
    expect(saudacaoTudoConcluido('Adilson', 3).linha).toContain('3 projetos')
    expect(saudacaoTudoConcluido(null, 1).headline).toBe('De volta.')
  })
})
