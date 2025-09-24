// VALIDADOR DE EMAIL SEGURO - USA API BACKEND
// src/lib/email-validator.ts

export async function emailAutorizado(email: string): Promise<{ 
  autorizado: boolean; 
  motivo?: string 
}> {
  try {
    // Chamar nossa API segura (não o arquivo público)
    const response = await fetch('/api/auth/check-authorization', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    })

    // Se a API retornar erro HTTP
    if (!response.ok) {
      return { 
        autorizado: false, 
        motivo: 'Erro na verificação'
      }
    }

    // Pegar resposta da API
    const data = await response.json()
    
    // Retornar EXATAMENTE no mesmo formato que antes
    return {
      autorizado: data.authorized,
      motivo: data.motivo
    }
    
  } catch (error) {
    console.error('Erro ao verificar email:', error)
    return { 
      autorizado: false, 
      motivo: 'Erro na verificação'
    }
  }
}