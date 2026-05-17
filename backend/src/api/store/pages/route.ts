import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PAGES_MODULE } from "../../../modules/pages"
import PagesModuleService from "../../../modules/pages/service"

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
  const limit = Math.min(Number(req.query.limit ?? 50), 200)
  const offset = Number(req.query.offset ?? 0)
  const locale = req.query.locale as string | undefined

  const [rows, count] = await service.listAndCountStaticPages(
    { status: "published" },
    {
      take: limit,
      skip: offset,
      order: { published_at: "DESC" },
    },
  )

  res.json({
    pages: rows.map((r) => applyTranslation(r, locale)),
    count,
    limit,
    offset,
  })
}
