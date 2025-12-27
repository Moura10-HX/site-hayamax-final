import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. Cria a resposta inicial
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // --- SUAS CHAVES (Mantidas) ---
  const supabaseUrl = "https://pevafhjxkuvpjhusbhjk.supabase.co"
  const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBldmFmaGp4a3V2cGpodXNiaGprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3Njg0ODksImV4cCI6MjA4MjM0NDQ4OX0.b9JN5EygTWxSYk7491Z5Fe5aQyrJWatGxxMBYnOE92k"

  // 2. Configura o cliente Supabase
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() { return request.cookies.getAll() },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
        response = NextResponse.next({ request: { headers: request.headers } })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  // 3. Verifica o usuário
  // IMPORTANTE: getUser() é mais seguro que getSession() para middleware
  const { data: { user } } = await supabase.auth.getUser()

  // 4. Regras de Proteção
  const path = request.nextUrl.pathname

  // REGRA 1: Protege /dashboard e qualquer subpasta
  if (path.startsWith('/dashboard') && !user) {
    // Redireciona para login se não tiver usuário
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // REGRA 2: Se já logado, não deixa acessar /login, manda pro dashboard
  if (path === '/login' && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // REGRA 3: Protege a raiz (opcional - se quiser que "/" vá para login)
  // Se quiser que a home "/" seja pública, remova este bloco
  // if (path === '/' && !user) {
  //   return NextResponse.redirect(new URL('/login', request.url))
  // }

  return response
}

// CONFIGURAÇÃO DO MATCHER (AQUI ESTAVA O ERRO)
// Agora ele vigia tudo, exceto arquivos estáticos (_next, imagens, favicon)
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}