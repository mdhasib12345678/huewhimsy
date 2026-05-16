import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BLOG_MODULE } from "../../../../modules/blog"
import BlogModuleService from "../../../../modules/blog/service"

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
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: BlogModuleService = req.scope.resolve(BLOG_MODULE)
  const slug = req.params.slug
  const locale = req.query.locale as string | undefined

  const matches = await service.listBlogPosts(
    { slug, status: "published" },
    { take: 1 },
  )
  const post = matches[0]

  if (!post) {
    res.status(404).json({ message: "Blog post not found" })
    return
  }

  res.json({ post: applyTranslation(post, locale) })
}
