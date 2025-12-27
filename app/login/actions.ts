'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function login(formData: FormData) {
  // --- CORREÇÃO AQUI: Adicionamos 'await' ---
  const cookieStore = await cookies()
  
  // Suas chaves (Idealmente deveriam estar no .env.local, mas mantive aqui para facilitar seu teste)
  const supabaseUrl = "https://pevafhjxkuvpjhusbhjk.supabase.co"
  const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBldmFmaGp4a3V2cGpodXNiaGprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3Njg0ODksImV4cCI6MjA4MjM0NDQ4OX0.b9JN5EygTWxSYk7491Z5Fe5aQyrJWatGxxMBYnOE92k"

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Ignora erros de escrita de cookie em Server Components
        }
      },
    },
  })

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return redirect('/login?message=Credenciais inválidas. Tente novamente.')
  }

  revalidatePath('/dashboard', 'layout')
  redirect('/dashboard')
}