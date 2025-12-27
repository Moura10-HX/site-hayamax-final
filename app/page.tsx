import { redirect } from "next/navigation";

export default function Home() {
  // Assim que alguém entrar na raiz, joga para o login
  redirect("/login");
}