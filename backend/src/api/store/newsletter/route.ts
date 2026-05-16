import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { NEWSLETTER_MODULE } from "../../../modules/newsletter"
import NewsletterModuleService from "../../../modules/newsletter/service"

function isValidEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 320
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: NewsletterModuleService = req.scope.resolve(NEWSLETTER_MODULE)
  const body = (req.body ?? {}) as Record<string, unknown>

  const email = String(body.email ?? "").trim().toLowerCase()
  const name = body.name ? String(body.name).trim().slice(0, 200) : null
  const source = body.source ? String(body.source).slice(0, 80) : null
  const locale = body.locale ? String(body.locale).slice(0, 12) : "en"
  const tags = Array.isArray(body.tags) ? body.tags : null

  if (!isValidEmail(email)) {
    res.status(400).json({ message: "A valid email is required" })
    return
  }

  // Idempotent: if email exists already, return success without overwriting.
  const existing = await service.listNewsletterSubscribers(
    { email },
    { take: 1 },
  )
  if (existing.length) {
    const sub = existing[0]
    if (sub.status === "unsubscribed") {
      // re-subscribe path
      const updated = await service.updateNewsletterSubscribers({
        id: sub.id,
        status: "pending",
        unsubscribed_at: null,
        source: source ?? sub.source,
        locale: locale ?? sub.locale,
      } as any)
      res.status(200).json({ subscriber: updated, resubscribed: true })
      return
    }
    res.status(200).json({ subscriber: sub, already_subscribed: true })
    return
  }

  const ip =
    (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    null
  const ua = (req.headers["user-agent"] as string | undefined) ?? null

  const sub = await service.createNewsletterSubscribers({
    email,
    name,
    source,
    locale,
    tags,
    ip_address: ip,
    user_agent: ua,
  } as any)

  res.status(201).json({ subscriber: sub })
}
