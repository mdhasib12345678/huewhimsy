import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { HERO_MODULE } from "../../../modules/hero"
import HeroModuleService from "../../../modules/hero/service"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: HeroModuleService = req.scope.resolve(HERO_MODULE)
  const limit = Math.min(Number(req.query.limit ?? 100), 500)
  const offset = Number(req.query.offset ?? 0)

  const filters: Record<string, unknown> = {}
  if (req.query.status) filters.status = req.query.status
  if (req.query.placement) filters.placement = req.query.placement

  const [rows, count] = await service.listAndCountHeroBanners(filters, {
    take: limit,
    skip: offset,
    order: { placement: "ASC", display_order: "ASC", created_at: "DESC" },
  })

  res.json({ banners: rows, count, limit, offset })
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: HeroModuleService = req.scope.resolve(HERO_MODULE)
  const body = req.body as Record<string, unknown>

  if (!body.placement || !body.title) {
    res.status(400).json({ message: "placement, title are required" })
    return
  }

  const banner = await service.createHeroBanners(body as any)
  res.status(201).json({ banner })
}
