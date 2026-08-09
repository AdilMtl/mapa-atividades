// =============================================================================
// MARKETING — funil "Jornada" do painel de Funil (ISSUE-601B)
// Zero I/O: a rota busca as 7 contagens (2 de `radar_sessions`, o resto já vem
// dos contatos de `vw_marketing_contatos` que a 601A buscou) e esta função só
// estrutura o funil — % de queda em relação à etapa anterior e a flag de
// "parede" (etapa anterior teve gente, esta teve zero).
//
// Decisão: ao contrário do Bloco 6 do Analytics (`montarPipelineLab`), que
// separa PESSOAS de PROJETOS em duas metades pra não passar de 100% (comentário
// em lib/admin/analytics.ts), aqui as 7 etapas ficam numa cadeia só — por
// design do protótipo aprovado (docs/marketing/mockups/601-painel-funil.html).
// Só é seguro porque as duas últimas etapas contam PESSOAS com projeto/projeto
// concluído (não projetos), mantendo a unidade consistente em toda a cadeia.
// =============================================================================

export interface EtapaJornada {
  id: string
  n: number
  /** % em relação à etapa anterior. `null` na primeira etapa (não há anterior). */
  pctAnterior: number | null
  /** Etapa anterior tinha gente e esta tem zero — "porta fechada", não fraqueza. */
  parede: boolean
}

export interface JornadaFunil {
  topo: number
  etapas: EtapaJornada[]
}

export interface ContagensJornada {
  sessoesRadar: number
  concluiramRadar: number
  leadsUnicos: number
  convidadosLab: number
  criaramConta: number
  criaramProjeto: number
  concluiramProjeto: number
}

export function montarJornadaFunil(input: ContagensJornada): JornadaFunil {
  const brutos: { id: string; n: number }[] = [
    { id: 'sessoes_radar', n: input.sessoesRadar },
    { id: 'concluiram_radar', n: input.concluiramRadar },
    { id: 'deixaram_email', n: input.leadsUnicos },
    { id: 'convidados_lab', n: input.convidadosLab },
    { id: 'criaram_conta', n: input.criaramConta },
    { id: 'criaram_projeto', n: input.criaramProjeto },
    { id: 'concluiram_projeto', n: input.concluiramProjeto },
  ]

  const etapas: EtapaJornada[] = brutos.map((etapa, i) => {
    const anterior = i > 0 ? brutos[i - 1] : null
    const pctAnterior = anterior && anterior.n > 0 ? Math.round((etapa.n / anterior.n) * 1000) / 10 : null
    const parede = anterior !== null && anterior.n > 0 && etapa.n === 0
    return { id: etapa.id, n: etapa.n, pctAnterior, parede }
  })

  return { topo: input.sessoesRadar, etapas }
}
