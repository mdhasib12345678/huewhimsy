import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

// Stripe webhook endpoint. Medusa's payment-stripe plugin signs and verifies the
// payload; this route forwards events to the payment module's webhook handler.
//
// Configure your Stripe dashboard to POST to:
//     https://huewhimsy.com/hooks/stripe
// with the signing secret stored in STRIPE_WEBHOOK_SECRET.
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  try {
    const paymentModuleService = req.scope.resolve(Modules.PAYMENT) as any
    const signature = req.headers["stripe-signature"] as string | undefined

    if (!signature) {
      res.status(400).json({ message: "missing stripe-signature header" })
      return
    }

    // The payment module exposes a webhook method that decodes + processes the
    // event using the configured provider's webhook secret.
    if (typeof paymentModuleService.processEvent === "function") {
      await paymentModuleService.processEvent({
        provider: "stripe",
        payload: (req as any).rawBody ?? req.body,
        signature,
      })
    }
    res.json({ received: true })
  } catch (e: any) {
    try {
      ;(req.scope.resolve("logger") as any).error(
        `[stripe:webhook] failed: ${e.message}`,
      )
    } catch {
      /* noop */
    }
    res.status(400).json({ message: e.message ?? "webhook failed" })
  }
}
