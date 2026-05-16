import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ACTIVITIES_MODULE } from "../../../modules/activities"
import ActivitiesModuleService from "../../../modules/activities/service"

function applyTranslation(row: any, locale?: string) {
  if (!locale || locale === "en" || !row?.translations) return row
  const slice = row.translations?.[locale]
  if (!slice) return row
  return {
    ...row,
    title: slice.title ?? row.title,
    description: slice.description ?? row.description,
    meta_title: slice.meta_title ?? row.meta_title,
    meta_description: slice.meta_description ?? row.meta_description,
  }
}

function stripGatedFields(row: any) {
  // Hide file_url for gated/subscription-only activities in the list endpoint.
  // The dedicated /store/activities/:slug/download endpoint will check auth.
  if (row?.requires_subscription) {
    const { file_url, ...rest } = row
    return rest
  }
  return row
}

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: ActivitiesModuleService = req.scope.resolve(ACTIVITIES_MODULE)
  const limit = Math.min(Number(req.query.limit ?? 50), 200)
  const offset = Number(req.query.offset ?? 0)
  const locale = req.query.locale as string | undefined
  const category = req.query.category as string | undefined

  const filters: Record<string, unknown> = { status: "published" }
  if (category) filters.category = category

  const [rows, count] = await service.listAndCountActivities(filters, {
    take: limit,
    skip: offset,
    order: { display_order: "ASC", created_at: "DESC" },
  })

  res.json({
    activities: rows
      .map((r) => applyTranslation(r, locale))
      .map(stripGatedFields),
    count,
    limit,
    offset,
  })
}
