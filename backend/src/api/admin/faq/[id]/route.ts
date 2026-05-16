import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { FAQ_MODULE } from "../../../../modules/faq"
import FaqModuleService from "../../../../modules/faq/service"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: FaqModuleService = req.scope.resolve(FAQ_MODULE)
  const faq = await service.retrieveFaqEntry(req.params.id).catch(() => null)
  if (!faq) {
    res.status(404).json({ message: "FAQ entry not found" })
    return
  }
  res.json({ faq })
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: FaqModuleService = req.scope.resolve(FAQ_MODULE)
  const update = req.body as Record<string, unknown>
  const faq = await service.updateFaqEntries({
    id: req.params.id,
    ...update,
  } as any)
  res.json({ faq })
}

export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: FaqModuleService = req.scope.resolve(FAQ_MODULE)
  await service.deleteFaqEntries(req.params.id)
  res.json({ id: req.params.id, deleted: true })
}
