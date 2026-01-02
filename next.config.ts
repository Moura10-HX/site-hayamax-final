import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* 
     REMOVIDO REDIRECTS TEMPORARIAMENTE
     Para evitar conflito de "Too many redirects" ou Loop com o Middleware.
     A prioridade agora é o site subir.
  */
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
  tunnelRoute: "/monitoring",
  
  // Habilita monitoramento automático de Cron Jobs da Vercel
  automaticVercelMonitors: true,
});