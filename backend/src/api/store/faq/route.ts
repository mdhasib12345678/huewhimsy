import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { FAQ_MODULE } from "../../../modules/faq"
import FaqModuleService from "../../../modules/faq/service"

function applyTranslation(row: any, locale?: string) {
  if (!locale || locale === "en" || !row?.translations) return row
  const slice = row.translations?.[locale]
  if (!slice) return row
  return {
    ...row,
    question: slice.question ?? row.question,
    answer: slice.answer ?? row.answer,
  }
}

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: FaqModuleService = req.scope.resolve(FAQ_MODULE)
  const limit = Math.min(Number(req.query.limit ?? 50), 200)
  const offset = Number(req.query.offset ?? 0)
  const locale = req.query.locale as string | undefined

  const filters: Record<string, unknown> = { status: "published" }
  if (req.query.category) filters.category = req.query.category

  const [rows, count] = await service.listAndCountFaqEntries(filters, {
    take: limit,
    skip: offset,
    order: { display_order: "ASC", created_at: "DESC" },
  })

  res.json({
    faqs: rows.map((r) => applyTranslation(r, locale)),
    count,
    limit,
    offset,
  })
}
