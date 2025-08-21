// Note: This landing page should be created as src/app/page.tsx
// and the layout.tsx should be updated to exclude this page from showing the sidebar

'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Coffee, 
  Map, 
  MessageCircle, 
  ArrowRight, 
  Mail,
  ExternalLink,
  BookOpen,
  Users,
  Compass,
  Target,
  CheckCircle2,
  ChevronDown,
  BarChart3,
  Clock,
  Brain,
  TrendingUp,
  Zap,
  Eye,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DESIGN_TOKENS, cn } from '@/lib/design-system';

export default function LandingPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  return (
    <div className={cn(
      'min-h-screen w-full',
      `bg-[${DESIGN_TOKENS.colors.background}]`,
      'text-white'
    )}>
      {/* Navigation */}
      <nav className="glass border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Coffee className="w-6 h-6 accent" />
            <div className="text-lg font-bold font-mono accent">
              Conversas no Corredor
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <a 
              href="https://conversasnocorredor.substack.com/about" 
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:block text-sm text-white/70 hover:text-accent transition-colors"
            >
              Sobre
            </a>
            <a 
              href="https://conversasnocorredor.substack.com/s/roi-do-foco" 
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:block text-sm text-white/70 hover:text-accent transition-colors"
            >
              ROI do Foco
            </a>
            <Link href="/auth">
              <Button variant="ghost" size="sm" className="text-white/80 hover:text-white">
                <Mail className="w-4 h-4 mr-2" />
                Acessar
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-32 h-32 bg-accent rounded-full blur-xl"></div>
          <div className="absolute top-60 right-20 w-24 h-24 bg-green-500 rounded-full blur-xl"></div>
          <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-blue-500 rounded-full blur-xl"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-20">
          
          {/* Main Hero */}
          <div className="text-center space-y-8 mb-16">
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-2 text-accent font-medium">
                <MessageCircle className="w-5 h-5" />
                Ferramenta Exclusiva • Assinantes Anuais
              </div>
              
              <h1 className={cn(DESIGN_TOKENS.typography.h1, "text-4xl lg:text-6xl leading-tight max-w-3xl mx-auto font-mono")}>
                <span className="accent">Conversas no Corredor</span>
              </h1>
              
              <p className="text-xl text-white/90 leading-relaxed max-w-2xl mx-auto font-medium">
                Conversas que eu gostaria de ter tido com meus gestores
              </p>
              
              <p className="text-lg text-white/80 leading-relaxed max-w-2xl mx-auto">
                Reflexões práticas que aceleram sua carreira, aumentam suas chances de promoção 
                e dão suporte para crescer com confiança. Agora com uma ferramenta completa 
                para organizar suas prioridades.
              </p>
            </div>

            {/* Social Proof */}
            <div className="glass rounded-lg p-6 max-w-md mx-auto">
              <div className="flex items-center space-x-4">
                <a 
                  href="https://www.linkedin.com/in/adilsonmatioli/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img 
                    src="https://substackcdn.com/image/fetch/w_64,h_64,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff89e806a-e40a-4b77-baf9-969b8575ead1_2160x2160.jpeg" 
                    alt="Adil Matioli" 
                    className="w-14 h-14 rounded-full hover:opacity-80 transition-opacity"
                  />
                </a>
                <div>
                  <a 
                    href="https://www.linkedin.com/in/adilsonmatioli/" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:text-accent transition-colors"
                  >
                    <p className="font-semibold text-white">Adil Matioli</p>
                  </a>
                  <p className="text-sm text-white/70">
                    Estratégia • Vendas • Marketing • CX
                  </p>
                  <p className="text-xs text-accent mt-1">
                    +10 anos até cargos executivos
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="flex justify-center gap-4 text-sm">
              <a 
                href="https://conversasnocorredor.substack.com/about" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/70 hover:text-accent transition-colors"
              >
                <Users className="w-4 h-4" />
                Conheça mais sobre a newsletter
                <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-white/30">•</span>
              <a 
                href="https://conversasnocorredor.substack.com/s/roi-do-foco" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/70 hover:text-accent transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                Leia a série ROI do Foco
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Main CTA */}
            <div className="space-y-4">
              <a 
                href="https://conversasnocorredor.substack.com/subscribe" 
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" className="text-lg px-8 py-4">
                  <Mail className="w-5 h-5 mr-3" />
                  Fazer parte da conversa
                  <ExternalLink className="w-4 h-4 ml-3" />
                </Button>
              </a>
              <p className="text-sm text-white/60">
                Assinatura anual • Acesso completo • Reflexões semanais
              </p>
            </div>

            {/* Quick Access for Existing Users */}
            <div className="pt-6 border-t border-white/20">
              <div className="text-center space-y-3">
                <p className="text-sm text-white/70">
                  Já participa da comunidade?
                </p>
                <Link href="/auth">
                  <Button variant="outline" size="sm" className="border-white/30 hover:bg-white/10 text-white hover:text-white bg-transparent">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Acessar Sistema
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* What You Get - Enhanced */}
          <section className="space-y-8 mb-16">
            <div className="text-center space-y-4">
              <h2 className={cn(DESIGN_TOKENS.typography.h2, "text-3xl font-bold font-mono")}>
                O que você encontra aqui
              </h2>
              <p className="text-white/70 max-w-2xl mx-auto">
                Um ecossistema completo para acelerar seu crescimento profissional
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              
              {/* Newsletter Content */}
              <div className="glass rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 accent" />
                  </div>
                  <h3 className="text-lg font-semibold font-mono">Newsletter + Comunidade</h3>
                </div>
                
                <div className="space-y-3 text-white/80">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 mt-1 text-green-500 flex-shrink-0" />
                    <span className="text-sm">Estratégias para acelerar sua carreira sem queimar etapas</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 mt-1 text-green-500 flex-shrink-0" />
                    <span className="text-sm">Como lidar com chefes difíceis e situações corporativas delicadas</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 mt-1 text-green-500 flex-shrink-0" />
                    <span className="text-sm">Reflexões que você não encontra nos treinamentos formais</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 mt-1 text-green-500 flex-shrink-0" />
                    <span className="text-sm">Acesso exclusivo a ferramentas e templates práticos</span>
                  </div>
                </div>
              </div>

              {/* Tool Access - Enhanced */}
              <div className="glass rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Compass className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold font-mono">Mapa de Atividades</h3>
                </div>
                
                <div className="space-y-3 text-white/80">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 mt-1 text-green-500 flex-shrink-0" />
                    <span className="text-sm">Sistema completo de gestão de atividades e prioridades</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 mt-1 text-green-500 flex-shrink-0" />
                    <span className="text-sm">Diagnóstico automático do seu padrão de foco</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 mt-1 text-green-500 flex-shrink-0" />
                    <span className="text-sm">Sistema inteligente de priorização automática</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 mt-1 text-green-500 flex-shrink-0" />
                    <span className="text-sm">Acompanhamento contínuo do seu progresso</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* System Features */}
          <section className="space-y-8 mb-16">
            <div className="text-center space-y-4">
              <h2 className={cn(DESIGN_TOKENS.typography.h2, "text-3xl font-bold font-mono")}>
                Funcionalidades do sistema
              </h2>
              <p className="text-white/70 max-w-2xl mx-auto">
                Tudo que você precisa para transformar sua produtividade em um só lugar
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Gestão de Atividades */}
              <div className="glass rounded-lg p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto">
                  <Settings className="w-6 h-6 text-green-400" />
                </div>
                <h4 className="font-semibold font-mono">Gestão Completa</h4>
                <p className="text-sm text-white/70">
                  Organize todas suas atividades em um mapa visual baseado em impacto e clareza
                </p>
              </div>

              {/* Diagnóstico Automático */}
              <div className="glass rounded-lg p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto">
                  <Brain className="w-6 h-6 text-blue-400" />
                </div>
                <h4 className="font-semibold font-mono">Diagnóstico Inteligente</h4>
                <p className="text-sm text-white/70">
                  Sistema inteligente analisa seu padrão de foco e identifica onde você deve concentrar esforços
                </p>
              </div>

              {/* Priorização Inteligente */}
              <div className="glass rounded-lg p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center mx-auto">
                  <TrendingUp className="w-6 h-6 text-amber-400" />
                </div>
                <h4 className="font-semibold font-mono">Priorização Inteligente</h4>
                <p className="text-sm text-white/70">
                  Sistema inteligente sugere táticas personalizadas baseadas no framework DAR CERTO
                </p>
              </div>

              {/* Acompanhamento */}
              <div className="glass rounded-lg p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto">
                  <BarChart3 className="w-6 h-6 text-purple-400" />
                </div>
                <h4 className="font-semibold font-mono">Acompanhamento do ROI</h4>
                <p className="text-sm text-white/70">
                  Veja onde você está investindo seu tempo e como focar no que realmente gera retorno
                </p>
              </div>
            </div>
          </section>

          {/* Why ROI do Foco */}
          <section className="space-y-8 mb-16">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className={cn(DESIGN_TOKENS.typography.h2, "text-2xl font-bold font-mono")}>
                Por que ROI do Foco?
              </h2>
              <div className="glass rounded-lg p-6 text-left space-y-4">
                <p className="text-white/80 leading-relaxed">
                  <span className="accent font-semibold">ROI</span> significa "Return on Investment" — retorno sobre investimento. 
                  Quando aplicamos esse conceito ao <span className="accent font-semibold">foco</span>, estamos perguntando: 
                  <em>"Onde meu tempo e energia geram maior retorno?"</em>
                </p>
                <p className="text-white/80 leading-relaxed">
                  A diferença entre estar ocupado e ser produtivo está em investir seu tempo consciente 
                  nas atividades que realmente movem a agulha da sua carreira. É sobre trabalhar no que importa, 
                  não apenas no que é urgente.
                </p>
                <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 mt-4">
                  <p className="text-sm text-accent font-medium">
                    💡 "Uma rotina de impacto não precisa parecer lotada, atribulada e sem tempo para nada."
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ROI do Foco Section */}
          <section className="space-y-8 mb-16">
            <div className="text-center space-y-4">
              <h2 className={cn(DESIGN_TOKENS.typography.h2, "text-3xl font-bold font-mono")}>
                ROI do Foco: da newsletter para a prática
              </h2>
              <p className="text-white/70 max-w-2xl mx-auto">
                Transformei a série mais popular da newsletter em uma ferramenta interativa
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
              
              {/* Collapsible sections */}
              <div className="space-y-6">
                
                {/* Explorar */}
                <div className="glass rounded-lg overflow-hidden relative z-10 transition-all duration-300 hover:shadow-lg">
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      setExpandedSection(expandedSection === 'explorar' ? null : 'explorar');
                    }}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:bg-green-500/30">
                        <Map className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold font-mono text-lg">1. Explorar</h3>
                        <p className="text-sm text-white/70">Mapeie todas suas atividades na matriz Impacto × Clareza</p>
                      </div>
                    </div>
                    <ChevronDown className={cn(
                      "w-5 h-5 transition-all duration-300 ease-in-out",
                      expandedSection === 'explorar' ? 'rotate-180 text-green-400' : 'text-white/60'
                    )} />
                  </button>
                  
                  <div className={cn(
                    "overflow-hidden transition-all duration-500 ease-in-out",
                    expandedSection === 'explorar' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  )}>
                    <div className="px-6 pb-6 pt-0 text-sm text-white/80 border-t border-white/10 bg-gradient-to-b from-green-500/5 to-transparent">
                      <div className="pt-4 space-y-4">
                        <p className="leading-relaxed">
                          "A ideia é abrir o leque de atividades e examinar todas as opções para depois ser seletivo. 
                          O objetivo não é cortar nada ainda, mas entender o cenário completo."
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-lg">
                            <div className="font-medium text-green-400 mb-1">🎯 Essencial</div>
                            <div className="text-white/70">Alto impacto + Alta clareza</div>
                          </div>
                          <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg">
                            <div className="font-medium text-blue-400 mb-1">📈 Estratégica</div>
                            <div className="text-white/70">Alto impacto + Baixa clareza</div>
                          </div>
                          <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg">
                            <div className="font-medium text-amber-400 mb-1">⚡ Tática</div>
                            <div className="text-white/70">Baixo impacto + Alta clareza</div>
                          </div>
                          <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                            <div className="font-medium text-red-400 mb-1">💭 Distração</div>
                            <div className="text-white/70">Baixo impacto + Baixa clareza</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Eliminar */}
                <div className="glass rounded-lg overflow-hidden relative z-10 transition-all duration-300 hover:shadow-lg">
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      setExpandedSection(expandedSection === 'eliminar' ? null : 'eliminar');
                    }}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center transition-all duration-200">
                        <Target className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold font-mono text-lg">2. Eliminar</h3>
                        <p className="text-sm text-white/70">Use o framework DAR CERTO para liberar espaço na agenda</p>
                      </div>
                    </div>
                    <ChevronDown className={cn(
                      "w-5 h-5 transition-all duration-300 ease-in-out",
                      expandedSection === 'eliminar' ? 'rotate-180 text-red-400' : 'text-white/60'
                    )} />
                  </button>
                  
                  <div className={cn(
                    "overflow-hidden transition-all duration-500 ease-in-out",
                    expandedSection === 'eliminar' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  )}>
                    <div className="px-6 pb-6 pt-0 text-sm text-white/80 border-t border-white/10 bg-gradient-to-b from-red-500/5 to-transparent">
                      <div className="pt-4 space-y-4">
                        <p className="leading-relaxed">
                          "Quando a gente vive apagando incêndios, o padrão mais comum é encontrar a maior parte 
                          do tempo dominado por tarefas da Zona de Distração e da Zona Tática."
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="bg-white/5 border border-white/10 p-3 rounded-lg">
                            <span className="font-medium">🗑️ <strong>D</strong>escartar</span> • <span className="font-medium">⚡ <strong>A</strong>utomatizar</span>
                          </div>
                          <div className="bg-white/5 border border-white/10 p-3 rounded-lg">
                            <span className="font-medium">📉 <strong>R</strong>eduzir</span> • <span className="font-medium">📦 <strong>C</strong>ombinar</span>
                          </div>
                          <div className="bg-white/5 border border-white/10 p-3 rounded-lg">
                            <span className="font-medium">➡️ <strong>E</strong>ncaminhar</span> • <span className="font-medium">🔄 <strong>R</strong>evisitar</span>
                          </div>
                          <div className="bg-white/5 border border-white/10 p-3 rounded-lg">
                            <span className="font-medium">👥 <strong>T</strong>reinar/Delegar</span> • <span className="font-medium">⚡ <strong>O</strong>timizar</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Executar */}
                <div className="glass rounded-lg overflow-hidden relative z-10 transition-all duration-300 hover:shadow-lg">
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      setExpandedSection(expandedSection === 'executar' ? null : 'executar');
                    }}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center transition-all duration-200">
                        <CheckCircle2 className="w-5 h-5 accent" />
                      </div>
                      <div>
                        <h3 className="font-semibold font-mono text-lg">3. Executar</h3>
                        <p className="text-sm text-white/70">Foque no essencial e estratégico com consistência</p>
                      </div>
                    </div>
                    <ChevronDown className={cn(
                      "w-5 h-5 transition-all duration-300 ease-in-out",
                      expandedSection === 'executar' ? 'rotate-180 accent' : 'text-white/60'
                    )} />
                  </button>
                  
                  <div className={cn(
                    "overflow-hidden transition-all duration-500 ease-in-out",
                    expandedSection === 'executar' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  )}>
                    <div className="px-6 pb-6 pt-0 text-sm text-white/80 border-t border-white/10 bg-gradient-to-b from-amber-500/5 to-transparent">
                      <div className="pt-4 space-y-4">
                        <p className="leading-relaxed">
                          "O verdadeiro ROI do Foco vem quando você começa a investir seu tempo nas atividades 
                          que realmente fazem diferença. Quando você entrega de forma consistente o que importa, 
                          as pessoas percebem."
                        </p>
                        <div className="bg-accent/10 border border-accent/20 p-3 rounded-lg">
                          <p className="text-xs accent font-medium">
                            📅 Blocos de tempo • 🎯 Agenda anti-caos • 📊 Diagnóstico inteligente
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="space-y-8">
            <div className="max-w-2xl mx-auto text-center space-y-8">
              
              {/* For New Subscribers */}
              <div className="glass rounded-2xl p-8 space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3 font-mono">Começar a conversa</h3>
                  <p className="text-white/80">
                    Assine a newsletter anualmente e tenha acesso completo ao Mapa de Atividades. 
                    Faça parte de uma comunidade que cresce junto e receba todas as ferramentas práticas.
                  </p>
                </div>
                
                <a 
                  href="https://conversasnocorredor.substack.com/subscribe" 
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="lg" className="w-full text-lg py-4">
                    <Mail className="w-5 h-5 mr-3" />
                    Assinar Newsletter Anual
                    <ExternalLink className="w-4 h-4 ml-3" />
                  </Button>
                </a>
                
                <p className="text-sm text-white/60">
                  Acesso à ferramenta liberado em até 24h para assinantes anuais
                </p>
              </div>

              {/* For Existing Subscribers - Removed, now at top */}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Coffee className="w-5 h-5 accent" />
            <span className="text-lg font-semibold font-mono accent">
              Conversas no Corredor
            </span>
          </div>
          <p className="text-white/60 text-sm max-w-md mx-auto">
            Reflexões práticas sobre crescimento profissional que eu gostaria 
            de ter tido com meus gestores
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <a 
              href="https://conversasnocorredor.substack.com" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-accent transition-colors"
            >
              Newsletter
            </a>
            <a 
              href="https://conversasnocorredor.substack.com/about" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-accent transition-colors"
            >
              Sobre
            </a>
            <a 
              href="https://conversasnocorredor.substack.com/s/roi-do-foco" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-accent transition-colors"
            >
              ROI do Foco
            </a>
            <Link href="/privacidade" className="text-white/60 hover:text-accent transition-colors">
              Privacidade
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}