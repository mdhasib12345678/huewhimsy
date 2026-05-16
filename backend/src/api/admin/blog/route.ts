import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BLOG_MODULE } from "../../../modules/blog"
import BlogModuleService from "../../../modules/blog/service"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: BlogModuleService = req.scope.resolve(BLOG_MODULE)
  const limit = Math.min(Number(req.query.limit ?? 50), 200)
  const offset = Number(req.query.offset ?? 0)

  const filters: Record<string, unknown> = {}
  if (req.query.status) filters.status = req.query.status
  if (req.query.category) filters.category = req.query.category

  const [posts, count] = await service.listAndCountBlogPosts(filters, {
    take: limit,
    skip: offset,
    order: { created_at: "DESC" },
  })

  res.json({ posts, count, limit, offset })
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: BlogModuleService = req.scope.resolve(BLOG_MODULE)
  const body = req.body as Record<string, unknown>

  if (!body.slug || !body.title || !body.body) {
    res.status(400).json({ message: "slug, title, body are required" })
    return
  }

  if (body.status === "published" && !body.published_at) {
    body.published_at = new Date()
  }

  const post = await service.createBlogPosts(body as any)
  res.status(201).json({ post })
}
