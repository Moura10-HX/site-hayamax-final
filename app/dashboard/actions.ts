'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// --- Funções Auxiliares ---
function safeFloat(value: FormDataEntryValue | null) {
  if (!value) return 0
  // Troca vírgula por ponto e remove qualquer caractere não numérico exceto ponto e traço
  const str = value.toString().replace(',', '.').trim()
  if (str === '') return 0
  const parsed = parseFloat(str)
  return isNaN(parsed) ? 0 : parsed
}

function safeInt(value: FormDataEntryValue | null) {
  if (!value) return 0
  const str = value.toString().replace(/\D/g, '') // Remove tudo que não for dígito
  if (str === '') return 0
  const parsed = parseInt(str)
  return isNaN(parsed) ? 0 : parsed
}

// --- Criar Pedido ---
export async function createOrder(formData: FormData) {
  const supabase = await createClient()

  try {
    // 1. Pega usuário
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, message: 'Erro de Autenticação: ' + (authError?.message || 'Usuário não logado') }
    }

    console.log('Iniciando criação de pedido para usuário:', user.id)

    // 2. Cria Pedido (Cabeçalho)
    const orderData = {
      user_id: user.id,
      status: 'pendente',
      observacoes: formData.get('observacoes') as string,
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single()

    if (orderError) {
      console.error('Erro Supabase (Orders):', orderError)
      return { 
        success: false, 
        message: `Erro ao criar cabeçalho do pedido: ${orderError.message} (Código: ${orderError.code})` 
      }
    }

    console.log('Pedido criado com ID:', order.id)

    // 3. Cria Itens (Lentes)
    const itemData = {
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
    }

    console.log('Tentando inserir itens:', itemData)

    const { error: itemError } = await supabase
      .from('order_items')
      .insert(itemData)

    if (itemError) {
      console.error('Erro Supabase (Items):', itemError)
      // Tenta apagar o pedido órfão
      await supabase.from('orders').delete().eq('id', order.id)
      
      return { 
        success: false, 
        message: `Erro ao salvar itens (Lentes): ${itemError.message}. Detalhes: ${itemError.details || 'Nenhum detalhe'}` 
      }
    }

    // 4. Salvar Arquivos (Anexos)
    const arquivosJson = formData.get('arquivos_urls') as string
    
    if (arquivosJson) {
      try {
        const urlsArquivos = JSON.parse(arquivosJson) as string[]
        if (Array.isArray(urlsArquivos) && urlsArquivos.length > 0) {
          const arquivosParaInserir = urlsArquivos.map(url => ({
            order_id: order.id,
            file_url: url,
            file_type: 'anexo',
            created_at: new Date().toISOString()
          }))

          const { error: fileError } = await supabase
            .from('order_attachments') 
            .insert(arquivosParaInserir)

          if (fileError) {
            console.error('Erro ao salvar anexos:', fileError)
            // Não retornamos erro aqui para não cancelar o pedido se só o anexo falhar
          }
        }
      } catch (e) {
        console.error('Erro JSON arquivos:', e)
      }
    }

    revalidatePath('/dashboard')
    return { success: true }

  } catch (error: any) {
    console.error('Erro Fatal no Servidor:', error)
    return { success: false, message: `Erro Interno: ${error.message}` }
  }
}

// --- Buscar Dados do Dashboard ---
export async function getDashboardData() {
  const supabase = await createClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null 

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
  } catch (error) {
    console.error("Erro ao buscar dashboard:", error)
    return null
  }
}

export async function signOutAction() {
  // ... (código de logout mantido igual)
}