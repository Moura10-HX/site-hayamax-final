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

  // REGRA 1: Se tentar acessar /dashboard SEM usuário -> Manda para /painel
  if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/painel', request.url))
  }

  // REGRA 2: Se já logado E tentar acessar /painel -> Manda para /dashboard
  if (request.nextUrl.pathname === '/painel' && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}