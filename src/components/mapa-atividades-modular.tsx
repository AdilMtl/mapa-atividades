// 🗺️ MAPA DE ATIVIDADES - VERSÃO UX PROFISSIONAL
// Arquivo: src/components/mapa-atividades-modular.tsx
// ✅ MELHORIAS: Formulário destacado + Tipografia + Progresso + Micro-interações

'use client'
import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import html2canvas from "html2canvas";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { 
  ClipboardList, 
  HelpCircle,
  TrendingUp,
  Target,
  Timer,
  Search,
  Lightbulb,
  ChevronRight,
  Plus,
  Check,
  ArrowRight
} from "lucide-react";

// Importar nossos componentes modulares
import { 
  AtividadeForm,
  MapaChart, 
  AtividadeTable,
  MapaControls,
  MapaStats,
  MatrizMobile,
  Atividade,
  normalizarParaHorasMes,
  type Zona
} from '@/components/mapa';

// Constantes originais mantidas
const BG = "#042f2e";
const ACCENT = "#d97706";

type Periodo = "dia" | "semana" | "mes";

// Estilos globais originais mantidos
const containerStyle: React.CSSProperties = {
  minHeight: "100vh",
  backgroundColor: BG,
};

// ═══════════════════════════════════════════════════════════════════
// 🎯 FLUXO ROI DO FOCO PADRONIZADO
// ═══════════════════════════════════════════════════════════════════

function IndicadorProgresso() {
  return (
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
          
          {/* Step 1 - Mapear (ATIVO) */}
          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-orange-400 ring-offset-2 ring-offset-transparent">
              <span className="text-sm font-bold text-white">1</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-orange-400">1. Mapear</span>
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
              </div>
              <p className="text-xs text-white/60">Atividades na matriz</p>
            </div>
          </div>

          {/* Seta 1 */}
          <div className="hidden sm:block text-white/40">
            <ArrowRight className="w-4 h-4" />
          </div>

          {/* Step 2 - Diagnosticar (Pendente) */}
          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 bg-white/10 border border-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-white/60">2</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-white/60">2. Diagnosticar</span>
              </div>
              <p className="text-xs text-white/60">Análise do foco</p>
            </div>
          </div>

          {/* Seta 2 */}
          <div className="hidden sm:block text-white/40">
            <ArrowRight className="w-4 h-4" />
          </div>

          {/* Step 3 - Executar (Pendente) */}
          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 bg-white/10 border border-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-white/60">3</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-white/60">3. Executar</span>
              </div>
              <p className="text-xs text-white/60">Plano de ação</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// ═══════════════════════════════════════════════════════════════════
// 🆕 MELHORIA 2: TIPOGRAFIA UNIFICADA NA SEÇÃO "COMO USAR"
// ═══════════════════════════════════════════════════════════════════

function ComoUsarMapa() {
  const [acordeonAberto, setAcordeonAberto] = useState(false);

  return (
    <section className="mb-8">
      {/* 🔽 HEADER CLICÁVEL DO ACCORDION */}
      <div 
        className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10 cursor-pointer transition-all duration-300 hover:bg-white/8"
        onClick={() => setAcordeonAberto(!acordeonAberto)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-6 h-6 text-orange-400" />
            <div>
              <h2 className="font-mono text-2xl font-bold text-white">Como usar o Mapa</h2>
              <p className="text-base text-white/70 leading-relaxed">
                Aprenda a mapear suas atividades na matriz Impacto × Clareza de forma prática
              </p>
            </div>
          </div>
          {/* Seta à direita com rotação */}
          <div className={`transition-transform duration-300 ${acordeonAberto ? 'rotate-180' : 'rotate-0'}`}>
            <ChevronRight className="w-6 h-6 text-white/60" />
          </div>
        </div>
      </div>

      {/* 📋 CONTEÚDO RETRÁTIL */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        acordeonAberto ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Avaliar Impacto - ✅ MELHORIA 4: Micro-interações */}
          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-400/20 backdrop-blur-sm transition-all duration-300 hover:from-green-500/15 hover:to-emerald-500/15 hover:border-green-400/30 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-green-500/20 transition-all duration-300 hover:bg-green-500/30">
                  <TrendingUp className="w-5 h-5 text-green-300" />
                </div>
                {/* ✅ MELHORIA 2: Tipografia consistente */}
                <h3 className="text-lg font-semibold text-green-200">📈 Avaliar Impacto (1-6)</h3>
              </div>
              <p className="text-green-100 text-sm leading-relaxed mb-4">
                Impacto é sobre mover a agulha de verdade. Pense: se você parar de fazer essa atividade, o que acontece? Se a resposta for 'prejudica resultados importantes', é alto impacto.
              </p>
              <div className="space-y-2 text-xs">
                <div className="text-green-200 font-medium">Exemplos práticos:</div>
                <div className="text-green-100/80">
                  <strong>Alto (4-6):</strong> Revisar indicadores, desenvolver pessoas, entregar projeto-chave
                </div>
                <div className="text-green-100/80">
                  <strong>Baixo (1-3):</strong> Relatórios que ninguém lê, reuniões sem pauta, tarefas 'só para agradar'
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Definir Clareza - ✅ MELHORIA 4: Micro-interações */}
          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-400/20 backdrop-blur-sm transition-all duration-300 hover:from-blue-500/15 hover:to-cyan-500/15 hover:border-blue-400/30 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-blue-500/20 transition-all duration-300 hover:bg-blue-500/30">
                  <Target className="w-5 h-5 text-blue-300" />
                </div>
                {/* ✅ MELHORIA 2: Tipografia consistente */}
                <h3 className="text-lg font-semibold text-blue-200">🎯 Definir Clareza (1-6)</h3>
              </div>
              <p className="text-blue-100 text-sm leading-relaxed mb-4">
                Clareza é ter total controle sobre a atividade. Não é só saber que precisa fazer, mas ter o mapa completo na cabeça.
              </p>
              <div className="space-y-2 text-xs">
                <div className="text-blue-200 font-medium">Na prática:</div>
                <div className="text-blue-100/80">
                  <strong>Alta (4-6):</strong> Você sabe o que precisa ser feito, como vai fazer e quando entregar
                </div>
                <div className="text-blue-100/80">
                  <strong>Baixa (1-3):</strong> Pedidos vagos tipo 'dá uma olhada nisso' ou 'vamos alinhar depois'
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Estimar Tempo - ✅ MELHORIA 4: Micro-interações */}
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-400/20 backdrop-blur-sm transition-all duration-300 hover:from-purple-500/15 hover:to-pink-500/15 hover:border-purple-400/30 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-purple-500/20 transition-all duration-300 hover:bg-purple-500/30">
                  <Timer className="w-5 h-5 text-purple-300" />
                </div>
                {/* ✅ MELHORIA 2: Tipografia consistente */}
                <h3 className="text-lg font-semibold text-purple-200">⏱️ Estimar Tempo</h3>
              </div>
              <p className="text-purple-100 text-sm leading-relaxed mb-4">
                Escolha o período que faz mais sentido para sua rotina real. O importante é capturar quanto tempo você realmente dedica.
              </p>
              <div className="space-y-2 text-xs">
                <div className="text-purple-200 font-medium">Exemplos práticos:</div>
                <div className="text-purple-100/80">
                  <strong>Todo dia</strong> 3h respondendo e-mail → escolher 'dia' e colocar 3
                </div>
                <div className="text-purple-100/80">
                  <strong>Todo mês</strong> 5h no relatório de fechamento → escolher 'mês' e colocar 5
                </div>
                <div className="text-purple-100/80">
                  <strong>Toda semana</strong> 2h em reunião de equipe → escolher 'semana' e colocar 2
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        
      </div>
    </section>
  );
}
// ═══════════════════════════════════════════════════════════════════
// 📋 COMPONENTE PRINCIPAL - COM TODAS AS MELHORIAS UX
// ═══════════════════════════════════════════════════════════════════

export default function MapaAtividadesModular() {
  // ═══════════════════════════════════════════════════════════════════
  // 🔄 ESTADOS (ORIGINAIS - NÃO ALTERADOS)
  // ═══════════════════════════════════════════════════════════════════
  
  const [user, setUser] = useState<any>(null);
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [profile, setProfile] = useState<any>(null); 
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [eixoX, setEixoX] = useState(3);
  const [eixoY, setEixoY] = useState(3);
  const [periodo, setPeriodo] = useState<Periodo>("mes");
  const [horasNoPeriodo, setHorasNoPeriodo] = useState<number>(10);
  const exportRef = React.useRef<HTMLDivElement>(null);



  // ═══════════════════════════════════════════════════════════════════
  // 🔐 TODAS AS FUNÇÕES ORIGINAIS - NÃO ALTERADAS
  // ═══════════════════════════════════════════════════════════════════
  
  useEffect(() => {
  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      
      // ✅ NOVO: Carregar dados do perfil
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, emoji')
          .eq('id', session.user.id)
          .single();
        
        setProfile(profileData);
      } catch (error) {
        console.log('Perfil não encontrado, usando dados básicos');
        setProfile(null);
      }
      
      loadAtividades(session.user.id);
    } else {
      window.location.href = '/auth';
    }
    setLoading(false);
  };
  checkUser();
}, []);

  const loadAtividades = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('atividades')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const atividadesFormatadas = data?.map(item => ({
        id: item.id,
        nome: item.nome,
        eixoX: item.eixo_x,
        eixoY: item.eixo_y,
        horasMes: item.horas_mes,
        user_id: item.user_id
      })) || [];
      
      setAtividades(atividadesFormatadas);
    } catch (error) {
      console.error('Erro ao carregar atividades:', error);
    }
  };

  const salvarAtividade = async (atividade: Atividade) => {
    try {
      const dadosParaSalvar = {
        nome: atividade.nome,
        eixo_x: atividade.eixoX,
        eixo_y: atividade.eixoY,
        horas_mes: atividade.horasMes,
        user_id: user.id
      };

      if (editId) {
        const { error } = await supabase
          .from('atividades')
          .update(dadosParaSalvar)
          .eq('id', editId)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('atividades')
          .insert([dadosParaSalvar]);
        if (error) throw error;
      }
      
      loadAtividades(user.id);
    } catch (error) {
      console.error('Erro ao salvar atividade:', error);
      alert('Erro ao salvar atividade');
    }
  };

  const excluir = async (id: string) => {
    try {
      const { error } = await supabase
        .from('atividades')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      loadAtividades(user.id);
      if (editId === id) resetForm();
    } catch (error) {
      console.error('Erro ao excluir atividade:', error);
    }
  };

  function resetForm() {
    setNome("");
    setEixoX(3);
    setEixoY(3);
    setPeriodo("mes");
    setHorasNoPeriodo(10);
    setEditId(null);
  }

  function adicionarOuAtualizar() {
    const nomeTrim = nome.trim();
    if (!nomeTrim) return;
    const horasMes = normalizarParaHorasMes(periodo, horasNoPeriodo);
    const nova: Atividade = { 
      id: editId || undefined, 
      nome: nomeTrim, 
      eixoX, 
      eixoY, 
      horasMes,
      user_id: user.id 
    };
    salvarAtividade(nova);
    resetForm();
  }

  function editar(a: Atividade) {
  setEditId(a.id || null);
  setNome(a.nome);
  setEixoX(a.eixoX);
  setEixoY(a.eixoY);
  setPeriodo("mes");
  setHorasNoPeriodo(a.horasMes);
  
  // Scroll suave para o formulário
  setTimeout(() => {
    // Buscar pelo ID ou por uma classe mais simples
    const formulario = document.getElementById('formulario-atividade');
    if (formulario) {
      formulario.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    } else {
      // Fallback: scroll para o topo
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, 100);
}

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/auth';
  };

  
const exportarPNG = async () => {
  if (!exportRef.current) return;
  try {
    const canvas = await html2canvas(exportRef.current);
    const link = document.createElement('a');
    link.download = `mapa-atividades-${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL();
    link.click();
  } catch (error) {
    console.error('Erro ao exportar:', error);
  }
};

  // ═══════════════════════════════════════════════════════════════════
  // 🎨 LOADING STATE (ORIGINAL)
  // ═══════════════════════════════════════════════════════════════════

  if (loading) {
    return (
      <div className="min-h-screen bg-[#042f2e] flex items-center justify-center text-white">
        <div className="text-center">
          {/* ✅ MELHORIA 4: Micro-interação no loading */}
          <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-orange-500 rounded-full mx-auto mb-4"></div>
          <p className="text-white/80 font-medium">Carregando suas atividades...</p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // 🖼️ RENDER - COM TODAS AS 4 MELHORIAS UX APLICADAS
  // ═══════════════════════════════════════════════════════════════════

  return (
    <div id="mapa-root" style={containerStyle} className="text-white">
      {/* ✅ MELHORIA 4: CSS melhorado para transições */}
      <style>{`
        :root { --accent: ${ACCENT}; }
        .accent { color: var(--accent); }
        .accent-bg { background-color: var(--accent); }
        .accent-ring { box-shadow: 0 0 0 3px rgba(217,119,6,0.35); }
        .glass { backdrop-filter: blur(8px); background-color: rgba(255,255,255,0.06); }
        .mono-title { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
        #mapa-root, #mapa-root * { color: #fff !important; }
        #mapa-root input::placeholder, #mapa-root textarea::placeholder { color: rgba(255,255,255,0.7) !important; }
        #mapa-root input, #mapa-root textarea, #mapa-root select { color: #fff !important; background: transparent; border-color: rgba(255,255,255,0.2); }
        #mapa-root .recharts-text tspan { fill: #fff !important; }
        #mapa-root .accent-bg, #mapa-root .accent-bg * { color: #000 !important; }
        .legend-dot { display:inline-block; width:10px; height:10px; border-radius:50%; margin-right:6px; }
        
        /* ✅ MELHORIA 4: Transições globais suaves */
        * { transition: all 0.2s ease-in-out; }
        .hover-lift:hover { transform: translateY(-2px); }
/* ✅ CORREÇÃO DO SELECT - Dropdown visível */
        #mapa-root select {
          background-color: #042f2e !important;
          color: #ffffff !important;
          border: 1px solid rgba(255,255,255,0.2) !important;
        }
        
        #mapa-root select option {
          background-color: #042f2e !important;
          color: #ffffff !important;
          padding: 8px !important;
        }
        
        #mapa-root select:focus {
          border-color: #d97706 !important;
          box-shadow: 0 0 0 2px rgba(217,119,6,0.2) !important;
        }
/* ✅ UNIFORMIDADE COMPLETA DOS CAMPOS - Mesmo tom escuro */
        #mapa-root input[type="text"], 
        #mapa-root input[type="number"],
        #mapa-root select {
          background-color: rgba(0,0,0,0.4) !important;
          border: 1px solid rgba(255,255,255,0.2) !important;
          border-radius: 0.375rem !important;
          color: #fff !important;
          transition: all 0.2s ease !important;
        }
        
        #mapa-root input[type="text"]:focus, 
        #mapa-root input[type="number"]:focus,
        #mapa-root select:focus {
          border-color: rgba(14, 165, 233, 0.5) !important;
          box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.1) !important;
          outline: none !important;
          background-color: rgba(0,0,0,0.5) !important;
        }
        
        #mapa-root input[type="text"]:hover, 
        #mapa-root input[type="number"]:hover,
        #mapa-root select:hover {
          border-color: rgba(255,255,255,0.3) !important;
          background-color: rgba(0,0,0,0.45) !important;
        }  
/* ✅ FORÇAR CAMPO NOME/ATIVIDADE - Regra específica */
        #mapa-root input[id="nome"],
        #mapa-root input[placeholder*="Ex.:"],
        #mapa-root .space-y-2 input[type="text"] {
          background-color: rgba(0,0,0,0.4) !important;
          border: 1px solid rgba(255,255,255,0.2) !important;
        }
        
        #mapa-root input[id="nome"]:focus,
        #mapa-root input[placeholder*="Ex:"]:focus,
        #mapa-root .space-y-2 input[type="text"]:focus {
          background-color: rgba(0,0,0,0.5) !important;
          border-color: rgba(14, 165, 233, 0.5) !important;
          box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.1) !important;
        }
    `}</style>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 🎛️ HEADER E CONTROLES - ✅ MELHORIA 2: Tipografia melhorada */}
        <div className="mb-6">
  <h1 className="font-mono text-3xl font-bold text-white mb-2">Mapa de Atividades</h1>
  <div className="flex items-center gap-3 mb-4">
    {/* ✅ NOVO: Emoji e nome do perfil */}
    <div className="flex items-center gap-2">
      <span className="text-2xl">{profile?.emoji || '😊'}</span>
      <div>
        <p className="text-base text-white font-medium">
          Olá, {profile?.full_name || user?.email?.split('@')[0] || 'Usuário'}!
        </p>
        <p className="text-sm text-white/60">
          Mapeie suas atividades na matriz Impacto × Clareza
        </p>
      </div>
    </div>
  </div>
 </div>
    
        {/* ✅ MELHORIA 3: Indicador de progresso */}
        <IndicadorProgresso />

        {/* ✅ SEÇÃO "COMO USAR" - Com melhorias 2 e 4 aplicadas */}
        <ComoUsarMapa />

        <div className="grid lg:grid-cols-3 gap-6">
          {/* ✅ MELHORIA 1: FORMULÁRIO DESTACADO COMO AÇÃO PRINCIPAL */}
          <div className="lg:col-span-1 space-y-6">
            {/* 🎛️ FORMULÁRIO DESTACADO */}
            <div 
id="formulario-atividade"
className={`ring-2 ${editId ? 'ring-orange-500 bg-orange-900/20' : 'ring-orange-500/30 bg-white/8'} rounded-xl p-6 border border-orange-400/20 transition-all duration-300 hover:ring-orange-500/40 hover:bg-white/10`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-lg bg-orange-500/20 transition-all duration-300 hover:bg-orange-500/30">
                  <Plus className="w-6 h-6 text-orange-300" />
                </div>
                <div>
                  {/* ✅ MELHORIA 2: Tipografia consistente */}
                  <h2 className="text-xl font-semibold text-white">
  {editId ? "✏️ Editando Atividade" : "Adicionar Atividade"}
</h2>
{editId && (
  <div className="mt-1 text-xs text-orange-400 font-medium">
    Alterando: {nome || "..."}
  </div>
)}
                  <p className="text-sm text-white/70">Ação principal • Preencha os campos abaixo</p>
                </div>
              </div>
              
              <AtividadeForm
                nome={nome}
                setNome={setNome}
                eixoX={eixoX}
                setEixoX={setEixoX}
                eixoY={eixoY}
                setEixoY={setEixoY}
                periodo={periodo}
                setPeriodo={setPeriodo}
                horasNoPeriodo={horasNoPeriodo}
                setHorasNoPeriodo={setHorasNoPeriodo}
                editId={editId}
                onSubmit={adicionarOuAtualizar}
                onReset={resetForm}
              />
            </div>
            
            {/* 📊 ESTATÍSTICAS - ✅ MELHORIA 4: Micro-interação */}
<div className="hover-lift">
  <MapaStats atividades={atividades} />
</div>

{/* 🎯 CALL-TO-ACTION INTELIGENTE */}
{atividades.length > 0 && (() => {
  const totalHorasMes = atividades.reduce((acc, a) => acc + (a.horasMes || 0), 0);
  const LIMITE_SAUDAVEL = 160; // 20 dias × 8 horas
  
  if (totalHorasMes > LIMITE_SAUDAVEL) {
    const horasExcesso = totalHorasMes - LIMITE_SAUDAVEL;
    const percentualExcesso = ((horasExcesso / LIMITE_SAUDAVEL) * 100).toFixed(0);
    
    return (
      <div className="mt-6 p-4 rounded-lg bg-orange-900/30 border border-orange-700/50 transition-all duration-300 hover:bg-orange-900/40">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
            <HelpCircle size={16} className="text-orange-300" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-orange-200 mb-1">
              ⚠️ Sobrecarga detectada: {totalHorasMes.toFixed(0)}h/mês
            </h4>
            <p className="text-xs text-orange-300/80 mb-3">
              Você está {percentualExcesso}% acima do limite saudável ({LIMITE_SAUDAVEL}h/mês). 
              Isso pode indicar sobrecarga ou atividades de baixo impacto.
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => window.location.href = '/diagnostico'}
                className="px-3 py-1.5 text-xs bg-blue-600/80 hover:bg-blue-600 text-white rounded-md transition-colors"
              >
                📊 Gerar Diagnóstico
              </button>
              <button 
                onClick={() => window.location.href = '/plano-acao'}
                className="px-3 py-1.5 text-xs bg-orange-600/80 hover:bg-orange-600 text-white rounded-md transition-colors"
              >
                🎯 Criar Plano de Ação
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
})()}

{/* 🔬 CARD DIAGNÓSTICO - Desktop apenas (escondido no mobile) */}
<div className="hidden lg:block mt-6">
  <Card className="bg-gradient-to-br from-orange-500/15 to-amber-500/15 border-orange-400/30 backdrop-blur-sm ring-2 ring-orange-400/20 transition-all duration-300 hover:from-orange-500/20 hover:to-amber-500/20 hover:border-orange-400/40 hover:ring-orange-400/30 hover:scale-105">
    <CardContent className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-orange-500/20 transition-all duration-300 hover:bg-orange-500/30">
          <Search className="w-5 h-5 text-orange-300" />
        </div>
        <h3 className="text-lg font-semibold text-orange-200">🔬 Descubra seu Foco</h3>
      </div>
      
      <p className="text-orange-100 text-sm leading-relaxed mb-2">
        Agora que você mapeou suas atividades, quer saber para onde seu tempo está indo de verdade? O diagnóstico vai te mostrar se você está investindo energia no que gera resultado ou só 'apagando incêndio'.
      </p>
      <p className="text-orange-100/80 text-xs italic mb-4">
        É como acender a luz num cômodo bagunçado - de repente você vê tudo.
      </p>
      
      <Button 
        onClick={() => window.location.href = '/diagnostico'}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/20"
      >
        <Lightbulb className="w-4 h-4 mr-2" />
        Executar Diagnóstico
        <ChevronRight className="w-4 h-4 ml-2" />
      </Button>
    </CardContent>
  </Card>
</div>
</div>
          {/* 📈 COLUNA DIREITA - ✅ MELHORIA 4: Micro-interação */}
         
<Card className="glass border-0 lg:col-span-2 hover-lift transition-all duration-300 hover:bg-white/8">
  <CardHeader>
    <CardTitle className="font-mono text-2xl font-bold text-white">Matriz Impacto × Clareza</CardTitle>
    <p className="text-sm text-white/70 leading-relaxed">
      Impacto × Clareza (1-6) • Tamanho = horas/mês • 4 zonas automáticas
    </p>
  </CardHeader>
  <CardContent>
    {/* Versão Mobile - Cards por Zona */}
    <MatrizMobile 
      atividades={atividades}
      onEdit={editar}
      onDelete={excluir}
    />
    
    {/* Versão Desktop - Gráfico Original */}
    <div className="hidden md:block">
      <MapaChart 
        atividades={atividades}
        exportRef={exportRef}
        onEdit={editar}
      />
      
      <AtividadeTable
        atividades={atividades}
        onEdit={editar}
        onDelete={excluir}
      />
    </div>
  </CardContent>
</Card>
        </div>
      </main>
    </div>
  );

}