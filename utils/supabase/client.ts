import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Vamos imprimir no console do navegador o que o código está enxergando
  console.log('URL SUPABASE:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('KEY SUPABASE:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}