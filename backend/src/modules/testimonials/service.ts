import { MedusaService } from "@medusajs/framework/utils"
import Testimonial from "./models/testimonial"

class TestimonialsModuleService extends MedusaService({
  Testimonial,
}) {}

export default TestimonialsModuleService
