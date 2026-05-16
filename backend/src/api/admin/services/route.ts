import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SERVICES_MODULE } from "../../../modules/services"
import ServicesModuleService from "../../../modules/services/service"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: ServicesModuleService = req.scope.resolve(SERVICES_MODULE)
  const limit = Math.min(Number(req.query.limit ?? 100), 500)
  const offset = Number(req.query.offset ?? 0)

  const filters: Record<string, unknown> = {}
  if (req.query.status) filters.status = req.query.status

  const [rows, count] = await service.listAndCountServiceOfferings(filters, {
    take: limit,
    skip: offset,
    order: { display_order: "ASC", created_at: "DESC" },
  })

  res.json({ services: rows, count, limit, offset })
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: ServicesModuleService = req.scope.resolve(SERVICES_MODULE)
  const body = req.body as Record<string, unknown>

  if (!body.slug || !body.name || !body.description) {
    res.status(400).json({ message: "slug, name, description are required" })
    return
  }

  const offering = await service.createServiceOfferings(body as any)
  res.status(201).json({ service: offering })
}
