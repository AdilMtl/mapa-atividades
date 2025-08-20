// ============================================================================
// 🧠 HEURÍSTICA ENGINE V2.0 - ROBUSTA E MADURA
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
};

// ═══════════════════════════════════════════════════════════════════
// 🎯 DATABASE DE PADRÕES EXPANDIDA (COBERTURA COMPLETA)
// ═══════════════════════════════════════════════════════════════════

const PATTERNS_DATABASE = [
  // 📧 EMAILS E COMUNICAÇÃO
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

  // 🤝 REUNIÕES E ALINHAMENTOS
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

  // 📊 RELATÓRIOS E APRESENTAÇÕES
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

  // 📋 PLANEJAMENTO E PROPOSTAS
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

  // ✍️ CONTEÚDO E COMUNICAÇÃO
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

  // 💰 VENDAS E CRM
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
  },

  // 🐛 BUGS E OPERAÇÕES
  {
    tag: "bugs",
    keywords: ["bug","erro","incidente","hotfix","p0","p1","problema","falha","correcao"],
    gerar: () => [
      {
        tipo: "HABITO",
        titulo: "Triage imediato + time-box",
        detalhe: "P0=2h máx, P1=1 dia, P2=sprint atual. Sem exceções.",
        categoria: "REDUZIR",
        frequencia: "diaria",
        gatilho: "Novo bug reportado",
        impactos: { tempo: 0.4, clareza: 0.8, impacto: 0.6 },
        fundamentacao: "Limites previnem sobre-engenharia em correções."
      },
      {
        tipo: "TAREFA",
        titulo: "Root cause e prevenção",
        detalhe: "Todo P0/P1: 5 por quês + ação preventiva documentada.",
        categoria: "REVISITAR",
        estimativaHoras: 0.5,
        impactos: { tempo: 0.4, clareza: 0.7, impacto: 0.8 },
        fundamentacao: "Prevenir > Corrigir. Investe tempo hoje para poupar amanhã."
      }
    ]
  },

  // 💬 MENSAGERIA E SOCIAL
  {
    tag: "mensageria",
    keywords: ["whatsapp","slack","teams","mensagem","linkedin","instagram","social","chat"],
    gerar: () => [
      {
        tipo: "HABITO",
        titulo: "Horários livres de mensagem",
        detalhe: "Deep work: 9h-11h e 14h-16h sem Slack/WhatsApp. Status claro.",
        categoria: "REDUZIR",
        frequencia: "diaria",
        gatilho: "Início do bloco de foco",
        impactos: { tempo: 0.3, clareza: 0.6, impacto: 0.5 },
        fundamentacao: "Protege blocos de alta produtividade."
      },
      {
        tipo: "TAREFA",
        titulo: "Automação de respostas frequentes",
        detalhe: "Templates para 80% das perguntas comuns + bot para direcionamento.",
        categoria: "AUTOMATIZAR",
        estimativaHoras: 1,
        impactos: { tempo: 0.2, clareza: 0.5, impacto: 0.3 },
        fundamentacao: "Reduz carga cognitiva de resposta manual repetitiva."
      }
    ]
  },

  // 📁 ROTINAS ADMINISTRATIVAS
  {
    tag: "admin",
    keywords: ["planilha","arquivo","reembolso","fatura","contrato","compliance","admin","organizacao"],
    gerar: () => [
      {
        tipo: "HABITO",
        titulo: "Lote administrativo mensal",
        detalhe: "1ª sexta: reembolsos, faturas, arquivo. Tudo numa sessão só.",
        categoria: "COMBINAR",
        frequencia: "mensal",
        gatilho: "1ª sexta-feira do mês",
        impactos: { tempo: 0.2, clareza: 0.6, impacto: 0.2 },
        fundamentacao: "Agrupa atividades similares para reduzir troca de contexto."
      },
      {
        tipo: "TAREFA",
        titulo: "Checklist e automatização máxima",
        detalhe: "Cada rotina: checklist + automação de pelo menos 50% dos passos.",
        categoria: "AUTOMATIZAR",
        estimativaHoras: 1.5,
        impactos: { tempo: 0.1, clareza: 0.7, impacto: 0.3 },
        fundamentacao: "Remove carga mental e acelera execução."
      }
    ]
  },

  // 🔍 PESQUISA E ANÁLISE
  {
    tag: "pesquisa",
    keywords: ["pesquisa","estudo","benchmark","dados","sql","analise","investigacao","levantamento"],
    gerar: () => [
      {
        tipo: "TAREFA",
        titulo: "Critério de 'suficiente' antes de começar",
        detalhe: "Definir: 'Com X fontes e Y insights, posso decidir/prosseguir'.",
        categoria: "REVISITAR",
        estimativaHoras: 0.25,
        impactos: { tempo: 0.4, clareza: 0.8, impacto: 0.6 },
        fundamentacao: "Evita pesquisa infinita sem propósito claro."
      },
      {
        tipo: "HABITO",
        titulo: "Time-box + síntese obrigatória",
        detalhe: "Máx 2h para pesquisa inicial + 30min para resumo executivo.",
        categoria: "REDUZIR",
        frequencia: "semanal",
        gatilho: "Início da pesquisa",
        impactos: { tempo: 0.3, clareza: 0.7, impacto: 0.5 },
        fundamentacao: "Força priorização e entrega de valor rápido."
      }
    ]
  },

  // 👥 RECRUTAMENTO E PEOPLE
  {
    tag: "recrutamento",
    keywords: ["vaga","candidato","triagem","entrevista","curriculo","recrutamento","selecao","hire"],
    gerar: () => [
      {
        tipo: "HABITO",
        titulo: "Triagem estruturada em 15min",
        detalhe: "5 perguntas-chave + scoring. Só avança quem passar do threshold.",
        categoria: "REDUZIR",
        frequencia: "semanal",
        gatilho: "Novos currículos",
        impactos: { tempo: 0.3, clareza: 0.8, impacto: 0.6 },
        fundamentacao: "Filtra antes de investir tempo em entrevistas longas."
      },
      {
        tipo: "TAREFA",
        titulo: "Rubrica de avaliação padronizada",
        detalhe: "Competências + níveis claros. Todos entrevistadores usam a mesma régua.",
        categoria: "AUTOMATIZAR",
        estimativaHoras: 1,
        impactos: { tempo: 0.4, clareza: 0.9, impacto: 0.7 },
        fundamentacao: "Acelera decisão e melhora qualidade das contratações."
      }
    ]
  },

  // 📤 DELEGAÇÃO E ENCAMINHAMENTO
  {
    tag: "delegacao",
    keywords: ["delegar","alocar","responsavel","encaminhar","assignar","distribuir","equipe"],
    gerar: () => [
      {
        tipo: "HABITO",
        titulo: "Contexto + critério de aceite",
        detalhe: "Por que é importante + como saber que está 'pronto'. Sempre.",
        categoria: "TREINAR_DELEGAR",
        frequencia: "semanal",
        gatilho: "Ao delegar tarefa",
        impactos: { tempo: 0.6, clareza: 0.8, impacto: 0.7 },
        fundamentacao: "Reduz idas-e-vindas e melhora qualidade da entrega."
      },
      {
        tipo: "TAREFA",
        titulo: "Matriz de delegação por complexidade",
        detalhe: "Tarefas A/B/C para pessoas júnior/pleno/sênior. Matching automático.",
        categoria: "AUTOMATIZAR",
        estimativaHoras: 0.5,
        impactos: { tempo: 0.3, clareza: 0.7, impacto: 0.6 },
        fundamentacao: "Acelera distribuição e desenvolve o time."
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
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[-_]/g, '') // Remove hífens e underscores
    .replace(/[^a-z0-9\s]/g, ' ') // Remove pontuação
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

function gerarIdDeterministico(atividade: any, categoria: string, tipo: string, index: number): string {
  const base = `${atividade?.id || atividade?.titulo || "item"}-${categoria}-${tipo}-${index}`;
  return base.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 30);
}

function calcularJaccardSimilarity(titulo1: string, titulo2: string): number {
  const tokens1 = new Set(normalizarTexto(titulo1).split(/\s+/));
  const tokens2 = new Set(normalizarTexto(titulo2).split(/\s+/));
  
  const intersecao = new Set([...tokens1].filter(token => tokens2.has(token)));
  const uniao = new Set([...tokens1, ...tokens2]);
  
  return uniao.size > 0 ? intersecao.size / uniao.size : 0;
}

// ═══════════════════════════════════════════════════════════════════
// 🎯 SISTEMA DE SCORING ROBUSTO
// ═══════════════════════════════════════════════════════════════════

function calcularScore(sugestao: SugestaoTatica, atividade: any, zona: Zona): number {
  let score = 100; // Score base
  
  // 1. Multiplicador por zona
  const multiplicadorZona = {
    "ESSENCIAL": 1.1,
    "ESTRATEGICA": 1.05,
    "TATICA": 1.0,
    "DISTRACAO": 0.95
  };
  score *= multiplicadorZona[zona];
  
  // 2. Ajuste pelo tamanho da atividade (horasDia)
  const horasDia = atividade.horasDia || (atividade.horasMes || 0) / 30;
  
  if (horasDia >= 1.5) {
    // Atividades grandes: priorizar DESCARTAR/AUTOMATIZAR/REDUZIR
    if (['DESCARTAR', 'AUTOMATIZAR', 'REDUZIR', 'COMBINAR'].includes(sugestao.categoria)) {
      score *= 1.3;
    }
  } else if (horasDia <= 0.3) {
    // Atividades pequenas: priorizar REVISITAR/OTIMIZAR
    if (['REVISITAR', 'OTIMIZAR'].includes(sugestao.categoria)) {
      score *= 1.2;
    }
  }
  
  // 3. Alinhamento de impactos
  const { impacto: impAtiv = 0, clareza: claAtiv = 0 } = atividade;
  const { impacto: impSug = 0.5, clareza: claSug = 0.5, tempo: tempoSug = 0.5 } = sugestao.impactos;
  
  // Bônus se atividade tem alto impacto e sugestão também aumenta impacto
  if (impAtiv >= 4 && impSug > 0.6) {
    score *= 1.15;
  }
  
  // Bônus se atividade tem baixa clareza e sugestão aumenta clareza
  if (claAtiv < 4 && claSug > 0.6) {
    score *= 1.15;
  }
  
  // Bônus para economia de tempo em atividades grandes
  if (horasDia > 1 && tempoSug < 0.5) {
    score *= 1.1;
  }
  
  return Math.round(score);
}

// ═══════════════════════════════════════════════════════════════════
// 🔍 ANÁLISE DE PADRÕES APRIMORADA
// ═══════════════════════════════════════════════════════════════════

function analisarPadroes(atividade: any, zona: Zona): Array<{pattern: any, score: number}> {
  const tokens = tokensDe(atividade);
  
  const matches = PATTERNS_DATABASE.map((pattern) => {
    let score = 0;
    
    pattern.keywords.forEach(keyword => {
      // Match exato
      if (tokens.includes(keyword)) {
        score += 10;
      }
      // Match por prefixo (apresent -> apresentação)
      else if (tokens.some(token => token.startsWith(keyword) || keyword.startsWith(token))) {
        score += 7;
      }
      // Match por inclusão (email em e-mail)
      else if (tokens.some(token => token.includes(keyword) || keyword.includes(token))) {
        score += 4;
      }
    });
    
    return score > 0 ? { pattern, score } : null;
  }).filter(Boolean);
  
  return matches.sort((a, b) => b.score - a.score);
}

// ═══════════════════════════════════════════════════════════════════
// 🎯 FALLBACKS POR ZONA APRIMORADOS (SEMPRE 2+ ITENS)
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
// 🔧 CONVERSÃO APRIMORADA COM EIXO PARA HÁBITOS
// ═══════════════════════════════════════════════════════════════════

function converterParaNossoFormato(sugestao: SugestaoTatica): Tatica {
  const impactos: { tempo?: ImpactoFlag; clareza?: ImpactoFlag; impacto?: ImpactoFlag } = {};
  
  // Conversão de impactos numéricos para flags
  if (sugestao.impactos.tempo !== undefined) {
    impactos.tempo = sugestao.impactos.tempo > 0.5 ? "aumenta" : "diminui";
  }
  if (sugestao.impactos.clareza !== undefined) {
    impactos.clareza = sugestao.impactos.clareza > 0.5 ? "aumenta" : "diminui";
  }
  if (sugestao.impactos.impacto !== undefined) {
    impactos.impacto = sugestao.impactos.impacto > 0.5 ? "aumenta" : "diminui";
  }

  // Cálculo do eixo (para TAREFA e HÁBITO)
  let eixo: Eixo | undefined = undefined;
  const { tempo = 0.5, clareza = 0.5, impacto = 0.5 } = sugestao.impactos;
  
  // Determinar eixo principal baseado no maior impacto
  if (tempo <= 0.4) {
    eixo = "tempo";
  } else if (clareza >= 0.6) {
    eixo = "clareza";
  } else if (impacto >= 0.6) {
    eixo = "impacto";
  } else {
    // Default para clareza se não há dominância clara
    eixo = "clareza";
  }

  return {
    id: sugestao.id,
    titulo: sugestao.titulo,
    detalhe: sugestao.fundamentacao 
      ? `${sugestao.detalhe}\n\n💡 ${sugestao.fundamentacao}`
      : sugestao.detalhe,
    impactos,
    eixo,
    concluida: false,
    // Campos expandidos compatíveis com o modal
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
// 🎯 SISTEMA DE QUALIDADE E DEDUPLICAÇÃO
// ═══════════════════════════════════════════════════════════════════

function garantirDiversidade(candidatos: SugestaoTatica[]): SugestaoTatica[] {
  const resultado: SugestaoTatica[] = [];
  const categoriasUsadas = new Set<string>();
  
  // Primeira passada: priorizar diversidade TAREFA/HÁBITO
  const tarefas = candidatos.filter(c => c.tipo === "TAREFA");
  const habitos = candidatos.filter(c => c.tipo === "HABITO");
  
  // Tentar incluir pelo menos 1 TAREFA e 1 HÁBITO
  if (tarefas.length > 0) {
    const melhorTarefa = tarefas.sort((a, b) => (b.score || 0) - (a.score || 0))[0];
    resultado.push(melhorTarefa);
    categoriasUsadas.add(melhorTarefa.categoria);
  }
  
  if (habitos.length > 0) {
    const melhorHabito = habitos.sort((a, b) => (b.score || 0) - (a.score || 0))[0];
    resultado.push(melhorHabito);
    categoriasUsadas.add(melhorHabito.categoria);
  }
  
  // Preencher restante evitando redundância
  const restantes = candidatos
    .filter(c => !resultado.includes(c))
    .sort((a, b) => (b.score || 0) - (a.score || 0));
  
  for (const candidato of restantes) {
    if (resultado.length >= 3) break;
    
    // Verificar redundância por categoria
    if (categoriasUsadas.has(candidato.categoria)) continue;
    
    // Verificar similaridade textual
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

function aplicarBarreiraQualidade(candidatos: SugestaoTatica[]): SugestaoTatica[] {
  if (candidatos.length <= 2) return candidatos;
  
  const sorted = candidatos.sort((a, b) => (b.score || 0) - (a.score || 0));
  const top2 = sorted.slice(0, 2);
  const terceiro = sorted[2];
  
  // Só incluir o 3º se tiver pelo menos 75% do score do 2º
  const threshold = (top2[1]?.score || 0) * 0.75;
  
  if ((terceiro?.score || 0) >= threshold) {
    return top2.concat([terceiro]);
  }
  
  return top2;
}

// ═══════════════════════════════════════════════════════════════════
// 🚀 FUNÇÃO PRINCIPAL ROBUSTA
// ═══════════════════════════════════════════════════════════════════

export function sugerirTaticasAvancadas(atividade: AtividadePlano): Tatica[] {
  const zona = obterZona(atividade);
  
  console.log(`🔍 ANÁLISE: "${atividade.titulo}" | ZONA: ${zona} | I×C: ${atividade.impacto}×${atividade.clareza} | H/dia: ${(atividade.horasMes/30).toFixed(1)}`);

  // 1. Buscar padrões específicos
  const padroes = analisarPadroes(atividade, zona);
  let candidatos: SugestaoTatica[] = [];
  
  // 2. Adicionar até 2 melhores padrões
  const top2Padroes = padroes.slice(0, 2);
  for (const { pattern } of top2Padroes) {
    const sugestoesPadrao = pattern.gerar({ atividade, zona });
    candidatos.push(...sugestoesPadrao);
    console.log(`📋 PADRÃO: ${pattern.tag} (${sugestoesPadrao.length} sugestões)`);
  }
  
  // 3. Adicionar fallback da zona
  const fallbacks = aplicarRegrasPorZona(zona, atividade);
  candidatos.push(...fallbacks);
  
  // 4. Gerar IDs determinísticos e calcular scores
  candidatos = candidatos.map((sugestao, index) => ({
    ...sugestao,
    id: gerarIdDeterministico(atividade, sugestao.categoria, sugestao.tipo, index),
    score: calcularScore(sugestao, atividade, zona)
  }));
  
  console.log(`🎯 CANDIDATOS PRÉ-FILTRO: ${candidatos.length}`, candidatos.map(c => `${c.tipo}:${c.titulo}:${c.score}`));
  
  // 5. Aplicar diversidade e qualidade
  let resultado = garantirDiversidade(candidatos);
  resultado = aplicarBarreiraQualidade(resultado);
  
  // 6. Converter para formato da UI
  const taticasFinais = resultado.map(converterParaNossoFormato);
  
  console.log(`✅ TÁTICAS FINAIS: ${taticasFinais.length}`, taticasFinais.map(t => `${t.tipo}:${t.titulo}:${t.eixo}`));
  
  return taticasFinais;
}

// ═══════════════════════════════════════════════════════════════════
// 🔄 COMPATIBILIDADE COM FUNÇÃO ORIGINAL
// ═══════════════════════════════════════════════════════════════════

export function sugerirTaticasBase(atividade: AtividadePlano): Tatica[] {
  return sugerirTaticasAvancadas(atividade);
}

// ═══════════════════════════════════════════════════════════════════
// 🧪 FUNÇÃO DE TESTE PARA QA
// ═══════════════════════════════════════════════════════════════════

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
    }
  ];
  
  console.log("🧪 TESTE DE MESA - HEURÍSTICA V2.0");
  console.log("═".repeat(50));
  
  casos.forEach((caso, index) => {
    const atividade: AtividadePlano = {
      id: `teste-${index}`,
      titulo: caso.nome,
      impacto: caso.impacto as any,
      clareza: caso.clareza as any,
      horasMes: caso.horasMes,
      horasDia: caso.horasMes / 30
    };
    
    const resultado = sugerirTaticasAvancadas(atividade);
    const categorias = resultado.map(r => r.categoria).filter(Boolean);
    
    console.log(`\n${index + 1}. ${caso.nome}`);
    console.log(`   Entrada: I${caso.impacto}×C${caso.clareza}, ${caso.horasMes}h/mês`);
    console.log(`   Resultado: ${resultado.length} táticas`);
    console.log(`   Categorias: ${categorias.join(", ")}`);
    console.log(`   Tipos: ${resultado.map(r => r.tipo).join(", ")}`);
    
    const temEsperado = caso.esperado.some(exp => categorias.includes(exp));
    console.log(`   ✅ Contém categoria esperada: ${temEsperado ? "SIM" : "NÃO"}`);
  });
  
  console.log("\n" + "═".repeat(50));
  console.log("🎯 TESTE CONCLUÍDO");
}