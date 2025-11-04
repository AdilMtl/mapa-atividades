// src/app/page.tsx
// Landing Page V3 - Mobile Optimized - CÓDIGO COMPLETO

'use client'
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Coffee, Map, MessageCircle, ArrowRight, Mail, ExternalLink, BookOpen, Users,
  Compass, Target, CheckCircle2, ChevronDown, BarChart3, Clock, Brain, TrendingUp,
  Zap, Eye, Settings, Play, Sparkles, Lightbulb, ChartBar, Layout, Phone,
  DollarSign, Award, Star, User, X, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DESIGN_TOKENS, cn } from '@/lib/design-system';

export default function LandingPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [currentVideo, setCurrentVideo] = useState(0);
  const [isVideoSectionVisible, setIsVideoSectionVisible] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [videoStates, setVideoStates] = useState<Record<number, boolean>>({
    0: true, 1: false, 2: false, 3: false
  });
  
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const videoData = [
    {
      name: 'mapeamento', icon: Map, color: 'green',
      title: '1. Mapeie suas atividades',
      subtitle: 'Visualize onde seu tempo está sendo investido',
      description: 'Em apenas 5 minutos, mapeie todas suas atividades em uma matriz visual de Impacto × Clareza. Descubra instantaneamente se você está no modo bombeiro ou investindo no que importa.',
      highlight: '📊 Mais estratégia na hora de priorizar suas atividades e projetos'
    },
    {
      name: 'diagnostico', icon: Brain, color: 'blue',
      title: '2. Diagnóstico automático',
      subtitle: 'Descubra onde precisa investir seu tempo',
      description: 'Análise inteligente do seu padrão de foco com insights personalizados. Entenda onde você perde tempo e receba um relatório detalhado sobre seu perfil de produtividade atual.',
      highlight: '🔍 Descubra em 2min por que você vive apagando incêndio',
      hasButton: true
    },
    {
      name: 'taticas', icon: Lightbulb, color: 'amber',
      title: '3. Táticas inteligentes',
      subtitle: 'Recursos personalizados que parecem mágica',
      description: 'Não fique pensando muito em como investir melhor seu tempo! As sugestões inteligentes vão te ajudar a eliminar atividades de baixo impacto e te ajudar com táticas para focar no essencial.',
      highlight: '⚡ Sistema exclusivo de recomendação de Tarefas e Hábitos'
    },
    {
      name: 'kanban', icon: Layout, color: 'purple',
      title: '4. Conquiste seus objetivos!',
      subtitle: 'Transforme atividades em projetos organizados',
      description: 'Gerencie seus projetos pessoais como um expert! Crie táticas para melhorar o tempo investido, a clareza e o impacto de suas atividades. Combinado com o sistema Kanban de drag & drop para acompanhar progresso semanalmente. Separe tarefas pontuais de hábitos recorrentes.',
      highlight: '📋 Um Verdadeiro Software Profissional para gestão pessoal inspirado em metodologias ágeis e gestão de OKRs '
    }
  ];

  const faqData = [
    {
      question: "Quanto tempo por semana preciso investir?",
      answer: "10 minutos por dia são suficientes para ganhar algumas horas na semana. O método foi criado justamente para quem não tem tempo."
    },
    {
      question: "É mais que um app de tarefas?",
      answer: "Sim. É uma forma de organizar suas atividades E aprender gestão do tempo como um profissional faria. Newsletter ensina, plataforma aplica."
    },
    {
      question: "Funciona pra quem vive apagando incêndio?",
      answer: "Especialmente para você. Quem está sempre ocupado provavelmente está desorganizado. Se você não define suas prioridades, alguém vai definir por você."
    },
    {
      question: "Preciso pagar para ter acesso?",
      answer: "Não. Você pode se inscrever gratuitamente e receber a newsletter semanalmente. Para elevar seu aprendizado para outro nível, assine por R$ 15/mês e tenha acesso ao conteúdo exclusivo + plataforma completa."
    }
  ];

  useEffect(() => {
    const handleScroll = () => setShowStickyBar(window.scrollY > 800);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth < 1024) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const index = parseInt(entry.target.getAttribute('data-video-index') || '0');
            setCurrentVideo(index);
            videoRefs.current.forEach((video, vidIndex) => {
              if (video) {
                if (vidIndex !== index) {
                  video.pause();
                  video.style.opacity = '0';
                }
              }
            });
            setTimeout(() => {
              const currentVideoElement = videoRefs.current[index];
              if (currentVideoElement) {
                currentVideoElement.style.opacity = '1';
                currentVideoElement.currentTime = 0;
                currentVideoElement.play().catch(() => {});
              }
            }, 100);
          }
        });
      },
      { threshold: [0.3, 0.5, 0.7], rootMargin: '-25% 0px -25% 0px' }
    );
    sectionRefs.current.forEach((section) => {
      if (section) observer.observe(section);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVideoSectionVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.1 }
    );
    const videoSection = document.getElementById('video-showcase');
    if (videoSection) observer.observe(videoSection);
    return () => observer.disconnect();
  }, []);

  const getColorClasses = (color: string) => {
    const colors = {
      green: 'bg-green-500/20 text-green-400 border-green-500/30',
      blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    };
    return colors[color as keyof typeof colors] || colors.green;
  };

  const handleVideoClick = (index: number) => {
    setVideoStates(prev => ({ ...prev, [index]: true }));
    setTimeout(() => {
      const video = videoRefs.current[index];
      if (video) video.play().catch(() => {});
    }, 100);
  };

  return (
    <div className={cn('min-h-screen w-full', `bg-[${DESIGN_TOKENS.colors.background}]`, 'text-white')}>
     {/* Navigation */}
<nav className="glass border-b border-white/10 sticky top-0 z-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
    <div className="flex items-center gap-2 sm:gap-3">
      <img 
        src="https://substackcdn.com/image/fetch/w_80,h_80,c_fill,f_webp,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F462f54aa-846d-4501-9e26-9ab6c49f70d6_552x552.png"
        alt="Conversas no Corredor Logo" 
        className="w-13 h-13 sm:w-16 sm:h-16 rounded-lg flex-shrink-0"
      />
      <div className="text-sm sm:text-base lg:text-lg font-bold font-mono accent leading-tight">
        +Conversas no Corredor
      </div>
    </div>
    <div className="flex items-center gap-2 sm:gap-4">
      <a href="https://conversasnocorredor.substack.com/about" target="_blank" rel="noopener noreferrer"
         className="hidden sm:block text-sm text-white/70 hover:text-accent transition-colors">Sobre</a>
      <a href="https://conversasnocorredor.substack.com/s/roi-do-foco" target="_blank" rel="noopener noreferrer"
         className="hidden sm:block text-sm text-white/70 hover:text-accent transition-colors">ROI do Foco</a>
      <Link href="/auth">
        <Button variant="ghost" size="sm" className="text-white/80 hover:text-white text-xs sm:text-sm">
          <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          Acessar
        </Button>
      </Link>
    </div>
  </div>
</nav>

{/* PWA Install Banner - Aparece acima do sticky newsletter */}
{(() => {
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);
  const [showPWABanner, setShowPWABanner] = React.useState(false);

  React.useEffect(() => {
    // Verifica se já está instalado
    if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    // Verifica localStorage
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const daysSince = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) return;
    }

    // Captura evento
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPWABanner(showStickyBar); // Sincroniza com o sticky bar
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [showStickyBar]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShowPWABanner(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
    setShowPWABanner(false);
  };

  return showPWABanner && deferredPrompt ? (
    <div className="lg:hidden fixed bottom-20 left-0 right-0 z-40 p-4">
      <div className="glass rounded-xl p-4 border border-accent/30 backdrop-blur-md">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Download className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white leading-tight mb-1">
                📱 Instalar +ConverSaaS
              </p>
              <p className="text-xs text-white/70 leading-tight">
                Instalar cria um atalho na sua tela inicial.
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/60 hover:text-white/90 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          <Button
            onClick={handleInstall}
            size="sm"
            className="flex-1 bg-gradient-to-r from-accent to-orange-500 hover:from-orange-500 hover:to-accent"
          >
            Instalar Agora
          </Button>
          <Button
            onClick={handleDismiss}
            size="sm"
            variant="ghost"
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            Agora não
          </Button>
        </div>
      </div>
    </div>
  ) : null;
})()}


      {/* Sticky Bottom Bar - Mobile Only */}
{showStickyBar && (
  <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-4 glass border-t border-white/10 backdrop-blur-md">
    <a href="https://conversasnocorredor.substack.com/subscribe" target="_blank" rel="noopener noreferrer" className="block">
      <Button 
        size="lg" 
        className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 hover:shadow-lg hover:shadow-orange-500/40 transition-all duration-300"
      >
        <Mail className="w-5 h-5 mr-2" />
        Comece Agora!
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </a>
    <p className="text-center text-xs text-white/60 mt-2">
      Grátis ou R$ 15/mês • Cancele quando quiser
    </p>
  </div>
)}

      <main className="relative">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-32 h-32 bg-accent rounded-full blur-xl"></div>
          <div className="absolute top-60 right-20 w-24 h-24 bg-green-500 rounded-full blur-xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
{/* HERO MOBILE OTIMIZADO V4 - FINAL */}
<div className="lg:hidden mb-12 space-y-6">
  {/* Branding */}
  <div className="text-center">
    <h1 className="text-4xl font-bold font-mono mb-2">
      <span className="accent"> Trabalhe menos, Conquiste mais </span>
    </h1>
  </div>

  <div className="glass rounded-xl p-6 space-y-5 text-center">
    {/* Proposta */}
    <div className="space-y-3">
      <p className="text-2xl sm:text-xl font-semibold text-white leading-snug">
        O ecossistema virtual que combina ação e reflexão
      </p>
      <p className="text-2x1 sm:text-base text-white/70 italic leading-relaxed">
        Aplicativo + Newsletter       </p>
    </div>

    {/* Benefício */}
    <p className="text-md text-white/80 leading-relaxed border-t border-white/20 pt-4">
      Seja mais produtivo hoje, amanhã e sempre! Ser mais estratégico com seu tempo nunca foi tão fácil.
    </p>

    {/* CTA Principal */}
    <a href="https://conversasnocorredor.substack.com/subscribe" target="_blank" rel="noopener noreferrer">
      <Button 
        size="lg" 
        className="w-full text-base px-6 py-4 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 hover:shadow-xl hover:shadow-orange-500/60 hover:scale-105 transition-all duration-300"
      >
        <Mail className="w-5 h-5 mr-2" />
        Comece agora!
      </Button>
    </a>

    

    <p className="text-xs text-white/60 leading-relaxed">
      Assine gratis ou conheça os planos pelo computador
    </p>

{/* 🆕 BOTÃO JÁ SOU ASSINANTE - ESTILO DESKTOP */}
    <Link href="/auth">
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full bg-transparent border border-white/20 text-white/70 hover:text-white hover:bg-white/5 hover:border-white/30 transition-colors"
      >
        <Settings className="w-4 h-4 mr-2" />
        Já sou assinante
      </Button>
    </Link>
    {/* Separador - COR BRANCA CORRIGIDA */}
    <div className="relative py-1">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-white/0"></div>
      </div>
      <div className="relative flex justify-center">
        <span className="px-3 text-xs text-white/60 font-medium bg-[#042f2e]">
          
        </span>
      </div>
    </div>

    {/* CTA Secundário */}
    <Link href="/pre-diagnostico">
      <div className="glass rounded-lg p-4 border border-blue-500/30 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 text-left">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Brain className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white leading-tight">Diagnóstico Grátis</p>
            <p className="text-xs text-blue-400 leading-tight mt-0.5">2 min • 3 dicas práticas</p>
          </div>
          <ArrowRight className="w-5 h-5 text-blue-400 flex-shrink-0" />
        </div>
        <p className="text-xs text-white/70 leading-relaxed">
          Descubra por que você vive apagando incêndio e não tem tempo para nada!
        </p>
      </div>
    </Link>
  </div>
</div>
          {/* HERO DESKTOP ORIGINAL */}
          <div className="hidden lg:grid lg:grid-cols-2 gap-8 lg:gap-12 mb-12 lg:mb-16">
            <div className="space-y-6">
              <div className="space-y-4">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-mono">
                  <span className="accent">+Conversas no Corredor</span>
                </h1>
                <p className="text-lg sm:text-xl text-white/90 font-medium">
                  O ecossistema virtual para quem quer crescer com método, não só esforço.
                </p>
                <p className="text-base sm:text-lg text-white/80 leading-relaxed">
                  <span className="accent font-semibold">Mais produtividade com MÉTODO e PRÁTICA</span>. Ao assinar a <span className="accent font-semibold">Newsletter</span> você recebe textos semanais direto no e-mail. Aqui no <span className="accent font-semibold">Ecossistema Virtual</span> você coloca em prática, aplica no seu contexto, ganha mais tempo e atinge seus objetivos.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a href="https://conversasnocorredor.substack.com/subscribe" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 hover:shadow-xl hover:shadow-orange-500/60 transform hover:scale-105 transition-all duration-300">
                    <Mail className="w-5 h-5 mr-2" />Quero Acessar o Ecossistema<ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </a>
                <Link href="/auth">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-white/30 hover:bg-white/10 text-white bg-transparent">
                    <Settings className="w-5 h-5 mr-2" />Já sou assinante
                  </Button>
                </Link>
              </div>
            </div>

            <div className="glass rounded-xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-4">
                <img src="https://substackcdn.com/image/fetch/w_64,h_64,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff89e806a-e40a-4b77-baf9-969b8575ead1_2160x2160.jpeg" 
                     alt="Adil Matioli" className="w-16 h-16 rounded-full" />
                <div>
                  <h3 className="font-semibold text-lg">Adilson Matioli</h3>
                  <p className="text-sm text-white/70">Estratégia • Vendas • Marketing • CX</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 mt-0.5 text-green-500 flex-shrink-0" />
                  <span className="text-sm">Mais de 10 anos de experiência até cargos executivos</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 mt-0.5 text-green-500 flex-shrink-0" />
                  <span className="text-sm">Gestão de equipes de alta performance e impacto</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 mt-0.5 text-green-500 flex-shrink-0" />
                  <span className="text-sm">Quero ajudar profissionais que sentem falta de um líder para recorrer.</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/20">
                <a href="https://www.linkedin.com/in/adilsonmatioli/" target="_blank" rel="noopener noreferrer"
                   className="text-sm text-accent hover:underline flex items-center gap-2">
                  Conecte no LinkedIn<ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* SOCIAL PROOF CARD - MOBILE ONLY */}
          <section className="lg:hidden mb-12">
            <div className="glass rounded-xl p-6 space-y-4">
              <div className="flex flex-col items-center text-center">
                <img src="https://substackcdn.com/image/fetch/w_64,h_64,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff89e806a-e40a-4b77-baf9-969b8575ead1_2160x2160.jpeg" 
                     alt="Adilson Matioli" className="w-20 h-20 rounded-full mb-3" />
                <p className="text-lg font-semibold text-accent mb-1">"Vou te ajudar como o gestor que você queria ter"</p>
                <h3 className="text-base font-semibold text-white">Adilson Matioli</h3>
                <p className="text-xs text-white/70">Estratégia • Vendas • Marketing • CX</p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-white/80">Gerenciei equipes de alta performance +50 pessoas</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-white/80">Transformei método em um aplicativo prático para quem quer ganhar tempo com estratégia</span>
                </div>
<div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-white/80">Quer mais detalhes? Veja os videos a seguir e desbloqueie seu potencial!</span>
                </div>
              </div>

              <a href="https://www.linkedin.com/in/adilsonmatioli/" target="_blank" rel="noopener noreferrer"
                 className="flex items-center justify-center gap-2 text-sm text-accent hover:underline pt-2">
                Conectar no LinkedIn<ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </section>

          

          {/* Seção ROI do Foco - Desktop */}
          <section className="hidden lg:block mb-12 lg:mb-16">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-mono">
                🎯 Produtividade e o método ROI do Foco
              </h2>
              
              <div className="glass rounded-xl p-6 sm:p-8 text-left space-y-4">
                <p className="text-base sm:text-lg leading-relaxed">
                  <span className="accent font-semibold">ROI</span> significa "Return on Investment". 
                  Quando aplicamos ao <span className="accent font-semibold">foco</span>, perguntamos: 
                  <em className="text-white/90">"Onde meu tempo gera maior retorno?"</em>
                </p>
                <p className="text-white/80 leading-relaxed">
                  Criado por quem já aplicou estratégias de crescimento em grandes equipes e hoje traduz essa experiência em um método eficiente, que combina teoria e prática para você organizar o tempo e colher resultados reais.
                </p>
                <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 mt-6">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent" />
                    A diferença entre ser produtivo e estar ocupado está em investir seu tempo de maneira consciente nas atividades que realmente geram impacto na sua carreira.
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <Link href="/pre-diagnostico">
                  <Button size="md" className="text-sm sm:text-base px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 hover:shadow-xl hover:shadow-orange-500/60 transform hover:scale-105 transition-all duration-300">
                    <Brain className="w-5 h-5 mr-2" />Veja como está sua produtividade<ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <p className="text-sm text-white/60 mt-3">Diagnóstico Grátis • 3 dicas personalizadas em 2 min • Sem cadastro</p>
              </div>
            </div>
          </section>
{/* SEÇÃO DE VÍDEOS */}
          <section id="video-showcase" className="mb-12 lg:mb-16">
            <div className="text-center mb-8 lg:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-mono mb-4">
                Aprenda na prática a ser mais produtivo
              </h2>
              <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto px-4">
                4 passos para transformar sua produtividade em algo profissional
              </p>
            </div>

            {/* VERSÃO DESKTOP */}
            <div className="hidden lg:block">
              <div className="grid lg:grid-cols-[45%_55%] gap-8 items-start relative">
                <div className="space-y-72 pb-[15vh]">
                  {videoData.map((video, index) => {
                    const Icon = video.icon;
                    return (
                      <div key={video.name} ref={(el) => { sectionRefs.current[index] = el }} data-video-index={index}
                           className={cn("space-y-4 transition-all duration-500",
                             currentVideo === index && isVideoSectionVisible ? "opacity-100 scale-100" : "opacity-20 scale-95")}>
                        <div className="flex items-center gap-3">
                          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", getColorClasses(video.color))}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <h3 className="text-xl font-bold font-mono">{video.title}</h3>
                        </div>
                        <h4 className="text-2xl font-semibold">{video.subtitle}</h4>
                        <p className="text-white/80 leading-relaxed">{video.description}</p>
                        {video.hasButton && (
                          <div className="my-4">
                            <Link href="/pre-diagnostico">
                              <Button variant="outline" className="bg-white border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:shadow-lg hover:shadow-blue-500/40 transform hover:scale-105 transition-all duration-300">
                                Fazer pré-diagnóstico gratuito<ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                            </Link>
                          </div>
                        )}
                        <div className={cn("rounded-lg p-3 border", getColorClasses(video.color))}>
                          <p className="text-sm">{video.highlight}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="lg:sticky" style={{ top: 'calc(50vh - 12rem)', transition: 'top 0.3s ease' }}>
                  <div className="relative aspect-video bg-black/50 rounded-xl overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-accent/20 to-blue-500/20">
                      <div className="text-center space-y-4">
                        <Play className="w-16 h-16 text-white/50 mx-auto" />
                        <p className="text-white/70">Os vídeos aparecerão aqui</p>
                      </div>
                    </div>
                    {videoData.map((video, index) => (
                      <video key={video.name} ref={(el) => { videoRefs.current[index] = el }} src={`/videos/${video.name}.mp4`}
                             className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
                             style={{ opacity: currentVideo === index && isVideoSectionVisible ? 1 : 0, zIndex: currentVideo === index ? 10 : 1 }}
                             muted loop playsInline autoPlay={index === 0} controls={false} />
                    ))}
                  </div>
                  <div className="flex justify-center gap-2 mt-6">
                    {videoData.map((_, index) => (
                      <button key={index} onClick={() => { setCurrentVideo(index); sectionRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}
                              className={cn("h-2 rounded-full transition-all duration-300", currentVideo === index ? "w-8 bg-accent" : "w-2 bg-white/30 hover:bg-white/50")}
                              aria-label={`Ir para vídeo ${index + 1}`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* VERSÃO MOBILE - PROGRESSIVE LOADING */}
            <div className="lg:hidden px-4 space-y-8">
              {videoData.map((video, index) => {
                const Icon = video.icon;
                const isFirstVideo = index === 0;
                const videoLoaded = videoStates[index];
                
                return (
                  <div key={video.name} className="glass rounded-xl overflow-hidden">
                    <div className="relative aspect-video bg-black/50">
                      {!videoLoaded && !isFirstVideo ? (
                        <button onClick={() => handleVideoClick(index)}
                                className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-accent/20 to-blue-500/20">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                              <Play className="w-8 h-8 text-white" />
                            </div>
                            <p className="text-sm text-white/80">Clique para assistir</p>
                          </div>
                        </button>
                      ) : (
                        <video ref={(el) => { videoRefs.current[index] = el }} src={`/videos/${video.name}.mp4`}
                               className="w-full h-full object-cover" muted loop playsInline  controls autoPlay={isFirstVideo} />
                      )}
                      <div className="absolute top-4 left-4 flex items-center gap-2 glass px-3 py-1.5 rounded-full">
                        <div className={cn("w-6 h-6 rounded flex items-center justify-center", getColorClasses(video.color))}>
                          <Icon className="w-3 h-3" />
                        </div>
                        <span className="text-xs font-medium">Passo {index + 1}</span>
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="text-lg font-bold font-mono mb-2">{video.title}</h3>
                        <h4 className="text-xl font-semibold mb-3">{video.subtitle}</h4>
                        <p className="text-white/80 text-sm leading-relaxed">{video.description}</p>
                      </div>
                      {video.hasButton && (
                        <Link href="/pre-diagnostico">
                          <Button variant="outline" size="sm" className="w-full border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
                            Fazer pré-diagnóstico gratuito<ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      )}
                      <div className={cn("rounded-lg p-3 border text-xs", getColorClasses(video.color))}>
                        {video.highlight}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

         {/* PRICING */}
          <section className="py-8 px-4 mb-4">
            <div className="max-w-4xl mx-auto">
              <div className="glass rounded-2xl p-8 lg:p-12 border border-accent/20">
                <div className="text-center space-y-6">
                  <h2 className="text-2xl lg:text-3xl font-bold font-mono">💎 Acesso ao Ecossistema Virtual 💎</h2>
                  
                  {/* PRICING 3 CARDS VERTICAIS - MOBILE CORRIGIDO */}
<div className="lg:hidden space-y-4">
  {/* Card Gratuito */}
  <div className="glass rounded-xl p-6 border border-white/20">
    <div className="mb-4">
      <h3 className="text-lg font-bold text-white mb-1">Gratuito</h3>
      <p className="text-3xl font-bold text-white/90">R$ 0<span className="text-base font-normal text-white/60">/mês</span></p>
    </div>
    <div className="space-y-3 mb-6">
      <div className="flex items-start gap-2">
        <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
        <span className="text-sm text-white/80">Newsletter semanal</span>
      </div>
    </div>
    <a href="https://conversasnocorredor.substack.com/subscribe" target="_blank" rel="noopener noreferrer">
      <Button 
        variant="outline" 
        size="lg" 
        className="w-full border-green-500/50 text-green-400 hover:bg-green-500/10 hover:border-green-400 transition-all"
      >
        Se inscrever Grátis
      </Button>
    </a>
  </div>

  {/* Card Mensal - DESTAQUE */}
  <div className="glass rounded-xl p-6 border-2 border-orange-500/60 bg-gradient-to-b from-orange-500/10 to-transparent relative">
    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-600 to-orange-500 px-4 py-1 rounded-full shadow-lg">
      <span className="text-xs font-bold text-white">Mais Popular</span>
    </div>
    
    <div className="mb-4 mt-2">
      <h3 className="text-lg font-bold text-white mb-1">Mensal</h3>
      <p className="text-3xl font-bold text-orange-400">R$ 15<span className="text-base font-normal text-white/60">/mês</span></p>
    </div>
    
    <div className="space-y-3 mb-6">


      <div className="flex items-start gap-2">
        <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
        <span className="text-sm text-white/90">Artigos e Cursos Exclusivos</span>
      </div>
      <div className="flex items-start gap-2">
        <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
        <span className="text-sm text-white/90">Acesso completo ao Aplicativo</span>
      </div>
      <div className="flex items-start gap-2">
        <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
        <span className="text-sm text-white/90">Todo conteúdo pago publicado</span>
      </div>
<div className="flex items-start gap-2">
        <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
        <span className="text-sm text-white/90">PARA ASSINAR: acesse via computador ou pela visão desktop no navegador do celular</span>
      </div>
    </div>
    
    <a href="https://conversasnocorredor.substack.com/subscribe" target="_blank" rel="noopener noreferrer">
      <Button 
        size="lg" 
        className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-semibold shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/50 hover:scale-105 transition-all duration-300"
      >
        Assinar Agora
      </Button>
    </a>
  </div>

  {/* Card Anual */}
  <div className="glass rounded-xl p-6 border border-green-500/40">
    <div className="mb-4">
      <h3 className="text-lg font-bold text-white mb-2">Anual</h3>
      <div className="flex items-center gap-2">
        <p className="text-xl text-white/50 line-through">R$ 180</p>
        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded font-semibold">
          Desconto
        </span>
      </div>
    </div>
    
    <div className="space-y-3 mb-6">
      <div className="flex items-start gap-2">
        <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
        <span className="text-sm text-white/80">Tudo do plano Mensal</span>
      </div>
      <div className="flex items-start gap-2">
        <Star className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
        <span className="text-sm text-white/80">Bônus exclusivos</span>
      </div>
      <div className="flex items-start gap-2">
        <Star className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
        <span className="text-sm text-white/80">Economia de 2 meses</span>
      </div>
    </div>
    
    <a href="https://conversasnocorredor.substack.com/subscribe" target="_blank" rel="noopener noreferrer">
      <Button 
        variant="outline" 
        size="lg" 
        className="w-full border-green-500/50 text-green-400 hover:bg-green-500/10 hover:border-green-400 transition-all"
      >
        Ver Plano Anual
      </Button>
    </a>
  </div>
</div>

                  {/* PRICING DESKTOP */}
                  <div className="hidden lg:block">
                    <div className="py-6">
                      <div className="text-5xl font-bold accent mb-2">R$ 15<span className="text-2xl font-normal">/mês</span></div>
                      <p className="text-white/70">Menos que 2 cafés por mês</p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Acesso completo Newsletter + Plataforma</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Ecossistema completo de produtividade</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Conteúdo semanal e exclusivo</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Aprenda e melhore na prática</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Comunidade exclusiva</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Aproveite antes que o preço dobre!</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 space-y-4">
                    <a href="https://conversasnocorredor.substack.com/subscribe" target="_blank" rel="noopener noreferrer">
  <Button 
    size="lg" 
    className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-semibold text-base py-4 hover:shadow-lg hover:shadow-orange-500/40 hover:scale-105 transition-all duration-300"
  >
    Acesse o Ecossistema
    <ArrowRight className="w-4 h-4 ml-2" />
  </Button>
</a>
                    <p className="text-sm text-white/60">Newsletter + Plataforma</p>
                    <div className="pt-4">
                      <p className="text-white/70 text-sm">Prefere testar primeiro?</p>
                      <Link href="/pre-diagnostico">
                        <Button variant="ghost" size="sm" className="text-accent hover:text-orange-400">Fazer diagnóstico gratuito →</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

{/* 3 CARDS DE BENEFÍCIO - MOBILE ONLY */}
          <section className="lg:hidden mb-12 space-y-4">
            <div className="glass rounded-lg p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-base font-semibold">Elimine distrações</h3>
              </div>
              <p className="text-sm text-white/80 leading-relaxed">
                Identifique tarefas de baixo impacto e elimine sem culpa. Foque no que importa!
              </p>
            </div>

            <div className="glass rounded-lg p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-base font-semibold">Priorização estratégica</h3>
              </div>
              <p className="text-sm text-white/80 leading-relaxed">
                Defina suas prioridades antes que alguém defina por você. Pare de apagar incêndios.
              </p>
            </div>

            <div className="glass rounded-lg p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-base font-semibold">Menos ansiedade</h3>
              </div>
              <p className="text-sm text-white/80 leading-relaxed">
                Quem está sempre ocupado provavelmente está desorganizado. Ganhe equilíbrio real.
              </p>
            </div>
          </section>

          {/* FAQ ACCORDION - MOBILE ONLY */}
          <section className="lg:hidden py-8 px-4 mb-8">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold font-mono mb-6 text-center">Perguntas Frequentes</h2>
              <div className="space-y-3">
                {faqData.map((faq, index) => (
                  <div key={index} className="glass rounded-lg overflow-hidden border border-white/10">
                    <button onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                            className="w-full px-5 py-4 flex items-center justify-between text-left">
                      <span className="text-sm font-semibold pr-4">{faq.question}</span>
                      <ChevronDown className={cn("w-5 h-5 text-accent flex-shrink-0 transition-transform duration-200", expandedFAQ === index && "rotate-180")} />
                    </button>
                    {expandedFAQ === index && (
                      <div className="px-5 pb-4 text-sm text-white/80 leading-relaxed border-t border-white/10 pt-4">{faq.answer}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* METODOLOGIA, GESTÃO, PARA QUEM É, RESULTADOS - MANTIDAS IGUAIS */}
          <section className="py-2 px-2">
            <div className="bg-white/5 rounded-2xl p-6">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-2xl lg:text-3xl font-bold font-mono mb-4">📊 A Metodologia Completa</h2>
                  <p className="text-lg text-white/70 max-w-2xl mx-auto">A combinação perfeita: Receba semanalmente conteúdos exclusivos para assinantes e coloque em prática no ecossistema virtual</p>
                </div>
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="glass rounded-xl p-6 space-y-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <ChartBar className="w-6 h-6 text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold">Mapeamento</h3>
                    <p className="text-white/80">Matriz Clareza × Impacto para saber onde seu tempo está sendo investido</p>
                    <div className="pt-4 border-t border-white/10">
                      <p className="text-sm text-green-400">Mais estratégia nas suas prioridades</p>
                    </div>
                  </div>
                  <div className="glass rounded-xl p-6 space-y-4">
                    <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
                      <Zap className="w-6 h-6 text-amber-400" />
                    </div>
                    <h3 className="text-xl font-bold">Diagnóstico</h3>
                    <p className="text-white/80">Receba insights personalizados de onde você deve concentrar esforços</p>
                    <div className="pt-4 border-t border-white/10">
                      <p className="text-sm text-amber-400">Metodologia exclusiva ROI do Foco®</p>
                    </div>
                  </div>
                  <div className="glass rounded-xl p-6 space-y-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Layout className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold">Execução</h3>
                    <p className="text-white/80">Um plano de ação que se adapta a sua necessidade, com tarefas, hábitos, gestão de OKRs e Kanban</p>
                    <div className="pt-4 border-t border-white/10">
                      <p className="text-sm text-blue-400">Conquiste seus objetivos!</p>
                    </div>
                  </div>
                </div>
                <div className="mt-8 text-center text-sm text-white/60">Teoria + Prática • Método exclusivo da newsletter Conversas no Corredor • Adilson Matioli</div>
              </div>
            </div>
          </section>

          <section className="py-12 px-6">
            <div className="max-w-6xl mx-auto">
              <div className="glass rounded-2xl p-8 lg:p-12">
                <div className="text-center mb-8">
                  <h2 className="text-2xl lg:text-3xl font-bold font-mono mb-4">🚀 Gestão Profissional para seus Objetivos Pessoais</h2>
                  <p className="text-lg text-white/70">Transformar suas metas pessoais em projetos nunca foi tão fácil</p>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Award className="w-5 h-5 text-accent" />Inspirado nas melhores práticas
                    </h3>
                    <div className="space-y-3 text-sm text-white/80">
                      <div className="flex items-center gap-3"><span className="text-accent">•</span>+10 anos atuando em projetos</div>
                      <div className="flex items-center gap-3"><span className="text-accent">•</span>Gestão de times de alta performance</div>
                      <div className="flex items-center gap-3"><span className="text-accent">•</span>Tarefas e hábitos que funcionam</div>
                      <div className="flex items-center gap-3"><span className="text-accent">•</span>Método adaptável e personalizável</div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Target className="w-5 h-5 text-green-400" />Ecossistema de Produtividade
                    </h3>
                    <div className="space-y-3 text-sm text-white/80">
                      <div className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-green-400" />Conteúdo da Newsletter + Acesso a Plataforma Digital</div>
                      <div className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-green-400" />Acesso em qualquer lugar com a versão mobile</div>
                      <div className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-green-400" />Mais clareza e menos ansiedade</div>
                      <div className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-green-400" />Um método realista para alcançar seus objetivos!</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="py-2 px-2">
            <div className="bg-white/5 rounded-2xl p-6">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-2xl lg:text-3xl font-bold font-mono mb-4">👥 Para Quem é o método ROI do Foco</h2>
                </div>
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="glass rounded-xl p-6 space-y-4 border border-green-500/20">
                    <Users className="w-8 h-8 text-green-400" />
                    <h3 className="text-xl font-bold">Profissionais</h3>
                    <p className="text-white/80">Quem busca crescer na carreira e ganhar mais</p>
                    <div className="pt-4 border-t border-white/10">
                      <p className="text-sm font-semibold text-green-400">"Saia do operacional para o estratégico"</p>
                    </div>
                  </div>
                  <div className="glass rounded-xl p-6 space-y-4 border border-blue-500/20">
                    <Award className="w-8 h-8 text-blue-400" />
                    <h3 className="text-xl font-bold">Líderes</h3>
                    <p className="text-white/80">Gestores que querem dar o exemplo e escalar resultados</p>
                    <div className="pt-4 border-t border-white/10">
                      <p className="text-sm font-semibold text-blue-400">"Lidere pelo exemplo, não pelo controle"</p>
                    </div>
                  </div>
                  <div className="glass rounded-xl p-6 space-y-4 border border-amber-500/20">
                    <Sparkles className="w-8 h-8 text-amber-400" />
                    <h3 className="text-xl font-bold">Empresas</h3>
                    <p className="text-white/80">Um método para melhorar a gestão do tempo e pensamento estratégico</p>
                    <div className="pt-4 border-t border-white/10">
                      <p className="text-sm font-semibold text-amber-400">"Desenvolva seus times e tenha mais resultado"</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="py-8 px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-6">
                <h2 className="text-2xl lg:text-3xl font-bold font-mono mb-4">📈 Resultados Esperados</h2>
              </div>
              <div className="space-y-6">
                <div className="glass rounded-xl p-6">
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-green-400" />Nas primeiras 2 semanas
                  </h3>
                  <div className="space-y-2 text-sm text-white/80">
                    <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400" />Menos incêndios para apagar</div>
                    <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400" />Mais clareza sobre prioridades reais</div>
                    <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400" />Menos reuniões desnecessárias</div>
                  </div>
                </div>
                <div className="glass rounded-xl p-6">
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-400" />Em 30 dias
                  </h3>
                  <div className="space-y-2 text-sm text-white/80">
                    <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" />Projetos importantes avançando</div>
                    <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" />Hábitos produtivos estabelecidos</div>
                    <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" />Sensação de controle sobre a agenda</div>
                  </div>
                </div>
                <div className="glass rounded-xl p-6">
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-400" />Em 3 meses
                  </h3>
                  <div className="space-y-2 text-sm text-white/80">
                    <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400" />Reconhecimento por entregas consistentes</div>
                    <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400" />Mais tempo para o estratégico</div>
                    <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400" />Equilíbrio trabalho-vida melhorado e objetivos conquistados!</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="py-6 px-4 mb-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl lg:text-3xl font-bold font-mono mb-4">Comece hoje a investir melhor seu tempo</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="glass rounded-xl p-6 space-y-4 border border-white/20">
                  <h3 className="text-xl font-bold">Teste Grátis</h3>
                  <p className="text-white/80">Diagnóstico básico + 3 táticas personalizadas</p>
                  <Link href="/pre-diagnostico">
                    <Button variant="outline" size="lg" className="w-full border-white/30 hover:bg-white/10 text-white bg-transparent">Experimentar agora →</Button>
                  </Link>
                  <p className="text-xs text-white/60">Sem cadastro • 2 minutos</p>
                </div>
                <div className="glass rounded-xl p-6 space-y-4 border border-accent/30 bg-accent/5">
                  <h3 className="text-xl font-bold">Acesso Completo</h3>
                  <p className="text-white/80">Sistema completo + Newsletter + Suporte</p>
                  <a href="https://conversasnocorredor.substack.com/subscribe" target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 hover:shadow-xl hover:shadow-orange-500/60 hover:scale-105 transition-all duration-300">
                      Assinar Ecossistema de Produtividade →
                    </Button>
                  </a>
                  <p className="text-xs text-white/60">Garantia 30 dias • Cancele quando quiser</p>
                </div>
              </div>
              <div className="mt-8 text-center">
                <p className="text-white/70 mb-4">Dúvidas? Entre em contato:</p>
                <div className="flex justify-center gap-6">
                  <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 flex items-center gap-2">
                    <Phone className="w-4 h-4" />WhatsApp
                  </a>
                  <a href="mailto:adilson.matioli@hotmail.com" className="text-blue-400 hover:text-blue-300 flex items-center gap-2">
                    <Mail className="w-4 h-4" />Email
                  </a>
                  <a href="https://www.linkedin.com/in/adilsonmatioli/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>

      <footer className="border-t border-white/10 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Coffee className="w-5 h-5 accent" />
            <span className="text-lg font-semibold font-mono accent">Conversas no Corredor</span>
          </div>
          <p className="text-white/60 text-sm max-w-md mx-auto">Reflexões práticas sobre crescimento profissional que eu gostaria de ter tido com meus gestores</p>
          <div className="flex justify-center space-x-6 text-sm">
            <a href="https://conversasnocorredor.substack.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-accent transition-colors">Newsletter</a>
            <a href="https://conversasnocorredor.substack.com/about" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-accent transition-colors">Sobre</a>
            <a href="https://conversasnocorredor.substack.com/s/roi-do-foco" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-accent transition-colors">ROI do Foco</a>
            <Link href="/privacidade" className="text-white/60 hover:text-accent transition-colors">Privacidade</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
