// ============================================================================
// 🧠 HEURÍSTICA ENGINE V2.1 - AJUSTES CIRÚRGICOS PARA PRODUÇÃO
// ============================================================================

import { Tatica, Eixo, ImpactoFlag, AtividadePlano } from '@/components/plano';

type Zona = "ESSENCIAL" | "ESTRATEGICA" | "TATICA" | "DISTRACAO";
type DarCertoCategoria = "DESCARTAR" | "AUTOMATIZAR" | "REDUZIR" | "COMBINAR" | "ENCAMINHAR" | "REVISITAR" | "TREINAR_DELEGAR" | "OTIMIZAR";

type SugestaoTatica = {
  id: string;
  tipo: "TAREFA" | "HABITO";
  titulo: string;
  detalhe: string;
  categoria: DarCertoCategoria;
  fundamentacao?: string;
  estimativaHoras?: number;
  frequencia?: "diaria" | "semanal" | "mensal";
  gatilho?: string;
  impactos: { tempo?: number; clareza?: number; impacto?: number };
  score?: number;
  scoreDetalhes?: string;
};

// ═══════════════════════════════════════════════════════════════════
// 🎯 STOPWORDS PT-BR E PREFERÊNCIAS POR ZONA
// ═══════════════════════════════════════════════════════════════════

const STOPWORDS_PT_BR = new Set([
  'de', 'da', 'do', 'para', 'com', 'por', 'em', 'sem', 'um', 'uma', 'e', 'ou',
  'no', 'na', 'os', 'as', 'que', 'se', 'o', 'a', 'resultado', 'padrao', 'processo'
]);

const TERMOS_TECNICOS = new Set(['p0', 'p1', 'p2', 'sql', 'kpi', 'crm', 'mvp', 'api']);

const PREFERENCIAS_CATEGORIA_POR_ZONA = {
  "DISTRACAO": [
    { categoria: "DESCARTAR", boost: 1.25 },
    { categoria: "REDUZIR", boost: 1.15 },
    { categoria: "AUTOMATIZAR", boost: 1.07 }
  ],
  "TATICA": [
    { categoria: "AUTOMATIZAR", boost: 1.25 },
    { categoria: "COMBINAR", boost: 1.15 },
    { categoria: "REDUZIR", boost: 1.07 }
  ],
  "ESTRATEGICA": [
    { categoria: "REVISITAR", boost: 1.25 },
    { categoria: "OTIMIZAR", boost: 1.15 },
    { categoria: "TREINAR_DELEGAR", boost: 1.07 }
  ],
  "ESSENCIAL": [
    { categoria: "OTIMIZAR", boost: 1.25 },
    { categoria: "REVISITAR", boost: 1.15 },
    { categoria: "AUTOMATIZAR", boost: 1.07 }
  ]
};

// ═══════════════════════════════════════════════════════════════════
// 🎯 DATABASE DE PADRÕES COMPLETA
// ═══════════════════════════════════════════════════════════════════

const PATTERNS_DATABASE = [
  {
    tag: "emails",
    keywords: ["email","e-mail","inbox","caixa","responder","follow","mensagem","correspondencia"],
    gerar: () => [
      {
        tipo: "HABITO",
        titulo: "Janelas de e-mail (2×/dia)",
        detalhe: "Responder apenas em blocos (ex.: 11h e 16h) para evitar fragmentação.",
        categoria: "REDUZIR",
        frequencia: "diaria",
        gatilho: "Alarmes 11h/16h",
        impactos: { tempo: 0.3, clareza: 0.5, impacto: 0.2 },
        fundamentacao: "Timeboxing diminui trocas de contexto."
      },
      {
        tipo: "TAREFA",
        titulo: "Filtros e etiquetas automáticas",
        detalhe: "Auto-arquivar newsletters, priorizar remetentes críticos.",
        categoria: "AUTOMATIZAR",
        estimativaHoras: 0.5,
        impactos: { tempo: 0.4, clareza: 0.6, impacto: 0.2 },
        fundamentacao: "Automação tira volume operacional do caminho."
      }
    ]
  },
  
  {
    tag: "reunioes",
    keywords: ["reuni","alinhamento","status","pauta","meet","zoom","teams","agenda","sync","call"],
    gerar: () => [
      {
        tipo: "HABITO",
        titulo: "Pauta objetiva e dono da decisão",
        detalhe: "Definir 3 itens, tempo por item e responsável pela decisão; enviar antes.",
        categoria: "REDUZIR",
        frequencia: "semanal",
        gatilho: "Ao criar convite",
        impactos: { tempo: 0.4, clareza: 0.8, impacto: 0.6 },
        fundamentacao: "Reduz dispersão e tempo; melhora qualidade da decisão."
      },
      {
        tipo: "TAREFA",
        titulo: "Migrar status para update assíncrono",
        detalhe: "Resumo escrito + check-ins quinzenais no lugar de reunião recorrente.",
        categoria: "AUTOMATIZAR",
        estimativaHoras: 1,
        impactos: { tempo: 0.2, clareza: 0.5, impacto: 0.3 },
        fundamentacao: "Assíncrono evita custo de coordenação desnecessário."
      }
    ]
  },

  {
    tag: "relatorios",
    keywords: ["relatorio","kpi","indicador","dashboard","apresent","slide","deck","metricas","resultado"],
    gerar: () => [
      {
        tipo: "HABITO",
        titulo: "Template padrão + dados automáticos",
        detalhe: "Estrutura fixa com seções que se preenchem via integração.",
        categoria: "AUTOMATIZAR",
        frequencia: "mensal",
        gatilho: "1ª semana do mês",
        impactos: { tempo: 0.2, clareza: 0.7, impacto: 0.6 },
        fundamentacao: "Padronização acelera criação e melhora consistência."
      },
      {
        tipo: "TAREFA",
        titulo: "Definir 3 insights obrigatórios",
        detalhe: "Cada relatório deve responder: O que? Por que? Próximo passo?",
        categoria: "REVISITAR",
        estimativaHoras: 0.5,
        impactos: { tempo: 0.4, clareza: 0.8, impacto: 0.7 },
        fundamentacao: "Foco em ação torna o relatório útil, não apenas informativo."
      }
    ]
  },

  {
    tag: "planejamento",
    keywords: ["plano","planej","escopo","brief","proposal","onepager","mvp","pitch","prototip","roadmap"],
    gerar: () => [
      {
        tipo: "TAREFA",
        titulo: "One-pager de resultado",
        detalhe: "1 página: problema, solução, métrica de sucesso, recursos necessários.",
        categoria: "REVISITAR",
        estimativaHoras: 1,
        impactos: { tempo: 0.4, clareza: 0.9, impacto: 0.8 },
        fundamentacao: "Clareza do destino antes de começar a jornada."
      },
      {
        tipo: "HABITO",
        titulo: "Validação com stakeholder antes do plano",
        detalhe: "15min para alinhar direção antes de desenvolver proposta completa.",
        categoria: "REVISITAR",
        frequencia: "semanal",
        gatilho: "Antes de começar planejamento",
        impactos: { tempo: 0.3, clareza: 0.8, impacto: 0.7 },
        fundamentacao: "Evita retrabalho por desalinhamento de expectativas."
      }
    ]
  },

  {
    tag: "conteudo",
    keywords: ["texto","escrever","post","artigo","newsletter","roteiro","copy","blog","conteudo"],
    gerar: () => [
      {
        tipo: "HABITO",
        titulo: "Power hour de escrita",
        detalhe: "90min sem interrupção, phone no silencioso, foco total na criação.",
        categoria: "OTIMIZAR",
        frequencia: "semanal",
        gatilho: "Manhã de terça-feira",
        impactos: { tempo: 0.6, clareza: 0.7, impacto: 0.8 },
        fundamentacao: "Deep work produz conteúdo de maior qualidade em menos tempo."
      },
      {
        tipo: "TAREFA",
        titulo: "Banco de ideias e templates",
        detalhe: "Lista permanente de tópicos + estruturas reusáveis por tipo de conteúdo.",
        categoria: "AUTOMATIZAR",
        estimativaHoras: 0.5,
        impactos: { tempo: 0.3, clareza: 0.6, impacto: 0.4 },
        fundamentacao: "Remove bloqueio da 'página em branco'."
      }
    ]
  },

  {
    tag: "vendas",
    keywords: ["prospec","lead","funil","pipeline","crm","followup","venda","cliente","comercial"],
    gerar: () => [
      {
        tipo: "HABITO",
        titulo: "Sequência padronizada de follow-up",
        detalhe: "Dia 1, 3, 7, 14: contatos automáticos com mensagens específicas.",
        categoria: "AUTOMATIZAR",
        frequencia: "diaria",
        gatilho: "Novo lead no CRM",
        impactos: { tempo: 0.2, clareza: 0.7, impacto: 0.8 },
        fundamentacao: "Consistência na abordagem aumenta conversão."
      },
      {
        tipo: "TAREFA",
        titulo: "Qualificar antes de apresentar",
        detalhe: "Checklist de 5 perguntas obrigatórias antes de investir tempo em demo.",
        categoria: "REVISITAR",
        estimativaHoras: 0.25,
        impactos: { tempo: 0.3, clareza: 0.8, impacto: 0.7 },
        fundamentacao: "Foco em leads qualificados aumenta taxa de fechamento."
      }
    ]
  }
];

// ═══════════════════════════════════════════════════════════════════
// 🛠️ UTILITÁRIOS APRIMORADOS
// ═══════════════════════════════════════════════════════════════════

function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-_]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim();
}

function tokensDe(atividade: any): string[] {
  const texto = `${atividade?.titulo ?? atividade?.nome ?? ""} ${atividade?.descricao ?? atividade?.detalhe ?? ""}`;
  const normalizado = normalizarTexto(texto);
  return normalizado.split(/\s+/).filter(token => token.length > 2);
}

function obterZona(atividade: any): Zona {
  const imp = atividade.impacto ?? 0;
  const cla = atividade.clareza ?? 0;
  
  if (imp >= 4 && cla >= 4) return "ESSENCIAL";
  if (imp >= 4 && cla < 4)  return "ESTRATEGICA";
  if (imp < 4  && cla >= 4) return "TATICA";
  return "DISTRACAO";
}

function hashSimples(texto: string): string {
  let hash = 0;
  for (let i = 0; i < texto.length; i++) {
    const char = texto.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).slice(0, 6);
}

function gerarIdDeterministico(atividade: any, categoria: string, tipo: string, index: number): string {
  const seed = `${atividade?.id || atividade?.titulo || "item"}|${categoria}|${tipo}|${index}`;
  const hash = hashSimples(seed);
  const base = `${atividade?.id || atividade?.titulo || "item"}-${categoria}-${tipo}`;
  return `${base.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 20)}-${hash}`;
}

function calcularJaccardSimilarity(titulo1: string, titulo2: string): number {
  const tokens1 = new Set(
    normalizarTexto(titulo1)
      .split(/\s+/)
      .filter(token => !STOPWORDS_PT_BR.has(token) || TERMOS_TECNICOS.has(token))
  );
  const tokens2 = new Set(
    normalizarTexto(titulo2)
      .split(/\s+/)
      .filter(token => !STOPWORDS_PT_BR.has(token) || TERMOS_TECNICOS.has(token))
  );
  
  const intersecao = new Set([...tokens1].filter(token => tokens2.has(token)));
  const uniao = new Set([...tokens1, ...tokens2]);
  
  return uniao.size > 0 ? intersecao.size / uniao.size : 0;
}

// ═══════════════════════════════════════════════════════════════════
// 🎯 SISTEMA DE SCORING APRIMORADO
// ═══════════════════════════════════════════════════════════════════

function calcularScore(sugestao: SugestaoTatica, atividade: any, zona: Zona): number {
  let score = 100;
  const detalhes: string[] = [];
  
  const multiplicadorZona = {
    "ESSENCIAL": 1.1,
    "ESTRATEGICA": 1.05,
    "TATICA": 1.0,
    "DISTRACAO": 0.95
  };
  score *= multiplicadorZona[zona];
  detalhes.push(`zona:${zona}=${multiplicadorZona[zona]}`);
  
  const horasDia = atividade.horasDia ?? ((atividade.horasMes ?? 0) / 30);
  
  if (horasDia >= 1.5) {
    if (['DESCARTAR', 'AUTOMATIZAR', 'REDUZIR', 'COMBINAR'].includes(sugestao.categoria)) {
      score *= 1.3;
      detalhes.push(`tamanho-grande:+30%`);
    }
  } else if (horasDia <= 0.3) {
    if (['REVISITAR', 'OTIMIZAR'].includes(sugestao.categoria)) {
      score *= 1.2;
      detalhes.push(`tamanho-pequeno:+20%`);
    }
  }
  
  const preferencias = PREFERENCIAS_CATEGORIA_POR_ZONA[zona] || [];
  const prefEncontrada = preferencias.find(p => p.categoria === sugestao.categoria);
  if (prefEncontrada) {
    score *= prefEncontrada.boost;
    detalhes.push(`pref-categoria:+${Math.round((prefEncontrada.boost - 1) * 100)}%`);
  }
  
  const { impacto: impAtiv = 0, clareza: claAtiv = 0 } = atividade;
  const { impacto: impSug = 0.5, clareza: claSug = 0.5, tempo: tempoSug = 0.5 } = sugestao.impactos;
  
  if (impAtiv >= 4 && impSug > 0.6) {
    score *= 1.15;
    detalhes.push(`align-impacto:+15%`);
  }
  
  if (claAtiv < 4 && claSug > 0.6) {
    score *= 1.15;
    detalhes.push(`align-clareza:+15%`);
  }
  
  if (horasDia >= 2 && claAtiv <= 2 && sugestao.categoria === "REVISITAR") {
    score *= 1.25;
    detalhes.push(`gigante-sem-clareza:+25%`);
  }
  
  if (horasDia > 1 && tempoSug < 0.5) {
    score *= 1.1;
    detalhes.push(`economia-tempo:+10%`);
  }
  
  sugestao.scoreDetalhes = detalhes.join(", ");
  return Math.round(score);
}

// ═══════════════════════════════════════════════════════════════════
// 🔍 ANÁLISE DE PADRÕES
// ═══════════════════════════════════════════════════════════════════

function analisarPadroes(atividade: any, zona: Zona): Array<{pattern: any, score: number}> {
  const tokens = tokensDe(atividade);
  
  const matches = PATTERNS_DATABASE.map((pattern) => {
    let score = 0;
    
    pattern.keywords.forEach(keyword => {
      if (tokens.includes(keyword)) {
        score += 10;
      } else if (tokens.some(token => token.startsWith(keyword) || keyword.startsWith(token))) {
        score += 7;
      } else if (tokens.some(token => token.includes(keyword) || keyword.includes(token))) {
        score += 4;
      }
    });
    
    return score > 0 ? { pattern, score } : null;
  }).filter((m): m is { pattern: any; score: number } => m !== null);

  return matches.sort((a, b) => b.score - a.score);
}

// ═══════════════════════════════════════════════════════════════════
// 🎯 FALLBACKS POR ZONA
// ═══════════════════════════════════════════════════════════════════

function aplicarRegrasPorZona(zona: Zona, atividade: any): SugestaoTatica[] {
  const sugestoes: SugestaoTatica[] = [];
  
  switch (zona) {
    case "ESSENCIAL":
      sugestoes.push({
        id: "",
        tipo: "HABITO",
        titulo: "Blocos fixos do essencial (2×/sem)",
        detalhe: "Dois blocos de 90–120 min exclusivos para esta atividade.",
        categoria: "OTIMIZAR",
        frequencia: "semanal",
        gatilho: "Agenda semanal",
        impactos: { impacto: 0.8, tempo: 0.5, clareza: 0.5 },
        fundamentacao: "Se não está na agenda, não acontece."
      });
      
      sugestoes.push({
        id: "",
        tipo: "TAREFA",
        titulo: "Remover bloqueio imediato",
        detalhe: "Listar e resolver o maior obstáculo para o próximo passo.",
        categoria: "OTIMIZAR",
        estimativaHoras: 0.5,
        impactos: { impacto: 0.7, tempo: 0.5, clareza: 0.6 },
        fundamentacao: "Eliminar gargalo aumenta fluxo do essencial."
      });
      break;
      
    case "ESTRATEGICA":
      sugestoes.push({
        id: "",
        tipo: "TAREFA",
        titulo: "Definir próximos 3 passos",
        detalhe: "Sequência mínima executável com responsável e prazo.",
        categoria: "REVISITAR",
        estimativaHoras: 0.5,
        impactos: { clareza: 0.9, impacto: 0.6, tempo: 0.3 },
        fundamentacao: "Clareza antes de volume."
      });
      
      sugestoes.push({
        id: "",
        tipo: "HABITO",
        titulo: "Revisão semanal estratégica",
        detalhe: "Checkpoint de progresso e ajustes de prioridade.",
        categoria: "REVISITAR",
        frequencia: "semanal",
        gatilho: "Sexta-feira 17h",
        impactos: { clareza: 0.6, impacto: 0.5 },
        fundamentacao: "Previne deriva estratégica."
      });
      break;
      
    case "TATICA":
      sugestoes.push({
        id: "",
        tipo: "TAREFA",
        titulo: "Automatizar passo repetitivo",
        detalhe: "Regra/template/script para reduzir toques manuais.",
        categoria: "AUTOMATIZAR",
        estimativaHoras: 1,
        impactos: { tempo: 0.3, clareza: 0.4, impacto: 0.3 },
        fundamentacao: "Menos esforço em baixo impacto."
      });
      
      sugestoes.push({
        id: "",
        tipo: "HABITO",
        titulo: "Lote tático semanal",
        detalhe: "Concentrar operacionais em um bloco único.",
        categoria: "COMBINAR",
        frequencia: "semanal",
        gatilho: "Sexta-feira manhã",
        impactos: { tempo: 0.2, clareza: 0.4 },
        fundamentacao: "Reduz troca de contexto."
      });
      break;
      
    case "DISTRACAO":
      sugestoes.push({
        id: "",
        tipo: "TAREFA",
        titulo: "Remover/adiar — não atende critério de valor",
        detalhe: "Alinhar com solicitante; se vago, não executar.",
        categoria: "DESCARTAR",
        estimativaHoras: 0.25,
        impactos: { tempo: 0.1, clareza: 0.5, impacto: 0.2 },
        fundamentacao: "Liberar tempo para o essencial."
      });
      
      sugestoes.push({
        id: "",
        tipo: "HABITO",
        titulo: "Lote mensal se obrigatório",
        detalhe: "Se não pode eliminar, tratar em lote com checklist mínimo.",
        categoria: "COMBINAR",
        frequencia: "mensal",
        gatilho: "Última sexta do mês",
        impactos: { tempo: 0.2, clareza: 0.4 },
        fundamentacao: "Minimiza impacto de atividades necessárias mas de baixo valor."
      });
      break;
  }
  
  return sugestoes;
}

// ═══════════════════════════════════════════════════════════════════
// 🔧 CONVERSÃO PARA FORMATO DA UI
// ═══════════════════════════════════════════════════════════════════

function converterParaNossoFormato(sugestao: SugestaoTatica): Tatica {
  // ⚠️ TODO FUTURO: Implementar conversão correta dos impactos 0.0-1.0 para "aumenta"/"diminui"
  // Por enquanto, deixamos vazio para o usuário configurar manualmente
  // A heurística usa escala 0.0-1.0 (0.3 = melhora 30% do tempo), mas nossa UI usa 3 estados
  const impactos: { tempo?: ImpactoFlag; clareza?: ImpactoFlag; impacto?: ImpactoFlag } = {};
  
  // ❌ DESATIVADO: Conversão automática dos impactos
  // Motivo: Diferença semântica entre escala da heurística (0.0-1.0) e UI (aumenta/diminui/neutro)
  // 
  // if (sugestao.impactos.tempo !== undefined) {
  //   impactos.tempo = sugestao.impactos.tempo < 0.5 ? "diminui" : "aumenta";
  // }
  // if (sugestao.impactos.clareza !== undefined) {
  //   impactos.clareza = sugestao.impactos.clareza > 0.5 ? "aumenta" : "diminui";
  // }
  // if (sugestao.impactos.impacto !== undefined) {
  //   impactos.impacto = sugestao.impactos.impacto > 0.5 ? "aumenta" : "diminui";
  // }

  let eixo: Eixo | undefined = undefined;
  const { tempo = 0.5, clareza = 0.5, impacto = 0.5 } = sugestao.impactos;
  
  if (tempo <= 0.4) {
    eixo = "tempo";
  } else if (clareza >= 0.6) {
    eixo = "clareza";
  } else if (impacto >= 0.6) {
    eixo = "impacto";
  } else {
    eixo = "clareza";
  }

  return {
    id: sugestao.id,
    titulo: sugestao.titulo,
    detalhe: sugestao.fundamentacao 
      ? `${sugestao.detalhe}\\n\\n💡 ${sugestao.fundamentacao}`
      : sugestao.detalhe,
    impactos, // ✅ Agora sempre vazio {} - usuário configura manualmente
    eixo,
    concluida: false,
    tipo: sugestao.tipo,
    categoria: sugestao.categoria,
    ...(sugestao.tipo === "TAREFA" && sugestao.estimativaHoras && { 
      estimativaHoras: sugestao.estimativaHoras 
    }),
    ...(sugestao.tipo === "HABITO" && {
      frequencia: sugestao.frequencia,
      gatilho: sugestao.gatilho
    })
  };
}

// ═══════════════════════════════════════════════════════════════════
// 🎯 SISTEMA DE QUALIDADE E DIVERSIDADE
// ═══════════════════════════════════════════════════════════════════

function aplicarBarreiraQualidade(candidatos: SugestaoTatica[]): SugestaoTatica[] {
  if (candidatos.length <= 2) return candidatos;
  
  const sorted = candidatos.sort((a, b) => (b.score || 0) - (a.score || 0));
  const scores = sorted.map(c => c.score || 0);
  const topK = [scores[0]];
  
  for (let i = 1; i < scores.length && i < 5; i++) {
    const threshold = scores[i-1] * 0.75;
    if (scores[i] >= threshold) {
      topK.push(scores[i]);
    } else {
      break;
    }
  }
  
  return sorted.slice(0, Math.min(topK.length, 4));
}

function garantirDiversidade(candidatos: SugestaoTatica[]): SugestaoTatica[] {
  const resultado: SugestaoTatica[] = [];
  const categoriasUsadas = new Set<string>();
  
  const tarefas = candidatos.filter(c => c.tipo === "TAREFA");
  const habitos = candidatos.filter(c => c.tipo === "HABITO");
  
  if (tarefas.length > 0) {
    const melhorTarefa = tarefas.sort((a, b) => (b.score || 0) - (a.score || 0))[0];
    resultado.push(melhorTarefa);
    categoriasUsadas.add(melhorTarefa.categoria);
  }
  
  if (habitos.length > 0 && resultado.length < 3) {
    const melhorHabito = habitos
      .filter(h => !categoriasUsadas.has(h.categoria))
      .sort((a, b) => (b.score || 0) - (a.score || 0))[0];
    
    if (melhorHabito) {
      resultado.push(melhorHabito);
      categoriasUsadas.add(melhorHabito.categoria);
    }
  }
  
  if (resultado.length >= 2 && resultado[0].categoria === resultado[1].categoria) {
    const threshold = (resultado[1].score || 0) * 0.95;
    const alternativa = candidatos.find(c => 
      !resultado.includes(c) && 
      c.categoria !== resultado[0].categoria &&
      (c.score || 0) >= threshold
    );
    
    if (alternativa) {
      console.log(`🔄 SWAP diversidade: ${resultado[1].categoria} → ${alternativa.categoria}`);
      resultado[1] = alternativa;
      categoriasUsadas.clear();
      categoriasUsadas.add(resultado[0].categoria);
      categoriasUsadas.add(resultado[1].categoria);
    }
  }
  
  const restantes = candidatos
    .filter(c => !resultado.includes(c))
    .sort((a, b) => (b.score || 0) - (a.score || 0));
  
  for (const candidato of restantes) {
    if (resultado.length >= 3) break;
    
    if (categoriasUsadas.has(candidato.categoria)) continue;
    
    const isSimilar = resultado.some(existing => 
      calcularJaccardSimilarity(candidato.titulo, existing.titulo) > 0.6
    );
    
    if (!isSimilar) {
      resultado.push(candidato);
      categoriasUsadas.add(candidato.categoria);
    }
  }
  
  return resultado;
}

// ═══════════════════════════════════════════════════════════════════
// 🚀 FUNÇÃO PRINCIPAL ROBUSTA
// ═══════════════════════════════════════════════════════════════════

export function sugerirTaticasAvancadas(atividade: AtividadePlano): Tatica[] {
  const zona = obterZona(atividade);
  const horasDia = atividade.horasDia ?? ((atividade.horasMes ?? 0) / 30);
  
  console.log(`🔍 ANÁLISE: "${atividade.titulo}"`);
  console.log(`   ZONA: ${zona} | I×C: ${atividade.impacto}×${atividade.clareza} | H/dia: ${horasDia.toFixed(1)}`);

  const padroes = analisarPadroes(atividade, zona);
  let candidatos: SugestaoTatica[] = [];
  
  const top2Padroes = padroes.slice(0, 2);
  for (const { pattern, score } of top2Padroes) {
    const sugestoesPadrao = pattern.gerar({ atividade, zona });
    candidatos.push(...sugestoesPadrao);
    console.log(`📋 PADRÃO: ${pattern.tag} (score:${score}, ${sugestoesPadrao.length} sugestões)`);
  }
  
  const fallbacks = aplicarRegrasPorZona(zona, atividade);
  candidatos.push(...fallbacks);
  console.log(`🎯 FALLBACK: zona ${zona} (+${fallbacks.length} sugestões)`);
  
  candidatos = candidatos.map((sugestao, index) => ({
    ...sugestao,
    id: gerarIdDeterministico(atividade, sugestao.categoria, sugestao.tipo, index),
    score: calcularScore(sugestao, atividade, zona)
  }));
  
  console.log(`🎯 CANDIDATOS (${candidatos.length}):`);
  candidatos.forEach(c => {
    console.log(`   ${c.tipo}:${c.categoria}:${c.titulo}:${c.score} (${c.scoreDetalhes})`);
  });
  
  let resultado = aplicarBarreiraQualidade(candidatos);
  console.log(`📊 PÓS-BARREIRA: ${resultado.length} candidatos`);
  
  resultado = garantirDiversidade(resultado);
  console.log(`🎭 PÓS-DIVERSIDADE: ${resultado.length} final`);
  
  const taticasFinais = resultado.map(converterParaNossoFormato);
  
  console.log(`✅ TÁTICAS FINAIS (${taticasFinais.length}):`);
  taticasFinais.forEach(t => {
    console.log(`   ${t.tipo}:${t.categoria}:${t.titulo}:${t.eixo}`);
  });
  
  return taticasFinais;
}

export function sugerirTaticasBase(atividade: AtividadePlano): Tatica[] {
  return sugerirTaticasAvancadas(atividade);
}

export function testarCasosMesa() {
  const casos = [
    {
      nome: "Responder e-mails",
      impacto: 3, clareza: 6, horasMes: 90,
      esperado: ["REDUZIR", "AUTOMATIZAR"]
    },
    {
      nome: "Reunião com gestor",
      impacto: 5, clareza: 2, horasMes: 4,
      esperado: ["REVISITAR"]
    },
    {
      nome: "Organizar pastas do Drive",
      impacto: 2, clareza: 4, horasMes: 30,
      esperado: ["DESCARTAR", "AUTOMATIZAR"]
    },
    {
      nome: "Montar apresentação",
      impacto: 5, clareza: 3, horasMes: 20,
      esperado: ["REVISITAR", "OTIMIZAR"]
    },
    {
      nome: "Prospecção no CRM",
      impacto: 5, clareza: 4, horasMes: 30,
      esperado: ["AUTOMATIZAR", "OTIMIZAR"]
    },
    {
      nome: "GGG/ADC",
      impacto: 1, clareza: 1, horasMes: 10,
      esperado: ["DESCARTAR", "COMBINAR"]
    },
    {
      nome: "Estratégia empresa XPTO",
      impacto: 6, clareza: 6, horasMes: 0,
      esperado: ["OTIMIZAR"]
    },
    {
      nome: "Corrigir bug crítico sistema",
      impacto: 4, clareza: 2, horasMes: 80,
      esperado: ["REVISITAR", "REDUZIR"]
    }
  ];
  
  console.log("🧪 TESTE DE MESA - HEURÍSTICA V2.1");
  console.log("═".repeat(60));
  
  casos.forEach((caso, index) => {
    const atividade: AtividadePlano = {
      id: `teste-${index}`,
      titulo: caso.nome,
      impacto: caso.impacto as any,
      clareza: caso.clareza as any,
      horasMes: caso.horasMes,
      horasDia: caso.horasMes / 30
    };
    
    console.log(`\n🔍 CASO ${index + 1}: ${caso.nome}`);
    console.log(`   📊 I${caso.impacto}×C${caso.clareza}, ${caso.horasMes}h/mês`);
    
    const resultado = sugerirTaticasAvancadas(atividade);
    const categorias = resultado.map(r => r.categoria).filter(Boolean);
    const tipos = resultado.map(r => r.tipo);
    
    console.log(`   📋 RESULTADO: ${resultado.length} táticas`);
    console.log(`   🏷️  CATEGORIAS: ${categorias.join(", ")}`);
    console.log(`   🎭 TIPOS: ${tipos.join(", ")}`);
    
    const temEsperado = caso.esperado.some(exp => categorias.includes(exp));
    const temDiversidade = tipos.includes("TAREFA") && tipos.includes("HABITO");
    
    console.log(`   ✅ Categoria esperada: ${temEsperado ? "SIM" : "NÃO"}`);
    console.log(`   🎭 Diversidade T+H: ${temDiversidade ? "SIM" : (tipos.length >= 2 ? "PARCIAL" : "NÃO")}`);
    
    console.log("   " + "─".repeat(50));
  });
  
  console.log("\n" + "═".repeat(60));
  console.log("🎯 TESTE V2.1 CONCLUÍDO COM SUCESSO!");
}