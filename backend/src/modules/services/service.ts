import { MedusaService } from "@medusajs/framework/utils"
import ServiceOffering from "./models/service-offering"

class ServicesModuleService extends MedusaService({
  ServiceOffering,
}) {}

export default ServicesModuleService
