import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { TESTIMONIALS_MODULE } from "../../../../modules/testimonials"
import TestimonialsModuleService from "../../../../modules/testimonials/service"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: TestimonialsModuleService = req.scope.resolve(TESTIMONIALS_MODULE)
  const testimonial = await service
    .retrieveTestimonial(req.params.id)
    .catch(() => null)
  if (!testimonial) {
    res.status(404).json({ message: "Testimonial not found" })
    return
  }
  res.json({ testimonial })
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: TestimonialsModuleService = req.scope.resolve(TESTIMONIALS_MODULE)
  const update = req.body as Record<string, unknown>

  if (update.rating !== undefined && update.rating !== null) {
    const r = Number(update.rating)
    if (!Number.isFinite(r) || r < 1 || r > 5) {
      res.status(400).json({ message: "rating must be between 1 and 5" })
      return
    }
    update.rating = r
  }

  const testimonial = await service.updateTestimonials({
    id: req.params.id,
    ...update,
  } as any)
  res.json({ testimonial })
}

export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: TestimonialsModuleService = req.scope.resolve(TESTIMONIALS_MODULE)
  await service.deleteTestimonials(req.params.id)
  res.json({ id: req.params.id, deleted: true })
}
