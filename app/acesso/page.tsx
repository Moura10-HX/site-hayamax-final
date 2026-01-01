"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../utils/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // --- A MÁGICA ACONTECE AQUI ---
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        // Se o Supabase recusar (senha errada, usuário não existe)
        throw new Error("Credenciais inválidas. Verifique e tente novamente.");
      }

      // Se passou, o cookie foi criado automaticamente pelo Supabase.
      // Agora redirecionamos para o Dashboard.
      router.push("/dashboard");
      router.refresh(); // Importante: Atualiza o roteador para reconhecer o novo cookie

    } catch (err: any) {
      console.error("Erro de Login:", err);
      setError(err.message || "Ocorreu um erro ao tentar entrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Animado */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-950 to-slate-950"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Card de Login */}
      <div className="relative z-10 w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600"></div>

        <div className="p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-700 mb-6 shadow-lg shadow-blue-900/50">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Hayamax Digital</h1>
            <p className="text-slate-400 text-sm">Acesso exclusivo para parceiros</p>
          </div>

          {/* Alerta de Erro */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}
          {/* BOTÃO DE TESTE SENTRY - VERSÃO ROBUSTA */}
<button
  type="button"
  style={{ 
    position: 'fixed', 
    bottom: '20px', 
    left: '20px', 
    zIndex: 9999, 
    backgroundColor: '#dc2626', 
    color: 'white', 
    padding: '16px 24px', 
    borderRadius: '9999px', 
    fontWeight: 'bold',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
    border: '2px solid white'
  }}
  onClick={() => {
    console.log("Botão clicado! Tentando enviar erro...");
    // Método oficial do Sentry para teste manual
    // @ts-ignore
    if (window.Sentry) {
        // @ts-ignore
        window.Sentry.captureException(new Error("ERRO MANUAL CONFIRMADO - HAYAMAX"));
        alert("Erro enviado para o Sentry! Verifique o painel.");
    } else {
        // Fallback bruto
        throw new Error("ERRO MANUAL BRUTO - HAYAMAX");
    }
  }}
>
  🚨 DISPARAR ERRO
</button>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase ml-1">E-mail</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-700 text-slate-100 rounded-xl py-3 pl-12 pr-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase ml-1">Senha</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-700 text-slate-100 rounded-xl py-3 pl-12 pr-12 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/30 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" /> : <>Acessar <ArrowRight size={20} /></>}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link href="/" className="text-sm text-slate-500 hover:text-blue-400 transition-colors">
              ← Voltar ao site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}