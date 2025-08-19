// 🗺️ MAPA DE ATIVIDADES - VERSÃO MODULAR
// Arquivo: src/components/mapa-atividades-modular.tsx
// ⚠️ BACKUP: Mantenha o arquivo original como mapa-atividades-original.tsx

'use client'
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import html2canvas from "html2canvas";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ClipboardList } from "lucide-react";


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

export default function MapaAtividadesModular() {
  // ═══════════════════════════════════════════════════════════════════
  // 🔄 ESTADOS (idênticos ao original)
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
  // 🔐 AUTENTICAÇÃO (idêntica ao original)
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

  // ═══════════════════════════════════════════════════════════════════
  // 🗄️ OPERAÇÕES COM BANCO (idênticas ao original)
  // ═══════════════════════════════════════════════════════════════════

  // Carregar atividades do Supabase
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

  // Salvar atividade no Supabase
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

  // Excluir atividade
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

  // ═══════════════════════════════════════════════════════════════════
  // 🎛️ FUNÇÕES DE CONTROLE (idênticas ao original)
  // ═══════════════════════════════════════════════════════════════════

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
  // 🎨 LOADING STATE (idêntico ao original)
  // ═══════════════════════════════════════════════════════════════════

  if (loading) {
    return (
      <div className="min-h-screen bg-[#042f2e] flex items-center justify-center text-white">
        Carregando...
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // 🖼️ RENDER MODULAR - USANDO OS COMPONENTES CRIADOS
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
        {/* 🎛️ HEADER E CONTROLES - Componente modular */}
        <MapaControls 
          user={user}
          onExport={exportarPNG}
          onLogout={logout}
        />
<Button 
  onClick={() => window.location.href = '/plano-acao'} 
  className="accent-bg hover:opacity-90 text-black font-semibold"
>
  <ClipboardList className="mr-2 h-4 w-4"/>
  Plano de Ação
</Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* 📝 COLUNA ESQUERDA - Formulário + Estatísticas */}
          <div className="lg:col-span-1 space-y-6">
            {/* 🎛️ FORMULÁRIO - Componente modular */}
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
            
            {/* 📊 ESTATÍSTICAS - Componente modular NOVO */}
            <MapaStats atividades={atividades} />
          </div>

          {/* 📈 COLUNA DIREITA - Gráfico + Tabela */}
          <Card className="glass border-0 lg:col-span-2">
            <CardHeader>
              <CardTitle className="mono-title">Gráfico de bolhas</CardTitle>
            </CardHeader>
            <CardContent>
              {/* 📈 GRÁFICO - Componente modular */}
              <MapaChart 
                atividades={atividades}
                exportRef={exportRef}
              />
              
              {/* 📋 TABELA - Componente modular */}
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