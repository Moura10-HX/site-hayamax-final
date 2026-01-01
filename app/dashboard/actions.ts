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