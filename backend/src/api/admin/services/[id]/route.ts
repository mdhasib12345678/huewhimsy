import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SERVICES_MODULE } from "../../../../modules/services"
import ServicesModuleService from "../../../../modules/services/service"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: ServicesModuleService = req.scope.resolve(SERVICES_MODULE)
  const offering = await service
    .retrieveServiceOffering(req.params.id)
    .catch(() => null)
  if (!offering) {
    res.status(404).json({ message: "Service not found" })
    return
  }
  res.json({ service: offering })
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: ServicesModuleService = req.scope.resolve(SERVICES_MODULE)
  const update = req.body as Record<string, unknown>
  const offering = await service.updateServiceOfferings({
    id: req.params.id,
    ...update,
  } as any)
  res.json({ service: offering })
}

export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: ServicesModuleService = req.scope.resolve(SERVICES_MODULE)
  await service.deleteServiceOfferings(req.params.id)
  res.json({ id: req.params.id, deleted: true })
}
