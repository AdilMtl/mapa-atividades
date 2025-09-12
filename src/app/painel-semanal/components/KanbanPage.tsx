'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Target, 
  ArrowLeft,
  Plus,
  Filter,
  Clock,
  User,
  CheckCircle2,
  MoreVertical,
  Loader2,
  GripVertical,
  ChevronDown,
  Search,
  LayoutGrid,
  List,
  HelpCircle,    // 🆕 ADICIONE
  Smartphone,    // 🆕 ADICIONE  
  ArrowRight
} from 'lucide-react';

// Importar design system e componentes base
import { DESIGN_TOKENS, cn } from '@/lib/design-system';
import { PageContainer } from '@/components/base';

// Importar tipos e funções
import type { KanbanBoard, TaticaKanban, KanbanStatus } from '@/components/plano';
import { getKanbanData, moverTaticaKanban } from '@/lib/kanban/database';

// ═══════════════════════════════════════════════════════════════════
// 🎨 TEMA E CONFIGURAÇÕES
// ═══════════════════════════════════════════════════════════════════

const TEMA = {
  bg: DESIGN_TOKENS.colors.background,
  card: 'rgba(255,255,255,0.05)',
  cardBorder: 'rgba(255,255,255,0.1)',
  text: '#ffffff',
  subtext: 'rgba(255,255,255,0.7)',
  brand: DESIGN_TOKENS.colors.primary,
  chipBg: 'rgba(255,255,255,0.08)',
};

const CORES_COLUNAS = {
  backlog: '#6b7280',
  para_fazer: '#f59e0b',
  fazendo: '#3b82f6',
  feito: '#22c55e'
};

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.4',
      },
    },
  }),
};

// ═══════════════════════════════════════════════════════════════════
// 🎯 COMPONENTE CARD DA TÁTICA - MOBILE OPTIMIZED
// ═══════════════════════════════════════════════════════════════════

interface TaticaCardProps {
  tatica: TaticaKanban;
  isOverlay?: boolean;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
  leftColor?: string;
  rightColor?: string;
  leftLabel?: string;
  rightLabel?: string;
}

const TaticaCard = ({ 
  tatica, 
  isOverlay = false,
  onMoveLeft,
  onMoveRight,
  canMoveLeft = false,
  canMoveRight = false,
  leftColor = '#6b7280',
  rightColor = '#6b7280',
  leftLabel = '',
  rightLabel = ''
}: TaticaCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: tatica.id,
    data: {
      type: 'tatica',
      tatica,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: isDragging ? 'grabbing' : 'grab', 
  };

  const getCategoriaColor = (categoria: string) => {
    const colors = {
      'DESCARTAR': DESIGN_TOKENS.colors.distracao,
      'AUTOMATIZAR': DESIGN_TOKENS.colors.estrategica,
      'REDUZIR': DESIGN_TOKENS.colors.tatica,
      'COMBINAR': '#8b5cf6',
      'OTIMIZAR': DESIGN_TOKENS.colors.essencial,
      'REVISITAR': '#6366f1'
    };
    return colors[categoria as keyof typeof colors] || '#6b7280';
  };

  if (isOverlay) {
    return (
      <div 
        className="rounded-xl p-4 border shadow-xl rotate-3 scale-105"
        style={{ 
          background: TEMA.card, 
          borderColor: TEMA.cardBorder,
          backdropFilter: 'blur(8px)',
        }}
      >
        <CardContent 
          tatica={tatica} 
          getCategoriaColor={getCategoriaColor} 
          isExpanded={true}
          onToggleExpand={() => {}}
          isMobile={false}
          showMobileControls={false}
        />
      </div>
    );
  }

  return (
    <>
      {/* Desktop: Drag & Drop normal */}
      <div 
        ref={setNodeRef}
        style={{
          ...style,
          background: TEMA.card, 
          borderColor: TEMA.cardBorder,
          backdropFilter: 'blur(8px)',
        }}
        {...attributes}
        {...listeners}
        className={cn(
          "rounded-xl p-4 mb-3 transition-all duration-200 border select-none",
          "hover:scale-[1.02] hover:shadow-lg",
          "cursor-grab hover:cursor-grab active:cursor-grabbing",
          "touch-manipulation",
          "hidden sm:block",
          isDragging && "opacity-50"
        )}
      >
        <CardContent 
          tatica={tatica} 
          getCategoriaColor={getCategoriaColor} 
          isExpanded={true}
          onToggleExpand={() => {}}
          isMobile={false}
          showMobileControls={false}
        />
      </div>

      {/* Mobile: Cards expansíveis com setas */}
      <div 
        className={cn(
          "rounded-xl border mb-3 transition-all duration-200 select-none",
          "sm:hidden",
          isExpanded ? "shadow-lg" : "shadow-sm"
        )}
        style={{ 
          background: TEMA.card, 
          borderColor: TEMA.cardBorder,
          backdropFilter: 'blur(8px)',
        }}
      >
        <CardContent 
          tatica={tatica} 
          getCategoriaColor={getCategoriaColor} 
          isExpanded={isExpanded}
          onToggleExpand={() => setIsExpanded(!isExpanded)}
          isMobile={true}
          showMobileControls={true}
          onMoveLeft={onMoveLeft}
          onMoveRight={onMoveRight}
          canMoveLeft={canMoveLeft}
          canMoveRight={canMoveRight}
          leftColor={leftColor}
          rightColor={rightColor}
          leftLabel={leftLabel}
          rightLabel={rightLabel}
        />
      </div>
    </>
  );
};

// Componente auxiliar para o conteúdo do card - CORRIGIDO
const CardContent = ({ 
  tatica, 
  getCategoriaColor,
  isExpanded,
  onToggleExpand,
  isMobile,
  showMobileControls,
  onMoveLeft,
  onMoveRight,
  canMoveLeft = false,
  canMoveRight = false,
  leftColor = '#6b7280',
  rightColor = '#6b7280',
  leftLabel = '',
  rightLabel = ''
}: { 
  tatica: TaticaKanban; 
  getCategoriaColor: (categoria: string) => string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  isMobile: boolean;
  showMobileControls: boolean;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
  leftColor?: string;
  rightColor?: string;
  leftLabel?: string;
  rightLabel?: string;
}) => (
  <div className={isMobile ? "p-4" : ""}>


    {/* Mobile: Controles de movimento no topo - CORRIGIDO */}
    {showMobileControls && (
      <div className="flex items-center justify-between mb-4 gap-2">
       

 {/* Seta esquerda - CORRIGIDA */}
        <button
          onClick={onMoveLeft}
          disabled={!canMoveLeft}
          className={cn(
            "flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-xs font-medium transition-all flex-shrink-0",
            "w-16 h-8",
            canMoveLeft 
              ? "hover:scale-105 active:scale-95" 
              : "opacity-30 cursor-not-allowed"
          )}
          style={{ 
            backgroundColor: canMoveLeft ? `${leftColor}30` : 'rgba(255,255,255,0.05)',
            color: canMoveLeft ? leftColor : TEMA.subtext,
            border: `1px solid ${canMoveLeft ? leftColor + '60' : 'rgba(255,255,255,0.1)'}`
          }}
        >
          <span className="text-base">◀</span>
        </button>

        {/* Indicador de posição - CORRIGIDO */}
        <div className="flex items-center justify-center gap-2 flex-1">
          {['backlog', 'para_fazer', 'fazendo', 'feito'].map((status, index) => (
            <div
              key={status}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300 flex-shrink-0",
                tatica.status_kanban === status ? "scale-125 ring-1 ring-white/40" : "opacity-50"
              )}
              style={{ 
                backgroundColor: tatica.status_kanban === status 
                  ? CORES_COLUNAS[status as keyof typeof CORES_COLUNAS] 
                  : '#6b7280'
              }}
            />
          ))}
        </div>

        {/* Seta direita - CORRIGIDA */}
        <button
          onClick={onMoveRight}
          disabled={!canMoveRight}
          className={cn(
            "flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-xs font-medium transition-all flex-shrink-0",
            "w-16 h-8",
            canMoveRight 
              ? "hover:scale-105 active:scale-95" 
              : "opacity-30 cursor-not-allowed"
          )}
          style={{ 
            backgroundColor: canMoveRight ? `${rightColor}30` : 'rgba(255,255,255,0.05)',
            color: canMoveRight ? rightColor : TEMA.subtext,
            border: `1px solid ${canMoveRight ? rightColor + '60' : 'rgba(255,255,255,0.1)'}`
          }}
        >
          <span className="text-base">▶</span>
        </button>
      </div>
    )}

    {/* Header com atividade mãe */}
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: tatica.atividade?.cor }}
        />
        <span 
          className="text-xs truncate"
          style={{ color: TEMA.subtext }}
          title={tatica.atividade?.nome}
        >
          {tatica.atividade?.nome || 'Sem atividade'}
        </span>
      </div>
      
      {isMobile ? (
        <button 
          onClick={onToggleExpand}
          className="p-1 rounded hover:bg-white/10 flex-shrink-0"
        >
          <ChevronDown 
            size={14} 
            style={{ color: TEMA.subtext }}
            className={cn("transition-transform", isExpanded && "rotate-180")}
          />
        </button>
      ) : (
        <button 
          className="p-1 rounded hover:bg-white/10 flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical size={14} style={{ color: TEMA.subtext }} />
        </button>
      )}
    </div>

    {/* Título da tática */}
    <h4 
      className="font-semibold text-sm mb-2 leading-tight line-clamp-2" 
      style={{ color: TEMA.text }}
      title={tatica.titulo}
    >
      {tatica.titulo}
    </h4>

    {/* Conteúdo expansível para mobile */}
    {(!isMobile || isExpanded) && (
      <>
        {tatica.detalhe && (
          <p 
            className="text-xs mb-3 opacity-80 line-clamp-3" 
            style={{ color: TEMA.subtext }}
            title={tatica.detalhe}
          >
            {tatica.detalhe}
          </p>
        )}

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {tatica.categoria && (
              <div 
                className="px-2 py-1 rounded text-xs font-medium truncate"
                style={{ 
                  backgroundColor: `${getCategoriaColor(tatica.categoria)}20`,
                  color: getCategoriaColor(tatica.categoria)
                }}
                title={tatica.categoria}
              >
                {tatica.categoria}
              </div>
            )}
            
            <div 
              className="px-2 py-1 rounded text-xs font-medium flex-shrink-0"
              style={{ 
                backgroundColor: tatica.tipo === 'TAREFA' ? `${TEMA.brand}20` : `${DESIGN_TOKENS.colors.essencial}20`,
                color: tatica.tipo === 'TAREFA' ? TEMA.brand : DESIGN_TOKENS.colors.essencial
              }}
              title={tatica.tipo}
            >
              {tatica.tipo === 'TAREFA' ? '📋' : '🔄'}
            </div>
          </div>

          {tatica.estimativa_horas && (
            <div 
              className="flex items-center gap-1 text-xs flex-shrink-0" 
              style={{ color: TEMA.subtext }}
              title={`${tatica.estimativa_horas} horas estimadas`}
            >
              <Clock size={12} />
              <span>{tatica.estimativa_horas}h</span>
            </div>
          )}
        </div>
      </>
    )}
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// 🗂️ COMPONENTE COLUNA - CORRIGIDO
// ═══════════════════════════════════════════════════════════════════

interface KanbanColunaProps {
  id: KanbanStatus;
  title: string;
  taticas: TaticaKanban[];
  icon: React.ReactNode;
  color: string;
  setBoard: React.Dispatch<React.SetStateAction<KanbanBoard>>;
  user: any;
  moverTaticaKanban: (taticaId: string, newStatus: KanbanStatus, order: number, userId: string) => Promise<any>;
}

const KanbanColuna = ({ id, title, taticas, icon, color, setBoard, user, moverTaticaKanban }: KanbanColunaProps) => {
  const {
    setNodeRef,
    isOver,
  } = useSortable({
    id,
    data: {
      type: 'column',
      column: id,
    },
    disabled: true,
  });

  // Função para mover tática (mobile) - CORRIGIDA
  const moveTatica = async (taticaId: string, newStatus: KanbanStatus) => {
    // Atualizar estado local primeiro
    setBoard((prev) => {
      const newBoard = { ...prev };
      let movedTatica: TaticaKanban | null = null;
      
      // Encontrar e remover a tática da coluna atual
      for (const [currentStatus, items] of Object.entries(newBoard)) {
        const index = items.findIndex(item => item.id === taticaId);
        if (index !== -1) {
          [movedTatica] = items.splice(index, 1);
          break;
        }
      }
      
      // Adicionar na nova coluna se encontrou a tática
      if (movedTatica) {
        movedTatica.status_kanban = newStatus;
        newBoard[newStatus].push(movedTatica);
      }
      
      return newBoard;
    });

    // Salvar no banco
    if (user?.id) {
      try {
        await moverTaticaKanban(taticaId, newStatus, 0, user.id);
        console.log('✅ Tática movida via setas mobile');
      } catch (error) {
        console.error('❌ Erro ao salvar movimento mobile:', error);
      }
    }
  };

  // Determinar status das setas para cada tática
  const getArrowProps = (tatica: TaticaKanban) => {
    const currentStatus = tatica.status_kanban;
    const statusOrder: KanbanStatus[] = ['backlog', 'para_fazer', 'fazendo', 'feito'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    
    const canMoveLeft = currentIndex > 0;
    const canMoveRight = currentIndex < statusOrder.length - 1;
    
    const leftStatus = canMoveLeft ? statusOrder[currentIndex - 1] : null;
    const rightStatus = canMoveRight ? statusOrder[currentIndex + 1] : null;
    
    return {
      canMoveLeft,
      canMoveRight,
      leftColor: leftStatus ? CORES_COLUNAS[leftStatus] : '#6b7280',
      rightColor: rightStatus ? CORES_COLUNAS[rightStatus] : '#6b7280',
      leftLabel: leftStatus ? getStatusLabel(leftStatus) : '',
      rightLabel: rightStatus ? getStatusLabel(rightStatus) : '',
      onMoveLeft: canMoveLeft ? () => moveTatica(tatica.id, leftStatus!) : undefined,
      onMoveRight: canMoveRight ? () => moveTatica(tatica.id, rightStatus!) : undefined,
    };
  };

  const getStatusLabel = (status: KanbanStatus): string => {
    const labels = {
      'backlog': 'Backlog',
      'para_fazer': 'Para Fazer',
      'fazendo': 'Fazendo',
      'feito': 'Feito'
    };
    return labels[status];
  };

  return (
    <div 
      className={cn(
        "flex-1 rounded-xl border min-w-[280px] max-w-[320px] flex flex-col",
        "transition-colors duration-200",
        isOver && "bg-white/5"
      )}
      style={{ 
        background: TEMA.card,
        borderColor: isOver ? color : TEMA.cardBorder,
        backdropFilter: 'blur(8px)'
      }}
    >
      {/* Header da coluna */}
      <div className="p-4 border-b flex-shrink-0" style={{ borderColor: TEMA.cardBorder }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${color}20`, color }}
            >
              {icon}
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: TEMA.text }}>
                {title}
              </h3>
              <span 
                className="text-xs px-2 py-1 rounded-full"
                style={{ 
                  backgroundColor: TEMA.chipBg, 
                  color: TEMA.subtext 
                }}
              >
                {taticas.length} {taticas.length === 1 ? 'tarefa' : 'tarefas'}
              </span>
            </div>
          </div>
          <button 
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            style={{ color: TEMA.subtext }}
            title="Adicionar nova tarefa"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Área de drop */}
      <div 
        ref={setNodeRef}
        className={cn(
          "p-4 flex-1 min-h-[400px] transition-colors duration-200",
          isOver && "bg-white/5"
        )}
      >
        <SortableContext items={taticas.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {taticas.length > 0 ? (
            <div className="space-y-0">
              {taticas.map((tatica) => {
                const arrowProps = getArrowProps(tatica);
                return (
                  <TaticaCard 
                    key={tatica.id} 
                    tatica={tatica} 
                    {...arrowProps}
                  />
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-4xl mb-3 opacity-50">📋</div>
                <p className="text-sm opacity-70" style={{ color: TEMA.subtext }}>
                  {isOver ? 'Solte aqui' : 'Nenhuma tarefa'}
                </p>
              </div>
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// 📱 COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════

export default function KanbanPage() {
  const router = useRouter();
  const [board, setBoard] = useState<KanbanBoard>({
    backlog: [],
    para_fazer: [],
    fazendo: [],
    feito: []
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTatica, setActiveTatica] = useState<TaticaKanban | null>(null);

  const [showFilters, setShowFilters] = useState(false);
  const [showKanbanHelp, setShowKanbanHelp] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<'todas' | 'tarefas' | 'habitos'>('todas');
  const [ordenacao, setOrdenacao] = useState<'atividade' | 'zona' | 'manual'>('atividade');
  const [zonasFiltradas, setZonasFiltradas] = useState<Set<string>>(new Set());
  const [busca, setBusca] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );

  useEffect(() => {
    checkUserAndLoadData();
  }, []);

  async function checkUserAndLoadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth?redirect=/painel-semanal');
        return;
      }

      setUser(user);
      const kanbanData = await getKanbanData(user.id);
      setBoard(kanbanData);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }

  const boardFiltrado = useMemo(() => {
    const filtrarTaticas = (taticas: TaticaKanban[]) => {
      let resultado = [...taticas];

      if (filtroTipo !== 'todas') {
        resultado = resultado.filter(t => 
          filtroTipo === 'tarefas' ? t.tipo === 'TAREFA' : t.tipo === 'HABITO'
        );
      }

      if (zonasFiltradas.size > 0) {
        resultado = resultado.filter(t => 
          zonasFiltradas.has(t.atividade?.zona || '')
        );
      }

      if (busca.trim()) {
        const termo = busca.toLowerCase();
        resultado = resultado.filter(t => 
          t.titulo.toLowerCase().includes(termo) ||
          t.detalhe?.toLowerCase().includes(termo) ||
          t.atividade?.nome.toLowerCase().includes(termo)
        );
      }

      if (ordenacao === 'atividade') {
        resultado.sort((a, b) => 
          (a.atividade?.nome || '').localeCompare(b.atividade?.nome || '')
        );
      } else if (ordenacao === 'zona') {
        const prioridadeZona = { 'essencial': 1, 'estrategica': 2, 'tatica': 3, 'distracao': 4 };
        resultado.sort((a, b) => 
          (prioridadeZona[a.atividade?.zona as keyof typeof prioridadeZona] || 5) - 
          (prioridadeZona[b.atividade?.zona as keyof typeof prioridadeZona] || 5)
        );
      }

      return resultado;
    };

    return {
      backlog: filtrarTaticas(board.backlog),
      para_fazer: filtrarTaticas(board.para_fazer),
      fazendo: filtrarTaticas(board.fazendo),
      feito: filtrarTaticas(board.feito)
    };
  }, [board, filtroTipo, zonasFiltradas, busca, ordenacao]);

  function toggleZona(zona: string) {
    setZonasFiltradas(prev => {
      const novoSet = new Set(prev);
      if (novoSet.has(zona)) {
        novoSet.delete(zona);
      } else {
        novoSet.add(zona);
      }
      return novoSet;
    });
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    setActiveId(active.id as string);
    const tatica = findTaticaById(active.id as string);
    setActiveTatica(tatica);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = findColumnByTaticaId(activeId);
    const overColumn = findColumnByTaticaId(overId) || (overId as KanbanStatus);

    if (!activeColumn || activeColumn === overColumn) return;

    const validColumns: KanbanStatus[] = ['backlog', 'para_fazer', 'fazendo', 'feito'];
    if (!validColumns.includes(overColumn as KanbanStatus)) return;

    setBoard((prev) => {
      const activeItems = [...prev[activeColumn]];
      const overItems = [...prev[overColumn as KanbanStatus]];

      const activeIndex = activeItems.findIndex(item => item.id === activeId);
      if (activeIndex === -1) return prev;

      const [activeItem] = activeItems.splice(activeIndex, 1);
      const updatedItem = { ...activeItem, status_kanban: overColumn as KanbanStatus };
      overItems.push(updatedItem);

      return {
        ...prev,
        [activeColumn]: activeItems,
        [overColumn as KanbanStatus]: overItems,
      };
    });
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    setActiveId(null);
    setActiveTatica(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = findColumnByTaticaId(activeId);
    const overColumn = findColumnByTaticaId(overId) || (overId as KanbanStatus);

    if (!activeColumn) return;

    if (activeColumn === overColumn) {
      setBoard((prev) => {
        const items = [...prev[activeColumn]];
        const oldIndex = items.findIndex(item => item.id === activeId);
        const newIndex = items.findIndex(item => item.id === overId);

        if (oldIndex === -1 || newIndex === -1) return prev;

        return {
          ...prev,
          [activeColumn]: arrayMove(items, oldIndex, newIndex),
        };
      });
    }

    if (user?.id && overColumn) {
      try {
        await moverTaticaKanban(activeId, overColumn as KanbanStatus, 0, user.id);
        console.log('✅ Tática movida e salva no banco');
      } catch (error) {
        console.error('❌ Erro ao salvar movimento:', error);
      }
    }
  }

  function findColumnByTaticaId(taticaId: string): KanbanStatus | null {
    for (const [columnId, items] of Object.entries(board)) {
      if (items.find(item => item.id === taticaId)) {
        return columnId as KanbanStatus;
      }
    }
    return null;
  }

  function findTaticaById(taticaId: string): TaticaKanban | null {
    for (const items of Object.values(board)) {
      const tatica = items.find(item => item.id === taticaId);
      if (tatica) return tatica;
    }
    return null;
  }

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: TEMA.brand }} />
            <p style={{ color: TEMA.subtext }}>Carregando seu Kanban...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!user) return null;

  const totalTaticas = Object.values(boardFiltrado).flat().length;
  const totalOriginal = Object.values(board).flat().length;

  return (
    <PageContainer>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {/* Header com filtros */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => router.push('/plano-acao')}
                className="p-3 rounded-xl transition-all hover:scale-105 border"
                style={{ 
                  background: TEMA.card, 
                  borderColor: TEMA.cardBorder,
                  color: TEMA.text,
                  backdropFilter: 'blur(8px)'
                }}
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: TEMA.text }}>
                  Kanban Semanal
                </h1>
                <p style={{ color: TEMA.subtext }}>
                  Organize suas {totalTaticas} tarefas em um fluxo visual
                  {totalTaticas !== totalOriginal && (
                    <span className="text-xs"> (filtrado de {totalOriginal})</span>
                  )}
                </p>
              </div>
            </div>
            
            {/* Botão Filtros */}
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border transition-all hover:bg-white/5"
              style={{ 
                borderColor: TEMA.cardBorder, 
                color: TEMA.text,
                backdropFilter: 'blur(8px)'
              }}
            >
              <Filter size={16} />
              <span>Filtros</span>
              <ChevronDown 
                size={16} 
                className={cn("transition-transform", showFilters && "rotate-180")} 
              />
            </button>
          </div>

          {/* Painel de filtros */}
          {showFilters && (
            <div 
              className="rounded-xl p-6 border mb-6"
              style={{ 
                background: TEMA.card, 
                borderColor: TEMA.cardBorder,
                backdropFilter: 'blur(8px)'
              }}
            >
              {/* Busca */}
              <div className="mb-6">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: TEMA.subtext }} />
                  <input
                    type="text"
                    placeholder="Buscar tarefas..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border text-sm"
                    style={{ 
                      background: 'rgba(255,255,255,0.05)', 
                      borderColor: TEMA.cardBorder,
                      color: TEMA.text
                    }}
                  />
                </div>
              </div>

              {/* Grid de filtros */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Filtro por Tipo */}
                <div>
                  <h4 className="text-sm font-medium mb-3" style={{ color: TEMA.text }}>Tipo de Tática</h4>
                  <div className="space-y-2">
                    {[
                      { id: 'todas', label: 'Todas' },
                      { id: 'tarefas', label: '📋 Tarefas' },
                      { id: 'habitos', label: '🔄 Hábitos' }
                    ].map(({ id, label }) => (
                      <button
                        key={id}
                        onClick={() => setFiltroTipo(id as any)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all",
                          filtroTipo === id
                            ? "bg-orange-600 text-white shadow-lg"
                            : "bg-white/5 text-white/70 hover:bg-white/10"
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filtro por Zona */}
                <div>
                  <h4 className="text-sm font-medium mb-3" style={{ color: TEMA.text }}>Zona ROI</h4>
                  <div className="space-y-2">
                    {[
                      { zona: 'essencial', label: '🟢 Essencial', cor: '#22c55e' },
                      { zona: 'estrategica', label: '🔵 Estratégica', cor: '#3b82f6' },
                      { zona: 'tatica', label: '🟡 Tática', cor: '#f59e0b' },
                      { zona: 'distracao', label: '🔴 Distração', cor: '#ef4444' }
                    ].map(({ zona, label, cor }) => (
                      <button
                        key={zona}
                        onClick={() => toggleZona(zona)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all border",
                          zonasFiltradas.has(zona)
                            ? "text-white shadow-lg"
                            : "bg-transparent text-white/70 hover:bg-white/5"
                        )}
                        style={{
                          backgroundColor: zonasFiltradas.has(zona) ? cor : undefined,
                          borderColor: cor + '30'
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ordenação */}
                <div>
                  <h4 className="text-sm font-medium mb-3" style={{ color: TEMA.text }}>Ordenação</h4>
                  <div className="space-y-2">
                    {[
                      { id: 'atividade', label: 'Por Atividade' },
                      { id: 'zona', label: 'Por Zona ROI' },
                      { id: 'manual', label: 'Manual' }
                    ].map(({ id, label }) => (
                      <button
                        key={id}
                        onClick={() => setOrdenacao(id as any)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all",
                          ordenacao === id
                            ? "bg-orange-600 text-white shadow-lg"
                            : "bg-white/5 text-white/70 hover:bg-white/10"
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

         {/* Stats rápidas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              { label: 'Backlog', value: boardFiltrado.backlog.length, color: CORES_COLUNAS.backlog },
              { label: 'Para Fazer', value: boardFiltrado.para_fazer.length, color: CORES_COLUNAS.para_fazer },
              { label: 'Fazendo', value: boardFiltrado.fazendo.length, color: CORES_COLUNAS.fazendo },
              { label: 'Concluído', value: boardFiltrado.feito.length, color: CORES_COLUNAS.feito }
            ].map(stat => (
              <div 
                key={stat.label}
                className="rounded-xl p-4 text-center border"
                style={{ 
                  background: TEMA.card, 
                  borderColor: TEMA.cardBorder,
                  backdropFilter: 'blur(8px)'
                }}
              >
                <div 
                  className="text-2xl font-bold mb-1"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </div>
                <div className="text-xs" style={{ color: TEMA.subtext }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

{/* 🎯 COMO USAR ESTE KANBAN */}
        <div className="mb-6 sm:mb-8">
          
          {/* Header Retrátil */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 mb-4 rounded-xl" style={{ 
            borderColor: TEMA.cardBorder,
            backdropFilter: 'blur(8px)'
          }}>
            <div className="p-4">
              <button
                onClick={() => setShowKanbanHelp(!showKanbanHelp)}
                className="w-full flex items-center justify-between text-left focus:outline-none group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-600/20 rounded-lg flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white group-hover:text-orange-300 transition-colors">
                      Como usar este Kanban
                    </h2>
                    <p className="text-sm text-white/60">
                      Organize suas tarefas em um fluxo visual de produtividade
                    </p>
                  </div>
                </div>
                
                <ChevronDown className={cn(
                  "w-5 h-5 text-white/60 transition-transform duration-200",
                  showKanbanHelp && "rotate-180"
                )} />
             </button>
            </div>
          </div>

          {/* Conteúdo Expandido */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
            showKanbanHelp ? 'max-h-[1000px] opacity-100 mt-4' : 'max-h-0 opacity-0'
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pb-4">
              
              {/* Desktop: Drag & Drop */}
              <div className="bg-gradient-to-br from-blue-600/10 to-blue-700/10 border-blue-400/20 backdrop-blur-sm">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-blue-600/20">
                      <Target className="w-5 h-5 text-blue-300" />
                    </div>
                    <h3 className="font-semibold text-blue-200">Desktop: Arraste e Solte</h3>
                  </div>
                  <p className="text-blue-100 text-sm leading-relaxed mb-3">
                    No computador, arraste os cards entre as colunas para mudar o status das suas tarefas.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-blue-200 bg-blue-600/10 rounded-lg p-3">
                    <GripVertical className="w-4 h-4" />
                    <span>Clique e arraste para mover entre Backlog → Para Fazer → Fazendo → Feito</span>
                  </div>
                </div>
              </div>

              {/* Mobile: Setas */}
              <div className="bg-gradient-to-br from-green-600/10 to-green-700/10 border-green-400/20 backdrop-blur-sm">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-green-600/20">
                      <Smartphone className="w-5 h-5 text-green-300" />
                    </div>
                    <h3 className="font-semibold text-green-200">Mobile: Navegação por Setas</h3>
                  </div>
                  <p className="text-green-100 text-sm leading-relaxed mb-3">
                    No celular, use as setas coloridas no topo de cada card para navegar entre os status.
                  </p>
                  <div className="flex items-center justify-between gap-2 text-xs text-green-200 bg-green-600/10 rounded-lg p-3">
                    <div className="flex items-center gap-1">
                      <span className="text-base">◀</span>
                      <span>Voltar</span>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <div className="w-2 h-2 bg-green-800 rounded-full"></div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>Avançar</span>
                      <span className="text-base">▶</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cards Expansíveis (Mobile) */}
              <div className="bg-gradient-to-br from-purple-600/10 to-purple-700/10 border-purple-400/20 backdrop-blur-sm">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-purple-600/20">
                      <ChevronDown className="w-5 h-5 text-purple-300" />
                    </div>
                    <h3 className="font-semibold text-purple-200">Cards Expansíveis (Mobile)</h3>
                  </div>
                  <p className="text-purple-100 text-sm leading-relaxed mb-3">
                    No mobile, toque na seta ao lado da atividade para ver detalhes completos e badges de categoria.
                  </p>
                  <div className="text-xs text-purple-200 bg-purple-600/10 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="font-medium">Interface mais limpa</span>
                    </div>
                    <span>Só mostra informações essenciais até você expandir</span>
                  </div>
                </div>
              </div>

              {/* Fluxo do Kanban */}
              <div className="bg-gradient-to-br from-orange-600/10 to-orange-700/10 border-orange-400/20 backdrop-blur-sm">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-orange-600/20">
                      <ArrowRight className="w-5 h-5 text-orange-300" />
                    </div>
                    <h3 className="font-semibold text-orange-200">Fluxo de Produtividade</h3>
                  </div>
                  <div className="space-y-2 text-sm text-orange-100">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-500 rounded"></div>
                      <span><strong>Backlog:</strong> Ideias e tarefas futuras</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                      <span><strong>Para Fazer:</strong> Pronto para executar</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                      <span><strong>Fazendo:</strong> Em andamento agora</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span><strong>Feito:</strong> Concluído com sucesso</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>


        {/* Board - CORRIGIDO COM PROPS */}
        <div 
          className="rounded-xl p-6 border mb-8"
          style={{ 
            background: TEMA.card, 
            borderColor: TEMA.cardBorder,
            backdropFilter: 'blur(8px)'
          }}
        >
          <div className="flex gap-6 overflow-x-auto pb-4" style={{ minHeight: '500px' }}>
            <KanbanColuna
              id="backlog"
              title="Backlog"
              taticas={boardFiltrado.backlog}
              icon={<Target size={18} />}
              color={CORES_COLUNAS.backlog}
              setBoard={setBoard}
              user={user}
              moverTaticaKanban={moverTaticaKanban}
            />
            <KanbanColuna
              id="para_fazer"
              title="Para Fazer"
              taticas={boardFiltrado.para_fazer}
              icon={<Clock size={18} />}
              color={CORES_COLUNAS.para_fazer}
              setBoard={setBoard}
              user={user}
              moverTaticaKanban={moverTaticaKanban}
            />
            <KanbanColuna
              id="fazendo"
              title="Fazendo"
              taticas={boardFiltrado.fazendo}
              icon={<User size={18} />}
              color={CORES_COLUNAS.fazendo}
              setBoard={setBoard}
              user={user}
              moverTaticaKanban={moverTaticaKanban}
            />
            <KanbanColuna
              id="feito"
              title="Feito"
              taticas={boardFiltrado.feito}
              icon={<CheckCircle2 size={18} />}
              color={CORES_COLUNAS.feito}
              setBoard={setBoard}
              user={user}
              moverTaticaKanban={moverTaticaKanban}
            />
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button 
            onClick={() => router.push('/plano-acao')}
            className="px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
            style={{ 
              background: TEMA.brand, 
              color: TEMA.bg 
            }}
          >
            + Criar Mais Táticas
          </button>
        </div>

        {/* Drag Overlay */}
        <DragOverlay dropAnimation={dropAnimation}>
          {activeTatica ? (
            <TaticaCard tatica={activeTatica} isOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>
    </PageContainer>
  );
}