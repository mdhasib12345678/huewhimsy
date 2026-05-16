import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CONTACT_MODULE } from "../../../modules/contact"
import ContactModuleService from "../../../modules/contact/service"

function isValidEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 320
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: ContactModuleService = req.scope.resolve(CONTACT_MODULE)
  const body = (req.body ?? {}) as Record<string, unknown>

  const name = String(body.name ?? "").trim().slice(0, 200)
  const email = String(body.email ?? "").trim().toLowerCase()
  const phone = body.phone ? String(body.phone).trim().slice(0, 50) : null
  const subject = body.subject ? String(body.subject).trim().slice(0, 200) : null
  const message = String(body.message ?? "").trim()
  const page_url = body.page_url ? String(body.page_url).slice(0, 500) : null
  const locale = body.locale ? String(body.locale).slice(0, 12) : null

  if (!name) {
    res.status(400).json({ message: "name is required" })
    return
  }
  if (!isValidEmail(email)) {
    res.status(400).json({ message: "a valid email is required" })
    return
  }
  if (!message || message.length < 10 || message.length > 5000) {
    res
      .status(400)
      .json({ message: "message must be 10-5000 characters" })
    return
  }

  const ip =
    (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    null
  const ua = (req.headers["user-agent"] as string | undefined) ?? null

  // Basic spam heuristic: too many links, too many uppercase chars.
  const linkCount = (message.match(/https?:\/\//gi) ?? []).length
  const upperRatio =
    message.length > 50
      ? (message.match(/[A-Z]/g) ?? []).length / message.length
      : 0
  const looksLikeSpam = linkCount > 4 || upperRatio > 0.7

  const submission = await service.createContactSubmissions({
    name,
    email,
    phone,
    subject,
    message,
    page_url,
    locale,
    ip_address: ip,
    user_agent: ua,
    status: looksLikeSpam ? "spam" : "new",
  } as any)

  res.status(201).json({ submission, received: true })
}
