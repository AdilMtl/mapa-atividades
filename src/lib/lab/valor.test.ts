import { describe, expect, it } from 'vitest'

import { ORDEM_TRILHA } from './trilha'
import {
  MARCO_MIN_PROJETOS,
  montarMarcoTrajetoria,
  montarRamoValor,
  paraDadosValor,
  slugRamo,
  tipoDoSlugRamo,
} from './valor'

describe('slugs de ramo', () => {
  it('vai e volta pros 9 tipos', () => {
    for (const tipo of ORDEM_TRILHA) {
      expect(tipoDoSlugRamo(slugRamo(tipo))).toBe(tipo)
    }
  })

  it('ignora slug que não é de ramo (guia comum não vira valor)', () => {
    expect(tipoDoSlugRamo('prompt-de-quatro-partes')).toBeNull()
    expect(tipoDoSlugRamo('marco-trajetoria')).toBeNull()
  })

  it('rejeita tipo inventado no prefixo (não abre rota fantasma)', () => {
    expect(tipoDoSlugRamo('valor-foguete')).toBeNull()
  })
})

describe('montarRamoValor', () => {
  it('monta os 5 blocos pros 9 tipos, com toque específico em cada um', () => {
    const toques = new Set<string>()

    for (const tipo of ORDEM_TRILHA) {
      const ramo = montarRamoValor(tipo, {})
      expect(ramo.blocos).toHaveLength(5)
      expect(ramo.combinado.length).toBeGreaterThan(0)

      const toque = ramo.blocos[4]!
      expect(toque.titulo).toBe('E no teu caso, especificamente')
      toques.add(toque.paragrafos[0]!)
    }

    // 9 toques distintos — nenhum tipo herda o texto de outro
    expect(toques.size).toBe(ORDEM_TRILHA.length)
  })

  it('usa as horas reais do projeto e projeta o mês', () => {
    const ramo = montarRamoValor('automacao', { horasSemana: 6 })
    const texto = ramo.blocos[0]!.paragrafos.join(' ')

    expect(texto).toContain('6h da tua semana')
    expect(texto).toContain('24h por mês') // 6 × 4
  })

  it('degrada com graça sem horas (projeto v1 não quebra)', () => {
    const ramo = montarRamoValor('prompt', {})
    const texto = ramo.blocos[0]!.paragrafos.join(' ')

    expect(texto).toContain('Falta o número')
    expect(texto).not.toContain('undefined')
    expect(texto).not.toContain('NaN')
  })

  it('contextualiza a abertura com o título do projeto', () => {
    const comTitulo = montarRamoValor('prompt', { titulo: 'Relatório semanal' })
    expect(comTitulo.abertura[0]).toContain('Relatório semanal')

    const semTitulo = montarRamoValor('prompt', {})
    expect(semTitulo.abertura[0]).toContain('teu projeto')
  })

  it('troca a abertura da exposição conforme o público', () => {
    const soEu = montarRamoValor('prompt', { publico: 'pub_so_eu' })
    const lideranca = montarRamoValor('prompt', { publico: 'pub_lideranca' })

    expect(soEu.blocos[2]!.paragrafos[0]).toContain('só teu')
    expect(lideranca.blocos[2]!.paragrafos[0]).toContain('liderança')
  })

  it('entrega caixas de copiar nos blocos de ação', () => {
    const ramo = montarRamoValor('dashboard', { horasSemana: 3 })
    const comCopia = ramo.blocos.filter((b) => b.paraCopiar)

    // número medido, caderninho, mensagem de exposição, pergunta de escopo
    expect(comCopia).toHaveLength(4)
    for (const bloco of comCopia) {
      expect(bloco.paraCopiar!.trim().length).toBeGreaterThan(0)
    }
  })
})

describe('montarMarcoTrajetoria', () => {
  it('fica trancado abaixo de 3 e conta o que falta', () => {
    const zero = montarMarcoTrajetoria(0)
    expect(zero.aberto).toBe(false)
    expect(zero.faltam).toBe(3)
    expect(zero.paragrafos).toHaveLength(0)
    expect(zero.fechamento).toBeNull()

    const dois = montarMarcoTrajetoria(2)
    expect(dois.aberto).toBe(false)
    expect(dois.faltam).toBe(1)
  })

  it('abre exatamente em 3 projetos terminados', () => {
    const tres = montarMarcoTrajetoria(MARCO_MIN_PROJETOS)
    expect(tres.aberto).toBe(true)
    expect(tres.faltam).toBe(0)
    expect(tres.movimentos).toHaveLength(3)
    expect(tres.fechamento).not.toBeNull()
  })

  it('segue aberto acima de 3', () => {
    expect(montarMarcoTrajetoria(7).aberto).toBe(true)
  })
})

describe('paraDadosValor', () => {
  it('lê o wizard v2 (horas incluídas)', () => {
    const dados = paraDadosValor(
      { schema_version: 2, horas_semana: 8, publico: 'pub_time', entrega: 'entrega_relatorio' },
      'Meu projeto',
    )

    expect(dados).toMatchObject({
      titulo: 'Meu projeto',
      horasSemana: 8,
      publico: 'pub_time',
    })
  })

  it('lê o wizard v1 sem horas (campo não existia)', () => {
    const dados = paraDadosValor({ publico: 'pub_so_eu' }, null)

    expect(dados.horasSemana).toBeNull()
    expect(dados.publico).toBe('pub_so_eu')
  })

  it('aguenta wizard ausente', () => {
    expect(() => paraDadosValor(null, null)).not.toThrow()
    expect(paraDadosValor(null, null).horasSemana).toBeNull()
  })
})
