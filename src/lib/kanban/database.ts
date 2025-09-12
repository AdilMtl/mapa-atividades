// Funções para interagir com o Kanban usando a estrutura atual
// Reutiliza tabela 'taticas' existente com novos campos

import { supabase } from '@/lib/supabase';

// Importar tipos do local correto
import type { 
  TaticaKanban, 
  KanbanBoard, 
  KanbanStatus, 
  ZonaROI 
} from '@/components/plano';

/**
 * Buscar dados do Kanban com JOIN nas atividades
 */
export async function getKanbanData(userId: string): Promise<KanbanBoard> {
  try {
    console.log('🔍 Buscando dados do Kanban para usuário:', userId);
    
    const { data, error } = await supabase
      .from('taticas')
      .select(`
        *,
        atividades (
          id,
          nome,
          eixo_x,
          eixo_y
        )
      `)
      .eq('user_id', userId)
      .eq('tipo', 'TAREFA')  // Kanban só para tarefas por enquanto
      .order('ordem_coluna', { ascending: true });

    if (error) {
      console.error('❌ Erro SQL:', error);
      throw error;
    }

    console.log('📊 Dados encontrados:', data?.length || 0, 'táticas');

    // Agrupar por status_kanban
    const board: KanbanBoard = {
      backlog: [],
      para_fazer: [],
      fazendo: [],
      feito: []
    };

    data?.forEach(tatica => {
      // Calcular zona da atividade mãe
      const zona = calcularZonaROI(tatica.atividades?.eixo_x, tatica.atividades?.eixo_y);
      
      const taticaKanban: TaticaKanban = {
        ...tatica,
        atividade: {
          id: tatica.atividades?.id || '',
          nome: tatica.atividades?.nome || 'Atividade removida',
          zona,
          cor: getZonaColor(zona)
        }
      };

      // Adicionar na coluna correta
      const status = (tatica.status_kanban || 'backlog') as KanbanStatus;
      if (status in board) {
        board[status].push(taticaKanban);
      }
    });

    console.log('✅ Board organizado:', {
      backlog: board.backlog.length,
      para_fazer: board.para_fazer.length,
      fazendo: board.fazendo.length,
      feito: board.feito.length
    });

    return board;
  } catch (error) {
    console.error('❌ Erro ao buscar dados do Kanban:', error);
    return { backlog: [], para_fazer: [], fazendo: [], feito: [] };
  }
}

/**
 * Mover tática entre colunas (drag & drop)
 */
export async function moverTaticaKanban(
  taticaId: string,
  novoStatus: KanbanStatus,
  novaOrdem: number,
  userId: string
) {
  try {
    console.log('🔄 Movendo tática:', { taticaId, novoStatus, novaOrdem });
    
    const { error } = await supabase
      .from('taticas')
      .update({
        status_kanban: novoStatus,
        ordem_coluna: novaOrdem,
        updated_at: new Date().toISOString()
      })
      .eq('id', taticaId)
      .eq('user_id', userId);

    if (error) throw error;
    
    console.log('✅ Tática movida com sucesso');
    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao mover tática:', error);
    return { success: false, error };
  }
}

/**
 * Calcular zona ROI baseada no eixo
 */
function calcularZonaROI(eixoX?: number, eixoY?: number): ZonaROI {
  if (!eixoX || !eixoY) return "tatica";
  
  if (eixoX >= 4 && eixoY >= 4) return "essencial";
  if (eixoX >= 4 && eixoY < 4) return "estrategica";
  if (eixoX < 4 && eixoY >= 4) return "tatica";
  return "distracao";
}

/**
 * Cores das zonas (seguindo design system)
 */
function getZonaColor(zona: ZonaROI): string {
  switch(zona) {
    case 'essencial': return '#22c55e';    // Verde
    case 'estrategica': return '#3b82f6';  // Azul
    case 'tatica': return '#eab308';       // Amarelo
    case 'distracao': return '#ef4444';    // Vermelho
    default: return '#6b7280';             // Cinza
  }
}