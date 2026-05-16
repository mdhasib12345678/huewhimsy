import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { REVIEWS_MODULE } from "../../../../modules/reviews"
import ReviewsModuleService from "../../../../modules/reviews/service"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: ReviewsModuleService = req.scope.resolve(REVIEWS_MODULE)
  const review = await service
    .retrieveProductReview(req.params.id)
    .catch(() => null)
  if (!review) {
    res.status(404).json({ message: "Review not found" })
    return
  }
  res.json({ review })
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: ReviewsModuleService = req.scope.resolve(REVIEWS_MODULE)
  const update = req.body as Record<string, unknown>

  if (update.reply !== undefined && !update.reply_at) {
    update.reply_at = update.reply ? new Date() : null
  }

  const review = await service.updateProductReviews({
    id: req.params.id,
    ...update,
  } as any)
  res.json({ review })
}

export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: ReviewsModuleService = req.scope.resolve(REVIEWS_MODULE)
  await service.deleteProductReviews(req.params.id)
  res.json({ id: req.params.id, deleted: true })
}
