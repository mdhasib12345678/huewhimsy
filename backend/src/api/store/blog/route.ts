import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BLOG_MODULE } from "../../../modules/blog"
import BlogModuleService from "../../../modules/blog/service"

type ListQuery = {
  limit?: string
  offset?: string
  category?: string
  tag?: string
  locale?: string
  q?: string
}

function applyTranslation(post: any, locale?: string) {
  if (!locale || locale === "en" || !post?.translations) return post
  const slice = post.translations?.[locale]
  if (!slice) return post
  return {
    ...post,
    title: slice.title ?? post.title,
    excerpt: slice.excerpt ?? post.excerpt,
    body: slice.body ?? post.body,
    meta_title: slice.meta_title ?? post.meta_title,
    meta_description: slice.meta_description ?? post.meta_description,
  }
}

export async function GET(
  req: MedusaRequest<unknown, ListQuery>,
  res: MedusaResponse,
): Promise<void> {
  const service: BlogModuleService = req.scope.resolve(BLOG_MODULE)
  const limit = Math.min(Number(req.query.limit ?? 20), 100)
  const offset = Number(req.query.offset ?? 0)
  const locale = req.query.locale as string | undefined

  const filters: Record<string, unknown> = { status: "published" }
  if (req.query.category) filters.category = req.query.category

  const [rawPosts, count] = await service.listAndCountBlogPosts(filters, {
    take: limit,
    skip: offset,
    order: { published_at: "DESC" },
  })

  let posts = rawPosts.map((p) => applyTranslation(p, locale))

  if (req.query.q) {
    const q = String(req.query.q).toLowerCase()
    posts = posts.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.excerpt?.toLowerCase().includes(q) ||
        p.body?.toLowerCase().includes(q),
    )
  }

  res.json({ posts, count, limit, offset })
}
