import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { WISHLIST_MODULE } from "../../../../modules/wishlist"
import WishlistModuleService from "../../../../modules/wishlist/service"

function getCustomerId(req: MedusaRequest): string | null {
  const ctx = (req as any).auth_context as
    | { actor_id?: string; actor_type?: string }
    | undefined
  if (ctx?.actor_type === "customer" && ctx.actor_id) return ctx.actor_id
  return null
}

export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const customerId = getCustomerId(req)
  if (!customerId) {
    res.status(401).json({ message: "Sign in to manage your wishlist" })
    return
  }

  const productId = req.params.product_id
  const service: WishlistModuleService = req.scope.resolve(WISHLIST_MODULE)

  const matches = await service.listWishlistItems(
    { customer_id: customerId, product_id: productId },
    { take: 1 },
  )
  if (!matches.length) {
    res.json({ ok: true, removed: false })
    return
  }

  await service.deleteWishlistItems(matches[0].id)
  res.json({ ok: true, removed: true, id: matches[0].id })
}
