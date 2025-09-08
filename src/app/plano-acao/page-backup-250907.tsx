// 📋 PLANO DE AÇÃO - VERSÃO MODULAR COMPLETA
// Arquivo: src/app/plano-acao/page.tsx

'use client'
import React, { useEffect, useMemo, useState } from "react";
import { Map, HelpCircle, ChevronDown, Target, Zap, Edit, Filter, LayoutGrid, List, Search, Clock, CheckCircle, Circle, CheckSquare, Eye, ArrowRight } from "lucide-react";

// Importar componentes base da Wave 1
import { PageContainer, EmptyState } from '@/components/base';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/design-system';

// Importar componentes modulares do Plano de Ação
import {
  // Tipos
  type AtividadeMap,
  type AtividadePlano,
  type Tatica,
  type PlanoDeAcao,
  type Eixo,
  type ImpactoFlag,
  // Componentes
  PlanoHeader,
  PlanoStats,
  AtividadeCard,
  PlanoFooter,
  OrientacaoDiagnostico,
  ModalDAR_CERTO,  
  // Funções utilitárias
  zonaDaAtividade,
  mapearAtividade,
  ordenarPorFocoDiagnostico,
  sugerirTaticasBase,
  uid
} from '@/components/plano';

// Importar supabase para dados reais
import { supabase } from '@/lib/supabase';

// ═══════════════════════════════════════════════════════════════════
// 📋 COMPONENTE PRINCIPAL MODULAR
// ═══════════════════════════════════════════════════════════════════

export default function PlanoAcaoModular() {
  // ═══════════════════════════════════════════════════════════════════
  // 🔄 ESTADOS E DADOS
  // ═══════════════════════════════════════════════════════════════════
  
  const [user, setUser] = useState<any>(null);
  const [atividadesMap, setAtividadesMap] = useState<AtividadeMap[]>([]);
  const [expandidos, setExpandidos] = useState<Record<string, boolean>>({});
  const [planos, setPlanos] = useState<Record<string, Tatica[]>>({});
  const [isLoading, setIsLoading] = useState(true);

// 🆕 ESTADOS DO MODAL DAR CERTO
const [modalDAR_CERTO, setModalDAR_CERTO] = useState<{
  isOpen: boolean;
  atividade?: AtividadePlano;
  categoria?: string;
  taticaEditando?: Tatica;
  atividadeId?: string;
}>({ isOpen: false });

const [comoUsarExpanded, setComoUsarExpanded] = useState(false);
const [zonasFiltradas, setZonasFiltradas] = useState<Set<string>>(new Set());
const [modoVisualizacao, setModoVisualizacao] = useState<'atividades' | 'taticas'>('atividades');
const [ordemAtividades, setOrdemAtividades] = useState<'tempo' | 'impacto' | 'clareza' | 'alfabetica'>('tempo');
const [filtroTaticas, setFiltroTaticas] = useState<'todas' | 'tarefas' | 'habitos' | 'concluidas' | 'pendentes'>('todas');
const [ordemTaticas, setOrdemTaticas] = useState<'status' | 'data' | 'alfabetica'>('status');
const [buscaTatica, setBuscaTatica] = useState('');

  // Converter atividades do mapa para formato do plano
  const atividades = useMemo(() => {
    return atividadesMap.map(mapearAtividade);
  }, [atividadesMap]);

// Recuperar dados do diagnóstico
  const dadosDiagnostico = useMemo(() => {
    try {
      const dados = localStorage.getItem('ultimo-diagnostico');
      return dados ? JSON.parse(dados) : null;
    } catch { return null; }
  }, []);

// Inicializar filtros baseados no diagnóstico
  useEffect(() => {
    if (dadosDiagnostico && dadosDiagnostico.focoPrimario) {
      const zonasIniciais = new Set<string>();
      
      // Pré-selecionar baseado no foco primário
      switch (dadosDiagnostico.focoPrimario) {
        case 'REDUZIR_DISTRACAO':
          zonasIniciais.add('Distração');
          break;
        case 'COMPRIMIR_TATICO':
          zonasIniciais.add('Tática');
          break;
        case 'FORTALECER_ESSENCIAL':
          zonasIniciais.add('Essencial');
          break;
        case 'DAR_FORMA_ESTRATEGICO':
          zonasIniciais.add('Estratégica');
          break;
      }
      
      // Adicionar foco secundário se existir
      if (dadosDiagnostico.focoSecundario) {
        switch (dadosDiagnostico.focoSecundario) {
          case 'REDUZIR_DISTRACAO':
            zonasIniciais.add('Distração');
            break;
          case 'COMPRIMIR_TATICO':
            zonasIniciais.add('Tática');
            break;
          case 'FORTALECER_ESSENCIAL':
            zonasIniciais.add('Essencial');
            break;
          case 'DAR_FORMA_ESTRATEGICO':
            zonasIniciais.add('Estratégica');
            break;
        }
      }
      
      setZonasFiltradas(zonasIniciais);
    }
  }, [dadosDiagnostico]);

  // Aplicar ordenação baseada no diagnóstico
  const atividadesOrdenadas = useMemo(() => 
    dadosDiagnostico ? ordenarPorFocoDiagnostico(atividades, dadosDiagnostico.focoPrimario) : atividades
  , [atividades, dadosDiagnostico]);

  // ═══════════════════════════════════════════════════════════════════
  // 🔄 CARREGAR DADOS REAIS DO SUPABASE
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

        // 4. Carregar planos salvos anteriormente
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
  // 🎛️ FUNÇÕES DE CONTROLE (MODULARIZADAS)
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

function adicionarTaticaGenerica(atividade: AtividadePlano) {
  onAbrirModalDAR_CERTO(atividade, "OTIMIZAR");
}

  function adicionarTaticasSugeridas(atividade: AtividadePlano) {
    const { sugerirTaticasBase } = require('@/components/plano');
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

function aplicarTaticasAutomaticas() {
    if (!dadosDiagnostico) return;
    
    const novasTagas: Record<string, Tatica[]> = {};
    
    // ✅ NOVA LÓGICA: Identificar zonas de foco e pegar TOP 3 de cada
    const zonasParaFocar: string[] = [];
    
    // Adicionar zona do foco primário
    switch (dadosDiagnostico.focoPrimario) {
      case 'REDUZIR_DISTRACAO':
        zonasParaFocar.push('Distração');
        break;
      case 'COMPRIMIR_TATICO':
        zonasParaFocar.push('Tática');
        break;
      case 'FORTALECER_ESSENCIAL':
        zonasParaFocar.push('Essencial');
        break;
      case 'DAR_FORMA_ESTRATEGICO':
        zonasParaFocar.push('Estratégica');
        break;
    }
    
    // Adicionar zona do foco secundário (se existir e for diferente)
    if (dadosDiagnostico.focoSecundario) {
      let zonaSecundaria = '';
      switch (dadosDiagnostico.focoSecundario) {
        case 'REDUZIR_DISTRACAO':
          zonaSecundaria = 'Distração';
          break;
        case 'COMPRIMIR_TATICO':
          zonaSecundaria = 'Tática';
          break;
        case 'FORTALECER_ESSENCIAL':
          zonaSecundaria = 'Essencial';
          break;
        case 'DAR_FORMA_ESTRATEGICO':
          zonaSecundaria = 'Estratégica';
          break;
      }
      
      if (zonaSecundaria && !zonasParaFocar.includes(zonaSecundaria)) {
        zonasParaFocar.push(zonaSecundaria);
      }
    }
    
    // Para cada zona de foco, pegar as TOP 3 atividades por tempo
    zonasParaFocar.forEach(zonalFoco => {
      const atividadesDaZona = atividades
        .filter(atividade => zonaDaAtividade(atividade) === zonalFoco)
        .sort((a, b) => (b.horasMes || 0) - (a.horasMes || 0)) // Ordenar por tempo (maior primeiro)
        .slice(0, 3); // Pegar apenas TOP 3
      
      // Aplicar táticas para as TOP 3 da zona
      atividadesDaZona.forEach(atividade => {
        const taticasParaAplicar = sugerirTaticasBase(atividade);
        if (taticasParaAplicar.length > 0) {
          novasTagas[atividade.id] = [...(planos[atividade.id] || []), ...taticasParaAplicar];
        }
      });
    });
    
    const totalAtividades = Object.keys(novasTagas).length;
    const totalTaticas = Object.values(novasTagas).flat().length;
    
    setPlanos(prev => ({ ...prev, ...novasTagas }));
    alert(`✅ Táticas aplicadas para ${totalAtividades} atividades prioritárias (${totalTaticas} táticas geradas)`);
  }
  function voltarMapa() {
    window.location.href = '/dashboard';
  }
  // Função para toggle de zona
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

  // Filtrar e ordenar atividades baseado nas zonas selecionadas
  const atividadesFiltradas = useMemo(() => {
    let atividades = zonasFiltradas.size === 0 ? atividadesOrdenadas : 
      atividadesOrdenadas.filter(atividade => {
        const zona = zonaDaAtividade(atividade);
        return zonasFiltradas.has(zona);
      });

    // Agrupar por zona
    const atividadesPorZona = atividades.reduce((acc, atividade) => {
      const zona = zonaDaAtividade(atividade);
      if (!acc[zona]) acc[zona] = [];
      acc[zona].push(atividade);
      return acc;
    }, {} as Record<string, AtividadePlano[]>);

    // Ordenar dentro de cada zona
    Object.keys(atividadesPorZona).forEach(zona => {
      atividadesPorZona[zona].sort((a, b) => {
        switch (ordemAtividades) {
          case 'tempo':
            return (b.horasMes || 0) - (a.horasMes || 0); // Maior tempo primeiro
          case 'impacto':
            return (b.impacto * b.clareza) - (a.impacto * a.clareza);
          case 'clareza':
            return (b.clareza || 0) - (a.clareza || 0); // Maior clareza primeiro
          case 'alfabetica':
            return a.titulo.localeCompare(b.titulo);
          default:
            return 0;
        }
      });
    });

    // ✅ CORRIGIDO: Respeitar hierarquia do diagnóstico
    const resultado: AtividadePlano[] = [];
    
    // Priorizar zonas baseadas no foco diagnóstico
    if (dadosDiagnostico) {
      const zonasOrdenadas: string[] = [];
      
      // Adicionar foco primário primeiro
      switch (dadosDiagnostico.focoPrimario) {
        case 'REDUZIR_DISTRACAO':
          zonasOrdenadas.push('Distração');
          break;
        case 'COMPRIMIR_TATICO':
          zonasOrdenadas.push('Tática');
          break;
        case 'FORTALECER_ESSENCIAL':
          zonasOrdenadas.push('Essencial');
          break;
        case 'DAR_FORMA_ESTRATEGICO':
          zonasOrdenadas.push('Estratégica');
          break;
      }
      
      // Adicionar foco secundário
      if (dadosDiagnostico.focoSecundario) {
        switch (dadosDiagnostico.focoSecundario) {
          case 'REDUZIR_DISTRACAO':
            if (!zonasOrdenadas.includes('Distração')) zonasOrdenadas.push('Distração');
            break;
          case 'COMPRIMIR_TATICO':
            if (!zonasOrdenadas.includes('Tática')) zonasOrdenadas.push('Tática');
            break;
          case 'FORTALECER_ESSENCIAL':
            if (!zonasOrdenadas.includes('Essencial')) zonasOrdenadas.push('Essencial');
            break;
          case 'DAR_FORMA_ESTRATEGICO':
            if (!zonasOrdenadas.includes('Estratégica')) zonasOrdenadas.push('Estratégica');
            break;
        }
      }
      
      // Adicionar zonas restantes
      ['Essencial', 'Estratégica', 'Tática', 'Distração'].forEach(zona => {
        if (!zonasOrdenadas.includes(zona)) {
          zonasOrdenadas.push(zona);
        }
      });
      
      // Montar resultado respeitando a hierarquia
      zonasOrdenadas.forEach(zona => {
        if (atividadesPorZona[zona]) {
          resultado.push(...atividadesPorZona[zona]);
        }
      });
    } else {
      // Fallback sem diagnóstico
      ['Essencial', 'Estratégica', 'Tática', 'Distração'].forEach(zona => {
        if (atividadesPorZona[zona]) {
          resultado.push(...atividadesPorZona[zona]);
        }
      });
    }

    return resultado;
  }, [atividadesOrdenadas, zonasFiltradas, ordemAtividades, dadosDiagnostico]);

  // Obter todas as táticas de todas as atividades
  const todasTaticas = useMemo(() => {
    const taticas: Array<Tatica & { atividade: AtividadePlano, zona: string }> = [];
    
    atividadesFiltradas.forEach(atividade => {
      const taticasAtividade = planos[atividade.id] || [];
      taticasAtividade.forEach(tatica => {
        taticas.push({
          ...tatica,
          atividade,
          zona: zonaDaAtividade(atividade)
        });
      });
    });

    // Filtrar táticas
    let taticasFiltradas = taticas.filter(tatica => {
      // Filtro por busca
      if (buscaTatica && !tatica.titulo.toLowerCase().includes(buscaTatica.toLowerCase())) {
        return false;
      }

      // Filtro por tipo
      switch (filtroTaticas) {
        case 'tarefas':
          return tatica.tipo === 'TAREFA';
        case 'habitos':
          return tatica.tipo === 'HABITO';
        case 'concluidas':
          return tatica.concluida === true;
        case 'pendentes':
          return tatica.concluida !== true;
        default:
          return true;
      }
    });

    // Ordenar táticas baseado na seleção
    taticasFiltradas.sort((a, b) => {
      switch (ordemTaticas) {
        case 'status':
          // Pendentes primeiro, depois por zona
          if (a.concluida !== b.concluida) {
            return a.concluida ? 1 : -1;
          }
          const ordemZonas = ['Essencial', 'Estratégica', 'Tática', 'Distração'];
          const indexA = ordemZonas.indexOf(a.zona);
          const indexB = ordemZonas.indexOf(b.zona);
          if (indexA !== indexB) {
            return indexA - indexB;
          }
          return a.titulo.localeCompare(b.titulo);
          
        case 'data':
          // Para tarefas: ordenar por data (mais próximas primeiro)
          // Para hábitos: ordenar por frequência
          const dataA = a.dataSugerida || '9999-12-31';
          const dataB = b.dataSugerida || '9999-12-31';
          if (dataA !== dataB) {
            return dataA.localeCompare(dataB);
          }
          // Se não tem data, ordenar por frequência (hábitos diários primeiro)
          const freqOrdem = { 'diaria': 1, 'semanal': 2, 'mensal': 3 };
          const freqA = freqOrdem[a.frequencia as keyof typeof freqOrdem] || 4;
          const freqB = freqOrdem[b.frequencia as keyof typeof freqOrdem] || 4;
          return freqA - freqB;
          
        case 'alfabetica':
          return a.titulo.localeCompare(b.titulo);
          
        default:
          return 0;
      }
    });

    return taticasFiltradas;
  }, [atividadesFiltradas, planos, filtroTaticas, buscaTatica, ordemTaticas]);

// 🆕 FUNÇÕES DO MODAL DAR CERTO
function onAbrirModalDAR_CERTO(atividade: AtividadePlano, categoria: string) {
  setModalDAR_CERTO({
    isOpen: true,
    atividade,
    categoria
  });
}
function onEditarTatica(atividade: AtividadePlano, tatica: Tatica) {
  setModalDAR_CERTO({
    isOpen: true,
    atividade,
    categoria: "TATICA_MANUAL", // ✅ Categoria genérica
    taticaEditando: tatica,
    atividadeId: atividade.id
  });
}

function onAbrirModalPersonalizado(atividade: AtividadePlano, eixo: Eixo) {
  // Por enquanto, usar a função genérica existente
  adicionarTatica(atividade, eixo);
}

function onFecharModalDAR_CERTO() {
  setModalDAR_CERTO({ isOpen: false });
}

function onSalvarModalDAR_CERTO(novaTatica: Tatica) {
  if (!modalDAR_CERTO.atividade) return;
  
  const atividadeId = modalDAR_CERTO.atividade.id;
  
  // ✅ MODO EDIÇÃO: Atualizar tática existente
  if (modalDAR_CERTO.taticaEditando) {
    setPlanos(prev => {
      const lista = prev[atividadeId] || [];
      const novaLista = lista.map(t => 
        t.id === modalDAR_CERTO.taticaEditando!.id ? novaTatica : t
      );
      return { ...prev, [atividadeId]: novaLista };
    });
  } else {
    // ✅ MODO CRIAÇÃO: Adicionar nova tática
    setPlanos(prev => ({
      ...prev,
      [atividadeId]: [...(prev[atividadeId] || []), novaTatica]
    }));
  }
  
  setModalDAR_CERTO({ isOpen: false });
}
  // ═══════════════════════════════════════════════════════════════════
  // 🎨 RENDERIZAÇÃO MODULAR
  // ═══════════════════════════════════════════════════════════════════

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full mx-auto mb-4" />
            <p className="text-white/70">Carregando suas atividades...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* 📋 HEADER MODULAR */}
      <PlanoHeader 
        totalAtividades={atividades.length}
        onSalvar={salvarPlano}
      />

      {/* 🎯 FLUXO ROI DO FOCO */}
      <div className="mb-6 sm:mb-8">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 sm:p-6">
          
          {/* Título do Fluxo */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-white">
              Fluxo ROI do Foco
            </h2>
            <span className="text-xs sm:text-sm text-white/60 hidden sm:block">
              Siga os 3 passos
            </span>
          </div>

          {/* Steps do Fluxo */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
            
            {/* Step 1 - Mapear (Completo) */}
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-green-400">1. Mapear</span>
                  <CheckCircle className="w-3 h-3 text-green-400" />
                </div>
                <p className="text-xs text-white/60">Atividades na matriz</p>
              </div>
            </div>

            {/* Seta 1 */}
            <div className="hidden sm:block text-white/40">
              <ArrowRight className="w-4 h-4" />
            </div>

            {/* Step 2 - Diagnosticar (Completo) */}
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-green-400">2. Diagnosticar</span>
                  <CheckCircle className="w-3 h-3 text-green-400" />
                </div>
                <p className="text-xs text-white/60">Análise do foco</p>
              </div>
            </div>

            {/* Seta 2 */}
            <div className="hidden sm:block text-white/40">
              <ArrowRight className="w-4 h-4" />
            </div>

            {/* Step 3 - Executar (Ativo) */}
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-orange-400 ring-offset-2 ring-offset-transparent">
                <span className="text-sm font-bold text-white">3</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-orange-400">3. Executar</span>
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                </div>
                <p className="text-xs text-white/60">Plano de ação</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🎯 COMO USAR ESTE PLANO DE AÇÃO */}

      {/* 📊 ESTATÍSTICAS MODULARES */}
      <PlanoStats 
        estatisticas={estatisticas}
        atividades={atividades}
      />

      {/* 🎯 COMO USAR ESTE PLANO DE AÇÃO */}
      <div className="mb-6 sm:mb-8">
        
        {/* Header Retrátil */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10 mb-4">
          <CardContent className="p-4">
            <button
              onClick={() => setComoUsarExpanded(!comoUsarExpanded)}
              className="w-full flex items-center justify-between text-left focus:outline-none group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-600/20 rounded-lg flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white group-hover:text-orange-300 transition-colors">
                    Como usar este plano de ação
                  </h2>
                  <p className="text-sm text-white/60">
                    Transforme diagnósticos em ações práticas
                  </p>
                </div>
              </div>
              
              <ChevronDown className={cn(
                "w-5 h-5 text-white/60 transition-transform duration-200",
                comoUsarExpanded && "rotate-180"
              )} />
            </button>
          </CardContent>
        </Card>

        {/* Conteúdo Expandido */}
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
          comoUsarExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pb-4">
            
            {/* Passo 1: Ordenação */}
            <Card className="bg-gradient-to-br from-blue-600/10 to-blue-700/10 border-blue-400/20 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-blue-600/20">
                    <Target className="w-5 h-5 text-blue-300" />
                  </div>
                  <h3 className="font-semibold text-blue-200">Suas tarefas estão ordenadas</h3>
                </div>
                <p className="text-blue-100 text-sm leading-relaxed">
                  Comece pelas primeiras da lista - elas têm maior potencial de impacto baseado no seu diagnóstico.
                </p>
              </CardContent>
            </Card>

            {/* Passo 2: Táticas Automáticas */}
            <Card className="bg-gradient-to-br from-green-600/10 to-green-700/10 border-green-400/20 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-green-600/20">
                    <Zap className="w-5 h-5 text-green-300" />
                  </div>
                  <h3 className="font-semibold text-green-200">Táticas sugeridas automaticamente</h3>
                </div>
                <p className="text-green-100 text-sm leading-relaxed">
                  Use o botão "Aplicar Táticas Automaticamente" para gerar sugestões baseadas no Framework DAR CERTO.
                </p>
              </CardContent>
            </Card>

           {/* Passo 3: Edição */}
            <Card className="bg-gradient-to-br from-orange-600/10 to-orange-700/10 border-orange-400/20 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-orange-600/20">
                    <Edit className="w-5 h-5 text-orange-300" />
                  </div>
                  <h3 className="font-semibold text-orange-200">Insira e edite suas táticas</h3>
                </div>
                <p className="text-orange-100 text-sm leading-relaxed mb-4">
                  Adicione táticas individuais no formato TAREFA ou HÁBITO. Edite qualquer uma conforme sua necessidade.
                </p>
                <div className="p-3 rounded-lg bg-orange-600/10 border border-orange-400/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-orange-300" />
                    <span className="text-sm font-medium text-orange-200">💾 Lembrete importante</span>
                  </div>
                  <p className="text-xs text-orange-100/90">
                    Não esqueça de salvar seu plano após criar ou editar táticas!
                  </p>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>

      {/* 🎯 ORIENTAÇÃO DO DIAGNÓSTICO */}
      <OrientacaoDiagnostico 
        dadosDiagnostico={dadosDiagnostico}
        onAplicarTaticasAutomaticas={aplicarTaticasAutomaticas}
      />
{/* 📊 FILTROS POR ZONA */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-orange-400" />
          <h3 className="text-lg font-semibold text-white">
            Filtrar atividades por zona
          </h3>
          <span className="text-sm text-white/60">
            ({zonasFiltradas.size === 0 ? 'Todas' : zonasFiltradas.size} zona{zonasFiltradas.size !== 1 ? 's' : ''} selecionada{zonasFiltradas.size !== 1 ? 's' : ''})
          </span>
        </div>
        
        {/* Matriz 2x2 de Filtros */}
        <div className="grid grid-cols-2 gap-3 max-w-md">
          
          {/* Linha Superior: Tática + Essencial */}
          <button
            onClick={() => toggleZona('Tática')}
            className={cn(
              "p-4 rounded-xl text-sm font-medium transition-all duration-200",
              "border-2 hover:scale-105",
              zonasFiltradas.has('Tática') 
                ? "bg-yellow-600 border-yellow-600 text-white shadow-lg" 
                : "bg-transparent border-yellow-600/30 text-yellow-300 hover:border-yellow-600/50"
            )}
          >
            <div className="text-center">
              <div className="font-bold">🟡 TÁTICA</div>
              <div className="text-xs mt-1 opacity-90">
                Clara, baixo impacto
              </div>
            </div>
          </button>

          <button
            onClick={() => toggleZona('Essencial')}
            className={cn(
              "p-4 rounded-xl text-sm font-medium transition-all duration-200",
              "border-2 hover:scale-105",
              zonasFiltradas.has('Essencial') 
                ? "bg-green-600 border-green-600 text-white shadow-lg" 
                : "bg-transparent border-green-600/30 text-green-300 hover:border-green-600/50"
            )}
          >
            <div className="text-center">
              <div className="font-bold">🟢 ESSENCIAL</div>
              <div className="text-xs mt-1 opacity-90">
                Clara, alto impacto
              </div>
            </div>
          </button>

          {/* Linha Inferior: Distração + Estratégica */}
          <button
            onClick={() => toggleZona('Distração')}
            className={cn(
              "p-4 rounded-xl text-sm font-medium transition-all duration-200",
              "border-2 hover:scale-105",
              zonasFiltradas.has('Distração') 
                ? "bg-red-600 border-red-600 text-white shadow-lg" 
                : "bg-transparent border-red-600/30 text-red-300 hover:border-red-600/50"
            )}
          >
            <div className="text-center">
              <div className="font-bold">🔴 DISTRAÇÃO</div>
              <div className="text-xs mt-1 opacity-90">
                Baixa clareza e impacto
              </div>
            </div>
          </button>

          <button
            onClick={() => toggleZona('Estratégica')}
            className={cn(
              "p-4 rounded-xl text-sm font-medium transition-all duration-200",
              "border-2 hover:scale-105",
              zonasFiltradas.has('Estratégica') 
                ? "bg-blue-600 border-blue-600 text-white shadow-lg" 
                : "bg-transparent border-blue-600/30 text-blue-300 hover:border-blue-600/50"
            )}
          >
            <div className="text-center">
              <div className="font-bold">🔵 ESTRATÉGICA</div>
              <div className="text-xs mt-1 opacity-90">
                Alto impacto, pouca clareza
              </div>
            </div>
          </button>

        </div>
      </div>

      {/* 🔄 TOGGLE DE VISUALIZAÇÃO */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-4">
          {/* Toggle Atividades vs Táticas */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setModoVisualizacao('atividades')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                modoVisualizacao === 'atividades'
                  ? "bg-orange-600 text-white shadow-lg"
                  : "bg-white/5 text-white/70 hover:bg-white/10"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
              Por Atividades
            </button>
            <button
              onClick={() => setModoVisualizacao('taticas')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                modoVisualizacao === 'taticas'
                  ? "bg-orange-600 text-white shadow-lg"
                  : "bg-white/5 text-white/70 hover:bg-white/10"
              )}
            >
              <List className="w-4 h-4" />
              Por Táticas
            </button>
          </div>

          {/* Controles Contextuais */}
          <div className="flex items-center gap-3">
            {modoVisualizacao === 'atividades' ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/60">Ordenar:</span>
                <button
                  onClick={() => setOrdemAtividades('tempo')}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    ordemAtividades === 'tempo'
                      ? "bg-orange-600 text-white shadow-lg"
                      : "bg-white/5 text-white/70 hover:bg-white/10"
                  )}
                >
                  <Clock className="w-4 h-4" />
                  Tempo ↓
                </button>
                <button
                  onClick={() => setOrdemAtividades('impacto')}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    ordemAtividades === 'impacto'
                      ? "bg-orange-600 text-white shadow-lg"
                      : "bg-white/5 text-white/70 hover:bg-white/10"
                  )}
                >
                  <Target className="w-4 h-4" />
                  Impacto ↓
                </button>
                <button
                  onClick={() => setOrdemAtividades('clareza')}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    ordemAtividades === 'clareza'
                      ? "bg-orange-600 text-white shadow-lg"
                      : "bg-white/5 text-white/70 hover:bg-white/10"
                  )}
                >
                  <Eye className="w-4 h-4" />
                  Clareza ↓
                </button>
                <button
                  onClick={() => setOrdemAtividades('alfabetica')}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    ordemAtividades === 'alfabetica'
                      ? "bg-orange-600 text-white shadow-lg"
                      : "bg-white/5 text-white/70 hover:bg-white/10"
                  )}
                >
                  🔤 A-Z
                </button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    placeholder="Buscar táticas..."
                    value={buscaTatica}
                    onChange={(e) => setBuscaTatica(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-2 text-sm text-white placeholder-white/40 w-48"
                  />
                </div>
                
                {/* Filtro por Tipo */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white/60">Tipo:</span>
                  <button
                    onClick={() => setFiltroTaticas('todas')}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      filtroTaticas === 'todas'
                        ? "bg-orange-600 text-white shadow-lg"
                        : "bg-white/5 text-white/70 hover:bg-white/10"
                    )}
                  >
                    Todas
                  </button>
                  <button
                    onClick={() => setFiltroTaticas('tarefas')}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      filtroTaticas === 'tarefas'
                        ? "bg-orange-600 text-white shadow-lg"
                        : "bg-white/5 text-white/70 hover:bg-white/10"
                    )}
                  >
                    📋 Tarefas
                  </button>
                  <button
                    onClick={() => setFiltroTaticas('habitos')}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      filtroTaticas === 'habitos'
                        ? "bg-orange-600 text-white shadow-lg"
                        : "bg-white/5 text-white/70 hover:bg-white/10"
                    )}
                  >
                    🔄 Hábitos
                  </button>
                </div>

                {/* Ordenação específica para táticas */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white/60">Ordenar:</span>
                  <button
                    onClick={() => setOrdemTaticas('status')}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      ordemTaticas === 'status'
                        ? "bg-orange-600 text-white shadow-lg"
                        : "bg-white/5 text-white/70 hover:bg-white/10"
                    )}
                  >
                    🎯 Status
                  </button>
                  <button
                    onClick={() => setOrdemTaticas('data')}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      ordemTaticas === 'data'
                        ? "bg-orange-600 text-white shadow-lg"
                        : "bg-white/5 text-white/70 hover:bg-white/10"
                    )}
                  >
                    📅 Data
                  </button>
                  <button
                    onClick={() => setOrdemTaticas('alfabetica')}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      ordemTaticas === 'alfabetica'
                        ? "bg-orange-600 text-white shadow-lg"
                        : "bg-white/5 text-white/70 hover:bg-white/10"
                    )}
                  >
                    🔤 A-Z
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Estatísticas Contextuais */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-white/60">
            {modoVisualizacao === 'atividades' ? (
              `${atividadesFiltradas.length} atividades • ${atividadesFiltradas.reduce((sum, a) => sum + (a.horasMes || 0), 0).toFixed(1)}h/mês total`
            ) : (
              `${todasTaticas.length} táticas • ${todasTaticas.filter(t => t.concluida).length} concluídas • ${todasTaticas.filter(t => t.tipo === 'TAREFA').length} tarefas • ${todasTaticas.filter(t => t.tipo === 'HABITO').length} hábitos`
            )}
          </div>
          
          {/* Botão Salvar Plano */}
          <button
            onClick={salvarPlano}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
              "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:scale-105"
            )}
          >
            <CheckCircle className="w-4 h-4" />
            Salvar Plano
          </button>
        </div>
      </div>

      {/* 📋 CONTEÚDO DINÂMICO BASEADO NA VISUALIZAÇÃO */}
      {atividades.length === 0 ? (
        <EmptyState
          icon={Map}
          title="Nenhuma atividade encontrada"
          subtitle="Vá para o Mapa de Atividades e crie algumas atividades primeiro. Depois volte aqui para criar seus planos de ação."
          actionLabel="Ir para Mapa de Atividades"
          onAction={voltarMapa}
        />
      ) : modoVisualizacao === 'atividades' ? (
        /* 📊 VISUALIZAÇÃO POR ATIVIDADES */
        <div className="space-y-6">
          {atividadesFiltradas.map((atividade) => {
            const taticasAtividade = planos[atividade.id] || [];
            const isExpanded = expandidos[atividade.id];

            return (
              <AtividadeCard
                key={atividade.id}
                atividade={atividade}
                taticas={taticasAtividade}
                isExpanded={isExpanded}
                onToggle={() => toggle(atividade.id)}
                onAdicionarTatica={adicionarTatica}
                onAdicionarTaticaGenerica={adicionarTaticaGenerica}
                onAdicionarTaticasSugeridas={adicionarTaticasSugeridas}
                onAbrirModalDAR_CERTO={onAbrirModalDAR_CERTO}           
                onEditarTatica={onEditarTatica}
                onAbrirModalPersonalizado={onAbrirModalPersonalizado}
                onAtualizarTatica={atualizarTatica}
                onAtualizarImpacto={atualizarImpacto}
                onToggleConcluida={toggleConcluida}
                onRemoverTatica={removerTatica}
              />
            );
          })}
        </div>
      ) : (
        /* 🎯 VISUALIZAÇÃO POR TÁTICAS */
        <div className="space-y-6">
          
          {/* Seção Tarefas */}
          {todasTaticas.filter(t => t.tipo === 'TAREFA' || !t.tipo).length > 0 && (
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-yellow-600/20">
                    <CheckSquare className="w-5 h-5 text-yellow-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      📋 TAREFAS
                    </h3>
                    <p className="text-sm text-white/60">
                      {todasTaticas.filter(t => t.tipo === 'TAREFA' || !t.tipo).length} tarefas • {todasTaticas.filter(t => (t.tipo === 'TAREFA' || !t.tipo) && t.concluida).length} concluídas
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {todasTaticas
                    .filter(t => t.tipo === 'TAREFA' || !t.tipo)
                    .map((tatica) => (
                      <div 
                        key={tatica.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => toggleConcluida(tatica.atividade.id, tatica.id)}
                            className={cn(
                              "w-5 h-5 rounded transition-colors",
                              tatica.concluida 
                                ? "bg-green-600 text-white" 
                                : "border-2 border-white/30 hover:border-white/50"
                            )}
                          >
                            {tatica.concluida && <CheckCircle className="w-4 h-4" />}
                          </button>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className={cn(
                                "font-medium",
                                tatica.concluida ? "text-white/60 line-through" : "text-white"
                              )}>
                                {tatica.titulo}
                              </h4>
                              {tatica.categoria && (
                                <span className="px-2 py-1 rounded text-xs bg-orange-600/20 text-orange-300">
                                  {tatica.categoria}
                                </span>
                              )}
                            </div>
                            {tatica.detalhe && (
                              <p className="text-sm text-white/60 mt-1">{tatica.detalhe}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              // Ir para a atividade
                              setModoVisualizacao('atividades');
                              setExpandidos(prev => ({ ...prev, [tatica.atividade.id]: true }));
                            }}
                            className="text-xs px-3 py-1 rounded-lg bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-colors"
                          >
                            → {tatica.atividade.titulo} ({tatica.zona})
                          </button>
                          <button
                            onClick={() => onEditarTatica(tatica.atividade, tatica)}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                          >
                            <Edit className="w-4 h-4 text-white/60 hover:text-white" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Seção Hábitos */}
          {todasTaticas.filter(t => t.tipo === 'HABITO').length > 0 && (
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-blue-600/20">
                    <Clock className="w-5 h-5 text-blue-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      🔄 HÁBITOS
                    </h3>
                    <p className="text-sm text-white/60">
                      {todasTaticas.filter(t => t.tipo === 'HABITO').length} hábitos • {todasTaticas.filter(t => t.tipo === 'HABITO' && t.concluida).length} ativos
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {todasTaticas
                    .filter(t => t.tipo === 'HABITO')
                    .map((tatica) => (
                      <div 
                        key={tatica.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => toggleConcluida(tatica.atividade.id, tatica.id)}
                            className={cn(
                              "w-5 h-5 rounded-full transition-colors",
                              tatica.concluida 
                                ? "bg-blue-600 text-white" 
                                : "border-2 border-white/30 hover:border-white/50"
                            )}
                          >
                            {tatica.concluida && <Circle className="w-3 h-3" />}
                          </button>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className={cn(
                                "font-medium",
                                tatica.concluida ? "text-white/60" : "text-white"
                              )}>
                                {tatica.titulo}
                              </h4>
                              {tatica.frequencia && (
                                <span className="px-2 py-1 rounded text-xs bg-blue-600/20 text-blue-300">
                                  {tatica.frequencia}
                                </span>
                              )}
                              {tatica.categoria && (
                                <span className="px-2 py-1 rounded text-xs bg-orange-600/20 text-orange-300">
                                  {tatica.categoria}
                                </span>
                              )}
                            </div>
                            {tatica.detalhe && (
                              <p className="text-sm text-white/60 mt-1">{tatica.detalhe}</p>
                            )}
                            {tatica.gatilho && (
                              <p className="text-xs text-white/50 mt-1">🎯 {tatica.gatilho}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              // Ir para a atividade
                              setModoVisualizacao('atividades');
                              setExpandidos(prev => ({ ...prev, [tatica.atividade.id]: true }));
                            }}
                            className="text-xs px-3 py-1 rounded-lg bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-colors"
                          >
                            → {tatica.atividade.titulo} ({tatica.zona})
                          </button>
                          <button
                            onClick={() => onEditarTatica(tatica.atividade, tatica)}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                          >
                            <Edit className="w-4 h-4 text-white/60 hover:text-white" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Estado vazio para táticas */}
          {todasTaticas.length === 0 && (
            <EmptyState
              icon={Target}
              title="Nenhuma tática encontrada"
              subtitle="Crie algumas táticas nas suas atividades ou ajuste os filtros para ver resultados."
              actionLabel="Ver Atividades"
              onAction={() => setModoVisualizacao('atividades')}
            />
          )}
        </div>
      )}

      {/* REMOVER A SEÇÃO DUPLICADA ABAIXO */}

     

      {/* 💡 FOOTER MODULAR */}
      <PlanoFooter 
        onSalvar={salvarPlano}
        onVoltarMapa={voltarMapa}
      />

{/* 🆕 MODAL DAR CERTO */}
      {modalDAR_CERTO.isOpen && modalDAR_CERTO.atividade && (
        <ModalDAR_CERTO
  isOpen={modalDAR_CERTO.isOpen}
  atividade={modalDAR_CERTO.atividade}
  categoria={modalDAR_CERTO.categoria || ""}
  taticaExistente={modalDAR_CERTO.taticaEditando}
  onClose={onFecharModalDAR_CERTO}
  onSalvar={onSalvarModalDAR_CERTO}
/>
      )}
    </PageContainer>
  );
}