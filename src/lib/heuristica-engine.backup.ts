// ============================================================================
// 🧠 HEURÍSTICA ENGINE - CORRIGIDA PARA GERAR HÁBITOS
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
};

// ═══════════════════════════════════════════════════════════════════
// 🔎 PADRÕES CORRIGIDOS (garantem HÁBITO + TAREFA)
// ═══════════════════════════════════════════════════════════════════

const PATTERNS_DATABASE = [
  {
    tag: "emails",
    keywords: ["email","e-mail","inbox","caixa","responder","follow","mensagem"],
    gerar: ({ zona }) => [
      {
        id: "",
        tipo: "HABITO",
        titulo: "Janelas de e-mail (2×/dia)",
        detalhe: "Responder apenas em blocos (ex.: 11h e 16h) para evitar fragmentação.",
        categoria: "REDUZIR",
        frequencia: "diaria",
        gatilho: "Alarmes 11h/16h",
        impactos: { tempo: 0.3, clareza: 0.5, impacto: 0.2 }, // CORRIGIDO: tempo=0.3 (diminui)
        fundamentacao: "Timeboxing diminui trocas de contexto."
      },
      {
        id: "",
        tipo: "TAREFA",
        titulo: "Filtros e etiquetas automáticas",
        detalhe: "Auto-arquivar newsletters, priorizar remetentes críticos.",
        categoria: "AUTOMATIZAR",
        estimativaHoras: 0.5,
        impactos: { tempo: 0.4, clareza: 0.6, impacto: 0.2 }, // CORRIGIDO: tempo=0.4 (diminui)
        fundamentacao: "Automação tira volume operacional do caminho."
      }
    ]
  },
  
  {
    tag: "reunioes",
    keywords: ["reuni", "alinhamento", "status", "pauta", "meet", "zoom", "teams", "agenda"],
    gerar: ({ zona }) => [
      {
        id: "",
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
        id: "",
        tipo: "TAREFA",
        titulo: "Migrar reuniões de status para update assíncrono",
        detalhe: "Resumo escrito + check-ins quinzenais no lugar de reunião recorrente.",
        categoria: "AUTOMATIZAR",
        estimativaHoras: 1,
        impactos: { tempo: 0.2, clareza: 0.5, impacto: 0.3 },
        fundamentacao: "Assíncrono evita custo de coordenação desnecessário."
      }
    ]
  }
];

// ═══════════════════════════════════════════════════════════════════
// 🧮 UTILITÁRIOS
// ═══════════════════════════════════════════════════════════════════

function tokensDe(atividade: any): string[] {
  const base = `${atividade?.titulo ?? atividade?.nome ?? ""} ${atividade?.descricao ?? atividade?.detalhe ?? ""}`;
  return base.toLowerCase().split(/[^a-z0-9]+/i).filter(Boolean);
}

function obterZona(atividade: any): Zona {
  const imp = atividade.impacto ?? 0;
  const cla = atividade.clareza ?? 0;
  
  if (imp >= 4 && cla >= 4) return "ESSENCIAL";
  if (imp >= 4 && cla < 4)  return "ESTRATEGICA";
  if (imp < 4  && cla >= 4) return "TATICA";
  return "DISTRACAO";
}

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

function analisarPadroes(atividade: any, zona: Zona): any[] {
  const tks = tokensDe(atividade);
  const matches = PATTERNS_DATABASE.map((p) => {
    const hits = p.keywords.reduce((acc, k) => acc + (tks.some(t => t.includes(k)) ? 1 : 0), 0);
    return hits > 0 ? { pattern: p, score: hits } : null;
  }).filter(Boolean);
  return matches.sort((a, b) => b.score - a.score);
}

function aplicarRegrasPorZona(zona: Zona, atividade: any): SugestaoTatica[] {
  const baseId = (atividade?.id || atividade?.titulo || "item").toString().replace(/\s+/g,"-").toLowerCase();
  const mk = (s: any, idx: number): SugestaoTatica => ({ ...s, id: `${baseId}-${Date.now()}-${idx}` });

  switch (zona) {
    case "ESSENCIAL":
      return [
        mk({
          tipo: "HABITO",
          titulo: "Blocos fixos do essencial (2×/sem)",
          detalhe: "Dois blocos de 90–120 min exclusivos para esta atividade.",
          categoria: "OTIMIZAR",
          frequencia: "semanal",
          impactos: { impacto: 0.8, tempo: 0.5, clareza: 0.5 },
          fundamentacao: "Se não está na agenda, não acontece."
        }, 1),
        mk({
          tipo: "TAREFA",
          titulo: "Remover bloqueio imediato",
          detalhe: "Listar e resolver o maior obstáculo para o próximo passo.",
          categoria: "OTIMIZAR",
          estimativaHoras: 0.5,
          impactos: { impacto: 0.7, tempo: 0.5, clareza: 0.6 },
          fundamentacao: "Eliminar gargalo aumenta fluxo do essencial."
        }, 2)
      ];
      
    case "ESTRATEGICA":
      return [
        mk({
          tipo: "TAREFA",
          titulo: "Definir próximos 3 passos",
          detalhe: "Sequência mínima executável com responsável e prazo.",
          categoria: "REVISITAR",
          estimativaHoras: 0.5,
          impactos: { clareza: 0.9, impacto: 0.6, tempo: 0.3 },
          fundamentacao: "Clareza antes de volume."
        }, 1),
        mk({
          tipo: "HABITO",
          titulo: "Revisão semanal estratégica",
          detalhe: "Checkpoint de progresso e ajustes de prioridade.",
          categoria: "REVISITAR",
          frequencia: "semanal",
          impactos: { clareza: 0.6, impacto: 0.5 },
          fundamentacao: "Previne deriva estratégica."
        }, 2)
      ];
      
    case "TATICA":
      return [
        mk({
          tipo: "TAREFA",
          titulo: "Automatizar passo repetitivo",
          detalhe: "Regra/template/script para reduzir toques manuais.",
          categoria: "AUTOMATIZAR",
          estimativaHoras: 1,
          impactos: { tempo: 0.3, clareza: 0.4, impacto: 0.3 }, // CORRIGIDO: tempo=0.3 (diminui)
          fundamentacao: "Menos esforço em baixo impacto."
        }, 1),
        mk({
          tipo: "HABITO",
          titulo: "Lote tático semanal",
          detalhe: "Concentrar operacionais em um bloco único.",
          categoria: "COMBINAR",
          frequencia: "semanal",
          impactos: { tempo: 0.2, clareza: 0.4 }, // CORRIGIDO: tempo=0.2 (diminui)
          fundamentacao: "Reduz troca de contexto."
        }, 2)
      ];
      
    case "DISTRACAO":
      return [
        mk({
          tipo: "TAREFA",
          titulo: "Remover/adiar — não atende critério de valor",
          detalhe: "Alinhar com solicitante; se vago, não executar.",
          categoria: "DESCARTAR",
          estimativaHoras: 0.25,
          impactos: { tempo: 0.1, clareza: 0.5, impacto: 0.2 }, // CORRIGIDO: tempo=0.1 (diminui muito)
          fundamentacao: "Liberar tempo para o essencial."
        }, 1)
      ];
  }
}

// ═══════════════════════════════════════════════════════════════════
// 🔧 CONVERSÃO CORRIGIDA
// ═══════════════════════════════════════════════════════════════════

function converterParaNossoFormato(sugestao: SugestaoTatica): Tatica {
  const impactos: { tempo?: ImpactoFlag; clareza?: ImpactoFlag; impacto?: ImpactoFlag } = {};
  
  // LÓGICA CORRIGIDA: < 0.5 = diminui, > 0.5 = aumenta
  if (sugestao.impactos.tempo !== undefined) {
    impactos.tempo = sugestao.impactos.tempo > 0.5 ? "aumenta" : "diminui";
  }
  if (sugestao.impactos.clareza !== undefined) {
    impactos.clareza = sugestao.impactos.clareza > 0.5 ? "aumenta" : "diminui";
  }
  if (sugestao.impactos.impacto !== undefined) {
    impactos.impacto = sugestao.impactos.impacto > 0.5 ? "aumenta" : "diminui";
  }

  // ✅ NOVA LÓGICA: Usar estrutura completa do modal
  let eixo: Eixo | undefined = undefined;
  if (sugestao.tipo === "TAREFA") {
    const { tempo = 0.5, clareza = 0.5, impacto = 0.5 } = sugestao.impactos;
    if (tempo <= 0.4) eixo = "tempo";
    else if (clareza >= 0.6) eixo = "clareza";
    else if (impacto >= 0.6) eixo = "impacto";
    else eixo = "clareza";
  }

  console.log(`🔧 CONVERSÃO: ${sugestao.tipo} -> eixo: ${eixo} | categoria: ${sugestao.categoria} | título: ${sugestao.titulo}`);

  return {
    id: sugestao.id,
    titulo: sugestao.titulo,
    detalhe: sugestao.fundamentacao 
      ? `${sugestao.detalhe}\n\n💡 ${sugestao.fundamentacao}`
      : sugestao.detalhe,
    impactos,
    eixo,
    concluida: false,
    // ✅ CAMPOS NOVOS COMPATÍVEIS COM O MODAL:
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
// 🚀 FUNÇÃO PRINCIPAL SIMPLIFICADA
// ═══════════════════════════════════════════════════════════════════

export function sugerirTaticasAvancadas(atividade: AtividadePlano): Tatica[] {
  const zona = obterZona(atividade);
  
  console.log(`🔍 ATIVIDADE: "${atividade.titulo}" | ZONA: ${zona} | IMPACTO: ${atividade.impacto} | CLAREZA: ${atividade.clareza}`);

  // 1) Tentar padrões primeiro
  const padroes = analisarPadroes(atividade, zona);
  let candidatos: SugestaoTatica[] = [];
  
  if (padroes.length > 0) {
    candidatos = padroes[0].pattern.gerar({ atividade, zona, foco: {} });
    console.log(`📋 PADRÃO ENCONTRADO: ${padroes[0].pattern.tag}`);
  }
  
  // 2) Sempre adicionar fallback da zona
  const zonaExtras = aplicarRegrasPorZona(zona, atividade);
  candidatos = [...candidatos, ...zonaExtras];

  console.log(`🎯 CANDIDATOS GERADOS: ${candidatos.length}`, candidatos.map(c => `${c.tipo}: ${c.titulo}`));

  // 3) Preencher IDs e converter
  const baseId = (atividade?.id || atividade?.titulo || "item").toString().replace(/\s+/g,"-").toLowerCase();
  candidatos = candidatos.map((s, idx) => ({
    ...s,
    id: s.id || `${baseId}-${Date.now()}-${idx}`
  }));

  const resultado = candidatos.slice(0, 3).map(converterParaNossoFormato);
  console.log(`✅ TÁTICAS FINAIS:`, resultado.map(r => `${r.eixo ? 'TAREFA' : 'HÁBITO'}: ${r.titulo}`));
  
  return resultado;
}

export function sugerirTaticasBase(atividade: AtividadePlano): Tatica[] {
  return sugerirTaticasAvancadas(atividade);
}