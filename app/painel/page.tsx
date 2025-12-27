"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulação de login - AQUI VOCÊ CONECTARÁ O SUPABASE DEPOIS
    setTimeout(() => {
      setLoading(false);
      router.push("/dashboard"); // Redireciona para o painel
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* BACKGROUND FUTURISTA */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-950 to-slate-950"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 -left-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* CARD DE LOGIN */}
      <div className="relative z-10 w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Barra Superior Decorativa */}
        <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600"></div>

        <div className="p-8 md:p-10">
          
          {/* CABEÇALHO */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-700 mb-6 shadow-lg shadow-blue-900/50">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Hayamax Digital</h1>
            <p className="text-slate-400 text-sm">Acesso exclusivo para parceiros ópticos</p>
          </div>

          {/* FORMULÁRIO */}
          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* EMAIL */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">E-mail Corporativo</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input 
                  type="email" 
                  placeholder="seu@email.com" 
                  className="w-full bg-slate-950/50 border border-slate-700 text-slate-100 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                  required
                />
              </div>
            </div>

            {/* SENHA */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">Senha de Acesso</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="w-full bg-slate-950/50 border border-slate-700 text-slate-100 rounded-xl py-3.5 pl-12 pr-12 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* BOTÃO LOGIN */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <span className="animate-pulse">Acessando...</span>
              ) : (
                <>
                  Acessar Painel
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

          </form>

          {/* RODAPÉ DO CARD */}
          <div className="mt-8 text-center">
            <Link href="/" className="text-sm text-slate-500 hover:text-blue-400 transition-colors">
              ← Voltar para o site
            </Link>
          </div>

        </div>
      </div>
      
      {/* Footerzinho */}
      <div className="absolute bottom-6 text-slate-600 text-xs">
        &copy; 2024 Hayamax Lentes. Sistema Seguro.
      </div>

    </div>
  );
}