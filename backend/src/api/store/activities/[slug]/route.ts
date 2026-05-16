import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ACTIVITIES_MODULE } from "../../../../modules/activities"
import ActivitiesModuleService from "../../../../modules/activities/service"

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

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: ActivitiesModuleService = req.scope.resolve(ACTIVITIES_MODULE)
  const slug = req.params.slug
  const locale = req.query.locale as string | undefined

  const matches = await service.listActivities(
    { slug, status: "published" },
    { take: 1 },
  )
  const row = matches[0]

  if (!row) {
    res.status(404).json({ message: "Activity not found" })
    return
  }

  const translated = applyTranslation(row, locale)

  // Strip file_url from default response if gated. The frontend should call
  // a future /download endpoint with subscription proof to get a signed URL.
  if (translated.requires_subscription) {
    const { file_url, ...safe } = translated
    res.json({ activity: { ...safe, download_gated: true } })
    return
  }

  res.json({ activity: translated })
}
