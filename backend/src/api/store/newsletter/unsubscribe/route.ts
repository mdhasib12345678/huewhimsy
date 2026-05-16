import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { NEWSLETTER_MODULE } from "../../../../modules/newsletter"
import NewsletterModuleService from "../../../../modules/newsletter/service"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: NewsletterModuleService = req.scope.resolve(NEWSLETTER_MODULE)
  const body = (req.body ?? {}) as Record<string, unknown>
  const email = String(body.email ?? "").trim().toLowerCase()

  if (!email) {
    res.status(400).json({ message: "email required" })
    return
  }

  const matches = await service.listNewsletterSubscribers({ email }, { take: 1 })
  if (!matches.length) {
    // Always return success to prevent enumeration.
    res.json({ ok: true })
    return
  }

  await service.updateNewsletterSubscribers({
    id: matches[0].id,
    status: "unsubscribed",
    unsubscribed_at: new Date(),
  } as any)

  res.json({ ok: true })
}
