import { login } from './actions'
import Image from 'next/image' // &lt;--- Importante importar o componente Image

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message: string }
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      
      {/* Elementos decorativos de fundo */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* Card de Login */}
      <div className="relative z-10 w-full max-w-md p-8 mx-4 glass-panel rounded-2xl shadow-2xl animate-fade-in">
        
        {/* LOGO DA HAYAMAX AQUI */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="relative w-64 h-24 mb-2"> {/* Ajuste w-48 e h-16 conforme o tamanho da sua logo */}
            <Image 
              src="/logo-hayamax.svg"
              alt="Hayamax Digital" 
              fill 
              className="object-contain"
              priority
            />
          </div>
          {/* Fallback caso a imagem não carregue ou para acessibilidade */}
          <p className="sr-only">Hayamax Digital</p> 
          <p className="mt-2 text-sm text-slate-600 font-medium">
            Portal do Parceiro Óptico
          </p>
        </div>

        <form className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 ml-1">Email Corporativo</label>
              <input
                name="email"
                type="email"
                required
                className="block w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                placeholder="ex: otica@parceiro.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 ml-1">Senha de Acesso</label>
              <input
                name="password"
                type="password"
                required
                className="block w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          {searchParams?.message && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm text-center font-medium">
              {searchParams.message}
            </div>
          )}

          <button
            formAction={login}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-900/30 transform transition hover:-translate-y-0.5 focus:ring-2 focus:ring-offset-2 focus:ring-blue-900"
          >
            ACESSAR SISTEMA
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500">
            Precisa de ajuda? <a href="#" className="text-blue-700 font-semibold hover:underline">Contate o suporte</a>
          </p>
        </div>
      </div>
    </div>
  )
}