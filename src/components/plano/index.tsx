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
  Edit
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

function uid() {
  return Math.random().toString(36).slice(2, 9);
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
  return (
    <label className="flex items-center gap-2">
      <span 
        className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs"
        style={{ background: TEMA.chipBg, color: badgeColor }}
      >
        <span 
          className="inline-block w-2 h-2 rounded-full" 
          style={{ background: badgeColor }}
        />
        {label}
      </span>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value ? (e.target.value as ImpactoFlag) : undefined)}
        className={cn(
          "bg-transparent border-b text-xs px-1 py-1 outline-none",
          "border-white/20 focus:border-white/40 transition-colors"
        )}
        style={{ color: TEMA.text }}
      >
        <option value="">Nenhum</option>
        <option value="aumenta">Aumenta</option>
        <option value="diminui">Diminui</option>
      </select>
    </label>
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
    <PageHeader
      title="Plano de Ação"
      subtitle={`Crie táticas para suas ${totalAtividades} atividades mapeadas`}
      icon={LayoutDashboard}
      action={
        <button 
          onClick={onSalvar}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-medium",
            "transition-all duration-200 hover:opacity-90"
          )}
          style={{ background: TEMA.brand, color: TEMA.bg }}
        >
          <CheckCircle2 className="w-4 h-4 mr-2 inline" />
          Salvar Plano
        </button>
      }
    />
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
}

interface PlanoStatsProps {
  estatisticas: Estatisticas;
  atividades: AtividadePlano[];
}

export function PlanoStats({ estatisticas, atividades }: PlanoStatsProps) {
  if (atividades.length === 0) return null;

  return (
    <>
      {/* 📊 MÉTRICAS GERAIS */}
      <Section title="Visão Geral" className="mb-8">
        <MetricGrid columns={4}>
          <MetricCard
            title="Atividades Mapeadas"
            value={estatisticas.totalAtividades}
            subtitle="Do seu mapa de atividades"
            color="primary"
            icon={Target}
          />
          <MetricCard
            title="Táticas Criadas"
            value={estatisticas.totalTaticas}
            subtitle="Ações planejadas"
            color="primary"
            icon={Plus}
          />
          <MetricCard
            title="Progresso"
            value={`${estatisticas.progresso.toFixed(0)}%`}
            subtitle={`${estatisticas.taticasConcluidas}/${estatisticas.totalTaticas} concluídas`}
            color="success"
            icon={CheckCircle2}
          />
          <MetricCard
            title="Horas/Dia Total"
            value={`${estatisticas.totalHoras.toFixed(1)}h`}
            subtitle="Tempo total mapeado"
            color="warning"
            icon={Timer}
          />
        </MetricGrid>
      </Section>

      {/* 📊 DISTRIBUIÇÃO POR ZONAS */}
      <Section title="Distribuição de Horas por Zona" className="mb-8">
        <div 
          className="rounded-2xl p-6"
          style={{ background: TEMA.card, border: `1px solid ${TEMA.cardBorder}` }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5" style={{ color: TEMA.brand }} />
            <span className="text-sm" style={{ color: TEMA.subtext }}>
              Distribuição de horas por zona (diárias)
            </span>
          </div>
          
          {/* Barra de progresso */}
          <div className="w-full h-4 rounded-full overflow-hidden flex mb-4" style={{ background: TEMA.chipBg }}>
            {(["Distração", "Tática", "Estratégica", "Essencial"] as const).map((z) => {
              const w = (estatisticas.totais[z] / estatisticas.totalHoras) * 100;
              const color = z === "Essencial" ? TEMA.positive : 
                          z === "Estratégica" ? TEMA.info : 
                          z === "Tática" ? TEMA.warning : TEMA.danger;
              return (
                <div 
                  key={z} 
                  style={{ width: `${w}%`, background: color }} 
                  className="h-full transition-all duration-500" 
                />
              );
            })}
          </div>
          
          {/* Legendas */}
          <div className="flex flex-wrap gap-4">
            {(["Essencial", "Estratégica", "Tática", "Distração"] as const).map((z) => (
              <div 
                key={z} 
                className="px-3 py-2 rounded-full text-sm flex items-center gap-2"
                style={{ background: TEMA.chipBg }}
              >
                <span 
                  className="inline-block w-3 h-3 rounded-full" 
                  style={{ 
                    background: z === "Essencial" ? TEMA.positive : 
                               z === "Estratégica" ? TEMA.info : 
                               z === "Tática" ? TEMA.warning : TEMA.danger 
                  }} 
                />
                <span style={{ color: TEMA.text }}>{z}:</span>
                <span style={{ color: TEMA.subtext }}>
                  {estatisticas.totais[z].toFixed(1)} h/dia
                </span>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </>
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
  const impactoTempo = tatica.impactos?.tempo;
  const impactoClareza = tatica.impactos?.clareza;
  const impactoImpacto = tatica.impactos?.impacto;
  
  return (
    <div 
      className={cn(
        "p-4 rounded-xl border transition-all duration-200",
        tatica.concluida && "opacity-75"
      )}
      style={{ 
        borderColor: TEMA.cardBorder, 
        background: "rgba(255,255,255,0.02)" 
      }}
    >
      {/* 🆕 HEADER COM TIPO + CATEGORIA */}
      <div className="flex flex-wrap items-center gap-3 mb-3">
        {/* Badge do Tipo */}
        <div 
          className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"
          style={{ 
            background: tatica.tipo === "HABITO" ? "rgba(34, 197, 94, 0.2)" : "rgba(217, 119, 6, 0.2)",
            color: tatica.tipo === "HABITO" ? "#22c55e" : "#d97706"
          }}
        >
          {tatica.tipo === "HABITO" ? "🔄" : "📋"} 
          {tatica.tipo === "HABITO" ? "HÁBITO" : "TAREFA"}
        </div>

        {/* Badge da Categoria DAR CERTO */}
        {tatica.categoria && (
          <div 
            className="px-2 py-1 rounded text-xs"
            style={{ background: TEMA.chipBg, color: TEMA.subtext }}
          >
            {tatica.categoria}
          </div>
        )}

        {/* Frequência para hábitos */}
        {tatica.tipo === "HABITO" && tatica.frequencia && (
          <div 
            className="px-2 py-1 rounded text-xs"
            style={{ background: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}
          >
            📅 {tatica.frequencia}
          </div>
        )}

        {/* Estimativa para tarefas */}
        {tatica.tipo === "TAREFA" && tatica.estimativaHoras && (
          <div 
            className="px-2 py-1 rounded text-xs"
            style={{ background: "rgba(217, 119, 6, 0.1)", color: "#d97706" }}
          >
            ⏱️ {tatica.estimativaHoras}h
          </div>
        )}
      </div>

      {/* Header da tática */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-3">
        <button 
          onClick={() => onToggleConcluida(atividadeId, tatica.id)}
          className={cn(
            "px-3 py-2 rounded-lg border text-sm inline-flex items-center gap-2",
            "transition-all duration-200 hover:opacity-80",
            tatica.concluida ? "bg-green-500/20 border-green-500/30" : ""
          )}
          style={{ borderColor: TEMA.cardBorder }}
        >
          <CheckSquare className="w-4 h-4" />
          {tatica.tipo === "HABITO" ? 
            (tatica.concluida ? "Praticado hoje" : "Marcar como praticado") :
            (tatica.concluida ? "Concluída" : "Marcar concluída")
          }
        </button>
        
        <input
          value={tatica.titulo}
          onChange={(e) => onAtualizarTatica(atividadeId, tatica.id, { titulo: e.target.value })}
          className={cn(
            "flex-1 bg-transparent outline-none text-sm py-2",
            "border-b border-transparent focus:border-white/20",
            "transition-colors duration-200",
            tatica.concluida && "line-through"
          )}
          style={{ color: TEMA.text }}
          placeholder={tatica.tipo === "HABITO" ? "Descrição do hábito..." : "Título da tarefa..."}
        />
        
        <div className="flex items-center gap-3">
          {tatica.tipo === "TAREFA" && (
            <>
              <Calendar className="w-4 h-4" style={{ color: TEMA.subtext }} />
              <input
                type="date"
                value={tatica.dataSugerida || ""}
                onChange={(e) => onAtualizarTatica(atividadeId, tatica.id, { dataSugerida: e.target.value })}
                className={cn(
                  "bg-transparent text-sm outline-none py-1 px-2 rounded",
                  "border border-transparent focus:border-white/20",
                  "transition-colors duration-200"
                )}
                style={{ color: TEMA.text }}
              />
            </>
          )}

          {/* ✅ BOTÃO EDITAR */}
<button 
  onClick={() => onEditarTatica?.(atividade, tatica)}
  className={cn(
    "p-2 rounded-lg transition-all duration-200",
    "hover:bg-blue-500/20 hover:opacity-80"
  )}
  title="Editar tática"
>
  <Edit className="w-4 h-4" style={{ color: TEMA.info }} />
</button> 

          <button 
            onClick={() => onRemover(atividadeId, tatica.id)}
            className={cn(
              "p-2 rounded-lg transition-all duration-200",
              "hover:bg-red-500/20 hover:opacity-80"
            )}
            title="Remover"
          >
            <Trash2 className="w-4 h-4" style={{ color: TEMA.danger }} />
          </button>
        </div>
      </div>

      {/* Detalhes */}
      <div className="mb-4">
        <textarea
          value={tatica.detalhe || ""}
          onChange={(e) => onAtualizarTatica(atividadeId, tatica.id, { detalhe: e.target.value })}
          className={cn(
            "w-full bg-transparent outline-none text-sm resize-none",
            "border border-transparent focus:border-white/20 rounded p-2",
            "transition-colors duration-200"
          )}
          style={{ color: TEMA.subtext }}
          placeholder={
            tatica.tipo === "HABITO" ? 
            "Como você vai praticar este hábito? Qual o gatilho?" : 
            "Como você vai executar esta tarefa? Próximos passos?"
          }
          rows={tatica.tipo === "HABITO" ? 3 : 2}
        />
      </div>

      {/* 🆕 INFORMAÇÕES ESPECÍFICAS DO TIPO */}
      {tatica.tipo === "HABITO" && tatica.gatilho && (
        <div 
          className="p-3 rounded-lg mb-4 flex items-start gap-2"
          style={{ background: "rgba(34, 197, 94, 0.1)" }}
        >
          <span style={{ color: "#22c55e" }}>🎯</span>
          <div>
            <span className="text-sm font-medium" style={{ color: "#22c55e" }}>
              Gatilho: 
            </span>
            <span className="text-sm ml-2" style={{ color: TEMA.text }}>
              {tatica.gatilho}
            </span>
          </div>
        </div>
      )}

      {/* Seletores de impacto */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SelectImpacto
          label="Tempo"
          value={impactoTempo}
          onChange={(v) => onAtualizarImpacto(atividadeId, tatica.id, "tempo", v)}
          badgeColor={TEMA.brand}
        />
        <SelectImpacto
          label="Clareza"
          value={impactoClareza}
          onChange={(v) => onAtualizarImpacto(atividadeId, tatica.id, "clareza", v)}
          badgeColor={TEMA.info}
        />
        <SelectImpacto
          label="Impacto"
          value={impactoImpacto}
          onChange={(v) => onAtualizarImpacto(atividadeId, tatica.id, "impacto", v)}
          badgeColor={TEMA.accent}
        />
      </div>
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
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <div 
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{ background: TEMA.chipBg, color: TEMA.text }}
            >
              Zona: <span style={{ color: zonaColor }}>{zona}</span>
            </div>
            <div 
              className="px-3 py-1 rounded-full text-sm"
              style={{ background: TEMA.chipBg, color: TEMA.subtext }}
            >
              IC: {scoreIC(atividade)} (imp {atividade.impacto}/6 × clar {atividade.clareza}/6)
            </div>
            <div 
              className="px-3 py-1 rounded-full text-sm flex items-center gap-1"
              style={{ background: TEMA.chipBg, color: TEMA.subtext }}
            >
              <Timer className="w-3 h-3"/> 
              {atividade.horasDia.toFixed(1)} h/dia · {atividade.horasMes.toFixed(0)} h/mês
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
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: TEMA.subtext }}>Clareza</span>
            <Meter value={atividade.clareza} max={6} color={TEMA.info} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: TEMA.subtext }}>Impacto</span>
            <Meter value={atividade.impacto} max={6} color={TEMA.accent} />
          </div>
          
          <button 
            onClick={onToggle}
            className={cn(
              "px-4 py-2 rounded-xl text-sm border flex items-center gap-2",
              "transition-all duration-200 hover:opacity-90"
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

  {/* Para Essencial e Estratégica: Botões tradicionais */}
  {(zona === "Essencial" || zona === "Estratégica") && (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-medium" style={{ color: TEMA.text }}>
          🚀 Potencializar resultado:
        </span>
        <span className="text-xs" style={{ color: TEMA.subtext }}>
          Foque em amplificar o que já funciona
        </span>
      </div>
      
      <div className="flex flex-wrap gap-3">
        <QuickButton 
          onClick={() => onAbrirModalPersonalizado(atividade, "tempo")}
          icon={<Timer className="w-4 h-4"/>}
          label="+ Otimizar Tempo"
          color={TEMA.brand}
        />
        <QuickButton 
          onClick={() => onAbrirModalPersonalizado(atividade, "clareza")}
          icon={<Target className="w-4 h-4"/>}
          label="+ Aumentar Clareza"
          color={TEMA.info}
        />
        <QuickButton 
          onClick={() => onAbrirModalPersonalizado(atividade, "impacto")}
          icon={<ArrowUpRight className="w-4 h-4"/>}
          label="+ Amplificar Impacto"
          color={TEMA.accent}
        />
      </div>
    </div>
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
                    onClick={() => onAdicionarTaticasSugeridas(atividade)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      "hover:opacity-90"
                    )}
                    style={{ background: TEMA.brand, color: TEMA.bg }}
                  >
                    <Sparkles className="w-4 h-4 mr-2 inline" />
                    Adicionar Táticas Sugeridas
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
                    Criar Tática Personalizada
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

              {/* Botão + para adicionar nova tática */}
              <div className="flex justify-center pt-2">
                <button
                  onClick={() => onAdicionarTaticaGenerica(atividade)}
                  className={cn(
                    "px-4 py-2 rounded-lg border border-dashed transition-all",
                    "hover:bg-white/5 hover:border-white/30 flex items-center gap-2"
                  )}
                  style={{ borderColor: TEMA.cardBorder, color: TEMA.subtext }}
                >
                  <Plus className="w-4 h-4" />
                  Adicionar nova tática
                </button>
              </div>
            </div>
          )}

          {/* Sugestões para a zona */}
          <div 
            className="rounded-xl p-4 flex items-start gap-3"
            style={{ background: TEMA.chipBg }}
          >
            <Info className="w-5 h-5 mt-0.5" style={{ color: TEMA.info }} />
            <div className="text-sm">
              <strong style={{ color: TEMA.text }}>
                Sugestões para "{zona}":
              </strong>
              <p className="mt-1" style={{ color: TEMA.subtext }}>
                {sugerirTaticasBase(atividade)
                  .map((s) => s.titulo)
                  .join(" • ")}
              </p>
            </div>
          </div>
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
            className={cn(
              "px-6 py-3 rounded-xl font-medium transition-all duration-200",
              "hover:opacity-90 hover:scale-105 flex items-center gap-2"
            )}
            style={{ background: TEMA.brand, color: TEMA.bg }}
          >
            <CheckCircle2 className="w-5 h-5" />
            Salvar Plano Completo
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 🆕 COMPONENTE 7: ORIENTAÇÃO DO DIAGNÓSTICO
// ═══════════════════════════════════════════════════════════════════

interface DadosDiagnostico {
  focoPrimario: 'REDUZIR_DISTRACAO' | 'COMPRIMIR_TATICO' | 'FORTALECER_ESSENCIAL' | 'DAR_FORMA_ESTRATEGICO' | 'MANTER_PADRAO';
  focoSecundario?: 'REDUZIR_DISTRACAO' | 'COMPRIMIR_TATICO' | 'FORTALECER_ESSENCIAL' | 'DAR_FORMA_ESTRATEGICO';
  cenario: 'saudavel' | 'ajustes' | 'critico';
  metaTexto: string;
  timestamp: string;
}

interface OrientacaoDiagnosticoProps {
  dadosDiagnostico?: DadosDiagnostico;
  onAplicarTaticasAutomaticas: () => void;
}

function OrientacaoDiagnostico({ dadosDiagnostico, onAplicarTaticasAutomaticas }: OrientacaoDiagnosticoProps) {
  if (!dadosDiagnostico) return null;
  
  const focoLabels = {
    'REDUZIR_DISTRACAO': 'Reduzir Distração',
    'COMPRIMIR_TATICO': 'Comprimir Tático',
    'FORTALECER_ESSENCIAL': 'Fortalecer Essencial',
    'DAR_FORMA_ESTRATEGICO': 'Dar Forma ao Estratégico',
    'MANTER_PADRAO': 'Manter Padrão'
  };

  return (
    <Section title="🎯 Orientação do Diagnóstico" className="mb-8">
      <div 
        className="rounded-2xl p-6 border"
        style={{ 
          background: "rgba(217, 119, 6, 0.1)", 
          borderColor: "rgba(217, 119, 6, 0.3)" 
        }}
      >
        {/* Cards de Foco */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          
          {/* Foco Primário */}
          <div 
            className="p-4 rounded-lg border-2"
            style={{ 
              borderColor: "rgba(217, 119, 6, 0.5)", 
              background: "rgba(217, 119, 6, 0.1)" 
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div 
                className="p-2 rounded-lg"
                style={{ background: "rgba(217, 119, 6, 0.2)" }}
              >
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
            <div 
              className="p-4 rounded-lg border"
              style={{ 
                borderColor: "rgba(59, 130, 246, 0.3)", 
                background: "rgba(59, 130, 246, 0.1)" 
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="p-2 rounded-lg"
                  style={{ background: "rgba(59, 130, 246, 0.2)" }}
                >
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
        <div 
          className="p-4 rounded-lg border mb-6"
          style={{ 
            background: "rgba(6, 182, 212, 0.1)", 
            borderColor: "rgba(6, 182, 212, 0.2)" 
          }}
        >
          <div className="flex items-start gap-3">
            <div 
              className="p-2 rounded-lg"
              style={{ background: "rgba(6, 182, 212, 0.2)" }}
            >
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
            style={{ background: TEMA.brand, color: TEMA.bg }}
          >
            <Sparkles className="w-5 h-5" />
            Aplicar Táticas Sugeridas Automaticamente
          </button>
        </div>

        {/* Info sobre ordenação */}
        <div 
          className="mt-4 p-3 rounded-lg flex items-start gap-2"
          style={{ background: TEMA.chipBg }}
        >
          <Info className="w-4 h-4 mt-0.5" style={{ color: TEMA.info }} />
          <p className="text-xs" style={{ color: TEMA.subtext }}>
            As atividades abaixo foram reordenadas com base no seu foco diagnóstico. 
            Atividades prioritárias aparecem primeiro.
          </p>
        </div>
      </div>
    </Section>
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold" style={{ color: TEMA.text }}>
  {taticaExistente ? "✏️ Editar Tática" : `${categoria} - ${categoriaConfig?.descricao}`}
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

