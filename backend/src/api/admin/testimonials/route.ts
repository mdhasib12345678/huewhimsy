import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { TESTIMONIALS_MODULE } from "../../../modules/testimonials"
import TestimonialsModuleService from "../../../modules/testimonials/service"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: TestimonialsModuleService = req.scope.resolve(TESTIMONIALS_MODULE)
  const limit = Math.min(Number(req.query.limit ?? 100), 500)
  const offset = Number(req.query.offset ?? 0)

  const filters: Record<string, unknown> = {}
  if (req.query.status) filters.status = req.query.status

  const [rows, count] = await service.listAndCountTestimonials(filters, {
    take: limit,
    skip: offset,
    order: { display_order: "ASC", created_at: "DESC" },
  })

  res.json({ testimonials: rows, count, limit, offset })
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: TestimonialsModuleService = req.scope.resolve(TESTIMONIALS_MODULE)
  const body = req.body as Record<string, unknown>

  if (!body.name || !body.quote) {
    res.status(400).json({ message: "name, quote are required" })
    return
  }

  if (body.rating !== undefined && body.rating !== null) {
    const r = Number(body.rating)
    if (!Number.isFinite(r) || r < 1 || r > 5) {
      res.status(400).json({ message: "rating must be between 1 and 5" })
      return
    }
    body.rating = r
  }

  const testimonial = await service.createTestimonials(body as any)
  res.status(201).json({ testimonial })
}
