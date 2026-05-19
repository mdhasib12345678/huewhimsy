import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

// Admin: list every registered payment provider in this Medusa instance,
// along with environment-derived configuration hints (whether Stripe is wired,
// whether the webhook secret is set, etc). Used by the custom "Payments"
// settings page so the operator can see at a glance which gateways are live.
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const paymentService = req.scope.resolve(Modules.PAYMENT) as any

  let providers: { id: string; is_enabled: boolean }[] = []
  try {
    if (typeof paymentService.listPaymentProviders === "function") {
      const rows = await paymentService.listPaymentProviders({})
      providers = (rows ?? []).map((p: any) => ({
        id: p.id,
        is_enabled: p.is_enabled !== false,
      }))
    }
  } catch (e: any) {
    try {
      ;(req.scope.resolve("logger") as any).error(
        `[admin:payments] list failed: ${e.message}`,
      )
    } catch {
      /* noop */
    }
  }

  const stripeConfigured =
    !!process.env.STRIPE_SECRET_KEY &&
    !process.env.STRIPE_SECRET_KEY.includes("CHANGE_ME")
  const stripeWebhookConfigured =
    !!process.env.STRIPE_WEBHOOK_SECRET &&
    !process.env.STRIPE_WEBHOOK_SECRET.includes("CHANGE_ME")

  res.json({
    providers,
    config: {
      stripe: {
        configured: stripeConfigured,
        webhook_configured: stripeWebhookConfigured,
        publishable_key_present: !!process.env.STRIPE_PUBLISHABLE_KEY,
      },
      currencies: (process.env.STORE_CURRENCIES ?? "usd")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean),
    },
    docs: {
      stripe_dashboard: "https://dashboard.stripe.com/apikeys",
      stripe_webhook_url: "/hooks/stripe",
      regions_admin_url: "/app/settings/regions",
    },
  })
}
