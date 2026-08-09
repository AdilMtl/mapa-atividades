import { describe, expect, it } from 'vitest'

import {
  gerarTokenDescadastro,
  linkDescadastro,
  normalizarEmail,
  validarTokenDescadastro,
} from './descadastro'

const SECRET = 'segredo-de-teste-nao-e-o-de-producao'

describe('token de descadastro (ISSUE-601C §3.4)', () => {
  it('gera e valida em ida e volta, devolvendo o e-mail canônico', () => {
    const token = gerarTokenDescadastro('Marina.R@Exemplo.com.br', SECRET)
    expect(validarTokenDescadastro(token, SECRET)).toBe('marina.r@exemplo.com.br')
  })

  it('o e-mail nunca aparece em texto plano na URL', () => {
    const email = 'marina.r@exemplo.com.br'
    const url = linkDescadastro(email, SECRET, 'https://site.test')
    expect(url).not.toContain(email)
    expect(url).toContain('https://site.test/descadastrar?t=')
  })

  it('token adulterado (payload trocado) é rejeitado', () => {
    const token = gerarTokenDescadastro('a@b.com', SECRET)
    const [, assinatura] = token.split('.')
    const adulterado = `${Buffer.from('outro@b.com').toString('base64url')}.${assinatura}`
    expect(validarTokenDescadastro(adulterado, SECRET)).toBeNull()
  })

  it('token assinado com outro segredo é rejeitado', () => {
    const token = gerarTokenDescadastro('a@b.com', 'outro-segredo')
    expect(validarTokenDescadastro(token, SECRET)).toBeNull()
  })

  it('lixo na URL não valida nem lança (rota é pública)', () => {
    for (const lixo of ['', 'x', 'a.b.c', '!!!.???', `${'a'.repeat(5000)}.b`]) {
      expect(validarTokenDescadastro(lixo, SECRET)).toBeNull()
    }
  })

  it('e-mail com maiúscula/espaço gera o MESMO token da forma canônica', () => {
    expect(gerarTokenDescadastro('  A@B.com ', SECRET)).toBe(gerarTokenDescadastro('a@b.com', SECRET))
  })

  it('token cujo payload não está canônico é rejeitado (evita duplicidade de identidade)', () => {
    const naoCanonico = Buffer.from('A@B.com').toString('base64url')
    const assinatura = gerarTokenDescadastro('a@b.com', SECRET).split('.')[1]
    expect(validarTokenDescadastro(`${naoCanonico}.${assinatura}`, SECRET)).toBeNull()
  })

  it('sem segredo, gerar lança e validar devolve null', () => {
    expect(() => gerarTokenDescadastro('a@b.com', '')).toThrow()
    const token = gerarTokenDescadastro('a@b.com', SECRET)
    expect(validarTokenDescadastro(token, '')).toBeNull()
  })

  it('origem opcional entra como parâmetro `de` sem quebrar o token', () => {
    const url = linkDescadastro('a@b.com', SECRET, 'https://site.test', 'convite_lab')
    expect(url).toContain('&de=convite_lab')
    const t = new URL(url).searchParams.get('t')!
    expect(validarTokenDescadastro(t, SECRET)).toBe('a@b.com')
  })
})

describe('normalizarEmail', () => {
  it('baixa caixa e apara espaços', () => {
    expect(normalizarEmail('  Foo@BAR.com ')).toBe('foo@bar.com')
  })
})
