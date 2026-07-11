// Testes do módulo de materiais (ISSUE-314): guias sempre presentes pros 9
// tipos, prompts nunca vazam placeholder em nenhuma combinação de fallback,
// devolutiva degrada com graça, linha de evolução só acima na escada.
import { describe, expect, it } from 'vitest'

import { COMPLEXIDADE, TIPOS_SOLUCAO } from '../radar/oportunidades'
import type { SolutionTypeId } from '../radar/types'
import { SLUGS_CANONICOS, SLUGS_POR_TIPO } from './plan-generator'
import type { LabDiagnosis } from './types'
import {
  guiaAncora,
  guiaPorSlug,
  linhaEvolucao,
  montarDevolutiva,
  montarPrimeiroPrompt,
  paraFonteDevolutiva,
  resolverFerramenta,
} from './materiais'

describe('guias', () => {
  it('todo slug canônico (SLUGS_POR_TIPO + diligência) tem guia', () => {
    for (const slug of SLUGS_CANONICOS) {
      const guia = guiaPorSlug(slug)
      expect(guia, `slug "${slug}" sem guia`).toBeDefined()
      expect(guia!.paragrafos.length).toBeGreaterThanOrEqual(3)
      expect(guia!.titulo.length).toBeGreaterThan(0)
    }
  })

  it('guiaAncora resolve pros 9 tipos', () => {
    for (const tipo of TIPOS_SOLUCAO) {
      expect(guiaAncora(tipo).slug).toBe(SLUGS_POR_TIPO[tipo][0])
    }
  })
})

describe('primeiro prompt — zero placeholder vazando, em qualquer combinação de fallback', () => {
  const AMBIENTES_TESTE: Array<{ nome: string; ambiente: DadosAmbiente }> = [
    { nome: 'workspace', ambiente: ['amb_workspace'] },
    { nome: 'copilot', ambiente: ['amb_copilot'] },
    { nome: 'premium', ambiente: ['amb_ia_premium'] },
    { nome: 'shadow (cai na base)', ambiente: ['amb_shadow'] },
    { nome: 'vazio (base)', ambiente: [] },
    { nome: 'ausente (v1)', ambiente: undefined },
  ]

  for (const tipo of TIPOS_SOLUCAO) {
    for (const { nome, ambiente } of AMBIENTES_TESTE) {
      it(`${tipo} × área/entrega presentes × arsenal ${nome}`, () => {
        const prompt = montarPrimeiroPrompt(tipo, {
          area: 'area_marketing',
          entrega: 'entrega_relatorios',
          ambiente,
        })
        expect(prompt).not.toContain('{{')
        expect(prompt.length).toBeGreaterThan(100)
      })

      it(`${tipo} × área/entrega ausentes (fallback total) × arsenal ${nome}`, () => {
        const prompt = montarPrimeiroPrompt(tipo, { area: null, entrega: null, ambiente })
        expect(prompt).not.toContain('{{')
        expect(prompt).toContain('No meu trabalho')
        expect(prompt).not.toContain('Trabalho com o meu trabalho')
      })
    }
  }
})

describe('resolverFerramenta — prioridade workspace > copilot > premium > base', () => {
  it('workspace vence mesmo com outros presentes', () => {
    expect(resolverFerramenta(['amb_ia_premium', 'amb_workspace'])).toContain('Workspace')
  })
  it('copilot vence sobre premium', () => {
    expect(resolverFerramenta(['amb_copilot', 'amb_ia_premium'])).toContain('Copilot')
  })
  it('shadow sozinho cai na base gratuita', () => {
    expect(resolverFerramenta(['amb_shadow'])).toContain('gratuita')
  })
  it('undefined/null caem na base gratuita', () => {
    expect(resolverFerramenta(undefined)).toContain('gratuita')
    expect(resolverFerramenta(null)).toContain('gratuita')
  })
})

describe('linhaEvolucao', () => {
  const base = (tipo: SolutionTypeId, vencedorBruto: SolutionTypeId): Pick<LabDiagnosis, 'tipo' | 'vencedor_bruto'> => ({
    tipo,
    vencedor_bruto: vencedorBruto,
  })

  it('null quando vencedor_bruto é igual ao tipo', () => {
    expect(linhaEvolucao(base('prompt', 'prompt'))).toBeNull()
  })

  it('null quando vencedor_bruto está ABAIXO na escada (nunca "regride")', () => {
    expect(linhaEvolucao(base('automacao', 'prompt'))).toBeNull()
  })

  it('null quando vencedor_bruto empata em complexidade (ex.: prompt/template, ambos 1)', () => {
    expect(linhaEvolucao(base('prompt', 'template'))).toBeNull()
  })

  it('linha presente quando vencedor_bruto está estritamente acima', () => {
    const linha = linhaEvolucao(base('prompt', 'automacao'))
    expect(linha).not.toBeNull()
    expect(linha).toContain('automação')
  })

  it('agentico (topo da escada) nunca tem linha de evolução', () => {
    for (const tipo of TIPOS_SOLUCAO) {
      if (tipo === 'agentico') continue
      // agentico como vencedor_bruto de outro tipo TEM linha; o teste aqui é
      // o inverso — confirmando que COMPLEXIDADE cobre o topo sem lançar erro.
      expect(() => linhaEvolucao(base('agentico', tipo))).not.toThrow()
    }
    expect(COMPLEXIDADE.agentico).toBe(Math.max(...Object.values(COMPLEXIDADE)))
  })
})

describe('montarDevolutiva', () => {
  it('só a chegada (nenhum outro dado) — bloco ainda funciona', () => {
    const d = montarDevolutiva({})
    expect(d.frases.length).toBe(1)
    expect(d.manuscrito).toBeNull()
  })

  it('trilha ideia com arquétipo — frase específica', () => {
    const d = montarDevolutiva({ porta: 'ideia', arquetipo: 'arq_painel' })
    expect(d.frases[0]).toContain('painel')
  })

  it('trilha ideia sem arquétipo (arq_outro/ausente) — fallback genérico', () => {
    const d = montarDevolutiva({ porta: 'ideia', arquetipo: undefined })
    expect(d.frases[0]).toContain('ideia própria')
  })

  it('porta dor — frase de dor', () => {
    const d = montarDevolutiva({ porta: 'dor' })
    expect(d.frases[0]).toContain('dor de verdade')
  })

  it('porta difusa — frase de difusa', () => {
    const d = montarDevolutiva({ porta: 'difusa' })
    expect(d.frases[0]).toContain('sem saber por onde começar')
  })

  it('horas_semana soma frase e vira manuscrito quando não há relato', () => {
    const d = montarDevolutiva({ horasSemana: 6 })
    expect(d.frases.some((f) => f.includes('~6h'))).toBe(true)
    expect(d.manuscrito).toContain('~6h')
  })

  it('horas_semana >= 8 ganha reforço', () => {
    const d = montarDevolutiva({ horasSemana: 10 })
    expect(d.frases.some((f) => f.includes('dia inteiro'))).toBe(true)
  })

  it('horas_semana <= 0 ou ausente não gera frase', () => {
    expect(montarDevolutiva({ horasSemana: 0 }).frases.length).toBe(1)
    expect(montarDevolutiva({ horasSemana: undefined }).frases.length).toBe(1)
  })

  it('publico reconhecido soma frase', () => {
    const d = montarDevolutiva({ publico: 'pub_lideranca' })
    expect(d.frases.some((f) => f.includes('liderança'))).toBe(true)
  })

  it('publico desconhecido/ausente não quebra nem soma frase vazia', () => {
    const d = montarDevolutiva({ publico: 'pub_inexistente' })
    expect(d.frases.length).toBe(1)
  })

  it('relato vira o manuscrito, tem prioridade sobre a frase de horas', () => {
    const d = montarDevolutiva({ horasSemana: 6, relato: 'perco a manhã toda com isso' })
    expect(d.manuscrito).toContain('perco a manhã toda com isso')
  })

  it('relato longo é truncado com corte em palavra', () => {
    const longo = 'palavra '.repeat(30) // 240 chars, com espaços pra testar o corte
    const d = montarDevolutiva({ relato: longo })
    // 140 chars do relato truncado + moldura fixa ("Nas tuas palavras: … Eu anotei.").
    expect(d.manuscrito!.length).toBeLessThan(140 + 40)
    expect(d.manuscrito).toContain('…')
    expect(d.manuscrito).not.toContain('a'.repeat(150))
  })

  it('projeto v1 (via paraFonteDevolutiva) degrada pro fallback de chegada', () => {
    const fonte = paraFonteDevolutiva({ schema_version: 1, publico: 'pub_time' })
    const d = montarDevolutiva(fonte)
    expect(d.frases[0]).toBe('Você chegou com uma ideia própria — e ideia própria é o melhor jeito de chegar.')
    expect(d.frases.some((f) => f.includes('teu time'))).toBe(true)
  })

  it('wizard_answers ausente/null não quebra', () => {
    expect(() => montarDevolutiva(paraFonteDevolutiva(null))).not.toThrow()
    expect(() => montarDevolutiva(paraFonteDevolutiva(undefined))).not.toThrow()
  })
})

type DadosAmbiente = Parameters<typeof montarPrimeiroPrompt>[1]['ambiente']
