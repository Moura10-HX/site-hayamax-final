import { getDashboardData } from './actions'
import { redirect } from 'next/navigation'
import Link from "next/link"
import { 
  LayoutDashboard, 
  PlusCircle, 
  FileText, 
  User, 
  Settings,
  LogOut,
  ChevronRight
} from "lucide-react"

// Componente Principal (Server Component)
export default async function DashboardPage() {
  // 1. Busca dados reais no servidor
  const data = await getDashboardData()

  // 2. Se não tiver dados (não logado), redireciona
  if (!data) {
    redirect('/login')
  }

  const { profile, orders } = data

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Hayamax Digital
          </h1>
          <p className="text-xs text-slate-500 mt-1">Painel do Parceiro</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavItem icon={<LayoutDashboard />} label="Visão Geral" active />
          <NavItem icon={<PlusCircle />} label="Novo Pedido" />
          <NavItem icon={<FileText />} label="Meus Pedidos" />
          <NavItem icon={<User />} label="Clientes/Pacientes" />
          <NavItem icon={<Settings />} label="Configurações" />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <form action={async () => {
            'use server'
            // Aqui precisaria de uma Server Action de logout, 
            // mas por enquanto deixamos um link simples ou botão client
          }}>
            <Link href="/login" className="flex items-center gap-3 text-slate-400 hover:text-red-400 transition-colors w-full p-2 rounded-lg hover:bg-red-900/10">
              <LogOut size={20} />
              <span>Sair do Sistema</span>
            </Link>
          </form>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 flex flex-col">
        
        {/* HEADER */}
        <header className="h-16 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4 text-slate-400">
            <span className="md:hidden font-bold text-white">Hayamax</span>
            <div className="hidden md:flex items-center gap-2 text-sm">
              <span>Dashboard</span>
              <ChevronRight size={14} />
              <span className="text-white">Visão Geral</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-xs font-bold shadow-lg shadow-blue-900/50 text-white">
              {profile?.razao_social?.charAt(0).toUpperCase() || 'H'}
            </div>
          </div>
        </header>

        {/* ÁREA DE CONTEÚDO */}
        <div className="p-6 md:p-8 overflow-y-auto">
          
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Olá, {profile?.razao_social || 'Parceiro'} 👋
              </h2>
              <p className="text-slate-400">Bem-vindo ao seu painel de controle.</p>
            </div>
            <Link href="/dashboard/novo-pedido">
              <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2">
                <PlusCircle size={18} />
                Nova Ordem de Serviço
              </button>
            </Link>
          </div>

          {/* CARDS COM DADOS REAIS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard 
              title="Limite de Crédito" 
              value={`R$ ${profile?.limite_credito?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}`} 
              icon="💳" 
              color="text-blue-400" 
              border="border-blue-900/50" 
            />
            <StatCard 
              title="Pedidos Ativos" 
              value={orders.filter(o => o.status !== 'entregue' && o.status !== 'cancelado').length.toString()} 
              icon="⚙️" 
              color="text-amber-400" 
              border="border-amber-900/50" 
            />
            <StatCard 
              title="Status da Conta" 
              value="Ativo" 
              icon="✅" 
              color="text-green-400" 
              border="border-green-900/50" 
            />
          </div>

          {/* TABELA COM DADOS REAIS */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-lg">Pedidos Recentes</h3>
              <button className="text-sm text-blue-400 hover:text-blue-300">Ver todos</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950 text-slate-400 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4 font-medium">ID</th>
                    <th className="px-6 py-4 font-medium">Data</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                        Nenhum pedido encontrado. Crie sua primeira OS!
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 font-mono text-slate-300 text-xs">
                          {order.id.slice(0, 8)}...
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {new Date(order.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/dashboard/pedido/${order.id}`} className="text-blue-400 hover:text-blue-300 text-xs font-medium">
                            Detalhes
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}

// --- COMPONENTES VISUAIS (Mantidos iguais) ---

function NavItem({ icon, label, active = false }: any) {
  return (
    <div className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all cursor-pointer ${active ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
      {icon}
      <span className="font-medium text-sm">{label}</span>
    </div>
  )
}

function StatCard({ title, value, icon, color, border }: any) {
  return (
    <div className={`bg-slate-900 p-6 rounded-2xl border ${border} relative overflow-hidden group hover:border-slate-600 transition-all`}>
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-4xl grayscale group-hover:grayscale-0">
        {icon}
      </div>
      <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
      <h3 className={`text-2xl font-bold ${color}`}>{value}</h3>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    "producao": "bg-blue-900/30 text-blue-400 border-blue-800",
    "rascunho": "bg-slate-800 text-slate-400 border-slate-700",
    "analise": "bg-amber-900/30 text-amber-400 border-amber-800",
    "entregue": "bg-green-900/30 text-green-400 border-green-800",
    "cancelado": "bg-red-900/30 text-red-400 border-red-800",
  }
  
  // Normaliza o status (ex: "Em Produção" -> "producao" se necessário, mas aqui assumo que vem do banco)
  const statusKey = status.toLowerCase()
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[statusKey] || "bg-slate-800 text-slate-400"}`}>
      {status.toUpperCase()}
    </span>
  )
}