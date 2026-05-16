import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { FAQ_MODULE } from "../../../modules/faq"
import FaqModuleService from "../../../modules/faq/service"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: FaqModuleService = req.scope.resolve(FAQ_MODULE)
  const limit = Math.min(Number(req.query.limit ?? 200), 500)
  const offset = Number(req.query.offset ?? 0)

  const filters: Record<string, unknown> = {}
  if (req.query.status) filters.status = req.query.status
  if (req.query.category) filters.category = req.query.category

  const [rows, count] = await service.listAndCountFaqEntries(filters, {
    take: limit,
    skip: offset,
    order: { display_order: "ASC", created_at: "DESC" },
  })

  res.json({ faqs: rows, count, limit, offset })
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: FaqModuleService = req.scope.resolve(FAQ_MODULE)
  const body = req.body as Record<string, unknown>

  if (!body.question || !body.answer) {
    res.status(400).json({ message: "question, answer are required" })
    return
  }

  const faq = await service.createFaqEntries(body as any)
  res.status(201).json({ faq })
}
