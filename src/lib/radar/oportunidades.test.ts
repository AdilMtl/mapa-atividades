// Casos de teste canônicos: as 7 personas de validação do doc 11 §9
// (✅ aprovadas pelo dono em 2026-07-06) + casos-limite exigidos pela ISSUE-104.
import { describe, expect, it } from 'vitest'
import {
  COMPLEXIDADE,
  decidirOportunidade,
  PERGUNTAS_OPORTUNIDADES,
} from './oportunidades'
import type { RadarAnswers } from './types'

interface Cenario {
  area?: string
  entrega: string
  perda: string
  freq: string
  publico: string
  dado: string
  desejo: string
  conforto: string
}

function respostas(c: Cenario): RadarAnswers {
  return {
    ...(c.area ? { op_area: c.area } : {}),
    op_entrega: c.entrega,
    op_perda: c.perda,
    op_frequencia: c.freq,
    op_publico: c.publico,
    op_dado: c.dado,
    op_desejo: c.desejo,
    op_conforto: c.conforto,
  }
}

describe('personas de validação (doc 11 §9, aprovadas pelo dono)', () => {
  it('Persona 1 — Renata, analista de vendas → dashboard (≈11 vs 5)', () => {
    const r = decidirOportunidade(
      respostas({
        entrega: 'entrega_planilhas',
        perda: 'perda_consolidando',
        freq: 'freq_semanal',
        publico: 'pub_lideranca',
        dado: 'dado_planilha',
        desejo: 'desejo_decisao',
        conforto: 'conf_bom',
      }),
    )
    expect(r.tipo).toBe('dashboard')
    expect(r.pontuacao.dashboard).toBe(11)
    expect(r.flags).toEqual({ diligencia: false, rebaixadoPorConforto: false })
    expect(r.teaser.familia).toBe('visualizacao')
    expect(r.estimativaMaturidade).toBe('operador')
  })

  it('Persona 2 — Marcos, comunicação interna → prompt (≈10 vs 6)', () => {
    const r = decidirOportunidade(
      respostas({
        entrega: 'entrega_textos',
        perda: 'perda_revisando',
        freq: 'freq_mensal',
        publico: 'pub_time',
        dado: 'dado_texto_livre',
        desejo: 'desejo_tempo',
        conforto: 'conf_medio',
      }),
    )
    expect(r.tipo).toBe('prompt')
    expect(r.pontuacao.prompt).toBe(10)
    expect(r.pontuacao.template).toBe(6)
    expect(r.teaser.familia).toBe('conversacao')
    expect(r.estimativaMaturidade).toBe('usuario_operador')
  })

  it('Persona 3 — Júlia, RH com dado sensível → template + flag diligência', () => {
    const r = decidirOportunidade(
      respostas({
        area: 'area_rh',
        entrega: 'entrega_atendimento',
        perda: 'perda_duvidas',
        freq: 'freq_diario',
        publico: 'pub_time',
        dado: 'dado_sensiveis',
        desejo: 'desejo_automatizar',
        conforto: 'conf_medio',
      }),
    )
    expect(r.tipo).toBe('template')
    expect(r.flags.diligencia).toBe(true)
    // Sem o modificador a automação venceria (6 bruto); a penalidade derruba p/ 3
    // e o template vence o empate com dashboard (4×4) por menor complexidade.
    expect(r.pontuacaoBruta.automacao).toBe(6)
    expect(r.pontuacao.automacao).toBe(3)
    expect(r.pontuacao.template).toBe(4)
    expect(r.pontuacao.dashboard).toBe(4)
  })

  it('Persona 4 — Fernando, operações → automação (≈10 vs 6)', () => {
    const r = decidirOportunidade(
      respostas({
        entrega: 'entrega_status',
        perda: 'perda_copiando',
        freq: 'freq_diario',
        publico: 'pub_time',
        dado: 'dado_sistemas',
        desejo: 'desejo_automatizar',
        conforto: 'conf_alto',
      }),
    )
    expect(r.tipo).toBe('automacao')
    expect(r.pontuacao.automacao).toBe(10)
    expect(r.pontuacao.dashboard).toBe(6)
    expect(r.teaser.familia).toBe('fluxo')
    expect(r.teaser.nivelNaFamilia).toBe(2)
  })

  it('Persona 5 — Camila → agêntico vence (9 vs 8) porque P8+P6 liberam o teto', () => {
    const r = decidirOportunidade(
      respostas({
        entrega: 'entrega_atendimento',
        perda: 'perda_buscando',
        freq: 'freq_diario',
        publico: 'pub_externo',
        dado: 'dado_sistemas',
        desejo: 'desejo_automatizar',
        conforto: 'conf_muito_alto',
      }),
    )
    expect(r.tipo).toBe('agentico')
    expect(r.pontuacao.agentico).toBe(9)
    expect(r.pontuacao.orquestrado).toBe(8)
  })

  it('Persona 5 com conforto médio → rebaixa para o próximo colocado dentro do teto', () => {
    const r = decidirOportunidade(
      respostas({
        entrega: 'entrega_atendimento',
        perda: 'perda_buscando',
        freq: 'freq_diario',
        publico: 'pub_externo',
        dado: 'dado_sistemas',
        desejo: 'desejo_automatizar',
        conforto: 'conf_medio',
      }),
    )
    expect(r.tipo).not.toBe('agentico')
    expect(r.tipo).not.toBe('orquestrado')
    expect(COMPLEXIDADE[r.tipo]).toBeLessThanOrEqual(3)
    expect(r.flags.rebaixadoPorConforto).toBe(true)
    expect(r.vencedorBruto).toBe('agentico') // auditoria: o potencial fica visível
  })

  it('Persona 6 — Eduardo, empreendedor → automação (9; agêntico 7 barrado pelo teto)', () => {
    const r = decidirOportunidade(
      respostas({
        area: 'area_empreendedor',
        entrega: 'entrega_atendimento',
        perda: 'perda_duvidas',
        freq: 'freq_diario',
        publico: 'pub_externo',
        dado: 'dado_emails',
        desejo: 'desejo_automatizar',
        conforto: 'conf_medio',
      }),
    )
    expect(r.tipo).toBe('automacao')
    expect(r.pontuacao.automacao).toBe(9)
    expect(r.pontuacao.agentico).toBe(7)
    expect(r.area).toBe('area_empreendedor')
  })

  it('Persona 7 — Larissa, estudante → prompt (empate 7×7 com workflow, menor complexidade)', () => {
    const r = decidirOportunidade(
      respostas({
        area: 'area_estudante',
        entrega: 'entrega_textos',
        perda: 'perda_buscando',
        freq: 'freq_varias_semana',
        publico: 'pub_so_eu',
        dado: 'dado_documentos',
        desejo: 'desejo_tempo',
        conforto: 'conf_bom',
      }),
    )
    expect(r.tipo).toBe('prompt')
    expect(r.pontuacao.prompt).toBe(7)
    expect(r.pontuacao.workflow).toBe(7)
    expect(r.area).toBe('area_estudante')
  })
})

describe('guard-rails e desempate', () => {
  it('empate na mesma complexidade cai na ordem fixa (prompt > template)', () => {
    const r = decidirOportunidade(
      respostas({
        entrega: 'entrega_apresentacoes', // prompt +1, template +1
        perda: 'perda_alinhando', // template +1, workflow +1
        freq: 'freq_mensal', // prompt +2, template +2, workflow +1
        publico: 'pub_so_eu', // prompt +2, template +1, app_offline +2
        dado: 'dado_nao_sei', // zero
        desejo: 'desejo_visualizacao', // dashboard +3
        conforto: 'conf_bom',
      }),
    )
    expect(r.pontuacao.prompt).toBe(5)
    expect(r.pontuacao.template).toBe(5)
    expect(r.tipo).toBe('prompt')
  })

  it('sensível + conforto baixo juntos: teto ≤2, diligência marcada, template vence', () => {
    const r = decidirOportunidade(
      respostas({
        entrega: 'entrega_atendimento',
        perda: 'perda_duvidas',
        freq: 'freq_diario',
        publico: 'pub_time',
        dado: 'dado_sensiveis',
        desejo: 'desejo_automatizar',
        conforto: 'conf_baixo',
      }),
    )
    expect(r.flags.diligencia).toBe(true)
    expect(COMPLEXIDADE[r.tipo]).toBeLessThanOrEqual(2)
    expect(r.tipo).toBe('template') // empata 4×4 com dashboard → menor complexidade
  })

  it('"não sei" (dado) não distorce o scoring — nenhum tipo pontua por ele', () => {
    const base: Cenario = {
      entrega: 'entrega_reunioes',
      perda: 'perda_organizando',
      freq: 'freq_raramente',
      publico: 'pub_so_eu',
      dado: 'dado_nao_sei',
      desejo: 'desejo_tempo',
      conforto: 'conf_bom',
    }
    const r = decidirOportunidade(respostas(base))
    // prompt = freq 3 + pub 2 + desejo 1 + entrega 1 = 7, tudo sem contribuição do dado
    expect(r.pontuacao.prompt).toBe(7)
    expect(r.tipo).toBe('prompt')
  })

  it('é determinístico: mesmas respostas → mesmo resultado', () => {
    const a = respostas({
      entrega: 'entrega_dashboards',
      perda: 'perda_analises',
      freq: 'freq_varias_semana',
      publico: 'pub_outra_area',
      dado: 'dado_planilha',
      desejo: 'desejo_compartilhar',
      conforto: 'conf_alto',
    })
    expect(decidirOportunidade(a)).toEqual(decidirOportunidade(a))
  })

  it('lança erro se faltar resposta pontuada', () => {
    const incompleta = respostas({
      entrega: 'entrega_textos',
      perda: 'perda_revisando',
      freq: 'freq_mensal',
      publico: 'pub_time',
      dado: 'dado_texto_livre',
      desejo: 'desejo_tempo',
      conforto: 'conf_medio',
    })
    delete incompleta['op_conforto']
    expect(() => decidirOportunidade(incompleta)).toThrow(/op_conforto/)
  })

  it('varredura: agêntico NUNCA vence sem P8 alto/muito alto + dados de sistemas; teto sempre respeitado; sensível sempre marca diligência', () => {
    const opcoesDe = (id: string) =>
      PERGUNTAS_OPORTUNIDADES.find((p) => p.id === id)!.options.map((o) => o.id)
    // Contexto que maximiza o agêntico (entrega/perda com +2 cada) — pior caso do guard-rail.
    for (const freq of opcoesDe('op_frequencia'))
      for (const publico of opcoesDe('op_publico'))
        for (const dado of opcoesDe('op_dado'))
          for (const desejo of opcoesDe('op_desejo'))
            for (const conforto of opcoesDe('op_conforto')) {
              const r = decidirOportunidade(
                respostas({
                  entrega: 'entrega_atendimento',
                  perda: 'perda_duvidas',
                  freq,
                  publico,
                  dado,
                  desejo,
                  conforto,
                }),
              )
              if (r.tipo === 'agentico') {
                expect(['conf_alto', 'conf_muito_alto']).toContain(conforto)
                expect(dado).toBe('dado_sistemas')
              }
              if (conforto === 'conf_baixo') expect(COMPLEXIDADE[r.tipo]).toBeLessThanOrEqual(2)
              if (conforto === 'conf_medio') expect(COMPLEXIDADE[r.tipo]).toBeLessThanOrEqual(3)
              if (dado === 'dado_sensiveis') expect(r.flags.diligencia).toBe(true)
            }
  })
})

describe('teaser (camada grátis — escada de captura, doc 10)', () => {
  it('eixos normalizados 0–100 seguem o mapeamento do doc 11 §7.1 (caso Renata)', () => {
    const r = decidirOportunidade(
      respostas({
        entrega: 'entrega_planilhas',
        perda: 'perda_consolidando',
        freq: 'freq_semanal',
        publico: 'pub_lideranca',
        dado: 'dado_planilha',
        desejo: 'desejo_decisao',
        conforto: 'conf_bom',
      }),
    )
    expect(Object.fromEntries(r.teaser.eixos.map((e) => [e.id, e.valor]))).toEqual({
      repeticao: 55,
      estrutura: 70,
      alcance: 80,
      reuso: 55,
      cuidado: 25,
      autonomia: 60,
    })
  })

  it('dado sensível: Cuidado exigido = 100 e Estrutura = 50', () => {
    const r = decidirOportunidade(
      respostas({
        entrega: 'entrega_atendimento',
        perda: 'perda_duvidas',
        freq: 'freq_diario',
        publico: 'pub_time',
        dado: 'dado_sensiveis',
        desejo: 'desejo_automatizar',
        conforto: 'conf_medio',
      }),
    )
    const eixos = Object.fromEntries(r.teaser.eixos.map((e) => [e.id, e.valor]))
    expect(eixos.cuidado).toBe(100)
    expect(eixos.estrutura).toBe(50)
  })

  it('sinais dominantes: 2–3 respostas que mais pesaram no tipo vencedor', () => {
    const r = decidirOportunidade(
      respostas({
        entrega: 'entrega_planilhas',
        perda: 'perda_consolidando',
        freq: 'freq_semanal',
        publico: 'pub_lideranca',
        dado: 'dado_planilha',
        desejo: 'desejo_decisao',
        conforto: 'conf_bom',
      }),
    )
    expect(r.teaser.sinais.length).toBeLessThanOrEqual(3)
    expect(r.teaser.sinais.length).toBeGreaterThanOrEqual(2)
    // Para o dashboard da Renata: liderança (+3), facilitar decisão (+3), planilha (+2)
    expect(r.teaser.sinais.map((s) => s.opcaoId)).toEqual([
      'pub_lideranca',
      'desejo_decisao',
      'dado_planilha',
    ])
    expect(r.gated).toBe(true)
  })
})
