import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ACTIVITIES_MODULE } from "../../../../modules/activities"
import ActivitiesModuleService from "../../../../modules/activities/service"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: ActivitiesModuleService = req.scope.resolve(ACTIVITIES_MODULE)
  const activity = await service.retrieveActivity(req.params.id).catch(() => null)
  if (!activity) {
    res.status(404).json({ message: "Activity not found" })
    return
  }
  res.json({ activity })
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: ActivitiesModuleService = req.scope.resolve(ACTIVITIES_MODULE)
  const update = req.body as Record<string, unknown>
  if (update.pages !== undefined && update.pages !== null) {
    update.pages = Number(update.pages)
  }
  const activity = await service.updateActivities({
    id: req.params.id,
    ...update,
  } as any)
  res.json({ activity })
}

export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: ActivitiesModuleService = req.scope.resolve(ACTIVITIES_MODULE)
  await service.deleteActivities(req.params.id)
  res.json({ id: req.params.id, deleted: true })
}
