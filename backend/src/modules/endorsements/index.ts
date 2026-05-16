import { Module } from "@medusajs/framework/utils"
import EndorsementsModuleService from "./service"

export const ENDORSEMENTS_MODULE = "endorsements"

export default Module(ENDORSEMENTS_MODULE, {
  service: EndorsementsModuleService,
})
