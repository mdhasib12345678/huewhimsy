import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { WISHLIST_MODULE } from "../../../modules/wishlist"
import WishlistModuleService from "../../../modules/wishlist/service"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: WishlistModuleService = req.scope.resolve(WISHLIST_MODULE)
  const limit = Math.min(Number(req.query.limit ?? 100), 1000)
  const offset = Number(req.query.offset ?? 0)

  const filters: Record<string, unknown> = {}
  if (req.query.customer_id) filters.customer_id = req.query.customer_id
  if (req.query.product_id) filters.product_id = req.query.product_id

  const [rows, count] = await service.listAndCountWishlistItems(filters, {
    take: limit,
    skip: offset,
    order: { added_at: "DESC" },
  })

  res.json({ items: rows, count, limit, offset })
}
