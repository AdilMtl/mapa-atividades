// ═══════════════════════════════════════════════════════════════════
// 📧 EMAIL ESTRATÉGICO PÓS-DEMO - ROI DO FOCO (VERSÃO CORRIGIDA)
// ═══════════════════════════════════════════════════════════════════
// Arquivo: src/app/api/prediag/email-template.ts

interface RecomendacaoEmail {
  titulo: string;
  descricao: string;
  acao: string;
  categoria: "HABITO" | "TAREFA" | "MINDSET";
  impacto: "ALTO" | "MEDIO" | "BAIXO";
}

interface TemplateData {
  profileSegment: string;
  recomendacoes: RecomendacaoEmail[];
  firstName: string;
  sessionData?: {
    diagnostico?: {
      essencial: number;
      estrategica: number;
      tatica: number;
      distracao: number;
    } | null;
  };
}

export function gerarAssuntoEmail(profileSegment: string): string {
  return "Seu snapshot está pronto → veja como multiplicar seu ROI do Foco";
}

export function gerarTemplateEmail(data: TemplateData): string {
  const { profileSegment, recomendacoes, firstName, sessionData } = data;
  const profile = profileSegment.charAt(0).toUpperCase() + profileSegment.slice(1);
  
  // Gerar distribuição visual baseada no perfil se não tiver dados da sessão
  const getDistribuicaoVisual = () => {
    if (sessionData?.diagnostico) {
      const { essencial = 20, estrategica = 25, tatica = 35, distracao = 20 } = sessionData.diagnostico;
      return { essencial, estrategica, tatica, distracao };
    }
    
    // Fallback baseado no perfil
    const fallbacks: { [key: string]: any } = {
      'estudante': { essencial: 15, estrategica: 20, tatica: 45, distracao: 20 },
      'estagiario': { essencial: 20, estrategica: 25, tatica: 40, distracao: 15 },
      'analista': { essencial: 25, estrategica: 30, tatica: 35, distracao: 10 },
      'especialista': { essencial: 35, estrategica: 30, tatica: 25, distracao: 10 },
      'lider': { essencial: 30, estrategica: 40, tatica: 20, distracao: 10 },
      'gestor': { essencial: 40, estrategica: 35, tatica: 15, distracao: 10 },
      'empreendedor': { essencial: 45, estrategica: 35, tatica: 15, distracao: 5 }
    };
    
    return fallbacks[profileSegment.toLowerCase()] || { essencial: 25, estrategica: 25, tatica: 35, distracao: 15 };
  };
  
  const distribuicao = getDistribuicaoVisual();
  
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Seu snapshot está pronto</title>
    <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #374151;
            background: #f9fafb;
            margin: 0;
            padding: 20px 0;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
            border-radius: 8px;
            overflow: hidden;
        }
        
        /* Header */
        .header {
            background: linear-gradient(135deg, #042f2e 0%, #0d4a42 100%);
            padding: 32px 40px 24px;
            text-align: center;
        }
        
        .logo {
            font-family: 'Monaco', 'Menlo', 'SF Mono', monospace;
            font-size: 28px;
            font-weight: 700;
            color: #d97706;
            margin-bottom: 4px;
            letter-spacing: -0.5px;
        }
        
        .tagline {
            font-size: 14px;
            color: rgba(255,255,255,0.7);
            font-weight: 400;
        }
        
        /* Hero Section */
        .hero {
            padding: 40px 32px;
            text-align: center;
            background: linear-gradient(180deg, #fefefe 0%, #f9fafb 100%);
        }
        
        .hero h1 {
            font-size: 28px;
            color: #042f2e;
            font-weight: 700;
            line-height: 1.2;
            margin-bottom: 16px;
        }
        
        .hero-highlight {
            color: #d97706;
            font-weight: 700;
        }
        
        .hero-subtitle {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 32px;
            line-height: 1.5;
        }
        
        /* CORREÇÃO: Snapshot Visual Refeito */
        .snapshot-visual {
            background: white;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 24px 20px;
            margin: 24px auto;
            max-width: 380px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        
        .mix-title {
            font-size: 14px;
            color: #6b7280;
            text-transform: uppercase;
            font-weight: 600;
            margin-bottom: 16px;
            letter-spacing: 0.5px;
            text-align: center;
        }
        
        /* CORREÇÃO: Barras com altura fixa e proporção visual */
        .mix-bars {
            display: flex;
            width: 100%;
            height: 32px;
            border-radius: 16px;
            overflow: hidden;
            background: #f3f4f6;
            margin-bottom: 20px;
            border: 1px solid #e5e7eb;
        }
        
        .bar-essencial { 
            background: #22c55e; 
            width: ${distribuicao.essencial}%; 
            min-width: 8px;
        }
        .bar-estrategica { 
            background: #3b82f6; 
            width: ${distribuicao.estrategica}%; 
            min-width: 8px;
        }
        .bar-tatica { 
            background: #eab308; 
            width: ${distribuicao.tatica}%; 
            min-width: 8px;
        }
        .bar-distracao { 
            background: #ef4444; 
            width: ${distribuicao.distracao}%; 
            min-width: 8px;
        }
        
        /* CORREÇÃO: Legenda com grid responsivo e alinhamento */
        .mix-legend {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px 16px;
            font-size: 13px;
        }
        
        .legend-item {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .legend-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            flex-shrink: 0;
        }
        
        .legend-text {
            font-size: 13px;
            color: #4b5563;
            font-weight: 500;
        }
        
        /* Recomendações */
        .recomendacoes {
            padding: 0 32px 40px;
        }
        
        .section-title {
            font-size: 24px;
            color: #042f2e;
            font-weight: 700;
            text-align: center;
            margin-bottom: 24px;
        }
        
        .recomendacao-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 16px;
            border-left: 4px solid var(--accent-color);
        }
        
        .rec-header {
            display: flex;
            align-items: flex-start;
            gap: 16px;
            margin-bottom: 12px;
        }
        
        .rec-number {
            width: 32px;
            height: 32px;
            background: var(--accent-color);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 14px;
            flex-shrink: 0;
            margin-top: 2px;
        }
        
        .rec-content h3 {
            font-size: 18px;
            color: #1f2937;
            font-weight: 600;
            margin-bottom: 8px;
            line-height: 1.3;
        }
        
        .rec-meta {
            display: flex;
            gap: 8px;
            margin-bottom: 12px;
            flex-wrap: wrap;
        }
        
        .badge {
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }
        
        .badge-habito { background: #dcfce7; color: #166534; }
        .badge-tarefa { background: #dbeafe; color: #1e40af; }
        .badge-mindset { background: #ede9fe; color: #7c3aed; }
        .badge-alto { background: #dcfce7; color: #166534; }
        .badge-medio { background: #fef3c7; color: #92400e; }
        .badge-baixo { background: #f3f4f6; color: #6b7280; }
        
        .rec-description {
            font-size: 15px;
            color: #4b5563;
            margin-bottom: 16px;
            line-height: 1.5;
        }
        
        .rec-action {
            background: white;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            padding: 12px 16px;
            font-size: 14px;
            color: #374151;
        }
        
        .action-label {
            font-size: 11px;
            color: #6b7280;
            text-transform: uppercase;
            font-weight: 600;
            margin-bottom: 4px;
            letter-spacing: 0.3px;
        }
        
        /* Benefícios */
        .beneficios {
            background: #f8fafc;
            padding: 40px 32px;
            border-top: 1px solid #e5e7eb;
        }
        
        .beneficios h2 {
            font-size: 26px;
            color: #042f2e;
            font-weight: 700;
            text-align: center;
            margin-bottom: 16px;
        }
        
        .beneficios-subtitle {
            font-size: 16px;
            color: #6b7280;
            text-align: center;
            margin-bottom: 32px;
            line-height: 1.5;
        }
        
        .beneficios-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 32px;
        }
        
        .beneficio-item {
            background: white;
            padding: 20px;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
            text-align: center;
        }
        
        /* CORREÇÃO: Ícones centralizados com posicionamento fixo */
        .beneficio-icon {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #d97706, #ea580c);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 16px auto;
            font-size: 18px;
            line-height: 1;
            color: white;
            font-weight: normal;
        }
        
        .beneficio-item h4 {
            font-size: 16px;
            color: #1f2937;
            font-weight: 600;
            margin-bottom: 8px;
        }
        
        .beneficio-item p {
            font-size: 14px;
            color: #6b7280;
            line-height: 1.5;
        }
        
        /* Autoridade */
        .autoridade {
            padding: 32px;
            text-align: center;
            background: linear-gradient(135deg, #042f2e 0%, #0d4a42 100%);
            color: white;
        }
        
        .quote {
            font-size: 18px;
            font-style: italic;
            line-height: 1.6;
            margin-bottom: 20px;
            position: relative;
            padding: 0 24px;
        }
        
        .quote::before {
            content: '"';
            font-size: 48px;
            color: #d97706;
            position: absolute;
            top: -16px;
            left: -4px;
            font-family: serif;
        }
        
        .author {
            font-size: 14px;
            color: rgba(255,255,255,0.8);
            font-weight: 500;
        }
        
        /* CTA Section */
        .cta-section {
            padding: 40px 32px;
            text-align: center;
            background: white;
        }
        
        .cta-title {
            font-size: 26px;
            color: #042f2e;
            font-weight: 700;
            margin-bottom: 12px;
        }
        
        .cta-subtitle {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 28px;
        }
        
        .cta-buttons {
            display: flex;
            flex-direction: column;
            gap: 16px;
            max-width: 400px;
            margin: 0 auto;
        }
        
        .btn {
            display: block;
            padding: 16px 32px;
            border-radius: 12px;
            text-decoration: none;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            border: none;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #d97706, #ea580c);
            color: white;
        }
        
        .btn-secondary {
            background: white;
            color: #042f2e;
            border: 2px solid #042f2e;
        }
        
        .microcopy {
            font-size: 13px;
            color: #9ca3af;
            margin-top: 8px;
            font-style: italic;
        }
        
        /* Footer */
        .footer {
            background: #1f2937;
            padding: 28px 32px;
            text-align: center;
            color: #9ca3af;
        }
        
        .footer-brand {
            font-size: 16px;
            font-weight: 600;
            color: #d1d5db;
            margin-bottom: 8px;
        }
        
        .footer-subtitle {
    font-size: 13px;
    color: #6b7280;
    font-style: italic;
    margin-bottom: 16px;
}
        
        .footer-links {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-bottom: 12px;
            flex-wrap: wrap;
        }
        
        .footer-link {
            color: #d97706;
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
        }
        
        .footer-text {
            font-size: 12px;
            color: #6b7280;
        }
        
        /* Responsivo */
        @media (max-width: 640px) {
            .container { 
                margin: 0 16px; 
                border-radius: 0;
            }
            
            .header, .hero, .recomendacoes, .beneficios, .autoridade, .cta-section, .footer {
                padding-left: 20px;
                padding-right: 20px;
            }
            
            .hero h1 { font-size: 24px; }
            .beneficios-grid { 
                grid-template-columns: 1fr; 
                gap: 16px; 
            }
            .rec-header { 
                flex-direction: row;
                align-items: flex-start;
            }
            .rec-meta { flex-wrap: wrap; }
            .mix-legend {
                grid-template-columns: 1fr;
                gap: 8px;
            }
            .snapshot-visual {
                padding: 20px 16px;
                margin: 16px auto;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="logo">ROI do Foco</div>
            <div class="tagline">Conversas no Corredor</div>
        </div>
        
        <!-- Hero -->
        <div class="hero">
            <h1>Suas 3 recomendações estão aqui, <span class="hero-highlight">${firstName}</span></h1>
            <p class="hero-subtitle">
                Você viu onde seu tempo está hoje. Agora descubra como <strong>virar o jogo</strong>.
            </p>
            
            <div class="snapshot-visual">
                <div class="mix-title">Seu mix atual (perfil: ${profile})</div>
                <div class="mix-bars">
                    <div class="bar-essencial"></div>
                    <div class="bar-estrategica"></div>
                    <div class="bar-tatica"></div>
                    <div class="bar-distracao"></div>
                </div>
                <div class="mix-legend">
                    <div class="legend-item">
                        <div class="legend-dot" style="background: #22c55e;"></div>
                        <span class="legend-text">Essencial (${distribuicao.essencial}%)</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-dot" style="background: #3b82f6;"></div>
                        <span class="legend-text">Estratégica (${distribuicao.estrategica}%)</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-dot" style="background: #eab308;"></div>
                        <span class="legend-text">Tática (${distribuicao.tatica}%)</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-dot" style="background: #ef4444;"></div>
                        <span class="legend-text">Distração (${distribuicao.distracao}%)</span>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Recomendações -->
        <div class="recomendacoes">
            <h2 class="section-title">Suas próximas ações</h2>
            
            ${recomendacoes.length > 0 ? recomendacoes.map((rec, i) => {
              const categoryColors = {
                'HABITO': '#22c55e',
                'TAREFA': '#3b82f6', 
                'MINDSET': '#8b5cf6'
              };
              
              const categoryClass = {
                'HABITO': 'badge-habito',
                'TAREFA': 'badge-tarefa',
                'MINDSET': 'badge-mindset'
              };
              
              const impactClass = {
                'ALTO': 'badge-alto',
                'MEDIO': 'badge-medio',
                'BAIXO': 'badge-baixo'
              };
              
              return `
              <div class="recomendacao-card" style="--accent-color: ${categoryColors[rec.categoria]}">
                <div class="rec-header">
                  <div class="rec-number">${i + 1}</div>
                  <div class="rec-content">
                    <h3>${rec.titulo}</h3>
                    <div class="rec-meta">
                      <span class="badge ${categoryClass[rec.categoria]}">${rec.categoria === 'HABITO' ? 'Hábito Diário' : rec.categoria === 'TAREFA' ? 'Tarefa' : 'Mindset'}</span>
                      <span class="badge ${impactClass[rec.impacto]}">${rec.impacto} Impacto</span>
                    </div>
                  </div>
                </div>
                <p class="rec-description">${rec.descricao}</p>
                <div class="rec-action">
                  <div class="action-label">Próximo passo</div>
                  ${rec.acao}
                </div>
              </div>
              `;
            }).join('') : `
              <div style="text-align: center; padding: 32px 20px; color: #6b7280;">
                <p>Suas recomendações estão sendo processadas...</p>
                <p style="font-size: 14px; margin-top: 8px;">Elas aparecerão aqui em breve!</p>
              </div>
            `}
        </div>
        
        <!-- Benefícios -->
        <div class="beneficios">
            <h2>E se você pudesse liberar +4h semanais?</h2>
            <p class="beneficios-subtitle">
                O sistema completo ROI do Foco oferece acompanhamento contínuo para otimizar seu tempo de forma consistente.
            </p>
            
            <div class="beneficios-grid">
                <div class="beneficio-item">
                    <div class="beneficio-icon">📊</div>
                    <h4>Diagnóstico Contínuo</h4>
                    <p>Mapa de atividades atualizado mensalmente com insights personalizados sobre onde seu tempo gera mais retorno.</p>
                </div>
                
                <div class="beneficio-item">
                    <div class="beneficio-icon">🎯</div>
                    <h4>Priorização Estruturada</h4>
                    <p>Framework DAR CERTO que sugere táticas específicas baseadas no seu perfil e objetivos de carreira.</p>
                </div>
                
                <div class="beneficio-item">
                    <div class="beneficio-icon">📈</div>
                    <h4>Acompanhamento de ROI</h4>
                    <p>Visualize onde você está investindo seu tempo e como focar no que realmente move sua carreira.</p>
                </div>
                
                <div class="beneficio-item">
                    <div class="beneficio-icon">💬</div>
                    <h4>Comunidade + Reflexões</h4>
                    <p>Insights semanais e acesso à comunidade de profissionais que já aplicam a metodologia ROI do Foco.</p>
                </div>
            </div>
        </div>
        
        <!-- Autoridade -->
        <div class="autoridade">
            <p class="quote">
                Conversas que eu gostaria de ter tido com meus gestores. Ajudo líderes e liderados que sentem falta de um chefe para recorrer. Trago reflexões práticas que aceleram sua carreira, aumentam suas chances de promoção e dão suporte para crescer com confiança.
            </p>
            <p class="author">Adilson Matioli, criador e editor da newsleter e da plataforma Conversas no Corredor</p>
        </div>
        
        <!-- CTA -->
        <div class="cta-section">
            <h2 class="cta-title">Pronto para virar o jogo?</h2>
            <p class="cta-subtitle">
                Transforme suas 3 recomendações em um sistema completo de crescimento profissional.
            </p>
            
            <div class="cta-buttons">
                <a href="https://conversasnocorredor.substack.com/subscribe" class="btn btn-primary">
                    Quero acompanhar minha evolução
                </a>
                <div class="microcopy">Liberar +4h semanais focando no que importa</div>
                
                <a href="https://conversasnocorredor.substack.com/subscribe" class="btn btn-secondary">
                    Assinar Newsletter Gratuita
                </a>
            </div>
        </div>
        
        <!-- Footer -->
<div class="footer">
    <div class="footer-brand">Conversas no Corredor</div>
    <div class="footer-subtitle">Reflexões que eu gostaria de ter tido com meus gestores</div>
    <div class="footer-links">
        <a href="https://conversasnocorredor.substack.com/about" class="footer-link">Sobre</a>
        <a href="https://conversasnocorredor.substack.com/s/roi-do-foco" class="footer-link">Série ROI do Foco</a>
        <a href="https://www.linkedin.com/in/adilsonmatioli/" class="footer-link">LinkedIn</a>
    </div>
    <div class="footer-text">
        Newsletter semanal sobre crescimento profissional
    </div>
</div>
    </div>
</body>
</html>
  `.trim();
}