// 📋 PLANO DE AÇÃO - INTEGRAÇÃO REAL COM DADOS DO MAPA (CORRIGIDO)
// Arquivo: src/app/plano-acao/page.tsx

'use client'
import React, { useEffect, useMemo, useState } from "react";
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

// Importar supabase para dados reais
import { supabase } from '@/lib/supabase';
import { sugerirTaticasAvancadas } from '@/lib/heuristica-engine';

// ═══════════════════════════════════════════════════════════════════
// 🎯 TIPOS E INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type Eixo = "tempo" | "clareza" | "impacto";
export type ImpactoFlag = "aumenta" | "diminui";

// Interface compatível com o Mapa de Atividades existente
export interface AtividadeMap {
  id?: string;
  nome: string;
  eixoX: number; // Impacto (1-6)
  eixoY: number; // Clareza (1-6)  
  horasMes: number;
  user_id?: string;
}

// Interface para o componente Plano de Ação
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
// 🎨 TEMA INTEGRADO COM DESIGN SYSTEM DA WAVE 1
// ═══════════════════════════════════════════════════════════════════

const TEMA = {
  bg: DESIGN_TOKENS.colors.background,        // #042f2e
  card: 'rgba(255,255,255,0.05)',            // Glass effect
  cardBorder: 'rgba(255,255,255,0.1)',       // Bordas suaves
  text: '#ffffff',                            // Texto principal
  subtext: 'rgba(255,255,255,0.7)',          // Texto secundário
  brand: DESIGN_TOKENS.colors.primary,       // #d97706
  accent: DESIGN_TOKENS.colors.primary,      // #d97706
  positive: DESIGN_TOKENS.colors.essencial,  // Verde
  warning: DESIGN_TOKENS.colors.tatica,      // Amarelo
  info: DESIGN_TOKENS.colors.estrategica,    // Azul
  danger: DESIGN_TOKENS.colors.distracao,    // Vermelho
  chipBg: 'rgba(255,255,255,0.08)',         // Fundo dos chips
};

// ═══════════════════════════════════════════════════════════════════
// 🧮 FUNÇÕES UTILITÁRIAS
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

// Converter dados do Mapa para formato do Plano
function mapearAtividade(ativMap: AtividadeMap): AtividadePlano {
  return {
    id: ativMap.id || uid(),
    titulo: ativMap.nome,
    impacto: ativMap.eixoX as (1 | 2 | 3 | 4 | 5 | 6),
    clareza: ativMap.eixoY as (1 | 2 | 3 | 4 | 5 | 6),
    horasMes: ativMap.horasMes,
    horasDia: ativMap.horasMes / 30, // Conversão automática
  };
}

function sugerirTaticasBase(a: AtividadePlano): Tatica[] {
  return sugerirTaticasAvancadas(a);
}

// ═══════════════════════════════════════════════════════════════════
// 🧩 COMPONENTES AUXILIARES
// ═══════════════════════════════════════════════════════════════════

interface MeterProps {
  value: number;
  max: number;
  color: string;
}

function Meter({ value, max, color }: MeterProps) {
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

function QuickButton({ onClick, icon, label, color }: QuickButtonProps) {
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

function SelectImpacto({ label, value, onChange, badgeColor }: SelectImpactoProps) {
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
// 📋 COMPONENTE PRINCIPAL - PLANO DE AÇÃO
// ═══════════════════════════════════════════════════════════════════

export default function PlanoAcaoPage() {
  // ═══════════════════════════════════════════════════════════════════
  // 🔄 ESTADOS E DADOS
  // ═══════════════════════════════════════════════════════════════════
  
  const [user, setUser] = useState<any>(null);
  const [atividadesMap, setAtividadesMap] = useState<AtividadeMap[]>([]);
  const [expandidos, setExpandidos] = useState<Record<string, boolean>>({});
  const [planos, setPlanos] = useState<Record<string, Tatica[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Converter atividades do mapa para formato do plano
  const atividades = useMemo(() => {
    return atividadesMap.map(mapearAtividade);
  }, [atividadesMap]);

  // ═══════════════════════════════════════════════════════════════════
  // 🔄 CARREGAR DADOS REAIS DO SUPABASE (SEM TÁTICAS AUTOMÁTICAS)
  // ═══════════════════════════════════════════════════════════════════
  
  useEffect(() => {
    const carregarDadosReais = async () => {
      try {
        // 1. Verificar autenticação
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          window.location.href = '/auth';
          return;
        }
        
        setUser(session.user);

        // 2. Carregar atividades reais do Supabase
        const { data: atividades, error } = await supabase
          .from('atividades')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erro ao carregar atividades:', error);
          setAtividadesMap([]);
        } else {
          // 3. Converter formato do banco para formato do componente
          const atividadesFormatadas = (atividades || []).map(item => ({
            id: item.id,
            nome: item.nome,
            eixoX: item.eixo_x,
            eixoY: item.eixo_y,
            horasMes: item.horas_mes,
            user_id: item.user_id
          })) as AtividadeMap[];
          
          setAtividadesMap(atividadesFormatadas);
        }

        // 4. Carregar planos salvos anteriormente (SEM criar táticas automáticas)
        try {
          const planosLocal = localStorage.getItem('planos-de-acao');
          if (planosLocal) {
            const planosData = JSON.parse(planosLocal) as PlanoDeAcao[];
            const planosMap: Record<string, Tatica[]> = {};
            planosData.forEach(plano => {
              planosMap[plano.atividadeId] = plano.taticas;
            });
            setPlanos(planosMap);
          }
        } catch (error) {
          console.error('Erro ao carregar planos:', error);
        }

      } catch (error) {
        console.error('Erro geral:', error);
        setAtividadesMap([]);
      } finally {
        setIsLoading(false);
      }
    };

    carregarDadosReais();
  }, []);

  // ❌ REMOVIDO: useEffect que criava táticas automáticas

  // ═══════════════════════════════════════════════════════════════════
  // 📊 MÉTRICAS E ESTATÍSTICAS
  // ═══════════════════════════════════════════════════════════════════
  
  const estatisticas = useMemo(() => {
    const totais = { Distração: 0, Tática: 0, Estratégica: 0, Essencial: 0 };
    
    atividades.forEach((a) => {
      const zona = zonaDaAtividade(a);
      totais[zona] += a.horasDia || 0;
    });
    
    const totalHoras = Object.values(totais).reduce((s, n) => s + n, 0) || 1;
    const totalAtividades = atividades.length;
    const totalTaticas = Object.values(planos).flat().length;
    const taticasConcluidas = Object.values(planos).flat().filter(t => t.concluida).length;
    
    return {
      totais,
      totalHoras,
      totalAtividades,
      totalTaticas,
      taticasConcluidas,
      progresso: totalTaticas > 0 ? (taticasConcluidas / totalTaticas) * 100 : 0
    };
  }, [atividades, planos]);

  // ═══════════════════════════════════════════════════════════════════
  // 🎛️ FUNÇÕES DE CONTROLE (CORRIGIDAS)
  // ═══════════════════════════════════════════════════════════════════

  function toggle(id: string) {
    setExpandidos((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function adicionarTatica(atividade: AtividadePlano, eixo: Eixo) {
    setPlanos((prev) => {
      const impactosDefault = 
        eixo === "tempo" ? { tempo: "diminui" as ImpactoFlag } :
        eixo === "clareza" ? { clareza: "aumenta" as ImpactoFlag } :
        { impacto: "aumenta" as ImpactoFlag };
      
      const nova: Tatica = {
        id: uid(),
        titulo: eixo === "tempo" ? "Nova tática para reduzir tempo" : 
                eixo === "clareza" ? "Nova tática para aumentar clareza" : 
                "Nova tática para aumentar impacto",
        detalhe: "",
        impactos: impactosDefault,
      };
      
      return { ...prev, [atividade.id]: [...(prev[atividade.id] || []), nova] };
    });
  }

  // Nova função para adicionar tática genérica
  function adicionarTaticaGenerica(atividade: AtividadePlano) {
    setPlanos((prev) => {
      const nova: Tatica = {
        id: uid(),
        titulo: "Nova tática",
        detalhe: "",
        impactos: {},
      };
      
      return { ...prev, [atividade.id]: [...(prev[atividade.id] || []), nova] };
    });
  }

  // Nova função para adicionar táticas sugeridas
  function adicionarTaticasSugeridas(atividade: AtividadePlano) {
    const taticasSugeridas = sugerirTaticasBase(atividade);
    setPlanos((prev) => {
      return { ...prev, [atividade.id]: [...(prev[atividade.id] || []), ...taticasSugeridas] };
    });
  }

  function atualizarTatica(atividadeId: string, taticaId: string, patch: Partial<Tatica>) {
    setPlanos((prev) => {
      const lista = prev[atividadeId] || [];
      const nova = lista.map((t) => (t.id === taticaId ? { ...t, ...patch } : t));
      return { ...prev, [atividadeId]: nova };
    });
  }

  function atualizarImpacto(
    atividadeId: string, 
    taticaId: string, 
    campo: keyof NonNullable<Tatica["impactos"]>, 
    valor: ImpactoFlag | undefined
  ) {
    setPlanos((prev) => {
      const lista = prev[atividadeId] || [];
      const nova = lista.map((t) => {
        if (t.id !== taticaId) return t;
        const impactos = { ...(t.impactos || {}) };
        if (!valor) {
          delete impactos[campo];
        } else {
          impactos[campo] = valor;
        }
        return { ...t, impactos };
      });
      return { ...prev, [atividadeId]: nova };
    });
  }

  function toggleConcluida(atividadeId: string, taticaId: string) {
    setPlanos((prev) => {
      const lista = prev[atividadeId] || [];
      const nova = lista.map((t) => 
        t.id === taticaId ? { ...t, concluida: !t.concluida } : t
      );
      return { ...prev, [atividadeId]: nova };
    });
  }

  function removerTatica(atividadeId: string, taticaId: string) {
    setPlanos((prev) => {
      const lista = prev[atividadeId] || [];
      return { ...prev, [atividadeId]: lista.filter((t) => t.id !== taticaId) };
    });
  }

  function salvarPlano() {
    const payload: PlanoDeAcao[] = atividades.map((a) => ({
      atividadeId: a.id,
      taticas: planos[a.id] || []
    }));
    
    try {
      localStorage.setItem('planos-de-acao', JSON.stringify(payload));
      alert('✅ Plano de ação salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('❌ Erro ao salvar plano de ação');
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // 🎨 RENDERIZAÇÃO
  // ═══════════════════════════════════════════════════════════════════

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full mx-auto mb-4" />
            <p style={{ color: TEMA.subtext }}>Carregando suas atividades...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* 📋 HEADER DA PÁGINA */}
      <PageHeader
        title="Plano de Ação"
        subtitle={`Crie táticas para suas ${atividades.length} atividades mapeadas`}
        icon={LayoutDashboard}
        action={
          <button 
            onClick={salvarPlano}
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
      {atividades.length > 0 && (
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
      )}

      {/* 📋 LISTA DE ATIVIDADES OU EMPTY STATE */}
      {atividades.length === 0 ? (
        <EmptyState
          icon={Map}
          title="Nenhuma atividade encontrada"
          subtitle="Vá para o Mapa de Atividades e crie algumas atividades primeiro. Depois volte aqui para criar seus planos de ação."
          actionLabel="Ir para Mapa de Atividades"
          onAction={() => window.location.href = '/dashboard'}
        />
      ) : (
        <Section title="Suas Atividades e Táticas">
          <div className="space-y-6">
            {atividades.map((atividade) => {
              const zona = zonaDaAtividade(atividade);
              const zonaColor = zona === "Essencial" ? TEMA.positive : 
                               zona === "Estratégica" ? TEMA.info : 
                               zona === "Tática" ? TEMA.warning : TEMA.danger;
              
              const taticasAtividade = planos[atividade.id] || [];
              const isExpanded = expandidos[atividade.id];

              return (
                <div 
                  key={atividade.id} 
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
                        onClick={() => toggle(atividade.id)}
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
                        Gerenciar Táticas ({taticasAtividade.length})
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
                          onClick={() => adicionarTatica(atividade, "tempo")}
                          icon={<Timer className="w-4 h-4"/>}
                          label="+ Tática de Tempo"
                          color={TEMA.brand}
                        />
                        <QuickButton 
                          onClick={() => adicionarTatica(atividade, "clareza")}
                          icon={<Target className="w-4 h-4"/>}
                          label="+ Tática de Clareza"
                          color={TEMA.info}
                        />
                        <QuickButton 
                          onClick={() => adicionarTatica(atividade, "impacto")}
                          icon={<ArrowUpRight className="w-4 h-4"/>}
                          label="+ Tática de Impacto"
                          color={TEMA.accent}
                        />
                      </div>

                      {/* Lista de táticas OU empty state */}
                      {taticasAtividade.length === 0 ? (
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
                                onClick={() => adicionarTaticasSugeridas(atividade)}
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
                                onClick={() => adicionarTaticaGenerica(atividade)}
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
                          {taticasAtividade.map((tatica) => {
                            const impactoTempo = tatica.impactos?.tempo;
                            const impactoClareza = tatica.impactos?.clareza;
                            const impactoImpacto = tatica.impactos?.impacto;
                            
                            return (
                              <div 
                                key={tatica.id} 
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
                                    onClick={() => toggleConcluida(atividade.id, tatica.id)}
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
                                    onChange={(e) => atualizarTatica(atividade.id, tatica.id, { titulo: e.target.value })}
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
                                      onChange={(e) => atualizarTatica(atividade.id, tatica.id, { dataSugerida: e.target.value })}
                                      className={cn(
                                        "bg-transparent text-sm outline-none py-1 px-2 rounded",
                                        "border border-transparent focus:border-white/20",
                                        "transition-colors duration-200"
                                      )}
                                      style={{ color: TEMA.text }}
                                    />
                                    
                                    <button 
                                      onClick={() => removerTatica(atividade.id, tatica.id)}
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
                                    onChange={(e) => atualizarTatica(atividade.id, tatica.id, { detalhe: e.target.value })}
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
                                    onChange={(v) => atualizarImpacto(atividade.id, tatica.id, "tempo", v)}
                                    badgeColor={TEMA.brand}
                                  />
                                  <SelectImpacto
                                    label="Clareza"
                                    value={impactoClareza}
                                    onChange={(v) => atualizarImpacto(atividade.id, tatica.id, "clareza", v)}
                                    badgeColor={TEMA.info}
                                  />
                                  <SelectImpacto
                                    label="Impacto"
                                    value={impactoImpacto}
                                    onChange={(v) => atualizarImpacto(atividade.id, tatica.id, "impacto", v)}
                                    badgeColor={TEMA.accent}
                                  />
                                </div>
                              </div>
                            );
                          })}

                          {/* Botão + para adicionar nova tática */}
                          <div className="flex justify-center pt-2">
                            <button
                              onClick={() => adicionarTaticaGenerica(atividade)}
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
            })}
          </div>
        </Section>
      )}

      {/* 💡 DICAS E FOOTER */}
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
              onClick={() => window.location.href = '/dashboard'}
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
              onClick={salvarPlano}
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
    </PageContainer>
  );
}