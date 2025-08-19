// Função para verificar se email está autorizado e não expirado
export async function emailAutorizado(email: string): Promise<{ autorizado: boolean; motivo?: string }> {
  try {
    // Ler o arquivo de emails autorizados
    const response = await fetch('/emails-autorizados.txt');
    const texto = await response.text();
    
    const linhas = texto.split('\n').filter(linha => linha.trim());
    const emailLower = email.toLowerCase().trim();
    
    for (const linha of linhas) {
      const [emailAutorizado, dataStr] = linha.split(',').map(s => s.trim());
      
      if (emailAutorizado.toLowerCase() === emailLower) {
        // Verificar se a data não expirou
        const [dia, mes, ano] = dataStr.split('/').map(Number);
        const dataExpiracao = new Date(ano, mes - 1, dia);
        const hoje = new Date();
        
        if (hoje <= dataExpiracao) {
          return { autorizado: true };
        } else {
          return { autorizado: false, motivo: `Acesso expirado em ${dataStr}` };
        }
      }
    }
    
    return { autorizado: false, motivo: 'Email não autorizado' };
  } catch (error) {
    console.error('Erro ao verificar email:', error);
    return { autorizado: false, motivo: 'Erro na verificação' };
  }
}