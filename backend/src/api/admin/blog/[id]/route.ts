import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BLOG_MODULE } from "../../../../modules/blog"
import BlogModuleService from "../../../../modules/blog/service"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: BlogModuleService = req.scope.resolve(BLOG_MODULE)
  const post = await service.retrieveBlogPost(req.params.id).catch(() => null)
  if (!post) {
    res.status(404).json({ message: "Blog post not found" })
    return
  }
  res.json({ post })
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: BlogModuleService = req.scope.resolve(BLOG_MODULE)
  const update = req.body as Record<string, unknown>

  if (update.status === "published" && !update.published_at) {
    const existing = await service.retrieveBlogPost(req.params.id).catch(() => null)
    if (existing && !existing.published_at) {
      update.published_at = new Date()
    }
  }

  const post = await service.updateBlogPosts({
    id: req.params.id,
    ...update,
  } as any)
  res.json({ post })
}

export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: BlogModuleService = req.scope.resolve(BLOG_MODULE)
  await service.deleteBlogPosts(req.params.id)
  res.json({ id: req.params.id, deleted: true })
}
