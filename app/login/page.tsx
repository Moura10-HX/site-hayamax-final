import { redirect } from 'next/navigation'

export default function LoginPage() {
  // O "Trampolim": Recebe quem caiu aqui por engano e joga para a Home
   redirect('https://www.lenteshayamax.com.br')
}