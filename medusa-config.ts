import { loadEnv, defineConfig, Modules } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

// The server's own public URL. Railway auto-populates RAILWAY_PUBLIC_DOMAIN
// on every service; fall back to a manually-set MEDUSA_BACKEND_URL if
// running elsewhere. Ultimate fallback is localhost for dev.
const backendUrl =
  process.env.MEDUSA_BACKEND_URL ||
  (process.env.RAILWAY_PUBLIC_DOMAIN
    ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
    : 'http://localhost:9000')

// File storage — explicit local provider so we control the backend_url used
// when composing image URLs. Without this, Medusa's default provider
// hard-codes localhost:9000 and the admin UI / storefront get broken
// image links.
//
// Uploads land in .medusa/server/static. On Railway, mount a persistent
// volume at /app/.medusa/server/static so files survive redeploys —
// otherwise every deploy wipes them. See project memory for the ops step.
const fileModule = {
  resolve: '@medusajs/medusa/file',
  options: {
    providers: [
      {
        resolve: '@medusajs/medusa/file-local-next',
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
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  modules: [fileModule, ...paymentModules],
})
