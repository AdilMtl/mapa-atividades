// 🧩 COMPONENTES MODULARES - PLANO DE AÇÃO
// Arquivo: src/components/plano/index.tsx

'use client'
import React from "react";
import { 
  Calendar, 
  Target, 
  Timer, 
  LayoutDashboard, 
  ChevronDown, 
  Sparkles, 
  CheckCircle2, 
  Trash2, 
  Info, 
  ArrowUpRight, 
  CheckSquare,
  Plus,
  Map, 
  Zap,
  Edit,
  TrendingUp,
  Save,
  LayoutGrid
} from "lucide-react";

// Importar componentes da Wave 1
import { 
  PageContainer, 
  PageHeader, 
  MetricCard, 
  MetricGrid,
  Section,
  EmptyState
} from '@/components/base';

// Importar Design System da Wave 1
import { DESIGN_TOKENS, cn } from '@/lib/design-system';
import { sugerirTaticasAvancadas } from '@/lib/heuristica-engine';
import type { TipoFoco } from '@/lib/diagnostico-engine';

// ═══════════════════════════════════════════════════════════════════
// 🎯 TIPOS E INTERFACES (MANTIDAS IGUAIS)
// ═══════════════════════════════════════════════════════════════════

export type Eixo = "tempo" | "clareza" | "impacto";
export type ImpactoFlag = "aumenta" | "diminui";

export interface AtividadeMap {
  id?: string;
  nome: string;
  eixoX: number;
  eixoY: number;  
  horasMes: number;
  user_id?: string;
}

export interface AtividadePlano {
  id: string;
  titulo: string;
  descricao?: string;
  impacto: 1 | 2 | 3 | 4 | 5 | 6;
  clareza: 1 | 2 | 3 | 4 | 5 | 6;
  horasDia: number;
  horasMes: number;
}

// Interface original para compatibilidade (IMPORTANTE!)
export interface Tatica {
  id: string;
  titulo: string;
  detalhe?: string;
  dataSugerida?: string;
  impactos?: {
    tempo?: ImpactoFlag;
    clareza?: ImpactoFlag;
    impacto?: ImpactoFlag;
  };
  concluida?: boolean;
  eixo?: Eixo;
  tipo?: "TAREFA" | "HABITO"; // Novo campo para distinguir
  categoria?: string; // Categoria DAR CERTO
  estimativaHoras?: number;
  frequencia?: "diaria" | "semanal" | "mensal";
  gatilho?: string;
}

// Base comum para tarefas e hábitos
interface AcaoBase {
  id: string;
  titulo: string;
  detalhe: string;
  impactos: {
    tempo?: ImpactoFlag;
    clareza?: ImpactoFlag;
    impacto?: ImpactoFlag;
  };
  categoria: keyof typeof DAR_CERTO_FRAMEWORK; // 'DESCARTAR' | 'AUTOMATIZAR' | etc.
}

// Tarefas = Ações pontuais com prazo
export interface Tarefa extends AcaoBase {
  tipo: "TAREFA";
  dataSugerida?: string;
  concluida?: boolean;
  estimativaHoras?: number;
  perfilAlvo?: string[]; // ['iniciante', 'intermediario', 'avancado']
}

// Hábitos = Comportamentos recorrentes
export interface Habito extends AcaoBase {
  tipo: "HABITO";
  frequencia: "diaria" | "semanal" | "mensal";
  gatilho?: string; // "Após reunião", "Todo dia às 9h"
  perfilAlvo?: string[]; // ['lider', 'ic', 'freelancer']
}

// ═══════════════════════════════════════════════════════════════════
// 🎯 TIPOS KANBAN (EXTENSÃO PARA PAINEL SEMANAL)
// ═══════════════════════════════════════════════════════════════════

// Status do Kanban
export type KanbanStatus = 'backlog' | 'para_fazer' | 'fazendo' | 'feito';

// Zona ROI (já existente, confirmando nomenclatura)
export type ZonaROI = 'essencial' | 'estrategica' | 'tatica' | 'distracao';

// Interface da tática no Kanban (estendendo a atual)
export interface TaticaKanban extends Tatica {
  // Novos campos para Kanban
  status_kanban: KanbanStatus;
  ordem_coluna?: number;
  semana_referencia?: string;
  
  // Dados da atividade mãe (via JOIN)
  atividade?: {
    id: string;
    nome: string;
    zona: ZonaROI;
    cor: string;
  };
}

// Estrutura do Board
export interface KanbanBoard {
  backlog: TaticaKanban[];
  para_fazer: TaticaKanban[];
  fazendo: TaticaKanban[];
  feito: TaticaKanban[];
}

// Opções de ordenação
export type OrdenacaoKanban = 
  | "por_atividade"     // Agrupa por atividade mãe
  | "por_zona"          // Ordena por zona ROI
  | "manual";           // Ordem definida pelo usuário

// União para compatibilidade
export type Acao = Tarefa | Habito;


export interface PlanoDeAcao {
  atividadeId: string;
  taticas: Tatica[];
}

// ═══════════════════════════════════════════════════════════════════
// 🎯 FRAMEWORK DAR CERTO - BASEADO NA TEORIA ROI DO FOCO
// ═══════════════════════════════════════════════════════════════════

const DAR_CERTO_FRAMEWORK = {
  DESCARTAR: {
    descricao: "Aquilo que não faz sentido continuar",
    aplicavelEm: ["Distração", "Tática"],
    tipoSugerido: "TAREFA" as const  // 🆕 Apenas sugestão
  },
  AUTOMATIZAR: {
    descricao: "Investir tempo agora para ganhar horas depois", 
    aplicavelEm: ["Tática", "Distração", "Essencial"],
    tipoSugerido: "TAREFA" as const
  },
  REDUZIR: {
    descricao: "Escopo, energia ou frequência",
    aplicavelEm: ["Distração", "Tática"],
    tipoSugerido: "HABITO" as const
  },
  COMBINAR: {
    descricao: "Reagrupar atividades, entregar junto",
    aplicavelEm: ["Tática", "Distração", "Essencial"],
    tipoSugerido: "TAREFA" as const
  },
  ENCAMINHAR: {
    descricao: "Direcionar para quem realmente é responsável",
    aplicavelEm: ["Distração", "Tática"],
    tipoSugerido: "HABITO" as const
  },
  REVISITAR: {
    descricao: "Ajustar ou descontinuar o que perdeu sentido",
    aplicavelEm: ["Distração", "Tática", "Estratégica"],
    tipoSugerido: "HABITO" as const
  },
  TREINAR: {
    descricao: "Preparar alguém para assumir com autonomia",
    aplicavelEm: ["Tática", "Distração", "Essencial"],
    tipoSugerido: "TAREFA" as const
  },
  OTIMIZAR: {
    descricao: "Redesenhar a forma como a tarefa é feita",
    aplicavelEm: ["Distração", "Tática", "Essencial", "Estratégica"],
    tipoSugerido: "TAREFA" as const
  }
} as const;
// ═══════════════════════════════════════════════════════════════════
// 🎨 TEMA INTEGRADO (MANTIDO IGUAL)
// ═══════════════════════════════════════════════════════════════════

const TEMA = {
  bg: DESIGN_TOKENS.colors.background,        
  card: 'rgba(255,255,255,0.05)',            
  cardBorder: 'rgba(255,255,255,0.1)',       
  text: '#ffffff',                            
  subtext: 'rgba(255,255,255,0.7)',          
  brand: DESIGN_TOKENS.colors.primary,       
  accent: DESIGN_TOKENS.colors.primary,      
  positive: DESIGN_TOKENS.colors.essencial,  
  warning: DESIGN_TOKENS.colors.tatica,      
  info: DESIGN_TOKENS.colors.estrategica,    
  danger: DESIGN_TOKENS.colors.distracao,    
  chipBg: 'rgba(255,255,255,0.08)',         
};

// ═══════════════════════════════════════════════════════════════════
// 🧮 FUNÇÕES UTILITÁRIAS (MANTIDAS IGUAIS)
// ═══════════════════════════════════════════════════════════════════

function zonaDaAtividade(a: AtividadePlano): "Distração" | "Tática" | "Estratégica" | "Essencial" {
  const impacto = a.impacto ?? 0;
  const clareza = a.clareza ?? 0;
  
  if (impacto <= 3 && clareza <= 3) return "Distração";
  if (impacto <= 3 && clareza >= 4) return "Tática";
  if (impacto >= 4 && clareza <= 3) return "Estratégica";
  return "Essencial";
}

function scoreIC(a: AtividadePlano) {
  return (a.impacto ?? 0) * (a.clareza ?? 0);
}

let uidCounter = 0;
function uid() {
  uidCounter++;
  return `${Date.now()}-${uidCounter}-${Math.random().toString(36).slice(2, 9)}`;
}

function mapearAtividade(ativMap: AtividadeMap): AtividadePlano {
  return {
    id: ativMap.id || uid(),
    titulo: ativMap.nome,
    impacto: ativMap.eixoX as (1 | 2 | 3 | 4 | 5 | 6),
    clareza: ativMap.eixoY as (1 | 2 | 3 | 4 | 5 | 6),
    horasMes: ativMap.horasMes,
    horasDia: ativMap.horasMes / 30,
  };
}

function sugerirTaticasBase(a: AtividadePlano): Tatica[] {
  return sugerirTaticasAvancadas(a);
}

function sugerirAcoesInteligentes(
  atividade: AtividadePlano, 
  focoDiagnostico?: string
): Tatica[] {
  
  const zona = zonaDaAtividade(atividade);
  
  // 🎯 SISTEMA INTELIGENTE BASEADO NO FOCO DIAGNÓSTICO
  if (focoDiagnostico === 'REDUZIR_DISTRACAO' && zona === 'Distração') {
    return [
      {
        id: uid(),
        tipo: "TAREFA",
        titulo: "📋 Mapear e eliminar etapas desnecessárias",
        detalhe: "Listar todos os passos desta atividade e marcar quais podem ser removidos ou automatizados",
        categoria: "DESCARTAR",
        estimativaHoras: 0.5,
        impactos: { tempo: "diminui", clareza: "aumenta" }
      },
      {
        id: uid(),
        tipo: "HABITO",
        titulo: "❓ Questionamento automático",
        detalhe: "Sempre perguntar: 'Qual o objetivo real? É urgente mesmo? Quem mais pode fazer?'",
        categoria: "ENCAMINHAR",
        frequencia: "diaria",
        gatilho: "Quando alguém solicitar algo similar",
        impactos: { tempo: "diminui" }
      }
    ];
  }
  
  if (focoDiagnostico === 'COMPRIMIR_TATICO' && zona === 'Tática') {
    return [
      {
        id: uid(),
        tipo: "TAREFA",
        titulo: "⚡ Criar template para esta atividade",
        detalhe: "Padronizar execução com checklist para reduzir tempo de decisão em 70%",
        categoria: "AUTOMATIZAR",
        estimativaHoras: 1,
        impactos: { tempo: "diminui" }
      },
      {
        id: uid(),
        tipo: "HABITO",
        titulo: "📦 Processar em lotes",
        detalhe: "Agrupar todas as tarefas similares e fazer de uma só vez (batch processing)",
        categoria: "COMBINAR",
        frequencia: "semanal",
        gatilho: "Ao planejar a semana",
        impactos: { tempo: "diminui" }
      }
    ];
  }
  
  if (focoDiagnostico === 'FORTALECER_ESSENCIAL' && zona === 'Essencial') {
    return [
      {
        id: uid(),
        tipo: "TAREFA",
        titulo: "📊 Criar dashboard de acompanhamento",
        detalhe: "Definir 2-3 métricas chave e configurar acompanhamento semanal",
        categoria: "OTIMIZAR",
        estimativaHoras: 2,
        impactos: { impacto: "aumenta", clareza: "aumenta" }
      },
      {
        id: uid(),
        tipo: "HABITO",
        titulo: "✅ Checklist de qualidade",
        detalhe: "Sempre revisar: precisão dos dados, clareza da mensagem, impacto esperado",
        categoria: "OTIMIZAR",
        frequencia: "diaria",
        gatilho: "Antes de finalizar qualquer entrega",
        impactos: { impacto: "aumenta" }
      }
    ];
  }
  
  if (focoDiagnostico === 'DAR_FORMA_ESTRATEGICO' && zona === 'Estratégica') {
    return [
      {
        id: uid(),
        tipo: "TAREFA",
        titulo: "🎯 Definir critérios de sucesso",
        detalhe: "Escrever 1 frase de objetivo + 3 indicadores mensuráveis + prazo",
        categoria: "OTIMIZAR",
        estimativaHoras: 1,
        impactos: { clareza: "aumenta", impacto: "aumenta" }
      },
      {
        id: uid(),
        tipo: "HABITO",
        titulo: "📅 Revisão semanal de progresso",
        detalhe: "Toda sexta, 15min: o que funcionou? o que não funcionou? próximos passos?",
        categoria: "REVISITAR",
        frequencia: "semanal",
        gatilho: "Sexta-feira às 17h",
        impactos: { clareza: "aumenta" }
      }
    ];
  }
  
  // 📋 SUGESTÕES PADRÃO POR ZONA (quando não há foco específico)
  switch(zona) {
    case "Distração":
      return [
        {
          id: uid(),
          tipo: "HABITO",
          titulo: "🔍 Revisão semanal de relevância",
          detalhe: "Toda semana questionar: esta atividade ainda faz sentido?",
          categoria: "REVISITAR",
          frequencia: "semanal",
          impactos: { tempo: "diminui" }
        }
      ];
      
    case "Tática":
      return [
        {
          id: uid(),
          tipo: "TAREFA",
          titulo: "⚙️ Automatizar partes repetitivas",
          detalhe: "Identificar etapas que se repetem e criar template/automação",
          categoria: "AUTOMATIZAR",
          estimativaHoras: 1,
          impactos: { tempo: "diminui" }
        }
      ];
      
    case "Estratégica":
      return [
        {
          id: uid(),
          tipo: "TAREFA",
          titulo: "📝 Esclarecer próximos passos",
          detalhe: "Dividir em 3 subtarefas com responsável e prazo definidos",
          categoria: "OTIMIZAR",
          estimativaHoras: 0.5,
          impactos: { clareza: "aumenta" }
        }
      ];
      
    case "Essencial":
      return [
        {
          id: uid(),
          tipo: "HABITO",
          titulo: "🎯 Proteção de foco",
          detalhe: "Bloquear 2h por dia para trabalhar sem interrupções nesta atividade",
          categoria: "OTIMIZAR",
          frequencia: "diaria",
          impactos: { impacto: "aumenta" }
        }
      ];
      
    default:
      return [];
  }
}
// ═══════════════════════════════════════════════════════════════════
// 🧩 COMPONENTE 1: COMPONENTES AUXILIARES (UTILS)
// ═══════════════════════════════════════════════════════════════════

interface MeterProps {
  value: number;
  max: number;
  color: string;
}

export function Meter({ value, max, color }: MeterProps) {
  const pct = Math.max(0, Math.min(100, ((value || 0) / max) * 100));
  return (
    <div className="w-24 h-2 rounded-full bg-black/30 overflow-hidden">
      <div className="h-full transition-all duration-300" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

interface QuickButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  color: string;
}

export function QuickButton({ onClick, icon, label, color }: QuickButtonProps) {
  return (
    <button 
      onClick={onClick} 
      className={cn(
        "px-3 py-2 rounded-xl text-sm flex items-center gap-2",
        "transition-all duration-200 hover:opacity-90 hover:scale-105",
        "font-medium"
      )}
      style={{ background: color, color: TEMA.bg }}
    >
      {icon}
      {label}
    </button>
  );
}

interface SelectImpactoProps {
  label: string;
  value?: ImpactoFlag;
  onChange: (v: ImpactoFlag | undefined) => void;
  badgeColor: string;
}

export function SelectImpacto({ label, value, onChange, badgeColor }: SelectImpactoProps) {
  const iconeLabel = 
    label.includes('Tempo') ? '⏱️ Tempo' :
    label.includes('Clareza') ? '🔍 Clareza' :
    label.includes('Impacto') ? '📈 Impacto' : label;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ background: badgeColor }}></div>
        <span className="text-xs font-medium text-white/90">{iconeLabel}</span>
      </div>
      
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value ? (e.target.value as ImpactoFlag) : undefined)}
        className="bg-white/10 border border-white/20 rounded-md px-2 py-1.5 text-xs text-white outline-none focus:border-white/40 focus:bg-white/15 transition-all"
      >
        <option value="" className="bg-gray-800 text-gray-400">—</option>
        <option value="aumenta" className="bg-gray-800 text-green-400">📈 Aumenta</option>
        <option value="diminui" className="bg-gray-800 text-red-400">📉 Diminui</option>
      </select>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 🧩 COMPONENTE 2: HEADER DO PLANO
// ═══════════════════════════════════════════════════════════════════

interface PlanoHeaderProps {
  totalAtividades: number;
  onSalvar: () => void;
}

export function PlanoHeader({ totalAtividades, onSalvar }: PlanoHeaderProps) {
  return (
    <div className="mb-6">
      {/* Mobile: Layout vertical */}
      <div className="sm:hidden">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-orange-600/20 rounded-xl flex items-center justify-center">
            <Target className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Plano de Ação</h1>
            <p className="text-sm text-white/70">
              Crie táticas para suas {totalAtividades} atividades mapeadas
            </p>
          </div>
        </div>
        <button
          onClick={onSalvar}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-medium transition-all duration-200"
        >
          <Save className="w-4 h-4" />
          Salvar Plano
        </button>
      </div>

      {/* Desktop: Layout horizontal */}
      <div className="hidden sm:flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-600/20 rounded-xl flex items-center justify-center">
            <Target className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Plano de Ação</h1>
            <p className="text-sm text-white/70">
              Crie táticas para suas {totalAtividades} atividades mapeadas
            </p>
          </div>
        </div>
        <button
          onClick={onSalvar}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-medium transition-all duration-200 hover:scale-105"
        >
          <Save className="w-4 h-4" />
          Salvar Plano
        </button>
      </div>
    </div>
  );
}
// ═══════════════════════════════════════════════════════════════════
// 🧩 COMPONENTE 3: ESTATÍSTICAS E MÉTRICAS
// ═══════════════════════════════════════════════════════════════════

interface Estatisticas {
  totais: { Distração: number; Tática: number; Estratégica: number; Essencial: number; };
  totalHoras: number;
  totalAtividades: number;
  totalTaticas: number;
  taticasConcluidas: number;
  progresso: number;
  tarefas: number;     // 🆕 ADICIONAR
  habitos: number;     // 🆕 ADICIONAR
}

interface PlanoStatsProps {
  estatisticas: Estatisticas;
  atividades: AtividadePlano[];
}

export function PlanoStats({ estatisticas, atividades }: PlanoStatsProps) {
  if (atividades.length === 0) return null;

  return (
    <div className="mb-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
   
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-orange-600/20 rounded-lg flex items-center justify-center">
          <Target className="w-5 h-5 text-orange-400" />
        </div>
        <h2 className="text-lg font-semibold text-white">
          Seu plano de ação contém
        </h2>
      </div>

  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8">
        
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{estatisticas.totalAtividades}</div>
          <div className="text-xs text-white/60">Atividades</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-400">{estatisticas.totalTaticas}</div>
          <div className="text-xs text-white/60">Táticas</div>
        </div>
        
        <div className="text-center">
          <div className="text-xl sm:text-2xl font-bold text-white flex items-center justify-center gap-1">
  <span className="text-lg">📋</span>
  <span>{estatisticas.tarefas}</span>
</div>
          <div className="text-xs text-white/60">Tarefas</div>
        </div>
        
        <div className="text-center">
          <div className="text-xl sm:text-2xl font-bold text-white flex items-center justify-center gap-1">
  <span className="text-lg">🔄</span>
  <span>{estatisticas.habitos}</span>
</div>
          <div className="text-xs text-white/60">Hábitos</div>
        </div>
        
      </div>
    </div>
  );
}
// ═══════════════════════════════════════════════════════════════════
// 🧩 COMPONENTE 4: ITEM DE TÁTICA
// ═══════════════════════════════════════════════════════════════════

interface TaticaItemProps {
  tatica: Tatica;
  atividadeId: string;
  atividade: AtividadePlano;
  onAtualizarTatica: (atividadeId: string, taticaId: string, patch: Partial<Tatica>) => void;
  onAtualizarImpacto: (
    atividadeId: string, 
    taticaId: string, 
    campo: keyof NonNullable<Tatica["impactos"]>, 
    valor: ImpactoFlag | undefined
  ) => void;
  onToggleConcluida: (atividadeId: string, taticaId: string) => void;
  onRemover: (atividadeId: string, taticaId: string) => void;
  onEditarTatica?: (atividade: AtividadePlano, tatica: Tatica) => void;
}

export function TaticaItem({ 
  tatica, 
  atividadeId, 
  atividade,
  onAtualizarTatica, 
  onAtualizarImpacto, 
  onToggleConcluida, 
  onRemover,
  onEditarTatica
}: TaticaItemProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  return (
    <div 
      className={cn(
        "rounded-xl border transition-all duration-200",
        tatica.concluida && "opacity-75"
      )}
      style={{ 
        borderColor: TEMA.cardBorder, 
        background: "rgba(255,255,255,0.02)" 
      }}
    >
      {/* VERSÃO COMPACTA - Sempre visível */}
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {/* Checkbox */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onToggleConcluida(atividadeId, tatica.id);
              }}
              className={cn(
                "p-2 rounded-lg border transition-all",
                tatica.concluida ? "bg-green-500/20 border-green-500/30" : "border-white/20"
              )}
            >
              <CheckSquare className="w-4 h-4" />
            </button>
            
            {/* Título e Badges */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn(
                  "text-sm font-medium",
                  tatica.concluida && "line-through"
                )} style={{ color: TEMA.text }}>
                  {tatica.titulo}
                </span>
                
                {/* Badges compactos */}
                <div className="flex items-center gap-2">
                  <div 
                    className="px-2 py-0.5 rounded-full text-xs"
                    style={{ 
                      background: tatica.tipo === "HABITO" ? "rgba(34, 197, 94, 0.2)" : "rgba(217, 119, 6, 0.2)",
                      color: tatica.tipo === "HABITO" ? "#22c55e" : "#d97706"
                    }}
                  >
                    {tatica.tipo === "HABITO" ? "🔄" : "📋"}
                  </div>
                  
                  {tatica.categoria && (
                    <div 
                      className="px-2 py-0.5 rounded text-xs"
                      style={{ background: TEMA.chipBg, color: TEMA.subtext }}
                    >
                      {tatica.categoria}
                    </div>
                  )}
                  
                  {tatica.tipo === "TAREFA" && tatica.dataSugerida && (
                    <div className="flex items-center gap-1 text-xs" style={{ color: TEMA.subtext }}>
                      <Calendar className="w-3 h-3" />
                      {new Date(tatica.dataSugerida + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Seta indicadora */}
          <ChevronDown className={cn(
            "w-4 h-4 transition-transform duration-200 ml-2",
            isExpanded && "rotate-180"
          )} style={{ color: TEMA.subtext }} />
        </div>
      </div>

      {/* VERSÃO EXPANDIDA - Conteúdo completo */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t" style={{ borderColor: TEMA.cardBorder }}>
          {/* Controles de edição */}
          <div className="flex items-center justify-between pt-3">
            <input
              value={tatica.titulo}
              onChange={(e) => onAtualizarTatica(atividadeId, tatica.id, { titulo: e.target.value })}
              className={cn(
                "flex-1 bg-transparent outline-none text-sm py-1 px-2",
                "border-b border-transparent focus:border-white/20",
                "transition-colors duration-200"
              )}
              style={{ color: TEMA.text }}
              onClick={(e) => e.stopPropagation()}
            />
            
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onEditarTatica?.(atividade, tatica);
                }}
                className="p-2 rounded-lg hover:bg-blue-500/20"
                title="Editar"
              >
                <Edit className="w-4 h-4" style={{ color: TEMA.info }} />
              </button>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onRemover(atividadeId, tatica.id);
                }}
                className="p-2 rounded-lg hover:bg-red-500/20"
                title="Remover"
              >
                <Trash2 className="w-4 h-4" style={{ color: TEMA.danger }} />
              </button>
            </div>
          </div>

          {/* Detalhes */}
          <textarea
            value={tatica.detalhe || ""}
            onChange={(e) => onAtualizarTatica(atividadeId, tatica.id, { detalhe: e.target.value })}
            className="w-full bg-transparent outline-none text-sm resize-none border border-transparent focus:border-white/20 rounded p-2"
            style={{ color: TEMA.subtext }}
            placeholder={tatica.tipo === "HABITO" ? "Como praticar..." : "Próximos passos..."}
            rows={2}
            onClick={(e) => e.stopPropagation()}
          />

          {/* Informações específicas */}
          {tatica.tipo === "HABITO" && tatica.gatilho && (
            <div className="p-3 rounded-lg flex items-start gap-2" style={{ background: "rgba(34, 197, 94, 0.1)" }}>
              <span style={{ color: "#22c55e" }}>🎯</span>
              <div>
                <span className="text-sm font-medium" style={{ color: "#22c55e" }}>Gatilho: </span>
                <span className="text-sm ml-2" style={{ color: TEMA.text }}>{tatica.gatilho}</span>
              </div>
            </div>
          )}

          {/* Seção de Impactos */}
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-white/90">🎯 Impactos Esperados</span>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <SelectImpacto 
                label="Tempo" 
                value={tatica.impactos?.tempo} 
                onChange={(v) => onAtualizarImpacto(atividade.id, tatica.id, "tempo", v)}
                badgeColor="#ef4444"
              />
              <SelectImpacto 
                label="Clareza" 
                value={tatica.impactos?.clareza} 
                onChange={(v) => onAtualizarImpacto(atividade.id, tatica.id, "clareza", v)}
                badgeColor="#3b82f6"
              />
              <SelectImpacto 
                label="Impacto" 
                value={tatica.impactos?.impacto} 
                onChange={(v) => onAtualizarImpacto(atividade.id, tatica.id, "impacto", v)}
                badgeColor="#22c55e"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 🧩 COMPONENTE 5: CARD DE ATIVIDADE
// ═══════════════════════════════════════════════════════════════════

interface AtividadeCardProps {
  atividade: AtividadePlano;
  taticas: Tatica[];
  isExpanded: boolean;
  onToggle: () => void;
  onAdicionarTatica: (atividade: AtividadePlano, eixo: Eixo) => void;
  onAdicionarTaticaGenerica: (atividade: AtividadePlano) => void;
  onAdicionarTaticasSugeridas: (atividade: AtividadePlano) => void;
  onAbrirModalDAR_CERTO: (atividade: AtividadePlano, categoria: string) => void;  
  onAbrirModalPersonalizado: (atividade: AtividadePlano, eixo: Eixo) => void;     
  onAtualizarTatica: (atividadeId: string, taticaId: string, patch: Partial<Tatica>) => void;
  onAtualizarImpacto: (
    atividadeId: string, 
    taticaId: string, 
    campo: keyof NonNullable<Tatica["impactos"]>, 
    valor: ImpactoFlag | undefined
  ) => void;
  onToggleConcluida: (atividadeId: string, taticaId: string) => void;
  onRemoverTatica: (atividadeId: string, taticaId: string) => void;
onEditarTatica?: (atividade: AtividadePlano, tatica: Tatica) => void;
}

export function AtividadeCard({
  atividade,
  taticas,
  isExpanded,
  onToggle,
  onAdicionarTatica,
  onAdicionarTaticaGenerica,
  onAdicionarTaticasSugeridas,
  onAbrirModalDAR_CERTO,        // 🆕
  onAbrirModalPersonalizado,    // 🆕
  onAtualizarTatica,
  onAtualizarImpacto,
  onToggleConcluida,
  onRemoverTatica,
  onEditarTatica 
}: AtividadeCardProps) {
  const [showFramework, setShowFramework] = React.useState(false); // 🆕 NOVO ESTADO
  const zona = zonaDaAtividade(atividade);
  const zonaColor = zona === "Essencial" ? TEMA.positive : 
                   zona === "Estratégica" ? TEMA.info : 
                   zona === "Tática" ? TEMA.warning : TEMA.danger;

  return (
    <div 
      className="rounded-2xl p-6 transition-all duration-200"
      style={{ background: TEMA.card, border: `1px solid ${TEMA.cardBorder}` }}
    >
      {/* Header da atividade */}
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            {/* Tag da Zona - Simplificada com ícone */}
            <div 
              className="px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1"
              style={{ 
                background: `${zonaColor}20`, 
                color: zonaColor,
                border: `1px solid ${zonaColor}40`
              }}
            >
              {zona === "Essencial" ? "🟢" :
               zona === "Estratégica" ? "🔵" :
               zona === "Tática" ? "🟡" : "🔴"} 
              {zona}
            </div>
            
            {/* Tempo - Apenas info essencial */}
            <div 
              className="px-3 py-1 rounded-full text-sm flex items-center gap-1"
              style={{ background: TEMA.chipBg, color: TEMA.subtext }}
            >
              <Timer className="w-3 h-3"/> 
              {atividade.horasMes.toFixed(0)}h/mês
            </div>
            
            {/* Score simplificado - apenas quando relevante */}
            <div 
              className="px-2 py-1 rounded text-xs"
              style={{ 
                background: scoreIC(atividade) >= 20 ? "rgba(34, 197, 94, 0.1)" : "rgba(156, 163, 175, 0.1)",
                color: scoreIC(atividade) >= 20 ? "#22c55e" : "#9ca3af"
              }}
            >
              {scoreIC(atividade) >= 20 ? "🔥 Alta prioridade" : `Score ${scoreIC(atividade)}`}
            </div>
          </div>
          
          <h2 className="text-xl font-semibold mb-2" style={{ color: TEMA.text }}>
            {atividade.titulo}
          </h2>
          {atividade.descricao && (
            <p className="text-sm" style={{ color: TEMA.subtext }}>
              {atividade.descricao}
            </p>
          )}
        </div>
        
        {/* Métricas e Botão - Responsivo */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm" style={{ color: TEMA.subtext }}>Clareza</span>
              <Meter value={atividade.clareza} max={6} color={TEMA.info} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm" style={{ color: TEMA.subtext }}>Impacto</span>
              <Meter value={atividade.impacto} max={6} color={TEMA.accent} />
            </div>
          </div>
          
          <button 
            onClick={onToggle}
            className={cn(
              "px-4 py-2 rounded-xl text-xs sm:text-sm border flex items-center justify-center gap-2",
              "transition-all duration-200 hover:opacity-90",
              "w-full sm:w-auto"
            )}
            style={{ 
              borderColor: TEMA.cardBorder, 
              background: isExpanded ? TEMA.brand : "transparent",
              color: isExpanded ? TEMA.bg : TEMA.text
            }}
          >
            Gerenciar Táticas ({taticas.length})
            <ChevronDown className={cn(
              "w-4 h-4 transition-transform duration-200",
              isExpanded && "rotate-180"
            )} />
          </button>
        </div>
      </div>

      {/* Conteúdo expandido */}
      {isExpanded && (
        <div className="space-y-6">
         
 {/* 🎯 SISTEMA BASEADO NA ZONA */}
<div className="space-y-4">
  {/* Botão Toggle para Mostrar/Esconder Framework */}
  <button
    onClick={() => setShowFramework(!showFramework)}
    className={cn(
      "w-full p-3 rounded-xl border-2 border-dashed transition-all duration-200",
      "hover:bg-white/5 hover:border-white/30 flex items-center justify-center gap-2",
      "text-sm font-medium",
      showFramework && "bg-white/5 border-white/20"
    )}
    style={{ borderColor: TEMA.cardBorder, color: TEMA.text }}
  >
    <Plus className="w-4 h-4" />
    <span>
      {showFramework ? 'Ocultar' : 'Mostrar'} Framework {zona === "Distração" || zona === "Tática" ? "DAR CERTO" : `para ${zona}`}
    </span>
    <ChevronDown className={cn(
      "w-4 h-4 transition-transform duration-200",
      showFramework && "rotate-180"
    )} />
  </button>

  {/* Conteúdo do Framework - MANTÉM TUDO IGUAL */}
  {showFramework && (
    <>
      {/* Para Distração e Tática: Framework DAR CERTO */}
      {(zona === "Distração" || zona === "Tática") && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-medium" style={{ color: TEMA.text }}>
              🎯 Framework DAR CERTO:
            </span>
            <span className="text-xs" style={{ color: TEMA.subtext }}>
              Escolha a estratégia ideal para esta atividade
            </span>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {Object.entries(DAR_CERTO_FRAMEWORK)
              .filter(([_, config]) => config.aplicavelEm.includes(zona))
              .map(([categoria, config]) => (
                <button
                  key={categoria}
                  onClick={() => onAbrirModalDAR_CERTO(atividade, categoria)}
                  className={cn(
                    "p-3 rounded-lg border text-sm transition-all duration-200",
                    "hover:opacity-80 hover:scale-105 flex flex-col items-center gap-2"
                  )}
                  style={{ 
                    borderColor: TEMA.cardBorder,
                    background: "rgba(255,255,255,0.03)",
                    color: TEMA.text
                  }}
                >
                  <span className="text-lg">
                    {categoria === "DESCARTAR" ? "🗑️" :
                     categoria === "AUTOMATIZAR" ? "⚡" :
                     categoria === "REDUZIR" ? "📉" :
                     categoria === "COMBINAR" ? "📦" :
                     categoria === "ENCAMINHAR" ? "➡️" :
                     categoria === "REVISITAR" ? "🔄" :
                     categoria === "TREINAR" ? "👥" :
                     categoria === "OTIMIZAR" ? "⚙️" : "🎯"}
                  </span>
                  <div className="text-center">
                    <div className="font-medium">{categoria}</div>
                    <div className="text-xs mt-1" style={{ color: TEMA.subtext }}>
                      {config.descricao.split(' ').slice(0, 3).join(' ')}...
                    </div>
                  </div>
                </button>
              ))
            }
          </div>
        </div>
      )}

      {/* Para Essencial: Framework específico */}
      {zona === "Essencial" && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-medium" style={{ color: TEMA.text }}>
              🏆 Proteger o essencial:
            </span>
            <span className="text-xs" style={{ color: TEMA.subtext }}>
              Garanta qualidade e consistência no que não pode falhar
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onAbrirModalDAR_CERTO(atividade, "PADRONIZAR")}
              className={cn(
                "p-3 rounded-lg text-sm font-medium transition-all duration-200",
                "bg-white/5 border border-white/10 text-white hover:bg-white/10"
              )}
            >
              <span className="text-lg mb-1 block">📋</span>
              <div className="text-center">
                <div className="font-medium">PADRONIZAR</div>
                <div className="text-xs mt-1 opacity-90">
                  Modelos e checklists
                </div>
              </div>
            </button>

            <button
              onClick={() => onAbrirModalDAR_CERTO(atividade, "CRIAR_RITUAIS")}
              className={cn(
                "p-3 rounded-lg text-sm font-medium transition-all duration-200",
                "bg-white/5 border border-white/10 text-white hover:bg-white/10"
              )}
            >
              <span className="text-lg mb-1 block">⏰</span>
              <div className="text-center">
                <div className="font-medium">CRIAR RITUAIS</div>
                <div className="text-xs mt-1 opacity-90">
                  Blocos fixos
                </div>
              </div>
            </button>

            <button
              onClick={() => onAbrirModalDAR_CERTO(atividade, "REVISAR")}
              className={cn(
                "p-3 rounded-lg text-sm font-medium transition-all duration-200",
                "bg-white/5 border border-white/10 text-white hover:bg-white/10"
              )}
            >
              <span className="text-lg mb-1 block">✅</span>
              <div className="text-center">
                <div className="font-medium">REVISAR</div>
                <div className="text-xs mt-1 opacity-90">
                  Garantir qualidade
                </div>
              </div>
            </button>

            <button
              onClick={() => onAbrirModalDAR_CERTO(atividade, "PROTEGER_FOCO")}
              className={cn(
                "p-3 rounded-lg text-sm font-medium transition-all duration-200",
                "bg-white/5 border border-white/10 text-white hover:bg-white/10"
              )}
            >
              <span className="text-lg mb-1 block">🎯</span>
              <div className="text-center">
                <div className="font-medium">PROTEGER FOCO</div>
                <div className="text-xs mt-1 opacity-90">
                  60-90min concentração
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Para Estratégica: Framework específico */}
      {zona === "Estratégica" && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-medium" style={{ color: TEMA.text }}>
              🔍 Dar forma ao estratégico:
            </span>
            <span className="text-xs" style={{ color: TEMA.subtext }}>
              Transforme ideias promissoras em ações concretas
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onAbrirModalDAR_CERTO(atividade, "DAR_FORMA")}
              className={cn(
                "p-3 rounded-lg text-sm font-medium transition-all duration-200",
                "bg-white/5 border border-white/10 text-white hover:bg-white/10"
              )}
            >
              <span className="text-lg mb-1 block">🎨</span>
              <div className="text-center">
                <div className="font-medium">DAR FORMA</div>
                <div className="text-xs mt-1 opacity-90">
                  Diagnóstico de clareza
                </div>
              </div>
            </button>

            <button
              onClick={() => onAbrirModalDAR_CERTO(atividade, "DIVIDIR")}
              className={cn(
                "p-3 rounded-lg text-sm font-medium transition-all duration-200",
                "bg-white/5 border border-white/10 text-white hover:bg-white/10"
              )}
            >
              <span className="text-lg mb-1 block">🧩</span>
              <div className="text-center">
                <div className="font-medium">DIVIDIR</div>
                <div className="text-xs mt-1 opacity-90">
                  Pequenas partes, MVP
                </div>
              </div>
            </button>

            <button
              onClick={() => onAbrirModalDAR_CERTO(atividade, "CHECKPOINT")}
              className={cn(
                "p-3 rounded-lg text-sm font-medium transition-all duration-200",
                "bg-white/5 border border-white/10 text-white hover:bg-white/10"
              )}
            >
              <span className="text-lg mb-1 block">📊</span>
              <div className="text-center">
                <div className="font-medium">CHECKPOINT</div>
                <div className="text-xs mt-1 opacity-90">
                  Metas e KPIs
                </div>
              </div>
            </button>

            <button
              onClick={() => onAbrirModalDAR_CERTO(atividade, "TRAZER_PARCEIROS")}
              className={cn(
                "p-3 rounded-lg text-sm font-medium transition-all duration-200",
                "bg-white/5 border border-white/10 text-white hover:bg-white/10"
              )}
            >
              <span className="text-lg mb-1 block">👥</span>
              <div className="text-center">
                <div className="font-medium">TRAZER PARCEIROS</div>
                <div className="text-xs mt-1 opacity-90">
                  Acelerar avanços
                </div>
              </div>
            </button>
          </div>
        </div>
      )}
    </>
  )}
</div>

          {/* Lista de táticas OU empty state */}
          {taticas.length === 0 ? (
            <div className="text-center py-8">
              <div 
                className="rounded-xl p-6 max-w-md mx-auto"
                style={{ background: TEMA.chipBg, border: `1px solid ${TEMA.cardBorder}` }}
              >
                <Target className="w-12 h-12 mx-auto mb-4" style={{ color: TEMA.subtext }} />
                <h4 className="font-semibold mb-2" style={{ color: TEMA.text }}>
                  Nenhuma tática criada
                </h4>
                <p className="text-sm mb-4" style={{ color: TEMA.subtext }}>
                  Crie táticas para otimizar esta atividade. Use os botões acima ou adicione táticas sugeridas.
                </p>
                <div className="flex flex-col gap-2">
                  <button
  onClick={() => {
    // Criar uma "assinatura" única para cada tática existente
    const taticasExistentesAssinaturas = taticas.map(t => 
      `${t.categoria}-${t.tipo}-${t.titulo.toLowerCase().substring(0, 20)}`
    );
    
    // Gerar sugestões e filtrar apenas as novas
    const sugestoes = sugerirTaticasBase(atividade);
    const novasSugestoes = sugestoes.filter(s => {
      const assinatura = `${s.categoria}-${s.tipo}-${s.titulo.toLowerCase().substring(0, 20)}`;
      return !taticasExistentesAssinaturas.includes(assinatura);
    });
    
    if (novasSugestoes.length === 0) {
      alert("Todas as táticas automáticas disponíveis já foram adicionadas!");
      return;
    }
    
    // Passar apenas as novas sugestões (isso requer ajuste na page.tsx)
    // Por enquanto, apenas chama a função original
    onAdicionarTaticasSugeridas(atividade);
  }}
  className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      "hover:opacity-90"
                    )}
                     style={{ background: TEMA.brand, color: TEMA.text }}

                  >
                    <Sparkles className="w-4 h-4 mr-2 inline" />
                    Adicionar Sugestões Inteligentes
                  </button>
                  <button
                    onClick={() => onAdicionarTaticaGenerica(atividade)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm transition-all border",
                      "hover:bg-white/5"
                    )}
                    style={{ borderColor: TEMA.cardBorder, color: TEMA.text }}
                  >
                    <Plus className="w-4 h-4 mr-2 inline" />
                    Nova Tática Manual
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Lista de táticas existentes */}
              {taticas.map((tatica) => (
                <TaticaItem
  key={tatica.id}
  tatica={tatica}
  atividadeId={atividade.id}
  atividade={atividade}
  onAtualizarTatica={onAtualizarTatica}
  onAtualizarImpacto={onAtualizarImpacto}
  onToggleConcluida={onToggleConcluida}
  onRemover={onRemoverTatica}
  onEditarTatica={onEditarTatica}
/>
              ))}

              {/* Botões para adicionar táticas */}
<div className="flex flex-col sm:flex-row justify-center gap-2 pt-2">
  <button
    onClick={() => onAdicionarTaticaGenerica(atividade)}
    className={cn(
      "px-4 py-2 rounded-lg border border-dashed transition-all",
      "hover:bg-white/5 hover:border-white/30 flex items-center gap-2"
    )}
    style={{ borderColor: TEMA.cardBorder, color: TEMA.text }}
  >
    <Plus className="w-4 h-4" />
    Nova Tática Manual
  </button>
  
  <button
  onClick={() => {
    // Criar uma "assinatura" única para cada tática existente
    const taticasExistentesAssinaturas = taticas.map(t => 
      `${t.categoria}-${t.tipo}-${t.titulo.toLowerCase().substring(0, 20)}`
    );
    
    // Gerar sugestões e filtrar apenas as novas
    const sugestoes = sugerirTaticasBase(atividade);
    const novasSugestoes = sugestoes.filter(s => {
      const assinatura = `${s.categoria}-${s.tipo}-${s.titulo.toLowerCase().substring(0, 20)}`;
      return !taticasExistentesAssinaturas.includes(assinatura);
    });
    
    if (novasSugestoes.length === 0) {
      alert("Todas as táticas automáticas disponíveis já foram adicionadas!");
      return;
    }
    
    // Passar apenas as novas sugestões (isso requer ajuste na page.tsx)
    // Por enquanto, apenas chama a função original
    onAdicionarTaticasSugeridas(atividade);
  }}
  className={cn(
    "px-4 py-2 rounded-lg font-medium transition-all",
    "hover:opacity-90 hover:scale-105 flex items-center gap-2"
  )}
  style={{ background: TEMA.brand, color: TEMA.text }}
>
  <Sparkles className="w-4 h-4" />
  Adicionar Sugestões Inteligentes
  </button>
</div>
            </div>
          )}

         
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 🧩 COMPONENTE 6: FOOTER DO PLANO
// ═══════════════════════════════════════════════════════════════════

interface PlanoFooterProps {
  onSalvar: () => void;
  onVoltarMapa: () => void;
}

export function PlanoFooter({ onSalvar, onVoltarMapa }: PlanoFooterProps) {
  return (
    <div className="mt-12">
      <div 
        className="rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        style={{ background: TEMA.card, border: `1px solid ${TEMA.cardBorder}` }}
      >
        <div>
          <h3 className="font-semibold mb-2" style={{ color: TEMA.text }}>
            💡 Dicas para um plano efetivo
          </h3>
          <p className="text-sm" style={{ color: TEMA.subtext }}>
            Priorize até 1-3 táticas por atividade. Menos, porém melhor. 
            Foque em ações objetivas e mensuráveis com prazo definido.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onVoltarMapa}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
              "border hover:opacity-90"
            )}
            style={{ 
              borderColor: TEMA.cardBorder, 
              color: TEMA.text,
              background: "transparent"
            }}
          >
            <Map className="w-4 h-4 mr-2 inline" />
            Voltar ao Mapa
          </button>
          
          <button
  onClick={onSalvar}
  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-medium transition-all duration-200 hover:scale-105"
>
  <Save className="w-5 h-5" />
  Salvar Plano
</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 🆕 COMPONENTE 7: ORIENTAÇÃO DO DIAGNÓSTICO
// ═══════════════════════════════════════════════════════════════════

interface OrientacaoDiagnosticoProps {
  dadosDiagnostico: {
    focoPrimario: TipoFoco;
    focoSecundario?: TipoFoco;
    metaTexto: string;
  } | null;
  onAplicarTaticasAutomaticas: () => void;
}

function OrientacaoDiagnostico({ dadosDiagnostico, onAplicarTaticasAutomaticas }: OrientacaoDiagnosticoProps) {
  const [showDiagnostico, setShowDiagnostico] = React.useState(false);

  if (!dadosDiagnostico) return null;

  const focoLabels: Record<TipoFoco, string> = {
    'REDUZIR_DISTRACAO': 'Reduzir Distração',
    'COMPRIMIR_TATICO': 'Comprimir Tático',
    'FORTALECER_ESSENCIAL': 'Fortalecer Essencial',
    'DAR_FORMA_ESTRATEGICO': 'Dar Forma ao Estratégico',
    'MANTER_PADRAO': 'Manter Padrão'
  };

  return (
    <div className="mb-4 sm:mb-6">
      {/* Header Clicável */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
        <button
          onClick={() => setShowDiagnostico(!showDiagnostico)}
          className="w-full flex items-center justify-between text-left focus:outline-none group"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-600/20 rounded-lg flex items-center justify-center">
  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
</div>
            <div>
              <h2 className="text-lg font-semibold text-white group-hover:text-orange-300 transition-colors">
                Orientação do Diagnóstico
              </h2>
              <p className="text-xs sm:text-sm text-white/60">
                Foco: {focoLabels[dadosDiagnostico.focoPrimario]}
                {dadosDiagnostico.focoSecundario && ` + ${focoLabels[dadosDiagnostico.focoSecundario]}`}
              </p>
            </div>
          </div>
          
          <ChevronDown className={cn(
            "w-4 h-4 sm:w-5 sm:h-5 text-white/60 transition-transform duration-200",
            showDiagnostico && "rotate-180"
          )} />
        </button>
      </div>

      {/* Conteúdo Expandido */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        showDiagnostico ? 'max-h-[900px] opacity-100 mt-3 sm:mt-4' : 'max-h-0 opacity-0'
      }`}>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          
          {/* Cards de Foco */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            
            {/* Foco Primário */}
            <div className="p-4 rounded-lg border-2 border-orange-500/50 bg-orange-500/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-orange-600/20">
                  <Target className="w-5 h-5" style={{ color: TEMA.brand }} />
                </div>
                <div>
                  <h4 className="font-semibold text-sm" style={{ color: TEMA.brand }}>
                    🎯 FOCO PRIMÁRIO
                  </h4>
                  <p className="font-medium" style={{ color: TEMA.text }}>
                    {focoLabels[dadosDiagnostico.focoPrimario]}
                  </p>
                </div>
              </div>
              <p className="text-sm" style={{ color: TEMA.subtext }}>
                Concentre 70% dos seus esforços aqui nas próximas 4 semanas
              </p>
            </div>

            {/* Foco Secundário */}
            {dadosDiagnostico.focoSecundario && (
              <div className="p-4 rounded-lg border border-blue-500/30 bg-blue-500/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-blue-600/20">
                    <Zap className="w-5 h-5" style={{ color: TEMA.info }} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm" style={{ color: TEMA.info }}>
                      ⚡ FOCO SECUNDÁRIO
                    </h4>
                    <p className="font-medium" style={{ color: TEMA.text }}>
                      {focoLabels[dadosDiagnostico.focoSecundario]}
                    </p>
                  </div>
                </div>
                <p className="text-sm" style={{ color: TEMA.subtext }}>
                  Ação complementar para maximizar resultados
                </p>
              </div>
            )}
          </div>

          {/* Meta */}
          <div className="p-4 rounded-lg border border-cyan-500/20 bg-cyan-500/10 mb-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-cyan-600/20">
                <Calendar className="w-5 h-5" style={{ color: "#06b6d4" }} />
              </div>
              <div>
                <h4 className="font-semibold mb-2" style={{ color: "#06b6d4" }}>
                  📅 Meta das próximas 4 semanas
                </h4>
                <p className="font-medium text-sm" style={{ color: TEMA.text }}>
                  {dadosDiagnostico.metaTexto}
                </p>
                <p className="text-xs mt-2" style={{ color: TEMA.subtext }}>
                  Refaça este diagnóstico em 30 dias para acompanhar a evolução
                </p>
              </div>
            </div>
          </div>

          {/* Botão de Ação */}
<div className="flex justify-center">
  <button
    onClick={onAplicarTaticasAutomaticas}
    className={cn(
      "px-6 py-3 rounded-xl font-medium transition-all duration-200",
      "hover:opacity-90 hover:scale-105 flex items-center gap-2"
    )}
    style={{ background: TEMA.brand, color: TEMA.text }}
  >
    <Sparkles className="w-5 h-5" />
    Aplicar Sugestões Inteligentes para todo Plano de Ação
  </button>
</div>

          {/* Info sobre ordenação - ✅ ADICIONADO DE VOLTA */}
          <div className="mt-4 p-3 rounded-lg flex items-start gap-2" style={{ background: TEMA.chipBg }}>
            <Info className="w-4 h-4 mt-0.5" style={{ color: TEMA.info }} />
            <p className="text-xs" style={{ color: TEMA.subtext }}>
              As atividades abaixo foram reordenadas com base no seu foco diagnóstico. 
              Atividades prioritárias aparecem primeiro.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
// ═══════════════════════════════════════════════════════════════════
// 🆕 FUNÇÃO UTILITÁRIA: ORDENAÇÃO POR FOCO
// ═══════════════════════════════════════════════════════════════════

function ordenarPorFocoDiagnostico(
  atividades: AtividadePlano[], 
  focoPrimario?: string
): AtividadePlano[] {
  if (!focoPrimario) return atividades;
  
  const prioridades: Record<string, string[]> = {
    'REDUZIR_DISTRACAO': ['Distração', 'Tática', 'Estratégica', 'Essencial'],
    'COMPRIMIR_TATICO': ['Tática', 'Distração', 'Estratégica', 'Essencial'], 
    'FORTALECER_ESSENCIAL': ['Essencial', 'Estratégica', 'Tática', 'Distração'],
    'DAR_FORMA_ESTRATEGICO': ['Estratégica', 'Essencial', 'Tática', 'Distração']
  };
  
  const ordem = prioridades[focoPrimario] || ['Essencial', 'Estratégica', 'Tática', 'Distração'];
  
  return [...atividades].sort((a, b) => {
    const zonaA = zonaDaAtividade(a);
    const zonaB = zonaDaAtividade(b);
    return ordem.indexOf(zonaA) - ordem.indexOf(zonaB);
  });
}
// ✅ FUNÇÃO AUXILIAR PARA SUBTÍTULOS DAS CATEGORIAS
function getSubtituloCategoria(categoria: string): string {
  const subtitulos: Record<string, string> = {
    // DAR CERTO originais
    DESCARTAR: "Aquilo que não faz sentido continuar",
    AUTOMATIZAR: "Investir tempo agora para ganhar depois", 
    REDUZIR: "Escopo, energia ou frequência",
    COMBINAR: "Reagrupar atividades, entregar junto",
    ENCAMINHAR: "Direcionar para quem é responsável",
    REVISITAR: "Ajustar ou descontinuar",
    TREINAR: "Preparar alguém para assumir",
    OTIMIZAR: "Redesenhar como a tarefa é feita",
    
    // Zona Essencial
    PADRONIZAR: "Criar modelos e checklists",
    CRIAR_RITUAIS: "Blocos fixos para atividades críticas",
    REVISAR: "Garantir precisão antes de entregar",
    PROTEGER_FOCO: "60-90min de concentração absoluta",
    
    // Zona Estratégica
    DAR_FORMA: "Diagnóstico de clareza",
    DIVIDIR: "Pequenas partes ou MVP",
    CHECKPOINT: "Metas objetivas e KPIs",
    TRAZER_PARCEIROS: "Acelerar com parceiros estratégicos"
  };
  
  return subtitulos[categoria] || "Otimizar esta atividade";
}

// ═══════════════════════════════════════════════════════════════════
// 🆕 COMPONENTE 8: MODAL DE CRIAÇÃO DAR CERTO
// ═══════════════════════════════════════════════════════════════════

interface ModalDAR_CERTOProps {
  isOpen: boolean;
  atividade: AtividadePlano;
  categoria: string;
  taticaExistente?: Tatica;  // ✅ NOVA PROPRIEDADE
  onClose: () => void;
  onSalvar: (novaTatica: Tatica) => void;
}

export function ModalDAR_CERTO({ 
  isOpen, 
  atividade, 
  categoria, 
  taticaExistente,  // ✅ NOVA PROPRIEDADE
  onClose, 
  onSalvar 
}: ModalDAR_CERTOProps) {
  const [tipo, setTipo] = React.useState<"TAREFA" | "HABITO">("TAREFA");
  const [titulo, setTitulo] = React.useState("");
  const [detalhe, setDetalhe] = React.useState("");
  const [prazo, setPrazo] = React.useState("");
  const [frequencia, setFrequencia] = React.useState<"diaria" | "semanal" | "mensal">("semanal");
  const [gatilho, setGatilho] = React.useState("");

  const categoriaConfig = DAR_CERTO_FRAMEWORK[categoria as keyof typeof DAR_CERTO_FRAMEWORK];

  React.useEffect(() => {
  if (isOpen) {
    if (taticaExistente) {
      // ✅ MODO EDIÇÃO: Preencher com dados existentes
      setTipo(taticaExistente.tipo || "TAREFA");
      setTitulo(taticaExistente.titulo || "");
      setDetalhe(taticaExistente.detalhe || "");
      setPrazo(taticaExistente.dataSugerida || "");
      setFrequencia(taticaExistente.frequencia || "semanal");
      setGatilho(taticaExistente.gatilho || "");
    } else if (categoriaConfig) {
      // ✅ MODO CRIAÇÃO: Usar sugestão da categoria
      setTipo(categoriaConfig.tipoSugerido);
      setTitulo("");
      setDetalhe("");
      setPrazo("");
      setFrequencia("semanal");
      setGatilho("");
    }
  }
}, [isOpen, categoriaConfig, taticaExistente]);

  if (!isOpen) return null;

  const handleSalvar = () => {
  if (!titulo || !detalhe) return;
  
  const novaTatica: Tatica = {
  id: taticaExistente?.id || uid(),
  tipo,
  titulo,
  detalhe,
  categoria: taticaExistente ? taticaExistente.categoria : categoria, // ✅ SEMPRE manter categoria original na edição
  impactos: taticaExistente?.impactos || {},
  concluida: taticaExistente?.concluida || false,
  ...(tipo === "TAREFA" && prazo && { dataSugerida: prazo }),
  ...(tipo === "HABITO" && { frequencia, gatilho })
};
  
  onSalvar(novaTatica);
  onClose();
  
  // Reset apenas se não for edição
  if (!taticaExistente) {
    setTitulo("");
    setDetalhe("");
    setPrazo("");
    setGatilho("");
  }
};

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-gray-900 rounded-2xl p-6 max-w-lg w-full border"
        style={{ borderColor: TEMA.cardBorder }}
      >
        {/* Header */}
       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold" style={{ color: TEMA.text }}>
  {taticaExistente ? "✏️ Editar Tática" : `${categoria} - ${getSubtituloCategoria(categoria)}`}
</h3>
            <p className="text-sm mt-1" style={{ color: TEMA.subtext }}>
              Para: {atividade.titulo}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10"
            style={{ color: TEMA.text }}
          >
            ✕
          </button>
        </div>

        {/* Tipo */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" style={{ color: TEMA.text }}>
            📋 Tipo de ação:
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setTipo("TAREFA")}
              className={cn(
                "flex-1 p-3 rounded-lg border transition-all",
                tipo === "TAREFA" && "border-orange-500 bg-orange-500/20"
              )}
              style={{ 
                borderColor: tipo === "TAREFA" ? "#d97706" : TEMA.cardBorder,
                color: TEMA.text
              }}
            >
              📋 TAREFA
              <div className="text-xs mt-1" style={{ color: TEMA.subtext }}>
                Ação pontual com prazo
              </div>
            </button>
            <button
              onClick={() => setTipo("HABITO")}
              className={cn(
                "flex-1 p-3 rounded-lg border transition-all",
                tipo === "HABITO" && "border-green-500 bg-green-500/20"
              )}
              style={{ 
                borderColor: tipo === "HABITO" ? "#22c55e" : TEMA.cardBorder,
                color: TEMA.text
              }}
            >
              🔄 HÁBITO
              <div className="text-xs mt-1" style={{ color: TEMA.subtext }}>
                Comportamento recorrente
              </div>
            </button>
          </div>
        </div>

        {/* Título */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" style={{ color: TEMA.text }}>
            📝 Título:
          </label>
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/5 border outline-none"
            style={{ borderColor: TEMA.cardBorder, color: TEMA.text }}
            placeholder={`Ex: ${tipo === "TAREFA" ? "Automatizar processo X" : "Revisar emails 2x por dia"}`}
          />
        </div>

        {/* Detalhes */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" style={{ color: TEMA.text }}>
            📋 Como executar:
          </label>
          <textarea
            value={detalhe}
            onChange={(e) => setDetalhe(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/5 border outline-none resize-none"
            style={{ borderColor: TEMA.cardBorder, color: TEMA.text }}
            rows={3}
            placeholder="Descreva os passos específicos..."
          />
        </div>

        {/* Campos específicos por tipo */}
        {tipo === "TAREFA" && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: TEMA.text }}>
              📅 Prazo (máx. 4 semanas):
            </label>
            <input
              type="date"
              value={prazo}
              onChange={(e) => setPrazo(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              max={new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              className="w-full p-3 rounded-lg bg-white/5 border outline-none"
              style={{ borderColor: TEMA.cardBorder, color: TEMA.text }}
            />
          </div>
        )}

        {tipo === "HABITO" && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: TEMA.text }}>
                📅 Frequência:
              </label>
              <select
                value={frequencia}
                onChange={(e) => setFrequencia(e.target.value as any)}
                className="w-full p-3 rounded-lg bg-white/5 border outline-none"
                style={{ borderColor: TEMA.cardBorder, color: TEMA.text }}
              >
                <option value="diaria">Diário</option>
                <option value="semanal">Semanal</option>
                <option value="mensal">Mensal</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: TEMA.text }}>
                🎯 Gatilho (quando praticar):
              </label>
              <input
                value={gatilho}
                onChange={(e) => setGatilho(e.target.value)}
                className="w-full p-3 rounded-lg bg-white/5 border outline-none"
                style={{ borderColor: TEMA.cardBorder, color: TEMA.text }}
                placeholder="Ex: Após o café da manhã, Toda segunda às 9h"
              />
            </div>
          </>
        )}

        {/* Botões */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 p-3 rounded-lg border"
            style={{ borderColor: TEMA.cardBorder, color: TEMA.text }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSalvar}
            disabled={!titulo || !detalhe}
            className="flex-1 p-3 rounded-lg font-medium disabled:opacity-50"
            style={{ background: TEMA.brand, color: TEMA.bg }}
          >
            {taticaExistente ? "💾 Salvar Alterações" : `Criar ${tipo === "TAREFA" ? "Tarefa" : "Hábito"}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 📤 EXPORTAR TODOS OS COMPONENTES
// ═══════════════════════════════════════════════════════════════════

export {
  zonaDaAtividade,
  scoreIC,
  uid,
  mapearAtividade,
  sugerirTaticasBase,
  ordenarPorFocoDiagnostico,
  OrientacaoDiagnostico,
  TEMA
};

