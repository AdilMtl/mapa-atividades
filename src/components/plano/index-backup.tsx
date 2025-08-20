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
  Map
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
}

export interface PlanoDeAcao {
  atividadeId: string;
  taticas: Tatica[];
}

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
  const zona = zonaDaAtividade(a);
  
  if (zona === "Distração") {
    return [
      { 
        id: uid(), 
        titulo: "Cortar 25% do tempo", 
        detalhe: "Mapear etapas de menor valor e remover/automatizar.", 
        impactos: { tempo: "diminui" } 
      },
      { 
        id: uid(), 
        titulo: "Definir resultado esperado", 
        detalhe: "Escrever 1 frase de sucesso + checklist de 3 itens.", 
        impactos: { clareza: "aumenta" } 
      },
      { 
        id: uid(), 
        titulo: "Reorientar para objetivo da área", 
        detalhe: "Vincular a um KPI ou outcome mensurável.", 
        impactos: { impacto: "aumenta" } 
      },
    ];
  }
  
  if (zona === "Tática") {
    return [
      { 
        id: uid(), 
        titulo: "Especificar próximos passos", 
        detalhe: "Dividir em 3 subtarefas com dono e prazo.", 
        impactos: { clareza: "aumenta" } 
      },
      { 
        id: uid(), 
        titulo: "Criar macro/automação", 
        detalhe: "Reduzir tempo com modelo, script ou template.", 
        impactos: { tempo: "diminui" } 
      },
      { 
        id: uid(), 
        titulo: "Aumentar alcance", 
        detalhe: "Compartilhar resultado com stakeholders-chave.", 
        impactos: { impacto: "aumenta" } 
      },
    ];
  }
  
  if (zona === "Estratégica") {
    return [
      { 
        id: uid(), 
        titulo: "Mapear entregáveis", 
        detalhe: "Definir o que é 'feito', riscos e critérios.", 
        impactos: { clareza: "aumenta" } 
      },
      { 
        id: uid(), 
        titulo: "Alinhar com objetivos", 
        detalhe: "Checagem de alinhamento OKR/meta trimestral.", 
        impactos: { impacto: "aumenta" } 
      },
      { 
        id: uid(), 
        titulo: "Timebox semanal", 
        detalhe: "Limitar a X h/semana e proteger foco.", 
        impactos: { tempo: "diminui" } 
      },
    ];
  }
  
  return [
    { 
      id: uid(), 
      titulo: "Amplificar resultado", 
      detalhe: "Multiplicar efeito (reuso, playbook, demo).", 
      impactos: { impacto: "aumenta" } 
    },
    { 
      id: uid(), 
      titulo: "Refino do escopo", 
      detalhe: "Eliminar ambiguidade restante.", 
      impactos: { clareza: "aumenta" } 
    },
    { 
      id: uid(), 
      titulo: "Padronizar/automatizar", 
      detalhe: "Reduzir tempo com checklist/template.", 
      impactos: { tempo: "diminui" } 
    },
  ];
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
  onAtualizarTatica: (atividadeId: string, taticaId: string, patch: Partial<Tatica>) => void;
  onAtualizarImpacto: (
    atividadeId: string, 
    taticaId: string, 
    campo: keyof NonNullable<Tatica["impactos"]>, 
    valor: ImpactoFlag | undefined
  ) => void;
  onToggleConcluida: (atividadeId: string, taticaId: string) => void;
  onRemover: (atividadeId: string, taticaId: string) => void;
}

export function TaticaItem({ 
  tatica, 
  atividadeId, 
  onAtualizarTatica, 
  onAtualizarImpacto, 
  onToggleConcluida, 
  onRemover 
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
          {tatica.concluida ? "Concluída" : "Marcar concluída"}
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
          placeholder="Título da tática..."
        />
        
        <div className="flex items-center gap-3">
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
          
          <button 
            onClick={() => onRemover(atividadeId, tatica.id)}
            className={cn(
              "p-2 rounded-lg transition-all duration-200",
              "hover:bg-red-500/20 hover:opacity-80"
            )}
            title="Remover tática"
          >
            <Trash2 className="w-4 h-4" style={{ color: TEMA.danger }} />
          </button>
        </div>
      </div>

      {/* Detalhes da tática */}
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
          placeholder="Detalhe da ação (como você vai executar esta tática?)"
          rows={2}
        />
      </div>

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
  onAtualizarTatica: (atividadeId: string, taticaId: string, patch: Partial<Tatica>) => void;
  onAtualizarImpacto: (
    atividadeId: string, 
    taticaId: string, 
    campo: keyof NonNullable<Tatica["impactos"]>, 
    valor: ImpactoFlag | undefined
  ) => void;
  onToggleConcluida: (atividadeId: string, taticaId: string) => void;
  onRemoverTatica: (atividadeId: string, taticaId: string) => void;
}

export function AtividadeCard({
  atividade,
  taticas,
  isExpanded,
  onToggle,
  onAdicionarTatica,
  onAdicionarTaticaGenerica,
  onAdicionarTaticasSugeridas,
  onAtualizarTatica,
  onAtualizarImpacto,
  onToggleConcluida,
  onRemoverTatica
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
          {/* Botões para adicionar táticas */}
          <div className="flex flex-wrap gap-3">
            <QuickButton 
              onClick={() => onAdicionarTatica(atividade, "tempo")}
              icon={<Timer className="w-4 h-4"/>}
              label="+ Tática de Tempo"
              color={TEMA.brand}
            />
            <QuickButton 
              onClick={() => onAdicionarTatica(atividade, "clareza")}
              icon={<Target className="w-4 h-4"/>}
              label="+ Tática de Clareza"
              color={TEMA.info}
            />
            <QuickButton 
              onClick={() => onAdicionarTatica(atividade, "impacto")}
              icon={<ArrowUpRight className="w-4 h-4"/>}
              label="+ Tática de Impacto"
              color={TEMA.accent}
            />
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
                  onAtualizarTatica={onAtualizarTatica}
                  onAtualizarImpacto={onAtualizarImpacto}
                  onToggleConcluida={onToggleConcluida}
                  onRemover={onRemoverTatica}
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
// 📤 EXPORTAR TODOS OS COMPONENTES
// ═══════════════════════════════════════════════════════════════════

export {
  zonaDaAtividade,
  scoreIC,
  uid,
  mapearAtividade,
  sugerirTaticasBase,
  TEMA
};