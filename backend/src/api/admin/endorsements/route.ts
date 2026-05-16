import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ENDORSEMENTS_MODULE } from "../../../modules/endorsements"
import EndorsementsModuleService from "../../../modules/endorsements/service"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: EndorsementsModuleService = req.scope.resolve(ENDORSEMENTS_MODULE)
  const limit = Math.min(Number(req.query.limit ?? 100), 500)
  const offset = Number(req.query.offset ?? 0)

  const filters: Record<string, unknown> = {}
  if (req.query.status) filters.status = req.query.status

  const [rows, count] = await service.listAndCountEndorsements(filters, {
    take: limit,
    skip: offset,
    order: { display_order: "ASC", created_at: "DESC" },
  })

  res.json({ endorsements: rows, count, limit, offset })
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: EndorsementsModuleService = req.scope.resolve(ENDORSEMENTS_MODULE)
  const body = req.body as Record<string, unknown>

  if (!body.name || !body.quote) {
    res.status(400).json({ message: "name, quote are required" })
    return
  }

  if (body.rating !== undefined && body.rating !== null) {
    const r = Number(body.rating)
    if (!Number.isFinite(r) || r < 1 || r > 5) {
      res.status(400).json({ message: "rating must be between 1 and 5" })
      return
    }
    body.rating = r
  }

  const endorsement = await service.createEndorsements(body as any)
  res.status(201).json({ endorsement })
}
