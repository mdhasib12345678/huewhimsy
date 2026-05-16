import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ENDORSEMENTS_MODULE } from "../../../../modules/endorsements"
import EndorsementsModuleService from "../../../../modules/endorsements/service"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: EndorsementsModuleService = req.scope.resolve(ENDORSEMENTS_MODULE)
  const endorsement = await service
    .retrieveEndorsement(req.params.id)
    .catch(() => null)
  if (!endorsement) {
    res.status(404).json({ message: "Endorsement not found" })
    return
  }
  res.json({ endorsement })
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: EndorsementsModuleService = req.scope.resolve(ENDORSEMENTS_MODULE)
  const update = req.body as Record<string, unknown>

  if (update.rating !== undefined && update.rating !== null) {
    const r = Number(update.rating)
    if (!Number.isFinite(r) || r < 1 || r > 5) {
      res.status(400).json({ message: "rating must be between 1 and 5" })
      return
    }
    update.rating = r
  }

  const endorsement = await service.updateEndorsements({
    id: req.params.id,
    ...update,
  } as any)
  res.json({ endorsement })
}

export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: EndorsementsModuleService = req.scope.resolve(ENDORSEMENTS_MODULE)
  await service.deleteEndorsements(req.params.id)
  res.json({ id: req.params.id, deleted: true })
}
