// ═══════════════════════════════════════════════════════════════════
// 🧠 PRÉ-DIAGNÓSTICO - MOTOR DE HEURÍSTICA SIMPLIFICADO
// ═══════════════════════════════════════════════════════════════════
// Arquivo: src/lib/prediag-heuristics.ts
// Baseado no diagnostico-engine.ts existente, mas simplificado

// ═══════════════════════════════════════════════════════════════════
// 🎯 TIPOS E INTERFACES
// ═══════════════════════════════════════════════════════════════════

export interface PreDiagRespostas {
  profile: string;    // 'estudante', 'analista', 'lider', etc.
  agenda: string;     // 'sempre_lotada', 'freq_cheia', etc.
  pain: string;       // 'urgencias', 'reunioes', etc.
  topActivity: string; // 'emails', 'relatorios', etc.
  goal: string;       // 'mais_horas', 'priorizar', etc.
}

export interface MixResultado {
  essencial: number;   // %
  estrategico: number; // %
  tatico: number;      // %
  distracao: number;   // % (calculado)
}

export interface PreDiagResultado {
  mix: MixResultado;
  insight: string;
  sugestao: {
    acao: string;
    habito: string;
  };
  cenario: 'saudavel' | 'ajustes' | 'critico';
}

// ═══════════════════════════════════════════════════════════════════
// ⚙️ CONFIGURAÇÕES DAS HEURÍSTICAS (baseadas no Supabase)
// ═══════════════════════════════════════════════════════════════════

// Pesos por tipo de agenda
const AGENDA_WEIGHTS = {
  'sempre_lotada': { tatico: 25, estrategico: -10, essencial: -15 },
  'freq_cheia': { tatico: 15, estrategico: -5, essencial: -10 },
  'equilibrada': { tatico: 0, estrategico: 0, essencial: 0 },
  'livre': { tatico: -10, estrategico: 5, essencial: 10 }
} as const;

// Ajustes por tipo de dor principal
const PAIN_ADJUSTS = {
  'urgencias': { tatico: 15, estrategico: -10, essencial: -5 },
  'reunioes': { tatico: 10, essencial: -10, estrategico: 0 },
  'falta_clareza': { tatico: 10, essencial: -10, estrategico: 5 },
  'sem_tempo_estrategia': { estrategico: 15, tatico: -10, essencial: -5 },
  'sem_energia': { tatico: 15, estrategico: -10, essencial: -5 },
  'procrastinacao': { tatico: 12, essencial: -8, estrategico: -4 },
  'falta_direcionamento': { estrategico: 10, tatico: 5, essencial: -5 }
} as const;

// Ajustes por atividade que mais consome tempo
const ACTIVITY_ADJUSTS = {
  'emails': { tatico: 8, essencial: -5 },
  'reunioes_status': { tatico: 12, essencial: -8 },
  'relatorios': { tatico: 10, estrategico: -5 },
  'planejamento': { estrategico: 12, tatico: -8 },
  'execucao': { essencial: 10, tatico: -8 },
  'urgencias_demandas': { tatico: 15, estrategico: -10 },
  'redes_sociais': { tatico: 8, essencial: -12 },
  'estudos': { essencial: 12, tatico: -5 }
} as const;

// Viés leve por perfil profissional  
const PROFILE_BIAS = {
  'estudante': { essencial: 5, tatico: -3 },
  'estagiario': { tatico: 3, essencial: 2 },
  'analista': { tatico: 5, estrategico: -3 },
  'especialista': { essencial: 3, tatico: 3 },
  'lider': { estrategico: 5, tatico: 3 },
  'gestor': { estrategico: 8, tatico: 5 },
  'empreendedor': { tatico: 5, estrategico: 5 }
} as const;

// ═══════════════════════════════════════════════════════════════════
// 🧮 FUNÇÃO PRINCIPAL DE CÁLCULO DO MIX
// ═══════════════════════════════════════════════════════════════════

export function calcularMixPreDiagnostico(respostas: PreDiagRespostas): MixResultado {
  // Base inicial (distribuição neutra)
  let essencial = 45;   // Base próxima ao ideal (40-55%)
  let estrategico = 25; // Base no meio do ideal (20-30%)
  let tatico = 20;      // Base baixo do limite (0-25%)
  // distracao será calculado no final
  
  // 1️⃣ Aplicar peso da agenda
  const agendaWeight = AGENDA_WEIGHTS[respostas.agenda as keyof typeof AGENDA_WEIGHTS];
  if (agendaWeight) {
    tatico += agendaWeight.tatico;
    estrategico += agendaWeight.estrategico;
    essencial += agendaWeight.essencial;
  }
  
  // 2️⃣ Aplicar ajuste da dor principal
  const painAdjust = PAIN_ADJUSTS[respostas.pain as keyof typeof PAIN_ADJUSTS];
  if (painAdjust) {
    tatico += painAdjust.tatico;
    estrategico += painAdjust.estrategico || 0;
    essencial += painAdjust.essencial;
  }
  
  // 3️⃣ Aplicar ajuste da atividade dominante
  const activityAdjust = ACTIVITY_ADJUSTS[respostas.topActivity as keyof typeof ACTIVITY_ADJUSTS];
  if (activityAdjust) {
    tatico += activityAdjust.tatico;
    estrategico += activityAdjust.estrategico || 0;
    essencial += activityAdjust.essencial || 0;
  }
  
  // 4️⃣ Aplicar viés leve do perfil
  const profileBias = PROFILE_BIAS[respostas.profile as keyof typeof PROFILE_BIAS];
  if (profileBias) {
    tatico += profileBias.tatico || 0;
    estrategico += profileBias.estrategico || 0;
    essencial += profileBias.essencial || 0;
  }
  
  // 5️⃣ Normalizar e garantir limites
  essencial = Math.max(10, Math.min(70, essencial));
  estrategico = Math.max(5, Math.min(50, estrategico));
  tatico = Math.max(5, Math.min(50, tatico));
  
  // 6️⃣ Calcular distração e normalizar para 100%
  const soma = essencial + estrategico + tatico;
  const distracao = Math.max(5, 100 - soma);
  
  // Normalizar para sempre somar 100%
  const total = essencial + estrategico + tatico + distracao;
  const fator = 100 / total;
  
  return {
    essencial: Math.round(essencial * fator),
    estrategico: Math.round(estrategico * fator),
    tatico: Math.round(tatico * fator),
    distracao: Math.round(distracao * fator)
  };
}

// ═══════════════════════════════════════════════════════════════════
// 💡 GERAÇÃO DE INSIGHTS PERSONALIZADOS
// ═══════════════════════════════════════════════════════════════════

export function gerarInsight(respostas: PreDiagRespostas, mix: MixResultado): string {
  const { profile, pain, topActivity, goal } = respostas;
  
  // Determinar zona dominante
  const zonas = [
    { nome: 'Essencial', valor: mix.essencial },
    { nome: 'Estratégico', valor: mix.estrategico },
    { nome: 'Tático', valor: mix.tatico },
    { nome: 'Distração', valor: mix.distracao }
  ];
  
  const zonaDominante = zonas.reduce((prev, curr) => 
    curr.valor > prev.valor ? curr : prev
  );

  // Obter label legível do goal
  const goalLabels: Record<string, string> = {
    'melhorar_notas': 'melhorar suas notas',
    'rotina_estudos': 'criar uma rotina consistente',
    'reduzir_distracao': 'reduzir distrações',
    'tempo_projetos': 'ter mais tempo para projetos',
    'entregas_prazo': 'entregar tudo no prazo',
    'saber_priorizar': 'saber priorizar',
    'reduzir_retrabalho': 'reduzir retrabalho',
    'tempo_aprender': 'ter tempo para aprender',
    'equilibrar_tarefas': 'equilibrar operacional e estratégico',
    'reduzir_reunioes': 'reduzir reuniões improdutivas',
    'autonomia_decisoes': 'ter mais autonomia',
    'avançar_competencias': 'avançar na carreira',
    'tempo_planejamento': 'ter tempo para planejar',
    'reduzir_incendios': 'reduzir urgências',
    'desenvolver_pessoas': 'desenvolver sua equipe',
    'atingir_metas': 'atingir metas sem sobrecarga',
    'decisoes_estrategicas': 'focar no estratégico',
    'reduzir_pressao': 'reduzir pressão política',
    'clareza_performance': 'ter clareza dos resultados',
    'equilibrar_vida': 'equilibrar trabalho e vida',
    'vender_mais': 'vender mais',
    'tempo_inovacao': 'ter tempo para inovar',
    'organizar_processos': 'organizar processos',
    'equilibrar_empresa': 'equilibrar empresa e vida'
  };

  const goalTexto = goalLabels[goal] || goal;
  
  // Templates personalizados com goal
  const templates = {
    'Essencial': `Seu tempo está bem concentrado em atividades **essenciais** (${mix.essencial}%). Isso é positivo para ${goalTexto}, mas sua dor com "${pain}" pode estar atrapalhando. O foco está no lugar certo.`,
    
    'Estratégico': `Você investe ${mix.estrategico}% em atividades **estratégicas**. Para ${goalTexto}, isso pode ser bom no longo prazo, mas talvez precise de mais execução prática agora.`,
    
    'Tático': `Seu tempo está concentrado em tarefas **táticas** (${mix.tatico}%). Considerando seu objetivo de ${goalTexto}, há potencial para liberar **2-4h/semana** redirecionando esse foco.`,
    
    'Distração': `${mix.distracao}% do tempo está em atividades de **distração**. Para ${goalTexto}, esse é o primeiro ponto a atacar. Ganho potencial: **4-8h/semana** com foco direcionado.`
  };
  
  return templates[zonaDominante.nome as keyof typeof templates] || 
         `Sua distribuição atual (${mix.essencial}% Essencial, ${mix.tatico}% Tático) tem espaço para otimização considerando seu objetivo de ${goalTexto}.`;
}

// ═══════════════════════════════════════════════════════════════════
// 🎯 SUGESTÕES PRÁTICAS (TEASER DO SISTEMA COMPLETO)
// ═══════════════════════════════════════════════════════════════════

export function gerarSugestao(respostas: PreDiagRespostas, mix: MixResultado): { acao: string; habito: string } {
  const { pain, topActivity, goal } = respostas;
  
  // Mapear combinações mais comuns para sugestões práticas
  const sugestoes = {
    // Padrão: reuniões em excesso
    'reunioes_emails': {
      acao: 'Cancelar 1 reunião recorrente por semana e migrar para update assíncrono',
      habito: 'Blocos de "Deep Work" de 2h, 2x por semana, sem interrupções'
    },
    
    // Padrão: operacional demais
    'urgencias_relatorios': {
      acao: 'Criar template automatizado para 50% dos relatórios recorrentes',
      habito: 'Revisão semanal de 30min para consolidar dados operacionais'
    },
    
    // Padrão: falta de clareza
    'falta_clareza_emails': {
      acao: 'Implementar sistema de triage de e-mails: Responder/Arquivar/Delegar em 2min',
      habito: '"Top 3 do dia" definidos toda manhã em 10 minutos'
    },
    
    // Padrão: sem tempo para estratégia
    'sem_tempo_estrategia_planejamento': {
      acao: 'Consolidar status reports em formato assíncrono (eliminar 1-2 reuniões)',
      habito: 'Bloco estratégico de 90min toda sexta-feira de manhã'
    },
    
    // Padrão: procrastinação/energia
    'procrastinacao_redes_sociais': {
      acao: 'Configurar modo "foco" no celular durante horário de trabalho',
      habito: 'Técnica Pomodoro: 25min foco + 5min pausa, sem notificações'
    }
  };
  
  // Determinar padrão mais provável
  const padraoChave = `${pain}_${topActivity}`;
  const padraoEncontrado = sugestoes[padraoChave as keyof typeof sugestoes];
  
  if (padraoEncontrado) {
    return padraoEncontrado;
  }
  
  // Fallbacks por tipo de dor principal
  const fallbacks = {
    'urgencias': {
      acao: 'Estabelecer acordo de prioridade (SLA) com time para filtrar urgências reais',
      habito: 'Check-ins rápidos de 10min, 3x por semana, para antecipar problemas'
    },
    'reunioes': {
      acao: 'Implementar pauta objetiva: 3 itens + dono da decisão + tempo limite',
      habito: 'Bloco de 2h sem reuniões para execução (3x por semana)'
    },
    'procrastinacao': {
      acao: 'Dividir projetos grandes em tarefas de 25min (técnica Pomodoro)',
      habito: 'Ritual de início: 5min para definir foco + eliminar distrações'
    }
  };
  
  return fallbacks[pain as keyof typeof fallbacks] || {
    acao: 'Identificar a atividade que mais consome tempo e automatizar ou eliminar 25%',
    habito: 'Revisão semanal de 15min: o que funcionou + 1 ajuste para próxima semana'
  };
}

// ═══════════════════════════════════════════════════════════════════
// 📊 DETERMINAÇÃO DO CENÁRIO (SAUDÁVEL/AJUSTES/CRÍTICO)
// ═══════════════════════════════════════════════════════════════════

export function determinarCenario(mix: MixResultado): 'saudavel' | 'ajustes' | 'critico' {
  const leakage = mix.tatico + mix.distracao; // "Vazamento"
  
  // CRÍTICO: alto vazamento ou essencial muito baixo
  if (leakage >= 50 || mix.distracao > 25 || mix.essencial < 30) {
    return 'critico';
  }
  
  // SAUDÁVEL: dentro dos alvos ideais
  if (mix.essencial >= 40 && mix.distracao <= 15 && mix.tatico <= 25) {
    return 'saudavel';
  }
  
  // AJUSTES: casos intermediários
  return 'ajustes';
}

// ═══════════════════════════════════════════════════════════════════
// 🚀 FUNÇÃO PRINCIPAL - PROCESSAR PRÉ-DIAGNÓSTICO COMPLETO
// ═══════════════════════════════════════════════════════════════════

export function processarPreDiagnostico(respostas: PreDiagRespostas): PreDiagResultado {
  const mix = calcularMixPreDiagnostico(respostas);
  const insight = gerarInsight(respostas, mix);
  const sugestao = gerarSugestao(respostas, mix);
  const cenario = determinarCenario(mix);
  
  return {
    mix,
    insight,
    sugestao,
    cenario
  };
}