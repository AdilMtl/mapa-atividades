'use client'
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Scatter, ScatterChart, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import { Download, Plus, Save, Trash2, Edit, Info } from "lucide-react";
import { supabase } from "@/lib/supabase";

// Configurações originais mantidas
const BG = "#042f2e";
const ACCENT = "#d97706";
const SCALE_MIN = 1;
const SCALE_MAX = 6;
const THRESHOLD_HIGH = 4;
const RED = "#ef4444";
const ORANGE = "#f59e0b";
const BLUE = "#3b82f6";
const GREEN = "#22c55e";
const ROTULO_X = "Impacto";
const ROTULO_Y = "Clareza";
const DIAS_MES_BASE = 30;
const DIAS_UTEIS_MES = 20;
const SEMANAS_MES = 4;

export interface Atividade {
  id?: string;
  nome: string;
  eixoX: number;
  eixoY: number;
  horasMes: number;
  user_id?: string;
}

type Periodo = "dia" | "semana" | "mes";
export type Zona = "distracao" | "tactica" | "estrategica" | "essencial";

// Funções utilitárias originais
function formatHoras(num: number) {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(num);
}

export function normalizarParaHorasMes(periodo: Periodo, horasNoPeriodo: number): number {
  const h = Math.max(0, Number(horasNoPeriodo) || 0);
  switch (periodo) {
    case "dia": return h * DIAS_UTEIS_MES;
    case "semana": return h * SEMANAS_MES;
    case "mes":
    default: return h;
  }
}

export function zonaECor(impacto: number, clareza: number): { zona: Zona; cor: string } {
  const impactoAlto = impacto >= THRESHOLD_HIGH;
  const clarezaAlta = clareza >= THRESHOLD_HIGH;
  if (impactoAlto && clarezaAlta) return { zona: "essencial", cor: GREEN };
  if (!impactoAlto && !clarezaAlta) return { zona: "distracao", cor: RED };
  if (!impactoAlto && clarezaAlta) return { zona: "tactica", cor: ORANGE };
  return { zona: "estrategica", cor: BLUE };
}

export function calcScatterData(atividades: Atividade[]) {
  return atividades.map((a) => ({
    x: a.eixoX,
    y: a.eixoY,
    z: Math.max(a.horasMes / DIAS_MES_BASE, 0.01),
    nome: a.nome,
    hMes: a.horasMes,
    ...zonaECor(a.eixoX, a.eixoY),
  }));
}

const containerStyle: React.CSSProperties = {
  minHeight: "100vh",
  backgroundColor: BG,
};

export default function MapaAtividades() {
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

  // Verificar autenticação
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

  const scatterData = useMemo(() => calcScatterData(atividades), [atividades]);
  const totalHorasMes = useMemo(() => atividades.reduce((acc, a) => acc + (a.horasMes || 0), 0), [atividades]);

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

  const horasMesPreview = useMemo(() => normalizarParaHorasMes(periodo, horasNoPeriodo), [periodo, horasNoPeriodo]);
  const horasDiaPreview = useMemo(() => horasMesPreview / DIAS_MES_BASE, [horasMesPreview]);
  const TICKS = [1, 2, 3, 4, 5, 6];

  if (loading) {
    return <div className="min-h-screen bg-[#042f2e] flex items-center justify-center text-white">Carregando...</div>;
  }

  return (
    <div id="mapa-root" style={containerStyle} className="text-white">
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
        <header className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="mono-title text-3xl font-bold tracking-tight">Mapa de Atividades</h1>
            <p className="text-sm opacity-80">
              Logado como: {user?.email} • Impacto × Clareza (1-6)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={exportarPNG} className="accent-bg hover:opacity-90 text-black font-semibold">
              <Download className="mr-2 h-4 w-4"/>Exportar PNG
            </Button>
            <Button onClick={logout} variant="outline">Sair</Button>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="glass border-0 lg:col-span-1">
            <CardHeader><CardTitle className="mono-title">Atividade</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input id="nome" placeholder="Ex.: Exercícios físicos" value={nome} onChange={(e) => setNome(e.target.value)} className="bg-transparent border-white/20 focus-visible:ring-[var(--accent)]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="block mb-1">{ROTULO_X} (1-6)</Label><DiscreteSlider value={eixoX} onChange={setEixoX} /></div>
                <div><Label className="block mb-1">{ROTULO_Y} (1-6)</Label><DiscreteSlider value={eixoY} onChange={setEixoY} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="periodo">Período</Label>
                  <select id="periodo" value={periodo} onChange={(e) => setPeriodo(e.target.value as Periodo)} className="w-full rounded-md bg-transparent border border-white/20 px-3 py-2">
                    <option value="dia">Dia</option>
                    <option value="semana">Semana</option>
                    <option value="mes">Mês</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="horasPeriodo">Horas por {periodo}</Label>
                  <Input id="horasPeriodo" type="number" min={0} step="0.25" value={horasNoPeriodo} onChange={(e) => setHorasNoPeriodo(Number(e.target.value))} className="bg-transparent border-white/20 focus-visible:ring-[var(--accent)]" />
                </div>
              </div>
              <p className="text-xs opacity-70">Equivale a <strong>{formatHoras(horasMesPreview)}</strong> h/mês ({formatHoras(horasDiaPreview)} h/dia).</p>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button onClick={adicionarOuAtualizar} className="accent-bg hover:opacity-90 text-black font-semibold">
                  <Plus className="mr-2 h-4 w-4"/>{editId ? "Atualizar" : "Adicionar"}
                </Button>
                <Button variant="destructive" onClick={resetForm} className="bg-red-600 hover:bg-red-700">
                  <Save className="mr-2 h-4 w-4"/>Limpar formulário
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-0 lg:col-span-2">
            <CardHeader><CardTitle className="mono-title">Gráfico de bolhas</CardTitle></CardHeader>
            <CardContent>
              <div ref={exportRef} className="rounded-xl p-4" style={{ background: "rgba(4,47,46,0.6)" }}>
                <div className="h-[380px] w-full">
                  <ResponsiveContainer>
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <CartesianGrid stroke="rgba(255,255,255,0.15)" />
                      <XAxis type="number" dataKey="x" domain={[SCALE_MIN, SCALE_MAX]} ticks={TICKS} allowDecimals={false} label={{ value: ROTULO_X, position: "insideBottom", offset: -8, fill: "#fff" }} stroke="#fff" />
                      <YAxis type="number" dataKey="y" domain={[SCALE_MIN, SCALE_MAX]} ticks={TICKS} allowDecimals={false} label={{ value: ROTULO_Y, angle: -90, position: "insideLeft", fill: "#fff" }} stroke="#fff" />
                      <ZAxis dataKey="z" range={[70, 300]} />
                      <Tooltip content={<CustomTooltip rotuloX={ROTULO_X} rotuloY={ROTULO_Y} />} />
                      <Scatter data={scatterData}>
                        {scatterData.map((d: any, idx: number) => (
                          <Cell key={`cell-${idx}`} fill={d.cor} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-6">
                  <h3 className="mono-title text-lg mb-2">Tabela de atividades</h3>
                  <Table className="text-sm">
                    <TableHeader>
                      <TableRow className="border-white/10">
                        <TableHead className="text-white/90">Atividade</TableHead>
                        <TableHead className="text-white/90">{ROTULO_X}</TableHead>
                        <TableHead className="text-white/90">{ROTULO_Y}</TableHead>
                        <TableHead className="text-white/90">Horas/mês</TableHead>
                        <TableHead className="text-white/90">Horas/dia</TableHead>
                        <TableHead className="text-white/90 text-right">Zona</TableHead>
                        <TableHead className="text-white/90 text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {atividades.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center opacity-70 py-6">Nenhuma atividade ainda. Adicione usando o formulário ao lado.</TableCell>
                        </TableRow>
                      ) : (
                        atividades.map((a) => {
                          const { zona } = zonaECor(a.eixoX, a.eixoY);
                          const etiqueta = zona === "distracao" ? "Distração" : zona === "tactica" ? "Tática" : zona === "estrategica" ? "Estratégica" : "Essencial";
                          return (
                            <TableRow key={a.id} className="border-white/10">
                              <TableCell className="font-medium">{a.nome}</TableCell>
                              <TableCell>{a.eixoX}</TableCell>
                              <TableCell>{a.eixoY}</TableCell>
                              <TableCell>{formatHoras(a.horasMes)}</TableCell>
                              <TableCell>{formatHoras(a.horasMes / DIAS_MES_BASE)}</TableCell>
                              <TableCell className="text-right">{etiqueta}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex gap-1 justify-end">
                                  <Button size="sm" variant="ghost" onClick={() => editar(a)}>
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button size="sm" variant="destructive" onClick={() => excluir(a.id!)}>
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                  <div className="mt-3 text-xs opacity-80">Total de horas/mês: <strong>{formatHoras(totalHorasMes)}</strong></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function CustomTooltip({ active, payload, rotuloX, rotuloY }: any) {
  if (active && payload && payload.length) {
    const d = payload[0].payload as { nome: string; x: number; y: number; z: number };
    return (
      <div style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.15)", padding: 10, borderRadius: 8, color: "#fff" }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>{d.nome}</div>
        <div>{rotuloX}: <strong>{d.x}</strong></div>
        <div>{rotuloY}: <strong>{d.y}</strong></div>
        <div>h/dia: <strong>{formatHoras(d.z)}</strong></div>
      </div>
    );
  }
  return null;
}

function DiscreteSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [internal, setInternal] = useState<number>(value);
  useEffect(() => setInternal(value), [value]);
  function commit(vals: number[]) {
    const v = Math.min(SCALE_MAX, Math.max(SCALE_MIN, Math.round(vals[0] ?? 3)));
    setInternal(v);
    onChange(v);
  }
  return (
    <div>
      <div className="flex items-center gap-2">
        <Slider value={[internal]} min={SCALE_MIN} max={SCALE_MAX} step={1} onValueChange={(vals) => setInternal(vals[0] ?? 3)} onValueCommit={commit} className="[&_>.range]:bg-[var(--accent)]" />
        <span className="w-8 text-right font-semibold">{internal}</span>
      </div>
      <div className="flex justify-between text-[10px] mt-1 opacity-70">{[1,2,3,4,5,6].map((n) => (<span key={n}>{n}</span>))}</div>
    </div>
  );
}