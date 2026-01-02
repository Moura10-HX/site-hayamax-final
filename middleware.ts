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

  // --- REGRAS DE OURO (LÓGICA BLINDADA E CORRIGIDA) ---

  // REGRA 1: Gerenciamento da Home/Login ("/")
  // Se o usuário acessar a raiz...
  if (path === '/') {
    // ...e JÁ estiver logado, mandamos direto para o Dashboard (Melhor experiência)
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    // ...se NÃO estiver logado, deixa ele ver a tela de login (que é a home)
    return response
  }

  // REGRA 2: Proteção do Dashboard
  // Se tentar entrar em qualquer coisa que comece com /dashboard SEM estar logado...
  if (path.startsWith('/dashboard') && !user) {
    // ...Redireciona para a RAÍZ ("/") que é a tela de login agora.
    // (Antes estava redirecionando para /acesso, o que causava o erro 404)
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Deixa passar qualquer outra coisa (imagens, api, arquivos estáticos)
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