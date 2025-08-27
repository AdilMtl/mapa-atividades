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
        @media screen and (max-width: 600px) {
            .mobile-full { width: 100% !important; }
            .mobile-pad { padding-left: 20px !important; padding-right: 20px !important; }
            .mobile-center { text-align: center !important; }
            .mobile-stack { display: block !important; width: 100% !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #F5F7FA; line-height: 1.5;">
    
    <!-- Container Principal -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F5F7FA;">
        <tr>
            <td align="center" style="padding: 20px 10px;">
                
                <!-- Email Container -->
                <table width="600" cellpadding="0" cellspacing="0" border="0" class="mobile-full" style="max-width: 600px; background-color: #FFFFFF; border-radius: 12px; border: 1px solid #E5E7EB;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #042F2E; padding: 32px 40px 24px; text-align: center; border-radius: 12px 12px 0 0;">
                            <div style="font-family: Monaco, Menlo, 'SF Mono', monospace; font-size: 28px; font-weight: 700; color: #D97706; margin-bottom: 4px; letter-spacing: -0.5px;">ROI do Foco</div>
                            <div style="font-size: 14px; color: rgba(255,255,255,0.7); font-weight: 400;">Conversas no Corredor</div>
                        </td>
                    </tr>
                    
                    <!-- Hero Section -->
                    <tr>
                        <td style="padding: 40px 32px; text-align: center; background-color: #FFFFFF;" class="mobile-pad">
                            <h1 style="font-size: 26px; color: #042F2E; font-weight: 700; line-height: 1.2; margin: 0 0 16px 0;">
                                Suas 3 recomendações estão aqui, <span style="color: #D97706; font-weight: 700;">${firstName}</span>
                            </h1>
                            <p style="font-size: 16px; color: #6B7280; margin: 0 0 32px 0; line-height: 1.5;">
                                Você viu onde seu tempo está hoje. Agora descubra como <strong>virar o jogo</strong>.
                            </p>
                            
                            <!-- Snapshot Visual -->
                            <table width="420" cellpadding="0" cellspacing="0" border="0" class="mobile-full" style="max-width: 420px; margin: 24px auto; background-color: #042F2E; border-radius: 12px; border: 1px solid #E5E7EB;">
                                <tr>
                                    <td style="padding: 24px 20px; color: #FFFFFF;" class="mobile-pad">
                                        
                                        <!-- Status Badge -->
                                        <table width="auto" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 24px auto;">
                                            <tr>
                                                <td style="background-color: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); color: #EF4444; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                                                    <span style="display: inline-block; width: 8px; height: 8px; background-color: #EF4444; border-radius: 50%; margin-right: 6px; vertical-align: middle;"></span>
                                                    Crítico
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <!-- Header com ícone -->
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
                                            <tr>
                                                <td style="text-align: center;">
                                                    <span style="font-size: 14px; margin-right: 6px;">📊</span>
                                                    <span style="font-size: 18px; color: #FFFFFF; font-weight: 600;">Seu Mix Atual</span>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <!-- Barras Horizontais -->
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
                                            <!-- Essencial -->
                                            <tr>
                                                <td style="padding-bottom: 12px;">
                                                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                                        <tr>
                                                            <td width="20" style="vertical-align: middle;">
                                                                <span style="display: inline-block; width: 12px; height: 12px; background-color: #22C55E; border-radius: 50%; vertical-align: middle;"></span>
                                                            </td>
                                                            <td width="90" style="font-size: 14px; color: rgba(255,255,255,0.9); vertical-align: middle; padding-left: 8px;">
                                                                Essencial
                                                            </td>
                                                            <td style="vertical-align: middle; padding-left: 8px; padding-right: 8px;">
                                                                <div style="height: 8px; background-color: rgba(255,255,255,0.15); border-radius: 4px; position: relative;">
                                                                    <div style="position: absolute; top: 0; left: 0; height: 100%; background-color: #22C55E; border-radius: 4px; width: ${distribuicao.essencial}%;"></div>
                                                                </div>
                                                            </td>
                                                            <td width="45" style="font-size: 16px; font-weight: 700; color: #FFFFFF; text-align: right; vertical-align: middle;">
                                                                ${distribuicao.essencial}%
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                            
                                            <!-- Estratégico -->
                                            <tr>
                                                <td style="padding-bottom: 12px;">
                                                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                                        <tr>
                                                            <td width="20" style="vertical-align: middle;">
                                                                <span style="display: inline-block; width: 12px; height: 12px; background-color: #3B82F6; border-radius: 50%; vertical-align: middle;"></span>
                                                            </td>
                                                            <td width="90" style="font-size: 14px; color: rgba(255,255,255,0.9); vertical-align: middle; padding-left: 8px;">
                                                                Estratégico
                                                            </td>
                                                            <td style="vertical-align: middle; padding-left: 8px; padding-right: 8px;">
                                                                <div style="height: 8px; background-color: rgba(255,255,255,0.15); border-radius: 4px; position: relative;">
                                                                    <div style="position: absolute; top: 0; left: 0; height: 100%; background-color: #3B82F6; border-radius: 4px; width: ${distribuicao.estrategica}%;"></div>
                                                                </div>
                                                            </td>
                                                            <td width="45" style="font-size: 16px; font-weight: 700; color: #FFFFFF; text-align: right; vertical-align: middle;">
                                                                ${distribuicao.estrategica}%
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                            
                                            <!-- Tático -->
                                            <tr>
                                                <td style="padding-bottom: 12px;">
                                                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                                        <tr>
                                                            <td width="20" style="vertical-align: middle;">
                                                                <span style="display: inline-block; width: 12px; height: 12px; background-color: #EAB308; border-radius: 50%; vertical-align: middle;"></span>
                                                            </td>
                                                            <td width="90" style="font-size: 14px; color: rgba(255,255,255,0.9); vertical-align: middle; padding-left: 8px;">
                                                                Tático
                                                            </td>
                                                            <td style="vertical-align: middle; padding-left: 8px; padding-right: 8px;">
                                                                <div style="height: 8px; background-color: rgba(255,255,255,0.15); border-radius: 4px; position: relative;">
                                                                    <div style="position: absolute; top: 0; left: 0; height: 100%; background-color: #EAB308; border-radius: 4px; width: ${distribuicao.tatica}%;"></div>
                                                                </div>
                                                            </td>
                                                            <td width="45" style="font-size: 16px; font-weight: 700; color: #FFFFFF; text-align: right; vertical-align: middle;">
                                                                ${distribuicao.tatica}%
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                            
                                            <!-- Distração -->
                                            <tr>
                                                <td style="padding-bottom: 0;">
                                                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                                        <tr>
                                                            <td width="20" style="vertical-align: middle;">
                                                                <span style="display: inline-block; width: 12px; height: 12px; background-color: #EF4444; border-radius: 50%; vertical-align: middle;"></span>
                                                            </td>
                                                            <td width="90" style="font-size: 14px; color: rgba(255,255,255,0.9); vertical-align: middle; padding-left: 8px;">
                                                                Distração
                                                            </td>
                                                            <td style="vertical-align: middle; padding-left: 8px; padding-right: 8px;">
                                                                <div style="height: 8px; background-color: rgba(255,255,255,0.15); border-radius: 4px; position: relative;">
                                                                    <div style="position: absolute; top: 0; left: 0; height: 100%; background-color: #EF4444; border-radius: 4px; width: ${distribuicao.distracao}%;"></div>
                                                                </div>
                                                            </td>
                                                            <td width="45" style="font-size: 16px; font-weight: 700; color: #FFFFFF; text-align: right; vertical-align: middle;">
                                                                ${distribuicao.distracao}%
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <!-- Diagnóstico -->
                                        <table width="auto" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 20px auto;">
                                            <tr>
                                                <td style="background-color: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 20px; padding: 10px 20px; font-size: 14px;">
                                                    <span style="font-size: 14px; color: #FBBF24; margin-right: 6px;">⚠️</span>
                                                    <span>Foco disperso</span>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <!-- Texto de referência -->
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td style="font-size: 12px; color: rgba(255,255,255,0.6); text-align: center; line-height: 1.4;">
                                                    Ideal: 40-55% Essencial • 20-30% Estratégico • <25% Tático • <15% Distração
                                                </td>
                                            </tr>
                                        </table>
                                        
                                    </td>
                                </tr>
                            </table>
                            
                        </td>
                    </tr>
                    
                    <!-- Recomendações -->
                    <tr>
                        <td style="padding: 0 32px 40px;" class="mobile-pad">
                            <h2 style="font-size: 22px; color: #042F2E; font-weight: 700; text-align: center; margin: 0 0 24px 0;">Suas próximas ações</h2>
                            
                            ${recomendacoes.length > 0 ? recomendacoes.map((rec, i) => {
                              const categoryColors = {
                                'HABITO': '#22C55E',
                                'TAREFA': '#3B82F6', 
                                'MINDSET': '#8B5CF6'
                              };
                              
                              const categoryClass = {
                                'HABITO': 'background-color: #DCFCE7; color: #166534;',
                                'TAREFA': 'background-color: #DBEAFE; color: #1E40AF;',
                                'MINDSET': 'background-color: #EDE9FE; color: #7C3AED;'
                              };
                              
                              const impactClass = {
                                'ALTO': 'background-color: #DCFCE7; color: #166534;',
                                'MEDIO': 'background-color: #FEF3C7; color: #92400E;',
                                'BAIXO': 'background-color: #F3F4F6; color: #6B7280;'
                              };
                              
                              return `
                              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; border-left: 4px solid ${categoryColors[rec.categoria]}; margin-bottom: 16px;">
                                <tr>
                                  <td style="padding: 20px;">
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                      <tr>
                                        <td width="32" style="vertical-align: top; padding-right: 16px;">
                                          <div style="width: 32px; height: 32px; background-color: ${categoryColors[rec.categoria]}; color: #FFFFFF; border-radius: 50%; display: inline-block; text-align: center; line-height: 32px; font-weight: 700; font-size: 14px; margin-top: 2px;">
                                            ${i + 1}
                                          </div>
                                        </td>
                                        <td style="vertical-align: top;">
                                          <h3 style="font-size: 18px; color: #1F2937; font-weight: 600; margin: 0 0 8px 0; line-height: 1.3;">${rec.titulo}</h3>
                                          <div style="margin-bottom: 12px;">
                                            <span style="display: inline-block; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; margin-right: 8px; margin-bottom: 4px; ${categoryClass[rec.categoria]}">${rec.categoria === 'HABITO' ? 'Hábito Diário' : rec.categoria === 'TAREFA' ? 'Tarefa' : 'Mindset'}</span>
                                            <span style="display: inline-block; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 4px; ${impactClass[rec.impacto]}">${rec.impacto} Impacto</span>
                                          </div>
                                          <p style="font-size: 15px; color: #4B5563; margin: 0 0 16px 0; line-height: 1.5;">${rec.descricao}</p>
                                          <div style="background-color: #FFFFFF; border: 1px solid #D1D5DB; border-radius: 8px; padding: 12px 16px;">
                                            <div style="font-size: 11px; color: #6B7280; text-transform: uppercase; font-weight: 600; margin-bottom: 4px; letter-spacing: 0.3px;">Próximo passo</div>
                                            <div style="font-size: 14px; color: #374151;">${rec.acao}</div>
                                          </div>
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              </table>
                              `;
                            }).join('') : `
                              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                  <td style="text-align: center; padding: 32px 20px; color: #6B7280;">
                                    <p style="margin: 0 0 8px 0;">Suas recomendações estão sendo processadas...</p>
                                    <p style="font-size: 14px; margin: 0;">Elas aparecerão aqui em breve!</p>
                                  </td>
                                </tr>
                              </table>
                            `}
                        </td>
                    </tr>
                    
                    <!-- Benefícios -->
                    <tr>
                        <td style="background-color: #F8FAFC; border-top: 1px solid #E5E7EB; padding: 48px 32px;" class="mobile-pad">
                            <h2 style="font-size: 24px; color: #042F2E; font-weight: 700; text-align: center; margin: 0 0 16px 0;">E se você pudesse liberar +4h semanais?</h2>
                            <p style="font-size: 16px; color: #6B7280; text-align: center; margin: 0 0 40px 0; line-height: 1.5;">
                                O sistema completo ROI do Foco oferece acompanhamento contínuo para otimizar seu tempo de forma consistente.
                            </p>
                            
                            <!-- Grid de Benefícios -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px;">
                                <tr>
                                    <td width="50%" style="vertical-align: top; padding-right: 12px; padding-bottom: 24px;" class="mobile-stack">
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 16px;">
                                            <tr>
                                                <td style="padding: 24px; text-align: center;">
                                                    <div style="width: 48px; height: 48px; background-color: #F3F4F6; border-radius: 12px; display: inline-block; text-align: center; line-height: 48px; margin-bottom: 16px;">
                                                        <span style="display: inline-block; font-size: 18px; line-height: 1; vertical-align: middle; color: #6B7280;">📊</span>
                                                    </div>
                                                    <h4 style="font-size: 16px; color: #1F2937; font-weight: 600; margin: 0 0 8px 0;">Diagnóstico Contínuo</h4>
                                                    <p style="font-size: 14px; color: #6B7280; line-height: 1.5; margin: 0;">Mapa de atividades atualizado mensalmente com insights personalizados sobre onde seu tempo gera mais retorno.</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                    <td width="50%" style="vertical-align: top; padding-left: 12px; padding-bottom: 24px;" class="mobile-stack">
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 16px;">
                                            <tr>
                                                <td style="padding: 24px; text-align: center;">
                                                    <div style="width: 48px; height: 48px; background-color: #F3F4F6; border-radius: 12px; display: inline-block; text-align: center; line-height: 48px; margin-bottom: 16px;">
                                                        <span style="display: inline-block; font-size: 18px; line-height: 1; vertical-align: middle; color: #6B7280;">🎯</span>
                                                    </div>
                                                    <h4 style="font-size: 16px; color: #1F2937; font-weight: 600; margin: 0 0 8px 0;">Priorização Estruturada</h4>
                                                    <p style="font-size: 14px; color: #6B7280; line-height: 1.5; margin: 0;">Framework DAR CERTO que sugere táticas específicas baseadas no seu perfil e objetivos de carreira.</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td width="50%" style="vertical-align: top; padding-right: 12px;" class="mobile-stack">
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 16px;">
                                            <tr>
                                                <td style="padding: 24px; text-align: center;">
                                                    <div style="width: 48px; height: 48px; background-color: #F3F4F6; border-radius: 12px; display: inline-block; text-align: center; line-height: 48px; margin-bottom: 16px;">
                                                        <span style="display: inline-block; font-size: 18px; line-height: 1; vertical-align: middle; color: #6B7280;">📈</span>
                                                    </div>
                                                    <h4 style="font-size: 16px; color: #1F2937; font-weight: 600; margin: 0 0 8px 0;">Acompanhamento de ROI</h4>
                                                    <p style="font-size: 14px; color: #6B7280; line-height: 1.5; margin: 0;">Visualize onde você está investindo seu tempo e como focar no que realmente move sua carreira.</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                    <td width="50%" style="vertical-align: top; padding-left: 12px;" class="mobile-stack">
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 16px;">
                                            <tr>
                                                <td style="padding: 24px; text-align: center;">
                                                    <div style="width: 48px; height: 48px; background-color: #F3F4F6; border-radius: 12px; display: inline-block; text-align: center; line-height: 48px; margin-bottom: 16px;">
                                                        <span style="display: inline-block; font-size: 18px; line-height: 1; vertical-align: middle; color: #6B7280;">💬</span>
                                                    </div>
                                                    <h4 style="font-size: 16px; color: #1F2937; font-weight: 600; margin: 0 0 8px 0;">Comunidade + Reflexões</h4>
                                                    <p style="font-size: 14px; color: #6B7280; line-height: 1.5; margin: 0;">Insights semanais e acesso à comunidade de profissionais que já aplicam a metodologia ROI do Foco.</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- CTA Section -->
                    <tr>
                        <td style="padding: 48px 32px; text-align: center; background-color: #FFFFFF;" class="mobile-pad">
                            <table width="480" cellpadding="0" cellspacing="0" border="0" class="mobile-full" style="max-width: 480px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 16px;">
                                <tr>
                                    <td style="padding: 32px;" class="mobile-pad">
                                        <h2 style="font-size: 22px; color: #042F2E; font-weight: 700; margin: 0 0 8px 0; line-height: 1.2;">Começar a conversa</h2>
                                        <p style="font-size: 16px; color: #6B7280; margin: 0 0 24px 0; line-height: 1.4;">
                                            Assine a newsletter anualmente e tenha acesso completo à metodologia ROI do Foco.
                                        </p>
                                        
                                        <!--[if mso]>
                                        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://conversasnocorredor.substack.com/subscribe" style="height:50px;v-text-anchor:middle;width:200px;" arcsize="24%" stroke="f" fillcolor="#D97706">
                                        <w:anchorlock/>
                                        <center>
                                        <![endif]-->
                                        <a href="https://conversasnocorredor.substack.com/subscribe" style="background-color: #D97706; border-radius: 12px; color: #FFFFFF; display: inline-block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 16px; font-weight: 600; line-height: 50px; text-align: center; text-decoration: none; width: 200px; margin-bottom: 16px;">Fazer parte da conversa →</a>
                                        <!--[if mso]>
                                        </center>
                                        </v:roundrect>
                                        <![endif]-->
                                        
                                        <p style="font-size: 14px; color: #6B7280; margin: 0 0 24px 0; line-height: 1.4;">
                                            Assinatura anual • Reflexões semanais • Acesso completo
                                        </p>
                                        
                                        <a href="https://conversasnocorredor.substack.com/subscribe" style="color: #6B7280; text-decoration: underline; font-size: 14px; font-weight: 500;">
                                            Ou assine gratuitamente primeiro
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #F8FAFC; border-top: 1px solid #E5E7EB; padding: 32px; text-align: center;" class="mobile-pad">
                            <div style="font-size: 16px; font-weight: 600; color: #374151; margin-bottom: 8px;">Conversas no Corredor</div>
                            <div style="font-size: 13px; color: #6B7280; font-style: italic; margin-bottom: 20px;">Reflexões que eu gostaria de ter tido com meus gestores</div>
                            
                            <table width="auto" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 16px auto;">
                                <tr>
                                    <td style="padding-right: 24px;">
                                        <a href="https://conversasnocorredor.substack.com/about" style="color: #D97706; text-decoration: underline; font-size: 14px; font-weight: 500;">Sobre</a>
                                    </td>
                                    <td style="padding-right: 24px;">
                                        <a href="https://conversasnocorredor.substack.com/s/roi-do-foco" style="color: #D97706; text-decoration: underline; font-size: 14px; font-weight: 500;">Série ROI do Foco</a>
                                    </td>
                                    <td>
                                        <a href="https://www.linkedin.com/in/adilsonmatioli/" style="color: #D97706; text-decoration: underline; font-size: 14px; font-weight: 500;">LinkedIn</a>
                                    </td>
                                </tr>
                            </table>
                            
                            <div style="font-size: 12px; color: #9CA3AF;">
                                Newsletter semanal sobre crescimento profissional
                            </div>
                        </td>
                    </tr>
                    
                </table>
                
            </td>
        </tr>
    </table>
    
</body>
</html>
  `.trim();
}