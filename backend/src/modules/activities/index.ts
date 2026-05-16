import { Module } from "@medusajs/framework/utils"
import ActivitiesModuleService from "./service"

export const ACTIVITIES_MODULE = "activities"

export default Module(ACTIVITIES_MODULE, {
  service: ActivitiesModuleService,
})
