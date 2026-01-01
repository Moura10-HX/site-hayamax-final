'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

// Formatador de Moeda
const formatMoney = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  
  const [pedido, setPedido] = useState<any>(null)
  const [item, setItem] = useState<any>(null) // Novo estado para o item
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPedido() {
      // 1. Busca o Pedido (Cabeçalho)
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', params.id)
        .single()

      if (orderError) {
        console.error(orderError)
        alert('Pedido não encontrado.')
        router.push('/dashboard')
        return
      }

      // 2. Busca os Itens (Lentes e Graus)
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', params.id)
        .single() // Assumindo 1 item por pedido

      if (itemsError) {
        console.error('Erro ao buscar itens:', itemsError)
      }

      setPedido(orderData)
      setItem(itemsData) // Salva o item separado
      setLoading(false)
    }

    fetchPedido()
  }, [params.id, router])

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Carregando detalhes...</div>

  if (!pedido) return null

  // Mapeamento visual do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'producao': return 'bg-blue-100 text-blue-700 border-blue-200' // Ajustado para 'producao'
      case 'entregue': return 'bg-green-100 text-green-700 border-green-200' // Ajustado para 'entregue'
      case 'cancelado': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pendente': return 'Aguardando Conferência'
      case 'producao': return 'Em Produção'
      case 'entregue': return 'Expedido / Entregue'
      case 'rascunho': return 'Rascunho'
      default: return status
    }
  }

  // Extrai o número da OS das observações se não tiver campo específico
  const osCliente = pedido.observacoes?.split('|')[0]?.replace('OS:', '')?.trim() || '-'

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      
      {/* Header de Navegação */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-20 shadow-sm flex justify-between items-center print:hidden">
        <Link href="/dashboard" className="text-sm text-slate-500 hover:text-cyan-600 flex items-center gap-2 font-medium">
          ← Voltar para o Dashboard
        </Link>
        <button 
          onClick={() => window.print()}
          className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          Imprimir OS
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8 print:mt-0 print:max-w-full">
        
        {/* CABEÇALHO DO PEDIDO */}
        <div className="bg-white border border-slate-200 rounded-xl p-8 mb-6 shadow-sm print:shadow-none print:border-none">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 mb-1">Ordem de Serviço</h1>
              <p className="text-slate-500 text-sm">
                Protocolo: #{pedido.numero_pedido || pedido.id.slice(0, 8)}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-lg border text-sm font-bold uppercase tracking-wide ${getStatusColor(pedido.status)}`}>
              {getStatusLabel(pedido.status)}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-slate-100 pt-6">
            <div>
              <span className="block text-xs font-bold text-slate-400 uppercase">Número da OS (Cliente)</span>
              <span className="block text-lg font-bold text-slate-800 font-mono">{osCliente}</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-400 uppercase">Paciente</span>
              <span className="block text-lg font-bold text-slate-800">{item?.nome_paciente || '-'}</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-400 uppercase">Data do Pedido</span>
              <span className="block text-lg font-bold text-slate-800">{new Date(pedido.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-400 uppercase">Valor Total</span>
              {/* Valor total pode vir do pedido se tivermos salvo, ou somar aqui se necessário */}
              <span className="block text-lg font-bold text-cyan-600">R$ --,--</span> 
            </div>
          </div>
        </div>

        {/* DETALHES DO PRODUTO */}
        <div className="bg-white border border-slate-200 rounded-xl p-8 mb-6 shadow-sm print:shadow-none print:border-black">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">Especificações da Lente</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <span className="block text-xs text-slate-500 mb-1">Tipo de Lente</span>
              <span className="block font-bold text-slate-800 capitalize">{item?.tipo_lente?.replace('_', ' ') || '-'}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <span className="block text-xs text-slate-500 mb-1">Índice de Refração</span>
              <span className="block font-bold text-slate-800 capitalize">{item?.indice_refracao || 'Standard'}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <span className="block text-xs text-slate-500 mb-1">Tratamento</span>
              <span className="block font-bold text-slate-800 capitalize">{item?.tratamento?.replace('_', ' ') || 'Nenhum'}</span>
            </div>
          </div>
        </div>

        {/* GRADE TÉCNICA (READ ONLY) */}
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm print:shadow-none print:border-black">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">Receita Óptica</h2>
          
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase">
                <th className="p-3 rounded-l-lg">Olho</th>
                <th className="p-3">Esférico</th>
                <th className="p-3">Cilíndrico</th>
                <th className="p-3">Eixo</th>
                <th className="p-3 border-l border-slate-200">DNP</th>
                <th className="p-3 rounded-r-lg">Altura</th>
              </tr>
            </thead>
            <tbody className="text-slate-800 font-mono text-sm">
              <tr className="border-b border-slate-100">
                <td className="p-4 font-bold text-cyan-600 font-sans">OD</td>
                <td className="p-4">{item?.od_esferico?.toFixed(2)}</td>
                <td className="p-4">{item?.od_cilindrico?.toFixed(2)}</td>
                <td className="p-4">{item?.od_eixo}°</td>
                <td className="p-4 border-l border-slate-100">{item?.od_dnp} mm</td>
                <td className="p-4">{item?.od_altura} mm</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-slate-600 font-sans">OE</td>
                <td className="p-4">{item?.oe_esferico?.toFixed(2)}</td>
                <td className="p-4">{item?.oe_cilindrico?.toFixed(2)}</td>
                <td className="p-4">{item?.oe_eixo}°</td>
                <td className="p-4 border-l border-slate-100">{item?.oe_dnp} mm</td>
                <td className="p-4">{item?.oe_altura} mm</td>
              </tr>
            </tbody>
          </table>

          {item?.adicao && (
            <div className="mt-6 text-center">
              <span className="inline-block bg-slate-100 px-4 py-2 rounded-full text-sm font-bold text-slate-700 border border-slate-200">
                Adição: {item.adicao > 0 ? '+' : ''}{Number(item.adicao).toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Rodapé de Impressão */}
        <div className="hidden print:block mt-12 text-center text-xs text-slate-400">
          <p>Hayamax Laboratório Digital - Documento gerado eletronicamente em {new Date().toLocaleString()}</p>
        </div>

      </div>
    </div>
  )
}