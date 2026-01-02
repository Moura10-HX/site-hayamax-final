import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. Setup inicial
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

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
  const path = request.nextUrl.pathname

  // --- CAMADA DE CORREÇÃO DE ROTA (CRÍTICO) ---
  
  // Se o navegador tentar acessar /login (por cache ou erro), forçamos a ida para a Home
  if (path === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // --- REGRAS DE NEGÓCIO ---

  // 1. Usuário Logado tentando acessar a Home -> Vai pro Dashboard
  if (path === '/' && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 2. Usuário NÃO Logado tentando acessar Dashboard -> Vai pra Home (Login)
  if (path.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}