import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PAGES_MODULE } from "../../../modules/pages"
import PagesModuleService from "../../../modules/pages/service"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: PagesModuleService = req.scope.resolve(PAGES_MODULE)
  const limit = Math.min(Number(req.query.limit ?? 100), 500)
  const offset = Number(req.query.offset ?? 0)

  const filters: Record<string, unknown> = {}
  if (req.query.status) filters.status = req.query.status

  const [rows, count] = await service.listAndCountStaticPages(filters, {
    take: limit,
    skip: offset,
    order: { updated_at: "DESC" },
  })

  res.json({ pages: rows, count, limit, offset })
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: PagesModuleService = req.scope.resolve(PAGES_MODULE)
  const body = req.body as Record<string, unknown>

  if (!body.slug || !body.title || !body.body) {
    res.status(400).json({ message: "slug, title, body required" })
    return
  }

  if (body.status === "published" && !body.published_at) {
    body.published_at = new Date()
  }

  const page = await service.createStaticPages(body as any)
  res.status(201).json({ page })
}
