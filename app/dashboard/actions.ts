'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

// ... (mantenha as funções parseDecimal e parseIntSafe iguais)
function parseDecimal(value: FormDataEntryValue | null): number {
  if (!value) return 0
  const str = value.toString().trim()
  if (str === '') return 0
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
  console.log('--- INICIANDO CREATE ORDER ---') // LOG 1
  const supabase = await createClient()

  // 1. Verifica Usuário
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    console.error('ERRO AUTH:', authError)
    throw new Error('Usuário não autenticado.')
  }
  console.log('USUÁRIO OK:', user.id) // LOG 2

  // 2. Cria Cabeçalho
  console.log('TENTANDO CRIAR CABEÇALHO...') // LOG 3
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      status: 'pendente',
      observacoes: (formData.get('observacoes') as string) || '',
    })
    .select()
    .single()

  if (orderError) {
    console.error('ERRO CABEÇALHO:', orderError) // AQUI PODE SER O ERRO
    throw new Error(`Erro ao criar pedido: ${orderError.message}`)
  }
  console.log('CABEÇALHO CRIADO:', order.id) // LOG 4

  try {
    // 3. Prepara Itens
    const itemPayload = {
      order_id: order.id,
      nome_paciente: (formData.get('nome_paciente') as string)?.toUpperCase() || 'CONSUMIDOR FINAL',
      tipo_lente: (formData.get('tipo_lente') as string) || 'VISAO_SIMPLES',
      indice_refracao: '1.56',
      tratamento: (formData.get('tratamento') as string) || 'SEM_TRATAMENTO',
      
      od_esferico: parseDecimal(formData.get('od_esferico')),
      od_cilindrico: parseDecimal(formData.get('od_cilindrico')),
      od_eixo: parseIntSafe(formData.get('od_eixo')),
      od_dnp: parseDecimal(formData.get('od_dnp')),
      od_altura: parseDecimal(formData.get('od_altura')),

      oe_esferico: parseDecimal(formData.get('oe_esferico')),
      oe_cilindrico: parseDecimal(formData.get('oe_cilindrico')),
      oe_eixo: parseIntSafe(formData.get('oe_eixo')),
      oe_dnp: parseDecimal(formData.get('oe_dnp')),
      oe_altura: parseDecimal(formData.get('oe_altura')),

      adicao: parseDecimal(formData.get('adicao')),
    }
    
    console.log('PAYLOAD ITENS:', itemPayload) // LOG 5 (Verificar dados)

    // 4. Insere Itens
    const { error: itemError } = await supabase
      .from('order_items')
      .insert(itemPayload)

    if (itemError) {
      console.error('ERRO AO INSERIR ITENS:', itemError) // AQUI PODE SER O ERRO
      throw new Error(itemError.message)
    }
    console.log('ITENS INSERIDOS COM SUCESSO!') // LOG 6

  } catch (error: any) {
    console.error('CAIU NO CATCH:', error)
    // Rollback
    await supabase.from('orders').delete().eq('id', order.id)
    console.log('PEDIDO DELETADO (ROLLBACK)')
    throw new Error(`Falha nos itens: ${error.message}`)
  }

  console.log('REDIRECIONANDO...')
  redirect('/dashboard')
}

// ... (Mantenha a getDashboardData aqui embaixo)
export async function getDashboardData() {
    // ... (código que já estava funcionando)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { profile: null, orders: [] }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

    return { profile, orders: orders || [] }
}