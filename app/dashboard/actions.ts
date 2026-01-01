'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

// Função simples para converter números
function safeFloat(value: FormDataEntryValue | null) {
  if (!value) return 0
  const str = value.toString().replace(',', '.')
  const parsed = parseFloat(str)
  return isNaN(parsed) ? 0 : parsed
}

function safeInt(value: FormDataEntryValue | null) {
  if (!value) return 0
  const parsed = parseInt(value.toString())
  return isNaN(parsed) ? 0 : parsed
}

export async function createOrder(formData: FormData) {
  const supabase = await createClient()

  // 1. Pega usuário
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autorizado')

  // 2. Cria Pedido (Cabeçalho)
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      status: 'pendente',
      observacoes: formData.get('observacoes') as string,
    })
    .select()
    .single()

  if (orderError) {
    console.error('Erro ao criar pedido:', orderError)
    throw new Error('Erro ao criar pedido')
  }

  // 3. Cria Itens (Lentes)
  const { error: itemError } = await supabase
    .from('order_items')
    .insert({
      order_id: order.id,
      nome_paciente: (formData.get('nome_paciente') as string) || 'Consumidor',
      tipo_lente: formData.get('tipo_lente') as string,
      tratamento: formData.get('tratamento') as string,
      
      // Olho Direito
      od_esferico: safeFloat(formData.get('od_esferico')),
      od_cilindrico: safeFloat(formData.get('od_cilindrico')),
      od_eixo: safeInt(formData.get('od_eixo')),
      od_dnp: safeFloat(formData.get('od_dnp')),
      od_altura: safeFloat(formData.get('od_altura')),

      // Olho Esquerdo
      oe_esferico: safeFloat(formData.get('oe_esferico')),
      oe_cilindrico: safeFloat(formData.get('oe_cilindrico')),
      oe_eixo: safeInt(formData.get('oe_eixo')),
      oe_dnp: safeFloat(formData.get('oe_dnp')),
      oe_altura: safeFloat(formData.get('oe_altura')),

      // Adição
      adicao: safeFloat(formData.get('adicao')),
    })

  if (itemError) {
    console.error('Erro nos itens:', itemError)
    // Se falhar, apaga o pedido para não ficar lixo
    await supabase.from('orders').delete().eq('id', order.id)
    throw new Error('Erro ao salvar itens do pedido')
  }

  redirect('/dashboard')
}

// Função para carregar o Dashboard (Necessária para não quebrar a página principal)
export async function getDashboardData() {
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

  return {
    profile: profile || null,
    orders: orders || []
  }
}