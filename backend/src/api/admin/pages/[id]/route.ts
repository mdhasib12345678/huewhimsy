import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PAGES_MODULE } from "../../../../modules/pages"
import PagesModuleService from "../../../../modules/pages/service"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: PagesModuleService = req.scope.resolve(PAGES_MODULE)
  const page = await service.retrieveStaticPage(req.params.id).catch(() => null)
  if (!page) {
    res.status(404).json({ message: "Page not found" })
    return
  }
  res.json({ page })
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: PagesModuleService = req.scope.resolve(PAGES_MODULE)
  const update = req.body as Record<string, unknown>

  if (update.status === "published" && !update.published_at) {
    const existing = await service
      .retrieveStaticPage(req.params.id)
      .catch(() => null)
    if (existing && !existing.published_at) {
      update.published_at = new Date()
    }
  }

  const page = await service.updateStaticPages({
    id: req.params.id,
    ...update,
  } as any)
  res.json({ page })
}

export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: PagesModuleService = req.scope.resolve(PAGES_MODULE)
  await service.deleteStaticPages(req.params.id)
  res.json({ id: req.params.id, deleted: true })
}
