import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { REVIEWS_MODULE } from "../../../modules/reviews"
import ReviewsModuleService from "../../../modules/reviews/service"

function getCustomerId(req: MedusaRequest): string | null {
  const ctx = (req as any).auth_context as
    | { actor_id?: string; actor_type?: string }
    | undefined
  if (ctx?.actor_type === "customer" && ctx.actor_id) return ctx.actor_id
  return null
}

function isValidEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 320
}

function summarize(rows: any[]) {
  if (!rows.length) {
    return { count: 0, average: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }
  }
  const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  let total = 0
  for (const r of rows) {
    dist[r.rating] = (dist[r.rating] ?? 0) + 1
    total += r.rating
  }
  return {
    count: rows.length,
    average: Math.round((total / rows.length) * 10) / 10,
    distribution: dist,
  }
}

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: ReviewsModuleService = req.scope.resolve(REVIEWS_MODULE)
  const productId = req.query.product_id as string | undefined
  const limit = Math.min(Number(req.query.limit ?? 50), 200)
  const offset = Number(req.query.offset ?? 0)

  if (!productId) {
    res.status(400).json({ message: "product_id query param required" })
    return
  }

  // Get a stats snapshot from all approved reviews for this product.
  const allApproved = await service.listProductReviews(
    { product_id: productId, status: "approved" },
    { take: 10000 },
  )
  const summary = summarize(allApproved)

  // Then return the paginated slice for rendering.
  const [rows] = await service.listAndCountProductReviews(
    { product_id: productId, status: "approved" },
    {
      take: limit,
      skip: offset,
      order: { created_at: "DESC" },
    },
  )

  // Strip email/ip from public payload.
  const safe = rows.map((r) => {
    const { author_email, ip_address, ...rest } = r as any
    return rest
  })

  res.json({ reviews: safe, summary, limit, offset })
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: ReviewsModuleService = req.scope.resolve(REVIEWS_MODULE)
  const body = (req.body ?? {}) as Record<string, unknown>

  const productId = body.product_id ? String(body.product_id) : null
  const authorName = String(body.author_name ?? "").trim().slice(0, 200)
  const authorEmail = body.author_email
    ? String(body.author_email).trim().toLowerCase()
    : null
  const rating = Number(body.rating)
  const title = body.title ? String(body.title).trim().slice(0, 200) : null
  const reviewBody = String(body.body ?? "").trim()

  if (!productId) {
    res.status(400).json({ message: "product_id required" })
    return
  }
  if (!authorName) {
    res.status(400).json({ message: "author_name required" })
    return
  }
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    res.status(400).json({ message: "rating must be between 1 and 5" })
    return
  }
  if (!reviewBody || reviewBody.length < 10 || reviewBody.length > 5000) {
    res.status(400).json({ message: "body must be 10-5000 chars" })
    return
  }
  if (authorEmail && !isValidEmail(authorEmail)) {
    res.status(400).json({ message: "author_email is not valid" })
    return
  }

  const customerId = getCustomerId(req)

  // Reject duplicates from same logged-in customer.
  if (customerId) {
    const existing = await service.listProductReviews(
      { customer_id: customerId, product_id: productId },
      { take: 1 },
    )
    if (existing.length) {
      res
        .status(409)
        .json({ message: "You already reviewed this product" })
      return
    }
  }

  const ip =
    (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    null

  const review = await service.createProductReviews({
    product_id: productId,
    customer_id: customerId,
    author_name: authorName,
    author_email: authorEmail,
    rating: Math.round(rating),
    title,
    body: reviewBody,
    ip_address: ip,
  } as any)

  res.status(201).json({ review, pending_moderation: true })
}
