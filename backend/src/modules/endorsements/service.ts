import { MedusaService } from "@medusajs/framework/utils"
import Endorsement from "./models/endorsement"

class EndorsementsModuleService extends MedusaService({
  Endorsement,
}) {}

export default EndorsementsModuleService
