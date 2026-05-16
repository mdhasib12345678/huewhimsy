import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CONTACT_MODULE } from "../../../modules/contact"
import ContactModuleService from "../../../modules/contact/service"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: ContactModuleService = req.scope.resolve(CONTACT_MODULE)
  const limit = Math.min(Number(req.query.limit ?? 100), 500)
  const offset = Number(req.query.offset ?? 0)

  const filters: Record<string, unknown> = {}
  if (req.query.status) filters.status = req.query.status

  const [rows, count] = await service.listAndCountContactSubmissions(filters, {
    take: limit,
    skip: offset,
    order: { created_at: "DESC" },
  })

  res.json({ submissions: rows, count, limit, offset })
}
