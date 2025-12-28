import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. Preparar resposta base
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  // 2. Configurar cliente Supabase (necessário para cookies)
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

  // 3. Verificar sessão do usuário
  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // --- REGRAS DE OURO (LÓGICA BLINDADA) ---

  // REGRA 1: A Home Page ("/") é SEMPRE pública. Ponto final.
  if (path === '/') {
    return response
  }

  // REGRA 2: A página de Login ("/acesso") é pública.
  // Mas se o usuário JÁ estiver logado, mandamos ele pro Dashboard (melhor experiência)
  if (path === '/acesso') {
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return response
  }

  // REGRA 3: Proteção do Dashboard
  // Se tentar entrar em qualquer coisa que comece com /dashboard SEM estar logado -> Login
  if (path.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/acesso', request.url))
  }

  // Deixa passar qualquer outra coisa (imagens, api, etc)
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (svg, png, jpg, jpeg, gif, webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}