import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { WISHLIST_MODULE } from "../../../modules/wishlist"
import WishlistModuleService from "../../../modules/wishlist/service"

function getCustomerId(req: MedusaRequest): string | null {
  // Medusa v2 places authenticated actor info under auth_context on /store routes.
  const ctx = (req as any).auth_context as
    | { actor_id?: string; actor_type?: string }
    | undefined
  if (ctx?.actor_type === "customer" && ctx.actor_id) return ctx.actor_id
  return null
}

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const customerId = getCustomerId(req)
  if (!customerId) {
    res.status(401).json({ message: "Sign in to view your wishlist" })
    return
  }

  const service: WishlistModuleService = req.scope.resolve(WISHLIST_MODULE)
  const [items, count] = await service.listAndCountWishlistItems(
    { customer_id: customerId },
    { order: { added_at: "DESC" }, take: 500 },
  )

  res.json({ items, count })
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const customerId = getCustomerId(req)
  if (!customerId) {
    res.status(401).json({ message: "Sign in to manage your wishlist" })
    return
  }

  const body = (req.body ?? {}) as Record<string, unknown>
  const productId = body.product_id ? String(body.product_id) : null
  const variantId = body.variant_id ? String(body.variant_id) : null
  const notes = body.notes ? String(body.notes).slice(0, 500) : null

  if (!productId) {
    res.status(400).json({ message: "product_id is required" })
    return
  }

  const service: WishlistModuleService = req.scope.resolve(WISHLIST_MODULE)

  const existing = await service.listWishlistItems(
    { customer_id: customerId, product_id: productId },
    { take: 1 },
  )
  if (existing.length) {
    res.status(200).json({ item: existing[0], already_in_wishlist: true })
    return
  }

  const item = await service.createWishlistItems({
    customer_id: customerId,
    product_id: productId,
    variant_id: variantId,
    notes,
    added_at: new Date(),
  } as any)

  res.status(201).json({ item })
}
