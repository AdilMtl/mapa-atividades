// 🗺️ MAPA DE ATIVIDADES - VERSÃO UX PROFISSIONAL
// Arquivo: src/components/mapa-atividades-modular.tsx
// ✅ MELHORIAS: Formulário destacado + Tipografia + Progresso + Micro-interações

'use client'
import React, { useEffect, useMemo, useRef, useState } from "react";
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
// 🆕 MELHORIA 3: INDICADOR DE PROGRESSO
// ═══════════════════════════════════════════════════════════════════

function IndicadorProgresso() {
  return (
    <div className="mb-8 p-4 bg-white/5 rounded-lg border border-white/10 transition-all duration-300 hover:bg-white/8">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white/90 mb-4">Fluxo ROI do Foco</h3>
        <span className="text-xs text-white/60">Siga os 3 passos</span>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Etapa 1: Mapear (ATIVA) */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center ring-2 ring-green-400/50 transition-all duration-300">
            <Check className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-green-200 font-medium text-sm">1. Mapear</div>
            <div className="text-green-300/80 text-xs">Atividades na matriz</div>
          </div>
        </div>
        
        <ArrowRight className="w-5 h-5 text-white/40" />
        
        {/* Etapa 2: Diagnosticar (PRÓXIMA) */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-orange-500 flex items-center justify-center transition-all duration-300 hover:bg-orange-500/20">
            <span className="text-orange-400 font-bold text-sm">2</span>
          </div>
          <div>
            <div className="text-orange-200 font-medium text-sm">2. Diagnosticar</div>
            <div className="text-orange-300/80 text-xs">Análise do foco</div>
          </div>
        </div>
        
        <ArrowRight className="w-5 h-5 text-white/40" />
        
        {/* Etapa 3: Executar */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-white/30 flex items-center justify-center transition-all duration-300">
            <span className="text-white/50 font-bold text-sm">3</span>
          </div>
          <div>
            <div className="text-white/50 font-medium text-sm">3. Executar</div>
            <div className="text-white/40 text-xs">Plano de ação</div>
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
  return (
    <section className="mb-8">
      <div className="mb-6">
        {/* ✅ MELHORIA 2: Tipografia unificada */}
        <h2 className="font-mono text-2xl font-bold mb-2 flex items-center gap-3 text-white">
          <HelpCircle className="w-6 h-6 text-orange-400" />
          Como usar o Mapa
        </h2>
        <p className="text-base text-white/70 leading-relaxed">
          Aprenda a mapear suas atividades na matriz Impacto × Clareza de forma prática
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
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

        {/* Card 4: Diagnóstico - ✅ MELHORIA 4: Micro-interações melhoradas */}
        <Card className="bg-gradient-to-br from-orange-500/15 to-amber-500/15 border-orange-400/30 backdrop-blur-sm ring-2 ring-orange-400/20 transition-all duration-300 hover:from-orange-500/20 hover:to-amber-500/20 hover:border-orange-400/40 hover:ring-orange-400/30 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-orange-500/20 transition-all duration-300 hover:bg-orange-500/30">
                <Search className="w-5 h-5 text-orange-300" />
              </div>
              {/* ✅ MELHORIA 2: Tipografia consistente */}
              <h3 className="text-lg font-semibold text-orange-200">🔬 Descubra seu Foco</h3>
            </div>
            <p className="text-orange-100 text-sm leading-relaxed mb-4">
              Agora que você mapeou suas atividades, quer saber para onde seu tempo está indo de verdade? O diagnóstico vai te mostrar se você está investindo energia no que gera resultado ou só 'apagando incêndio'.
            </p>
            <p className="text-orange-100/80 text-xs mb-4 italic">
              É como acender a luz num cômodo bagunçado - de repente você vê tudo.
            </p>
            {/* ✅ MELHORIA 4: Micro-interação no botão */}
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
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [eixoX, setEixoX] = useState(3);
  const [eixoY, setEixoY] = useState(3);
  const [periodo, setPeriodo] = useState<Periodo>("mes");
  const [horasNoPeriodo, setHorasNoPeriodo] = useState<number>(10);

  const exportRef = useRef<HTMLDivElement>(null);

  // ═══════════════════════════════════════════════════════════════════
  // 🔐 TODAS AS FUNÇÕES ORIGINAIS - NÃO ALTERADAS
  // ═══════════════════════════════════════════════════════════════════
  
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
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
  }

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/auth';
  };

  async function exportarPNG() {
    if (!exportRef.current) return;
    const node = exportRef.current;
    const canvas = await html2canvas(node, { backgroundColor: BG, scale: 2 });
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    link.download = `mapa-atividades-${stamp}.png`;
    link.click();
  }

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
      `}</style>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 🎛️ HEADER E CONTROLES - ✅ MELHORIA 2: Tipografia melhorada */}
        <div className="mb-6">
          <h1 className="font-mono text-3xl font-bold text-white mb-2">Mapa de Atividades</h1>
          <p className="text-base text-white/70 leading-relaxed mb-4">
            Logado como: {user?.email} • Mapeie suas atividades na matriz Impacto × Clareza
          </p>
          
          {/* Botões de ação principais */}
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={exportarPNG}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105"
            >
              Exportar PNG
            </Button>
            <Button 
              onClick={() => window.location.href = '/diagnostico'}
              className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 hover:scale-105"
            >
              📊 Diagnóstico do Foco
            </Button>
            <Button 
              onClick={() => window.location.href = '/plano-acao'}
              className="accent-bg hover:opacity-90 text-black font-semibold transition-all duration-300 hover:scale-105"
            >
              <ClipboardList className="mr-2 h-4 w-4"/>
              Plano de Ação
            </Button>
            <Button 
              onClick={logout}
              variant="outline"
              className="border-red-500/30 text-red-200 hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-300"
            >
              Sair
            </Button>
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
            <div className="ring-2 ring-orange-500/30 bg-white/8 rounded-xl p-6 border border-orange-400/20 transition-all duration-300 hover:ring-orange-500/40 hover:bg-white/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-lg bg-orange-500/20 transition-all duration-300 hover:bg-orange-500/30">
                  <Plus className="w-6 h-6 text-orange-300" />
                </div>
                <div>
                  {/* ✅ MELHORIA 2: Tipografia consistente */}
                  <h2 className="text-xl font-semibold text-white">
                    {editId ? "Editar Atividade" : "Adicionar Atividade"}
                  </h2>
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
          </div>

          {/* 📈 COLUNA DIREITA - ✅ MELHORIA 4: Micro-interação */}
          <Card className="glass border-0 lg:col-span-2 hover-lift transition-all duration-300 hover:bg-white/8">
            <CardHeader>
              {/* ✅ MELHORIA 2: Tipografia consistente */}
              <CardTitle className="font-mono text-2xl font-bold text-white">Gráfico de bolhas</CardTitle>
              <p className="text-sm text-white/70 leading-relaxed">
                Impacto × Clareza (1-6) • Tamanho = horas/mês • 4 zonas automáticas
              </p>
            </CardHeader>
            <CardContent>
              <MapaChart 
                atividades={atividades}
                exportRef={exportRef}
              />
              
              <AtividadeTable
                atividades={atividades}
                onEdit={editar}
                onDelete={excluir}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}