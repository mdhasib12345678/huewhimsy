import { Module } from "@medusajs/framework/utils"
import TestimonialsModuleService from "./service"

export const TESTIMONIALS_MODULE = "testimonials"

export default Module(TESTIMONIALS_MODULE, {
  service: TestimonialsModuleService,
})
