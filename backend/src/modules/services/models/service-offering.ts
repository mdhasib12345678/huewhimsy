import { model } from "@medusajs/framework/utils"

const ServiceOffering = model.define("service_offering", {
  id: model.id().primaryKey(),
  slug: model.text().unique().searchable(),
  name: model.text().searchable(),
  short_description: model.text().nullable(),
  description: model.text().searchable(),
  icon: model.text().nullable(),
  cover_image: model.text().nullable(),
  pricing_tiers: model.json().nullable(),
  features: model.json().nullable(),
  display_order: model.number().default(0),
  status: model.enum(["draft", "published", "archived"]).default("draft"),
  meta_title: model.text().nullable(),
  meta_description: model.text().nullable(),
  og_image: model.text().nullable(),
  translations: model.json().nullable(),
})

export default ServiceOffering
