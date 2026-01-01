'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

// Função auxiliar para limpar e converter números com segurança máxima
// Aceita: "1.5", "1,5", "+1.50", "", null, undefined
// Retorna: number ou null (se for campo opcional) ou 0 (se obrigatório)
function parseDecimal(value: FormDataEntryValue | null): number {
  if (!value) return 0
  const str = value.toString().trim()
  if (str === '') return 0
  
  // Remove caracteres não numéricos exceto ponto, vírgula e sinal de menos
  // Troca vírgula por ponto para padrão internacional
  const cleanStr = str.replace(',', '.')
  
  const parsed = parseFloat(cleanStr)
  return isNaN(parsed) ? 0 : parsed
}

function parseIntSafe(value: FormDataEntryValue | null): number {
  if (!value) return 0
  const str = value.toString().trim()
  if (str === '') return 0
  
  const parsed = parseInt(str)
  return isNaN(parsed) ? 0 : parsed
}

export async function createOrder(formData: FormData) {
  const supabase = await createClient()

  // 1. SEGURANÇA: Verifica autenticação
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    console.error('Tentativa de criar pedido sem login:', authError)
    throw new Error('Usuário não autenticado.')
  }

  // 2. CRIAÇÃO DO CABEÇALHO (ORDER)
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      status: 'pendente', // Status inicial correto para fluxo de produção
      observacoes: (formData.get('observacoes') as string) || '',
    })
    .select()
    .single()

  if (orderError) {
    console.error('FATAL: Erro ao criar cabeçalho do pedido:', orderError)
    throw new Error('Não foi possível iniciar o pedido. Tente novamente.')
  }

  try {
    // 3. PREPARAÇÃO DOS DADOS DOS ITENS
    // Extrai e limpa todos os campos antes de enviar
    const itemPayload = {
      order_id: order.id,
      nome_paciente: (formData.get('nome_paciente') as string)?.toUpperCase() || 'CONSUMIDOR FINAL',
      tipo_lente: (formData.get('tipo_lente') as string) || 'VISAO_SIMPLES',
      indice_refracao: '1.56', // Valor padrão ou vindo do form
      tratamento: (formData.get('tratamento') as string) || 'SEM_TRATAMENTO',
      
      // OLHO DIREITO
      od_esferico: parseDecimal(formData.get('od_esferico')),
      od_cilindrico: parseDecimal(formData.get('od_cilindrico')),
      od_eixo: parseIntSafe(formData.get('od_eixo')),
      od_dnp: parseDecimal(formData.get('od_dnp')),
      od_altura: parseDecimal(formData.get('od_altura')),

      // OLHO ESQUERDO
      oe_esferico: parseDecimal(formData.get('oe_esferico')),
      oe_cilindrico: parseDecimal(formData.get('oe_cilindrico')),
      oe_eixo: parseIntSafe(formData.get('oe_eixo')),
      oe_dnp: parseDecimal(formData.get('oe_dnp')),
      oe_altura: parseDecimal(formData.get('oe_altura')),

      // ADIÇÃO
      adicao: parseDecimal(formData.get('adicao')),
    }

    // 4. INSERÇÃO DOS ITENS
    const { error: itemError } = await supabase
      .from('order_items')
      .insert(itemPayload)

    if (itemError) {
      throw new Error(`Erro ao salvar itens: ${itemError.message}`)
    }

  } catch (error) {
    // ROLLBACK MANUAL: Se der erro nos itens, apaga o cabeçalho para não deixar lixo
    console.error('ROLLBACK: Apagando pedido órfão devido a erro nos itens:', error)
    await supabase.from('orders').delete().eq('id', order.id)
    throw new Error('Falha ao processar os detalhes do pedido. Tente novamente.')
  }

  // 5. SUCESSO E REDIRECIONAMENTO
  // O redirect deve ser a última coisa e fora do try/catch
  redirect('/dashboard')
}
// ... (mantenha os imports e a função createOrder como estão)

// Substitua a função getDashboardData antiga por esta NOVA VERSÃO COMPLETA:
export async function getDashboardData() {
  const supabase = await createClient()
  
  // 1. Verifica Usuário
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    // Retorna estrutura vazia para não quebrar a página
    return { profile: null, orders: [] }
  }

  // 2. Busca o Perfil (Para mostrar Nome e Crédito)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // 3. Busca os Pedidos (Para a tabela)
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  // Retorna exatamente o que a page.tsx espera: { profile, orders }
  return {
    profile: profile || null,
    orders: orders || []
  }
}