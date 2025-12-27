'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

type Pedido = {
  id: string
  created_at: string
  paciente_nome: string
  tipo_servico: string
  status: string
  od_esferico: number
  oe_esferico: number
}

export default function DashboardPage() {
  const supabase = createClient()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPedidos() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const { data, error } = await supabase
            .from('pedidos')
            .select('*')
            .order('created_at', { ascending: false })

          if (error) throw error
          if (data) setPedidos(data)
        }
      } catch (error) {
        console.error('Erro ao buscar pedidos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPedidos()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Meus Pedidos</h1>
            <p className="text-slate-500 mt-1">Gerencie suas ordens de serviço e acompanhe a produção.</p>
          </div>
          <Link 
            href="/dashboard/novo-pedido"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-600/20 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
          >
            + Novo Pedido
          </Link>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {!loading && pedidos.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">📂</div>
            <h3 className="text-lg font-bold text-slate-800">Nenhum pedido encontrado</h3>
            <p className="text-slate-500 mb-6">Comece criando sua primeira ordem de serviço.</p>
            <Link href="/dashboard/novo-pedido" className="text-blue-600 font-semibold hover:underline">
              Criar pedido agora
            </Link>
          </div>
        )}

        {!loading && pedidos.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Data</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Paciente / OS</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Serviço</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Resumo (OD/OE)</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pedidos.map((pedido) => (
                    <tr key={pedido.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {new Date(pedido.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-slate-900">{pedido.paciente_nome}</div>
                        <div className="text-xs text-slate-400 font-mono">ID: {pedido.id.slice(0, 8)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 capitalize">
                        {pedido.tipo_servico === 'surfacagem' ? 'Surfaçagem Digital' : 'Lente Pronta'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">
                        <span className="text-blue-600 font-bold">OD:</span> {pedido.od_esferico?.toFixed(2)} <br/>
                        <span className="text-slate-600 font-bold">OE:</span> {pedido.oe_esferico?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                          pedido.status === 'finalizado' ? 'bg-green-100 text-green-800' : 
                          pedido.status === 'em_producao' ? 'bg-blue-100 text-blue-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {pedido.status === 'pendente' && '⏳ Pendente'}
                          {pedido.status === 'em_producao' && '⚙️ Em Produção'}
                          {pedido.status === 'finalizado' && '✅ Finalizado'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link 
                          href={`/dashboard/pedido/${pedido.id}`}
                          className="text-blue-600 hover:text-blue-900 font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Detalhes →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}