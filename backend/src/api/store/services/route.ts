import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SERVICES_MODULE } from "../../../modules/services"
import ServicesModuleService from "../../../modules/services/service"

function applyTranslation(row: any, locale?: string) {
  if (!locale || locale === "en" || !row?.translations) return row
  const slice = row.translations?.[locale]
  if (!slice) return row
  return {
    ...row,
    name: slice.name ?? row.name,
    short_description: slice.short_description ?? row.short_description,
    description: slice.description ?? row.description,
    meta_title: slice.meta_title ?? row.meta_title,
    meta_description: slice.meta_description ?? row.meta_description,
  }
}

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: ServicesModuleService = req.scope.resolve(SERVICES_MODULE)
  const limit = Math.min(Number(req.query.limit ?? 50), 200)
  const offset = Number(req.query.offset ?? 0)
  const locale = req.query.locale as string | undefined

  const [rows, count] = await service.listAndCountServiceOfferings(
    { status: "published" },
    {
      take: limit,
      skip: offset,
      order: { display_order: "ASC", created_at: "DESC" },
    },
  )

  res.json({
    services: rows.map((r) => applyTranslation(r, locale)),
    count,
    limit,
    offset,
  })
}
