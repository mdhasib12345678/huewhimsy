import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SERVICES_MODULE } from "../../../../modules/services"
import ServicesModuleService from "../../../../modules/services/service"

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
  const slug = req.params.slug
  const locale = req.query.locale as string | undefined

  const matches = await service.listServiceOfferings(
    { slug, status: "published" },
    { take: 1 },
  )
  const row = matches[0]

  if (!row) {
    res.status(404).json({ message: "Service not found" })
    return
  }

  res.json({ service: applyTranslation(row, locale) })
}
