import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { NEWSLETTER_MODULE } from "../../../../modules/newsletter"
import NewsletterModuleService from "../../../../modules/newsletter/service"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: NewsletterModuleService = req.scope.resolve(NEWSLETTER_MODULE)
  const sub = await service.retrieveNewsletterSubscriber(req.params.id).catch(() => null)
  if (!sub) {
    res.status(404).json({ message: "Subscriber not found" })
    return
  }
  res.json({ subscriber: sub })
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: NewsletterModuleService = req.scope.resolve(NEWSLETTER_MODULE)
  const update = req.body as Record<string, unknown>

  if (update.status === "confirmed" && !update.confirmed_at) {
    update.confirmed_at = new Date()
  }
  if (update.status === "unsubscribed" && !update.unsubscribed_at) {
    update.unsubscribed_at = new Date()
  }

  const sub = await service.updateNewsletterSubscribers({
    id: req.params.id,
    ...update,
  } as any)
  res.json({ subscriber: sub })
}

export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: NewsletterModuleService = req.scope.resolve(NEWSLETTER_MODULE)
  await service.deleteNewsletterSubscribers(req.params.id)
  res.json({ id: req.params.id, deleted: true })
}
