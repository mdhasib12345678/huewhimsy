import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { NEWSLETTER_MODULE } from "../../../modules/newsletter"
import NewsletterModuleService from "../../../modules/newsletter/service"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: NewsletterModuleService = req.scope.resolve(NEWSLETTER_MODULE)
  const limit = Math.min(Number(req.query.limit ?? 100), 1000)
  const offset = Number(req.query.offset ?? 0)
  const format = (req.query.format as string | undefined) ?? "json"

  const filters: Record<string, unknown> = {}
  if (req.query.status) filters.status = req.query.status
  if (req.query.source) filters.source = req.query.source

  const [rows, count] = await service.listAndCountNewsletterSubscribers(
    filters,
    {
      take: format === "csv" ? 10000 : limit,
      skip: format === "csv" ? 0 : offset,
      order: { created_at: "DESC" },
    },
  )

  if (format === "csv") {
    const header = [
      "email",
      "name",
      "locale",
      "source",
      "status",
      "confirmed_at",
      "unsubscribed_at",
      "created_at",
    ].join(",")
    const lines = rows.map((r: any) =>
      [
        r.email,
        (r.name ?? "").replace(/"/g, '""'),
        r.locale ?? "",
        r.source ?? "",
        r.status,
        r.confirmed_at ?? "",
        r.unsubscribed_at ?? "",
        r.created_at,
      ]
        .map((v) => (typeof v === "string" && v.includes(",") ? `"${v}"` : v))
        .join(","),
    )
    res.setHeader("Content-Type", "text/csv; charset=utf-8")
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
    )
    res.send([header, ...lines].join("\n"))
    return
  }

  res.json({ subscribers: rows, count, limit, offset })
}
