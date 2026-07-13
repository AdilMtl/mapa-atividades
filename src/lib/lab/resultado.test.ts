// =============================================================================
// LAB — TESTES DO MINI-DIAGNÓSTICO DE RESULTADO (ISSUE-314D)
// Perguntas fechadas bem-formadas · devolutiva determinística por eixo ·
// resumo compartilhável com o que a pessoa construiu · validação estrita
// (vocabulário fechado, nunca confia no cliente) · costura pra IA preservada
// (o shape de saída não muda).
// =============================================================================

import { describe, expect, it } from 'vitest'

import {
  montarCompartilhavel,
  montarDevolutivaResultado,
  PERGUNTAS_RESULTADO,
  RESULTADO_VERSION,
  validarResultado,
} from './resultado'
import type { ResultadoRespostas } from './types'

const RESPOSTAS: ResultadoRespostas = {
  chegou: 'chegou_usei',
  comparado: 'comp_melhor',
  proximo: 'prox_rotina',
}

describe('PERGUNTAS_RESULTADO', () => {
  it('são 3 perguntas, uma por campo de ResultadoRespostas', () => {
    expect(PERGUNTAS_RESULTADO).toHaveLength(3)
    expect(PERGUNTAS_RESULTADO.map((p) => p.campo)).toEqual(['chegou', 'comparado', 'proximo'])
  })

  it('toda pergunta tem enunciado e opções com id/label não vazios', () => {
    for (const pergunta of PERGUNTAS_RESULTADO) {
      expect(pergunta.enunciado.length).toBeGreaterThan(0)
      expect(pergunta.opcoes.length).toBeGreaterThanOrEqual(2)
      for (const opcao of pergunta.opcoes) {
        expect(opcao.id.length).toBeGreaterThan(0)
        expect(opcao.label.length).toBeGreaterThan(0)
      }
    }
  })

  it('ids das opções são únicos no conjunto todo (persistência sem colisão)', () => {
    const ids = PERGUNTAS_RESULTADO.flatMap((p) => p.opcoes.map((o) => o.id))
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('montarDevolutivaResultado', () => {
  it('compõe headline/nuance/próximo passo a partir das respostas', () => {
    const dev = montarDevolutivaResultado(RESPOSTAS)
    expect(dev.headline).toContain('colocou pra rodar')
    expect(dev.nuance).toContain('Melhor e mais rápido')
    expect(dev.proximoPasso).toContain('rotina')
  })

  it('é determinístico (mesmas respostas → mesmo texto)', () => {
    expect(montarDevolutivaResultado(RESPOSTAS)).toEqual(montarDevolutivaResultado(RESPOSTAS))
  })

  it('cada eixo tem texto próprio para todas as opções (zero combinação vazia)', () => {
    for (const chegou of PERGUNTAS_RESULTADO[0].opcoes.map((o) => o.id)) {
      for (const comparado of PERGUNTAS_RESULTADO[1].opcoes.map((o) => o.id)) {
        for (const proximo of PERGUNTAS_RESULTADO[2].opcoes.map((o) => o.id)) {
          const dev = montarDevolutivaResultado({
            chegou,
            comparado,
            proximo,
          } as ResultadoRespostas)
          expect(dev.headline.length).toBeGreaterThan(0)
          expect(dev.nuance.length).toBeGreaterThan(0)
          expect(dev.proximoPasso.length).toBeGreaterThan(0)
        }
      }
    }
  })
})

describe('montarCompartilhavel', () => {
  it('inclui título, artefato e a headline do resultado', () => {
    const devolutiva = montarDevolutivaResultado(RESPOSTAS)
    const texto = montarCompartilhavel({
      titulo: 'Painel da carteira',
      artefato: 'Painel v1 respondendo às 3 perguntas da semana',
      devolutiva,
    })
    expect(texto).toContain('Painel da carteira')
    expect(texto).toContain('Painel v1 respondendo')
    expect(texto).toContain(devolutiva.headline)
  })
})

describe('validarResultado', () => {
  it('payload completo e válido → LabResultado com versão da heurística', () => {
    const r = validarResultado(RESPOSTAS)
    expect(r).not.toBeNull()
    expect(r!.respostas).toEqual(RESPOSTAS)
    expect(r!.versao).toBe(RESULTADO_VERSION)
  })

  it('campo faltando → null (a pessoa pulou/enviou incompleto)', () => {
    expect(validarResultado({ chegou: 'chegou_usei', comparado: 'comp_melhor' })).toBeNull()
  })

  it('id fora do vocabulário → null', () => {
    expect(
      validarResultado({ ...RESPOSTAS, chegou: 'chegou_invalido' }),
    ).toBeNull()
  })

  it('não-objeto → null', () => {
    expect(validarResultado(null)).toBeNull()
    expect(validarResultado('chegou_usei')).toBeNull()
    expect(validarResultado(undefined)).toBeNull()
  })

  it('ignora campos extras, mantém só as 3 respostas fechadas', () => {
    const r = validarResultado({ ...RESPOSTAS, evil: 'DROP TABLE', extra: 123 })
    expect(r).not.toBeNull()
    expect(Object.keys(r!.respostas).sort()).toEqual(['chegou', 'comparado', 'proximo'])
  })
})
