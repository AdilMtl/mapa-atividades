// 🗺️ MAPA DE ATIVIDADES - VERSÃO MODULAR (CORREÇÃO MÍNIMA)
// Arquivo: src/components/mapa-atividades-modular.tsx

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
  ChevronRight
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
// 🆕 COMPONENTE: SEÇÃO "COMO USAR O MAPA" 
// ═══════════════════════════════════════════════════════════════════

function ComoUsarMapa() {
  return (
    <section className="mb-8">
      <div className="mb-6">
        <h2 className="mono-title text-2xl font-bold mb-2 flex items-center gap-3">
          <HelpCircle className="w-6 h-6 text-orange-400" />
          Como usar o Mapa
        </h2>
        <p className="text-white/70">
          Aprenda a mapear suas atividades na matriz Impacto × Clareza de forma prática
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Avaliar Impacto */}
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-400/20 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-green-500/20">
                <TrendingUp className="w-5 h-5 text-green-300" />
              </div>
              <h3 className="font-semibold text-green-200">📈 Avaliar Impacto (1-6)</h3>
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

        {/* Card 2: Definir Clareza */}
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-400/20 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Target className="w-5 h-5 text-blue-300" />
              </div>
              <h3 className="font-semibold text-blue-200">🎯 Definir Clareza (1-6)</h3>
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

        {/* Card 3: Estimar Tempo */}
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-400/20 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Timer className="w-5 h-5 text-purple-300" />
              </div>
              <h3 className="font-semibold text-purple-200">⏱️ Estimar Tempo</h3>
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

        {/* Card 4: Diagnóstico - Destacado */}
        <Card className="bg-gradient-to-br from-orange-500/15 to-amber-500/15 border-orange-400/30 backdrop-blur-sm ring-2 ring-orange-400/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <Search className="w-5 h-5 text-orange-300" />
              </div>
              <h3 className="font-semibold text-orange-200">🔬 Descubra seu Foco</h3>
            </div>
            <p className="text-orange-100 text-sm leading-relaxed mb-4">
              Agora que você mapeou suas atividades, quer saber para onde seu tempo está indo de verdade? O diagnóstico vai te mostrar se você está investindo energia no que gera resultado ou só 'apagando incêndio'.
            </p>
            <p className="text-orange-100/80 text-xs mb-4 italic">
              É como acender a luz num cômodo bagunçado - de repente você vê tudo.
            </p>
            <Button 
              onClick={() => window.location.href = '/diagnostico'}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium"
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
// 📋 COMPONENTE PRINCIPAL - MANTENDO TODA ESTRUTURA ORIGINAL
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
        Carregando...
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // 🖼️ RENDER - APENAS REMOVEU BOTÃO DUPLICADO E ADICIONOU SEÇÃO
  // ═══════════════════════════════════════════════════════════════════

  return (
    <div id="mapa-root" style={containerStyle} className="text-white">
      {/* Estilos globais originais mantidos */}
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
      `}</style>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 🎛️ HEADER E CONTROLES - Componente modular (ORIGINAL) */}
        <MapaControls 
          user={user}
          onExport={exportarPNG}
          onLogout={logout}
        />

        {/* ❌ BOTÃO DUPLICADO REMOVIDO - essas linhas foram deletadas! */}
        
        {/* 🆕 NOVA SEÇÃO: COMO USAR O MAPA */}
        <ComoUsarMapa />

        <div className="grid lg:grid-cols-3 gap-6">
          {/* 📝 COLUNA ESQUERDA - Formulário + Estatísticas (ORIGINAL) */}
          <div className="lg:col-span-1 space-y-6">
            {/* 🎛️ FORMULÁRIO - Componente modular (ORIGINAL) */}
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
            
            {/* 📊 ESTATÍSTICAS - Componente modular (ORIGINAL) */}
            <MapaStats atividades={atividades} />
          </div>

          {/* 📈 COLUNA DIREITA - Gráfico + Tabela (ORIGINAL) */}
          <Card className="glass border-0 lg:col-span-2">
            <CardHeader>
              <CardTitle className="mono-title">Gráfico de bolhas</CardTitle>
            </CardHeader>
            <CardContent>
              {/* 📈 GRÁFICO - Componente modular (ORIGINAL) */}
              <MapaChart 
                atividades={atividades}
                exportRef={exportRef}
              />
              
              {/* 📋 TABELA - Componente modular (ORIGINAL) */}
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