import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. Configuração inicial da resposta
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  // 2. Configuração do Cliente Supabase
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
  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // --- REGRAS DE SEGURANÇA ---

  // REGRA A: Usuário NÃO logado tentando acessar área privada (Dashboard)
  // Se não tem user E o caminho começa com /dashboard -> Manda pro Login
  if (!user && path.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/acesso', request.url))
  }

  // REGRA B: Usuário JÁ logado tentando acessar área pública (Login ou Home)
  // Se tem user E está na página de login -> Manda pro Dashboard
  if (user && path === '/acesso') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // REGRA C: Permite todo o resto (Home, Imagens, etc)
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (svg, png, jpg, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}