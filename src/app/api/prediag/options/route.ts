// ═══════════════════════════════════════════════════════════════════
// 🎯 API: OPÇÕES POR PERFIL - PRÉ-DIAGNÓSTICO
// ═══════════════════════════════════════════════════════════════════
// Arquivo: src/app/api/prediag/options/route.ts
// GET /api/prediag/options?profile=analista

import { NextRequest, NextResponse } from 'next/server';

// ═══════════════════════════════════════════════════════════════════
// 📋 LISTAS RAMIFICADAS POR PERFIL (conforme especificação)
// ═══════════════════════════════════════════════════════════════════

const LISTAS_POR_PERFIL = {
  estudante: {
    dores: [
      { id: 'procrastinacao', label: 'Procrastinação' },
      { id: 'falta_clareza', label: 'Falta de clareza no que estudar' },
      { id: 'distracao_redes', label: 'Distrair-se com redes sociais' },
      { id: 'dificuldade_rotina', label: 'Dificuldade de manter rotina' },
      { id: 'sem_energia', label: 'Falta de energia/sono ruim' }
    ],
    atividades: [
      { id: 'aulas', label: 'Assistir aulas' },
      { id: 'estudos', label: 'Estudo individual' },
      { id: 'trabalhos', label: 'Trabalhos e provas' },
      { id: 'estagio', label: 'Estágio' },
      { id: 'redes_sociais', label: 'Redes sociais' },
      { id: 'grupos_estudo', label: 'Grupos de estudo' },
      { id: 'extracurriculares', label: 'Atividades extracurriculares' },
      { id: 'outras', label: 'Outras atividades' }
    ]
  },
  
  estagiario: {
    dores: [
      { id: 'falta_direcionamento', label: 'Falta de direcionamento claro' },
      { id: 'tarefas_simples', label: 'Só recebo tarefas muito simples' },
      { id: 'medo_errar', label: 'Medo de errar ou perguntar' },
      { id: 'sobrecarga_estudo', label: 'Conciliar trabalho e estudos' },
      { id: 'inseguranca', label: 'Insegurança sobre performance' }
    ],
    atividades: [
      { id: 'tarefas_basicas', label: 'Tarefas básicas/operacionais' },
      { id: 'observar_time', label: 'Observar o time trabalhar' },
      { id: 'estudos', label: 'Estudar sobre a área' },
      { id: 'relatorios_simples', label: 'Relatórios simples' },
      { id: 'treinamentos', label: 'Treinamentos internos' },
      { id: 'acompanhar_reunioes', label: 'Acompanhar reuniões' },
      { id: 'projetos_pequenos', label: 'Projetos pequenos' },
      { id: 'outras', label: 'Outras atividades' }
    ]
  },

  analista: {
    dores: [
      { id: 'urgencias', label: 'Sempre apagando incêndios/urgências' },
      { id: 'operacional_demais', label: 'Trabalho operacional demais' },
      { id: 'reunioes', label: 'Reuniões muito longas/improdutivas' },
      { id: 'priorizar_entregas', label: 'Dificuldade para priorizar entregas' },
      { id: 'falta_direcionamento', label: 'Falta de direcionamento da liderança' }
    ],
    atividades: [
      { id: 'emails', label: 'E-mails e mensagens' },
      { id: 'reunioes_status', label: 'Reuniões de status/alinhamento' },
      { id: 'urgencias_demandas', label: 'Urgências e demandas não planejadas' },
      { id: 'relatorios', label: 'Relatórios operacionais' },
      { id: 'atendimento_interno', label: 'Atendimento a clientes internos' },
      { id: 'projetos', label: 'Projetos estruturados' },
      { id: 'treinamentos', label: 'Treinamentos e capacitação' },
      { id: 'outras', label: 'Outras atividades' }
    ]
  },

  especialista: {
    dores: [
      { id: 'demanda_operacional', label: 'Alta demanda operacional' },
      { id: 'reunioes', label: 'Reuniões improdutivas' },
      { id: 'sem_tempo_projetos', label: 'Sem tempo para projetos importantes' },
      { id: 'urgencias', label: 'Sempre apagando incêndios' },
      { id: 'consistencia_habitos', label: 'Dificuldade com consistência em hábitos' }
    ],
    atividades: [
      { id: 'reunioes_alinhamento', label: 'Reuniões de alinhamento' },
      { id: 'emails', label: 'E-mails e status reports' },
      { id: 'projetos', label: 'Projetos de médio prazo' },
      { id: 'suporte_times', label: 'Suporte a outros times' },
      { id: 'execucao', label: 'Execução técnica especializada' },
      { id: 'administrativo', label: 'Trabalho administrativo' },
      { id: 'urgencias_demandas', label: 'Urgências não planejadas' },
      { id: 'outras', label: 'Outras atividades' }
    ]
  },

  lider: {
    dores: [
      { id: 'incendios_time', label: 'Apagando incêndios do time' },
      { id: 'sem_tempo_estrategia', label: 'Pouco tempo para pensamento estratégico' },
      { id: 'reunioes', label: 'Excesso de reuniões de status' },
      { id: 'conflito_diretoria', label: 'Tensão com expectativas da diretoria' },
      { id: 'desenvolver_pessoas', label: 'Pouco tempo para desenvolver pessoas' }
    ],
    atividades: [
      { id: 'one_on_ones', label: 'Reuniões 1:1 com o time' },
      { id: 'alinhamentos', label: 'Alinhamentos estratégicos' },
      { id: 'feedbacks', label: 'Dar feedbacks e orientações' },
      { id: 'planejamento', label: 'Planejamento e definição de metas' },
      { id: 'urgencias_demandas', label: 'Resolver urgências do time' },
      { id: 'coordenacao', label: 'Coordenação entre áreas' },
      { id: 'relatorios_diretoria', label: 'Relatórios para diretoria' },
      { id: 'outras', label: 'Outras atividades' }
    ]
  },

  gestor: {
    dores: [
      { id: 'agenda_urgencias', label: 'Agenda dominada por urgências' },
      { id: 'sem_tempo_longo_prazo', label: 'Pouco tempo para visão de longo prazo' },
      { id: 'reunioes_politicas', label: 'Excesso de reuniões políticas' },
      { id: 'falta_visibilidade', label: 'Falta de visibilidade dos resultados' },
      { id: 'multistakeholders', label: 'Gerenciar múltiplos stakeholders' }
    ],
    atividades: [
      { id: 'comites', label: 'Comitês executivos' },
      { id: 'stakeholders', label: 'Gestão de stakeholders' },
      { id: 'alinhamento_corporativo', label: 'Alinhamentos corporativos' },
      { id: 'estrategia', label: 'Definição estratégica de longo prazo' },
      { id: 'revisao_metas', label: 'Revisão de metas e resultados' },
      { id: 'urgencias_criticas', label: 'Urgências críticas' },
      { id: 'sucessao', label: 'Planejamento de sucessão' },
      { id: 'outras', label: 'Outras atividades' }
    ]
  },

  empreendedor: {
    dores: [
      { id: 'sobrecarregado', label: 'Sobrecarregado fazendo tudo' },
      { id: 'vendas_consomem', label: 'Vendas consomem muito tempo' },
      { id: 'sem_tempo_inovar', label: 'Pouco tempo para inovar' },
      { id: 'falta_processo', label: 'Falta de processos estruturados' },
      { id: 'equilibrio_vida', label: 'Equilíbrio vida-trabalho' }
    ],
    atividades: [
      { id: 'vendas', label: 'Vendas e prospecção' },
      { id: 'atendimento', label: 'Atendimento a clientes' },
      { id: 'marketing', label: 'Marketing e divulgação' },
      { id: 'financeiro', label: 'Controle financeiro' },
      { id: 'produto_servico', label: 'Desenvolvimento do produto/serviço' },
      { id: 'networking', label: 'Networking e parcerias' },
      { id: 'operacoes', label: 'Operações do dia a dia' },
      { id: 'outras', label: 'Outras atividades' }
    ]
  }
};

// ═══════════════════════════════════════════════════════════════════
// 🎯 LISTAS GLOBAIS (não dependem do perfil)
// ═══════════════════════════════════════════════════════════════════

const OPCOES_AGENDA = [
  { id: 'sempre_lotada', label: 'Sempre lotada' },
  { id: 'freq_cheia', label: 'Frequentemente cheia' },
  { id: 'equilibrada', label: 'Equilibrada' },
  { id: 'livre', label: 'Mais livre que ocupada' }
];

// Goals ramificados por perfil profissional
const GOALS_POR_PERFIL = {
  estudante: [
    { id: 'melhorar_notas', label: 'Melhorar notas / passar nas provas importantes' },
    { id: 'rotina_estudos', label: 'Criar e manter uma rotina de estudos sem procrastinar' },
    { id: 'reduzir_distracao', label: 'Reduzir tempo perdido em redes sociais/distrações' },
    { id: 'tempo_projetos', label: 'Ter mais tempo para estágio ou projetos extracurriculares relevantes' }
  ],
  estagiario: [
    { id: 'entregas_prazo', label: 'Conseguir entregar todas as demandas no prazo sem estresse' },
    { id: 'saber_priorizar', label: 'Saber o que priorizar quando tudo parece urgente' },
    { id: 'reduzir_retrabalho', label: 'Reduzir retrabalho e refações por falta de clareza' },
    { id: 'tempo_aprender', label: 'Sobrando tempo para aprender coisas novas e crescer na carreira' }
  ],
  analista: [
    { id: 'entregas_prazo', label: 'Conseguir entregar todas as demandas no prazo sem estresse' },
    { id: 'saber_priorizar', label: 'Saber o que priorizar quando tudo parece urgente' },
    { id: 'reduzir_retrabalho', label: 'Reduzir retrabalho e refações por falta de clareza' },
    { id: 'tempo_aprender', label: 'Sobrando tempo para aprender coisas novas e crescer na carreira' }
  ],
  especialista: [
    { id: 'equilibrar_tarefas', label: 'Equilibrar tarefas operacionais e projetos estratégicos' },
    { id: 'reduzir_reunioes', label: 'Reduzir reuniões que consomem tempo sem gerar valor' },
    { id: 'autonomia_decisoes', label: 'Ter autonomia real para decidir prioridades' },
    { id: 'avançar_competencias', label: 'Avançar nas competências certas para virar gestor no futuro' }
  ],
  lider: [
    { id: 'tempo_planejamento', label: 'Liberar tempo para planejar e pensar no futuro do time' },
    { id: 'reduzir_incendios', label: 'Reduzir tempo apagando incêndios e lidando com urgências' },
    { id: 'desenvolver_pessoas', label: 'Conseguir desenvolver melhor as pessoas da equipe' },
    { id: 'atingir_metas', label: 'Atingir metas sem se sentir sobrecarregado' }
  ],
  gestor: [
    { id: 'decisoes_estrategicas', label: 'Dedicar mais horas a decisões estratégicas de longo prazo' },
    { id: 'reduzir_pressao', label: 'Reduzir a pressão constante de urgências e política interna' },
    { id: 'clareza_performance', label: 'Obter clareza rápida sobre a performance da organização' },
    { id: 'equilibrar_vida', label: 'Equilibrar liderança intensa e vida pessoal/família' }
  ],
  empreendedor: [
    { id: 'vender_mais', label: 'Vender mais e crescer a receita de forma previsível' },
    { id: 'tempo_inovacao', label: 'Tirar tempo da operação para inovar e criar novas soluções' },
    { id: 'organizar_processos', label: 'Organizar processos que permitam escalar o negócio' },
    { id: 'equilibrar_empresa', label: 'Equilibrar empresa e vida pessoal sem culpa' }
  ]
};

// ═══════════════════════════════════════════════════════════════════
// 🔧 HANDLER DA API
// ═══════════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const profile = searchParams.get('profile');
    
    // Se não especificar perfil, retorna todas as opções globais
    if (!profile) {
      return NextResponse.json({
        profiles: Object.keys(LISTAS_POR_PERFIL),
        agenda: OPCOES_AGENDA,
        goals: [] // Goals dependem do perfil, não são globais
      });
    }
    
    // Se o perfil não existir, retornar erro
    if (!LISTAS_POR_PERFIL[profile as keyof typeof LISTAS_POR_PERFIL]) {
      return NextResponse.json(
        { error: 'Perfil não encontrado', profiles_available: Object.keys(LISTAS_POR_PERFIL) },
        { status: 400 }
      );
    }
    
    // Retornar listas específicas do perfil
    const perfilData = LISTAS_POR_PERFIL[profile as keyof typeof LISTAS_POR_PERFIL];
    const goalsData = GOALS_POR_PERFIL[profile as keyof typeof GOALS_POR_PERFIL];
    
    return NextResponse.json({
      profile,
      dores: perfilData.dores,
      atividades: perfilData.atividades,
      agenda: OPCOES_AGENDA,
      goals: goalsData || [] // Goals específicos do perfil
    });
    
  } catch (error) {
    console.error('Erro na API options:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}