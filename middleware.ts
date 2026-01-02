import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. Setup inicial com Headers de Segurança (HARDENING)
  // Criamos a resposta base já injetando headers de proteção
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  // --- CABEÇALHOS DE SEGURANÇA (NOVO) ---
  // Impede que seu site seja colocado em um iFrame (Proteção contra Clickjacking)
  response.headers.set('X-Frame-Options', 'DENY')
  // Impede que o navegador "adivinhe" tipos de arquivo (Proteção contra MIME Sniffing)
  response.headers.set('X-Content-Type-Options', 'nosniff')
  // Controla quanta informação de referência é enviada (Privacidade)
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  // Força HTTPS estrito (HSTS) - Aumenta segurança em redes públicas
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')

  // 2. Configuração do Supabase
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          // Atualiza tanto a request quanto a response para manter a sessão sincronizada
          response = NextResponse.next({ 
            request: { headers: request.headers } 
          })
          // Reaplicamos os headers de segurança na nova resposta
          response.headers.set('X-Frame-Options', 'DENY')
          response.headers.set('X-Content-Type-Options', 'nosniff')
          response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
          response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
          
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  // 3. Verificação de Usuário
  // getUser() é seguro pois valida o token no servidor de Auth
  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // --- REGRAS DE ROTEAMENTO ---

  // Proteção do Dashboard
  if (path.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Redirecionamento de Usuário Logado
  if (path === '/' && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}