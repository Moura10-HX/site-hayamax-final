import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // --- SUAS CHAVES ---
  const supabaseUrl = "https://pevafhjxkuvpjhusbhjk.supabase.co"
  const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBldmFmaGp4a3V2cGpodXNiaGprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3Njg0ODksImV4cCI6MjA4MjM0NDQ4OX0.b9JN5EygTWxSYk7491Z5Fe5aQyrJWatGxxMBYnOE92k"

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

  const { data: { user } } = await supabase.auth.getUser()

  // REGRA DE OURO SIMPLIFICADA:
  // 1. Se o usuário NÃO está logado E tenta acessar qualquer coisa dentro de /dashboard
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. Se o usuário JÁ está logado E tenta acessar a página de Login
  if (user && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 3. Para todo o resto (incluindo a própria página de login se não estiver logado), deixa passar
  return response
}

export const config = {
  matcher: [
    // Aplica o middleware apenas no dashboard e no login para evitar loops em arquivos estáticos
    '/dashboard/:path*', 
    '/login'
  ],
}