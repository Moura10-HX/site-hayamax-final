'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

// --- Funções Auxiliares ---
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

// --- Criar Pedido ---
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

  // --- NOVO: 4. Salvar Arquivos (Anexos) ---
  // Recupera a string JSON com as URLs dos arquivos enviada pelo frontend
  const arquivosJson = formData.get('arquivos_urls') as string
  
  if (arquivosJson) {
    try {
      const urlsArquivos = JSON.parse(arquivosJson) as string[]
      
      if (Array.isArray(urlsArquivos) && urlsArquivos.length > 0) {
        const arquivosParaInserir = urlsArquivos.map(url => ({
          order_id: order.id, // Vincula ao pedido criado
          file_url: url,      // URL pública do arquivo
          file_type: 'anexo', // Tipo genérico ou extrair da extensão
          created_at: new Date().toISOString()
        }))

        // Insere na tabela 'order_attachments' (ou o nome que você usa no banco)
        const { error: fileError } = await supabase
          .from('order_attachments') 
          .insert(arquivosParaInserir)

        if (fileError) {
          console.error('Erro ao salvar anexos:', fileError)
          // Não vamos deletar o pedido se só o anexo falhar, mas logamos o erro
        }
      }
    } catch (e) {
      console.error('Erro ao processar JSON de arquivos:', e)
    }
  }

  redirect('/dashboard')
}

// --- Buscar Dados do Dashboard ---
export async function getDashboardData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null // Retorna null se não tiver user, para o page.tsx redirecionar

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

// --- SAIR DO SISTEMA (Logout) ---
export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('https://www.lenteshayamax.com.br')
}