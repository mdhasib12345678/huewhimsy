import { MedusaService } from "@medusajs/framework/utils"
import StaticPage from "./models/static-page"

class PagesModuleService extends MedusaService({
  StaticPage,
}) {}

export default PagesModuleService
