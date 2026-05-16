import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { TESTIMONIALS_MODULE } from "../../../modules/testimonials"
import TestimonialsModuleService from "../../../modules/testimonials/service"

function applyTranslation(row: any, locale?: string) {
  if (!locale || locale === "en" || !row?.translations) return row
  const slice = row.translations?.[locale]
  if (!slice) return row
  return {
    ...row,
    name: slice.name ?? row.name,
    role: slice.role ?? row.role,
    quote: slice.quote ?? row.quote,
    location: slice.location ?? row.location,
  }
}

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: TestimonialsModuleService = req.scope.resolve(TESTIMONIALS_MODULE)
  const limit = Math.min(Number(req.query.limit ?? 20), 100)
  const offset = Number(req.query.offset ?? 0)
  const locale = req.query.locale as string | undefined

  const [rows, count] = await service.listAndCountTestimonials(
    { status: "published" },
    {
      take: limit,
      skip: offset,
      order: { display_order: "ASC", created_at: "DESC" },
    },
  )

  res.json({
    testimonials: rows.map((r) => applyTranslation(r, locale)),
    count,
    limit,
    offset,
  })
}
