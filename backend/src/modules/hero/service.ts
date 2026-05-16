import { MedusaService } from "@medusajs/framework/utils"
import HeroBanner from "./models/hero-banner"

class HeroModuleService extends MedusaService({
  HeroBanner,
}) {}

export default HeroModuleService
