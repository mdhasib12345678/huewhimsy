import { MedusaService } from "@medusajs/framework/utils"
import Activity from "./models/activity"

class ActivitiesModuleService extends MedusaService({
  Activity,
}) {}

export default ActivitiesModuleService
