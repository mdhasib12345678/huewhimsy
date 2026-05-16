import { MedusaService } from "@medusajs/framework/utils"
import FaqEntry from "./models/faq-entry"

class FaqModuleService extends MedusaService({
  FaqEntry,
}) {}

export default FaqModuleService
