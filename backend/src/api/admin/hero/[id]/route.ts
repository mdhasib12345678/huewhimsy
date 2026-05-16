import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { HERO_MODULE } from "../../../../modules/hero"
import HeroModuleService from "../../../../modules/hero/service"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: HeroModuleService = req.scope.resolve(HERO_MODULE)
  const banner = await service.retrieveHeroBanner(req.params.id).catch(() => null)
  if (!banner) {
    res.status(404).json({ message: "Hero banner not found" })
    return
  }
  res.json({ banner })
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: HeroModuleService = req.scope.resolve(HERO_MODULE)
  const update = req.body as Record<string, unknown>
  const banner = await service.updateHeroBanners({
    id: req.params.id,
    ...update,
  } as any)
  res.json({ banner })
}

export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: HeroModuleService = req.scope.resolve(HERO_MODULE)
  await service.deleteHeroBanners(req.params.id)
  res.json({ id: req.params.id, deleted: true })
}
