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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPedido() {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) {
        console.error(error)
        alert('Pedido não encontrado.')
        router.push('/dashboard')
        return
      }

      setPedido(data)
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
      case 'em_producao': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'finalizado': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pendente': return 'Aguardando Conferência'
      case 'em_producao': return 'Em Produção'
      case 'finalizado': return 'Expedido / Entregue'
      default: return status
    }
  }

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
              <p className="text-slate-500 text-sm">ID: {pedido.id}</p>
            </div>
            <div className={`px-4 py-2 rounded-lg border text-sm font-bold uppercase tracking-wide ${getStatusColor(pedido.status)}`}>
              {getStatusLabel(pedido.status)}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-slate-100 pt-6">
            <div>
              <span className="block text-xs font-bold text-slate-400 uppercase">Número da OS</span>
              <span className="block text-lg font-bold text-slate-800 font-mono">{pedido.codigo_os}</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-400 uppercase">Paciente</span>
              <span className="block text-lg font-bold text-slate-800">{pedido.paciente_nome}</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-400 uppercase">Data do Pedido</span>
              <span className="block text-lg font-bold text-slate-800">{new Date(pedido.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-400 uppercase">Valor Total</span>
              <span className="block text-lg font-bold text-cyan-600">{formatMoney(pedido.valor_total || 0)}</span>
            </div>
          </div>
        </div>

        {/* DETALHES DO PRODUTO */}
        <div className="bg-white border border-slate-200 rounded-xl p-8 mb-6 shadow-sm print:shadow-none print:border-black">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">Especificações da Lente</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <span className="block text-xs text-slate-500 mb-1">Tipo de Lente</span>
              <span className="block font-bold text-slate-800 capitalize">{pedido.tipo_lente?.replace('_', ' ')}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <span className="block text-xs text-slate-500 mb-1">Material</span>
              <span className="block font-bold text-slate-800 capitalize">{pedido.material}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <span className="block text-xs text-slate-500 mb-1">Tratamento</span>
              <span className="block font-bold text-slate-800 capitalize">{pedido.tratamentos?.replace('_', ' ') || 'Nenhum'}</span>
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
                <td className="p-4">{pedido.od_esferico?.toFixed(2)}</td>
                <td className="p-4">{pedido.od_cilindrico?.toFixed(2)}</td>
                <td className="p-4">{pedido.od_eixo}°</td>
                <td className="p-4 border-l border-slate-100">{pedido.od_dnp} mm</td>
                <td className="p-4">{pedido.od_altura} mm</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-slate-600 font-sans">OE</td>
                <td className="p-4">{pedido.oe_esferico?.toFixed(2)}</td>
                <td className="p-4">{pedido.oe_cilindrico?.toFixed(2)}</td>
                <td className="p-4">{pedido.oe_eixo}°</td>
                <td className="p-4 border-l border-slate-100">{pedido.oe_dnp} mm</td>
                <td className="p-4">{pedido.oe_altura} mm</td>
              </tr>
            </tbody>
          </table>

          {pedido.adicao > 0 && (
            <div className="mt-6 text-center">
              <span className="inline-block bg-slate-100 px-4 py-2 rounded-full text-sm font-bold text-slate-700 border border-slate-200">
                Adição: +{pedido.adicao.toFixed(2)}
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