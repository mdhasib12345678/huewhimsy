import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ACTIVITIES_MODULE } from "../../../modules/activities"
import ActivitiesModuleService from "../../../modules/activities/service"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: ActivitiesModuleService = req.scope.resolve(ACTIVITIES_MODULE)
  const limit = Math.min(Number(req.query.limit ?? 100), 500)
  const offset = Number(req.query.offset ?? 0)

  const filters: Record<string, unknown> = {}
  if (req.query.status) filters.status = req.query.status
  if (req.query.category) filters.category = req.query.category

  const [rows, count] = await service.listAndCountActivities(filters, {
    take: limit,
    skip: offset,
    order: { display_order: "ASC", created_at: "DESC" },
  })

  res.json({ activities: rows, count, limit, offset })
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: ActivitiesModuleService = req.scope.resolve(ACTIVITIES_MODULE)
  const body = req.body as Record<string, unknown>

  if (!body.slug || !body.title) {
    res.status(400).json({ message: "slug, title are required" })
    return
  }

  if (body.pages !== undefined && body.pages !== null) {
    body.pages = Number(body.pages)
  }

  const activity = await service.createActivities(body as any)
  res.status(201).json({ activity })
}
