import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PAGES_MODULE } from "../../../../modules/pages"
import PagesModuleService from "../../../../modules/pages/service"

function applyTranslation(row: any, locale?: string) {
  if (!locale || locale === "en" || !row?.translations) return row
  const slice = row.translations?.[locale]
  if (!slice) return row
  return {
    ...row,
    title: slice.title ?? row.title,
    body: slice.body ?? row.body,
    excerpt: slice.excerpt ?? row.excerpt,
    meta_title: slice.meta_title ?? row.meta_title,
    meta_description: slice.meta_description ?? row.meta_description,
  }
}

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: PagesModuleService = req.scope.resolve(PAGES_MODULE)
  const slug = req.params.slug
  const locale = req.query.locale as string | undefined

  const matches = await service.listStaticPages(
    { slug, status: "published" },
    { take: 1 },
  )
  const page = matches[0]

  if (!page) {
    res.status(404).json({ message: "Page not found" })
    return
  }

  res.json({ page: applyTranslation(page, locale) })
}
