'use server'

// Ajuste aqui: Caminho relativo para garantir que encontre o arquivo
import { createClient } from '../../utils/supabase/server' 
import { Order, Profile } from '@/types/database' // Verifique se este caminho está correto para seus types

export async function getDashboardData() {
  const supabase = await createClient()

  // 1. Pega o usuário logado
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    // Retorna nulo para tratar o redirect na página, não aqui
    return null
  }

  // 2. Busca o Perfil da Óptica
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // 3. Busca os Pedidos Recentes
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  if (profileError) console.error('Erro ao buscar perfil:', profileError)
  if (ordersError) console.error('Erro ao buscar pedidos:', ordersError)

  return {
    profile: profile as Profile | null,
    orders: orders as Order[] || []
  }
}
// ... (imports anteriores)
import { redirect } from 'next/navigation'

// Adicione esta nova função no final do arquivo
export async function createOrder(formData: FormData) {
  const supabase = await createClient()

  // 1. Pega o usuário
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autorizado')

  // 2. Cria o Pedido (Cabeçalho)
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      status: 'rascunho', // Começa como rascunho
      observacoes: formData.get('observacoes') as string,
    })
    .select()
    .single()

  if (orderError) {
    console.error('Erro ao criar pedido:', orderError)
    throw new Error('Falha ao criar pedido')
  }

  // 3. Cria os Itens (Lentes)
  // Convertendo strings vazias para null ou 0 onde necessário
  const toDecimal = (val: FormDataEntryValue | null) => val ? parseFloat(val.toString()) : 0
  const toInt = (val: FormDataEntryValue | null) => val ? parseInt(val.toString()) : null

  const { error: itemError } = await supabase
    .from('order_items')
    .insert({
      order_id: order.id,
      nome_paciente: formData.get('nome_paciente') as string,
      tipo_lente: formData.get('tipo_lente') as string,
      indice_refracao: '1.56', // Fixo por enquanto ou pegue do form
      tratamento: formData.get('tratamento') as string,
      
      // Olho Direito
      od_esferico: toDecimal(formData.get('od_esferico')),
      od_cilindrico: toDecimal(formData.get('od_cilindrico')),
      od_eixo: toInt(formData.get('od_eixo')),
      od_dnp: toDecimal(formData.get('od_dnp')),

      // Olho Esquerdo
      oe_esferico: toDecimal(formData.get('oe_esferico')),
      oe_cilindrico: toDecimal(formData.get('oe_cilindrico')),
      oe_eixo: toInt(formData.get('oe_eixo')),
      oe_dnp: toDecimal(formData.get('oe_dnp')),
    })

  if (itemError) {
    console.error('Erro ao criar itens:', itemError)
    // Idealmente, deletaríamos o pedido criado se o item falhar (rollback manual)
    await supabase.from('orders').delete().eq('id', order.id)
    throw new Error('Falha ao adicionar itens')
  }

  // 4. Sucesso! Redireciona de volta pro dashboard
  redirect('/dashboard')
}