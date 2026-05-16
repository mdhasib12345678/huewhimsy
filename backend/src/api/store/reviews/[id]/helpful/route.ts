import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { REVIEWS_MODULE } from "../../../../../modules/reviews"
import ReviewsModuleService from "../../../../../modules/reviews/service"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: ReviewsModuleService = req.scope.resolve(REVIEWS_MODULE)
  const id = req.params.id

  const review = await service.retrieveProductReview(id).catch(() => null)
  if (!review || review.status !== "approved") {
    res.status(404).json({ message: "Review not found" })
    return
  }

  const updated = await service.updateProductReviews({
    id,
    helpful_count: (review.helpful_count ?? 0) + 1,
  } as any)

  res.json({ id: updated.id, helpful_count: updated.helpful_count })
}
