import { Module } from "@medusajs/framework/utils"
import ServicesModuleService from "./service"

export const SERVICES_MODULE = "services"

export default Module(SERVICES_MODULE, {
  service: ServicesModuleService,
})
