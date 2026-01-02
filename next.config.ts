import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // --- CORREÇÃO DE ROTA 404 ---
  // Redireciona permanentemente qualquer acesso a /login ou /acesso para a raiz
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/',
        permanent: true, // Avisa o navegador/cache que a mudança é definitiva
      },
      {
        source: '/acesso',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
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
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  // Removido o bloco 'webpack' incorreto que estava dentro do segundo argumento do withSentryConfig.
  // As opções automáticas do Sentry já lidam com isso.
  // Se precisar de config específica do webpack, ela deve ir dentro do nextConfig, não aqui.
  
  // Habilita monitoramento automático de Cron Jobs da Vercel
  automaticVercelMonitors: true,
})