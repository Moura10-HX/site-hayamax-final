import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // --- SEGURANÇA CIBERNÉTICA (HARDENING) ---

  // 1. Ocultação de Tecnologia (Security through Obscurity)
  // Remove o header 'X-Powered-By: Next.js'.
  // Motivo: Dificulta a fase de reconhecimento (Reconnaissance) de atacantes
  // que buscam versões específicas do framework com vulnerabilidades conhecidas.
  poweredByHeader: false,

  // 2. Estabilidade e Qualidade de Código
  // Força boas práticas do React, evitando memory leaks e componentes instáveis
  // que poderiam ser explorados para causar travamentos (DoS).
  reactStrictMode: true,

  // 3. Proteção de Ativos (Images)
  // Restringe de onde seu servidor aceita processar imagens.
  // Isso evita que atacantes usem seu servidor como proxy para redimensionar
  // imagens maliciosas ou pesadas (Ataque de Negação de Serviço / DoS).
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co', // Permite apenas seu bucket do Supabase
      },
      // Adicione outros domínios confiáveis aqui se necessário
    ],
    // Bloqueia injeção de scripts maliciosos via arquivos SVG (XSS)
    dangerouslyAllowSVG: false,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default withSentryConfig(nextConfig, {
  // --- CONFIGURAÇÃO DO SENTRY (MANTIDA INTACTA) ---
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "opticom-42",
  project: "hayamax-backend-app",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  tunnelRoute: "/monitoring",
  
  // Habilita monitoramento automático de Cron Jobs da Vercel
  automaticVercelMonitors: true,
});