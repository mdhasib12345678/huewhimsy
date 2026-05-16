import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

// Conditionally build provider lists so missing creds don't crash boot.
// Order: explicit env -> real provider; otherwise leave a tiny no-op so the
// payment / notification / file module loads with at least one provider.

const stripeEnabled =
  !!process.env.STRIPE_SECRET_KEY &&
  !process.env.STRIPE_SECRET_KEY.includes('CHANGE_ME')

const resendEnabled =
  !!process.env.RESEND_API_KEY &&
  !process.env.RESEND_API_KEY.includes('CHANGE_ME')

const r2Enabled =
  !!process.env.S3_ACCESS_KEY_ID &&
  !!process.env.S3_SECRET_ACCESS_KEY &&
  !!process.env.S3_BUCKET &&
  !process.env.S3_ACCESS_KEY_ID.includes('CHANGE_ME')

const paymentProviders: any[] = []
if (stripeEnabled) {
  paymentProviders.push({
    resolve: '@medusajs/medusa/payment-stripe',
    id: 'stripe',
    options: {
      apiKey: process.env.STRIPE_SECRET_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
      automaticPaymentMethods: true,
      paymentDescription: process.env.STRIPE_DESCRIPTION || 'HueWhimsy order',
    },
  })
}

const notificationProviders: any[] = [
  {
    // Always register the Resend provider; if RESEND_API_KEY is missing it
    // logs a dry-run line instead of sending so the module still works.
    resolve: './src/modules/notifications/resend',
    id: 'resend',
    options: {
      channels: ['email'],
      api_key: process.env.RESEND_API_KEY,
      from: process.env.RESEND_FROM_EMAIL || 'HueWhimsy <noreply@huewhimsy.com>',
      reply_to: process.env.RESEND_REPLY_TO,
    },
  },
]

const fileProviders: any[] = []
if (r2Enabled) {
  fileProviders.push({
    resolve: '@medusajs/medusa/file-s3',
    id: 's3',
    options: {
      file_url: process.env.S3_FILE_URL,
      access_key_id: process.env.S3_ACCESS_KEY_ID,
      secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
      region: process.env.S3_REGION || 'auto',
      bucket: process.env.S3_BUCKET,
      endpoint: process.env.S3_ENDPOINT,
      additional_client_config: { forcePathStyle: true },
    },
  })
}

const baseModules: any[] = [
  {
    resolve: '@medusajs/medusa/cache-redis',
    options: { redisUrl: process.env.REDIS_URL },
  },
  {
    resolve: '@medusajs/medusa/event-bus-redis',
    options: { redisUrl: process.env.REDIS_URL },
  },
  {
    resolve: '@medusajs/medusa/workflow-engine-redis',
    options: { redis: { url: process.env.REDIS_URL } },
  },
  {
    resolve: '@medusajs/medusa/notification',
    options: { providers: notificationProviders },
  },
]

if (paymentProviders.length) {
  baseModules.push({
    resolve: '@medusajs/medusa/payment',
    options: { providers: paymentProviders },
  })
}

if (fileProviders.length) {
  baseModules.push({
    resolve: '@medusajs/medusa/file',
    options: { providers: fileProviders },
  })
}

const customModules: any[] = [
  './src/modules/blog',
  './src/modules/endorsements',
  './src/modules/faq',
  './src/modules/hero',
  './src/modules/services',
  './src/modules/activities',
  './src/modules/newsletter',
  './src/modules/contact',
  './src/modules/wishlist',
  './src/modules/reviews',
  './src/modules/pages',
].map((p) => ({ resolve: p }))

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    databaseDriverOptions: {
      connection: { ssl: false },
      pool: {
        min: 2,
        max: 20,
        acquireTimeoutMillis: 120000,
        idleTimeoutMillis: 30000,
        createTimeoutMillis: 30000,
      },
    },
    redisUrl: process.env.REDIS_URL,
    workerMode: (process.env.MEDUSA_WORKER_MODE as 'shared' | 'worker' | 'server') || 'shared',
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || 'supersecret',
      cookieSecret: process.env.COOKIE_SECRET || 'supersecret',
    },
  },
  admin: {
    path: '/studio',
    disable: false,
  },
  modules: [...baseModules, ...customModules],
})
