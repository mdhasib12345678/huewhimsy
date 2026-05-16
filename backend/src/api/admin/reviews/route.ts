import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { REVIEWS_MODULE } from "../../../modules/reviews"
import ReviewsModuleService from "../../../modules/reviews/service"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: ReviewsModuleService = req.scope.resolve(REVIEWS_MODULE)
  const limit = Math.min(Number(req.query.limit ?? 100), 500)
  const offset = Number(req.query.offset ?? 0)

  const filters: Record<string, unknown> = {}
  if (req.query.status) filters.status = req.query.status
  if (req.query.product_id) filters.product_id = req.query.product_id

  const [rows, count] = await service.listAndCountProductReviews(filters, {
    take: limit,
    skip: offset,
    order: { created_at: "DESC" },
  })

  res.json({ reviews: rows, count, limit, offset })
}
