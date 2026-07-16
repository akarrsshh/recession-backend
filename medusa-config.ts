import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

// The server's own public URL. Railway auto-populates RAILWAY_PUBLIC_DOMAIN
// on every service; fall back to a manually-set MEDUSA_BACKEND_URL if
// running elsewhere. Ultimate fallback is localhost for dev.
const backendUrl =
  process.env.MEDUSA_BACKEND_URL ||
  (process.env.RAILWAY_PUBLIC_DOMAIN
    ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
    : 'http://localhost:9000')

// File storage — @medusajs/file-local ships with Medusa 2 and is the
// dev/starter provider. Its `backend_url` OPTION (not env var) is what
// determines the URL prefix Medusa returns for uploaded images. Without
// setting it explicitly, it defaults to http://localhost:9000/static
// which breaks image loading in the admin UI and storefront.
//
// The provider writes to <cwd>/static — because start runs from
// .medusa/server, that resolves to /app/.medusa/server/static. Mount a
// Railway volume there to persist uploads across deploys (see project
// memory).
const fileModule = {
  resolve: '@medusajs/medusa/file',
  options: {
    providers: [
      {
        resolve: '@medusajs/file-local',
        id: 'local',
        options: {
          upload_dir: 'static',
          backend_url: `${backendUrl}/static`,
        },
      },
    ],
  },
}

// Stripe is only loaded when its API key is present. Deploying without
// Stripe (e.g. a demo on Railway before Stripe is set up) shouldn't crash
// the whole backend; checkout just won't offer a card option until the
// keys land.
const stripeConfigured = !!process.env.STRIPE_API_KEY
const paymentModules = stripeConfigured
  ? [
      {
        resolve: '@medusajs/medusa/payment',
        options: {
          providers: [
            {
              resolve: '@medusajs/medusa/payment-stripe',
              id: 'stripe',
              options: {
                apiKey: process.env.STRIPE_API_KEY,
                webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
              },
            },
          ],
        },
      },
    ]
  : []

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || 'supersecret',
      cookieSecret: process.env.COOKIE_SECRET || 'supersecret',
    },
  },
  modules: [fileModule, ...paymentModules],
})
