// 📋 PLANO DE AÇÃO - VERSÃO MODULAR COMPLETA
// Arquivo: src/app/plano-acao/page.tsx

'use client'
import React, { useEffect, useMemo, useState } from "react";
import { Map } from "lucide-react";

// Importar componentes base da Wave 1
import { PageContainer, EmptyState } from '@/components/base';

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
  // Funções utilitárias
  zonaDaAtividade,
  mapearAtividade,
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

  // Converter atividades do mapa para formato do plano
  const atividades = useMemo(() => {
    return atividadesMap.map(mapearAtividade);
  }, [atividadesMap]);

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

  function adicionarTaticasSugeridas(atividade: AtividadePlano) {
    // Importar função sugerirTaticasBase do módulo
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

  function voltarMapa() {
    window.location.href = '/dashboard';
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

      {/* 📊 ESTATÍSTICAS MODULARES */}
      <PlanoStats 
        estatisticas={estatisticas}
        atividades={atividades}
      />

      {/* 📋 LISTA DE ATIVIDADES OU EMPTY STATE */}
      {atividades.length === 0 ? (
        <EmptyState
          icon={Map}
          title="Nenhuma atividade encontrada"
          subtitle="Vá para o Mapa de Atividades e crie algumas atividades primeiro. Depois volte aqui para criar seus planos de ação."
          actionLabel="Ir para Mapa de Atividades"
          onAction={voltarMapa}
        />
      ) : (
        <div className="space-y-6">
          {atividades.map((atividade) => {
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
                onAtualizarTatica={atualizarTatica}
                onAtualizarImpacto={atualizarImpacto}
                onToggleConcluida={toggleConcluida}
                onRemoverTatica={removerTatica}
              />
            );
          })}
        </div>
      )}

      {/* 💡 FOOTER MODULAR */}
      <PlanoFooter 
        onSalvar={salvarPlano}
        onVoltarMapa={voltarMapa}
      />
    </PageContainer>
  );
}