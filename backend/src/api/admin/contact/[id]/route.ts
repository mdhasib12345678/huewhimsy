import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CONTACT_MODULE } from "../../../../modules/contact"
import ContactModuleService from "../../../../modules/contact/service"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: ContactModuleService = req.scope.resolve(CONTACT_MODULE)
  const submission = await service
    .retrieveContactSubmission(req.params.id)
    .catch(() => null)
  if (!submission) {
    res.status(404).json({ message: "Submission not found" })
    return
  }
  res.json({ submission })
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: ContactModuleService = req.scope.resolve(CONTACT_MODULE)
  const update = req.body as Record<string, unknown>
  const submission = await service.updateContactSubmissions({
    id: req.params.id,
    ...update,
  } as any)
  res.json({ submission })
}

export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: ContactModuleService = req.scope.resolve(CONTACT_MODULE)
  await service.deleteContactSubmissions(req.params.id)
  res.json({ id: req.params.id, deleted: true })
}
