"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client"; // Certifique-se que este caminho existe
import { useRouter } from "next/navigation"; // Importante: use next/navigation, não next/router
import { 
  LayoutDashboard, 
  PlusCircle, 
  Search, 
  Bell, 
  LogOut, 
  User, 
  FileText, 
  Settings,
  ChevronRight
} from "lucide-react";
import Link from "next/link";

// Dados simulados
const mockPedidos = [
  { id: "OS-2024-001", cliente: "Ótica Visão Real", paciente: "Maria Silva", status: "Em Produção", data: "27/12/2025", valor: "R$ 450,00" },
  { id: "OS-2024-002", cliente: "Ótica Visão Real", paciente: "João Santos", status: "Pendente", data: "26/12/2025", valor: "R$ 320,00" },
  { id: "OS-2024-003", cliente: "Ótica Visão Real", paciente: "Ana Costa", status: "Finalizado", data: "24/12/2025", valor: "R$ 890,00" },
];

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  // --- TRAVA DE SEGURANÇA (CLIENT SIDE) ---
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Se não tem usuário, chuta para o login IMEDIATAMENTE
        router.push("/login");
      } else {
        // Se tem usuário, libera o acesso
        setUser(user);
        setLoading(false);
      }
    };

    checkUser();
  }, [router, supabase]);

  // Enquanto verifica, mostra tela de carregamento (para não piscar o painel)
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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
          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/login");
            }}
            className="flex items-center gap-3 text-slate-400 hover:text-red-400 transition-colors w-full p-2 rounded-lg hover:bg-red-900/10"
          >
            <LogOut size={20} />
            <span>Sair do Sistema</span>
          </button>
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
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-xs font-bold shadow-lg shadow-blue-900/50">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* ÁREA DE CONTEÚDO */}
        <div className="p-6 md:p-8 overflow-y-auto">
          
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Olá, {user?.email?.split('@')[0]} 👋</h2>
              <p className="text-slate-400">Bem-vindo ao seu painel de controle.</p>
            </div>
            <Link href="/dashboard/novo-pedido">
              <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2">
                <PlusCircle size={18} />
                Nova Ordem de Serviço
              </button>
            </Link>
          </div>

          {/* CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard title="Em Produção" value="12" icon="⚙️" color="text-blue-400" border="border-blue-900/50" />
            <StatCard title="Finalizados (Hoje)" value="4" icon="✅" color="text-green-400" border="border-green-900/50" />
            <StatCard title="Faturamento (Mês)" value="R$ 12.450" icon="💰" color="text-amber-400" border="border-amber-900/50" />
          </div>

          {/* TABELA */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-lg">Pedidos Recentes</h3>
              <button className="text-sm text-blue-400 hover:text-blue-300">Ver todos</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950 text-slate-400 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4 font-medium">Nº OS</th>
                    <th className="px-6 py-4 font-medium">Paciente</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Data</th>
                    <th className="px-6 py-4 font-medium text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {mockPedidos.map((pedido) => (
                    <tr key={pedido.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-slate-300">{pedido.id}</td>
                      <td className="px-6 py-4 font-medium text-white">{pedido.paciente}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={pedido.status} />
                      </td>
                      <td className="px-6 py-4 text-slate-400">{pedido.data}</td>
                      <td className="px-6 py-4 text-right font-medium text-slate-200">{pedido.valor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

// Componentes Auxiliares (Mesmos de antes)
function NavItem({ icon, label, active = false }: any) {
  return (
    <button className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all ${active ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
      {icon}
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
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
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    "Em Produção": "bg-blue-900/30 text-blue-400 border-blue-800",
    "Pendente": "bg-amber-900/30 text-amber-400 border-amber-800",
    "Finalizado": "bg-green-900/30 text-green-400 border-green-800",
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || "bg-slate-800 text-slate-400"}`}>
      {status}
    </span>
  );
}